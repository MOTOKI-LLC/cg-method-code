<script type="module">
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

/* ===== 設定値 ===== */
const sheetUrl =
  "https://docs.google.com/spreadsheets/d/★ここにスプレッドシートのID/gviz/tq?tqx=out:json";
const rectSize = { width: 100, height: 30 };
const space    = { width: 140, height: 60, padding: 30 };
const gap      = { x: 40, y: 60 };

/* ===== スプレッドシート → 階層データ ===== */
const buildTree = (rows) => {
  const map = new Map(), childrenMap = new Map();

  rows.forEach((r) => {
    const nodeId = r.c[1]?.v;
    const parentId = r.c[2]?.v || null;
    const name = r.c[3]?.v;
    const comps = r.c[4]?.v || "";

    if (!nodeId || !name) return;

    map.set(nodeId, {
      name,
      comps,
      children: []
    });

    if (parentId) {
      if (!childrenMap.has(parentId)) childrenMap.set(parentId, []);
      childrenMap.get(parentId).push(nodeId);
    }
  });

  childrenMap.forEach((childIds, pid) => {
    if (!map.has(pid)) return;
    childIds.forEach((cid) => map.get(pid).children.push(map.get(cid)));
  });

  return [...map.keys()].filter(
    id => !rows.some(r => r.c[1]?.v === id && r.c[2]?.v)
  ).map(id => map.get(id));
};

/* ===== 座標計算（Y位置） ===== */
const seekParent = (cur, name) => {
  const hrcy = cur.parent.children;
  const tgt = hrcy.find((c) => c.data.name === name);
  return tgt ? { name, hierarchy: hrcy } : seekParent(cur.parent, name);
};
const calcLeaves = (names, cur) => {
  const hs = names.map((n) => seekParent(cur, n));
  const idxs = hs.map((h) => h.hierarchy.findIndex((d) => d.data.name === h.name));
  const sliced = hs.map((h, i) => h.hierarchy.slice(0, idxs[i]));
  return sliced.flat().map((d) => d.value);
};
const defineY = (d, sp) => {
  const leaves = calcLeaves(d.ancestors().map((a) => a.data.name).slice(0, -1), d);
  return leaves.reduce((s, v) => s + v, 0) * sp.height + sp.padding;
};
const definePos = (root, sp) => {
  root.each((d) => {
    d.x = d.depth * sp.width + sp.padding;
    d.y = defineY(d, sp);
  });
};

/* ===== テキスト自動縮小 ===== */
function fitText(textSel, maxWidth, minFont = 6){
  textSel.each(function(){
    const text = d3.select(this);
    let fontSize = parseInt(text.style("font-size")) || 12;
    while (this.getComputedTextLength() > maxWidth && fontSize > minFont){
      fontSize -= 1;
      text.style("font-size", `${fontSize}px`);
    }
  });
}

/* ===== メイン処理 ===== */
fetch(sheetUrl)
  .then((res) => res.text())
  .then((txt) => JSON.parse(txt.match(/google\.visualization\.Query\.setResponse\((.*)\)/s)[1]))
  .then((json) => {
    const rows = json.table.rows.slice(1);
    const trees = buildTree(rows);

    const svg = d3.select("svg");
    const svgWidth = +svg.attr("width") || window.innerWidth;

    let xOffset = 0, yOffset = 0, rowMaxHeight = 0;

    trees.forEach((data) => {
      const root = d3.hierarchy(data);
      d3.tree()(root);
      root.count();
      definePos(root, space);

      const treeWidth =
        (root.height + 1) * space.width + space.padding * 2;
      const treeHeight =
        root.value * rectSize.height +
        (root.value - 1) * (space.height - rectSize.height) +
        space.padding * 2;

      // 折り返し処理
      if (xOffset + treeWidth > svgWidth) {
        xOffset = 0;
        yOffset += rowMaxHeight + gap.y;
        rowMaxHeight = 0;
      }

      const g = svg.append("g")
        .attr("transform", `translate(${xOffset},${yOffset})`);
      xOffset += treeWidth + gap.x;
      rowMaxHeight = Math.max(rowMaxHeight, treeHeight);

      // エッジ描画
      g.selectAll(".link")
        .data(root.descendants().slice(1))
        .enter()
        .append("path")
        .attr("fill", "none")
        .attr("stroke", "#000")
        .attr("d", (d) => {
          const yC = d.y + rectSize.height / 2;
          const yP = d.parent.y + rectSize.height / 2;
          const xM = d.parent.x + rectSize.width + (space.width - rectSize.width) / 2;
          return `M${d.x},${yC} L${xM},${yC} L${xM},${yP} L${d.parent.x + rectSize.width},${yP}`;
        });

      // ノード描画
      const node = g.selectAll(".node")
        .data(root.descendants())
        .enter()
        .append("g")
        .attr("class", "node")
        .attr("transform", (d) => `translate(${d.x},${d.y})`);

      const tooltip = d3.select("#tooltip");

      node
        .on("mouseenter", (event, d) => {
          tooltip
            .style("display", "block")
            .text(d.data.comps || "（コンポーネントなし）");
        })
        .on("mousemove", (event) => {
          tooltip
            .style("left", `${event.pageX + 10}px`)
            .style("top", `${event.pageY + 10}px`);
        })
        .on("mouseleave", () => {
          tooltip.style("display", "none");
        });

      node.append("rect")
        .attr("width", rectSize.width)
        .attr("height", rectSize.height)
        .attr("fill", "#fff")
        .attr("stroke", "#333");

      const txt = node.append("text")
        .text(d => d.data.name)
        .attr("x", 6)
        .attr("y", 20);

      // ツールチップ追加（SVG標準）
      txt.append("title").text(d => d.data.comps || "（コンポーネントなし）");

      fitText(txt, rectSize.width - 8);
    });

    svg.attr("height", yOffset + rowMaxHeight + space.padding);
  });
</script>
