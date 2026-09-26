function selectFront() {
    var idslct = charIDToTypeID( "slct" );
    var desc250 = new ActionDescriptor();
    var idnull = charIDToTypeID( "null" );
    var ref207 = new ActionReference();
    var idLyr = charIDToTypeID( "Lyr " );
    var idOrdn = charIDToTypeID( "Ordn" );
    var idFrnt = charIDToTypeID( "Frnt" );
    ref207.putEnumerated( idLyr, idOrdn, idFrnt );
    desc250.putReference( idnull, ref207 );
    var idMkVs = charIDToTypeID( "MkVs" );
    desc250.putBoolean( idMkVs, false );
    executeAction( idslct, desc250, DialogModes.NO );
}
selectFront();
