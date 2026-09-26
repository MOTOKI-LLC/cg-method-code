function deleteExcludedSheets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const allSheets = ss.getSheets();
  
  // 残したいシート名を配列で指定
  const keepSheets = ['勤怠', '共通', '名簿'];
  
  // 各シートをチェックして、keepSheetsに含まれていなければ削除
  allSheets.forEach(sheet => {
    const sheetName = sheet.getName();
    if (!keepSheets.includes(sheetName)) {
      ss.deleteSheet(sheet);
    }
  });
  
  Logger.log('削除完了');
}
