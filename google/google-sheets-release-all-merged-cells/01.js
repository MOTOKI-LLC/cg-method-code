function fillMergedLabels() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('結合練習');
  if (!sheet) throw new Error('対象シートがありません: 結合練習');
  const area = sheet.getRange('A2:B2'); // コピーした練習表の文字ラベルだけ
  if (area.getNumRows() * area.getNumColumns() > 1000) {
    throw new Error('対象は1000セル以内にしてください');
  }
  const plans = area.getMergedRanges().map(merged => {
    if (merged.getRow() < area.getRow() || merged.getColumn() < area.getColumn()
        || merged.getLastRow() > area.getLastRow()
        || merged.getLastColumn() > area.getLastColumn()) {
      throw new Error('対象範囲をまたぐ結合セルがあります');
    }
    const cell = merged.getCell(1, 1);
    const value = cell.getValue();
    if (cell.getFormula() || typeof value !== 'string'
        || value.startsWith('=') || value.startsWith("'")) {
      throw new Error('複製できるのは数式ではない文字ラベルだけです');
    }
    return { merged, values: Array.from({ length: merged.getNumRows() },
      () => Array(merged.getNumColumns()).fill(value)) };
  });
  // すべての入力を確認してから変更する。
  plans.forEach(plan => {
    plan.merged.breakApart();
    plan.merged.setValues(plan.values);
  });
  console.log('処理した結合範囲: ' + plans.length);
}
