// 遅い：1行ごとにシートへ書きに行く
for (let i = 0; i < rows.length; i++) {
  sheet.getRange(i + 1, 1).setValue(rows[i]);
}

// 速い：配列を作ってから1回で書く
const values = rows.map(r => [r]);
sheet.getRange(1, 1, values.length, 1).setValues(values);
