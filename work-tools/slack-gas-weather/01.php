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
function temperature_(v) {
  if (v===null || v===undefined || v==='') return '未取得';
  if (!/^-?\d+(?:\.\d+)?$/.test(String(v))) throw new Error('気温の形式が不正です');
  return String(v)+'℃';
}
function weatherPlan_(data, now) {
  const forecast=Array.isArray(data) && data[0];
  if (!forecast || !Array.isArray(forecast.timeSeries)) throw new Error('予報形式が不正です');
  const issued=new Date(forecast.reportDatetime), today=jst_(now,'yyyy-MM-dd');
  if (!validDate_(issued) || jst_(issued,'yyyy-MM-dd')!==today || issued>now) throw new Error('予報の日付を確認してください');
  const weatherSeries=forecast.timeSeries.find(t=>t.areas.some(a=>Array.isArray(a.weathers)));
  const tempSeries=forecast.timeSeries.find(t=>t.areas.some(a=>Array.isArray(a.temps)));
  if (!weatherSeries || !tempSeries) throw new Error('予報の項目がありません');
  const area=weatherSeries.areas.find(a=>a.area.code==='130010');
  const station=tempSeries.areas.find(a=>a.area.code==='44132');
  const idx=weatherSeries.timeDefines.findIndex(t=>jst_(new Date(t),'yyyy-MM-dd')===today);
  const hour=jst_(issued,'HH');
  if (!['05','11','17'].includes(hour) || !area || !station || idx<0 || !area.weathers[idx]) throw new Error('地域・発表時刻・対象日を確認してください');
  if (hour!=='17' && (!tempSeries.timeDefines[0] || jst_(new Date(tempSeries.timeDefines[0]),'yyyy-MM-dd')!==today)) throw new Error('気温の対象日を確認してください');
  // 現行の気象庁画面に合わせ、当日の朝の最低は未取得とします。
  // 17時発表は当日分の気温欄がないため、翌日分を流用しません。
  const high=hour==='17' ? null : station.temps[0];
  const text='【東京地方の予報】'+today+'\n'+area.weathers[idx]
    +'\n朝の最低: 未取得 / 日中の最高: '+temperature_(high)
    +'\n発表: '+forecast.reportDatetime+'\n出典: 気象庁（東京の予報）';
  return {id:today+':130010',text:text,payload:{text:text}};
}
function weatherFixture_() {
  return [{reportDatetime:'2026-10-02T11:00:00+09:00',timeSeries:[
    {timeDefines:['2026-10-02T11:00:00+09:00'],areas:[{area:{code:'130010'},weathers:['晴れ（架空の練習データ）']}]},
    {timeDefines:['2026-10-02T09:00:00+09:00'],areas:[{area:{code:'44132'},temps:['24']}]}]}];
}
function demoWeather() { const p=weatherPlan_(weatherFixture_(),new Date('2026-10-02T12:00:00+09:00')); Logger.log(JSON.stringify(p)); return p; }
function readWeatherPlan_() {
  const r=UrlFetchApp.fetch('https://www.jma.go.jp/bosai/forecast/data/forecast/130000.json',{muteHttpExceptions:true});
  if (r.getResponseCode()!==200) throw new Error('気象庁の取得応答を確認してください');
  return weatherPlan_(JSON.parse(r.getContentText()),new Date());
}
function previewWeather() { return preview_([readWeatherPlan_()]); }
function sendWeather() {
  return runLocked_(() => {
    const url=slackUrl_(), dailyId=jst_(new Date(),'yyyy-MM-dd')+':130010';
    const previous=props_().getProperty(key_('weather',url,dailyId));
    if (previous && JSON.parse(previous).status==='done') return;
    const p=readWeatherPlan_();
    // 同じ日の初回正常投稿だけ。発表更新や再実行では再投稿しません。
    const record=props_().getProperty(key_('weather',url,p.id));
    if (record && JSON.parse(record).status==='done') return;
    once_('weather',url,p,() => slackPost_(p.text,url));
  });
}
