const fs = require('fs');
const { createCanvas } = require('canvas');
require('ag-psd/initialize-canvas');           // Node で画像を扱うための準備
const { writePsdBuffer } = require('ag-psd');

function rect(w, h, color) {
  const c = createCanvas(w, h);
  const ctx = c.getContext('2d');
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, w, h);
  return c;
}

const psd = {
  width: 400,
  height: 300,
  children: [
    { name: '背景', canvas: rect(400, 300, '#ffffff') },
    { name: 'パーツ', children: [
      { name: '赤い四角', left: 40, top: 40, canvas: rect(120, 80, '#e03c31') },
      { name: '青い四角', left: 200, top: 120, canvas: rect(150, 120, '#2f6fd6'), opacity: 0.5 },
    ]},
  ],
  canvas: rect(400, 300, '#ffffff'),            // 合成済みのプレビュー（簡略化）
};

fs.writeFileSync('out.psd', writePsdBuffer(psd));
console.log('書き出した', fs.statSync('out.psd').size, 'バイト');
