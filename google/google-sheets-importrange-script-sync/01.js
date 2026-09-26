function myFunction() {
  // 書き込み先（記載したいシート）
  var write_id = "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx";
  var write_sheet_name = "シート1";

  // 参照元（読み込みたいシート）
  var source_id = "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx";
  var source_sheet_name = "シート1";

  // スプレッドシートの取得
  var write_ss = SpreadsheetApp.openById(write_id);
  var write_sheet = write_ss.getSheetByName(write_sheet_name);

  // IMPORTRANGE関数を生成
  var formula = '=IMPORTRANGE("https://docs.google.com/spreadsheets/d/' + source_id + '","' + source_sheet_name + '!A:Z")';

  // 記載先のシートのA1に書き込み
  write_sheet.getRange("A1").setValue(formula);
}
