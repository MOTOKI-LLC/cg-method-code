function imageSlots_(deck, count) {
  const slides = deck.getSlides();
  if (slides.length !== 1) throw new Error('テンプレートは1スライドにしてください');
  const images = slides[0].getImages();
  if (images.length !== count) throw new Error('画像枠と入力画像の枚数が一致しません');
  const slots = new Map();
  for (const image of images) {
    const title = image.getTitle();
    if (slots.has(title)) throw new Error('画像枠のタイトルが重複しています');
    slots.set(title, image);
  }
  return Array.from({length: count}, (_, i) => {
    const key = 'slot-' + String(i + 1).padStart(2, '0');
    if (!slots.has(key)) throw new Error('画像枠のタイトルがありません: ' + key);
    return slots.get(key);
  });
}
function insertPracticeImages() {
  const IMAGE_FOLDER_ID = '画像フォルダID';
  const TEMPLATE_ID = '1スライドのテンプレートID';
  const OUTPUT_FOLDER_ID = '出力先フォルダID';
  const OUTPUT_NAME = '練習_画像配置';
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(5000)) throw new Error('同じプロジェクトで実行中です');
  try {
    const folder = DriveApp.getFolderById(IMAGE_FOLDER_ID);
    const iterator = folder.getFiles(), numbered = new Map();
    let scanned = 0;
    while (iterator.hasNext()) {
      const file = iterator.next();
      if (++scanned > 100) throw new Error('直下100ファイル以内で試してください');
      if (file.isTrashed()) continue;
      if (!['image/png', 'image/jpeg', 'image/gif'].includes(file.getMimeType())) continue;
      const match = /^(\d{2})_/.exec(file.getName());
      if (!match || Number(match[1]) < 1 || Number(match[1]) > 20) throw new Error('画像名は01_から20_の番号で始めてください');
      const n = Number(match[1]);
      if (numbered.has(n)) throw new Error('画像番号が重複しています');
      if (file.getSize() > 5 * 1024 * 1024) throw new Error('練習例は画像1枚5MiB以下です');
      numbered.set(n, file);
    }
    const count = numbered.size;
    if (!count) throw new Error('対象画像がありません');
    const files = Array.from({length: count}, (_, i) => {
      if (!numbered.has(i + 1)) throw new Error('画像番号を01から連番にしてください');
      return numbered.get(i + 1);
    });
    imageSlots_(SlidesApp.openById(TEMPLATE_ID), count);
    const output = DriveApp.getFolderById(OUTPUT_FOLDER_ID);
    if (output.getFilesByName(OUTPUT_NAME).hasNext()) throw new Error('同名の出力があります。先に結果を確認してください');
    const copy = DriveApp.getFileById(TEMPLATE_ID).makeCopy(OUTPUT_NAME, output);
    console.log('作成したプレゼンテーションID: ' + copy.getId());
    const deck = SlidesApp.openById(copy.getId());
    const slots = imageSlots_(deck, count);
    for (let i = 0; i < count; i++) {
      slots[i].replace(files[i].getBlob(), true).setTitle(files[i].getName()).setDescription('');
    }
    deck.saveAndClose();
    console.log('更新完了: ' + copy.getUrl());
  } finally {
    lock.releaseLock();
  }
}
