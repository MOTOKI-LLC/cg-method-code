//中央揃え▶左揃え
if (beforeJust == justCenter) {
  var rectL = myTextLayer.sourceRectAtTime(0, false).left;
  myTextLayer.property("ADBE Transform Group").property("ADBE Position").setValue([posX + rectL, posY]);
}
//右揃え▶左揃え
if (beforeJust == justRight) {
  var rectL = myTextLayer.sourceRectAtTime(0, false).left;
  myTextLayer.property("ADBE Transform Group").property("ADBE Position").setValue([posX + rectL, posY]);
}
