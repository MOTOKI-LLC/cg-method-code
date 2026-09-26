(function () {
    if (app.documents.length === 0) {
        alert("ドキュメントを開いてください。");
        return;
    }
    var doc = app.activeDocument;
    var width = Math.round(doc.width.as("px"));
    var height = Math.round(doc.height.as("px"));
    var newWidth = width + (width % 2);
    var newHeight = height + (height % 2);
    if (newWidth === width && newHeight === height) return;
    try {
        doc.resizeCanvas(UnitValue(newWidth, "px"),
                         UnitValue(newHeight, "px"), AnchorPosition.TOPLEFT);
    } catch (e) {
        alert("カンバスを変更できませんでした。\n" + e.message);
    }
}());
