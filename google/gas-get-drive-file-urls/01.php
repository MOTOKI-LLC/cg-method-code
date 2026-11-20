// このコードは記事ごとに別のApps Scriptプロジェクトへ保存します。
function required_(key) {
  const value=PropertiesService.getScriptProperties().getProperty(key);
  if (!value) throw new Error(key+'を設定してください');
  return value;
}
function safeCell_(value) {
  const s=String(value);
  return /^[=+@-]/.test(s) ? "'"+s : s;
}
function escapeHtml_(value) {
  return String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
function https_(value) {
  const s=String(value).trim();
  if (!/^https:\/\/[a-z0-9](?:[a-z0-9.-]*[a-z0-9])?(?::443)?(?:[/?#][^\s<>"'\\]*)?$/i.test(s)) throw new Error('HTTPS URLを確認してください');
  return s;
}
function sourceSheet_() {
  const sheet=SpreadsheetApp.openById(required_('SPREADSHEET_ID')).getSheetByName(required_('SHEET_NAME'));
  if (!sheet) throw new Error('対象シートがありません');
  return sheet;
}
function walkFolder_(root,recursive) {
  const queue=[{folder:root,path:root.getName()}],seen=new Set(),rows=[],counts=[];
  let visitedFiles=0;
  for (let index=0;index<queue.length;index++) {
    if (index>=100) throw new Error('100フォルダを超えるため中止しました');
    const {folder,path}=queue[index],id=folder.getId();
    if (seen.has(id)) throw new Error('重複フォルダIDです');
    seen.add(id);
    const files=folder.getFiles();let count=0;
    while (files.hasNext()) {
      const file=files.next();
      if (++visitedFiles>1000) throw new Error('1000ファイルを超えるため中止しました');
      rows.push([safeCell_(path),safeCell_(file.getName()),file.getUrl(),file.getId()]);count++;
    }
    counts.push([safeCell_(path),id,count]);
    if (recursive) {
      const children=folder.getFolders();
      while(children.hasNext()) {
        const child=children.next();queue.push({folder:child,path:path+' / '+child.getName()});
        if(queue.length>100) throw new Error('100フォルダを超えるため中止しました');
      }
    }
  }
  return {rows,counts,total:visitedFiles};
}
function createOutput_(header,rows) {
  // 走査完了後だけ、新規の空シートへ一括出力します。
  const ss=SpreadsheetApp.openById(required_('SPREADSHEET_ID'));
  const name='練習結果_'+Utilities.getUuid().replace(/-/g,'');
  const sheet=ss.insertSheet(name);
  if(sheet.getMaxRows()<rows.length+1) sheet.insertRowsAfter(sheet.getMaxRows(),rows.length+1-sheet.getMaxRows());
  sheet.getRange(1,1,rows.length+1,header.length).setValues([header,...rows]);
  return name;
}
function recursive_(){return PropertiesService.getScriptProperties().getProperty('RECURSIVE')==='true';}
function previewFiles() {
  const result=walkFolder_(DriveApp.getFolderById(required_('FOLDER_ID')),recursive_());
  Logger.log('ファイル件数: '+result.total);return result;
}
function exportFiles() {
  const result=previewFiles();
  return createOutput_(['フォルダパス','ファイル名','閲覧URL','ファイルID'],result.rows);
}
