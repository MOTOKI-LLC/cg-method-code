// 「未読をつける」メソッドを追加 var res = client.sendMessage({room_id: room_id, body: message});
client.makeMessageUnread =function(room_id, message_id){returnthis.put("/rooms/" + room_id +"/messages/unread",{"message_id": message_id});
}
//通知済みであることをスプレッドシートに記録
writeEventIdAndStartTime(sheet,event);
// 投稿直後ではAPIが失敗することがあるので、6秒ごとに2回トライする
var err;
for (var i = 0; i < 2; i++){
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
