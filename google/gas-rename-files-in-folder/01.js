const RENAME_FOLDER_ID = '練習用フォルダーのID';
const RENAME_FROM = 'sample';
const RENAME_TO = 'サンプル';
const RENAME_ALL = false; // false: 最初の1箇所、true: すべて
const RENAME_PLAN_KEY = 'cgmRenamePlanV1';

function collectRenamePlan_() {
  if (!RENAME_FROM) throw new Error('置換前の文字列を空にしないでください');
  const folder = DriveApp.getFolderById(RENAME_FOLDER_ID);
  const iterator = folder.getFiles(); // 直下のファイルだけ
  const files = [];
  while (iterator.hasNext()) {
    if (files.length >= 50) throw new Error('練習対象は50ファイル以内です');
    const file = iterator.next();
    const before = file.getName();
    const after = RENAME_ALL ? before.split(RENAME_FROM).join(RENAME_TO)
      : before.replace(RENAME_FROM, () => RENAME_TO);
    if (!after.trim()) throw new Error('空の名前になるファイルがあります');
    files.push({ id: file.getId(), before, after });
  }
  const names = files.map(item => item.after);
  if (new Set(names).size !== names.length) {
    throw new Error('置換後の名前が重複します。変更前に整理してください');
  }
  return { folderId: RENAME_FOLDER_ID, files };
}

function previewRename() {
  const plan = collectRenamePlan_();
  const json = JSON.stringify(plan);
  if (Utilities.newBlob(json).getBytes().length > 8000) {
    throw new Error('保存する計画が大きすぎます。対象を減らしてください');
  }
  PropertiesService.getScriptProperties().setProperty(RENAME_PLAN_KEY, json);
  console.log(JSON.stringify(plan, null, 2)); // 変更前の名前・IDを保存する
  return plan;
}

function applyRename() {
  const saved = PropertiesService.getScriptProperties().getProperty(RENAME_PLAN_KEY);
  if (!saved) throw new Error('先にpreviewRenameを実行してください');
  const plan = JSON.parse(saved);
  const fresh = collectRenamePlan_();
  const ordered = value => JSON.stringify(value.files.slice().sort((a,b) => a.id.localeCompare(b.id)));
  if (plan.folderId !== fresh.folderId || ordered(plan) !== ordered(fresh)) {
    throw new Error('プレビュー後に対象・名前・設定が変わりました。変更はしていません');
  }
  const done = [];
  try {
    for (const item of plan.files) {
      if (item.before === item.after) continue;
      DriveApp.getFileById(item.id).setName(item.after);
      done.push(item.id);
    }
  } catch (error) {
    console.log(JSON.stringify({ doneIds: done, error: String(error) }));
    throw error; // 自動で再実行しない。保存済み計画で変更済みIDを確認する
  }
  console.log(JSON.stringify({ changed: done.length, doneIds: done }));
}
