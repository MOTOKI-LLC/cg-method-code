function test(message) {
   var token = "APIトークン"
   var roomID = "ルームID";
   var filename = "sample.png";
   var file = DriveApp.getFilesByName(filename).next();//ドライブ内の同一名のファイル  
   var params = {
     headers : {"X-ChatworkToken" : token},
     method : "post",
     payload: {'file':Utilities.newBlob(file.getBlob().getBytes(), 'image/png', "sample.png") },
     muteHttpExceptions : true,
   };  
   var url = "https://api.Chatwork.com/v2/rooms/" + roomID + "/files";  
   UrlFetchApp.fetch(url, params);
 }
