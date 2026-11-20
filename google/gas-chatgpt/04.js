const SHEET_ID = "xxxxxxxxxxxxxxxxxxxxxxxxxxx";
const SHEET_NAME = "シート1";

// デプロイのアクセス権は本人のみに限定する。
function askChatGPTWithModel(userInput, threadId, modelName) {
  if (typeof userInput !== 'string' || !userInput.trim() || userInput.length > 4000) {
    throw new Error('質問は1〜4000文字にしてください。');
  }
  if (typeof threadId !== 'string' || !/^\d{10,20}$/.test(threadId)) {
    throw new Error('会話IDが不正です。');
  }
  if (modelName !== 'gpt-4.1-mini') throw new Error('許可されていないモデルです。');
  const apiKey = PropertiesService.getScriptProperties().getProperty('ACCESS_TOKEN');
  if (!apiKey) throw new Error('APIキーが未設定です。');
  const sheet = getLogSheet_();
  const payload = {
    model: modelName,
    messages: [
      {role: 'system', content: '質問に日本語で簡潔に回答してください。'},
      {role: 'user', content: userInput}
    ],
    max_completion_tokens: 1024
  };
  const response = UrlFetchApp.fetch('https://api.openai.com/v1/chat/completions', {
    method: 'post', contentType: 'application/json',
    headers: {Authorization: 'Bearer ' + apiKey},
    payload: JSON.stringify(payload), muteHttpExceptions: true
  });
  const status = response.getResponseCode();
  if (status < 200 || status >= 300) throw new Error('API通信に失敗しました（HTTP ' + status + '）。');
  const result = JSON.parse(response.getContentText());
  const message = result.choices && result.choices[0] && result.choices[0].message;
  if (!message || typeof message.content !== 'string' || !message.content.trim()) {
    throw new Error('テキスト応答を取得できませんでした。');
  }
  const reply = message.content.trim();
  // =で始まる入力をシートの数式として評価させない。
  const asText = value => /^[=+@-]/.test(value) ? "'" + value : value;
  sheet.appendRow([new Date(), threadId, asText(userInput), asText(reply)]);
  return reply;
}

// 末尾_の関数はgoogle.script.runから直接呼び出せない。
function getLogSheet_() {
  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
  if (!sheet) throw new Error('ログ用シートが見つかりません。');
  const headers = sheet.getRange(1, 1, 1, 4).getDisplayValues()[0];
  if (headers.join('|') !== '日時|会話ID|質問|回答') {
    throw new Error('A1:D1の見出しを確認してください。');
  }
  return sheet;
}

function getHistoryFromSheetWithThreads() {
  const sheet = getLogSheet_();
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return [];
  // 表示用文字列として返し、Dateをブラウザに直接渡さない。
  const firstRow = Math.max(2, lastRow - 199);
  return sheet.getRange(firstRow, 1, lastRow - firstRow + 1, 4)
    .getDisplayValues().map(r => ({
      timestamp: r[0], thread: r[1], user: r[2], bot: r[3]
    }));
}
