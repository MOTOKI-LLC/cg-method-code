function onOpen() {
  var ui = SpreadsheetApp.getUi();
  var menu = ui.createMenu('カスタムメニュー');
  menu.addItem('テスト', 'test.onClickItem1');
  menu.addToUi();
}

function onClickItem1() {
  Browser.msgBox('クリックされました。');
}
