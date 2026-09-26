function myFunction() {
  var folder = DriveApp.getFolderById("フォルダID"); // 対象フォルダのID
  var contents = folder.getFiles();
  var i = 0;
  while(contents.hasNext()) {
    contents.next();
    i++;
  }
  Logger.log("このフォルダ内のファイル数は " + i + " です。");
}
