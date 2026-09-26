var doc = activeDocument;
var sel = doc.selection;  
var lay = doc.layers["まとめ"];

for (i = 0; i < sel.length; i++) {  
    obj = sel[i];
    obj.move(lay, ElementPlacement.PLACEATBEGINNING);
}
