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
function exportDriveImages_() {
  const rootFolder = DriveApp.getFolderById(FOLDER_ID);
  const list = [];

  getFilesRecursively_(rootFolder, rootFolder.getName(), list, {folders: 0, files: 0}, 0);

  if (SHEET_IMG_PATH === SHEET_DATA_MAIN) throw new Error("取得用と管理用のシートは分けてください。");

  const sheet = getSheet_(SHEET_IMG_PATH);
  const neededRows = list.length + 1;
  if (sheet.getMaxRows() < neededRows) sheet.insertRowsAfter(sheet.getMaxRows(), neededRows - sheet.getMaxRows());
  sheet.getRange(1, 1, Math.max(sheet.getLastRow(), 1), 3).clearContent();
  sheet.getRange(1, 1, 1, 3).setValues([['ファイル名', '画像URL', 'フォルダパス']]);
  if (list.length) sheet.getRange(2, 1, list.length, 3).setValues(list.map(row => row.map(value => /^[=+@-]/.test(value) ? "'" + value : value)));
}

function getFilesRecursively_(folder, path, list, state, depth) {
  if (depth >= 10 || ++state.folders > 100) throw new Error('フォルダ走査の上限です。対象を小さくしてください。');
  const files = folder.getFiles();
  while (files.hasNext()) {
    const file = files.next();
    if (++state.files > 1000) throw new Error('ファイル走査は1000件までです。');
    if (!['image/png','image/jpeg','image/gif','image/webp'].includes(file.getMimeType())) continue;
    if (list.length >= 500) throw new Error('対象画像は500件までです。');
    const id = file.getId();
    const thumbUrl = `https://drive.google.com/thumbnail?id=${id}`;
    list.push([file.getName(), thumbUrl, path]);
  }

  const folders = folder.getFolders();
  while (folders.hasNext()) {
    const sub = folders.next();
    const subPath = `${path}/${sub.getName()}`;
    getFilesRecursively_(sub, subPath, list, state, depth + 1);
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
function openViewer_ () {
  const url = SpreadsheetApp.getActiveSpreadsheet()
               .getSheetByName('ギャラリー')
               .getRange('A1')
               .getValue();

  if (!/^https:\/\/script\.google\.com\/macros\/s\/[A-Za-z0-9_-]+\/exec$/.test(String(url))) {
    throw new Error('ギャラリー!A1にWebアプリのexec URLを設定してください。');
  }
  const safeUrl = JSON.stringify(String(url));
  const script = `
    <script>
      const opened = window.open(${safeUrl}, '_blank');
      if (opened) opened.focus();
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
    .addItem('ギャラリーを表示',      'openViewer_')
    .addItem('画像パスの取得', 'exportDriveImages_')
    .addToUi();
}

/* =====================================================================
 * データ取得 API（HTML から呼び出し）
 * ===================================================================*/
function getSSValues () {
  return JSON.stringify(readSheetObjects_(SHEET_DATA_MAIN));
}

/* =====================================================================
 * 共通ユーティリティ
 * ===================================================================*/
/** シート取得 */
function getSheet_ (name) {
  const ss = SpreadsheetApp.openById(SS_ID);
  const sheet = ss.getSheetByName(name);
  if (!sheet) throw new Error('シートがありません: ' + name);
  return sheet;
}

/** ヘッダー行をキーに行データをオブジェクト配列化 */
function readSheetObjects_ (sheetName) {
  const sheet = getSheet_(sheetName);
  if (sheet.getLastRow() > 501) throw new Error('管理データは500件までです。');
  const expected = ['id','file_name','item_name','image_path','tag','rare','type'];
  const [header, ...rows] = sheet.getRange(1, 1, Math.max(sheet.getLastRow(), 1), 7).getDisplayValues();
  if (header.join('|') !== expected.join('|')) throw new Error('管理シートの7列の見出しを確認してください。');
  return rows.map(row =>
    header.reduce((obj, key, idx) => {
      obj[String(key)] = String(row[idx]);
      return obj;
    }, {}));
}

/** HTML 部品の include_ 用 */
function include_ (file) {
  return HtmlService.createHtmlOutputFromFile(file).getContent();
}
