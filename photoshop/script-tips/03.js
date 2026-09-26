// 一つ上のレイヤーに移動
function selectLayerForward() {
  var desc = new ActionDescriptor();
  var ref = new ActionReference();
  ref.putEnumerated( charIDToTypeID( "Lyr " ), charIDToTypeID( "Ordn" ), charIDToTypeID( "Frwr" ) );
  desc.putReference( charIDToTypeID( "null" ), ref );
  desc.putBoolean( charIDToTypeID( "MkVs" ), false );
  executeAction( charIDToTypeID( "slct" ), desc, DialogModes.NO );
}
selectLayerForward();
