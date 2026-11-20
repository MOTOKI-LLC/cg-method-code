app.bringToFront();
main();

function main()
{
    var folderObj = new Object();
    var sourceFolder = Folder.selectDialog('フォルダを選択してください:', Folder(folderObj));
    var docs = sourceFolder.getFiles("*.psd");
    var fileArray = new Array();
    var len = docs.length;

    for (var i = 0; i < len; i++)
    {
        var doc = docs[i];
        fileArray.push(doc);
    }

    for (var i = 0; i < fileArray.length; i++)
    {
        var doc = open(fileArray[i]);
        var docName = doc.name;
        if (docName.indexOf(".") != -1)
        {
            var basename = docName.match(/(.*)\.[^\.]+$/)[1]
        } else
        {
            var basename = docName
        }

        exportJpg(doc, sourceFolder, basename + '.jpg');
        doc.close(SaveOptions.DONOTSAVECHANGES);
    }
}

function exportJpg(doc, folder, name)
{
    var file = new File(folder.fsName + "/" + name);
    var options = new ExportOptionsSaveForWeb();
    options.format = SaveDocumentType.JPEG;
    options.includeProfile = false;
    options.interlaced = false;
    options.optimized = true;
    options.lossy = 0;
    options.quality = 100;
    doc.exportDocument(file, ExportType.SAVEFORWEB, options);
}
