// 各記事の例は別々のApps Scriptプロジェクトへ保存します。
function props_() { return PropertiesService.getScriptProperties(); }
function required_(key) {
  const value = props_().getProperty(key);
  if (!value) throw new Error(key + 'をスクリプトプロパティへ設定してください');
  return value;
}
function chatConfig_() {
  const room = required_('CHATWORK_ROOM_ID');
  if (!/^\d+$/.test(room)) throw new Error('ルームIDは数字で指定します');
  return {room: room, token: required_('CHATWORK_API_TOKEN')};
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
function sendChatwork_(text, config) {
  const response = UrlFetchApp.fetch('https://api.chatwork.com/v2/rooms/' + config.room + '/messages', {
    method: 'post', headers: {'X-ChatworkToken': config.token},
    payload: {body: text, self_unread: 1}, muteHttpExceptions: true
  });
  if (response.getResponseCode() !== 200) throw new Error('Chatwork HTTP ' + response.getResponseCode());
  const result = JSON.parse(response.getContentText());
  if (!result.message_id) throw new Error('message_idがありません');
}
function gmailPlans_(messages) {
  return messages.filter(m => m.unread).sort((a,b) => b.date - a.date).slice(0,3)
    .map(m => ({id:m.id,text:'【メール転送】' + plain_(m.subject) + '\n' + plain_(m.body.slice(0,3000))}));
}
function readGmailPlans_() {
  if (!GmailApp.getUserLabelByName('cgm-forward')) throw new Error('専用ラベルcgm-forwardがありません');
  const messages = [];
  GmailApp.search('label:cgm-forward is:unread',0,10).forEach(t => {
    t.getMessages().forEach(m => {
      if (m.isUnread()) messages.push({id:m.getId(),date:m.getDate().getTime(),unread:true,
        subject:m.getSubject(),body:m.getPlainBody()});
    });
  });
  const room = required_('CHATWORK_ROOM_ID');
  const unsent = messages.filter(m => props_().getProperty(stateKey_('gmail', room, m.id)) !== 'done');
  return gmailPlans_(unsent);
}
function demoGmail() {
  const plans = gmailPlans_([{id:'mail-new',date:2,unread:true,subject:'練習メール',body:'架空の連絡です。'},
    {id:'mail-old',date:1,unread:false,subject:'既読の練習',body:'転送しません。'}]);
  Logger.log(JSON.stringify(plans));
  return plans;
}
function previewGmail() { return preview_(readGmailPlans_()); }
function sendGmailToChatwork() {
  const config = chatConfig_();
  sendControlled_('gmail', config.room, readGmailPlans_, text => sendChatwork_(text, config));
}
