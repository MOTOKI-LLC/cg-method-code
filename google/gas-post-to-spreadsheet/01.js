function doGet(e) {
  var ss        = SpreadsheetApp.getActiveSpreadsheet();
  var sheet     = ss.getSheetByName('シート1');
  var sheetData = sheet.getRange('A2:C' + sheet.getLastRow()).getValues();

  var responseList = [];
  sheetData.map(function(d) {
    responseList.push({ script: d[0], name: d[1], date: d[2] });
  });

  var response = {
    data: responseList,
    meta: { status: 'success' }
  };

  return ContentService.createTextOutput(JSON.stringify(response)).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  var ss     = SpreadsheetApp.getActiveSpreadsheet();
  var sheet  = ss.getSheetByName('シート1');
  var data   = JSON.parse(e.postData.contents);

  // スプレッドシートに追記
  sheet.appendRow([data.script, data.name, data.date]);

  return ContentService.createTextOutput(JSON.stringify({
    result: 'success',
    data: data
  })).setMimeType(ContentService.MimeType.JSON);
}
