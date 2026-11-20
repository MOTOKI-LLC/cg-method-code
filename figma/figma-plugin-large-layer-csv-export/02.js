figma.showUI(__html__, { width: 440, height: 260 });
let busy = false, cancelled = false;
const yieldTask = () => new Promise(resolve => setTimeout(resolve, 0));
function getLayerPath(node) {
  const names = []; let n = node;
  while (n && n.type !== "PAGE" && n.type !== "DOCUMENT") { names.unshift(n.name); n = n.parent; }
  return names.join(" / ");
}
figma.ui.onmessage = async msg => {
  if (!msg) return;
  if (msg.type === "cancel") { cancelled = true; return; }
  if (msg.type !== "start" || busy) return;
  busy = true; cancelled = false;
  figma.ui.postMessage({ type: "reset" });
  let visited = 0, produced = 0;
  const seen = new Set();
  try {
    const pages = Array.from(figma.root.children);
    for (let pi = 0; pi < pages.length && !cancelled; pi++) {
      const page = pages[pi];
      figma.ui.postMessage({ type: "progress", page: page.name, pages: pages.length, currentPage: pi+1, visited, produced });
      await page.loadAsync();
      const stack = Array.from(page.children).reverse();
      while (stack.length && !cancelled) {
        const rows = [];
        for (let batch = 0; batch < 200 && stack.length && !cancelled; batch++) {
          const node = stack.pop();
          if (node.removed) continue;
          visited++;
          if (node.type === "COMPONENT" && !seen.has(node.id)) {
            seen.add(node.id);
            const parent = node.parent;
            const inSet = parent && parent.type === "COMPONENT_SET";
            rows.push({ parentName: inSet ? parent.name : node.name, parentId: inSet ? parent.id : node.id,
              variantName: inSet ? node.name : "", variantId: inSet ? node.id : "", path: getLayerPath(node) });
          }
          if ("children" in node)
            for (let i = node.children.length-1; i >= 0; i--) stack.push(node.children[i]);
        }
        if (rows.length) { produced += rows.length; figma.ui.postMessage({ type: "append", rows }); }
        figma.ui.postMessage({ type: "progress", page: page.name, pages: pages.length, currentPage: pi+1, visited, produced });
        await yieldTask();
      }
    }
    figma.ui.postMessage({ type: "done", cancelled, produced });
  } catch (_) { figma.ui.postMessage({ type: "error", message: "走査に失敗しました。途中のCSVは全件ではありません。" }); }
  finally { busy = false; }
};
