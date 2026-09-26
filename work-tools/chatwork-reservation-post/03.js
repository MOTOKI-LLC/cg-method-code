function sendMessageMyroom() {
  var client = ChatworkClient.factory({token: 'チャットワークAPIトークン'});
  var todayDate = new Date();
  var todayDay = Utilities.formatDate( todayDate, 'Asia/Tokyo', 'yyyy年M月d日 h時m分');
  client.sendMessage({room_id: '送りたいルームID', body: '[hr]'+todayDay+'になりました！'});
}

// その日の10時14分にトリガーを設定
function setTrigger() {
  var triggerDay = new Date();
  triggerDay.setHours(10);
  triggerDay.setMinutes(14);
  ScriptApp.newTrigger("main").timeBased().at(triggerDay).create();
}

// その日のトリガーを削除する関数
function deleteTrigger() {
  var triggers = ScriptApp.getProjectTriggers();
  for(var i=0; i < triggers.length; i++) {
    if (triggers[i].getHandlerFunction() == "main") {
      ScriptApp.deleteTrigger(triggers[i]);
    }
  }
}

// 実行したいスクリプト本体
function main() {
  deleteTrigger();
  sendMessageMyroom();
}
