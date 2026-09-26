function setTimeStamp() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getActiveSheet();
  var time = Utilities.formatDate(new Date(), 'Asia/Tokyo', 'yyyy/MM/dd HH:mm');
  sheet.getActiveRange().setValue(time);
}

function onOpen() {
  var ui = SpreadsheetApp.getUi();
  var menu = ui.createMenu('マイツール'); 
  menu.addItem('タイムスタンプ', 'setTimeStamp');
  menu.addToUi();
}
