function removeBgColor(){
    var topLayer = app.activeDocument.layers[0];
    app.activeDocument.activeLayer = topLayer;
    do {
      selcol(88, -79, 81); //指定色域 ※RGBじゃなくてLabの値を入れる！
      hideLayer();
      selectLayerBelow();
    } while(topLayer != app.activeDocument.activeLayer);

    function selcol(cL, cA, cB) {
        var allowance = 20; //許容量
        cLAB = [cL, cA, cB];
        var idClrR = charIDToTypeID("ClrR");
        var desc1426 = new ActionDescriptor();
        var idFzns = charIDToTypeID("Fzns");
        desc1426.putInteger(idFzns, allowance);
        var idMnm = charIDToTypeID("Mnm ");
        var desc1427 = new ActionDescriptor();
        var idLmnc = charIDToTypeID("Lmnc");
        desc1427.putDouble(idLmnc, cLAB[0]);
        var idA = charIDToTypeID("A   ");
        desc1427.putDouble(idA, cLAB[1]);
        var idB = charIDToTypeID("B   ");
        desc1427.putDouble(idB, cLAB[2]);
        var idLbCl = charIDToTypeID("LbCl");
        desc1426.putObject(idMnm, idLbCl, desc1427);
        var idMxm = charIDToTypeID("Mxm ");
        var desc1428 = new ActionDescriptor();
        var idLmnc = charIDToTypeID("Lmnc");
        desc1428.putDouble(idLmnc, cLAB[0]);
        var idA = charIDToTypeID("A   ");
        desc1428.putDouble(idA, cLAB[1]);
        var idB = charIDToTypeID("B   ");
        desc1428.putDouble(idB, cLAB[2]);
        var idLbCl = charIDToTypeID("LbCl");
        desc1426.putObject(idMxm, idLbCl, desc1428);
        var idcolorModel = stringIDToTypeID("colorModel");
        desc1426.putInteger(idcolorModel, 0);
        executeAction(idClrR, desc1426, DialogModes.NO);

        var idDlt = charIDToTypeID("Dlt ");
        executeAction(idDlt, undefined, DialogModes.NO);

        var idsetd = charIDToTypeID("setd");
        var desc1430 = new ActionDescriptor();
        var idnull = charIDToTypeID("null");
        var ref183 = new ActionReference();
        var idChnl = charIDToTypeID("Chnl");
        var idfsel = charIDToTypeID("fsel");
        ref183.putProperty(idChnl, idfsel);
        desc1430.putReference(idnull, ref183);
        var idT = charIDToTypeID("T   ");
        var idOrdn = charIDToTypeID("Ordn");
        var idNone = charIDToTypeID("None");
        desc1430.putEnumerated(idT, idOrdn, idNone);
        executeAction(idsetd, desc1430, DialogModes.NO);
    }

    function selectLayerBelow() {
      var desc = new ActionDescriptor();
      var ref = new ActionReference();
      ref.putEnumerated( charIDToTypeID( "Lyr " ), charIDToTypeID( "Ordn" ), charIDToTypeID( "Bckw" ) );
      desc.putReference( charIDToTypeID( "null" ), ref );
      desc.putBoolean( charIDToTypeID( "MkVs" ), false );
      executeAction( charIDToTypeID( "slct" ), desc, DialogModes.NO );
    }

    function hideLayer() {
        var idHd = charIDToTypeID("Hd  ");
        var desc1657 = new ActionDescriptor();
        var idnull = charIDToTypeID("null");
        var list162 = new ActionList();
        var ref300 = new ActionReference();
        var idLyr = charIDToTypeID("Lyr ");
        var idOrdn = charIDToTypeID("Ordn");
        var idTrgt = charIDToTypeID("Trgt");
        ref300.putEnumerated(idLyr, idOrdn, idTrgt);
        list162.putReference(ref300);
        desc1657.putList(idnull, list162);
        executeAction(idHd, desc1657, DialogModes.NO);
    }
 }

function CGM_removeBgColor(){
    try {
        removeBgColor();
    } catch (e){
    }
}

CGM_removeBgColor();
