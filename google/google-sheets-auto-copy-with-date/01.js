function monthSheetName_(date, zone) {
  if (!(date instanceof Date) || !Number.isFinite(date.getTime())) throw new Error('有効な日時を指定してください');
  return Utilities.formatDate(date, zone, 'yyyyMM');
}
function AutoSheetCopy() { return copyMonthAt_(new Date()); }
function demoMonthCopy() { return copyMonthAt_(new Date('2026-10-01T00:30:00+09:00')); }
function copyMonthAt_(date) {
  const id = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID');
  if (!id) throw new Error('SPREADSHEET_IDを設定してください');
  const ss = SpreadsheetApp.openById(id);
  const name = monthSheetName_(date, ss.getSpreadsheetTimeZone());
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(5000)) throw new Error('別の実行中です。完了後に同じ年月で確認してください');
  try {
    const master = ss.getSheetByName('master');
    if (!master) throw new Error('masterシートがありません');
    if (ss.getSheetByName(name)) return {status: 'exists', sheetName: name};
    ss.insertSheet(name, 0, {template: master});
    SpreadsheetApp.flush();
    const result = {status: 'created', sheetName: name};
    console.log(JSON.stringify(result));
    return result;
  } finally { lock.releaseLock(); }
}
