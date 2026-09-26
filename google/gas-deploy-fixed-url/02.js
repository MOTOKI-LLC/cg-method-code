function doGet() {
  var value = ScriptApp.getService().getUrl();
  Logger.log(value);
  var html = HtmlService.createTemplateFromFile('index');
  html.btn= value;
  return html.evaluate();
}
