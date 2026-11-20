// このコードは記事ごとに別のApps Scriptプロジェクトへ保存します。
function required_(key) {
  const value=PropertiesService.getScriptProperties().getProperty(key);
  if (!value) throw new Error(key+'を設定してください');
  return value;
}
function escapeHtml_(value) {
  return String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
function https_(value) {
  const s=String(value).trim();
  if (!/^https:\/\/[a-z0-9](?:[a-z0-9.-]*[a-z0-9])?(?::443)?(?:[/?#][^\s<>"'\\]*)?$/i.test(s)) throw new Error('HTTPS URLを確認してください');
  return s;
}
function publicLinkHtml_(value) {
  const url=https_(value);
  // 公開してよい、このサイトのURLだけを渡します。
  if(!/^https:\/\/cg-method\.com(?:[:/?#]|$)/i.test(url)) throw new Error('cg-method.comの公開URLを指定してください');
  return '<!doctype html><html lang="ja"><meta charset="UTF-8"><body><p><a rel="noopener noreferrer" target="_blank" href="'+escapeHtml_(url)+'">CGメソッドを開く</a></p></body></html>';
}
function demoPublicLink(){return publicLinkHtml_('https://cg-method.com/?a=1&b=2');}
function doGet() {
  return HtmlService.createHtmlOutput(publicLinkHtml_(required_('PUBLIC_LINK')))
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setTitle('公開リンクの練習');
}
