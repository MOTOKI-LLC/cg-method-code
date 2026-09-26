function exportPdf() {
  var folder = "フォルダのID"; // 保存先フォルダのID

  // 変換するファイルの数
  var last = 2;

  // 変換したいスライドのファイルIDを配列で指定
  var fileId = [
    "ファイルのスライドID①",
    "ファイルのスライドID②",
  ];

  for (let i = 0; i < last; i++) {
    var slideFile = DriveApp.getFileById(fileId[i]);
    var pdfFile = slideFile.getAs(MimeType.PDF); // PDFに変換
    DriveApp.getFolderById(folder).createFile(pdfFile); // フォルダに保存
  }
}
