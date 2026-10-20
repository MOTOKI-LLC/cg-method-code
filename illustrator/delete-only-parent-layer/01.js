(function () {
  try {
    if (app.documents.length === 0) throw new Error("ドキュメントを開いてください。");
    var doc = app.activeDocument;
    var parent = doc.activeLayer;
    if (parent.parent !== doc) throw new Error("最上位の親レイヤーをアクティブにしてください。");
    checkTree(parent);
    if (parent.layers.length === 0) throw new Error("子レイヤーがありません。");
    for (var i = 0; i < parent.pageItems.length; i++) {
      if (parent.pageItems[i].parent === parent)
        throw new Error("親の直下にオブジェクトがあります。削除せず終了します。");
    }
    var children = [];
    for (var j = 0; j < parent.layers.length; j++) children.push(parent.layers[j]);
    if (!confirm("コピーしたデータですか？\n親「" + parent.name + "」の子 " + children.length +
      " 件を最上位へ移し、親だけを削除します。\n親の外観・透明度が不要なことも確認してください。")) return;
    for (var k = 0; k < children.length; k++)
      children[k].move(parent, ElementPlacement.PLACEBEFORE);
    if (parent.layers.length !== 0 || parent.pageItems.length !== 0)
      throw new Error("親の中に項目が残っています。親は削除しません。");
    parent.remove();
    alert("親を削除しました。子の階層・重なり・外観を確認してから保存してください。");
  } catch (e) {
    alert(String(e) + "\n途中で失敗した場合、一部の移動が残る可能性があります。保存せず状態を確認してください。");
  }
  function checkTree(layer) {
    if (layer.locked || !layer.visible)
      throw new Error("ロック・非表示・編集不可のレイヤーがあります。");
    for (var i = 0; i < layer.layers.length; i++) checkTree(layer.layers[i]);
  }
}());
