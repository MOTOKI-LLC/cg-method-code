function unlockLayers(){
    unlockAll(app.activeDocument.layers);

    function unlockAll(layers) {
      for (var i = 0; i < layers.length; i++) {
        unlockLayer(layers, i);
        if (layers[i].typename == 'LayerSet') unlockAll(layers[i].layers);
      }
    }

    function unlockLayer(layers, i) {
      var hidden = !isVisible(layers[i]);
      if(layers[i].isBackgroundLayer ) layers[i].name = '背景';
      var layer = layers[i];
      if(layer.allLocked) layer.allLocked = false;
      if(layer.pixelsLocked && layer.kind != LayerKind.TEXT) layer.pixelsLocked = false;
      if(layer.positionLocked) layer.positionLocked = false;
      if(layer.transparentPixelsLocked && layer.kind != LayerKind.TEXT) layer.transparentPixelsLocked = false;
      if(hidden) layer.visible = false;
    }

    function isVisible(layer) {
      var ref = new ActionReference();
      ref.putIdentifier( charIDToTypeID( "Lyr " ), layer.id );
      return executeActionGet( ref ).getBoolean( charIDToTypeID( "Vsbl" ) );
    }
 }
unlockLayers()
