disableGroupMasks(app.activeDocument);

function disableGroupMasks(parent) {
    for (var i = 0; i < parent.layerSets.length; i++) {
        try {
            closeClippingMask(parent.layerSets[i].id);
        } catch (e) {}
        disableGroupMasks(parent.layerSets[i]);
    }
}

function closeClippingMask(layerId) {
    var idsetd = charIDToTypeID("setd");
    var desc19 = new ActionDescriptor();
    var idnull = charIDToTypeID("null");
    var ref1 = new ActionReference();
    var idLyr = charIDToTypeID("Lyr ");
    var idOrdn = charIDToTypeID("Ordn");
    var idTrgt = charIDToTypeID("Trgt");
    ref1.putIdentifier(idLyr, layerId);
    desc19.putReference(idnull, ref1);
    var idT = charIDToTypeID("T   ");
    var desc20 = new ActionDescriptor();
    var idUsrM = charIDToTypeID("UsrM");
    desc20.putBoolean(idUsrM, false);
    var idLyr = charIDToTypeID("Lyr ");
    desc19.putObject(idT, idLyr, desc20);
    executeAction(idsetd, desc19, DialogModes.NO);
}
