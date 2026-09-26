function CGM_SavePng() {
    var doc = app.activeDocument;
    var docName = doc.name;
    var docPath = doc.path;
    var folder = new Folder(docPath);
    if (docName.indexOf(".") != -1) {
        var baseName = docName.match(/(.*)\.[^\.]+$/)[1];
    } else {
        var baseName = docName;
    }
    if (folder == null) {
        return;
    }
    exportPng(doc, folder, baseName + '.png');
}

function exportPng(doc, folder, name) {
    var file = new File(folder.fsName + "/" + name);
    var options = new ExportOptionsSaveForWeb();
    options.format = SaveDocumentType.PNG;
    options.optimized = true;
    options.interlaced = false;
    doc.exportDocument(file, ExportType.SAVEFORWEB, options);
}

CGM_SavePng();
