function sTT(v) {
    return stringIDToTypeID(v)
}  

var layObj = activeDocument.activeLayer.name;

(ref1 = new ActionReference()).putClass(sTT('layerSection'));
(dsc1 = new ActionDescriptor()).putReference(sTT('null'),ref1);
(ref2 = new ActionReference()).putEnumerated(sTT('layer'), sTT('ordinal'), sTT('targetEnum'));
(dsc2 = new ActionDescriptor()).putString( sTT('name'), layObj );

dsc1.putReference(sTT('from'), ref2); 
dsc1.putObject( sTT('using'), sTT('layerSection'),dsc2);
executeAction(sTT('make'), dsc1);
