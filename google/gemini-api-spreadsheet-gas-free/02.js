/************************************************************
 * GAS × Gemini API 段階テスト一式（AI Studio 無料キー用）
 * - エンドポイント: v1beta
 * - APIキーはヘッダー x-goog-api-key で渡す
 *
 ************************************************************/

const GEMINI_MODEL_PRIMARY   = 'gemini-2.5-flash'; 
const GEMINI_MODEL_ALTERNATE = 'gemini-flash-latest';
const GEMINI_ENDPOINT_BASE   = 'https://generativelanguage.googleapis.com/v1beta/models';

/** 1) 最小通信テスト（Hello） */
function test1_minimalHello() {
  const key = getKey_();
  const url = `${GEMINI_ENDPOINT_BASE}/${GEMINI_MODEL_PRIMARY}:generateContent`;

  const payload = {
    contents: [
      {
        role: 'user',
        parts: [{ text: 'こんにちは！GAS から Gemini への通信テストです。' }]
      }
    ],
    generationConfig: {
      temperature: 0.2,
      maxOutputTokens: 128,
      responseMimeType: 'text/plain'
    }
  };

  const res = UrlFetchApp.fetch(url, {
    method: 'post',
    contentType: 'application/json',
    headers: { 'x-goog-api-key': key },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  });

  Logger.log('HTTP ステータス: ' + res.getResponseCode());
  Logger.log('レスポンス本文: ' + res.getContentText());
}

/** 2) 汎用プロンプトテスト（短い要約） */
function test2_promptEcho() {
  const text = 'この文章を15文字以内で要約してください：MOTOKI合同会社は、WordPressに特化したWeb制作会社で、SEOに強いサイト構築を強みとしています。WordPressテーマ「SWELL」をベースに、ヒアリングを重視した機能・デザイン・使いやすさを追求したウェブサイト制作を行っています。 事業内容: Webサイトの制作。得意分野: WordPress、特に「SWELL」を用いた制作。強み:長年のサイト運営経験を活かしたSEOに強いサイト構築。顧客へのヒアリングを重視し、機能、デザイン、使いやすさを追求したサイト制作。内部施策の強化によるSEO対策。所在地: 埼玉県所沢市。';
  const out = callGemini_(GEMINI_MODEL_PRIMARY, text);
  Logger.log('Gemini 出力: ' + out);
}

/** 3) モデル一覧取得テスト（generateContent対応を確認） */
function test3_listModels() {
  const key = getKey_();
  const url = `${GEMINI_ENDPOINT_BASE}?key=${encodeURIComponent(key)}`;
  const res = UrlFetchApp.fetch(url, { muteHttpExceptions: true });

  Logger.log('HTTP ステータス: ' + res.getResponseCode());
  Logger.log('レスポンス本文: ' + res.getContentText());

  // 必要ならスプレッドシートに展開
  const json = JSON.parse(res.getContentText());
  const arr  = json.models || [];
  const rows = [['name', 'supportedGenerationMethods']];

  arr.forEach(m => {
    rows.push([
      m.name || '',
      (m.supportedGenerationMethods || []).join(', ')
    ]);
  });

  const ss = SpreadsheetApp.getActive();
  const sh =
    ss.getSheetByName('診断_モデル一覧') ||
    ss.insertSheet('診断_モデル一覧');

  sh.clear();
  sh.getRange(1, 1, rows.length, 2).setValues(rows);
  sh.autoResizeColumns(1, 2);
}

/**
 * 4) シート要約テスト
 * - 対象シート: 「シート1」
 * - 列構成: A=ID, B=タイトル, C=ステータス, D=担当者
 * - 出力: 「担当者別まとめ（要約）」シートに担当者ごとの要約を書き出し
 */
function test4_summarizeSheet() {
  const ss  = SpreadsheetApp.getActive();
  const src = ss.getSheetByName('シート1');
  if (!src) throw new Error('「シート1」が見つかりません。');

  const lastRow = src.getLastRow();
  if (lastRow < 2) throw new Error('2行目以降にデータがありません。');

  const values = src.getRange(2, 1, lastRow - 1, 4).getValues(); // A:D
  const byAssignee = new Map();

  for (const [id, title, status, assignee] of values) {
    if (!assignee) continue;
    const line = `${id}｜${title}｜${status}`;
    if (!byAssignee.has(assignee)) byAssignee.set(assignee, []);
    byAssignee.get(assignee).push(line);
  }

  const out   = [['担当者', '件数', '要約']];
  const names = Array.from(byAssignee.keys())
    .sort((a, b) => String(a).localeCompare(String(b), 'ja'));

  for (const name of names) {
    const tasks  = byAssignee.get(name);
    const prompt = buildSummaryPrompt_(tasks);

    // まずは安定モデル
    let summary = callGemini_(GEMINI_MODEL_PRIMARY, prompt);

    // 結果が空 or エラー表示の場合は代替モデルも試す
    if (!summary || /^（エラー:|（結果なし）/.test(summary)) {
      Utilities.sleep(200);
      summary = callGemini_(GEMINI_MODEL_ALTERNATE, prompt);
    }

    out.push([name, tasks.length, summary || '（結果なし）']);
    Utilities.sleep(250); // 連続呼び出しの軽い間隔
  }

  let dst = ss.getSheetByName('担当者別まとめ（要約）');
  if (!dst) dst = ss.insertSheet('担当者別まとめ（要約）');
  else dst.clear();

  dst.getRange(1, 1, out.length, 3).setValues(out);
  dst.autoResizeColumns(1, 2);
  dst.setColumnWidth(3, 720);
  dst.getRange('A1:C1').setFontWeight('bold');
}

/* ====== 共通ユーティリティ ====== */

/** タスク配列から要約用のプロンプトを組み立て */
function buildSummaryPrompt_(items) {
  return `
以下のタスクを日本語で要約してください。

【必ず守るルール】
・必ず文章を出力する
・空欄は禁止
・最大120文字以内
・1〜2文 + 箇条書き（最大3項目）

【出力形式】
進捗まとめ：
・〇〇
・〇〇

【タスク】
${items.map(s => '・' + s).join('\n')}
`;
}


/** Gemini 呼び出し共通処理（プレーンテキスト前提） */
function callGemini_(model, userText) {
  const key = getKey_();
  const url = `${GEMINI_ENDPOINT_BASE}/${model}:generateContent`;

  const payload = {
    contents: [
      {
        role: 'user',
        parts: [{ text: userText }]
      }
    ],
    generationConfig: {
      temperature: 0.2,
      maxOutputTokens: 300
    }
  };

  const res = UrlFetchApp.fetch(url, {
    method: 'post',
    contentType: 'application/json',
    headers: { 'x-goog-api-key': key },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  });

  const code = res.getResponseCode();
  const body = res.getContentText();

  if (code !== 200) {
    Logger.log(`Gemini Error ${code}: ${body}`);
    return `（エラー: ${code}）`;
  }

  try {
    const json = JSON.parse(body);

    // 2.5世代向けの最も安全な取得方法
    const parts = json?.candidates?.[0]?.content?.parts || [];

    if (!parts.length) {
      Logger.log('Empty response body:' + body);
      return '（結果なし）';
    }

    const text = parts.map(p => p.text || '').join('').trim();

    if (!text) {
      Logger.log('Empty text:' + body);
      return '（結果なし）';
    }

    return text;

  } catch (e) {
    Logger.log('JSON parse error: ' + e);
    return '（結果なし）';
  }
}


/** スクリプトプロパティから API キー取得 */
function getKey_() {
  const key = PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY');
  if (!key) {
    throw new Error('GEMINI_API_KEY が未設定です（スクリプトプロパティに API キーを設定してください）。');
  }
  return key;
}
