function myFunction() {
  var sheet = SpreadsheetApp.getActiveSheet(); 
  var cells = sheet.getRange(1, 1, 1, 8); // A1〜H1
  var values = cells.getValues(); 

  for (var i = 0; i < cells.getNumColumns(); i++) {
    if (values[0][i] === true) {
      Logger.log("列 " + (i+1) + "：チェックがついています");
    } else {
      Logger.log("列 " + (i+1) + "：チェックがついていません");
    }
  }
}
