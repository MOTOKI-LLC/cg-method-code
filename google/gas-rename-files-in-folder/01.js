function renameFile() {
  const folder_Id = "フォルダのID"; // 対象のフォルダIDを入力
  const folder = DriveApp.getFolderById(folder_Id);
  const files = folder.getFiles();

  while (files.hasNext()) {
    const file = files.next();
    const name = file.getName().replace("置換前の名前", "置換後の名前");
    file.setName(name);
  }
}
