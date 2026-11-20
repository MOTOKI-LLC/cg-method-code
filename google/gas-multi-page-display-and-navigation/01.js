const PAGE_FILES = Object.freeze({index: 'Index', menu1: 'Menu1', menu2: 'Menu2'});

function doGet(e) {
  const values = e && e.parameters && e.parameters.p;
  const page = e && e.parameter && e.parameter.p || 'index';
  if ((values && values.length !== 1) ||
      !Object.prototype.hasOwnProperty.call(PAGE_FILES, page)) {
    return HtmlService.createHtmlOutput(
      '<h1>該当するページがありません</h1><p>URLのpをindex、menu1、menu2のいずれかにしてください。</p>'
    ).addMetaTag('viewport', 'width=device-width, initial-scale=1')
      .setTitle('ページ指定を確認してください');
  }
  const appUrl = ScriptApp.getService().getUrl();
  if (!appUrl) throw new Error('テストデプロイまたはWebアプリのURLから開いてください。');
  const template = HtmlService.createTemplateFromFile(PAGE_FILES[page]);
  template.appUrl = appUrl;
  return template.evaluate()
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setTitle('ページ遷移の練習：' + page);
}
