(function () {
  try {
    if (app.documents.length === 0) throw new Error("ドキュメントを開いてください。");
    var doc = app.activeDocument;
    var parent = uniqueLayer(doc.layers, "親");
    var child = uniqueLayer(parent.layers, "子");
    var target = uniqueLayer(child.layers, "孫");
    requireEditable(target);
    doc.activeLayer = target;
  } catch (e) { alert(String(e)); }
function uniqueLayer(layers, name) {
  var found = null;
  for (var i = 0; i < layers.length; i++) {
    if (layers[i].name === name) {
      if (found !== null) throw new Error("同名レイヤーが複数あります: " + name);
      found = layers[i];
    }
  }
  if (found === null) throw new Error("レイヤーがありません: " + name);
  return found;
}
function requireEditable(node) {
  while (node && node.typename !== "Document") {
    if (node.locked || node.hidden || (node.typename === "Layer" && !node.visible))
      throw new Error("ロック・非表示の対象があります。");
    node = node.parent;
  }
}
}());
