function doGet() {
  const toppage = HtmlService.createTemplateFromFile("index");
  return toppage.evaluate();
}

function doPost(postdata) {
  const temp_id = postdata.parameters.date_temp_id.toString();
  const folder_id = postdata.parameters.date_folder_id.toString();
  const filename = postdata.parameters.date_filename.toString();

  copyFile(temp_id,folder_id,filename);

  const resultpage = HtmlService.createTemplateFromFile("result");
  return resultpage.evaluate();
}

function copyFile(temp_id,folder_id,filename) {
  var temp = DriveApp.getFileById(temp_id);
  var folder = DriveApp.getFolderById(folder_id);
  temp.makeCopy(filename, folder);
}
