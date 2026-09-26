// 利用可能フォント一覧（ユーザーの環境＋Figmaフォントサービス）
const fonts = await figma.listAvailableFontsAsync();
console.log('font count:', fonts.length);

// テキスト編集には必ず loadFontAsync が必要
await figma.loadFontAsync({ family: 'Inter', style: 'Regular' });
const text = figma.createText();
text.characters = 'こんにちは、Figma！';
