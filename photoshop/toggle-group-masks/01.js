var topLayer = app.activeDocument.layers[0];
app.activeDocument.activeLayer = topLayer;
do {
    try {
        if (activeDocument.activeLayer.typename == "LayerSet") {
            closeClippingMask();
        }
    } catch (e) {}
    selectLayerBelow();
} while (topLayer != app.activeDocument.activeLayer);

function closeClippingMask() {
    var idsetd = charIDToTypeID("setd");
    var desc19 = new ActionDescriptor();
    var idnull = charIDToTypeID("null");
    var ref1 = new ActionReference();
    var idLyr = charIDToTypeID("Lyr ");
    var idOrdn = charIDToTypeID("Ordn");
    var idTrgt = charIDToTypeID("Trgt");
    ref1.putEnumerated(idLyr, idOrdn, idTrgt);
    desc19.putReference(idnull, ref1);
    var idT = charIDToTypeID("T   ");
    var desc20 = new ActionDescriptor();
    var idUsrM = charIDToTypeID("UsrM");
    desc20.putBoolean(idUsrM, false);
    var idLyr = charIDToTypeID("Lyr ");
    desc19.putObject(idT, idLyr, desc20);
    executeAction(idsetd, desc19, DialogModes.NO);
}

function selectLayerBelow() {
    var desc = new ActionDescriptor();
    var ref = new ActionReference();
    ref.putEnumerated(charIDToTypeID("Lyr "), charIDToTypeID("Ordn"), charIDToTypeID("Bckw"));
    desc.putReference(charIDToTypeID("null"), ref);
    desc.putBoolean(charIDToTypeID("MkVs"), false);
    executeAction(charIDToTypeID("slct"), desc, DialogModes.NO);
}
