function DurationDivide(){
    app.beginUndoGroup("DurationDivide");
    var thisComp = app.project.activeItem;
    var selectedLayers = app.project.activeItem.selectedLayers;
    var layerDuration = thisComp.workAreaDuration / selectedLayers.length;
for(var i = 0; i < selectedLayers.length; i++){
    currentLayer = selectedLayers[i];
    currentLayerDuration = Math.abs(currentLayer.outPoint - currentLayer.inPoint);
    inPoint = i*layerDuration+thisComp.workAreaStart;
    outPoint = inPoint+layerDuration;
    currentLayer.startTime = inPoint;
    currentLayer.outPoint = outPoint;
 }
app.endUndoGroup();
}
DurationDivide();
