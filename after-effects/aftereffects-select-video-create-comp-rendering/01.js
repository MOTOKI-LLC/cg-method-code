var myComps = new Array();
var selectItem = app.project.selection;

for (var i = 0; i < selectItem.length; i++) {
    var item = selectItem[i];
    var comp = app.project.items.addComp(
        item.name,
        item.width,
        item.height,
        item.pixelAspect,
        item.duration,
        item.frameRate
    );
    var layers = comp.layers;
    var footageLayer = layers.add(item);
}
