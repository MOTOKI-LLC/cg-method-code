function doGet() {
    var Num1 = "7974"
    var Num2 = "6758"
  
    var stockName1 = stockName(Num1);
    var stockName2 = stockName(Num2);
  
    var stockPrice1 = stockPrice(Num1);
    var stockPrice2 = stockPrice(Num2);

    var payload = {
        "text": "現在の株価です。\n"
      + stockName1 +"  "+ stockPrice1 + "\n"  
      + stockName2 +"  "+ stockPrice2,
        "channel": "#analytics",
        "username": "Uncle Stock",
        "icon_emoji": ":neckbeard:"
    }
    var options = {
        "method": "POST",
        "payload": JSON.stringify(payload)
    }
    var url = "https://hooks.slack.com/services/**********************************";//SlackのWebhook URL
    var response = UrlFetchApp.fetch(url, options);
    var content = response.getContentText("UTF-8");
}

//社名
function stockName(code) {
    var url = 'https://example.com/stock/?code=' + code;
    var response = UrlFetchApp.fetch(url);
    var html = response.getContentText('UTF-8');
    var data = Parser.data(html).from('<h1 id="kobetsu">').to(' 基本情報</h1>').build();
    return data;
}

//株価
function stockPrice(code) {
    var url = 'https://example.com/stock/?code=' + code;
    var response = UrlFetchApp.fetch(url);
    var html = response.getContentText('UTF-8');
    var data = Parser.data(html).from('<span class="kabuka">').to('</span>').build();
    return data;
}
