function sendMessageTest() {
  var client = ChatworkClient.factory({
    token: 'ここにAPIを入力'
  });
  client.sendMessage({
    room_id: ここにルームIDを入力,
    body: '送りたい内容を入力'
  });
}
