function checkPracticeBoxes() {
  const props = PropertiesService.getScriptProperties();
  const id = props.getProperty('SPREADSHEET_ID');
  const name = props.getProperty('SHEET_NAME');
  if (!id || !name) throw new Error('SPREADSHEET_IDとSHEET_NAMEを設定してください');
  const sheet = SpreadsheetApp.openById(id).getSheetByName(name);
  if (!sheet) throw new Error('対象シートがありません');
  const range = sheet.getRange('A2:H2');
  const cells = [];
  for (let col = 1; col <= range.getNumColumns(); col++) {
    // 1セルずつ判定すると、チェックと未チェックの混在を扱えます。
    const state = range.getCell(1, col).isChecked();
    cells.push({column: col, state: state === true ? 'checked' : state === false ? 'unchecked' : 'invalid'});
  }
  const result = {
    anyChecked: cells.some(x => x.state === 'checked'),
    checkedCount: cells.filter(x => x.state === 'checked').length,
    invalidCount: cells.filter(x => x.state === 'invalid').length,
    cells: cells
  };
  console.log(JSON.stringify(result));
  return result;
}
