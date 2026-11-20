figma.showUI(__html__, { width: 480, height: 560 });
let busy = false;
let reviewed = new Map();
figma.ui.onmessage = async msg => {
  if (!msg || !["scan", "rename-all", "focus"].includes(msg.type)) return;
  if (busy) return;
  busy = true;
  try {
    if (msg.type === "scan") {
      reviewed.clear();
      const unique = new Map();
      const selection = figma.currentPage.selection;
      const roots = selection.length ? selection : [figma.currentPage];
      for (const root of roots) {
        if (root.type === "INSTANCE") unique.set(root.id, root);
        if ("findAllWithCriteria" in root)
          for (const n of root.findAllWithCriteria({ types: ["INSTANCE"] })) unique.set(n.id, n);
      }
      const cache = new Map();
      let skipped = 0, fallback = 0;
      for (const instance of unique.values()) {
        try {
          const main = await instance.getMainComponentAsync();
          if (!main) { skipped++; continue; }
          let mainName = main.name, source = "参照元";
          if (main.remote) {
            if (!cache.has(main.key)) cache.set(main.key,
              figma.importComponentByKeyAsync(main.key).then(c => c.name).catch(() => null));
            const published = await cache.get(main.key);
            if (published !== null) { mainName = published; source = "公開ライブラリ"; }
            else { fallback++; source = "参照元（公開情報取得不可）"; }
          }
          if (instance.name !== mainName)
            reviewed.set(instance.id, { instanceId: instance.id, instanceName: instance.name,
              mainName, referenceName: main.name, componentKey: main.key, mainId: main.id, source });
        } catch (_) { skipped++; }
      }
      figma.ui.postMessage({ type: "scan-result", results: Array.from(reviewed.values()), skipped, fallback });
    } else if (msg.type === "rename-all") {
      let updated = 0, skipped = 0;
      const ids = Array.isArray(msg.ids) ? Array.from(new Set(msg.ids)) : [];
      for (const id of ids) {
        const row = reviewed.get(id);
        if (!row) { skipped++; continue; }
        try {
          const node = await figma.getNodeByIdAsync(id);
          if (!node || node.type !== "INSTANCE" || node.name !== row.instanceName) { skipped++; continue; }
          const main = await node.getMainComponentAsync();
          if (!main || main.id !== row.mainId || main.key !== row.componentKey ||
              main.name !== row.referenceName || node.name !== row.instanceName) { skipped++; continue; }
          node.name = row.mainName;
          updated++;
        } catch (_) { skipped++; }
      }
      reviewed.clear();
      figma.ui.postMessage({ type: "renamed", updated, skipped });
    } else {
      if (!reviewed.has(msg.instanceId)) return;
      const node = await figma.getNodeByIdAsync(msg.instanceId);
      if (node && node.type === "INSTANCE") {
        figma.currentPage.selection = [node];
        figma.viewport.scrollAndZoomIntoView([node]);
      }
    }
  } catch (_) { figma.ui.postMessage({ type: "error", message: "取得または変更に失敗しました。再スキャンしてください。" }); }
  finally { busy = false; }
};
