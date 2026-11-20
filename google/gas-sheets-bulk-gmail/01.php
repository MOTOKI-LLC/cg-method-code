function sendMails() {
  const DRY_RUN = true; // 最初はtrue。確認後にfalseへ変更すると送信します。
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) throw new Error('練習用スプレッドシートから開いてください。');
  const sheet = ss.getSheetByName('送信練習');
  if (!sheet) throw new Error('「送信練習」シートを作成してください。');
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(5000)) throw new Error('別の送信処理が実行中です。');
  try {
    const lastRow = sheet.getLastRow();
    if (lastRow < 2) return;
    if (lastRow > 11) throw new Error('この練習例は最大10行です。');
    const source = sheet.getRange(1, 1, lastRow, 3);
    if (source.getFormulas().some(row => row.some(Boolean)) || source.isPartOfMerge()) {
      throw new Error('A:Cは数式や結合セルのない練習表を使ってください。');
    }
    const headers = sheet.getRange(1, 1, 1, 3).getValues()[0];
    if (JSON.stringify(headers) !== JSON.stringify(['名前', 'メールアドレス', '状態'])) {
      throw new Error('見出しと列順を確認してください。');
    }
    const rows = sheet.getRange(2, 1, lastRow - 1, 3).getValues();
    const pending = [];
    const seen = new Set();
    rows.forEach(function (row, index) {
      const name = String(row[0]).trim();
      const mail = String(row[1]).trim();
      const state = String(row[2]).trim();
      if (!name && !mail && !state) return;
      if (state) return; // 送信済み・送信中など、状態のある行を再送しない
      if (!name || name.length > 100 || mail.length > 254 || !/^[^\s@,;]+@[^\s@,;]+\.[^\s@,;]+$/.test(mail)) {
        throw new Error((index + 2) + '行目の名前と宛先を確認してください。');
      }
      const key = mail.toLowerCase();
      if (seen.has(key)) throw new Error('未送信の宛先が重複しています。');
      seen.add(key);
      pending.push({row: index + 2, name: name, mail: mail, original: row.slice()});
    });
    if (!DRY_RUN && pending.length > MailApp.getRemainingDailyQuota()) {
      throw new Error('残りの送信枠が足りません。今回は送信していません。');
    }
    pending.forEach(function (item) {
      const subject = 'ご案内';
      const body = item.name + ' 様\n\nお世話になっております。';
      if (DRY_RUN) {
        console.log(JSON.stringify({row: item.row, to: item.mail, subject: subject, body: body}));
        return;
      }
      const current = sheet.getRange(item.row, 1, 1, 3);
      if (sheet.getLastRow() !== lastRow || current.getFormulas()[0].some(Boolean) ||
          JSON.stringify(current.getValues()[0]) !== JSON.stringify(item.original)) {
        throw new Error('確認後に行が変わりました。送信を停止します。');
      }
      if (MailApp.getRemainingDailyQuota() < 1) throw new Error('残りの送信枠がありません。');
      const state = sheet.getRange(item.row, 3);
      state.setValue('送信中');
      SpreadsheetApp.flush();
      const beforeSend = current.getValues()[0];
      if (current.getFormulas()[0].some(Boolean) || beforeSend[0] !== item.original[0] ||
          beforeSend[1] !== item.original[1] || beforeSend[2] !== '送信中') {
        throw new Error('送信準備中に行が変わりました。結果を確認してください。');
      }
      MailApp.sendEmail(item.mail, subject, body);
      const afterSend = current.getValues()[0];
      if (current.getFormulas()[0].some(Boolean) || afterSend[0] !== item.original[0] ||
          afterSend[1] !== item.original[1] || afterSend[2] !== '送信中') {
        throw new Error('送信後に行が変わりました。再送せず履歴を確認してください。');
      }
      state.setValue('送信済み');
      SpreadsheetApp.flush();
    });
  } finally {
    lock.releaseLock();
  }
}
