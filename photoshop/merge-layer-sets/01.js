(function () {
    if (app.documents.length === 0) {
        alert("ドキュメントを開いてください。");
        return;
    }
    var selected = app.activeDocument.activeLayer;
    if (selected.typename !== "LayerSet") {
        alert("統合するグループを選択してください。");
        return;
    }
    var originalName = selected.name;
    try {
        var merged = selected.merge();
        merged.name = originalName;
    } catch (e) {
        alert("統合できませんでした。レイヤーの状態を確認してください。\n" + e.message);
    }
}());
