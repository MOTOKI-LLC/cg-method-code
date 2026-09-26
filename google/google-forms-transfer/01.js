function sendFormToEmail(e){
  var emailAddress = 'hogehoge@gmail.com'; // ここにメールアドレスを定義
  var form = FormApp.getActiveForm();
  var formTitle = form.getTitle(); // フォームのタイトルを取得
  var items = e.response.getItemResponses();
  var msg = '';

  for (var i = 0; i < items.length; i++) {
    var item = items[i];
    var q = item.getItem().getTitle();
    var a = item.getResponse();
    msg += q + ': ' + a + '\n\n';
  }
  
  GmailApp.sendEmail(emailAddress, formTitle + '（転送）', msg);
}
