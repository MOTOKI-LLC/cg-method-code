function getFileListInFolder() {
  const folderId = 'フォルダID';
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) throw new Error('スプレッドシートから開いたApps Scriptで実行してください');
  const sheet = ss.getSheetByName('シート1');
  if (!sheet) throw new Error('出力先のシート1がありません');
  const files = DriveApp.getFolderById(folderId).getFiles();
  const rows = [];
  while (files.hasNext()) {
    const file = files.next();
    const name = file.getName();
    rows.push([name.startsWith('=') ? "'" + name : name, file.getUrl()]);
  }
  if (!rows.length) {
    Logger.log('対象フォルダ直下にファイルがありません');
    return;
  }
  sheet.getRange(2, 1, rows.length, 2).setValues(rows);
}
