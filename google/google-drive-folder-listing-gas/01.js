// メニュー追加
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu("ツール")
    .addItem("ファイル一覧を出力", "showFolderInputModal")
    .addToUi();
}

// モーダルを表示
function showFolderInputModal() {
  const html = HtmlService.createHtmlOutputFromFile('FolderInputForm')
    .setWidth(400)
    .setHeight(200);
  SpreadsheetApp.getUi().showModalDialog(html, 'フォルダURLを入力');
}

// フォルダURLを受け取り処理を開始
function processFolderUrl(folderUrl) {
  const folderId = extractFolderId(folderUrl);
  if (!folderId) {
    throw new Error("フォルダURLが無効です");
  }

  const folder = DriveApp.getFolderById(folderId);
  const folderData = getAllSubFolders(folderId);
  const sheet = createSheetWithFolderName(folder.getName());
  writeFilesToSheet(sheet, folderData);
}

// フォルダID抽出
function extractFolderId(url) {
  const match = url.match(/[-\w]{25,}/);
  return match ? match[0] : null;
}

// フォルダ名+日付+時刻で新シート作成
function createSheetWithFolderName(folderName) {
  const now = new Date();
  const timestamp = Utilities.formatDate(now, Session.getScriptTimeZone(), "yyyyMMdd_HHmm");
  const sheetName = `${folderName}_${timestamp}`.slice(0, 99); // シート名は最大100文字
  const sheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet(sheetName, 0);
  sheet.activate();
  return sheet;
}

// サブフォルダを再帰的に取得
function getAllSubFolders(rootId) {
  const folderQueue = [[DriveApp.getFolderById(rootId).getName(), rootId]];
  const result = [];

  for (let i = 0; i < folderQueue.length; i++) {
    const [path, id] = folderQueue[i];
    result.push([path, id]);

    const subFolders = DriveApp.searchFolders(`'${id}' in parents`);
    while (subFolders.hasNext()) {
      const subFolder = subFolders.next();
      const subPath = `${path} > ${subFolder.getName()}`;
      folderQueue.push([subPath, subFolder.getId()]);
    }
  }

  return result;
}

// ファイル情報をシートに出力
function writeFilesToSheet(sheet, folderData) {
  sheet.clear();
  const headers = ["フォルダ", "ファイル名", "作成日", "オーナー", "URL"];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);

  let row = 2;
  folderData.forEach(([folderPath, folderId]) => {
    const files = DriveApp.searchFiles(`'${folderId}' in parents`);
    while (files.hasNext()) {
      const file = files.next();
      const values = [
        folderPath,
        file.getName(),
        file.getDateCreated(),
        file.getOwner().getName(),
        file.getUrl()
      ];
      sheet.getRange(row, 1, 1, values.length).setValues([values]);
      row++;
    }
  });
}
