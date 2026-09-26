function importDriveImagesToNewSheet() {
  const FOLDER_ID = '対象フォルダID';
  const MAX_IMAGES = 50;
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const files = DriveApp.getFolderById(FOLDER_ID).getFiles();
  // 既存シートを消去せず、新しいシートを作ります。
  const sheet = ss.insertSheet('画像一覧_' + Date.now());
  sheet.getRange(1, 1, 1, 3).setValues([['ファイル名', '元ファイル', '画像（セル上）']]);
  sheet.setColumnWidth(3, 160);
  let count = 0;
  while (files.hasNext() && count < MAX_IMAGES) {
    const file = files.next();
    if (!['image/png', 'image/jpeg', 'image/gif'].includes(file.getMimeType())) continue;
    const row = ++count + 1;
    sheet.getRange(row, 1).setValue("'" + file.getName());
    sheet.getRange(row, 2).setValue(file.getUrl());
    sheet.setRowHeight(row, 110);
    try {
      const blob = file.getBlob();
      if (blob.getBytes().length > 2 * 1024 * 1024) throw new Error('2MBを超えています');
      const image = sheet.insertImage(blob, 3, row);
      const scale = Math.min(140 / image.getWidth(), 100 / image.getHeight(), 1);
      image.setWidth(Math.max(1, Math.round(image.getWidth() * scale)));
      image.setHeight(Math.max(1, Math.round(image.getHeight() * scale)));
      image.setAltTextTitle(file.getName());
    } catch (error) {
      sheet.getRange(row, 3).setValue('挿入できません: ' + error.message);
    }
  }
}
