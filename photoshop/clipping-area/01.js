function clippingArea() {
    var strtRulerUnits = preferences.rulerUnits;
    if(strtRulerUnits != Units.PIXELS){ preferences.rulerUnits = Units.PIXELS; }
    
    var srcDoc = activeDocument;
    
    function visibleActiveOnly(docRef){
        var visible = new Array();
        for(var i = 0; i < docRef.layers.length; i++){
            visible[i] = docRef.layers[i].visible;
            if(docRef.layers[i].visible){ docRef.layers[i].visible = false; }
        }
        docRef.activeLayer.visible = true;
        return visible;
    }
    
    function visibleOriginal(docRef, visible){
        for(var i = 0; i < docRef.layers.length; i++){
            docRef.layers[i].visible = visible[i];
        }
        return true;
    }
    
    function ClippingArea(docRef){
        var x_size = docRef.width;
        var y_size = docRef.height;
    
        var before = docRef.activeHistoryState;
    
        docRef.trim(TrimType.TRANSPARENT, true, true, false, false);
    
        var x_offset = x_size - docRef.width;
        var y_offset = y_size - docRef.height;
    
        docRef.trim(TrimType.TRANSPARENT, true, true, true, true);
    
        var x_trim_size = docRef.width;
        var y_trim_size = docRef.height;
    
        docRef.activeHistoryState = before;
    
        this.left = x_offset;
        this.right = x_offset + x_trim_size;
        this.top = y_offset;
        this.bottom = y_offset + y_trim_size;
    }
    
    var v_array = visibleActiveOnly(srcDoc);
    var xy = new ClippingArea(srcDoc);
    visibleOriginal(srcDoc, v_array);
    
    srcDoc.selection.select(Array(
        Array(xy.left, xy.top),
        Array(xy.right, xy.top),
        Array(xy.right, xy.bottom),
        Array(xy.left, xy.bottom)
    ), SelectionType.REPLACE, 0, false);
    
    if(strtRulerUnits != Units.PIXELS){ preferences.rulerUnits = strtRulerUnits; }
    
    srcDoc = null;
    xy = null;
    v_array = null;
}
clippingArea();
