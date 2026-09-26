app.bringToFront();  
app.activeDocument.suspendHistory("位置を変えずに中央揃え", "main()");
app.preferences.rulerUnits = Units.PIXELS;
function main() {
    var just = Justification.CENTER;
    //var just = Justification.LEFT
    //var just = Justification.RIGHT
	if (app.documents.length) {
		var docRef = app.activeDocument;
		if (docRef.layers.length) {
			var selected = getSelectedLayersIdx();
			for (var i = 0; i < selected.length; i++) {
                selectByIndex(selected[i]);
                layObj = activeDocument.activeLayer.bounds;
                x1 = parseInt(layObj[0]); $.writeln(x1);
                y1 = parseInt(layObj[1]); $.writeln(y1);
                var sel = activeDocument.activeLayer;  
                sel.textItem.justification = just ;
                MoveLayerTo(sel,x1,y1);
			}
		}
	}
}

function MoveLayerTo(fLayer,fX,fY) {
  var Position = fLayer.bounds;
  Position[0] = fX - Position[0];
  Position[1] = fY - Position[1];
  fLayer.translate(-Position[0],-Position[1]);
}

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
}

function selectByIndex(idx) {
	if (idx == 0) return;
	if (idx.length != undefined) {
		idx = idx[0];
	}
	var desc = new ActionDescriptor();
	var ref = new ActionReference();
	ref.putIndex(charIDToTypeID('Lyr '), idx);
	desc.putReference(charIDToTypeID('null'), ref);
	executeAction(charIDToTypeID('slct'), desc, DialogModes.NO);
	return app.activeDocument.activeLayer;
}
