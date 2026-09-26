figma.showUI(__html__, { width: 400, height: 400 });

figma.ui.onmessage = (msg) => {
  const selection = figma.currentPage.selection;
  const fileKey = msg.fileKey;

  if (selection.length === 0 || !fileKey) {
    figma.ui.postMessage({ error: "選択または fileKey がありません" });
    return;
  }

  const urls = selection.map((node) => {
    const nodeId = encodeURIComponent(node.id);
    return {
      name: node.name,
      url: `https://www.figma.com/file/${fileKey}?node-id=${nodeId}`,
    };
  });

  figma.ui.postMessage({ urls });
};
