/* Code.gs  ─ サーバー側ロジック */

function doGet() {
  return HtmlService.createTemplateFromFile('index').evaluate().setTitle('Prefab Viewer');
}
function include(f) { return HtmlService.createHtmlOutputFromFile(f).getContent(); }

/* スプレッドシート → ノード／エッジ構造 */
function getPrefabGraphData() {
  const sh   = SpreadsheetApp.getActive().getSheetByName('シート1');
  const rows = sh.getDataRange().getValues().slice(1);        // ヘッダー除去

  const relPrio = { Base: 3, Variant: 2, Nested: 1 };
  const nodes   = new Map();                                   // id → { id, folder, relation }
  const edges   = [];                                          // { source(child), target(parent) }

  /** ノードを追加／更新  
   *  ・フォルダは“最初に付いた値”を優先（Common があとで Dialog に書き換わらない）  
   *  ・relation は Base > Variant > Nested 優先 */
  function upsert(id, folder, rel) {
    if (!id) return;
    const ex = nodes.get(id);
    if (!ex) {
      nodes.set(id, { id, folder, relation: rel });
    } else {
      if (ex.folder === 'その他') ex.folder = folder;          // まだ未確定なら書き換え
      if (relPrio[rel] > relPrio[ex.relation]) ex.relation = rel;
    }
  }

  rows.forEach(r => {
    const parent = String(r[0] || '').trim();                  // 親Prefab名
    const folder = String(r[1] || 'その他').trim();            // フォルダ名
    const child  = String(r[2] || '').trim();                  // 子Prefab名
    const rel    = String(r[3] || '').trim();                  // 関係種別

    // 親ノード（自身が Base なら Base、Variant 行なら Variant、通常行なら Nested）
    const parentRel = rel === 'Base' ? 'Base' :
                      rel === 'Variant' ? 'Variant' : 'Nested';
    upsert(parent, folder, parentRel);

    // 子ノード + エッジ（子 → 親）※子フォルダは未知なので「その他」で仮登録
    if (child) {
      const childRel = (rel === 'Variant') ? 'Base' : 'Nested';  // 子は Base(派生元) か Nested
      upsert(child, 'その他', childRel);
      edges.push({ source: child, target: parent });
    }
  });

  return { nodes: [...nodes.values()], edges };
}
