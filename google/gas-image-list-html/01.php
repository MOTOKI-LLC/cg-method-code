// このコードは記事ごとに別のApps Scriptプロジェクトへ保存します。
function required_(key) {
  const value=PropertiesService.getScriptProperties().getProperty(key);
  if (!value) throw new Error(key+'を設定してください');
  return value;
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
function imageListHtml_(rows) {
  if(rows.length>1000) throw new Error('1000行以内にしてください');
  const body=rows.filter(row=>row.some(v=>v!=='')).map((row,index)=>{
    if(row.length!==4) throw new Error('4列にしてください');
    const [name,image,link,note]=row;
    const src=image==='' ? '' : https_(image);
    // Driveの共有ページを画像配信URLへ変換しません。
    if(/^https:\/\/(?:drive|docs)\.google\.com(?:[:/?#]|$)/i.test(src)) throw new Error('画像配信用HTTPS URLを指定してください');
    const href=link==='' ? '' : https_(link);
    return '<tr><td>'+escapeHtml_(name)+'</td><td>'+(src ? '<img loading="lazy" referrerpolicy="no-referrer" src="'+escapeHtml_(src)+'" alt="'+escapeHtml_(name)+'">' : '画像なし')+'</td><td>'+(href ? '<a rel="noopener noreferrer" target="_blank" href="'+escapeHtml_(href)+'">参照元</a>' : 'リンクなし')+'</td><td>'+escapeHtml_(note)+'</td></tr>';
  }).join('');
  return '<!doctype html><html lang="ja"><meta charset="UTF-8"><style>body{font-family:sans-serif;margin:16px}.wrap{overflow:auto}table{border-collapse:collapse}td,th{border:1px solid #999;padding:8px;min-width:8em}img{width:150px;height:150px;object-fit:contain}</style><div class="wrap"><table><thead><tr><th>名前</th><th>画像</th><th>参照元</th><th>備考</th></tr></thead><tbody>'+body+'</tbody></table></div></html>';
}
function demoHtml(){return imageListHtml_([['練習A','','https://cg-method.com/','<文字として表示>']]);}
function previewHtml() {
  const sheet=sourceSheet_(),last=sheet.getLastRow();
  if (last > 1001) throw new Error('見出しを除いて1000行以内にしてください');
  const headers = sheet.getRange(1,1,1,4).getDisplayValues()[0];
  if (headers.join('\t') !== '名前\t画像URL\t参照先URL\t備考') throw new Error('A1:D1の見出しと列順を確認してください');
  const rows=last<2 ? [] : sheet.getRange(2,1,last-1,4).getDisplayValues();
  return imageListHtml_(rows);
}
function doGet() {
  return HtmlService.createHtmlOutput(previewHtml())
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setTitle('練習用画像一覧');
}
