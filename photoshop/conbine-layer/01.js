app.bringToFront();

if (app.documents.length === 0) {
    // ドキュメントが開かれていない場合は処理をしない。
} else {
    var doc = activeDocument;
    
    // グローバルなレイヤーリスト（全レイヤー、選択レイヤー、結合対象レイヤー）
    var allLayers = [];
    var selectedLayers = [];
    var targetLayers = [];

    // 全レイヤーを再帰的に収集
    collectAllLayers(doc);

    // 選択レイヤーを取得
    collectSelectedLayers(selectedLayers);

    // 全レイヤーから選択レイヤーを除外し、結合対象レイヤーを決定
    filterTargetLayers(targetLayers);

    if (selectedLayers == null || allLayers == null) {
        alert("結合させるレイヤーを選択してください。\n処理をキャンセルします。");
    } else {
        // 結合対象レイヤーに非表示レイヤーがある場合は処理中断
        var allVisible = true;
        for (var i = 0; i < targetLayers.length; i++) {
            if (!targetLayers[i].visible) {
                allVisible = false;
                break;
            }
        }
        if (!allVisible) {
            alert("結合対象のレイヤーに非表示のレイヤーがあります。\n非表示レイヤーは結合できませんので、削除するか表示状態にしてください。\n\n処理をキャンセルします。");
        } else {
            var message = "";
            for (var i = 0; i < selectedLayers.length; i++) {
                message += selectedLayers[i].name + " [" + (selectedLayers.length - i) + "]\n";
            }
            message += "をすべてのレイヤーに結合します。（[]内の数字は結合順）\n\nよろしいですか？\n\n【注意】\n結合させたい効果レイヤーは全てレイヤーの一番上に配置してください。";

            if (confirm(message)) {
                doc.suspendHistory("結合処理", "mergeLayers()");
                alert("結合が完了しました。\n効果レイヤーは非表示にしています。");
            } else {
                alert("処理がキャンセルされました。");
            }
        }
    }
}

// 各結合対象レイヤーに対して、選択レイヤーを複製・移動・結合する
function mergeLayers() {
    for (var i = 0; i < targetLayers.length; i++) {
        var backIndex = selectedLayers.length - 1;
        for (var j = 0; j < selectedLayers.length; j++) {
            selectedLayers[backIndex - j].duplicate();
            doc.activeLayer = activeDocument.layers[backIndex - j];
            activeDocument.layers[backIndex - j].move(targetLayers[i], ElementPlacement.PLACEBEFORE);

            try {
                // レイヤークリッピング処理
                var idGrpL = charIDToTypeID("GrpL");
                var desc = new ActionDescriptor();
                var idnull = charIDToTypeID("null");
                var ref = new ActionReference();
                var idLyr = charIDToTypeID("Lyr ");
                var idOrdn = charIDToTypeID("Ordn");
                var idTrgt = charIDToTypeID("Trgt");
                ref.putEnumerated(idLyr, idOrdn, idTrgt);
                desc.putReference(idnull, ref);
                executeAction(idGrpL, desc, DialogModes.NO);
            } catch (e) {
                // クリッピング処理失敗時は無視
            }
            doc.activeLayer.merge();
        }
    }
    // 結合後、元の選択レイヤーを非表示にする
    for (var i = 0; i < selectedLayers.length; i++) {
        selectedLayers[i].visible = false;
    }
}

// 選択レイヤーを収集（グループ化イベントを利用）
function collectSelectedLayers(selectedLayersArray) {
    if (doc.activeLayer) {
        var idGrp = stringIDToTypeID("groupLayersEvent");
        var descGrp = new ActionDescriptor();
        var refGrp = new ActionReference();
        refGrp.putEnumerated(charIDToTypeID("Lyr "), charIDToTypeID("Ordn"), charIDToTypeID("Trgt"));
        descGrp.putReference(charIDToTypeID("null"), refGrp);
        executeAction(idGrp, descGrp, DialogModes.ALL);

        for (var i = 0; i < doc.activeLayer.layers.length; i++) {
            selectedLayersArray.push(doc.activeLayer.layers[i]);
        }
        undoAction();
    }
}

// アクションを元に戻す
function undoAction() {
    executeAction(charIDToTypeID("undo"), undefined, DialogModes.NO);
}

// 全レイヤーから選択レイヤーを除外し、結合対象のレイヤーリストを作成
function filterTargetLayers(targetLayersArray) {
    for (var i = 0; i < allLayers.length; i++) {
        var isSelected = false;
        for (var j = 0; j < selectedLayers.length; j++) {
            if (allLayers[i].name === selectedLayers[j].name) {
                isSelected = true;
                break;
            }
        }
        if (!isSelected) {
            targetLayersArray.push(allLayers[i]);
        }
    }
}

// 再帰的に全レイヤーを収集
function collectAllLayers(layerContainer) {
    var childLayers = layerContainer.layers;
    for (var i = 0; i < childLayers.length; i++) {
        if (childLayers[i].typename === "LayerSet") {
            // レイヤーセットの場合は再帰処理
            collectAllLayers(childLayers[i]);
        } else if (childLayers[i].typename === "ArtLayer") {
            allLayers.push(childLayers[i]);
        }
    }
}
