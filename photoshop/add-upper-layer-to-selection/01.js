function selectAddAboveLayer() {
    var groupStartIdx = getActiveLayerIndex();
    var groupEndIdx = groupStartIdx + 1; // 1つ上のレイヤーのインデックス

    function getActiveLayerIndex() {
        var ref = new ActionReference();
        ref.putProperty(charIDToTypeID("Prpr"), charIDToTypeID("ItmI"));
        ref.putEnumerated(charIDToTypeID("Lyr "), charIDToTypeID("Ordn"), charIDToTypeID("Trgt"));
        var res = executeActionGet(ref).getInteger(charIDToTypeID("ItmI"));
        return res;
    }

    // 最上位のレイヤーを超えないようにチェック
    if (groupEndIdx > getMaxLayerIndex()) {
        alert("これ以上上にレイヤーはありません。");
        return;
    }

    var idslct = charIDToTypeID("slct");
    var desc270 = new ActionDescriptor();
    var idnull = charIDToTypeID("null");
    var ref210 = new ActionReference();
    var idLyr = charIDToTypeID("Lyr ");
    ref210.putIndex(idLyr, groupStartIdx);
    desc270.putReference(idnull, ref210);
    var idMkVs = charIDToTypeID("MkVs");
    desc270.putBoolean(idMkVs, false);
    var idLyrI = charIDToTypeID("LyrI");
    var list166 = new ActionList();
    list166.putInteger(groupStartIdx);
    desc270.putList(idLyrI, list166);
    executeAction(idslct, desc270, DialogModes.NO);

    var desc271 = new ActionDescriptor();
    var ref211 = new ActionReference();
    ref211.putIndex(idLyr, groupEndIdx);
    desc271.putReference(idnull, ref211);
    var idselectionModifier = stringIDToTypeID("selectionModifier");
    var idselectionModifierType = stringIDToTypeID("selectionModifierType");
    var idaddToSelection = stringIDToTypeID("addToSelection");
    desc271.putEnumerated(idselectionModifier, idselectionModifierType, idaddToSelection);
    desc271.putBoolean(idMkVs, false);
    var list167 = new ActionList();
    list167.putInteger(groupStartIdx);
    list167.putInteger(groupEndIdx);
    desc271.putList(idLyrI, list167);
    executeAction(idslct, desc271, DialogModes.NO);
}

// 最上位のレイヤーのインデックスを取得する関数
function getMaxLayerIndex() {
    var ref = new ActionReference();
    ref.putProperty(charIDToTypeID("Prpr"), charIDToTypeID("ItmI"));
    ref.putEnumerated(charIDToTypeID("Lyr "), charIDToTypeID("Ordn"), charIDToTypeID("Frnt"));
    return executeActionGet(ref).getInteger(charIDToTypeID("ItmI"));
}

// スクリプトを実行
selectAddAboveLayer();
