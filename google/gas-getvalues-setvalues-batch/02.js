function doubleNumbers() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('一括処理練習');
  if (!sheet) throw new Error('「一括処理練習」シートを作成してください。');
  const values = sheet.getRange('A2:A101').getValues();
  const output = values.map(function (row, index) {
    const value = row[0];
    if (value === '') return [''];
    if (typeof value !== 'number' || !Number.isFinite(value) || !Number.isFinite(value * 2)) {
      throw new Error('A' + (index + 2) + 'に数値以外、または計算できない値があります。');
    }
    return [value * 2];
  });
  sheet.getRange('B2:B101').setValues(output);
}
