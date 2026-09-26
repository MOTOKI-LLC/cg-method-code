/* =====================================================================
 * 定数定義
 * ===================================================================*/
const SS_ID           = 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx';
const FOLDER_ID       = 'xxxxxxxxxxxxxxxxxxxxxxxxx';
const SHEET_IMG_PATH  = '画像パスの取得';
const SHEET_DATA_MAIN = '管理シート';

/* =====================================================================
 * 画像ファイル一覧をスプレッドシートへ書き込む
 * ===================================================================*/
function exportDriveImages() {
  const rootFolder = DriveApp.getFolderById(FOLDER_ID);
  const list = [];

  getFilesRecursively(rootFolder, rootFolder.getName(), list);

  if (!list.length) return;

  const sheet = getSheet(SHEET_IMG_PATH);
  sheet.clearContents();
  sheet.getRange(1, 1, 1, 3).setValues([['ファイル名', '画像URL', 'フォルダパス']]);
  sheet.getRange(2, 1, list.length, 3).setValues(list);
}

function getFilesRecursively(folder, path, list) {
  const files = folder.getFiles();
  while (files.hasNext()) {
    const file = files.next();
    const id = file.getId();
    const thumbUrl = `https://drive.google.com/thumbnail?id=${id}`;
    list.push([file.getName(), thumbUrl, path]);
  }

  const folders = folder.getFolders();
  while (folders.hasNext()) {
    const sub = folders.next();
    const subPath = `${path}/${sub.getName()}`;
    getFilesRecursively(sub, subPath, list);
  }
}

/* =====================================================================
 * Web アプリ公開
 * ===================================================================*/
function doGet () {
  return HtmlService
    .createTemplateFromFile('index')
    .evaluate();
}

/* 新しいタブで Web アプリを開く（メニュー用）*/
function openViewer () {
  const url = SpreadsheetApp.getActiveSpreadsheet()
               .getSheetByName('ギャラリー')
               .getRange('A1')
               .getValue();

  const safeUrl = JSON.stringify(url);
  const script = `
    <script>
      window.open(${safeUrl}, '_blank').focus();
      google.script.host.close();
    </script>`;

  SpreadsheetApp.getUi()
    .showModalDialog(HtmlService.createHtmlOutput(script), 'CardIllustViewer');
}

/* =====================================================================
 * カスタムメニュー
 * ===================================================================*/
function onOpen () {
  SpreadsheetApp.getUi().createMenu('カスタムメニュー')
    .addItem('ギャラリーを表示',      'openViewer')
    .addItem('画像パスの取得', 'exportDriveImages')
    .addToUi();
}

/* =====================================================================
 * データ取得 API（HTML から呼び出し）
 * ===================================================================*/
function getSSValues () {
  return JSON.stringify(readSheetObjects(SHEET_DATA_MAIN));
}

/* =====================================================================
 * 共通ユーティリティ
 * ===================================================================*/
/** シート取得（キャッシュ付き）*/
function getSheet (name) {
  const ss = SpreadsheetApp.openById(SS_ID);
  return ss.getSheetByName(name);
}

/** ヘッダー行をキーに行データをオブジェクト配列化 */
function readSheetObjects (sheetName) {
  const sheet = getSheet(sheetName);
  const [header, ...rows] = sheet.getDataRange().getDisplayValues();
  return rows.map(row =>
    header.reduce((obj, key, idx) => {
      obj[String(key)] = String(row[idx]);
      return obj;
    }, {}));
}

/** HTML 部品の include 用 */
function include (file) {
  return HtmlService.createHtmlOutputFromFile(file).getContent();
}
