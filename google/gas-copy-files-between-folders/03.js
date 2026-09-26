function copyMoveFile() {
  //コピーする場所（フォルダIDを入力）
  var source_dat = DriveApp.getFolderById("xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx");

  //保存する場所（フォルダIDを入力）
  var copy_dir = DriveApp.getFolderById("xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx");

  var files = source_dat.getFiles();

  while (files.hasNext()) {
    var file = files.next();
    var f = file.makeCopy(file.getName(), copy_dir);
    if (file.getMimeType() == MimeType.GOOGLE_APPS_SCRIPT) {
      Drive.Files.update({ parents: [{ id: copy_dir }] }, f.getId());
    }
  }
}
