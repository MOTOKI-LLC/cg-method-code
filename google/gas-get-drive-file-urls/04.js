function makeList() {
  const folder_id = "フォルダID"; // リスト化したいフォルダのID

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet_id = ss.getId();
  const sheet_name = ss.getSheets()[0].getName();

  const folder = DriveApp.getFolderById(folder_id);

  appendLogToSpreadsheet(['種類', '名前', 'URL'], sheet_id, sheet_name);

  function getAllFolder(f) {
    const folders = f.getFolders();
    while (folders.hasNext()) {
      const subFolder = folders.next();
      appendLogToSpreadsheet(['フォルダ', subFolder.getName(), subFolder.getUrl()], sheet_id, sheet_name);
      getAllFile(subFolder);
      getAllFolder(subFolder);
    }
  }

  function getAllFile(f) {
    const files = f.getFiles();
    while (files.hasNext()) {
      const file = files.next();
      appendLogToSpreadsheet(['　└ ファイル', file.getName(), file.getUrl()], sheet_id, sheet_name);
    }
  }

  getAllFile(folder);
  getAllFolder(folder);
}

function appendLogToSpreadsheet(log, sheetId, sheetName) {
  const spreadSheet = SpreadsheetApp.openById(sheetId);
  spreadSheet.getSheetByName(sheetName).appendRow([log[0], log[1], log[2]]);
  SpreadsheetApp.flush();
}
