const FORM_MAIL = Object.freeze({
  recipient: 'CHANGE_ME',
  dryRun: true,
  allowedQuestions: ['ご用件', '希望日']
});

function sendFormToEmail(e) {
  const message = buildFormNotification(e);
  if (FORM_MAIL.dryRun) {
    console.log('DRY_RUN: メール未送信。対象設問数=' + message.questionCount);
    return;
  }
  const to = FORM_MAIL.recipient;
  if (!/^[^\s,;<>@]+@[^\s,;<>@]+\.[^\s,;<>@]+$/.test(to) ||
      /@example\.(?:com|org|net|invalid)$/i.test(to)) {
    throw new Error('受信を許可された1宛先へrecipientを設定してください。');
  }
  if (MailApp.getRemainingDailyQuota() < 1) throw new Error('送信の残り割当がありません。');
  MailApp.sendEmail({to: to, subject: message.subject, body: message.body});
  console.log('メール送信処理を実行しました。受信側で件数と内容を確認してください。');
}

function buildFormNotification(e) {
  if (!e || !e.response || typeof e.response.getItemResponses !== 'function' ||
      !e.source || typeof e.source.getTitle !== 'function') {
    throw new Error('フォーム由来の送信イベントが必要です。手動実行はtestFormMessageを使ってください。');
  }
  const responses = e.response.getItemResponses();
  if (responses.length > 30) throw new Error('この練習は30設問までです。');
  const selected = responses.filter(r => FORM_MAIL.allowedQuestions.includes(r.getItem().getTitle()));
  if (!selected.length) throw new Error('許可した設問と実際の設問名が一致しません。');
  const body = selected.map(r => {
    const value = r.getResponse();
    const answer = value === null || value === '' ? '（未回答）' :
      Array.isArray(value) ? JSON.stringify(value) : String(value);
    return r.getItem().getTitle() + ': ' + answer;
  }).join('\n\n');
  const subject = String(e.source.getTitle()).replace(/[\r\n]+/g, ' ') + '（回答通知）';
  return {subject: subject, body: body, questionCount: selected.length};
}

function testFormMessage() {
  const sample = [
    {getItem: () => ({getTitle: () => 'ご用件'}), getResponse: () => '資料請求（練習）'},
    {getItem: () => ({getTitle: () => '希望日'}), getResponse: () => '2026-10-10'},
    {getItem: () => ({getTitle: () => '送信対象外'}), getResponse: () => 'この項目は含めない'}
  ];
  const message = buildFormNotification({
    source: {getTitle: () => 'お問い合わせ練習'},
    response: {getItemResponses: () => sample}
  });
  console.log(message.subject + '\n' + message.body);
}
