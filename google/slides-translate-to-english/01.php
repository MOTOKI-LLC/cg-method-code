const TRANSLATE_DEMO = Object.freeze({
  copyPresentationId: 'COPY_PRESENTATION_ID',
  apply: false,
  maxSlides: 10,
  maxTexts: 50,
  maxTextLength: 1000
});

function translateSlides() {
  if (!/^[A-Za-z0-9_-]{20,}$/.test(TRANSLATE_DEMO.copyPresentationId) ||
      TRANSLATE_DEMO.copyPresentationId === 'COPY_PRESENTATION_ID') {
    throw new Error('元資料ではなく、練習用コピーのIDを設定してください。');
  }
  const deck = SlidesApp.openById(TRANSLATE_DEMO.copyPresentationId);
  const slides = deck.getSlides();
  if (slides.length > TRANSLATE_DEMO.maxSlides) throw new Error('この練習は10枚までです。');
  const jobs = [];
  const skipped = [];
  function add(range, label) {
    if (!range) return; // 結合セルの先頭以外には文字列がない。
    const before = range.asString();
    if (!before.trim()) return;
    if (before.length > TRANSLATE_DEMO.maxTextLength) throw new Error('1対象1000文字までです。');
    jobs.push({range: range, before: before, label: label});
    if (jobs.length > TRANSLATE_DEMO.maxTexts) throw new Error('文字対象は50件までです。');
  }
  function visit(element, label, depth) {
    if (depth > 10) throw new Error('グループの入れ子が深すぎます。');
    const type = element.getPageElementType();
    if (type === SlidesApp.PageElementType.SHAPE) {
      add(element.asShape().getText(), label);
    } else if (type === SlidesApp.PageElementType.GROUP) {
      element.asGroup().getChildren().forEach((child, i) => visit(child, label + '/group' + i, depth + 1));
    } else if (type === SlidesApp.PageElementType.TABLE) {
      const table = element.asTable();
      for (let r = 0; r < table.getNumRows(); r++) {
        for (let c = 0; c < table.getNumColumns(); c++) {
          add(table.getCell(r, c).getText(), label + '/cell' + r + ',' + c);
        }
      }
    } else {
      skipped.push(label + ':' + String(type));
    }
  }
  slides.forEach((slide, i) => slide.getPageElements().forEach((element, j) => visit(element, 'slide' + (i + 1) + '/element' + j, 0)));
  console.log('対象=' + jobs.length + '、対象外=' + skipped.length + '、apply=' + TRANSLATE_DEMO.apply);
  if (!TRANSLATE_DEMO.apply) return;
  // すべての翻訳を取得してから書き換える。翻訳取得失敗なら本文は変更しない。
  const translated = jobs.map(job => {
    const after = LanguageApp.translate(job.before, 'ja', 'en');
    if (typeof after !== 'string' || !after.trim()) throw new Error('翻訳結果が空です。');
    return {...job, after: after};
  });
  if (translated.some(job => job.range.asString() !== job.before)) throw new Error('翻訳中に元の文字が変わりました。書き換えを中止します。');
  const completed = [];
  try {
    for (const job of translated) {
      job.range.setText(job.after);
      completed.push(job.label);
    }
  } catch (error) {
    console.error('書換済み=' + JSON.stringify(completed));
    throw new Error('途中で停止しました。練習用コピーを確認し、新しいコピーからやり直してください。原因: ' + error.message);
  }
  console.log('書換完了=' + completed.length + '。原文との照合とレイアウト確認が必要です。');
}
