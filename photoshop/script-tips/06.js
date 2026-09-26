var doc = app.activeDocument;
var docName = doc.name;
var docPath = "~/Desktop";//PSDと同じ階層下に書き出したい時はvar docPath = doc.pathにする
var folder  = new Folder(docPath);
if (docName.indexOf(".") != -1) {
    var basename = docName.match(/(.*)\.[^\.]+$/)[1];
}
else {
    var basename = docName;
}
exportPng(doc, folder, basename+ '.gif');

function exportPng(doc, folder, name) {
    var file = new File(folder.fsName + "/" + name);
    var options = new ExportOptionsSaveForWeb(); 
    options.format = SaveDocumentType.COMPUSERVEGIF;
    options.quality = 0;
    doc.exportDocument(file, ExportType.SAVEFORWEB, options);
}
