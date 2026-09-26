app.beginUndoGroup("3D背景をコンポジションのサイズに調整");
//エクスプレッションの挿入
var myProperty = app.project.activeItem.selectedProperties;
for (var i = 0; i < myProperty.length; i++) {
  if (myProperty[i].canSetExpression) {
    myProperty[i].expression = "camera = thisComp.layer("
    カメラ 1 ");\rpoint1 = position;\rpoint2 = camera.position;\r distance = length(point1, point2);\rsize = (distance/camera.zoom) * 100;\r[size, size, 100]  "
  }
}
for (var i = 0; i < myProperty.length; i++) {
  //エクスプレッションをキーフレームに変換
  convertToKeyframes(myProperty[i]);
  var numKeys = myProperty[i].numKeys;
  for (var j = numKeys; j > 0; j--) {
    //キーフレームの削除
    myProperty[i].removeKey(j);
  }
}
app.endUndoGroup();
//エクスプレッションをキーフレームに変換
function convertToKeyframes(theProperty) {
  if (theProperty.canSetExpression && theProperty.expressionEnabled) {
    theProperty.selected = true;
    app.executeCommand(2639); //キーフレームに変換
    myProperty = app.project.activeItem.selectedProperties;
    //エクスプレッションの削除
    for (var i = 0; i < myProperty.length; i++) {
      if (myProperty[i].canSetExpression) {
        myProperty[i].expression = ""
      }
    }
    theProperty.selected = false;
  }
}
