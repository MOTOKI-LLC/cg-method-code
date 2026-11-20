function myFunction() {
  console.log('時間主導トリガーの実行: ' + new Date().toISOString());
}

function createTimeTrigger() {
  const exists = ScriptApp.getProjectTriggers().some(function (trigger) {
    return trigger.getHandlerFunction() === 'myFunction' &&
      trigger.getEventType() === ScriptApp.EventType.CLOCK;
  });
  if (exists) {
    console.log('同じ関数の時間主導トリガーがあります。設定画面で間隔を確認してください。');
    return;
  }
  ScriptApp.newTrigger('myFunction').timeBased().everyHours(6).create();
}
