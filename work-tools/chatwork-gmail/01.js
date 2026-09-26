var API_TOKEN = 'ChatworkのAPIトークン'
, ROOM_ID = 'ルームID'
, TARGET_ID = 'ユーザーID'
, LABEL = '(label:notify)'
, UNREAD_LABEL = GmailApp.getUserLabelByName('notify')
;
function send(message) {
var params = {
headers : {"X-ChatworkToken" : API_TOKEN},
method : "post",
payload : { body : message }
}
, url = "https://api.Chatwork.com/v2/rooms/" + ROOM_ID + "/messages"
;
UrlFetchApp.fetch(url, params);
}
function checkNewMessage() {
var query = LABEL
, thread = GmailApp.search(query, 0, 3)
, importantMessages = GmailApp.getMessagesForThreads(thread)
;
for(var i in importantMessages) {
var body = ''
, message = ''
;
body = importantMessages[i][0].getPlainBody() || null;
message = "[To:" + TARGET_ID + "]様へnメールが届きました。nn" + body;
send(message);
}
thread.forEach(function(t) {
t.removeLabel(UNREAD_LABEL);
});
}
