const fs = require('fs');
require('ag-psd/initialize-canvas');
const { readPsd, writePsdBuffer } = require('ag-psd');

const psd = readPsd(fs.readFileSync(process.argv[2]));
let count = 0;
(function walk(layers) {
  for (const l of layers || []) {
    if (l.text) { l.text.text = l.text.text.replace(/Line/g, '行'); count++; }
    walk(l.children);
  }
})(psd.children);
if (process.argv[4] === '--drop-resources') delete psd.imageResources;
// 文字を書き換えたら、Photoshop で開いたときに描き直させる
fs.writeFileSync(process.argv[3], writePsdBuffer(psd, { invalidateTextLayers: true }));
console.log('文字レイヤー', count, '個を書き換えた');
