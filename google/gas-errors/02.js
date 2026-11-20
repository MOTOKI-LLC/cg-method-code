function main() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('シート1');
  writeLog(sheet); // 引数で渡す
}

function writeLog(sheet) {
  sheet.getRange('A1').setValue('記録');
}
