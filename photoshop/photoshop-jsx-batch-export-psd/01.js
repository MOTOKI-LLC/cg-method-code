#target photoshop
// PNG or JPEG. 0 keeps the size; 1000 limits the long edge to 1000 px.
var OUTPUT_FORMAT = "PNG";
var MAX_LONG_EDGE = 0;
(function () {
    if (OUTPUT_FORMAT != "PNG" && OUTPUT_FORMAT != "JPEG") {
        alert("OUTPUT_FORMAT must be PNG or JPEG."); return;
    }
    if (MAX_LONG_EDGE < 0 || !isFinite(MAX_LONG_EDGE)) {
        alert("MAX_LONG_EDGE must be zero or positive."); return;
    }
    var source = Folder.selectDialog("Select the input PSD folder");
    if (!source) return;
    var destination = Folder.selectDialog("Select a separate output folder");
    if (!destination) return;
    function key(path) { return String(path).replace(/\\/g, "/").toLowerCase(); }
    if (key(source.fsName) == key(destination.fsName)) {
        alert("Use separate input and output folders."); return;
    }
    var files = source.getFiles(function (file) {
        return file instanceof File && /\.psd$/i.test(file.name);
    });
    if (!files.length) { alert("No PSD files in this folder."); return; }
    var originalActive = app.documents.length ? app.activeDocument : null;
    var oldUnits = app.preferences.rulerUnits;
    var oldDialogs = app.displayDialogs;
    var completed = 0, skipped = 0, failed = 0, notes = [];
    function isAlreadyOpen(file) {
        for (var i = 0; i < app.documents.length; i++) {
            try {
                if (key(app.documents[i].fullName.fsName) == key(file.fsName)) return true;
            } catch (unsavedDocument) {}
        }
        return false;
    }
    try {
        app.preferences.rulerUnits = Units.PIXELS;
        app.displayDialogs = DialogModes.NO;
        for (var n = 0; n < files.length; n++) {
            var input = files[n], document = null;
            var base = File.decode(input.name).replace(/\.psd$/i, "");
            var output = new File(destination.fsName + "/" + base +
                (OUTPUT_FORMAT == "PNG" ? ".png" : ".jpg"));
            if (output.exists || isAlreadyOpen(input)) {
                skipped++; notes.push("SKIP: " + base + " (existing output or open PSD)");
                continue;
            }
            try {
                document = app.open(input);
                if (document.mode != DocumentMode.RGB ||
                    document.bitsPerChannel != BitsPerChannelType.EIGHT) {
                    throw new Error("This example accepts RGB/8-bit PSD only.");
                }
                var width = document.width.as("px"), height = document.height.as("px");
                if (MAX_LONG_EDGE > 0 && Math.max(width, height) > MAX_LONG_EDGE) {
                    if (width >= height) {
                        document.resizeImage(UnitValue(MAX_LONG_EDGE, "px"), undefined,
                            undefined, ResampleMethod.BICUBIC);
                    } else {
                        document.resizeImage(undefined, UnitValue(MAX_LONG_EDGE, "px"),
                            undefined, ResampleMethod.BICUBIC);
                    }
                }
                var options = new ExportOptionsSaveForWeb();
                options.format = OUTPUT_FORMAT == "PNG" ? SaveDocumentType.PNG : SaveDocumentType.JPEG;
                options.PNG8 = false;
                options.transparency = OUTPUT_FORMAT == "PNG";
                options.interlaced = false;
                options.includeProfile = true;
                options.quality = 100;
                // Recheck immediately before export; use the folder for this process only.
                if (output.exists) throw new Error("Output appeared during processing.");
                document.exportDocument(output, ExportType.SAVEFORWEB, options);
                if (!output.exists || output.length === 0) throw new Error("Output file was not confirmed.");
                completed++; notes.push("OK: " + base);
            } catch (error) {
                failed++; notes.push("ERROR: " + base + " / " + error.message);
            } finally {
                if (document) {
                    try { document.close(SaveOptions.DONOTSAVECHANGES); }
                    catch (closeError) { notes.push("CLOSE ERROR: " + base + " / " + closeError.message); }
                }
            }
        }
    } finally {
        app.preferences.rulerUnits = oldUnits;
        app.displayDialogs = oldDialogs;
        if (originalActive) {
            try { app.activeDocument = originalActive; } catch (closedByUser) {}
        }
    }
    alert("Output: " + completed + " / Skip: " + skipped + " / Error: " + failed +
        "\n" + notes.join("\n"));
})();
