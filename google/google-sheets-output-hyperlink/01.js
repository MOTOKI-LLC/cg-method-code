function getHyperlinks(rangeA1Notation) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const range = sheet.getRange(rangeA1Notation);
  const values = range.getRichTextValues();
  const result = [];

  for (let i = 0; i < values.length; i++) {
    const row = [];
    for (let j = 0; j < values[i].length; j++) {
      row.push(values[i][j] ? (values[i][j].getLinkUrl() || "") : "");
    }
    result.push(row);
  }

  return result;
}
