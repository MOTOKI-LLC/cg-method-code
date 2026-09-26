function myFunction() {
  var sheetId = "スプレッドシートのID"; // ← さきほどコピーしたIDに置き換え
  var sheetName = "シート1"; // 対象のシート名
  var sheet = SpreadsheetApp.openById(sheetId).getSheetByName(sheetName);
  var folderId = sheet.getRange('A1').getValue(); // A1セルの値を取得
  Logger.log(folderId); // ログに表示
}
