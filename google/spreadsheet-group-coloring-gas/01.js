function colorGroupingsInColumnA() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const range = sheet.getRange("A1:A" + sheet.getLastRow()); //★列は自分で指定する
  const values = range.getValues();

  const colors = [
    "#f0f8ff", // 淡い青
    "#f5f5dc", // 淡いベージュ
    "#f0fff0", // 淡い緑
    "#fffaf0", // 淡いオレンジ
    "#f5f5f5", // グレー系
    "#ffffe0", // 淡い黄色
    "#e6e6fa"  // ラベンダー
  ];

  let colorIndex = 0;
  let startRow = 1;

  for (let i = 1; i < values.length; i++) {
    if (values[i][0] !== values[i - 1][0]) {
      const numRows = i - startRow + 1;
      const groupRange = sheet.getRange(startRow, 1, numRows);
      groupRange.setBackground(colors[colorIndex % colors.length]);
      startRow = i + 1;
      colorIndex++;
    }
  }

  // 最後のグループも色付け
  const lastGroupRange = sheet.getRange(startRow, 1, values.length - startRow + 1);
  lastGroupRange.setBackground(colors[colorIndex % colors.length]);
}
