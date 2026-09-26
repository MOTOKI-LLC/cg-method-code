function CGM_SavePngToDesktop() {
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
  if (folder == null) {
    return;
  }
  exportPng(doc, folder, basename+ '.png');
}
function exportPng(doc, folder, name) {
    var file = new File(folder.fsName + "/" + name);
    var options = new ExportOptionsSaveForWeb();
    options.format = SaveDocumentType.PNG;
    options.optimized = true;
    options.interlaced = false;
    doc.exportDocument(file, ExportType.SAVEFORWEB, options);
}
CGM_SavePngToDesktop();
