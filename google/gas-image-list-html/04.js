function onOpen() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet();
  sheet.addMenu("HTMLファイル出力", [
    {name : "HTMLファイル出力", functionName : "exportHTML"}
  ]);
}
