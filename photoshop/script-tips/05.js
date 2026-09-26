if(activeDocument.activeLayer.typename == "ArtLayer" && hasLayerMask() == true){
      alert("マスク有り");
        }

    else{
      alert("マスク無し");
}

// レイヤーマスクがあるかどうかの判定
function hasLayerMask() {
    var hasLayerMask = false;
    try {
        var ref = new ActionReference();
        var keyUserMaskEnabled = app.charIDToTypeID( 'UsrM' );
        ref.putProperty( app.charIDToTypeID( 'Prpr' ), keyUserMaskEnabled );
        ref.putEnumerated( app.charIDToTypeID( 'Lyr ' ), app.charIDToTypeID( 'Ordn' ), app.charIDToTypeID( 'Trgt' ) );
        var desc = executeActionGet( ref );
        if ( desc.hasKey( keyUserMaskEnabled ) ) {
            hasLayerMask = true;
            }
        }catch(e) {
            hasLayerMask = false;
            }
        return hasLayerMask;
}
