/************************************************
 * Jira エピック & タスク一覧エクスポート（最終リファクタ版）
 *
 * 機能:
 *  - 指定したエピックキー（例: MFLP-2, MFLP-7）と、その配下タスクを取得
 *  - シート「JIRA一覧」に以下の列で出力
 *      タスク番号 / 報告者 / タスク名 / 担当者 / ステータス / 優先度 / 説明
 *  - エピック行は 黒背景＋白文字＋太字
 *  - 説明は Jira の ADF(Atlassian Document Format) → プレーンテキスト に変換
 *
 * 前提となるスクリプトプロパティ:
 *  - JIRA_BASE_URL    例: https://motoki.atlassian.net （末尾スラッシュはあってもOK）
 *  - JIRA_EMAIL       Jira ログインメールアドレス
 *  - JIRA_API_TOKEN   Jira APIトークン
 *  - JIRA_PROJECT_KEY 例: MFLP（無ければ MFLP をデフォルト使用）
 ************************************************/


/* ========================
 * 設定・共通ユーティリティ
 * ====================== */

/** Jira接続設定を取得 */
function getJiraConfig_() {
  const props    = PropertiesService.getScriptProperties();
  let   baseUrl  = props.getProperty('JIRA_BASE_URL');
  const email    = props.getProperty('JIRA_EMAIL');
  const apiToken = props.getProperty('JIRA_API_TOKEN');
  const project  = props.getProperty('JIRA_PROJECT_KEY') || 'MFLP';

  if (!baseUrl || !email || !apiToken) {
    throw new Error('Jira接続情報（JIRA_BASE_URL / JIRA_EMAIL / JIRA_API_TOKEN）が未設定です。');
  }

  // 末尾スラッシュは削除して統一
  baseUrl = baseUrl.replace(/\/$/, '');

  return {
    baseUrl,
    email,
    apiToken,
    projectKey: project
  };
}

/** Basic 認証ヘッダー文字列 */
function buildAuthHeader_() {
  const cfg = getJiraConfig_();
  return 'Basic ' + Utilities.base64Encode(cfg.email + ':' + cfg.apiToken);
}


/* ========================
 * Jira 検索（JQL, paging対応）
 * ====================== */

/**
 * JQL で全件取得（ページングを自動で回す）
 *
 * @param {string} jql
 * @param {string[]} fields 取得したいフィールド名
 * @return {Object[]} issues の配列
 */
function fetchAllIssuesByJql_(jql, fields) {
  const cfg  = getJiraConfig_();
  const auth = buildAuthHeader_();

  const all = [];
  let startAt     = 0;
  const maxResults = 100;

  while (true) {
    const url =
      cfg.baseUrl +
      '/rest/api/3/search/jql?' +
      'jql=' + encodeURIComponent(jql) +
      '&startAt=' + startAt +
      '&maxResults=' + maxResults +
      '&fields=' + encodeURIComponent(fields.join(','));

    const res = UrlFetchApp.fetch(url, {
      method: 'get',
      headers: {
        Authorization: auth,
        Accept: 'application/json'
      },
      muteHttpExceptions: true
    });

    const code = res.getResponseCode();
    const body = res.getContentText();

    if (code < 200 || code >= 300) {
      Logger.log('fetchAllIssuesByJql_ error code=%s body=%s', code, body);
      throw new Error('Jira search 失敗: code=' + code);
    }

    const json   = JSON.parse(body);
    const issues = json.issues || [];

    Logger.log('fetchAllIssuesByJql_: startAt=%s 取得=%s total=%s',
               json.startAt, issues.length, json.total);

    all.push.apply(all, issues);

    // これ以上なければ終了
    if (issues.length < maxResults) break;

    startAt += maxResults;
  }

  return all;
}


/* ========================
 * ADF → プレーンテキスト
 * ====================== */

/**
 * Jira の description（ADF形式）をプレーンテキストに変換
 *  - 段落ごとに改行
 *  - 画像などは "[画像]" として簡易表記
 */
function adfToPlainText_(adf) {
  if (!adf || !adf.content) return '';

  let text = '';

  function walk(nodes) {
    if (!nodes) return;
    for (const node of nodes) {
      switch (node.type) {
        case 'text':
          text += node.text || '';
          break;

        case 'paragraph':
        case 'heading':
          if (node.content) walk(node.content);
          text += '\n';
          break;

        case 'bulletList':
        case 'orderedList':
        case 'listItem':
          if (node.content) walk(node.content);
          break;

        case 'mediaSingle':
          text += '[画像]\n';
          break;

        default:
          if (node.content) walk(node.content);
          break;
      }
    }
  }

  walk(adf.content);
  return text.trim();
}


/* ========================
 * エピック / タスク行の構築
 * ====================== */

/**
 * 指定したエピックキー配列の
 *  - エピック本体
 *  - 各エピック配下のタスク
 * をまとめて rows（1行 = 1配列）にして返す
 *
 * rowの並び:
 *   [親, タスク番号, 報告者, タスク名, 担当者, ステータス, 優先度, 説明]
 * ※ 親は内部利用のみで、シート出力時には使わない
 *
 * 戻り値: { isEpic: boolean, row: string[] }[]
 */
function buildRowsForEpics_(epicKeys) {
  const cfg = getJiraConfig_();
  const rows = [];

  /** 1. エピック本体を取得 */
  const epicJql =
    'project = ' + cfg.projectKey +
    ' AND issuetype = Epic' +
    ' AND key in (' + epicKeys.join(',') + ')' +
    ' ORDER BY key ASC';

  const epicFields = [
    'summary',
    'status',
    'assignee',
    'reporter',
    'priority',
    'description'
  ];

  const epics = fetchAllIssuesByJql_(epicJql, epicFields);

  // key → epic のマップ
  const epicMap = {};
  epics.forEach(epic => {
    epicMap[epic.key] = epic;
  });

  /** 2. 各エピックごとに「エピック行 + 配下タスク行」を rows に積む */
  epicKeys.forEach(epicKey => {
    const epic = epicMap[epicKey];
    if (!epic) return; // 存在しないエピックキーはスキップ

    const ef = epic.fields;
    const epicSummary   = ef.summary || '';
    const epicReporter  = (ef.reporter && ef.reporter.displayName) || '';
    const epicAssignee  = (ef.assignee && ef.assignee.displayName) || '';
    const epicStatus    = (ef.status && ef.status.name) || '';
    const epicPriority  = (ef.priority && ef.priority.name) || '';
    const epicDescPlain = adfToPlainText_(ef.description);

    // --- エピック1行（黒背景＆白文字にするため isEpic: true を付ける） ---
    rows.push({
      isEpic: true,
      row: [
        '',             // 親（無し）
        epic.key,       // タスク番号（=エピックキー）
        epicReporter,   // 報告者
        epicSummary,    // タスク名
        epicAssignee,   // 担当者
        epicStatus,     // ステータス
        epicPriority,   // 優先度
        epicDescPlain   // 説明
      ]
    });

    /** 3. エピック配下タスクを取得 */
    const taskJql =
      'project = ' + cfg.projectKey +
      ' AND issuetype != Epic' +
      ' AND parent = ' + epic.key +
      ' ORDER BY key ASC';

    const taskFields = [
      'summary',
      'status',
      'assignee',
      'reporter',
      'priority',
      'parent',
      'description'
    ];

    const tasks = fetchAllIssuesByJql_(taskJql, taskFields);

    tasks.forEach(task => {
      const tf = task.fields;
      const parentKey = (tf.parent && tf.parent.key) || epic.key;
      const descText  = adfToPlainText_(tf.description);

      rows.push({
        isEpic: false,
        row: [
          parentKey,                                  // 親（エピックキー）
          task.key,                                   // タスク番号
          (tf.reporter && tf.reporter.displayName) || '', // 報告者
          tf.summary || '',                           // タスク名
          (tf.assignee && tf.assignee.displayName) || '', // 担当者
          (tf.status && tf.status.name) || '',        // ステータス
          (tf.priority && tf.priority.name) || '',    // 優先度
          descText                                    // 説明（ADF → テキスト）
        ]
      });
    });
  });

  return rows;
}


/* ========================
 * シート出力
 * ====================== */

/**
 * 実行用エントリポイント（例）
 *  - 例として MFLP-2 / MFLP-7 を対象に「JIRA一覧」シートへ出力
 */
function exportEpicIssues_MFLP_2_7() {
  const epicKeys = ['MFLP-2', 'MFLP-7']; // ここを差し替えれば別エピックにも使える
  exportEpicIssuesToSheet_(epicKeys, 'JIRA一覧');
}

/**
 * 指定エピック群を指定シートに出力する共通関数
 *
 * @param {string[]} epicKeys 例: ['MFLP-2','MFLP-7']
 * @param {string} sheetName  出力シート名（例: 'JIRA一覧'）
 */
function exportEpicIssuesToSheet_(epicKeys, sheetName) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet =
    ss.getSheetByName(sheetName) ||
    ss.insertSheet(sheetName);

  // 親列は出力しない
  const headers = [
    'タスク番号',
    '報告者',
    'タスク名',
    '担当者',
    'ステータス',
    '優先度',
    '説明'
  ];

  sheet.clearContents();
  sheet.clearFormats();

  sheet.getRange(1, 1, 1, headers.length)
       .setValues([headers])
       .setFontWeight('bold')
       .setBackground('#eeeeee');

  const rowsWithFlag = buildRowsForEpics_(epicKeys);

  if (!rowsWithFlag.length) {
    Logger.log('対象エピック/タスクが見つかりませんでした。');
    return;
  }

  // 親列（row[0]）を除外してシートに出力
  const values = rowsWithFlag.map(o => {
    const r = o.row;
    // r = [親, key, reporter, summary, assignee, status, priority, desc]
    return [
      r[1], // タスク番号
      r[2], // 報告者
      r[3], // タスク名
      r[4], // 担当者
      r[5], // ステータス
      r[6], // 優先度
      r[7]  // 説明
    ];
  });

  const startRow = 2;
  sheet.getRange(startRow, 1, values.length, headers.length)
       .setValues(values);

  // エピック行のみスタイル適用（黒背景＋白文字＋太字）
  rowsWithFlag.forEach((o, idx) => {
    if (!o.isEpic) return;
    const rowIndex = startRow + idx;
    sheet.getRange(rowIndex, 1, 1, headers.length)
         .setBackground('#000000')
         .setFontColor('#ffffff')
         .setFontWeight('bold');
  });
}
