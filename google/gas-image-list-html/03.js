function exportHTML() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("シート1");
  var count = sheet.getLastRow() - 1;
  var html = HtmlService.createTemplateFromFile('index');
  html.productData = sheet.getRange(2, 1, count, 4).getValues();
  
  var outputFolder = DriveApp.getFolderById("出力先のドライブID");
  var date = new Date();
  outputFolder.createFile("画像一覧_" + Utilities.formatDate(date, "Asia/Tokyo", "yyMMdd"), html.evaluate().getContent(), MimeType.HTML);
}
