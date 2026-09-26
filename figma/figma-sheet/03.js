function run_export_section() {
  var fileKey =  'YOUR_FILE_KEY'; // https://www.figma.com/design/YOUR_FILE_KEY/
  var token = PropertiesService.getScriptProperties().getProperty('FIGMA_TOKEN');

  // ★生の nodeId（' は不要）
  var sectionIds = ['9:5', '9:3'];

  var result =  FigmaSheet.exportSectionToSheet(fileKey, sectionIds, {
    token: token,
    sheetName: 'Figma情報一覧',

    // ★出力したい列だけ指定
    fields: [
      'mainComponent',
      'nodeId',
      'variantName',
      'variantId',
      'layerPath',
      'componentKey',
      'pageName',
      'instanceName',
      'componentSetName',
      'x','y','w','h',
      'visible',
      'opacity',
      'rotation',
      'constraintsHorizontal',
      'constraintsVertical',
      'fills',
      'strokes',
      'textStyle',
      'fontFamily',
      'fontSize',
      'characters'
    ],

    nodeTypes: ['INSTANCE', 'COMPONENT', 'COMPONENT_SET', 'TEXT']
  });

  Logger.log(result);
}
