#target photoshop
app.bringToFront();
displayDialogs = DialogModes.NO;

var myMaxPages = 100;
var myCounter = 1;
var myResolution = 300;
var myColor = OpenDocumentMode.CMYK;

app.backgroundColor.rgb.red = 255;
app.backgroundColor.rgb.green = 255;
app.backgroundColor.rgb.blue = 255;

var _pdfDatei = File.openDialog("PDFファイルの選択");
var myDatei = "" + _pdfDatei;
var myEndung = myDatei.substr(myDatei.length-4,4);

if (myEndung !== ".pdf") {
    alert("選択されたPDFがありません。", "ファイル選択エラー");
} else {
    var pdfOpenOptions = new PDFOpenOptions;
    pdfOpenOptions.antiAlias = true;
    pdfOpenOptions.mode = myColor;
    pdfOpenOptions.bitsPerChannel = BitsPerChannelType.EIGHT;
    pdfOpenOptions.resolution = myResolution;
    pdfOpenOptions.supressWarnings = true;
    pdfOpenOptions.cropPage = CropToType.TRIMBOX;
    pdfOpenOptions.page = myCounter;

    open(_pdfDatei, pdfOpenOptions);
    var myDocument1 = app.activeDocument;
    var myLayerName = app.activeDocument.name;
    myDocument1.activeLayer.name = myLayerName;

    for (myCounter = 2; myCounter < myMaxPages; myCounter++) {
        try {
            pdfOpenOptions.page = myCounter;
            open(_pdfDatei, pdfOpenOptions);
            myLayerName = app.activeDocument.name;
            app.activeDocument.activeLayer.name = myLayerName;
            app.activeDocument.selection.selectAll();
            app.activeDocument.selection.copy(true);
            app.activeDocument.close(SaveOptions.DONOTSAVECHANGES);
            app.activeDocument = myDocument1;
            myDocument1.paste();
            myDocument1.activeLayer.name = myLayerName;
        } catch (e) {
            alert("Done");
            myCounter = myMaxPages;
        }
    }
}
