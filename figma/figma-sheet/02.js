function runExportSection() {
  const props = PropertiesService.getScriptProperties();
  const token = props.getProperty('FIGMA_TOKEN');
  const fileKey = props.getProperty('FIGMA_FILE_KEY');
  const sectionIds = ['123:456'];
  const result = FigmaSheet.exportSectionToSheet(fileKey, sectionIds, {
    token: token,
    sheetName: 'Figma情報一覧',
    fields: ['nodeId', 'layerPath', 'componentKey', 'pageName',
      'instanceName', 'componentSetName', 'characters'],
    nodeTypes: ['INSTANCE', 'COMPONENT', 'COMPONENT_SET', 'TEXT']
  });
  console.log(result);
}
