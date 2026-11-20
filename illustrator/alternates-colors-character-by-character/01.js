(function () {
    if (app.documents.length === 0) { alert("ドキュメントを開いてください。"); return; }
    var doc = app.activeDocument, sel = doc.selection;
    if (!sel || sel.length !== 1 || !sel[0] || sel[0].typename !== "TextFrame") {
        alert("選択ツールでテキストフレーム全体を1個選んでください。"); return;
    }
    var frame = sel[0], parent = frame;
    while (parent && parent.typename !== "Document") {
        if (parent.locked || parent.hidden || (parent.typename === "Layer" && !parent.visible)) {
            alert("対象または親がロック・非表示です。"); return;
        }
        parent = parent.parent;
    }
    if (!frame.editable) { alert("編集できないテキストです。"); return; }
    var chars = frame.textRange.characters;
    if (chars.length === 0) { alert("文字がありません。"); return; }
    var nameA = prompt("1色目のスウォッチ名", "交互_A");
    if (nameA === null) { return; }
    var nameB = prompt("2色目のスウォッチ名", "交互_B");
    if (nameB === null) { return; }
    nameA = String(nameA).replace(/^\s+|\s+$/g, "");
    nameB = String(nameB).replace(/^\s+|\s+$/g, "");
    if (!nameA || !nameB || nameA === nameB) { alert("異なる2つの名前を指定してください。"); return; }
    function findColor(name) {
        var found = null, count = 0;
        for (var n = 0; n < doc.swatches.length; n++) {
            if (doc.swatches[n].name === name) { found = doc.swatches[n].color; count++; }
        }
        if (count !== 1) { throw Error("スウォッチ名が未登録または重複しています：" + name); }
        if (found.typename !== "RGBColor" && found.typename !== "CMYKColor" && found.typename !== "GrayColor") {
            throw Error("この例は通常のRGB・CMYK・グレーのスウォッチだけを扱います：" + name);
        }
        return found;
    }
    var a, b, before = [], i;
    try {
        a = findColor(nameA); b = findColor(nameB);
        for (i = 0; i < chars.length; i++) { before.push(chars[i].characterAttributes.fillColor); }
    } catch (e) { alert("変更前の確認で停止しました：" + e); return; }
    try {
        for (i = 0; i < chars.length; i++) {
            chars[i].characterAttributes.fillColor = (i % 2 === 0) ? a : b;
        }
        alert("文字コレクションの " + chars.length + " 件へ交互の塗り色を指定しました。保存前に表示を確認してください。");
    } catch (e) {
        var restoreFailed = 0;
        for (i = 0; i < before.length; i++) {
            try { chars[i].characterAttributes.fillColor = before[i]; } catch (r) { restoreFailed++; }
        }
        alert("色の変更に失敗しました：" + e + "\n元の色への復帰失敗：" + restoreFailed + " 件。文書を確認してください。自動保存はしません。");
    }
}());
