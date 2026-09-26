// 一つ上の表示レイヤーを選択
function selectLayerForward() {
    try {
        var desc = new ActionDescriptor();
        var ref = new ActionReference();
        ref.putEnumerated(
            charIDToTypeID("Lyr "), 
            charIDToTypeID("Ordn"), 
            charIDToTypeID("Frwr") // 1つ上のレイヤーへ移動
        );
        desc.putReference(charIDToTypeID("null"), ref);
        desc.putBoolean(charIDToTypeID("MkVs"), false); // 可視状態を変更しない
        executeAction(charIDToTypeID("slct"), desc, DialogModes.NO);
    } catch (e) {
        alert("これ以上上のレイヤーはありません。");
    }
}

// スクリプトを実行
selectLayerForward();
