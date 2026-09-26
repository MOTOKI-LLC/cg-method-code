// 任意ノードをPNG書き出し（Uint8Array）
const node = figma.currentPage.selection[0];
if (node) {
  const bytes = await node.exportAsync({ format: 'PNG', constraint: { type: 'SCALE', value: 2 } });
  // 例: UI側へ転送してダウンロードさせる
  figma.ui.postMessage({ type: 'exported', bytes: Array.from(bytes) });
}
// 注意: Pluginは「外部からアクセスできるURL」は返さない。必要なら自前でアップロード
