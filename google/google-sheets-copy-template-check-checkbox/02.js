const cells = CopiedFileSheet.getRange('A1:H1');
let checked = 0;
for (let col = 1; col <= 8; col++) {
  const state = cells.getCell(1, col).isChecked();
  if (state === null) throw new Error('A1:H1のチェックボックスを確認してください');
  if (state) checked++;
}
LogFileSheet.getRange('A2').setValue('チェックあり: ' + checked + '件');
