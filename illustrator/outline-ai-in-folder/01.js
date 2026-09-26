sourceFolder = Folder.selectDialog('フォルダを選択してください', '~');

if (sourceFolder != null) {
    var files = new Array();
    var fileType = "*.ai";
    var files = sourceFolder.getFiles(fileType);

    if (files.length > 0) {
        var destFolder = sourceFolder;
        for (i = 0; i < files.length; i++) {
            var sourceDoc = app.open(files[i]);
            var docObj = app.activeDocument;
            
            // アウトライン処理
            createOutline();

            var saveFile = new File(sourceFolder + ".ai");
            var targetFile = getNewName();
            docObj.saveAs(targetFile);
            docObj.close();
        }
    } else {
        alert('一致するファイルが見つかりません');
    }
}

function getNewName() {
    var docName = sourceDoc.name;
    var ext = '.ai';
    var newName = "";

    for (var i = 0; docName[i] != "."; i++) {
        newName += docName[i];
    }
    newName += "_ol" + ext;
    var saveInFile = new File(destFolder + '/' + newName);
    return saveInFile;
}

function createOutline() {
    type = activeDocument.textFrames;
    layers = activeDocument.layers;

    for (y = 0; y < layers.length; y++) layers[y].locked = false;
    a1 = [];
    for (p = 0; p < type.length; p++) {
        a1.push(type[p]);
    }
    i = 0;
    for (a = 0; a < a1.length; a++) {
        outline = a1[a].createOutline();
        outline.selected = true;
        i++;
    }
}
