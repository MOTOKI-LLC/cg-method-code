// 一つ下のレイヤーに移動
function selectLayerBelow() {
  var desc = new ActionDescriptor();
  var ref = new ActionReference();
  ref.putEnumerated( charIDToTypeID( "Lyr " ), charIDToTypeID( "Ordn" ), charIDToTypeID( "Bckw" ) );
  desc.putReference( charIDToTypeID( "null" ), ref );
  desc.putBoolean( charIDToTypeID( "MkVs" ), false );
  executeAction( charIDToTypeID( "slct" ), desc, DialogModes.NO );
}
selectLayerBelow();
