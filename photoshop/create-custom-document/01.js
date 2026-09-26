createDocument(1280,720); // ドキュメントの新規作成
makeSolidFill(0,255,0);   // 塗りつぶしレイヤーの作成
removeMask();             // マスクの削除
deleteBackGround();       // 初期の背景レイヤーを削除
renameBackGround();       // 塗りつぶしレイヤーのリネーム

function createDocument(width, height){
    preferences.rulerUnits = Units.PIXELS;  // 単位を設定
    app.documents.add(width, height);       // ドキュメントの作成（幅, 高さ）
}

function deleteBackGround(){
    documentObject = activeDocument.artLayers;
    documentObject[documentObject.length-1].remove();   // 背景レイヤーの削除
}

function renameBackGround(){
    documentObject = activeDocument.artLayers;
    documentObject[documentObject.length-1].name = "背景";
}

function makeSolidFill(redC, greenC, blueC){
    var idMk = charIDToTypeID( "Mk  " );
    var desc15 = new ActionDescriptor();
    var idnull = charIDToTypeID( "null" );
    var ref4 = new ActionReference();
    var idcontentLayer = stringIDToTypeID( "contentLayer" );
    ref4.putClass( idcontentLayer );
    desc15.putReference( idnull, ref4 );
    var idUsng = charIDToTypeID( "Usng" );
    var desc16 = new ActionDescriptor();
    var idType = charIDToTypeID( "Type" );
    var desc17 = new ActionDescriptor();
    var idClr = charIDToTypeID( "Clr " );
    var desc18 = new ActionDescriptor();
    var idRd = charIDToTypeID( "Rd  " );
    desc18.putDouble( idRd, redC); // Red
    var idGrn = charIDToTypeID( "Grn " );
    desc18.putDouble( idGrn, greenC); // Green
    var idBl = charIDToTypeID( "Bl  " );
    desc18.putDouble( idBl, blueC); // Blue
    var idRGBC = charIDToTypeID( "RGBC" );
    desc17.putObject( idClr, idRGBC, desc18 );
    var idsolidColorLayer = stringIDToTypeID( "solidColorLayer" );
    desc16.putObject( idType, idsolidColorLayer, desc17 );
    var idcontentLayer = stringIDToTypeID( "contentLayer" );
    desc15.putObject( idUsng, idcontentLayer, desc16 );
    executeAction( idMk, desc15, DialogModes.NO );
}

function removeMask(){
    var idDlt = charIDToTypeID( "Dlt " );
    var desc21 = new ActionDescriptor();
    var idnull = charIDToTypeID( "null" );
    var ref5 = new ActionReference();
    var idChnl = charIDToTypeID( "Chnl" );
    var idMsk = charIDToTypeID( "Msk " );
    ref5.putEnumerated( idChnl, idChnl, idMsk );
    desc21.putReference( idnull, ref5 );
    executeAction( idDlt, desc21, DialogModes.NO );
}
