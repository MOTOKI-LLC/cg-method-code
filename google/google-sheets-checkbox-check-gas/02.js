function isChecked() {
  var sheet = SpreadsheetApp.getActiveSheet();
  var values = sheet.getRange(1, 1, 1, 8).getValues()[0];
  
  var isAnyChecked = values.some(function(value) {
    return value === true;
  });

  if (isAnyChecked) {
    Logger.log("少なくとも1つはチェックされています");
  } else {
    Logger.log("すべて未チェックです");
  }
}
