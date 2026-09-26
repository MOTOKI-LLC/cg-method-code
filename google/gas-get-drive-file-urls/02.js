function getFileListInFolder() {
  var url = 'https://drive.google.com/drive/folders/フォルダID';
  var folderId = url.split('/').pop();
  var folder = DriveApp.getFolderById(folderId);
  var files = folder.getFiles();
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
