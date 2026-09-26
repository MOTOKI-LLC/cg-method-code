const SHEET_ID = "xxxxxxxxxxxxxxxxxxxxxxxxxxx";
const SHEET_NAME = "シート1";

function askChatGPTWithModel(userInput, threadId, modelName) {
  const apiKey = PropertiesService.getScriptProperties().getProperty("ACCESS_TOKEN");

  const payload = {
    model: modelName || "gpt-4o",
    messages: [
      { role: "system", content: "あなたは有能なメールアシスタントです。" },
      { role: "user", content: userInput }
    ]
  };

  const options = {
    method: "post",
    contentType: "application/json",
    headers: {
      Authorization: "Bearer " + apiKey
    },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };

  try {
    const response = UrlFetchApp.fetch("https://api.openai.com/v1/chat/completions", options);
    const result = JSON.parse(response.getContentText());

    if (result.error) {
      return "エラー: " + result.error.message;
    }

    const reply = result.choices[0].message.content.trim();
    saveToSpreadsheet(threadId, userInput, reply);
    return reply;
  } catch (e) {
    return "通信エラー: " + e.message;
  }
}

function saveToSpreadsheet(threadId, userInput, botResponse) {
  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
  sheet.appendRow([new Date(), threadId, userInput, botResponse]);
}

function getHistoryFromSheetWithThreads() {
  const sheet   = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return [];

  // 2行目（= データの先頭）から最終行まで一気に取得
  const data = sheet.getRange(2, 1, lastRow - 1, 4).getValues();
  const tz   = Session.getScriptTimeZone();

  return data.map(r => ({
    timestamp: Utilities.formatDate(r[0], tz, "yyyy/MM/dd HH:mm:ss"),
    thread   : r[1],
    user     : r[2],
    bot      : r[3],
  }));
}
