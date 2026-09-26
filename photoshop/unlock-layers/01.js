function unlockLayers(){
    var topLayer = app.activeDocument.layers[0];
    app.activeDocument.activeLayer = topLayer;
    do {
      unlockLayer();
      selectLayerBelow();
    } while(topLayer != app.activeDocument.activeLayer);

    function unlockLayer() {
      if(app.activeDocument.activeLayer.isBackgroundLayer ) app.activeDocument.activeLayer.name = '背景';
      if(app.activeDocument.activeLayer.allLocked) app.activeDocument.activeLayer.allLocked = false;
      if(app.activeDocument.activeLayer.pixelsLocked && app.activeDocument.activeLayer.kind != LayerKind.TEXT) app.activeDocument.activeLayer.pixelsLocked = false;
      if(app.activeDocument.activeLayer.positionLocked) app.activeDocument.activeLayer.positionLocked = false;
      if(app.activeDocument.activeLayer.transparentPixelsLocked && app.activeDocument.activeLayer.kind != LayerKind.TEXT) app.activeDocument.activeLayer.transparentPixelsLocked = false;
    }

    function selectLayerBelow() {
      var desc = new ActionDescriptor();
      var ref = new ActionReference();
      ref.putEnumerated( charIDToTypeID( "Lyr " ), charIDToTypeID( "Ordn" ), charIDToTypeID( "Bckw" ) );
      desc.putReference( charIDToTypeID( "null" ), ref );
      desc.putBoolean( charIDToTypeID( "MkVs" ), false );
      executeAction( charIDToTypeID( "slct" ), desc, DialogModes.NO );
    }
 }
unlockLayers()
