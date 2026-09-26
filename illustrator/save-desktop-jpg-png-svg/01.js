(function(){
    var doc = app.activeDocument;
    try {
        if (app.documents.length > 0 ) {
            var file = new File("~/Desktop"+"/"+doc.name); 
            var exportOptions =  new ExportOptionsJPEG();
            exportOptions.artBoardClipping = false;  
            exportOptions.resolution = 72;  
            exportOptions.antiAliasing = true;  
            exportOptions.optimization = true;
            exportOptions.qualitySetting = 100;
            doc.exportFile(file, ExportType.JPEG, exportOptions);
        }
        else{
            throw new Error('ドキュメントが開かれていません。');
        }
    }
    catch(e) {
        alert( e.message, "スクリプト警告", true);
    }
})();
