function removeDuplicatesKeepFirst() {
  deleteDuplicateKeyRows(false);
}

// 1行目は見出し。A列の表示文字列を完全一致で比較します。
function deleteDuplicateKeyRows(keepLast) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return;
  const keys = sheet.getRange(2, 1, lastRow - 1, 1).getDisplayValues();
  const seen = new Set();
  const remove = [];
  for (let step = 0; step < keys.length; step++) {
    const i = keepLast ? keys.length - 1 - step : step;
    const key = keys[i][0];
    if (key === '') continue; // 空のキーは削除しません
    if (seen.has(key)) remove.push(i + 2);
    else seen.add(key);
  }
  // 行番号のずれを防ぐため下から削除します。
  remove.sort((a, b) => b - a).forEach(row => sheet.deleteRow(row));
}
