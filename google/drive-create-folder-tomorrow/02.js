function createFolder() {
  var folderid = "Googleドライブ上のID"; // TESTフォルダなど
  var folder = DriveApp.getFolderById(folderid);

  var now = new Date();
  var tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  var data = Utilities.formatDate(tomorrow, "JST", "yyyyMMdd"); // 例：20240530

  var newfolder = folder.createFolder(data); // 明日の日付がフォルダ名に

  var childFolder = DriveApp.getFolderById(newfolder.getId());
  var args1 = ["鈴木", "山田", "渡辺", "佐藤", "高橋", "田中"];

  for (var i = 0; i < args1.length; i++) {
    childFolder.createFolder(args1[i]);
  }
}
