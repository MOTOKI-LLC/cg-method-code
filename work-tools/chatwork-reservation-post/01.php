// 各記事を別々のApps Scriptプロジェクトへ保存します。
function props_() { return PropertiesService.getScriptProperties(); }
function required_(key) {
  const v = props_().getProperty(key);
  if (!v) throw new Error(key + 'を設定してください');
  return v;
}
function numericId_(v) {
  if (typeof v === 'number' && !Number.isSafeInteger(v)) throw new Error('IDの精度が失われています');
  const s = String(v);
  if (!/^[1-9]\d*$/.test(s)) throw new Error('IDは正の数字で指定します');
  return s;
}
function digest_(s) {
  return Utilities.base64EncodeWebSafe(Utilities.computeDigest(
    Utilities.DigestAlgorithm.SHA_256, s, Utilities.Charset.UTF_8));
}
function key_(kind, destination, id) { return 'CGM5_' + digest_(kind + ':' + destination + ':' + id); }
function runLocked_(work) {
  if (props_().getProperty('SEND_ENABLED') !== 'true') throw new Error('送信は無効です');
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(1000)) throw new Error('別の実行が処理中です');
  try { return work(); } finally { lock.releaseLock(); }
}
function once_(kind, destination, plan, perform) {
  const key = key_(kind, destination, plan.id);
  const fingerprint = digest_(JSON.stringify(plan.payload));
  const previous = props_().getProperty(key);
  if (previous) {
    const record = JSON.parse(previous);
    if (record.fingerprint !== fingerprint) throw new Error('同じIDの入力が変更されています');
    if (record.status === 'done') return false;
    throw new Error('結果不明の処理を投稿先と照合してください');
  }
  // 通信前に記録。記録に失敗した場合は送信しません。
  props_().setProperty(key, JSON.stringify({status:'sending', fingerprint:fingerprint}));
  try {
    perform();
    props_().setProperty(key, JSON.stringify({status:'done', fingerprint:fingerprint}));
    return true;
  } catch (error) {
    props_().setProperty(key, JSON.stringify({status:'unknown', fingerprint:fingerprint}));
    throw new Error('処理結果を確定できません。自動再送せず照合してください');
  }
}
function preview_(plans) {
  Logger.log(JSON.stringify(plans.map(p => ({id:p.id, characters:p.text.length}))));
  return plans;
}
function jst_(date, pattern) { return Utilities.formatDate(date, 'Asia/Tokyo', pattern); }
function validDate_(d) { return d instanceof Date && Number.isFinite(d.getTime()); }
function plainChat_(s) { return String(s).replace(/\[/g,'［').replace(/\]/g,'］'); }
function chatPost_(room, endpoint, payload, responseKey) {
  const r = UrlFetchApp.fetch('https://api.chatwork.com/v2/rooms/' + numericId_(room) + '/' + endpoint, {
    method:'post', headers:{'X-ChatworkToken':required_('CHATWORK_API_TOKEN')},
    payload:payload, muteHttpExceptions:true
  });
  if (r.getResponseCode() !== 200) throw new Error('Chatworkの応答を確認してください');
  const d = JSON.parse(r.getContentText());
  if (!d[responseKey] || (Array.isArray(d[responseKey]) && !d[responseKey].length)) throw new Error('成功IDがありません');
  return d;
}
function reservationPlans_(rows, now) {
  const ids=new Set(), plans=[];
  rows.forEach((r,i) => {
    const id=String(r[0]), due=r[1], room=numericId_(r[2]), text=String(r[3]||''), file=String(r[4]||''), sent=r[5];
    if (!/^[A-Za-z0-9_-]+$/.test(id) || ids.has(id) || !validDate_(due) || (sent!=='' && !validDate_(sent)) || (!text && !file) || text.length>5000 || (file && !/^[A-Za-z0-9_-]+$/.test(file))) throw new Error('予約行のID・日時・本文・ファイルIDを確認してください');
    ids.add(id);
    if (sent!=='' || due>now) return;
    if (now-due>86400000) throw new Error('24時間より古い未送信の予約があります');
    plans.push({id:id,row:i+2,room:room,text:plainChat_(text),file:file,
      payload:{due:due.toISOString(),room:room,text:plainChat_(text),file:file},source:r});
  });
  return plans;
}
function fileBlob_(id) {
  const file=DriveApp.getFileById(id), blob=file.getBlob();
  if (!['image/png','image/jpeg','image/gif'].includes(blob.getContentType()) || blob.getBytes().length>5000000) throw new Error('画像形式か5MB上限を確認してください');
  return blob;
}
function sendReservationPlan_(p, blob) {
  if (p.file) {
    const payload={file:blob}; if (p.text) payload.message=p.text;
    // 画像付き本文を1回のファイル投稿にまとめ、別の本文POSTを行いません。
    chatPost_(p.room,'files',payload,'file_id');
  } else chatPost_(p.room,'messages',{body:p.text,self_unread:1},'message_id');
}
function reservationSheet_() {
  const s=SpreadsheetApp.openById(required_('SPREADSHEET_ID')).getSheetByName('予約');
  if (!s) throw new Error('予約シートがありません'); return s;
}
function readReservationPlans_(s, now) {
  const rows=s.getLastRow()<2 ? [] : s.getRange(2,1,s.getLastRow()-1,6).getValues();
  return reservationPlans_(rows,now);
}
function demoReservations() {
  const p=reservationPlans_([
    ['practice-1',new Date('2026-10-02T10:00:00+09:00'),'500','練習の予約投稿','', ''],
    ['practice-2',new Date('2026-10-02T11:00:00+09:00'),'500','未来の予約','', '']],new Date('2026-10-02T10:05:00+09:00'));
  Logger.log(JSON.stringify(p)); return p;
}
function previewReservations() { return preview_(readReservationPlans_(reservationSheet_(),new Date())); }
function sendReservations() {
  return runLocked_(() => {
    const s=reservationSheet_(), now=new Date(), plans=readReservationPlans_(s,now);
    // 全候補の画像を投稿前に確認。Driveの同名検索は使いません。
    const blobs=plans.map(p=>p.file ? fileBlob_(p.file) : null);
    plans.forEach((p,i) => once_('reservation',p.room,p,() => {
      if (JSON.stringify(s.getRange(p.row,1,1,6).getValues()[0])!==JSON.stringify(p.source)) throw new Error('予約行が変更されています');
      sendReservationPlan_(p,blobs[i]);
      // 成功後にも入力を照合し、送信日時の1セルだけを書き込みます。
      if (JSON.stringify(s.getRange(p.row,1,1,6).getValues()[0])!==JSON.stringify(p.source)) throw new Error('予約行が変更されています');
      s.getRange(p.row,6).setValue(now);
    }));
  });
}
function sendSingleReservation() {
  return runLocked_(() => {
    const input=required_('DUE_AT');
    if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:Z|[+-]\d{2}:\d{2})$/.test(input)) throw new Error('予約日時にはISO形式でタイムゾーンを付けてください');
    const due=new Date(input);
    const p=reservationPlans_([[required_('JOB_ID'),due,required_('CHATWORK_ROOM_ID'),required_('MESSAGE_TEXT'),'', '']],new Date())[0];
    if (p) once_('single',p.room,p,()=>sendReservationPlan_(p,null));
  });
}
function sendClock() {
  return runLocked_(() => {
    const now=new Date(), room=numericId_(required_('CHATWORK_ROOM_ID'));
    const bucket=jst_(now,'yyyy-MM-dd HH'), text=bucket+':00の時刻通知（実行時刻には幅があります）';
    const p={id:bucket,text:text,payload:{text:text}};
    once_('clock',room,p,()=>chatPost_(room,'messages',{body:text,self_unread:1},'message_id'));
  });
}
function sendPracticeImage() {
  return runLocked_(() => {
    const room=numericId_(required_('CHATWORK_ROOM_ID')), file=required_('PRACTICE_FILE_ID');
    const p={id:required_('JOB_ID'),room:room,file:file,text:'練習用の画像です',payload:{file:file,text:'練習用の画像です'}};
    const blob=fileBlob_(file); once_('image',room,p,()=>sendReservationPlan_(p,blob));
  });
}
