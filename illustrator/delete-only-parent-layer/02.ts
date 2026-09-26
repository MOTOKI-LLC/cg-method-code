function moveSubLayers(parent) {
    var subLayers = parent.layers;
    if (subLayers.length > 0) {
        for (var i = subLayers.length - 1; i >= 0; i--) {
            subLayers[i].locked = false;
            subLayers[i].visible = true;
            moveSubLayers(subLayers[i]);
            subLayers[i].move(allLayers[0], ElementPlacement.PLACEBEFORE);
        }
    }
}
