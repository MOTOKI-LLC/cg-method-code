function ReverseCopy() {
  cTID = function (s) {
    return app.charIDToTypeID(s);
  };
  sTID = function (s) {
    return app.stringIDToTypeID(s);
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
    desc1.putObject(cTID('Usng'), sTID("layerSection"), desc2);
    desc1.putInteger(sTID("layerSectionStart"), 678);
    desc1.putInteger(sTID("layerSectionEnd"), 679);
    desc1.putString(cTID('Nm  '), "Group");
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
  // グループを折りたたむ
  function step7(enabled, withDialog) {
    if (enabled != undefined && !enabled) return;
    var dialogMode = (withDialog ? DialogModes.ALL : DialogModes.NO);
    var desc1 = new ActionDescriptor();
    executeAction(sTID('collapseAllGroupsEvent'), desc1, dialogMode);
  };
  step1();
  step2();
  step3();
  step4();
  step5();
  step6();
  step7();
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
