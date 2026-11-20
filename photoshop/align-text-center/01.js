#target photoshop
function cgmCenterPointText() {
    if (!app.documents.length) {
        alert('文字のある文書を開いてください。');
        return;
    }
    var doc = app.activeDocument;
    var layer = doc.activeLayer;
    if (layer.typename !== 'ArtLayer' || layer.kind !== LayerKind.TEXT ||
        layer.textItem.kind !== TextType.POINTTEXT) {
        alert('ポイント文字のレイヤーを1つ選んでください。');
        return;
    }
    if (layer.allLocked || layer.positionLocked) {
        alert('文字レイヤーのロックを確認してください。');
        return;
    }
    var units = app.preferences.rulerUnits;
    try {
        app.preferences.rulerUnits = Units.PIXELS;
        doc.suspendHistory('位置を補正して中央揃え', 'cgmCenterPointTextMain()');
    } catch (e) {
        alert('処理を完了できませんでした。文書を確認し、必要なら取り消してください。\n' + e.message);
    } finally {
        app.preferences.rulerUnits = units;
    }
}
function cgmCenterPointTextMain() {
    var layer = app.activeDocument.activeLayer;
    var before = layer.bounds;
    var x = before[0].as('px');
    var y = before[1].as('px');
    layer.textItem.justification = Justification.CENTER;
    var after = layer.bounds;
    layer.translate(new UnitValue(x - after[0].as('px'), 'px'),
                    new UnitValue(y - after[1].as('px'), 'px'));
}
cgmCenterPointText();
