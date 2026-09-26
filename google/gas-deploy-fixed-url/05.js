var id = 'スプレッドシートのID';
var value = SpreadsheetApp.openById(id).getSheetByName("シート1").getRange("A1").getValue();

function doGet() {
  var html = HtmlService.createTemplateFromFile('index');
  html.btn= value;
  return html.evaluate();
}
