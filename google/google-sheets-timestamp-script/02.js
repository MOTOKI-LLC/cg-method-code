function onEdit(e) {
  if (!e || !e.range) return;
  // 単一セルの手入力専用。複数セルの貼り付けは処理しない。
  if (e.range.getNumRows() !== 1 || e.range.getNumColumns() !== 1) return;
  const sheet = e.range.getSheet();
  if (sheet.getName() !== 'シート1') return; // 対象のシート名
  if (e.range.getColumn() !== 2) return;      // B列を編集したときだけ
  const row = e.range.getRow();
  if (row === 1) return;                      // 1行目（見出し）は除く
  const stamp = sheet.getRange(row, 1);       // A列に記録する
  if (e.range.getValue() === '') {
    stamp.clearContent();                     // B列を消したら日時も消す
  } else {
    stamp.setValue(new Date());
  }
}
