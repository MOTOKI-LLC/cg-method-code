(function(){
    var doc = app.activeDocument;
    try {
        if (app.documents.length > 0 ) {
            var file = new File("~/Desktop"+"/"+doc.name); 
            var exportOptions = new ExportOptionsPNG24();
            exportOptions.artBoardClipping = false;  
            exportOptions.resolution = 72;  
            exportOptions.antiAliasing = true;  
            exportOptions.transparency= true;  
            doc.exportFile(file, ExportType.PNG24, exportOptions);
        }
        else{
            throw new Error('ドキュメントが開かれていません。');
        }
    }
    catch(e) {
        alert( e.message, "スクリプト警告", true);
    }
})();
