// 現在のドキュメントを取得
var doc = app.activeDocument;

// レイヤーを指定して取得する関数
function getLayerByName(layerName) {
    try {
        return doc.layers.getByName(layerName);
    } catch (e) {
        alert("レイヤー名 '" + layerName + "' は存在しません。");
        return null;
    }
}

// 指定したレイヤー名を取得（デフォルトは "背景"）
var targetLayer = getLayerByName("背景");

if (targetLayer) {
    doc.activeLayer = targetLayer;
}
