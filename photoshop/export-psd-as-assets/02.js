// 前面のドキュメントで画像アセットをオンにする
// ［ファイル］→［生成］→［画像アセット］と同じ命令を、Photoshop付属のgenerate.jsxで送る
if (app.documents.length > 0) {
    $.evalFile(new File(app.path.fsName + "\\Presets\\Scripts\\generate.jsx"));
} else {
    alert("PSDを開いてから実行してください。");
}
