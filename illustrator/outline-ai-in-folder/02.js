function createOutline() {
    type = activeDocument.textFrames;
    layers = activeDocument.layers;
    for (y = 0; y < layers.length; y++) layers[y].locked = false;
    a1 = [];
    for (p = 0; p < type.length; p++) {
        a1.push(type[p]);
    }
    for (a = 0; a < a1.length; a++) {
        outline = a1[a].createOutline();
        outline.selected = true;
    }
}
