(function () {
  try {
    if (app.documents.length === 0) throw new Error("ドキュメントを開いてください。");
    var doc = app.activeDocument;
    var selection = doc.selection;
    if (!selection || !(selection instanceof Array) || selection.length === 0)
      throw new Error("選択ツールでオブジェクト全体を選んでください。");
    var target = uniqueLayer(doc.layers, "まとめ");
    requireEditable(target);
    var items = [];
    for (var i = 0; i < selection.length; i++) {
      var item = selection[i];
      if (!item || typeof item.move !== "function" || item.typename === "TextRange" || item.typename === "InsertionPoint")
        throw new Error("文字編集中など、対象外の選択です。");
      if (item.parent.typename !== "Layer")
        throw new Error("グループ内の部分選択は対象外です。グループ全体を選んでください。");
      requireEditable(item);
      items.push(item);
    }
    for (var j = items.length - 1; j >= 0; j--)
      items[j].move(target, ElementPlacement.PLACEATBEGINNING);
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
