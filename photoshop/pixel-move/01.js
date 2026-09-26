(function () {
    if (!app.documents.length) {
        alert("ドキュメントを開き、移動するレイヤーを選択してください。");
        return;
    }
    var layer = app.activeDocument.activeLayer;
    var dialog = new Window("dialog", "レイヤーの移動距離（px）");
    dialog.orientation = "column";
    dialog.alignChildren = "left";
    function field(label) {
        var row = dialog.add("group");
        row.add("statictext", undefined, label);
        return row.add("edittext", [0, 0, 100, 25], "0");
    }
    var x = field("横：右が＋、左が－");
    var y = field("縦：下が＋、上が－");
    var buttons = dialog.add("group");
    var ok = buttons.add("button", undefined, "移動", {name: "ok"});
    buttons.add("button", undefined, "キャンセル", {name: "cancel"});
    ok.onClick = function () {
        function number(text) {
            text = String(text).replace(/^\s+|\s+$/g, "");
            if (!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(text)) return null;
            var value = Number(text);
            return isFinite(value) ? value : null;
        }
        var dx = number(x.text);
        var dy = number(y.text);
        if (dx === null || dy === null) {
            alert("単位を付けず、有限の数値を両方の欄に入力してください。");
            return;
        }
        try {
            layer.translate(new UnitValue(dx, "px"), new UnitValue(dy, "px"));
            dialog.close(1);
        } catch (error) {
            alert("移動できませんでした。レイヤーのロックや選択状態を確認してください。\n" + error.message);
        }
    };
    dialog.center();
    x.active = true;
    dialog.show();
}());
