(function(){
    var doc = app.activeDocument;

    try {
        if (app.documents.length > 0 ) {
            var file = new File("~/Desktop"+"/"+doc.name); 
            var exportOptions =  new ExportOptionsSVG();            
            exportOptions.artBoardClipping = false;
            exportOptions.compressed = 0;
            exportOptions.embedRasterImages = 1;
            exportOptions.embedAllFonts = 1;
            exportOptions.preserveEditability = 1;
            doc.exportFile(file, ExportType.SVG, exportOptions);
        }

        else{
            throw new Error('ドキュメントが開かれていません。');
        }
    }
    catch(e) {
        alert( e.message, "スクリプト警告", true);
    }
})();
