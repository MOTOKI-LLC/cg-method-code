// ドキュメントツリー（巨大JSON）からページやレイヤーを走査
const res = await fetch(`https://api.figma.com/v1/files/${FILE_KEY}`, {
  headers: { 'X-Figma-Token': process.env.FIGMA_TOKEN }
});
const { document } = await res.json(); // document.children[] がページ
const pages = document.children.map(p => ({ id: p.id, name: p.name, type: p.type }));
console.log(pages);
// 注意: RESTは読み取り専用。編集は不可
