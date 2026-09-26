var doc = app.activeDocument;
var textFrame = doc.textFrames[0];
var charCount = textFrame.textRange.characters.length;
var colorIndexA = 3;  // スウォッチのインデックス（変更可能）
var colorIndexB = 4;  // スウォッチのインデックス（変更可能）

for (var i = 0; i < charCount; i++) {
    if ((i % 2) === 0) {
        textFrame.textRange.characters[i].characterAttributes.fillColor = doc.swatches[colorIndexA].color;
    } else {
        textFrame.textRange.characters[i].characterAttributes.fillColor = doc.swatches[colorIndexB].color;
    }
}
