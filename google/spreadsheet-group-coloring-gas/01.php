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
function groupColors_(values) {
  const palette=['#f0f8ff','#f5f5dc','#f0fff0'];
  let previous=null,index=-1;
  return values.map(row=>{
    const v=row[0];
    if(v==='') {previous=null;return [null];}
    const key=v instanceof Date ? 'date:'+v.getTime() : typeof v+':'+String(v);
    if(key!==previous) index++;
    previous=key;return [palette[index%palette.length]];
  });
}
function demoGroups(){return groupColors_([['A'],['A'],[''],['B'],['A']]);}
function copyColoredSheet() {
  const sheet=sourceSheet_(),last=sheet.getLastRow();
  if(last<2) throw new Error('見出し以外にデータがありません');
  if(last>1001) throw new Error('練習対象は1000行以内にしてください');
  const values=sheet.getRange(2,1,last-1,1).getValues(),colors=groupColors_(values);
  const ss=sheet.getParent(),copy=sheet.copyTo(ss);
  copy.setName('色分け練習_'+Utilities.getUuid().replace(/-/g,''));
  copy.getRange(2,1,colors.length,1).setBackgrounds(colors);
  return copy.getName();
}
