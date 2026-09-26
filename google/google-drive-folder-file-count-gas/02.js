function myFunction() {
  var objSpreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  objSpreadsheet.insertSheet("ファイル数", 0);
  var sheet = objSpreadsheet.getSheets()[0];
  var key = "親フォルダのID"; // フォルダIDを指定
  var rootFolder = DriveApp.getFolderById(key);
  var folderlist = [[rootFolder.getName(), key]];

  // 再帰的にフォルダを展開
  for (var i = 0; i < folderlist.length; i++) {
    var subFolders = DriveApp.getFolderById(folderlist[i][1]).getFolders();
    while (subFolders.hasNext()) {
      var folder = subFolders.next();
      folderlist.push([folderlist[i][0] + " > " + folder.getName(), folder.getId()]);
    }
  }

  // ヘッダー
  sheet.clear();
  sheet.getRange(1, 1).setValue("フォルダ名");
  sheet.getRange(1, 2).setValue("ファイル数");

  // ファイル数をカウント
  for (var j = 0; j < folderlist.length; j++) {
    var folder = DriveApp.getFolderById(folderlist[j][1]);
    var files = folder.getFiles();
    var count = 0;
    while (files.hasNext()) {
      files.next();
      count++;
    }
    sheet.getRange(j + 2, 1).setValue(folderlist[j][0]);
    sheet.getRange(j + 2, 2).setValue(count);
  }
}
