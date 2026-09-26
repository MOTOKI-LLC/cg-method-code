function createOutline() {
    var type = activeDocument.textFrames;
    var layers = activeDocument.layers;

    for (var j = 0; j < layers.length; j++) {
        layers[j].locked = false;
    }

    var array = [];
    for (var k = 0; k < type.length; k++) {
        array.push(type[k]);
    }

    for (var l = 0; l < array.length; l++) {
        var outline = array[l].createOutline();
        outline.selected = true;
    }
}

createOutline();
