var doc = activeDocument;
var layers = doc.layers;
var arr = [];
layers[layers.length - 1].isBackgroundLayer = false;//背景レイヤーの解除

doc.suspendHistory("ヒストリー名", "main()");

function main() {
    getLayerName();
    var list = arr.join("\n");
    alert(list);
}

function getLayerName() {
    for (var i = 0; i < layers.length; i++) {
        var item = layers[i];
        var name = item.name;
        arr.push(name);
    }
    re
