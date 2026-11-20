function convertPracticeFiles() {
  const SOURCE_FOLDER_ID = '変換元フォルダID';
  const OUTPUT_FOLDER_ID = '空の出力先フォルダID';
  const DRY_RUN = true; // 確認後にfalseへ変更すると新規作成します。
  const mapping = {
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'application/vnd.google-apps.spreadsheet',
    'application/vnd.ms-excel': 'application/vnd.google-apps.spreadsheet',
    'text/csv': 'application/vnd.google-apps.spreadsheet',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'application/vnd.google-apps.presentation',
    'application/vnd.ms-powerpoint': 'application/vnd.google-apps.presentation',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'application/vnd.google-apps.document',
    'application/msword': 'application/vnd.google-apps.document'
  };
  if (SOURCE_FOLDER_ID === OUTPUT_FOLDER_ID) throw new Error('別の出力先フォルダを指定してください');
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(5000)) throw new Error('同じプロジェクトで実行中です');
  try {
    const source = DriveApp.getFolderById(SOURCE_FOLDER_ID);
    const output = DriveApp.getFolderById(OUTPUT_FOLDER_ID);
    if (output.getFiles().hasNext() || output.getFolders().hasNext()) {
      throw new Error('出力先は空にしてください。前回の結果がある場合は再実行せず確認してください');
    }
    const imports = Drive.About.get({fields: 'importFormats'}).importFormats || {};
    const files = source.getFiles(), plan = [];
    let scanned = 0, skipped = 0;
    while (files.hasNext()) {
      const file = files.next();
      if (++scanned > 100) throw new Error('直下100ファイル以内で試してください');
      if (file.isTrashed()) continue;
      const mime = file.getMimeType();
      const target = mapping[mime];
      if (!target) { skipped++; continue; }
      if (!(imports[mime] || []).includes(target)) throw new Error('APIが対応しない変換です');
      if (file.getSize() > 5 * 1024 * 1024) throw new Error('練習例は1ファイル5MiB以下にしてください');
      plan.push({file, mime, target});
      if (plan.length > 10) throw new Error('変換対象は10ファイル以内で試してください');
    }
    console.log(JSON.stringify({dryRun: DRY_RUN, targets: plan.length, skipped}));
    if (DRY_RUN) return;
    for (const item of plan) {
      const blob = item.file.getBlob().setContentType(item.mime);
      const created = Drive.Files.create({
        name: item.file.getName(),
        mimeType: item.target,
        parents: [OUTPUT_FOLDER_ID]
      }, blob, {fields: 'id,name,mimeType'});
      console.log(JSON.stringify({sourceId: item.file.getId(), outputId: created.id, mimeType: created.mimeType}));
    }
  } finally {
    lock.releaseLock();
  }
}
