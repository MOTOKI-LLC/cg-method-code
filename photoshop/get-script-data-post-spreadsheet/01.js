function doGet(e) {
  var rowData = {};  
  if (e.parameter == undefined) {
      var getvalue = "undefined"
      rowData.value = getvalue;
      var result = JSON.stringify(rowData);
      return ContentService.createTextOutput(result);
  }else{
      var id = 'スプレットシートのID';
      var sheet = SpreadsheetApp.openById(id).getSheetByName("シート1");
      var array = [ e.parameter.p1 , e.parameter.p2 , e.parameter.p3];
      sheet.appendRow(array);
      var getvalue = "ok"
      rowData.value = getvalue;
      var result = JSON.stringify(rowData);
      return ContentService.createTextOutput(result);
  }
}
