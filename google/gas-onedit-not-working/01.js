function handleEdit(e) {
  if (!e || !e.range) {
    throw new Error('実行ボタンではなく、練習用シートのセルを直接編集してください。');
  }
  console.log('編集した範囲: ' + e.range.getA1Notation());
}

function createEditTrigger() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) throw new Error('スプレッドシートの「拡張機能」から開いてください。');
  const exists = ScriptApp.getProjectTriggers().some(function (trigger) {
    return trigger.getHandlerFunction() === 'handleEdit' &&
      trigger.getEventType() === ScriptApp.EventType.ON_EDIT &&
      trigger.getTriggerSourceId() === ss.getId();
  });
  if (exists) return;
  ScriptApp.newTrigger('handleEdit').forSpreadsheet(ss).onEdit().create();
}
