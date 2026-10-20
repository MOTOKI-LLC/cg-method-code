// 選んだPSDをすべて開き、1つずつ画像アセットをオンにする
// 書き出しはスクリプトが終わってからGeneratorが行うので、ここでは閉じない
var gn_file = new File(app.path.fsName + "\\Presets\\Scripts\\generate.jsx");

var files = app.openDialog();

if (files && files.length > 0) {
    for (var i = 0; i < files.length; i++) {
        app.open(files[i]);
        $.evalFile(gn_file);
    }

    alert(files.length + " 個のPSDで画像アセットをオンにしました。\n"
        + "書き出しはこの窓を閉じた後に始まります。\n"
        + "「PSD名-assets」フォルダーができたら、PSDを保存せずに閉じてください。");
}
