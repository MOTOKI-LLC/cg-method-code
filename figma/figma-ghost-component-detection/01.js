function buildNodesUrl(fileKey, nodeIds) {
  if (!fileKey || !Array.isArray(nodeIds) || nodeIds.length === 0)
    throw new Error("ファイルキーとノードIDが必要です");
  return "https://api.figma.com/v1/files/" + encodeURIComponent(fileKey) +
    "/nodes?depth=1&ids=" + encodeURIComponent(nodeIds.join(","));
}
function buildNodeMap(nodes) {
  const names = Object.create(null);
  const reviewIds = [], unavailableIds = [], childrenUnknownIds = [];
  for (const id of Object.keys(nodes || {})) {
    const entry = nodes[id];
    const doc = entry && entry.document;
    if (!doc) { unavailableIds.push(id); continue; }
    names[id] = doc.name;
    if (doc.type !== "COMPONENT") continue;
    if (!Array.isArray(doc.children)) childrenUnknownIds.push(id);
    else if (doc.children.length === 0) reviewIds.push(id);
  }
  return { names, reviewIds, unavailableIds, childrenUnknownIds };
}
