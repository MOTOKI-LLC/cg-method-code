var doc = activeDocument;
var layers = doc.layers;
var arr = [];
layers[layers.length - 1].isBackgroundLayer = false; //背景レイヤーの解除

doc.suspendHistory("ヒストリー名", "main()");

function main() {
    getLayerName(activeDocument);
    var list = arr.join("\n");
    alert(list);
}

function getLayerName(parent) {
    var childLayers = parent.layers;
    for (var i = 0; i < childLayers.length; i++) {
        if (childLayers[i].typename == "LayerSet") {
            getLayerName(childLayers[i]);
        }
        arr.push(childLayers[i].name);
    }
}
