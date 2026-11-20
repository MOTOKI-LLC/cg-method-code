function replaceText() {
  const presentationId = 'コピーしたプレゼンテーションのID';
  const pageIds = ['置換対象のページID'];
  const findText = 'CGメソッド';
  const replacement = 'ブログ';
  if (!pageIds.length || !findText) throw new Error('対象ページと検索文字列が必要です');
  const current = Slides.Presentations.get(presentationId);
  const existing = new Set((current.slides || []).map(page => page.objectId));
  if (pageIds.some(id => !existing.has(id))) throw new Error('対象ページIDが見つかりません');
  const result = Slides.Presentations.batchUpdate({
    requests: [{replaceAllText: {
      containsText: {text: findText, matchCase: true},
      replaceText: replacement,
      pageObjectIds: pageIds
    }}],
    writeControl: {requiredRevisionId: current.revisionId}
  }, presentationId);
  console.log(JSON.stringify(result.replies));
}
