function listFiles() {
  const folderId = 'ここにフォルダIDを入れる';
  const files = DriveApp.getFolderById(folderId).getFiles();
  const rows = [['ファイル名', 'URL', '最終更新日']];
  while (files.hasNext()) {
    const file = files.next();
    rows.push([file.getName(), file.getUrl(), file.getLastUpdated()]);
  }
  const sheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet();
  sheet.getRange(1, 1, rows.length, rows[0].length).setValues(rows);
}
