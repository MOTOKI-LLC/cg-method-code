// ローカル（当該ファイル）に存在するスタイル
const paints = figma.getLocalPaintStyles();
paints.forEach(s => console.log('paint style:', s.name, s.id));

// ローカルコンポーネント一覧
const comps = figma.getLocalComponents();
comps.forEach(c => console.log('component:', c.name, c.key));

// ライブラリ（別ファイル）のコンポーネントをキー指定でインポート
const comp = await figma.importComponentByKeyAsync('xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx');
const inst = comp.createInstance();
figma.currentPage.appendChild(inst);
// 注意: ライブラリ公開＆権限が必要。キーは REST/DevMode/検査から取得可
