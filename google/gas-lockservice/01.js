function incrementCounter() {
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(5000)) {
    throw new Error('別の実行が処理中です。少し待ってから実行してください。');
  }
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('ロック練習');
    if (!sheet) throw new Error('「ロック練習」シートを作成してください。');
    const cell = sheet.getRange('A1');
    const current = cell.getValue();
    if (typeof current !== 'number' || !Number.isSafeInteger(current) || current < 0 || current >= Number.MAX_SAFE_INTEGER) {
      throw new Error('A1には0以上の整数を入力してください。');
    }
    cell.setValue(current + 1);
  } finally {
    try {
      SpreadsheetApp.flush();
    } finally {
      lock.releaseLock();
    }
  }
}
