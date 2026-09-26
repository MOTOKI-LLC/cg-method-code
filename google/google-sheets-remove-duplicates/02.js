function resetValue() {
  const id = '★スプレッドシートID★';
  const sheet = SpreadsheetApp.openById(id).getSheetByName('シート1');
  if (!sheet) throw new Error('シート1が見つかりません');
  const lastRow = sheet.getLastRow();
  if (lastRow >= 2) sheet.getRange(2, 1, lastRow - 1, 1).clearContent();
}
