// フォームに紐づいたスクリプトに貼り付けて使う
const DRY_RUN = true; // trueではメールを送らない
const SUBJECT = 'お問い合わせを受け付けました';
const SENDER_NAME = 'お問い合わせ窓口';
const REPLY_TO = ''; // 返信先を別のアドレスにしたい場合だけ入れる

function sendAutoReply(e) {
  if (!e || !e.response) {
    throw new Error('フォームからのフォーム送信時イベントが必要です。');
  }
  const response = e.response;
  const to = response.getRespondentEmail();
  if (!to) {
    console.log('回答者のメールアドレスを取得できないため、送信しませんでした。');
    return;
  }

  const lines = response.getItemResponses().map(function (itemResponse) {
    const answer = itemResponse.getResponse();
    const text = Array.isArray(answer) ? answer.join('、') : String(answer);
    return '■ ' + itemResponse.getItem().getTitle() + '\n' + text;
  });

  const body = [
    'お問い合わせいただき、ありがとうございます。',
    '次の内容で受け付けました。',
    '',
    lines.join('\n\n')
  ].join('\n');

  const options = { name: SENDER_NAME };
  if (REPLY_TO) {
    options.replyTo = REPLY_TO;
  }
  if (DRY_RUN) {
    console.log('送信なしで本文を組み立てました。設問数: ' + lines.length);
    return;
  }
  if (MailApp.getRemainingDailyQuota() < 1) {
    throw new Error('送信可能な宛先数が残っていません。');
  }
  MailApp.sendEmail(to, SUBJECT, body, options);
}
