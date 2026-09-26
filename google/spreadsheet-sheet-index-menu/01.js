const ss = SpreadsheetApp.getActive();
const sh = ss.getSheets();
const func = (() => {
  let result = {};
  for (let i = 0; i < sh.length; i++) {
    result["_moveTo" + i] = function () {
      sh[i].activate();
    };
  }
  return result;
})();

function onOpen() {
  let menu = [];
  for (let i = 0; i < sh.length; i++) {
    const funcName = "func._moveTo" + i;
    menu.push({
      name: sh[i].getSheetName(),
      functionName: funcName,
    });
  }
  ss.addMenu("シート移動", menu);
}
