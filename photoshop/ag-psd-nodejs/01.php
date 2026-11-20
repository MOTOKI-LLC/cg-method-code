const fs = require('fs');
require('ag-psd/initialize-canvas');
const { readPsd } = require('ag-psd');

const psd = readPsd(fs.readFileSync(process.argv[2]), { skipLayerImageData: true, skipThumbnail: true });
console.log(`${psd.width}x${psd.height}`);
function walk(layers, depth) {
  for (const l of layers || []) {
    const kind = l.children ? 'グループ' : l.text ? '文字' : l.adjustment ? '調整:' + l.adjustment.type : l.placedLayer ? 'スマートオブジェクト' : 'ピクセル';
    console.log('  '.repeat(depth) + `- ${l.name}（${kind}）` + (l.text ? ` 「${l.text.text}」` : ''));
    walk(l.children, depth + 1);
  }
}
walk(psd.children, 0);
