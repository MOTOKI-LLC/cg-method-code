function onOpen() {
  SpreadsheetApp.getUi().createMenu('感情分析').addItem('A2:A11を分析', 'main').addToUi();
}

function main() {
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(10000)) throw new Error('同じスクリプトで処理中です');
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('分析');
    if (!sheet) throw new Error('分析シートを作成してください');
    const key = PropertiesService.getScriptProperties().getProperty('NL_API_KEY');
    if (!key) throw new Error('スクリプトプロパティNL_API_KEYを設定してください');
    const data = sheet.getRange('A2:C11').getValues();
    const formulas = sheet.getRange('B2:C11').getFormulas();
    const jobs = [];
    for (let i = 0; i < data.length; i++) {
      const [text, score, magnitude] = data[i];
      if (text === '' || score !== '' || magnitude !== '' ||
          formulas[i][0] !== '' || formulas[i][1] !== '') continue;
      if (typeof text !== 'string' || !text.trim() || Array.from(text).length > 1000) {
        throw new Error((i + 2) + '行目は1〜1000文字の文章にしてください');
      }
      jobs.push({row: i + 2, text});
    }
    for (const job of jobs) {
      let response;
      try {
        response = UrlFetchApp.fetch('https://language.googleapis.com/v1/documents:analyzeSentiment', {
          method: 'post', contentType: 'application/json',
          headers: {'x-goog-api-key': key},
          payload: JSON.stringify({document: {type: 'PLAIN_TEXT', language: 'ja', content: job.text}, encodingType: 'UTF8'}),
          muteHttpExceptions: true
        });
      } catch (e) {
        throw new Error(job.row + '行目の通信に失敗しました。課金・出力を確認してから再実行してください');
      }
      if (response.getResponseCode() !== 200) {
        throw new Error(job.row + '行目: HTTP ' + response.getResponseCode() + '。API設定・課金・割り当てを確認してください');
      }
      let result;
      try { result = JSON.parse(response.getContentText()).documentSentiment; }
      catch (e) { throw new Error(job.row + '行目の応答を解析できません'); }
      if (!result || !Number.isFinite(result.score) || result.score < -1 || result.score > 1 ||
          !Number.isFinite(result.magnitude) || result.magnitude < 0) {
        throw new Error(job.row + '行目の分析結果が不正です');
      }
      sheet.getRange(job.row, 2, 1, 2).setValues([[result.score, result.magnitude]]);
    }
  } finally {
    try { SpreadsheetApp.flush(); }
    finally { lock.releaseLock(); }
  }
}
