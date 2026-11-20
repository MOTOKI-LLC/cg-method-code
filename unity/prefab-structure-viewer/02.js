// Set a spreadsheet you control; do not broaden Web app access for project asset data.
const PREFAB_VIEWER_CONFIG = Object.freeze({
  spreadsheetId: 'REPLACE_WITH_SPREADSHEET_ID',
  sheetName: 'PrefabGraph',
  maxRows: 10000,
  maxNodes: 2000,
  maxEdges: 5000
});

function doGet() {
  return HtmlService.createTemplateFromFile('index').evaluate().setTitle('Prefab reference viewer');
}

function include(name) {
  if (!['js', 'css'].includes(name)) throw new Error('Unknown template.');
  return HtmlService.createHtmlOutputFromFile(name).getContent();
}

function getPrefabGraphData() {
  const cfg = PREFAB_VIEWER_CONFIG;
  if (cfg.spreadsheetId === 'REPLACE_WITH_SPREADSHEET_ID')
    throw new Error('Set spreadsheetId in Code.gs before running.');
  const sheet = SpreadsheetApp.openById(cfg.spreadsheetId).getSheetByName(cfg.sheetName);
  if (!sheet) throw new Error('Configured sheet was not found.');
  const lastRow = sheet.getLastRow();
  const lastColumn = sheet.getLastColumn();
  if (!lastRow) throw new Error('Import the CSV header and rows first.');
  if (lastRow > cfg.maxRows || lastColumn !== 9)
    throw new Error('Expected exactly 9 columns, at most ' + cfg.maxRows + ' rows.');
  const rows = sheet.getRange(1, 1, lastRow, 9).getDisplayValues();
  return parsePrefabRows(rows, cfg);
}

// Pure conversion. These exact functions are independently tested with synthetic rows.
function parsePrefabRows(rows, limits) {
  const header = ['Record','GUID','Path','Name','AssetType','TargetGUID','Relation','InScope','ScanStatus'];
  const cfg = limits || {maxRows:10000, maxNodes:2000, maxEdges:5000};
  if (!Array.isArray(rows) || rows.length < 2 || rows.length > cfg.maxRows)
    throw new Error('No graph rows or too many rows.');
  if (!Array.isArray(rows[0]) || rows[0].length !== 9 ||
      rows[0].some((value, i) => String(value) !== header[i]))
    throw new Error('CSV header does not match the 9-column schema.');
  const nodes = new Map();
  const pending = [];
  const guidPattern = /^[0-9a-f]{32}$/;
  for (let n = 1; n < rows.length; n++) {
    const row = rows[n];
    if (!Array.isArray(row) || row.length !== 9) throw new Error('Wrong column count at row ' + (n + 1));
    const r = row.map(value => String(value == null ? '' : value));
    if (r.every(value => value === '')) continue;
    if (!guidPattern.test(r[1])) throw new Error('Invalid GUID at row ' + (n + 1));
    if (r[0] === 'Node') {
      if (nodes.has(r[1])) throw new Error('Duplicate node GUID at row ' + (n + 1));
      if (!r[2].startsWith('Assets/') || !r[3] || !['Regular','Variant','Model'].includes(r[4]) || r[5] || r[6])
        throw new Error('Invalid node fields at row ' + (n + 1));
      if (!['true','false'].includes(r[7].toLowerCase())) throw new Error('Invalid InScope at row ' + (n + 1));
      const inScope = r[7].toLowerCase() === 'true';
      if (inScope ? !['Ready','Error'].includes(r[8]) : r[8] !== 'ReferencedOnly')
        throw new Error('Invalid scan status at row ' + (n + 1));
      if (inScope && r[4] === 'Model') throw new Error('Model nodes must be referenced only.');
      nodes.set(r[1], {id:'n' + r[1], guid:r[1], label:r[3], path:r[2],
        folder:r[2].slice(0, r[2].lastIndexOf('/')), assetType:r[4], inScope, scanStatus:r[8]});
      if (nodes.size > cfg.maxNodes) throw new Error('Too many nodes.');
    } else if (r[0] === 'Edge') {
      if (!guidPattern.test(r[5]) || !['Nested','Variant'].includes(r[6]) ||
          [r[2],r[3],r[4],r[7],r[8]].some(Boolean) || r[1] === r[5])
        throw new Error('Invalid edge fields at row ' + (n + 1));
      pending.push({sourceGUID:r[1], targetGUID:r[5], relation:r[6]});
    } else throw new Error('Unknown record type at row ' + (n + 1));
  }
  if (!nodes.size) throw new Error('No node records.');
  const edges = new Map();
  const baseByVariant = new Map();
  for (const edge of pending) {
    const source = nodes.get(edge.sourceGUID);
    const target = nodes.get(edge.targetGUID);
    if (!source || !target) throw new Error('Edge endpoint node is missing.');
    if (!source.inScope || source.scanStatus !== 'Ready')
      throw new Error('Only a successfully scanned node can supply edges.');
    if (edge.relation === 'Variant') {
      if (source.assetType !== 'Variant') throw new Error('Variant edge source must be a Variant asset.');
      const previous = baseByVariant.get(source.guid);
      if (previous && previous !== target.guid) throw new Error('A Variant has more than one immediate base.');
      baseByVariant.set(source.guid, target.guid);
    }
    const id = 'e' + edge.relation + '_' + source.guid + '_' + target.guid;
    edges.set(id, {id, source:source.id, target:target.id, relation:edge.relation});
    if (edges.size > cfg.maxEdges) throw new Error('Too many edges.');
  }
  return {nodes:[...nodes.values()], edges:[...edges.values()], summary:{
    nodeCount:nodes.size, edgeCount:edges.size,
    failedNodes:[...nodes.values()].filter(node => node.scanStatus === 'Error').length,
    referencedOnlyNodes:[...nodes.values()].filter(node => !node.inScope).length
  }};
}
