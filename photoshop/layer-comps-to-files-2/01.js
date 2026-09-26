#target photoshop
$.localize = true;

// UIテキスト
var strTitle = localize("$$$/JavaScripts/LayerCompsToFiles/Title=レイヤーコンプをファイルに保存");
var strButtonRun = localize("$$$/JavaScripts/LayerCompsToFiles/Run=実行");
var strButtonCancel = localize("$$$/JavaScripts/LayerCompsToFiles/Cancel=キャンセル");
var strHelpText = localize("$$$/JavaScripts/LayerCompsToFiles/Help=各レイヤーコンプをファイルに保存するフォーマットと場所を指定してください。");
var strLabelDestination = localize("$$$/JavaScripts/LayerCompsToFiles/Destination=保存先:");
var strButtonBrowse = localize("$$$/JavaScripts/LayerCompsToFiles/Browse=参照...");
var strLabelFileNamePrefix = localize("$$$/JavaScripts/LayerCompsToFiles/FileNamePrefix=ファイル名の接頭辞:");

// メイン処理
main();

function main() {
    if (app.documents.length <= 0) {
        alert("ドキュメントが開かれていません。");
        return 'cancel';
    }

    var exportInfo = new Object();
    initExportInfo(exportInfo);
    
    if (DialogModes.ALL == app.playbackDisplayDialogs) {
        if (cancelButtonID == settingDialog(exportInfo)) {
            return 'cancel';
        }
    }

    try {
        var docRef = app.activeDocument;
        var compsCount = docRef.layerComps.length;
        if (compsCount < 1) {
            alert("レイヤーコンプがありません。");
            return 'cancel';
        }

        for (var i = 0; i < compsCount; i++) {
            var compRef = docRef.layerComps[i];
            if (exportInfo.selectionOnly && !compRef.selected) continue;
            compRef.apply();
            var duppedDocument = docRef.duplicate();
            var fileName = generateFileName(compRef, exportInfo, i);
            saveFile(duppedDocument, fileName, exportInfo);
            duppedDocument.close(SaveOptions.DONOTSAVECHANGES);
        }

        alert("処理が完了しました。");
    } catch (e) {
        alert("エラーが発生しました: " + e);
        return 'cancel';
    }
}

function initExportInfo(exportInfo) {
    exportInfo.destination = "";
    exportInfo.fileNamePrefix = "layercomp";
    exportInfo.selectionOnly = false;
    exportInfo.fileType = "png";
}

function generateFileName(compRef, exportInfo, index) {
    var fileName = [];
    if (exportInfo.fileNamePrefix) fileName.push(exportInfo.fileNamePrefix);
    fileName.push(index.toString().padStart(4, '0'));
    fileName.push(compRef.name);
    return fileName.join('_').replace(/[:/\\*?"<>|\r\n]/g, "_");
}

function saveFile(docRef, fileName, exportInfo) {
    var savePath = new File(exportInfo.destination + "/" + fileName + ".png");
    var pngSaveOptions = new PNGSaveOptions();
    pngSaveOptions.interlaced = false;
    docRef.saveAs(savePath, pngSaveOptions, true, Extension.LOWERCASE);
}
