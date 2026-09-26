try {
    var myLayer = app.project.activeItem.selectedLayers;
    //選択カメラ
    if (myLayer[0] instanceof CameraLayer) {
        var camera = myLayer[0];
        var camTrans = camera.transform.position.value;
        var x2 = camTrans[0];
        var y2 = camTrans[1];
        var z2 = camTrans[2];
        //ズーム
        var camZoom = camera.zoom.value;
    } else {
        alert("カメラを選択して、次にレイヤーを選択してください")
    }
//選択レイヤー
var selLayer = myLayer[1];
var selTrans = selLayer.transform.position.value;
var x1 = selTrans[0];
var y1 = selTrans[1];
var z1 = selTrans[2];

//2点間の距離
var distance = z2 - z1;

var size = Math.abs((distance / camZoom) * 100);
$.writeln(distance);
$.writeln(camZoom);

//スケール値のセット
myLayer[1].transform.scale.setValue([size, size, 100]);
} catch (e) {
alert("カメラを選択して、次にレイヤーを選択してください")
}
