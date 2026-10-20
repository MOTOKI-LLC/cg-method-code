#target photoshop
(function () {
    if (app.documents.length === 0) {
        alert("文書を開いてください。");
        return;
    }
    var source = app.activeDocument;
    var copy = null;
    var output = null;
    try {
        var folder = Folder.selectDialog("複製PSDの保存先を選択してください");
        if (folder === null) { return; }
        var base = source.name;
        var hasFile = true;
        try { source.fullName; } catch (nameError) { hasFile = false; }
        if (hasFile) { base = base.replace(/\.[^.]+$/, ""); }
        base = base.replace(/[\\\/:*?"<>|]/g, "_").replace(/[ .]+$/, "");
        if (!base) { base = "document"; }
        output = new File(folder.fsName + "/" + base + "_export.psd");
        if (output.exists) {
            alert("同名ファイルがあるため保存しません: " + output.fsName);
            return;
        }
        copy = source.duplicate(base + "_export", false);
        var options = new PhotoshopSaveOptions();
        options.layers = true;
        options.alphaChannels = true;
        options.annotations = true;
        options.embedColorProfile = true;
        options.spotColors = true;
        if (output.exists) { throw new Error("保存直前に同名ファイルが見つかりました。"); }
        copy.saveAs(output, options, true, Extension.LOWERCASE);
        if (!output.exists || output.length === 0) {
            throw new Error("保存先ファイルを確認できません。複製を残します。");
        }
        copy.close(SaveOptions.DONOTSAVECHANGES);
        copy = null;
        alert("保存処理が戻りました: " + output.fsName + "\nPSDを開き直して内容を確認してください。");
    } catch (error) {
        alert("中断: " + error.message + "\n複製が残っている場合は内容を確認してください。自動再実行はしません。");
    } finally {
        try { app.activeDocument = source; } catch (restoreError) {
            alert("元の文書へ表示を戻せませんでした: " + restoreError.message);
        }
    }
}());
