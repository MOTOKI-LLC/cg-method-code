app.bringToFront();
main();

function main() {
    var fileObj = new File();
    var fileArray = fileObj.openDlg('ファイルを選択してください:', '', true);
    //新規ドキュメント
    var newDoc = documents.add(512, 512, 72, 'test', NewDocumentMode.RGB, DocumentFill.TRANSPARENT, 1);

    for (var i = 0; i < fileArray.length; i++) {
        var doc = open(fileArray[i]);
        //モードをRGBに 
        doc.changeMode(ChangeMode.RGB);
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

    //すべての領域を表示
    activeDocument.revealAll();
    //透明部分のトリミング
    activeDocument.trim(TrimType.TRANSPARENT, true, true, true, true);
}
