// 1つ下のレイヤーを追加選択
function selectAddBelowLayer() {
    var currentLayerIndex = getActiveLayerIndex(); // 現在のレイヤーのインデックス
    var belowLayerIndex = currentLayerIndex - 1; // 1つ下のレイヤーのインデックス

    // 最下層のレイヤーの場合、処理を中止
    if (belowLayerIndex < 1) {
        alert("これ以上下にレイヤーはありません。");
        return;
    }

    // 1つ下のレイヤーを選択
    selectLayerByIndex(belowLayerIndex, false);

    // 1つ下のレイヤーを追加選択
    addLayerToSelection(belowLayerIndex);
}

// 現在のアクティブなレイヤーのインデックスを取得
function getActiveLayerIndex() {
    var ref = new ActionReference();
    ref.putProperty(charIDToTypeID("Prpr"), charIDToTypeID("ItmI"));
    ref.putEnumerated(charIDToTypeID("Lyr "), charIDToTypeID("Ordn"), charIDToTypeID("Trgt"));
    return executeActionGet(ref).getInteger(charIDToTypeID("ItmI"));
}

// 指定したインデックスのレイヤーを選択（可視状態を変更しない）
function selectLayerByIndex(layerIndex, makeVisible) {
    var desc = new ActionDescriptor();
    var ref = new ActionReference();
    ref.putIndex(charIDToTypeID("Lyr "), layerIndex);
    desc.putReference(charIDToTypeID("null"), ref);
    desc.putBoolean(charIDToTypeID("MkVs"), makeVisible);
    executeAction(charIDToTypeID("slct"), desc, DialogModes.NO);
}

// 指定したインデックスのレイヤーを追加選択
function addLayerToSelection(layerIndex) {
    var desc = new ActionDescriptor();
    var ref = new ActionReference();
    ref.putIndex(charIDToTypeID("Lyr "), layerIndex);
    desc.putReference(charIDToTypeID("null"), ref);
    desc.putEnumerated(
        stringIDToTypeID("selectionModifier"),
        stringIDToTypeID("selectionModifierType"),
        stringIDToTypeID("addToSelection")
    );
    desc.putBoolean(charIDToTypeID("MkVs"), false);
    executeAction(charIDToTypeID("slct"), desc, DialogModes.NO);
}

// スクリプトを実行
selectAddBelowLayer();
