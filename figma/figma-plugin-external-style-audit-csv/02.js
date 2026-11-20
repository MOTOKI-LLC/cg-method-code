figma.showUI(__html__, { width: 360, height: 210 });
let busy = false;

function csvCell(value) {
  let text = String(value == null ? '' : value);
  if (/^[=+@\-\t\r\n]/.test(text)) text = "'" + text;
  return '"' + text.replace(/"/g, '""') + '"';
}

async function audit(scope) {
  if (scope === 'all') await figma.loadAllPagesAsync();
  const cache = new Map();
  const rows = [];
  async function resolve(id) {
    if (!cache.has(id)) {
      cache.set(id, figma.getStyleByIdAsync(id).then(style => {
        if (!style) return { status: 'unresolved', name: '', key: '' };
        return { status: style.remote ? 'external' : 'local',
          name: style.name, key: style.key };
      }).catch(() => ({ status: 'unresolved', name: '', key: '' })));
    }
    return cache.get(id);
  }
  async function inspect(node, pageName) {
    const refs = new Map();
    function add(id, type) {
      if (typeof id === 'string' && id) refs.set(type + ':' + id, { id, type });
    }
    for (const [property, type] of [
      ['fillStyleId', 'Fill'], ['strokeStyleId', 'Stroke'],
      ['effectStyleId', 'Effect'], ['gridStyleId', 'Grid'],
      ['textStyleId', 'Text']
    ]) {
      if (property in node) add(node[property], type);
    }
    if (node.type === 'TEXT' && node.characters.length > 0) {
      for (const segment of node.getStyledTextSegments(['textStyleId', 'fillStyleId'])) {
        add(segment.textStyleId, 'Text');
        add(segment.fillStyleId, 'Fill');
      }
    }
    for (const ref of refs.values()) {
      const style = await resolve(ref.id);
      if (style.status !== 'local') {
        rows.push([pageName, node.name, node.id, ref.type,
          ref.id, style.name, style.key, style.status]);
      }
    }
  }
  async function walk(node, pageName) {
    await inspect(node, pageName);
    if ('children' in node) {
      for (const child of node.children) await walk(child, pageName);
    }
  }
  const pages = scope === 'all' ? figma.root.children : [figma.currentPage];
  for (const page of pages) await walk(page, page.name);
  const headers = ['Page', 'Layer', 'Node ID', 'Type', 'Style ID',
    'Style Name', 'Style Key', 'Status'];
  const csv = [headers, ...rows].map(row => row.map(csvCell).join(',')).join('\r\n');
  return { csv, count: rows.length,
    unresolved: rows.filter(row => row[7] === 'unresolved').length };
}

figma.ui.onmessage = async msg => {
  if (!msg || msg.type !== 'export' || busy) return;
  if (msg.scope !== 'current' && msg.scope !== 'all') return;
  busy = true;
  try {
    const result = await audit(msg.scope);
    figma.ui.postMessage({ type: 'result', ...result });
  } catch (error) {
    figma.ui.postMessage({ type: 'error',
      message: '走査に失敗しました。完了した監査として扱わず、コンソールを確認してください。' });
    console.error(error);
  } finally {
    busy = false;
  }
};
