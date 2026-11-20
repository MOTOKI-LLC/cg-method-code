const input = LogFileSheet.getRange('A3').getValue();
if (!(input instanceof Date) || isNaN(input.getTime())) {
  throw new Error('A3に有効な日付を入力してください');
}
const date = Utilities.formatDate(input, LogFile.getSpreadsheetTimeZone(), 'yyMMdd');
