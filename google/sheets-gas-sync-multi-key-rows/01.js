/************************************************
 * シート2（マスタ） → シート1（反映先）
 * A〜C列を「複合キー」にして行を同期＆並び替えするスクリプト
 *
 * 前提：
 *  - シート1 … 情報を加筆する側（D列以降に追記してOK）
 *  - シート2 … 取得・更新した「最新情報」のシート
 *
 * 仕様：
 *  - キー       ：A〜C列（keyColumns）
 *  - 同期対象   ：A〜C列（syncColumns）
 *  - 行の順番   ：シート2の行順にシート1を並び替え
 *  - D列以降   ：キーに紐づいてそのまま引き継ぐ
 *  - マスタに無い行：シート1から削除（余りの行はクリア）
 ************************************************/
function syncSheetsByKeyAndOrder() {
  /** 設定値（シート名・キー列など） */
  const CONFIG = {
    masterSheetName: 'シート2', // マスタ側シート名（最新データ）
    targetSheetName: 'シート1', // 反映先シート名（加筆あり）
    keyColumns: [1, 2, 3],     // ★キーに使う列（A,B,C列）
    syncColumns: [1, 2, 3],    // マスタから同期したい列（A,B,C列）
    hasHeader: true            // 1行目がヘッダー行なら true
  };

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const masterSheet = ss.getSheetByName(CONFIG.masterSheetName);
  const targetSheet = ss.getSheetByName(CONFIG.targetSheetName);

  if (!masterSheet || !targetSheet) {
    throw new Error('設定されたシート名が存在しません。CONFIG.masterSheetName / targetSheetName を確認してください。');
  }

  // データ開始行（ヘッダーありなら2行目、なしなら1行目）
  const startRow = CONFIG.hasHeader ? 2 : 1;

  /***********************
   * ① マスタ側（シート2）の読込
   ***********************/
  const masterValues = getSheetValues(
    masterSheet,
    startRow,
    Math.max(...CONFIG.syncColumns) // 同期対象の最大列まで取得（A〜C）
  );

  // マスタに1行もデータがなければ何もしない
  if (masterValues.length === 0) return;

  /***********************
   * ② 反映先（シート1）の読込
   ***********************/
  const targetLastCol = targetSheet.getLastColumn(); // D列以降も含めた最終列
  const targetValues = getSheetValues(
    targetSheet,
    startRow,
    targetLastCol
  );

  /***********************
   * ③ 反映先を「複合キー → 行データ」のマップに変換
   *    例）"AAA1|BBB1|CCC1" → [AAA1, BBB1, CCC1, りんご, ...]
   ***********************/
  const targetMap = buildKeyRowMapByColumns(
    targetValues,
    CONFIG.keyColumns
  );

  /***********************
   * ④ マスタの行順で「新しいシート1の行配列」を組み立て
   *    - 既存行があればその行をベースに（D列以降を維持）
   *    - 同期列（A〜C）はマスタの値で上書き
   ***********************/
  const newTargetValues = masterValues.map(masterRow => {
    // マスタ側の行から複合キーを生成（A+B+C）
    const key = createCompositeKey(masterRow, CONFIG.keyColumns);
    // 反映先に既に同じキーの行があれば、それをベースにする
    const existingRow = targetMap[key] || null;

    return buildMergedRow({
      masterRow,
      existingRow,
      targetLastCol,
      syncColumns: CONFIG.syncColumns
    });
  });

  /***********************
   * ⑤ シート1へ書き戻し＆余分な古い行をクリア
   ***********************/
  writeBackValues(targetSheet, startRow, targetLastCol, newTargetValues);
}

/* ==========================================================
 * 共通ヘルパー関数群
 * ==========================================================*/

/**
 * 指定シートから「startRow〜最終行」までを取得するヘルパー
 *
 * @param {Sheet} sheet     対象シート
 * @param {number} startRow データ開始行
 * @param {number} lastCol  取得したい最終列番号
 * @return {any[][]}        2次元配列のシートデータ
 */
function getSheetValues(sheet, startRow, lastCol) {
  const lastRow = sheet.getLastRow();
  if (lastRow < startRow) return []; // データなし

  const numRows = lastRow - startRow + 1;
  return sheet.getRange(startRow, 1, numRows, lastCol).getValues();
}

/**
 * 1行のデータから「複合キー文字列」を作成する
 * 例：keyColumns=[1,2,3] の場合
 *   A=AAA1, B=BBB1, C=CCC1 → "AAA1|BBB1|CCC1"
 *
 * @param {any[]} row           1行分の配列
 * @param {number[]} keyColumns キーに使う列番号配列
 * @return {string}             複合キー文字列（全て空なら ""）
 */
function createCompositeKey(row, keyColumns) {
  const parts = keyColumns.map(colIndex => {
    const value = row[colIndex - 1];
    return value === undefined || value === null ? '' : String(value);
  });

  // すべて空ならキーなしとして扱う
  const allEmpty = parts.every(v => v === '');
  return allEmpty ? '' : parts.join('|'); // 区切り文字は任意（ここでは "|"）
}

/**
 * シート全体の値から「複合キー → 行データ」のマップを作成する
 *
 * @param {any[][]} values      シートの2次元配列データ
 * @param {number[]} keyColumns キーに使う列番号配列
 * @return {Object.<string, any[]>} key → 行データ のマップ
 */
function buildKeyRowMapByColumns(values, keyColumns) {
  const map = {};

  values.forEach(row => {
    const key = createCompositeKey(row, keyColumns);
    if (key) {
      // 同じキーが複数ある場合は「最後に出てきた行」が優先される
      map[key] = row;
    }
  });

  return map;
}

/**
 * マスタ行と既存行をマージして「新しい1行分の配列」を作成する
 *
 * ルール：
 *  - existingRow があればそれをベースにする（D列以降を維持）
 *  - existingRow がなければ空行を作る
 *  - syncColumns（例：A〜C）は masterRow の値で上書き
 *
 * @param {Object} params
 * @param {any[]} params.masterRow    マスタ側の1行（A〜Cまで）
 * @param {any[]|null} params.existingRow 既存の1行（D以降の情報付き）なければ null
 * @param {number} params.targetLastCol   反映先の最終列番号
 * @param {number[]} params.syncColumns   同期対象列番号の配列
 * @return {any[]}                        新しい1行分の配列
 */
function buildMergedRow({ masterRow, existingRow, targetLastCol, syncColumns }) {
  // 既存行があればそれをコピー（D列以降もそのまま引き継ぐ）
  // 無ければ、全列空文字の新規行を作る
  const row = existingRow
    ? existingRow.slice()
    : new Array(targetLastCol).fill('');

  // A〜C列など、同期対象の列はマスタの値で上書き
  syncColumns.forEach(colIndex => {
    row[colIndex - 1] = masterRow[colIndex - 1];
  });

  return row;
}

/**
 * 新しい配列データをシートに書き戻し、
 * 以前より行数が少ない場合は余分な行をクリアする。
 *
 * @param {Sheet} sheet   書き込み対象シート
 * @param {number} startRow データ開始行
 * @param {number} lastCol  最終列番号
 * @param {any[][]} values  新しい2次元配列データ
 */
function writeBackValues(sheet, startRow, lastCol, values) {
  if (values.length === 0) return;

  const lastRowBefore = sheet.getLastRow();

  // 新しいデータを書き込み（ヘッダー下から values.length 行ぶん）
  const range = sheet.getRange(startRow, 1, values.length, lastCol);
  range.setValues(values);

  // 以前のデータ行数を計算し、多かった分だけ下側をクリア
  const oldDataRows = lastRowBefore >= startRow
    ? (lastRowBefore - startRow + 1)
    : 0;

  if (oldDataRows > values.length) {
    const extraRows = oldDataRows - values.length;
    const clearStartRow = startRow + values.length;
    sheet.getRange(clearStartRow, 1, extraRows, lastCol).clearContent();
  }
}
