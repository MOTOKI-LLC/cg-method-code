function AutoSheetCopy() {
  var ss = SpreadsheetApp.getActiveSpreadsheet(); 
  var templateSheet = ss.getSheetByName('master'); 
  if (!templateSheet) throw new Error('masterシートが見つかりません');
  var targetName = getDate();
  if (ss.getSheetByName(targetName)) return;
  ss.insertSheet(targetName, 0, {template: templateSheet}); 
}

// 現在の年月（YYYYMM）を取得
function getDate() {
  var today = new Date(); 
  return Utilities.formatDate(today, "JST", "yyyyMM");
}
