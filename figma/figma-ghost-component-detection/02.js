// 空のコンポーネントは確認候補にし、自動削除しない。
function buildNodeMap(nodes) {
  var outMap = {};
  var reviewIds = [];
  var unavailableIds = [];
  Object.keys(nodes || {}).forEach(function (id) {
    var entry = nodes[id];
    var doc = entry && entry.document;
    if (!doc) { unavailableIds.push(id); return; }
    outMap[id] = doc.name;
    if (doc.type === 'COMPONENT' &&
        Array.isArray(doc.children) && doc.children.length === 0) {
      reviewIds.push(id);
    }
  });
  return { names: outMap, reviewIds: reviewIds, unavailableIds: unavailableIds };
}
