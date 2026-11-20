function nextMinutesPlan_(name) {
  const m = /^(20\d{2})(\d{2})(\d{2})_第([1-9]\d{0,5})回 (.+)議事録$/.exec(name);
  if (!m) throw new Error('ファイル名の形式を確認してください');
  const date = new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])));
  const compact = d => d.toISOString().slice(0, 10).replace(/-/g, '');
  if (compact(date) !== m[1] + m[2] + m[3]) throw new Error('存在しない日付です');
  const oldDate = date.toISOString().slice(0, 10).replace(/-/g, '/');
  date.setUTCDate(date.getUTCDate() + 7);
  const title = '第' + (Number(m[4]) + 1) + '回 ' + m[5] + '議事録';
  return {oldTitle: name.slice(9), oldDate, title,
    newDate: date.toISOString().slice(0, 10).replace(/-/g, '/'), name: compact(date) + '_' + title};
}
function minutesFields_(doc, plan) {
  const tabs = doc.getTabs();
  if (tabs.length !== 1 || tabs[0].getChildTabs().length) throw new Error('子タブのない1タブの文書で試してください');
  const body = tabs[0].asDocumentTab().getBody(), titles = [], dates = [];
  for (let i = 0; i < body.getNumChildren(); i++) {
    const child = body.getChild(i);
    if (child.getType() !== DocumentApp.ElementType.PARAGRAPH) continue;
    const p = child.asParagraph();
    if (p.getText() === plan.oldTitle && p.getHeading() === DocumentApp.ParagraphHeading.HEADING1) titles.push(p);
    if (p.getText() === '開催日：' + plan.oldDate) dates.push(p);
  }
  if (titles.length !== 1 || dates.length !== 1) throw new Error('見出し1と開催日の段落を各1つにしてください');
  return {title: titles[0], date: dates[0]};
}
function createNextMinutes() {
  const SOURCE_FILE_ID = '複製元のGoogleドキュメントID';
  const OUTPUT_FOLDER_ID = '出力先フォルダID';
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(5000)) throw new Error('同じプロジェクトで実行中です');
  try {
    const source = DriveApp.getFileById(SOURCE_FILE_ID);
    if (source.getMimeType() !== 'application/vnd.google-apps.document') throw new Error('Googleドキュメントを指定してください');
    const plan = nextMinutesPlan_(source.getName());
    minutesFields_(DocumentApp.openById(SOURCE_FILE_ID), plan);
    const folder = DriveApp.getFolderById(OUTPUT_FOLDER_ID);
    if (folder.getFilesByName(plan.name).hasNext()) throw new Error('同名の次回議事録があります。結果を確認してください');
    const copy = source.makeCopy(plan.name, folder);
    console.log('作成したファイルID: ' + copy.getId());
    const doc = DocumentApp.openById(copy.getId());
    const fields = minutesFields_(doc, plan);
    fields.title.setText(plan.title);
    fields.title.setHeading(DocumentApp.ParagraphHeading.HEADING1);
    fields.date.setText('開催日：' + plan.newDate);
    doc.saveAndClose();
    console.log('更新完了: ' + copy.getUrl());
  } finally {
    lock.releaseLock();
  }
}
