function doGet() {
  return HtmlService.createHtmlOutputFromFile('index');
}
function copyPracticeFile(name) {
  if (typeof name !== 'string') throw new Error('ファイル名を入力してください');
  name = name.trim();
  if (!name || name.length > 80 || /[\x00-\x1f\x7f]/.test(name)) throw new Error('ファイル名は改行なしの1～80文字で入力してください');
  const props = PropertiesService.getScriptProperties();
  const sourceId = props.getProperty('COPY_SOURCE_ID');
  const folderId = props.getProperty('COPY_FOLDER_ID');
  if (!sourceId || !folderId) throw new Error('スクリプトプロパティを設定してください');
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(5000)) throw new Error('処理中です。結果を確認してから再操作してください');
  try {
    const source = DriveApp.getFileById(sourceId);
    if (source.getMimeType() !== 'application/vnd.google-apps.document') throw new Error('練習用Googleドキュメントを指定してください');
    const folder = DriveApp.getFolderById(folderId);
    if (folder.getFilesByName(name).hasNext()) throw new Error('同名ファイルがあります。コピー先を確認してください');
    const copied = source.makeCopy(name, folder);
    return {id: copied.getId(), name: copied.getName()};
  } finally {
    lock.releaseLock();
  }
}
