function doGet() {
  const sheet = SpreadsheetApp.openById('練習用スプレッドシートID').getSheetByName('シート1');
  if (!sheet) throw new Error('シート1がありません');
  const url = String(sheet.getRange('A1').getValue()).trim();
  if (!/^https:\/\/script\.google\.com\/(?:a\/macros\/[a-z0-9.-]+\/s|macros\/s)\/[A-Za-z0-9_-]+\/exec$/i.test(url)) {
    throw new Error('A1に確認済みのWebアプリのexec URLを入力してください');
  }
  const template = HtmlService.createTemplateFromFile('index');
  template.targetUrl = url;
  return template.evaluate();
}
