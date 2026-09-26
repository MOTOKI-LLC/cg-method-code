// ページ列挙
for (const page of figma.root.children) {
  console.log('page:', page.name, page.id);
}

// ノード取得と編集（最小例）
const rect = figma.createRectangle();
rect.name = '生成した四角形';
rect.resize(200, 100);
rect.fills = [{ type: 'SOLID', color: { r: 0.2, g: 0.6, b: 1 } }];
figma.currentPage.appendChild(rect);

// 選択ノードの基本プロパティ参照
const sel = figma.currentPage.selection[0];
if (sel) {
  console.log(sel.name, sel.width, sel.height, sel.type);
}
