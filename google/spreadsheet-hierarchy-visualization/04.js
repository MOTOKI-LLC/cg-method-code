const TREE_SHEET_ID = 'COPY_SPREADSHEET_ID';
const TREE_SHEET_NAME = 'シート1';
function doGet() {
  return HtmlService.createTemplateFromFile('index').evaluate()
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setTitle('階層ビュー');
}
function include(file) {
  if (!['css', 'js'].includes(file)) throw new Error('不明なファイル');
  return HtmlService.createHtmlOutputFromFile(file).getContent();
}
function getPrefabTreeData() {
  const sheet = SpreadsheetApp.openById(TREE_SHEET_ID).getSheetByName(TREE_SHEET_NAME);
  if (!sheet) throw new Error('指定したシートがありません');
  const last = sheet.getLastRow();
  if (last < 2 || last > 101) throw new Error('見出しを除き1〜100行にしてください');
  return validateTree_(sheet.getRange(1, 1, last, 5).getDisplayValues());
}
function validateTree_(data) {
  const headers = ['グループ名', 'nodeId', 'parentId', 'ノード名', '補足情報'];
  if (headers.some((h,i) => data[0][i].trim() !== h)) throw new Error('A1:E1の見出しを確認してください');
  const rows = data.slice(1).filter(r => r.some(v => v.trim()));
  if (!rows.length) throw new Error('データがありません');
  const nodes = rows.map(r => ({id:r[1].trim(), parent:r[2].trim(), name:r[3].trim(), comps:r[4]}));
  const map = new Map();
  for (const n of nodes) {
    if (!n.id || !n.name || n.id.length > 200 || n.parent.length > 200 || n.name.length > 80 || n.comps.length > 1000) throw new Error('ID・名前の空欄または文字数上限を確認してください');
    if (map.has(n.id)) throw new Error('nodeIdが重複しています');
    map.set(n.id, n);
  }
  for (const n of nodes) {
    const seen = new Set();
    let cur = n;
    while (cur) {
      if (seen.has(cur.id)) throw new Error('親子関係が循環しています');
      seen.add(cur.id);
      if (cur.parent && !map.has(cur.parent)) throw new Error('存在しないparentIdがあります');
      cur = cur.parent ? map.get(cur.parent) : null;
    }
  }
  if (nodes.filter(n => !n.parent).length !== 1) throw new Error('parentIdが空のルートは1件にしてください');
  return nodes;
}
