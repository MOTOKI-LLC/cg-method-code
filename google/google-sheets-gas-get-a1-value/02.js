function myFunction2() {
  var sheetId = "スプレッドシートのID";
  var sheet = SpreadsheetApp.openById(sheetId).getSheets()[1]; // 2番目のシート
  var folderId = sheet.getRange('A1').getValue(); // A1セル取得
  Logger.log(folderId);
}
