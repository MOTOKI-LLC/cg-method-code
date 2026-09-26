function doGet () {
  return HtmlService.createTemplateFromFile('index').evaluate();
}

function getPrefabTreeData() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("シート1");//★ここにシート名
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const rows = data.slice(1);

  const nodes = [];
  const edges = [];

  const map = {};

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const nodeId = row[1]?.toString().trim();
    const parentId = row[2]?.toString().trim();
    const name = row[3]?.toString().trim();
    const comps = row[4]?.toString().trim();

    if (!nodeId || !name) continue;

    if (!map[nodeId]) {
      map[nodeId] = {
        id: nodeId,
        parent: parentId || null,
        name: name,
        comps: comps || "",
      };
    }
  }

  return Object.values(map);
}

function include(file) {
  return HtmlService.createHtmlOutputFromFile(file).getContent();
}
