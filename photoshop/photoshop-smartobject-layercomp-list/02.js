#target photoshop

// 対象レイヤーを再帰的に収集
function collectAllLayers(layerCollection, result) {
    for (var i = 0; i < layerCollection.length; i++) {
        var layer = layerCollection[i];
        if (layer.typename === "ArtLayer") {
            result.push(layer);
        } else if (layer.typename === "LayerSet") {
            collectAllLayers(layer.layers, result);
        }
    }
}

// スマートオブジェクトのレイヤーカンプ一覧を取得
function getLayerCompsFromSmartObject(layer) {
    var list = [];

    try {
        var ref = new ActionReference();
        ref.putIdentifier(charIDToTypeID("Lyr "), layer.id);
        var desc = executeActionGet(ref);

        if (!desc.hasKey(stringIDToTypeID("smartObject"))) return [];

        var soDesc = desc.getObjectValue(stringIDToTypeID("smartObject"));

        if (!soDesc.hasKey(stringIDToTypeID("compsList"))) return [];

        var compsList = soDesc.getObjectValue(stringIDToTypeID("compsList")).getList(stringIDToTypeID("compList"));
        for (var i = 0; i < compsList.count; i++) {
            var comp = compsList.getObjectValue(i);
            var name = comp.getString(stringIDToTypeID("name"));
            var id = comp.getInteger(stringIDToTypeID("ID"));
            list.push({ name: name, id: id });
        }
    } catch (e) {
        // 無視（対象外）
    }

    return list;
}

// メイン処理
function main() {
    if (app.documents.length === 0) {
        alert("ドキュメントが開かれていません。");
        return;
    }

    var allLayers = [];
    collectAllLayers(app.activeDocument.layers, allLayers);

    var output = "スマートオブジェクトのレイヤーカンプ一覧：\n\n";
    var found = false;

    for (var i = 0; i < allLayers.length; i++) {
        var layer = allLayers[i];
        if (layer.kind === LayerKind.SMARTOBJECT) {
            var comps = getLayerCompsFromSmartObject(layer);
            if (comps.length > 0) {
                found = true;
                output += "【" + layer.name + "】\n";
                for (var j = 0; j < comps.length; j++) {
                    output += "  ・[" + comps[j].id + "] " + comps[j].name + "\n";
                }
                output += "\n";
            }
        }
    }

    if (!found) {
        alert("レイヤーカンプ付きスマートオブジェクトは見つかりませんでした。");
    } else {
        alert(output);
    }
}

main();
