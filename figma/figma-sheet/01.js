function run_export() {
  var fileKey = 'YOUR_FILE_KEY'; // ★https://www.figma.com/design/YOUR_FILE_KEY/
  var token = PropertiesService.getScriptProperties().getProperty('FIGMA_TOKEN');

  var result = FigmaSheet.exportToSheet(fileKey, {
    token: token,
    sheetName: 'Figma情報一覧'
  });

  Logger.log(result);
}
