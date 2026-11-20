figma.showUI(__html__, { width: 350, height: 520 });
function normalizeId(raw) {
  const fields = String(raw || "").trim().split("\t");
  const id = fields[fields.length-1].trim();
  return /^\d+-\d+$/.test(id) ? id.replace("-", ":") : id;
}
function pageOf(node) {
  let n = node;
  while (n && n.type !== "PAGE") n = n.parent;
  return n;
}
function reportSelection() {
  figma.ui.postMessage({ type: "selected-ids", ids: figma.currentPage.selection.map(n => n.name.replace(/[\t\r\n]/g," ")+"\t"+n.id) });
}
let busy = false;
figma.ui.onmessage = async msg => {
  if (!msg || busy) return;
  if (msg.type === "get-selected-ids") { reportSelection(); return; }
  if (msg.type !== "select-by-id" || !Array.isArray(msg.ids)) return;
  busy = true;
  try {
    const ids = Array.from(new Set(msg.ids.map(normalizeId).filter(Boolean)));
    const nodes = []; let page = null, skipped = 0;
    for (const id of ids) {
      let node;
      try { node = await figma.getNodeByIdAsync(id); } catch (_) { skipped++; continue; }
      if (!node || !("visible" in node)) { skipped++; continue; }
      const p = pageOf(node);
      if (!p || (page && p.id !== page.id)) { skipped++; continue; }
      page = p; nodes.push(node);
    }
    if (nodes.length) {
      await figma.setCurrentPageAsync(page);
      figma.currentPage.selection = nodes;
      figma.viewport.scrollAndZoomIntoView(nodes);
    }
    figma.ui.postMessage({ type: "selection-result", selected: nodes.length, skipped });
    reportSelection();
  } catch (_) { figma.ui.postMessage({ type: "selection-error", message: "ページ切り替え・選択・表示のいずれかで失敗しました。現在の選択を確認してください。" }); }
  finally { busy = false; }
};
figma.on("selectionchange", reportSelection);
