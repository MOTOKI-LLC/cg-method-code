function memberRows_(members) {
  if (!Array.isArray(members)) throw new Error('メンバー配列ではありません');
  return members.map(m => {
    if (!Number.isSafeInteger(m.account_id) || m.account_id <= 0 || typeof m.name !== 'string') throw new Error('メンバー形式が違います');
    // シートの数式として解釈されないよう文字列にする。
    const name = /^\s*[=+@-]/.test(m.name) ? "'" + m.name : m.name;
    return [name, String(m.account_id)];
  });
}
function demoMembers() {
  const rows = memberRows_([{account_id:101,name:'練習 太郎'},{account_id:102,name:'練習 花子'}]);
  Logger.log(JSON.stringify(rows));
  return rows;
}
function getRooms() {
  const properties = PropertiesService.getScriptProperties();
  const room = properties.getProperty('CHATWORK_ROOM_ID');
  const token = properties.getProperty('CHATWORK_API_TOKEN');
  if (!room || !/^\d+$/.test(room) || !token) throw new Error('ルームIDとトークンを設定してください');
  const book = SpreadsheetApp.getActiveSpreadsheet();
  if (!book) throw new Error('スプレッドシートに紐づけたプロジェクトで実行してください');
  const response = UrlFetchApp.fetch('https://api.chatwork.com/v2/rooms/' + room + '/members', {
    method:'get',headers:{'X-ChatworkToken':token},muteHttpExceptions:true
  });
  if (response.getResponseCode() !== 200) throw new Error('Chatwork HTTP ' + response.getResponseCode());
  const rows = memberRows_(JSON.parse(response.getContentText()));
  // 既存のシートは上書きしない。取得が成功してから毎回新規作成。
  const sheet = book.insertSheet();
  sheet.getRange(1,1,1,2).setValues([['名前','アカウントID']]);
  if (rows.length) {
    sheet.getRange(2,2,rows.length,1).setNumberFormat('@');
    sheet.getRange(2,1,rows.length,2).setValues(rows);
  }
  return rows.length;
}
