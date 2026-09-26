var value = prompt("オブジェクトからトンボまでのオフセット値を入力してください(デフォルト8)", "8");
var value = eval(value);
var stroke = 0.3;

var selObj = activeDocument.selection;
for (var i = 0; i < selObj.length; i++) {
    var rect = selObj[i].geometricBounds;
    var x1 = rect[0];
    var y1 = rect[1];
    var x2 = rect[2];
    var y2 = rect[3];
    var d = 20;
    var o = value + stroke;

    // 日本式トンボ
    drawLine2(x1 - (d * 1.8), (y1 + y2) / 2, x1 - (d * 0.6), (y1 + y2) / 2);
    drawLine2(x2 + (d * 1.8), (y1 + y2) / 2, x2 + (d * 0.6), (y1 + y2) / 2);
}

function drawLine2(sx, sy, ex, ey) {
    var pObj = app.activeDocument.pathItems.add();
    pObj.setEntirePath([[sx, sy], [ex, ey]]);
    pObj.filled = false;
    pObj.stroked = true;
    pObj.strokeWidth = stroke;
    pObj.strokeColor = setColor(255, 0, 0);
}

function setColor(r, g, b) {
    var tmpColor = new RGBColor();
    tmpColor.red = r;
    tmpColor.green = g;
    tmpColor.blue = b;
    return tmpColor;
}
