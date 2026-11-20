// 練習用シートとテスト用カレンダーで使う
const SHEET_NAME = '予定';
const CALENDAR_ID = ''; // テスト用カレンダーのIDを必ず設定する
const DRY_RUN = true; // trueでは予定もセルも変更しない

function registerEvents() {
  if (!CALENDAR_ID) throw new Error('テスト用カレンダーのIDを設定してください。');
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(5000)) throw new Error('別の実行が処理中です。');
  try {
    const book = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = book && book.getSheetByName(SHEET_NAME);
    const calendar = CalendarApp.getCalendarById(CALENDAR_ID);
    if (!sheet || !calendar) throw new Error('シートまたはカレンダーを確認してください。');
    const tz = Session.getScriptTimeZone();
    if (book.getSpreadsheetTimeZone() !== tz || calendar.getTimeZone() !== tz) {
      throw new Error('シート・スクリプト・カレンダーのタイムゾーンをそろえてください。');
    }
    const lastRow = sheet.getLastRow();
    if (lastRow < 2) return;
    if (lastRow > 11) throw new Error('この練習例は10行までです。');
    const range = sheet.getRange(2, 1, lastRow - 1, 8);
    if (range.isPartOfMerge() || range.getFormulas().some(row => row.some(Boolean))) {
      throw new Error('練習範囲は結合セル・数式を含めず値で入力してください。');
    }
    const values = range.getValues();
    for (let i = 0; i < values.length; i++) {
      const row = values[i];
      const [title, date, start, end, location, description, registeredId] = row;
      if (registeredId || row.every(value => value === '')) continue;
      if (typeof title !== 'string' || !title.trim() || !validDate(date)) {
        throw new Error((i + 2) + '行目のタイトル・日付を確認してください。');
      }
      const allDay = start === '' && end === '';
      if (!allDay && (!validDate(start) || !validDate(end))) {
        throw new Error((i + 2) + '行目は開始・終了の両方に時刻を入れてください。');
      }
      const startTime = allDay ? date : combine(date, start);
      const endTime = allDay ? null : combine(date, end);
      if (!allDay && endTime <= startTime) throw new Error('終了は開始より後にしてください。');
      if (DRY_RUN) { console.log('登録候補の行: ' + (i + 2)); continue; }
      const target = sheet.getRange(i + 2, 1, 1, 8);
      if (JSON.stringify(target.getValues()[0]) !== JSON.stringify(row)) {
        throw new Error('入力が変更されました。停止します。');
      }
      sheet.getRange(i + 2, 7).setValue('処理中');
      SpreadsheetApp.flush();
      const options = { location: String(location), description: String(description) };
      const event = allDay ? calendar.createAllDayEvent(title, date, options)
        : calendar.createEvent(title, startTime, endTime, options);
      // 作成後の失敗では「処理中」が残り、自動では再登録しない
      const expected = row.slice(); expected[6] = '処理中';
      if (JSON.stringify(target.getValues()[0]) !== JSON.stringify(expected)) {
        throw new Error('作成後に行の変更を検出しました。カレンダーと照合してください。');
      }
      sheet.getRange(i + 2, 7).setValue(event.getId());
      SpreadsheetApp.flush();
    }
  } finally { lock.releaseLock(); }
}

function validDate(value) {
  return value instanceof Date && !Number.isNaN(value.getTime());
}

function combine(date, time) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), time.getHours(), time.getMinutes());
}
