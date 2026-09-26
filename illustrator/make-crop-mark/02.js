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

    // 西洋式トンボ
    drawLine2(x1, y1 + o, x1, y1 + o + d);
    drawLine2(x2, y1 + o, x2, y1 + o + d);
}
