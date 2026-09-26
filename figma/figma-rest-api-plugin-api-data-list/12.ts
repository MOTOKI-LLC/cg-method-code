// 動的読み込み下での安全なアクセス例（概念的）
for (const page of figma.root.children) {
  await figma.loadFontAsync({ family: 'Inter', style: 'Regular' }).catch(() => {});
  // 必要な処理だけを行い、保持オブジェクトを増やしすぎない
}
