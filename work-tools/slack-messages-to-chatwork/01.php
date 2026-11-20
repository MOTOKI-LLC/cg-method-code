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
function slackUrl_() {
  const u = required_('SLACK_WEBHOOK_URL');
  if (!/^https:\/\/hooks\.slack\.com\/services\/[^/]+\/[^/]+\/[^/]+$/.test(u)) throw new Error('Webhookの形式を確認してください');
  return u;
}
function slackPost_(text, url) {
  if (text.length > 2800) throw new Error('通知文が長すぎます');
  const escaped = text.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  const r = UrlFetchApp.fetch(url, {method:'post', contentType:'application/json',
    payload:JSON.stringify({text:escaped, blocks:[{type:'section',text:{type:'plain_text',text:text,emoji:false}}]}), muteHttpExceptions:true});
  if (r.getResponseCode() !== 200 || r.getContentText().trim() !== 'ok') throw new Error('Slackの応答を確認してください');
}
function directText_(body) {
  let depth=0, start=0, out='';
  for (const m of body.matchAll(/\[(\/?qt)\]/g)) {
    if (depth===0) out+=body.slice(start,m.index);
    depth+=m[1]==='qt' ? 1 : -1;
    if (depth<0) throw new Error('引用の形式が不正です');
    start=m.index+m[0].length;
  }
  if (depth) throw new Error('引用が閉じられていません');
  return out+body.slice(start);
}
function forwardPlans_(messages, room, myId) {
  const who=numericId_(myId), source=numericId_(room);
  if (!Array.isArray(messages)) throw new Error('メッセージ配列ではありません');
  const seen=new Set(), plans=[];
  for (const m of messages) {
    const id=numericId_(m.message_id);
    if (seen.has(id)) continue;
    seen.add(id);
    if (typeof m.body!=='string' || !m.account || typeof m.account.name!=='string') throw new Error('メッセージ形式が不正です');
    // 本文内の数字だけではなく、ChatworkのTo記法を完全一致で確認します。
    const recipients=[...directText_(m.body).matchAll(/\[To:(\d+)(?:\s[^\]]*)?\]/g)].map(x=>x[1]);
    if (!recipients.includes(who)) continue;
    const text='【Chatworkから転送】ルーム ' + source + '\n' + m.account.name + '\n' + m.body.slice(0,1800);
    plans.push({id:source+':'+id,text:text,payload:{text:text}});
  }
  return plans;
}
function readForwardPlans_() {
  const roomIds=required_('CHATWORK_ROOM_IDS').split(',').map(s=>numericId_(s.trim()));
  if (new Set(roomIds).size!==roomIds.length) throw new Error('ルームIDが重複しています');
  const mine=required_('CHATWORK_MY_ID'); const plans=[];
  for (const room of roomIds) {
    // force=0の取得差分を進めず、最新100件を再取得して保存済みIDで判定します。
    const r=UrlFetchApp.fetch('https://api.chatwork.com/v2/rooms/'+room+'/messages?force=1',{
      method:'get',headers:{'X-ChatworkToken':required_('CHATWORK_API_TOKEN')},muteHttpExceptions:true});
    if (r.getResponseCode()===204) continue;
    if (r.getResponseCode()!==200) throw new Error('Chatworkの取得応答を確認してください');
    plans.push(...forwardPlans_(JSON.parse(r.getContentText()),room,mine));
  }
  return plans;
}
function demoForward() {
  const p=forwardPlans_([
    {message_id:'1',account:{name:'練習 太郎'},body:'[To:101]練習の連絡'},
    {message_id:'2',account:{name:'練習 花子'},body:'数字101だけの連絡'},
    {message_id:'3',account:{name:'練習 花子'},body:'[To:1010]別の宛先'}],'500','101');
  Logger.log(JSON.stringify(p)); return p;
}
function previewForward() { return preview_(readForwardPlans_()); }
function ChatworkToSlack() {
  return runLocked_(() => {
    const url=slackUrl_(), plans=readForwardPlans_();
    for (const p of plans) once_('forward',url,p,() => slackPost_(p.text,url));
  });
}
