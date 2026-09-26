// 実行前に process.env.FIGMA_TOKEN と FILE_KEY を設定
const res = await fetch(`https://api.figma.com/v1/files/${FILE_KEY}`, {
  headers: { 'X-Figma-Token': process.env.FIGMA_TOKEN }
});
const data = await res.json();
console.log({
  name: data.name,
  lastModified: data.lastModified,
  thumbnailUrl: data.thumbnailUrl
});
// 注意: thumbnailUrl は恒久的。ノード画像URLは一時的（後述）
