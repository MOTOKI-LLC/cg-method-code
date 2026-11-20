figma.showUI(__html__, { width: 400, height: 400 });
function linkRows(fileKey, nodes) {
  if (!/^[A-Za-z0-9]+$/.test(fileKey)) throw new Error("ファイルキーを確認してください");
  return nodes.map(node => ({ name: node.name, url: "https://www.figma.com/design/" +
    encodeURIComponent(fileKey) + "?node-id=" + encodeURIComponent(node.id) }));
}
figma.ui.onmessage = msg => {
  if (!msg || typeof msg.fileKey !== "string") return;
  try {
    const selection = figma.currentPage.selection;
    if (!selection.length) throw new Error("レイヤーを選択してください");
    figma.ui.postMessage({ urls: linkRows(msg.fileKey.trim(), selection) });
  } catch (e) { figma.ui.postMessage({ error: e.message }); }
};
