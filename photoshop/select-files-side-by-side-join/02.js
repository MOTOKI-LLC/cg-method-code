app.bringToFront();
//新規ドキュメント
var newDoc = documents.add(512, 512, 72, 'sample', NewDocumentMode.RGB, DocumentFill.TRANSPARENT, 1);
var doc = activeDocument;
doc.suspendHistory("レイヤーを縦に並べる", "main()");

function main() {
    //ファイルを読み込む
    sub1();

    //レイヤーを横にぴったり並べる
    sub2();

    function sub1() {
        var fileObj = new File();
        var fileArray = fileObj.openDlg('ファイルを選択してください:', '*', true);
        
        saveName = fileArray[0].name;
        savePath = fileArray[0].path;
       
        for (var i = 0; i < fileArray.length; i++) {
            var doc = open(fileArray[i]);
            //新しくドキュメントに読み込み
            doc.artLayers.add();
            //レイヤーを統合（透明のレイヤーと統合するので影響なし）
            doc.mergeVisibleLayers();
            //読み込んだファイル名を取得
            var name = doc.name;
            var layer = doc.activeLayer;
            //レイヤー名をドキュメント名に
            layer.name = name;
            //始めに作った新規ドキュメントへ複製コピー
            layer.duplicate(newDoc, ElementPlacement.PLACEATBEGINNING);
            //読み込んだドキュメントを閉じる
            doc.close(SaveOptions.DONOTSAVECHANGES);
        }

        //一番下のレイヤーの削除
        var layObj = activeDocument.artLayers;
        var bgLayer = layObj[layObj.length - 1];
        bgLayer.remove();
    }

    function sub2() {

        var lay = doc.layers;
        var len = doc.artLayers.length;

        function getSize(layer) {
            var height = parseInt(layer.bounds[3]) - parseInt(layer.bounds[1]);
            var width = parseInt(layer.bounds[2]) - parseInt(layer.bounds[0]);
            return {
                height: height,
                width: width
            };
        }

        function getPosition(layer) {
            var left = parseInt(layer.bounds[0]);
            var top = parseInt(layer.bounds[1]);
            return {
                left: left,
                top: top
            };
        }

        for (var i = len - 1; i >= 0; i--) {
            //レイヤー数が2以上場合
            if (len >= 2) {
                //一番下のレイヤー
                if (i == len - 1) {}
                //それ以外は、1つ下のレイヤーの下端に上端を合わせる
                if (i <= len - 2) {
                    var A = getPosition(lay[i + 1]).top + getSize(lay[i + 1]).height;
                    lay[i].translate(0, A - getPosition(lay[i]).top);
                }
            }
        }

        function SavePng() {
            var doc = app.activeDocument;
            var docName = doc.name;
            var docPath = savePath; //'~/Desktop/';
            var folder = new Folder(docPath);
            if (docName.indexOf(".") != -1) {
                var baseName = docName.match(/(.*)\.[^\.]+$/)[1];
            } else {
                var baseName = docName;
            }
            if (folder == null) {
                return;
            }
            exportPng(doc, folder, baseName + '_結合' + '.png');
        }

        function exportPng(doc, folder, name) {
                var file = new File(folder.fsName + "/" + name);
                var options = new ExportOptionsSaveForWeb();
                options.format = SaveDocumentType.PNG;
                options.optimized = true;
                options.interlaced = false;
                doc.exportDocument(file, ExportType.SAVEFORWEB, options);
            }
            //すべての領域を表示
        activeDocument.revealAll();

        //透明部分のトリミング
        activeDocument.trim(TrimType.TRANSPARENT, true, true, true, true);

        //画像の統合
        //activeDocument.flatten();

        //同階層に保存
        //SavePng();
    }
}
