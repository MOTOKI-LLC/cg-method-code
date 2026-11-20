// 各記事の例は別々のApps Scriptプロジェクトへ保存します。
function props_() { return PropertiesService.getScriptProperties(); }
function required_(key) {
  const value = props_().getProperty(key);
  if (!value) throw new Error(key + 'をスクリプトプロパティへ設定してください');
  return value;
}
function plain_(text) {
  return String(text).replace(/\[/g, '［').replace(/\]/g, '］');
}
function stateKey_(kind, destination, id) {
  const digest = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256,
    kind + ':' + destination + ':' + id, Utilities.Charset.UTF_8);
  return 'CGM_JOB_' + Utilities.base64EncodeWebSafe(digest);
}
function preview_(plans) {
  // 実メールや予定の本文はログへ出さない。demo関数で架空の本文を確認。
  Logger.log(JSON.stringify(plans.map(p => ({id: p.id, characters: p.text.length}))));
  return plans;
}
function sendControlled_(kind, destination, buildPlans, transport) {
  if (props_().getProperty('SEND_ENABLED') !== 'true') throw new Error('送信は無効です。まずプレビューしてください');
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(1000)) throw new Error('別の実行が処理中です');
  try {
    const plans = buildPlans();
    for (const plan of plans) {
      const key = stateKey_(kind, destination, plan.id);
      const state = props_().getProperty(key);
      if (state === 'done') continue;
      if (state) throw new Error('結果不明の処理があります。投稿先と記録を照合してください');
      // 通信前に記録。通信成功後の記録失敗でも自動で再送しない。
      props_().setProperty(key, 'sending');
      try {
        transport(plan.text);
        props_().setProperty(key, 'done');
      } catch (error) {
        props_().setProperty(key, 'unknown');
        throw new Error('送信結果を確定できません。自動再送せず投稿先を確認してください');
      }
    }
  } finally { lock.releaseLock(); }
}
const PRACTICE_HTML = '<h1 id="company">練習工業</h1><span class="price">1,234.50</span>';
function parseQuote_(html) {
  // この構造の静的HTML専用。実サイトの汎用HTMLパーサーではありません。
  const name = html.match(/<h1 id="company">([^<>]+)<\/h1>/);
  const price = html.match(/<span class="price">([0-9,]+(?:\.[0-9]+)?)<\/span>/);
  if (!name || !price) throw new Error('想定したHTML要素がありません');
  if (!/^(?:[0-9]+|[0-9]{1,3}(?:,[0-9]{3})+)(?:\.[0-9]+)?$/.test(price[1])) throw new Error('価格形式が違います');
  const number = Number(price[1].replace(/,/g,''));
  if (!Number.isFinite(number)) throw new Error('数値を取得できません');
  return {name:name[1].trim(),price:number};
}
function practiceSlackPlans_() {
  const quote = parseQuote_(PRACTICE_HTML);
  return [{id:'practice-quote-20261002',text:'【架空データ・練習】' + quote.name + ': ' + quote.price}];
}
function demoSlack() { const p = practiceSlackPlans_(); Logger.log(JSON.stringify(p)); return p; }
function sendPracticeToSlack() {
  const webhook = required_('SLACK_WEBHOOK_URL');
  if (!/^https:\/\/hooks\.slack\.com\/services\/[^/?#]+\/[^/?#]+\/[^/?#]+$/.test(webhook)) throw new Error('Webhookの形式が違います');
  sendControlled_('slack-practice', webhook, practiceSlackPlans_, text => {
    const response = UrlFetchApp.fetch(webhook,{method:'post',contentType:'application/json',
      payload:JSON.stringify({text:text}),muteHttpExceptions:true});
    if (response.getResponseCode() !== 200 || response.getContentText().trim() !== 'ok') throw new Error('Slackが成功応答を返しませんでした');
  });
}
