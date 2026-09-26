var doc = app.activeDocument;
doc.activeLayer = doc.layers.getByName("リネーム");

var fileName = doc.name;
var fileName = baseName(fileName);

//レイヤーリネーム
doc.activeLayer.name = fileName + ".png" + "," + "32x32 fileName" + ".png";

//保存して閉じる
doc.save();
doc.close();


//拡張子を抜く
function baseName(str) {
    var base = new String(str).substring(str.lastIndexOf('/') + 1);
    if (base.lastIndexOf(".") != -1)
        base = base.substring(0, base.lastIndexOf("."));
    return base;
}
