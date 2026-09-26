//中央揃え▶右揃え
if (beforeJust == justCenter) {
  var rectL = myTextLayer.sourceRectAtTime(0, false).left;
  myTextLayer.property("ADBE Transform Group").property("ADBE Position").setValue([posX - rectL / 2, posY]);
}
//左揃え▶右揃え
if (beforeJust == justLeft) {
  var rectL = myTextLayer.sourceRectAtTime(0, false).left;
  myTextLayer.property("ADBE Transform Group").property("ADBE Position").setValue([posX - rectL, posY]);
}
