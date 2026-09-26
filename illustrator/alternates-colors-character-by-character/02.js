for (var i = 0; i < charCount; i++) {
    if ((i % 2) === 0) {
        textFrame.textRange.characters[i].characterAttributes.fillColor = doc.swatches[colorIndexA].color;
    } else {
        textFrame.textRange.characters[i].characterAttributes.fillColor = doc.swatches[colorIndexB].color;
    }
}
