main();

function main() {
  if (!documents.length) return;
  linkLayers();
}

function linkLayers() {
  var ref = new ActionReference();
  ref.putEnumerated(charIDToTypeID('Dcmn'), charIDToTypeID('Ordn'), charIDToTypeID('Trgt'));
  var count = executeActionGet(ref).getInteger(charIDToTypeID('NmbL')) + 1;
  var Names = [];
  try {
    activeDocument.backgroundLayer;
    var i = 0;
  } catch (e) {
    var i = 1;
  };
  for (i; i < count; i++) {
    if (i == 0) continue;
    ref = new ActionReference();
    ref.putIndex(charIDToTypeID('Lyr '), i);
    var desc = executeActionGet(ref);
    var layerSection = desc.getEnumerationValue(stringIDToTypeID('layerSection'));
    var Id = desc.getInteger(stringIDToTypeID('layerID'));
    if (typeIDToStringID(layerSection) == 'layerSectionEnd') continue;
    if (desc.hasKey(charIDToTypeID("UsrM"))) linkChannelMask(i);
    if (desc.getBoolean(stringIDToTypeID("hasVectorMask"))) linkVectorMask(i);
  }
};

function linkChannelMask(idx) {
  var desc = new ActionDescriptor();
  var ref = new ActionReference();
  ref.putIndex(charIDToTypeID("Lyr "), idx);
  desc.putReference(charIDToTypeID('null'), ref);
  var desc2 = new ActionDescriptor();
  desc2.putBoolean(charIDToTypeID('Usrs'), true);
  desc.putObject(charIDToTypeID('T   '), charIDToTypeID('Lyr '), desc2);
  executeAction(charIDToTypeID('setd'), desc, DialogModes.NO);
};

function linkVectorMask(idx) {
  var desc = new ActionDescriptor();
  var ref = new ActionReference();
  ref.putIndex(charIDToTypeID("Lyr "), idx);
  desc.putReference(charIDToTypeID("null"), ref);
  var desc1 = new ActionDescriptor();
  desc1.putBoolean(stringIDToTypeID("vectorMaskLinked"), true);
  desc.putObject(charIDToTypeID("T   "), charIDToTypeID("Lyr "), desc1);
  executeAction(charIDToTypeID("setd"), desc, DialogModes.NO);
}
