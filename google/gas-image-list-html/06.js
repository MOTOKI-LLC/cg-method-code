function doGet() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("シート1");
  var count = sheet.getLastRow() - 1;
  var html = HtmlService.createTemplateFromFile('index');
  html.productData = sheet.getRange(2, 1, count, 4).getValues();
  return html.evaluate();
}
