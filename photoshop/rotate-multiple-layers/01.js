var doc = activeDocument;
var lay = doc.layers;
doc.activeLayer = lay[lay.length - 1]
doc.suspendHistory("指定名レイヤー名から回転", "main(doc)");

function main(parent) {
  var childLayers = parent.layers;
  var win = new Window("palette", "loading…");
  var max = childLayers.length;
  win.progressbar = win.add("Progressbar", [10, 10, 300, 20], 0, max);
  win.center();
  win.show();
  for (var i = 0; i < childLayers.length; i++) {
    if (childLayers[i].typename == "LayerSet") {
      main(childLayers[i]);
    }
    var layerName = childLayers[i].name;
    var ind = layerName.indexOf(":");
    var value = layerName.substr(ind + 1, layerName.length - ind);
    try {
      childLayers[i].rotate(value, AnchorPosition.MIDDLECENTER);
    } catch (e) {}
    win.progressbar.value = i;
    $.sleep(10);
    win.update();
  }
  win.close();
}
