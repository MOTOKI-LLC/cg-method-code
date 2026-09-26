function run_export_section() {
  var fileKey = 'YOUR_FILE_KEY'; // ★https://www.figma.com/design/YOUR_FILE_KEY/

  // セクション nodeId（例）
  var sectionIds = ["'123:456", "'789:1011"]; // 1個なら "'123:456" でもOK

  var result = exportSectionToSheet(fileKey, sectionIds, {
    sheetName: 'Figma情報一覧'
  });

  Logger.log(result);
}
