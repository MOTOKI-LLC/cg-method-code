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
function reportPlans_(rows, now) {
  const current=jst_(now,'yyyy-MM-dd HH'), hour=Number(jst_(now,'HH'));
  if (![0,9,12,15,18,22].includes(hour)) return [];
  const ids=new Set(), times=new Set(), plans=[];
  for (const r of rows) {
    const at=r[0], pv=r[1], updated=r[2], id=String(r[3]);
    if (!validDate_(at) || !validDate_(updated) || !Number.isSafeInteger(pv) || pv<0 || !/^[A-Za-z0-9_-]+$/.test(id) || ids.has(id)) throw new Error('行の日時・PV・IDを確認してください');
    const bucket=jst_(at,'yyyy-MM-dd HH');
    if (times.has(bucket)) throw new Error('同じ対象時刻が重複しています');
    ids.add(id); times.add(bucket);
    if (bucket!==current) continue;
    if (updated>now || now-updated>3600000 || at>now) throw new Error('集計の更新時刻を確認してください');
    const text='【手動入力した集計値】対象 '+bucket+':00\nPV: '+pv+'\n更新: '+jst_(updated,'yyyy-MM-dd HH:mm');
    plans.push({id:id,text:text,payload:{text:text}});
  }
  return plans;
}
function demoReport() {
  const p=reportPlans_([[new Date('2026-10-02T09:00:00+09:00'),0,new Date('2026-10-02T09:03:00+09:00'),'practice-0900']],new Date('2026-10-02T09:05:00+09:00'));
  Logger.log(JSON.stringify(p)); return p;
}
function readReportPlans_() {
  const s=SpreadsheetApp.openById(required_('SPREADSHEET_ID')).getSheetByName('集計');
  if (!s) throw new Error('集計シートがありません');
  const rows=s.getLastRow()<2 ? [] : s.getRange(2,1,s.getLastRow()-1,4).getValues();
  return reportPlans_(rows,new Date());
}
function previewReport() { return preview_(readReportPlans_()); }
function getAnalytics() {
  return runLocked_(() => {
    const url=slackUrl_(), plans=readReportPlans_();
    for (const p of plans) once_('report',url,p,()=>slackPost_(p.text,url));
  });
}
