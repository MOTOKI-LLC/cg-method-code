function readPracticeA1(sheetName) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
  if (!sheet) throw new Error('対象シートがありません: ' + sheetName);
  return sheet.getRange('A1').getValue();
}
function inspectPracticeCell(rangeA1Notation) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const cell = ss.getRange(rangeA1Notation);
  if (cell.getNumRows() !== 1 || cell.getNumColumns() !== 1) {
    throw new Error('1セルだけを指定してください');
  }
  const value = cell.getValue();
  const type = value instanceof Date ? 'date' : typeof value;
  const printable = value instanceof Date ? Utilities.formatDate(value, ss.getSpreadsheetTimeZone(), 'yyyy-MM-dd') : value;
  return [['値', printable], ['表示文字列', cell.getDisplayValue()], ['数式', cell.getFormula()], ['型', type]];
}
