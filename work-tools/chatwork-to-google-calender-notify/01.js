//スプレッドシートに保持するデータ//1カラム目・・・イベントの開始時刻//2カラム目・・・イベントのIDvar EVENT_START_TIME_COLUMN = 1;
var EVENT_ID_COLUMN = 2;
//------------------------------------------//カレンダーにひもづくGmailのメールアドレスvar MAIL_ADDR ="Gmailのメールアドレス";
//ChatWorkのAPIトークン
var CHATWORK_API_TOKEN ="ChatWorkのAPIトークン";
//------------------------------------------
//何分前に通知するか
var WHAT_MINUTES_AGO = 3;
var now;
//チャットワークに開始直前のGoogleカレンダーのイベントを通知します。
//同じイベントを何度も通知しないよう、スプレッドシートに通知済みのイベントを登録します。
function notify(){
//通知日時以内に始まる自分のイベントを取得
now =new Date();
var future =new Date(now.getTime() + (WHAT_MINUTES_AGO * 60 * 1000));
var events = CalendarApp.getDefaultCalendar().getEvents(now, future);
//ChatWorkClientの作成
var client = ChatWorkClient.factory({token: CHATWORK_API_TOKEN});
//スプレッドシートの取得
var sheet = SpreadsheetApp.getActiveSheet();
//通知済みとしてスプレッドシートに記録されているイベントで現在時刻よりも前に開始したものをクリア
clearOldEventOnSpreadSheet(sheet);
//取得できたイベント数分繰り返す
events.forEach(function(event){
//すでに開始済みのイベントをスキップ
if(event.getStartTime().getTime() <= now.getTime()){
return;
}
//通知済みでないイベントをチャットワークに通知
if(alreadyNotifiedEvent(sheet,event) ==false){
Logger.log("イベント:" +event.getId() +"を通知します。");
//★ChatWorkのマイチャットへ通知       
Logger.log(createMessage(event));
var message =　createMessage(event);
var room_id ='ルームID';
//client.sendMessageToMyChat(createMessage(event));
client.sendMessage({room_id: room_id, body: message});
var res = client.sendMessage({room_id: room_id, body: message});
// 「未読をつける」メソッドを追加
client.makeMessageUnread =function(room_id, message_id){
returnthis.put("/rooms/" + room_id +"/messages/unread",{"message_id": message_id});
}
//通知済みであることをスプレッドシートに記録
writeEventIdAndStartTime(sheet,event);
// 投稿直後ではAPIが失敗することがあるので、6秒ごとに10回トライする
var err;
for (var i = 0; i < 10; i++){
try{
client.makeMessageUnread(room_id, res['message_id']);
return;
}catch(e){
if (e["errors"] ==="The messages is already marked as unread.")return;
err = e;
Utilities.sleep(6000);
continue;
}
}
throw err;
}else{
Logger.log("すでに通知済みのイベント:" +event.getId() +"をスキップします。");
}
});
}
//ChatWorkへ通知するメッセージの組み立て
function createMessage(event){
var startDate =event.getStartTime();
var endDate =event.getEndTime();
var title =event.getTitle();
varlocation =event.getLocation();
var msg ="【Googleカレンダー通知】";
msg = msg + getDateString(startDate);
msg = msg +"から" + title;
if(location !=""){
msg = msg +"[" +location +"]";
}
msg ="[To:ユーザーID]" + msg +"が始まります";
return msg;
}
//日時の組み立て
function getDateString(date){
var hour = date.getHours();
var minutes = date.getMinutes();
if(minutes == 0){
return hour +"時";
}else{
return hour +"時" + minutes +"分";
}
}
//スプレッドシートに記録されたイベントの中から24時間以上前に開始したイベントを削除し開始時刻順にソート
function clearOldEventOnSpreadSheet(sheet){
//24時間以前の通知を削除
var lastRow = sheet.getLastRow();
for(var row = 1; row <= lastRow; row++){
var startTime = sheet.getRange(row, EVENT_START_TIME_COLUMN).getValue();
var startTimeDate = <span class="synType">Date.parse(startTime);
//イベントの開始時刻が現在時刻よりも後であればクリア
if(startTimeDate < now.getTime()){
//特定行の1,2カラムの値を削除
var range = sheet.getRange(row, 1, 1, 2);
range.clear();
}
}
//スプレッドシートをイベントの開始時刻順にソート
sheet.sort(EVENT_START_TIME_COLUMN);
}
//イベントがすでに通知済みとしてスプレッドシートに記載されていたらtrueを返却
function alreadyNotifiedEvent(sheet,event){
var lastRow = sheet.getLastRow();
for(var row = 1; row <= lastRow; row++){
var eventId = sheet.getRange(row, EVENT_ID_COLUMN).getValue();
//Idがすでにスプレッドシートに登録済みであればtrue
if(eventId ==event.getId()){
returntrue;
}
}
returnfalse;
}
//スプレッドシートにイベントの開始時刻とイベントIDを記録
function writeEventIdAndStartTime(sheet,event){
var lastRow = sheet.getLastRow();
sheet.getRange(lastRow + 1, EVENT_START_TIME_COLUMN).setValue(event.getStartTime());
sheet.getRange(lastRow + 1, EVENT_ID_COLUMN).setValue(event.getId());
}
