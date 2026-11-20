function debugMissingSheet() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('存在しない練習シート');
  return sheet.getRange('A1').getValue();
}
function debugMissingVariable() {
  return missingPracticeValue;
}
