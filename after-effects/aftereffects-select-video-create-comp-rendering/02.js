var myComps = new Array();
var selectItem = app.project.selection;

for (var i = 0; i < selectItem.length; i++) {
    if (selectItem[i] instanceof CompItem) {
        myComps.push(selectItem[i]);
    }
}

for (var i = 0; i < myComps.length; i++) {
    var RQ = app.project.renderQueue.items.add(myComps[i]);
}

// app.project.renderQueue.render(); // レンダリング開始
