var cancelFlag = 0;
var targetComp = null;
var dialogResult;
var parentNullLayer = null;
var insertBaseIndex;
cancelFlag = getSelectedCompIndex();
if (cancelFlag) {
    dialogResult = showOptionDialog();
    if (dialogResult[0] === 1) {
        app.beginUndoGroup("Expand Composition");
        expandComposition(app.project.item(cancelFlag), dialogResult[1]);
        app.endUndoGroup();
    }
}
function getSelectedCompIndex() {
    var activeItem = app.project.activeItem;
    if (!activeItem) {
        alert("selectProj");
        return 0;
    }
    targetComp = activeItem;
    var selectedLayers = activeItem.selectedLayers;
    if (selectedLayers.length === 0) {
        alert("Select something");
        return 0;
    }
    var compIndex = findItemIndexByName(selectedLayers[0].name);
    if (!compIndex) {
        alert("Select comp");
        return 0;
    }
    if (!(app.project.item(compIndex) instanceof CompItem)) {
        alert("Select comp");
        return 0;
    }
    return compIndex;
}
function findItemIndexByName(name) {
    for (var i = 1; i <= app.project.items.length; i++) {
        if (app.project.item(i).name === name) {
            return i;
        }
    }
    return 0;
}
function showOptionDialog() {
    var dlg = new Window('dialog', "ExpandComp", rectAE(200, 100, 220, 130));
    var panel = dlg.add("panel", rectAE(5, 5, 210, 70), "Transform");
    var rbOriginal = panel.add("radiobutton", rectAE(20, 18, 75, 21), "Original");
    var rbPreComp = panel.add("radiobutton", rectAE(20, 40, 75, 21), "PreComp");
    var cbParentNull = panel.add("checkbox", rectAE(115, 30, 90, 21), "Parent null");
    var btnOK = dlg.add("button", rectAE(120, 90, 80, 26), "OK");
    var btnCancel = dlg.add("button", rectAE(20, 90, 80, 26), "Cancel");
    rbPreComp.value = true;
    cbParentNull.value = false;
    return [dlg.show(), rbPreComp.value, cbParentNull.value];
}
function expandComposition(preComp, keepPreCompTransform) {
    for (var i = 1; i <= preComp.numLayers; i++) {
        preComp.layer(i).copyToComp(targetComp);
    }
    if (!keepPreCompTransform && dialogResult[2]) {
        createParentNull(preComp);
    }
    if (keepPreCompTransform) {
        createParentNull(preComp);
        var originalLayer = targetComp.layer(preComp.name);
        parentNullLayer.position.setValue(originalLayer.position.value);
        parentNullLayer.scale.setValue(originalLayer.scale.value);
        parentNullLayer.rotation.setValue(originalLayer.rotation.value);
        if (!dialogResult[2]) {
            for (var k = insertBaseIndex; k > insertBaseIndex - preComp.numLayers; k--) {
                targetComp.layer(k).parent = null;
            }
            targetComp.layer(1).remove();
        }
    }
    targetComp.layer(preComp.name).enabled = false;
}
function createParentNull(preComp) {
    insertBaseIndex = targetComp.layer(preComp.name).index;
    parentNullLayer = targetComp.layers.addNull();
    targetComp.layer(1).name = preComp.name + "_null";
    for (var j = insertBaseIndex; j > insertBaseIndex - preComp.numLayers; j--) {
        targetComp.layer(j).parent = parentNullLayer;
    }
}
function rectAE(left, top, width, height) {
    return [left, top, left + width, top + height];
}
