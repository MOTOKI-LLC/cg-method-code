function unmergeAllCells() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0]; // 最初のシートを取得
  const mergedRanges = sheet.getDataRange().getMergedRanges(); // 結合セルの範囲を取得

  for (let i = 0; i < mergedRanges.length; i++) {
    const range = mergedRanges[i];
    const value = range.getDisplayValue(); // 結合セルの表示値を取得
    range.breakApart(); // 結合を解除
    range.setValue(value); // 各セルに値を設定
  }
}
