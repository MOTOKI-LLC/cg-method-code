function getHyperlinks(rangeA1Notation) {
  if (typeof rangeA1Notation !== 'string' || !rangeA1Notation.includes('!')) {
    throw new Error('シート名を含めて指定してください。例: リンク!D2:D4');
  }
  const range = SpreadsheetApp.getActiveSpreadsheet().getRange(rangeA1Notation);
  if (range.getNumRows() * range.getNumColumns() > 1000) {
    throw new Error('1回の対象は1000セル以内にしてください');
  }
  return range.getRichTextValues().map(row =>
    row.map(value => value ? (value.getLinkUrl() || '') : '')
  );
}
