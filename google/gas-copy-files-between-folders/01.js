function copyMoveFile() {
  // コピー元のフォルダIDを指定
  var source_dat = DriveApp.getFolderById("xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx");

  // コピー先のフォルダIDを指定
  var copy_dir = DriveApp.getFolderById("xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx");

  // フォルダ内のファイルを取得
  var files = source_dat.getFiles();

  while (files.hasNext()) {
    var file = files.next();
    var f = file.makeCopy(file.getName(), copy_dir);

    // Google Apps Scriptファイルの場合は特殊処理
    if (file.getMimeType() === MimeType.GOOGLE_APPS_SCRIPT) {
      Drive.Files.update({ parents: [{ id: copy_dir }] }, f.getId());
    }
  }
}
