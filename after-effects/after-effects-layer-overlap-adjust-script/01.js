app.beginUndoGroup("OverlapAdjust");
try {// 上から選択した場合
    layerObj = app.project.activeItem.selectedLayers
    for(i = 1; i < layerObj.length; i++){
        layerIndex = layerObj[i].index
        app.project.activeItem.layer(layerIndex-1).outPoint = app.project.activeItem.layer(layerIndex).inPoint
    }
    app.endUndoGroup();
} catch (e) { // 下から選択した場合
layerObj = app.project.activeItem.selectedLayers
for(i = 1; i < layerObj.length; i++){
    layerIndex = layerObj[i].index
    app.project.activeItem.layer(layerIndex).outPoint = app.project.activeItem.layer(layerIndex+1).inPoint
}
}
app.endUndoGroup();
