// 現在のドキュメントを取得
var doc = app.activeDocument;

// レイヤーが存在するか確認
if (doc.layers.length > 0) {
    // 一番上のレイヤーを取得してアクティブにする
    doc.activeLayer = doc.layers[doc.layers.length - 1];
} else {
    alert("レイヤーが存在しません。");
}
