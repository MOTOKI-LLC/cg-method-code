function myFunction() {
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(10000)) throw new Error('同じスクリプトで別の処理が実行中です');
  try {
    const LogFile = SpreadsheetApp.openById('記録用のシートID');
    const LogFileSheet = LogFile.getSheetByName('シート1');
    if (!LogFileSheet) throw new Error('記録用のシート1がありません');
    if (LogFileSheet.getRange('A1').getValue() !== '') {
      throw new Error('A1に前回の出力IDがあります。出力先を確認してください');
    }
    const input = LogFileSheet.getRange('A3').getValue();
    if (!(input instanceof Date) || isNaN(input.getTime())) {
      throw new Error('A3に有効な日付を入力してください');
    }
    const date = Utilities.formatDate(input, LogFile.getSpreadsheetTimeZone(), 'yyMMdd');
    const templateFile = DriveApp.getFileById('コピー元のシートID');
    if (templateFile.getMimeType() !== 'application/vnd.google-apps.spreadsheet') {
      throw new Error('テンプレートにはGoogleスプレッドシートを指定してください');
    }
    const source = SpreadsheetApp.openById(templateFile.getId());
    const sourceSheet = source.getSheetByName('コピー元');
    if (!sourceSheet) throw new Error('テンプレートにコピー元シートがありません');
    if (source.getSheetByName(date)) throw new Error('テンプレートに同じ日付名のシートがあります');
    const sourceCells = sourceSheet.getRange('A1:H1');
    for (let col = 1; col <= 8; col++) {
      if (sourceCells.getCell(1, col).isChecked() === null) {
        throw new Error('テンプレートのA1:H1を有効なチェックボックスにしてください');
      }
    }
    const OutputFolder = DriveApp.getFolderById('格納先のフォルダID');
    const OutputFileName = templateFile.getName() + '_' + date;
    if (OutputFolder.getFilesByName(OutputFileName).hasNext()) {
      throw new Error('保存先に同名ファイルがあります。既存ファイルを確認してください');
    }
    const CopiedDriveFile = templateFile.makeCopy(OutputFileName, OutputFolder);
    const CopiedFileId = CopiedDriveFile.getId();
    LogFileSheet.getRange('A1').setValue(CopiedFileId);
    LogFileSheet.getRange('A2').setValue('処理中');
    const CopiedFile = SpreadsheetApp.openById(CopiedFileId);
    const CopiedFileSheet = CopiedFile.getSheetByName('コピー元');
    const cells = CopiedFileSheet.getRange('A1:H1');
    let checked = 0;
    for (let col = 1; col <= 8; col++) {
      const state = cells.getCell(1, col).isChecked();
      if (state === null) throw new Error('複製先のチェックボックスが無効です');
      if (state) checked++;
    }
    if (CopiedFile.getSheetByName(date)) throw new Error('複製先に同じ日付名のシートがあります');
    const DateSheet = CopiedFileSheet.copyTo(CopiedFile);
    DateSheet.setName(date);
    CopiedFile.setActiveSheet(DateSheet);
    CopiedFile.moveActiveSheet(1);
    LogFileSheet.getRange('A2').setValue('完了 / チェックあり: ' + checked + '件');
  } finally {
    try {
      SpreadsheetApp.flush();
    } finally {
      lock.releaseLock();
    }
  }
}
