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
function calendarPlans_(events, now, minutes) {
  const limit = now.getTime() + minutes * 60000;
  return events.filter(e => !e.allDay && e.start > now.getTime() && e.start <= limit)
    .sort((a, b) => a.start - b.start)
    .map(e => ({id: e.id + ':' + e.start,
      text: '【予定の通知】' + Utilities.formatDate(new Date(e.start), 'Asia/Tokyo', 'yyyy-MM-dd HH:mm')
        + ' ' + plain_(e.title) + (e.location ? '\n場所: ' + plain_(e.location) : '')}));
}
function readCalendarPlans_() {
  const now = new Date();
  const minutes = 15;
  const calendar = CalendarApp.getCalendarById(required_('CALENDAR_ID'));
  if (!calendar) throw new Error('カレンダーを参照できません');
  const events = calendar.getEvents(now, new Date(now.getTime() + minutes * 60000)).map(e => ({
    id: e.getId(), start: e.getStartTime().getTime(), title: e.getTitle(),
    location: e.getLocation(), allDay: e.isAllDayEvent()
  }));
  return calendarPlans_(events, now, minutes);
}
function demoCalendar() {
  const now = new Date('2026-10-02T23:50:00+09:00');
  const events = [{id:'demo-A',start:new Date('2026-10-03T00:00:00+09:00').getTime(),title:'練習会',location:'練習室',allDay:false},
    {id:'demo-B',start:now.getTime(),title:'開始済み',location:'',allDay:false}];
  const plans = calendarPlans_(events, now, 15);
  Logger.log(JSON.stringify(plans));
  return plans;
}
function previewCalendar() { return preview_(readCalendarPlans_()); }
function linePayload_(plans, userId) {
  if (!/^U[0-9a-f]{32}$/i.test(userId)) throw new Error('対象は既存チャネルの個人ユーザーIDです');
  return plans.map(p => ({id: p.id, payload: {to: userId, messages: [{type:'text',text:p.text}]}}));
}
function demoLinePayload() {
  const payloads = linePayload_(demoCalendar(), 'U00000000000000000000000000000000');
  Logger.log(JSON.stringify(payloads));
  return payloads;
}
function sendCalendarToLine() {
  const userId = required_('LINE_USER_ID');
  linePayload_([], userId);
  const token = required_('LINE_CHANNEL_ACCESS_TOKEN');
  sendControlled_('line-calendar', userId, readCalendarPlans_, text => {
    const response = UrlFetchApp.fetch('https://api.line.me/v2/bot/message/push', {
      method:'post',contentType:'application/json',headers:{Authorization:'Bearer ' + token},
      payload:JSON.stringify({to:userId,messages:[{type:'text',text:text}]}),muteHttpExceptions:true
    });
    if (response.getResponseCode() !== 200) throw new Error('LINE HTTP ' + response.getResponseCode());
  });
}
