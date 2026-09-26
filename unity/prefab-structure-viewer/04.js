<script>
let fullData = null;
let cy = null;

google.script.run.withSuccessHandler(init).getPrefabGraphData();

function init(data) {
  fullData = data;

  // プルダウン生成
  const prefabNames = [...new Set(data.nodes.map(n => n.id))].sort();
  const select = document.getElementById('prefabSelect');
  prefabNames.forEach(name => {
    const opt = document.createElement('option');
    opt.value = name;
    opt.textContent = name;
    select.appendChild(opt);
  });

  // プルダウン変更時
  select.addEventListener('change', () => {
    drawGraph(select.value);
  });

  // ラジオボタン変更時
  document.querySelectorAll('input[name="direction"]').forEach(r => {
    r.addEventListener('change', () => {
      drawGraph(select.value);
    });
  });

  drawGraph(); // 初期表示
}

function drawGraph(parentFilter = '') {
  const direction = document.querySelector('input[name="direction"]:checked').value;
  const els = [];
  const nodeMap = new Map();
  fullData.nodes.forEach(n => nodeMap.set(n.id, n));

  const targetNodeIds = new Set();

  // 親→子を辿る
  function collectDescendantsOneWay(currentId) {
    if (targetNodeIds.has(currentId)) return;
    targetNodeIds.add(currentId);

    fullData.edges.forEach(e => {
      if (e.source === currentId && !targetNodeIds.has(e.target)) {
        collectDescendantsOneWay(e.target);
      }
    });
  }

  // 子→親を辿る
  function collectAncestorsOneWay(currentId) {
    if (targetNodeIds.has(currentId)) return;
    targetNodeIds.add(currentId);

    fullData.edges.forEach(e => {
      if (e.target === currentId && !targetNodeIds.has(e.source)) {
        collectAncestorsOneWay(e.source);
      }
    });
  }

  if (parentFilter) {
    if (direction === 'down') {
      collectDescendantsOneWay(parentFilter);
    } else {
      collectAncestorsOneWay(parentFilter);
    }
  } else {
    fullData.nodes.forEach(n => targetNodeIds.add(n.id));
  }

  // ノード追加
  targetNodeIds.forEach(id => {
    const n = nodeMap.get(id);
    if (n) els.push({ data: { id: n.id, folder: n.folder, relation: n.relation } });
  });

  // エッジ追加
  const addedEdges = new Set();
  fullData.edges.forEach(e => {
    const key = `${e.source}->${e.target}`;
    if (
      targetNodeIds.has(e.source) &&
      targetNodeIds.has(e.target) &&
      !addedEdges.has(key)
    ) {
      els.push({ data: { source: e.source, target: e.target } });
      addedEdges.add(key);
    }
  });

  // ルート（入力のないノード）特定
  const hasIn = {};
  els.filter(el => el.data.target).forEach(el => hasIn[el.data.target] = true);
  const roots = Array.from(targetNodeIds).filter(id => !hasIn[id]);

  if (cy) cy.destroy();
  cy = cytoscape({
    container: document.getElementById('cy'),
    elements : els,
    layout   : {
      name: 'breadthfirst',
      roots: roots,
      spacingFactor: 1.5,
      padding: 10
    },
    style: window.cyStyle
  });
}
</script>
