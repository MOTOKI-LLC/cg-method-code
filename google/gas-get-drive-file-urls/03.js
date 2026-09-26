function getFileListInFolder() {
  var folderId = "XXXXXXXXXXXXXXXXXXXXXXXXXX"; // フォルダIDを直接記入
  var files = DriveApp.getFolderById(folderId).getFiles(); 
  var list = [];

  while (files.hasNext()) {
    var file = files.next();   
    var imageUrl = file.getUrl();
    imageUrl = imageUrl.replace("file/d/", "uc?export=view&id=");
    imageUrl = imageUrl.replace("/view?usp=drivesdk", "");
    list.push([file.getName(), imageUrl]);
  }

  var sheet = SpreadsheetApp.getActive().getSheetByName("シート1");
  var range = sheet.getRange(2, 1, list.length, list[0].length);
  range.setValues(list);
}
