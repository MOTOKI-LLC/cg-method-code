function onOpen() {
  SpreadsheetApp.getUi().createMenu('Drive一覧').addItem('ファイル一覧を出力', 'showFolderInputModal').addToUi();
}
function showFolderInputModal() {
  const html = HtmlService.createHtmlOutputFromFile('FolderInputForm').setWidth(420).setHeight(250);
  SpreadsheetApp.getUi().showModalDialog(html, 'フォルダURLを入力');
}
function processFolderUrl(folderUrl) {
  const match = String(folderUrl).trim().match(/^https:\/\/drive\.google\.com\/drive\/(?:u\/\d+\/)?folders\/([a-zA-Z0-9_-]+)(?:[?#][^\s]*)?$/);
  if (!match) throw new Error('drive.google.comのフォルダURLを指定してください');
  const keyMatch = String(folderUrl).trim().split('#')[0].match(/[?&]resourcekey=([^&]*)/);
  let resourceKey = '';
  if (keyMatch) {
    try { resourceKey = decodeURIComponent(keyMatch[1]); }
    catch (e) { throw new Error('resourcekeyを含む元のURLをコピーし直してください'); }
    if (!/^[a-zA-Z0-9_-]+$/.test(resourceKey)) throw new Error('resourcekeyの形式が不正です');
  }
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(10000)) throw new Error('同じスクリプトで処理中です');
  try {
    const root = resourceKey
      ? DriveApp.getFolderByIdAndResourceKey(match[1], resourceKey)
      : DriveApp.getFolderById(match[1]);
    const queue = [{folder: root, path: root.getName()}];
    const seen = new Set(), rows = [];
    for (let i = 0; i < queue.length; i++) {
      const {folder, path} = queue[i];
      if (seen.has(folder.getId())) throw new Error('重複フォルダIDのため中止しました');
      seen.add(folder.getId());
      const files = folder.getFiles();
      while (files.hasNext()) {
        if (rows.length >= 1000) throw new Error('1000ファイルを超えるため中止しました');
        const file = files.next();
        if (file.isTrashed()) continue;
        const owner = file.getOwner();
        rows.push([safeCell_(path), safeCell_(file.getName()), file.getDateCreated(),
          safeCell_(owner ? owner.getName() : '所有者情報なし'), file.getUrl()]);
      }
      const children = folder.getFolders();
      while (children.hasNext()) {
        const child = children.next();
        if (child.isTrashed()) continue;
        if (queue.length >= 100) throw new Error('100フォルダを超えるため中止しました');
        queue.push({folder: child, path: path + ' > ' + child.getName()});
      }
    }
    // 列挙がすべて成功してから、新規シートへ出力します。
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const name = 'ファイル一覧_' + Utilities.getUuid();
    const sheet = ss.insertSheet(name, 0);
    if (sheet.getMaxRows() < rows.length + 1) {
      sheet.insertRowsAfter(sheet.getMaxRows(), rows.length + 1 - sheet.getMaxRows());
    }
    sheet.getRange(1, 1, rows.length + 1, 5).setValues([['フォルダ', 'ファイル名', '作成日', 'オーナー', 'URL'], ...rows]);
    sheet.activate();
    return {name, files: rows.length, folders: seen.size};
  } finally {
    try { SpreadsheetApp.flush(); }
    finally { lock.releaseLock(); }
  }
}
function safeCell_(value) {
  const text = String(value);
  return /^[=+@-]/.test(text) ? "'" + text : text;
}
