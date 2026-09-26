function notifyDuty() {
  var date = new Date();
 
  if(isBusinessDay(date)){
    deleteTrigger();
    sendChatwork();
  }else{
     Logger.log('休日です');
  }
}

// その日の10時00分にトリガーを設定
function setTrigger() {
  var triggerDay = new Date();
  triggerDay.setHours(10);
  triggerDay.setMinutes(00);
  ScriptApp.newTrigger("Touban").timeBased().at(triggerDay).create();
}

// その日のトリガーを削除する関数(消さないと残る)
function deleteTrigger() {
  var triggers = ScriptApp.getProjectTriggers();
  for(var i=0; i < triggers.length; i++) {
    if (triggers[i].getHandlerFunction() == "Touban") {
      ScriptApp.deleteTrigger(triggers[i]);
    }
  }
}

//営業日の判断をする関数
function isBusinessDay(date){
  if (date.getDay() == 0 || date.getDay() == 6) {
    return false;
  }
  var calJa = CalendarApp.getCalendarById('ja.japanese#holiday@group.v.calendar.google.com');
  if(calJa.getEventsForDay(date).length > 0){
    return false;
  }
  return true;
}

// chatworkにブログ当番関連の情報を送信する
function sendChatwork(){
 var obj = new Object();
 // 必要な情報をセットする
 obj = setInfos(obj);
 // chatworkへメッセージを送信
 sendMessage(obj);
 //　chatworkへタスクを追加
 addTask(obj);
}

// 必要な情報をセットする
function setInfos(obj){
 // APIトークン
 obj.token = 'ChatWorkのAPIトークン';
 // ルームID
 obj.roomId = 'ルームID';
 // タスク内容
 obj.task = 'タスク名';
 // 期限
 var date = new Date();
 date = new Date(date.setDate(date.getDate()+4));
 obj.limit = date.getTime()/1000;

// スプレットシートから情報を取得
 // 宛先のシート情報を取得
 var mySheet=SpreadsheetApp.openById("スプレッドシートのID");
 //　シートの開始行番号、開始列番号を取得
 var startRow = 2;
 var startCol = 1;
 //　シートの最終行番号、最終列番号を取得
 var endRow = mySheet.getLastRow() - 1; // 最初の行は不要なためマイナス1とする
 var endCol = mySheet.getLastColumn();

 // シートの範囲を指定して情報を取得
 var sheetdata = mySheet.getSheetValues(startRow, startCol, endRow, endCol);
 var dataCount = sheetdata.length;
 //Logger.log('sheetdata:'+sheetdata);

 //　送信内容のシート情報を取得
 var subSheet = mySheet.getSheetByName("シート2");
 var submitContent = subSheet.getRange(2, 1).getValue();

 // ブログ担当者を変数に抜出し
 var strName = '';
 for(var i = 0; i < dataCount; i++){
  if(sheetdata[i][2] == 1.0){
   strName = '"'+ sheetdata[i][0] + '"';
  }
 }
 for(var i = 0; i < dataCount; i++){
  // To
  if(sheetdata[i][2] == 1.0){
   obj.toIds = sheetdata[i][1];
  }
  // ブログ当番の順番を更新する
  var y = i +　2;
  if(sheetdata[i][2] == 1.0){
   mySheet.getRange("C"+ y).setValue(dataCount);
  } else {
   var setNumber = sheetdata[i][2] - 1.0;
   mySheet.getRange("C"+ y).setValue(setNumber);
  }
 }

 //　ブログ当番の名前を置換して挿入
 var member = getMember(obj);
   obj.body = "[To:" + obj.toIds.toFixed() + "]"+ member + "さん\n";
   obj.body += submitContent.replace(/{NAME1}/,strName);
  return obj;
 }

 // chatworkのルームからブログ当番の名前を取得
 function getMember(obj){
  var params = {
   headers : {"X-ChatWorkToken" : obj.token},
   method : "get",
  };
  var url = "https://api.chatwork.com/v2/rooms/" + obj.roomId + "/members"
  var response = UrlFetchApp.fetch(url, params);
  // jsonをテキスト形式に変換
  var json=JSON.parse(response.getContentText());
  for(var i = 0; i < json.length; i++){
   if(json[i]['account_id'].toFixed() == obj.toIds.toFixed()){
    obj.name = json[i]['name'];
   }
  }
  return obj.name;
 }

// chatworkへブログの当番のメッセージを通知する
function sendMessage(obj){
 var params = {
  headers : {"X-ChatWorkToken" : obj.token},
  method : "post",
  payload : {
   body : obj.body
  }
 };
 var url = "https://api.chatwork.com/v2/rooms/" + obj.roomId + "/messages";
 UrlFetchApp.fetch(url, params);
}

// chatworkへブログの当番のタスクを追加する
function addTask(obj){
 var params = {
  headers : {"X-ChatWorkToken" : obj.token},
  method : 'post',
  payload : {
   body : obj.task,
   limit : obj.limit.toFixed(),
   to_ids : obj.toIds.toFixed()
  }
 };
 var url = "https://api.chatwork.com/v2/rooms/" + obj.roomId + "/tasks";
 UrlFetchApp.fetch(url, params);
}
