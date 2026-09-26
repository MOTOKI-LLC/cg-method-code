//@target photoshop;  
app.bringToFront();
if (documents.length) {
    var deleteStr = ".png"
    var selLayers = getSelectedLayersIdx();
    for (var a in selLayers) {
        selectLayerByIndex(selLayers[a]);
        activeDocument.activeLayer.name = activeDocument.activeLayer.name.split(deleteStr)[0];
    }
}

function selectLayerByIndex(index, add) {
    var ref = new ActionReference();
    ref.putIndex(charIDToTypeID("Lyr "), index);
    var desc = new ActionDescriptor();
    desc.putReference(charIDToTypeID("null"), ref);
    if (add) desc.putEnumerated(stringIDToTypeID("selectionModifier"), stringIDToTypeID("selectionModifierType"), stringIDToTypeID("addToSelection"));
    desc.putBoolean(charIDToTypeID("MkVs"), false);
    try {
        executeAction(charIDToTypeID("slct"), desc, DialogModes.NO);
    } catch (e) {}
};

function getSelectedLayersIdx() {
    var selectedLayers = new Array;
    var ref = new ActionReference();
    ref.putEnumerated(charIDToTypeID("Dcmn"), charIDToTypeID("Ordn"), charIDToTypeID("Trgt"));
    var desc = executeActionGet(ref);
    if (desc.hasKey(stringIDToTypeID('targetLayers'))) {
        desc = desc.getList(stringIDToTypeID('targetLayers'));
        var c = desc.count
        var selectedLayers = new Array();
        for (var i = 0; i < c; i++) {
            try {
                activeDocument.backgroundLayer;
                selectedLayers.push(desc.getReference(i).getIndex());
            } catch (e) {
                selectedLayers.push(desc.getReference(i).getIndex() + 1);
            }
        }
    } else {
        var ref = new ActionReference();
        ref.putProperty(charIDToTypeID("Prpr"), charIDToTypeID("ItmI"));
        ref.putEnumerated(charIDToTypeID("Lyr "), charIDToTypeID("Ordn"), charIDToTypeID("Trgt"));
        try {
            activeDocument.backgroundLayer;
            selectedLayers.push(executeActionGet(ref).getInteger(charIDToTypeID("ItmI")) - 1);
        } catch (e) {
            selectedLayers.push(executeActionGet(ref).getInteger(charIDToTypeID("ItmI")));
        }
        var vis = app.activeDocument.activeLayer.visible;
        if (vis == true) app.activeDocument.activeLayer.visible = false;
        var desc9 = new ActionDescriptor();
        var list9 = new ActionList();
        var ref9 = new ActionReference();
        ref9.putEnumerated(charIDToTypeID('Lyr '), charIDToTypeID('Ordn'), charIDToTypeID('Trgt'));
        list9.putReference(ref9);
        desc9.putList(charIDToTypeID('null'), list9);
        executeAction(charIDToTypeID('Shw '), desc9, DialogModes.NO);
        if (app.activeDocument.activeLayer.visible == false) selectedLayers.shift();
        app.activeDocument.activeLayer.visible = vis;
    }
    return selectedLayers;
};
