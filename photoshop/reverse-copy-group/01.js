function ReverseCopy() {
  cTID = function (s) {
    return app.charIDToTypeID(s);
  };
  sTID = function (s) {
    return app.stringIDToTypeID(s);
  };
  //選んでいるのがグループだけか確かめる
  function checkGroups() {
    var ref1 = new ActionReference();
    ref1.putProperty(cTID('Prpr'), sTID("targetLayersIDs"));
    ref1.putEnumerated(cTID('Dcmn'), cTID('Ordn'), cTID('Trgt'));
    var list = executeActionGet(ref1).getList(sTID("targetLayersIDs"));
    if (list.count == 0) throw new Error("no layer");
    for (var i = 0; i < list.count; i++) {
      var ref2 = new ActionReference();
      ref2.putIdentifier(cTID('Lyr '), list.getReference(i).getIdentifier());
      var section = executeActionGet(ref2).getEnumerationValue(sTID("layerSection"));
      if (section != sTID("layerSectionStart")) throw new Error("not group");
    }
  };
  //複製したものを削除
  function deleteCopy() {
    var desc1 = new ActionDescriptor();
    var ref1 = new ActionReference();
    ref1.putEnumerated(cTID('Lyr '), cTID('Ordn'), cTID('Trgt'));
    desc1.putReference(cTID('null'), ref1);
    executeAction(cTID('Dlt '), desc1, DialogModes.NO);
  };　 //グループの複製
  function step1(enabled, withDialog) {
    if (enabled != undefined && !enabled) return;
    var dialogMode = (withDialog ? DialogModes.ALL : DialogModes.NO);
    var desc1 = new ActionDescriptor();
    var ref1 = new ActionReference();
    ref1.putEnumerated(cTID('Lyr '), cTID('Ordn'), cTID('Trgt'));
    desc1.putReference(cTID('null'), ref1);
    var desc2 = new ActionDescriptor();
    desc2.putUnitDouble(cTID('Hrzn'), cTID('#Prc'), 0);
    desc2.putUnitDouble(cTID('Vrtc'), cTID('#Prc'), 0);
    desc1.putObject(cTID('T   '), cTID('Ofst'), desc2);
    executeAction(sTID('copyEvent'), desc1, dialogMode);
  };　 //レイヤーを結合
  function step2(enabled, withDialog) {
    if (enabled != undefined && !enabled) return;
    var dialogMode = (withDialog ? DialogModes.ALL : DialogModes.NO);
    executeAction(sTID('mergeLayersNew'), undefined, dialogMode);
  };
  //ドキュメント全体を範囲選択
  function step3(enabled, withDialog) {
    if (enabled != undefined && !enabled) return;
    var dialogMode = (withDialog ? DialogModes.ALL : DialogModes.NO);
    var desc1 = new ActionDescriptor();
    var ref1 = new ActionReference();
    ref1.putProperty(cTID('Chnl'), sTID("selection"));
    desc1.putReference(cTID('null'), ref1);
    desc1.putEnumerated(cTID('T   '), cTID('Ordn'), cTID('Al  '));
    executeAction(sTID('set'), desc1, dialogMode);
  };
  //変形で左右反転
  function step4(enabled, withDialog) {
    if (enabled != undefined && !enabled) return;
    var dialogMode = (withDialog ? DialogModes.ALL : DialogModes.NO);
    var desc1 = new ActionDescriptor();
    var ref1 = new ActionReference();
    ref1.putEnumerated(cTID('Lyr '), cTID('Ordn'), cTID('Trgt'));
    desc1.putReference(cTID('null'), ref1);
    desc1.putEnumerated(cTID('FTcs'), cTID('QCSt'), sTID("QCSAverage"));
    var desc2 = new ActionDescriptor();
    desc2.putUnitDouble(cTID('Hrzn'), cTID('#Prc'), 0);
    desc2.putUnitDouble(cTID('Vrtc'), cTID('#Prc'), 0);
    desc1.putObject(cTID('Ofst'), cTID('Ofst'), desc2);
    desc1.putUnitDouble(cTID('Wdth'), cTID('#Prc'), -100);
    desc1.putEnumerated(cTID('Intr'), cTID('Intp'), sTID("bicubicAutomatic"));
    executeAction(sTID('transform'), desc1, dialogMode);
  };
  //グループ化
  function step5(enabled, withDialog) {
    if (enabled != undefined && !enabled) return;
    var dialogMode = (withDialog ? DialogModes.ALL : DialogModes.NO);
    var desc1 = new ActionDescriptor();
    var ref1 = new ActionReference();
    ref1.putClass(sTID("layerSection"));
    desc1.putReference(cTID('null'), ref1);
    var ref2 = new ActionReference();
    ref2.putEnumerated(cTID('Lyr '), cTID('Ordn'), cTID('Trgt'));
    desc1.putReference(cTID('From'), ref2);
    var desc2 = new ActionDescriptor();
    desc2.putString(cTID('Nm  '), "Group");
    desc1.putObject(cTID('Usng'), sTID("layerSection"), desc2);
    desc1.putInteger(sTID("layerSectionStart"), 678);
    desc1.putInteger(sTID("layerSectionEnd"), 679);
    executeAction(sTID('make'), desc1, dialogMode);
  };
  //範囲選択を解除
  function step6(enabled, withDialog) {
    if (enabled != undefined && !enabled) return;
    var dialogMode = (withDialog ? DialogModes.ALL : DialogModes.NO);
    var desc1 = new ActionDescriptor();
    var ref1 = new ActionReference();
    ref1.putProperty(cTID('Chnl'), sTID("selection"));
    desc1.putReference(cTID('null'), ref1);
    desc1.putEnumerated(cTID('T   '), cTID('Ordn'), cTID('None'));
    executeAction(sTID('set'), desc1, dialogMode);
  };
  checkGroups();
  step1();
  try {
    step2();
    step3();
    step4();
  } catch (e) {
    deleteCopy();
    step6();
    throw e;
  }
  step5();
  step6();
};
ReverseCopy.main = function () {
  ReverseCopy();
};

function CGM_ReverseCopyGroup() {
  try {
    ReverseCopy.main();
  } catch (e) {
    alert("グループを選択してください");
  }
}

var doc = activeDocument;
doc.suspendHistory("反転コピー", "CGM_ReverseCopyGroup();");
