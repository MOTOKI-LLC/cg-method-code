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
function dutyPlan_(rows, now, holiday, text) {
  if (!validDate_(now)) throw new Error('日時が不正です');
  const day = jst_(now,'yyyy-MM-dd'), hm = jst_(now,'HH:mm');
  const week = new Date(day + 'T00:00:00Z').getUTCDay();
  if (week === 0 || week === 6 || holiday || hm < '10:00' || hm >= '10:15') return null;
  if (!rows.length) throw new Error('当番表が空です');
  const ids = new Set(), ranks = new Set();
  const people = rows.map(r => {
    const id = numericId_(r[1]), rank = r[2];
    if (!r[0] || !Number.isInteger(rank) || rank < 1 || rank > rows.length || ids.has(id) || ranks.has(rank)) throw new Error('名前・ID・順番を確認してください');
    ids.add(id); ranks.add(rank); return {name:String(r[0]),id:id,rank:rank};
  });
  const person = people.find(p => p.rank === 1);
  const body = plainChat_(text).replace(/\{NAME\}/g, plainChat_(person.name));
  if (!body || body.length > 5000) throw new Error('通知文を確認してください');
  return {id:day, text:'[To:' + person.id + ']\n' + body,
    payload:{date:day,person:person.id,body:body},
    next:people.map(p => [p.rank === 1 ? people.length : p.rank-1])};
}
function dutyInput_() {
  if (Session.getScriptTimeZone() !== 'Asia/Tokyo') throw new Error('プロジェクトのタイムゾーンをAsia/Tokyoにしてください');
  const now = new Date(), book = SpreadsheetApp.openById(required_('SPREADSHEET_ID'));
  const sheet = book.getSheetByName('当番'), settings = book.getSheetByName('本文');
  if (!sheet || !settings) throw new Error('当番・本文シートが必要です');
  const rows = sheet.getLastRow() < 2 ? [] : sheet.getRange(2,1,sheet.getLastRow()-1,3).getValues();
  const cal = CalendarApp.getCalendarById(required_('HOLIDAY_CALENDAR_ID'));
  if (!cal) throw new Error('休業日カレンダーを参照できません');
  const holiday = cal.getEventsForDay(now).length > 0;
  return {sheet:sheet, rows:rows, now:now, plan:dutyPlan_(rows,now,holiday,settings.getRange(2,1).getValue())};
}
function demoDuty() {
  const p = dutyPlan_([['練習 太郎','101',1],['練習 花子','102',2]],new Date('2026-10-02T10:05:00+09:00'),false,'{NAME}さん、掃除当番です');
  Logger.log(JSON.stringify(p)); return p;
}
function previewDuty() { const x=dutyInput_(); return preview_(x.plan ? [x.plan] : []); }
function notifyDuty() {
  return runLocked_(() => {
    const x=dutyInput_(); if (!x.plan) return;
    const room=numericId_(required_('CHATWORK_ROOM_ID'));
    const done=props_().getProperty(key_('duty',room,x.plan.id));
    // ローテーション後の入力は変わるので、その日の完了はここで判定します。
    if (done && JSON.parse(done).status === 'done') return;
    x.plan.payload.rotation=x.rows;
    once_('duty',room,x.plan,() => {
      chatPost_(room,'messages',{body:x.plan.text,self_unread:1},'message_id');
      if (props_().getProperty('ADD_TASK') === 'true') {
        chatPost_(room,'tasks',{body:x.plan.payload.body,to_ids:x.plan.payload.person,
          limit:Math.floor((x.now.getTime()+4*86400000)/1000),limit_type:'time'},'task_ids');
      }
      const latest=x.sheet.getRange(2,1,x.rows.length,3).getValues();
      if (x.sheet.getLastRow()!==x.rows.length+1 || JSON.stringify(latest)!==JSON.stringify(x.rows)) throw new Error('当番表が変更されています');
      x.sheet.getRange(2,3,x.rows.length,1).setValues(x.plan.next);
    });
  });
}
