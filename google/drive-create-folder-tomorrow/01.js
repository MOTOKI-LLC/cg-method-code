function createFolder() {
  var folderid = "Googleドライブ上のID"; // TESTなど任意のフォルダ
  var folder = DriveApp.getFolderById(folderid);
  var foldername = "テスト"; // 任意の名前

  var newfolder = folder.createFolder(foldername);

  // 子フォルダを作成
  var childFolder = DriveApp.getFolderById(newfolder.getId());
  var args1 = ["鈴木", "山田", "渡辺", "佐藤", "高橋", "田中"];

  for (var i = 0; i < args1.length; i++) {
    childFolder.createFolder(args1[i]);
  }
}
