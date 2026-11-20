function exportFigmaNodes() {
  const props = PropertiesService.getScriptProperties();
  const token = props.getProperty('FIGMA_TOKEN');
  const fileKey = props.getProperty('FIGMA_FILE_KEY');
  const ids = (props.getProperty('FIGMA_NODE_IDS') || '')
    .split(',').map(s => s.trim()).filter(Boolean);
  if (!token || !fileKey) throw new Error('トークンとファイルキーを設定してください');
  if (ids.some(id => !/^\d+:\d+$/.test(id))) {
    throw new Error('node IDは123:456形式で指定してください');
  }
  const base = 'https://api.figma.com/v1/files/' + encodeURIComponent(fileKey);
  const url = ids.length ? base + '/nodes?ids=' +
    encodeURIComponent(ids.join(',')) : base;
  const response = UrlFetchApp.fetch(url, {
    headers: { 'X-Figma-Token': token }, muteHttpExceptions: true
  });
  const status = response.getResponseCode();
  if (status === 429) {
    const headers = response.getAllHeaders();
    const key = Object.keys(headers).find(k => k.toLowerCase() === 'retry-after');
    const wait = key ? String(headers[key]) : '未取得';
    throw new Error('Figma API HTTP 429。Retry-After: ' + wait + '。再実行を止めて制限を確認してください');
  }
  if (status !== 200) {
    throw new Error('Figma API HTTP ' + status + '。権限・期限・制限を確認してください');
  }
  const data = JSON.parse(response.getContentText());
  const types = new Set(['INSTANCE', 'COMPONENT', 'COMPONENT_SET', 'TEXT']);
  const rows = [];
  const seen = new Set();
  const safeCell = value => {
    const text = value == null ? '' : String(value);
    return /^[=+@\-\t\r\n]/.test(text) ? "'" + text : text;
  };
  function walk(node, path, components) {
    if (!node || seen.has(node.id)) return;
    seen.add(node.id);
    const nextPath = path.concat(node.name || node.id);
    if (types.has(node.type)) {
      const component = components[node.componentId || node.id] || {};
      const bounds = node.absoluteBoundingBox || {};
      rows.push([node.id, node.type, node.name, nextPath.join(' / '),
        node.componentId || '', component.key || '', node.characters || '',
        bounds.width == null ? '' : bounds.width,
        bounds.height == null ? '' : bounds.height].map(safeCell));
    }
    (node.children || []).forEach(child => walk(child, nextPath, components));
  }
  if (ids.length) {
    ids.forEach(id => {
      const item = data.nodes && data.nodes[id];
      if (!item || !item.document) throw new Error('対象node IDを取得できませんでした');
      walk(item.document, [], item.components || {});
    });
  } else {
    if (!data.document) throw new Error('ファイルのdocumentがありません');
    walk(data.document, [], data.components || {});
  }
  const headers = ['nodeId', 'type', 'name', 'layerPath', 'componentId',
    'componentKey', 'characters', 'width', 'height'];
  const sheetName = 'Figma取得結果';
  const book = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = book.getSheetByName(sheetName) || book.insertSheet(sheetName);
  const values = [headers].concat(rows);
  if (sheet.getMaxRows() < values.length) {
    sheet.insertRowsAfter(sheet.getMaxRows(), values.length - sheet.getMaxRows());
  }
  if (sheet.getMaxColumns() < headers.length) {
    sheet.insertColumnsAfter(sheet.getMaxColumns(), headers.length - sheet.getMaxColumns());
  }
  sheet.clearContents();
  const range = sheet.getRange(1, 1, values.length, headers.length);
  range.setNumberFormat('@');
  range.setValues(values);
  sheet.setFrozenRows(1);
  console.log('出力行数: ' + rows.length);
}
