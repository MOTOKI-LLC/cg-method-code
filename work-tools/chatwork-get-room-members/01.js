var ChatworkToken = "チャットワークAPIトークン";
var sheet_name = "シート1";
var room_id = "ルームID";
var url =  "https://api.Chatwork.com/v2/rooms/" + room_id + "/members";
var sheet = SpreadsheetApp.getActive().getSheetByName(sheet_name);

function getRooms(){
  var params = {
    headers : {"X-ChatworkToken" : ChatworkToken },
    method : "get"
  }; 
  var strRespons = UrlFetchApp.fetch(url, params); 
  var json = JSON.parse(strRespons.getContentText()); 

  for each(var obj in json){
      sheet.appendRow([obj.name, obj.account_id]);
  }
}
