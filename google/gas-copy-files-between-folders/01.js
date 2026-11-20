const COPY_SOURCE_ID = 'コピー元の練習用フォルダーID';
const COPY_DESTINATION_ID = '空のコピー先フォルダーID';

function directCopyPlan_() {
  if (COPY_SOURCE_ID === COPY_DESTINATION_ID) {
    throw new Error('コピー元とコピー先は別フォルダーにしてください');
  }
  const source = DriveApp.getFolderById(COPY_SOURCE_ID);
  const destination = DriveApp.getFolderById(COPY_DESTINATION_ID);
  if (destination.getFiles().hasNext() || destination.getFolders().hasNext()) {
    throw new Error('コピー先が空ではありません。再実行せず結果を確認してください');
  }
  const iterator = source.getFiles(); // 子フォルダーには入らない
  const files = [];
  while (iterator.hasNext()) {
    if (files.length >= 50) throw new Error('練習対象は50ファイル以内です');
    const file = iterator.next();
    const mime = file.getMimeType();
    const nativeAllowed = [MimeType.GOOGLE_DOCS, MimeType.GOOGLE_SHEETS,
      MimeType.GOOGLE_SLIDES, MimeType.GOOGLE_DRAWINGS];
    if (mime.startsWith('application/vnd.google-apps.') && !nativeAllowed.includes(mime)) {
      throw new Error('この練習では扱わない種類です: ' + file.getName());
    }
    files.push(file);
  }
  return { destination, files };
}

function previewDirectCopy() {
  const plan = directCopyPlan_();
  console.log(JSON.stringify(plan.files.map(file => ({ id: file.getId(), name: file.getName() })), null, 2));
}

function copyDirectFiles() {
  const plan = directCopyPlan_(); // 全件確認を終えてから複製する
  const results = [];
  try {
    for (const file of plan.files) {
      const copy = file.makeCopy(file.getName(), plan.destination);
      results.push({ sourceId: file.getId(), copyId: copy.getId(), name: copy.getName() });
      console.log(JSON.stringify(results[results.length - 1]));
    }
  } catch (error) {
    console.log(JSON.stringify({ completed: results, error: String(error) }));
    throw error; // 途中成功したコピーは残る。コピー先を確認してから復旧する
  }
  console.log('コピーしたファイル数: ' + results.length);
  return results;
}
