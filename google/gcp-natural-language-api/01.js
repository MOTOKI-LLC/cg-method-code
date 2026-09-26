//シートIDとシート名を記載
var mySheet = SpreadsheetApp.openById("スプレッドシートID").getSheetByName(
  "シート名"
);

//Natural Language APIキー
var apiKey = "APIキー";

//8個までしか処理できないので、開始行と終了行を記載する
function main() {
  getSentiment(2, 9);
  getSentiment(10, 15);
}

function getSentiment(start, end) {
  for (i = start; i <= end; i++) {
    var tweet = mySheet.getRange(i, 1).getValue();
    var response = retrieveSentiment(tweet);
    var json = JSON.parse(response);
    var score = json["documentSentiment"]["score"];
    var magnitude = json["documentSentiment"]["magnitude"];

    mySheet.getRange(i, 2).setValue(score);
    mySheet.getRange(i, 3).setValue(magnitude);
  }
}
function retrieveSentiment(textData) {
  var apiEndpoint =
    "https://language.googleapis.com/v1/documents:analyzeSentiment?key=" +
    apiKey;

  var docDetails = {
    language: "ja-jp",
    type: "PLAIN_TEXT",
    content: textData,
  };

  var nlData = {
    document: docDetails,
    encodingType: "UTF8",
  };

  var nlOptions = {
    method: "post",
    contentType: "application/json",
    payload: JSON.stringify(nlData),
  };

  var response = UrlFetchApp.fetch(apiEndpoint, nlOptions);
  Logger.log("json is :" + response);
  return response;
}

function onOpen() {
  var entries = [{ name: "センチメント分析", functionName: "main" }];
  mySheet.addMenu("カスタムメニュー", entries);
}
onOpen();
