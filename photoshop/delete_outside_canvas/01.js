(function deleteOutsideCanvas(){
    // カンバス外を削除
    preferences.rulerUnits = Units.PIXELS;
    w = activeDocument.width.value;
    h = activeDocument.height.value;
    app.activeDocument.crop( [0, 0, w, h] );
})();
