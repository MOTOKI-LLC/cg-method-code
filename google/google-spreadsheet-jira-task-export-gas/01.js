/************************************************
 * Jira エピック & タスク一覧エクスポート（練習用・既存シートを消去しない版）
 *
 * 機能:
 *  - 指定したエピックキー（例: MFLP-2, MFLP-7）と、その配下タスクを取得
 *  - シート「JIRA一覧」に以下の列で出力
 *      タスク番号 / 報告者 / タスク名 / 担当者 / ステータス / 優先度 / 説明
 *  - エピック行は 黒背景＋白文字＋太字
 *  - 説明は Jira の ADF(Atlassian Document Format) → プレーンテキスト に変換
 *
 * 前提となるスクリプトプロパティ:
 *  - JIRA_BASE_URL    例: https://自分のサイト.atlassian.net （末尾スラッシュはあってもOK）
 *  - JIRA_EMAIL       Jira ログインメールアドレス
 *  - JIRA_API_TOKEN   Jira APIトークン
 *  - JIRA_PROJECT_KEY 例: MFLP（必須）
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
  const project  = props.getProperty('JIRA_PROJECT_KEY');

  if (!baseUrl || !email || !apiToken || !project) {
    throw new Error('Jira接続情報（JIRA_BASE_URL / JIRA_EMAIL / JIRA_API_TOKEN）が未設定です。');
  }

  // 末尾スラッシュは削除して統一
  baseUrl = baseUrl.replace(/\/$/, '');
  if (!/^https:\/\/[a-z0-9][a-z0-9-]*\.atlassian\.net$/.test(baseUrl) &&
      !/^https:\/\/api\.atlassian\.com\/ex\/jira\/[a-f0-9-]{36}$/i.test(baseUrl)) throw new Error('API接続先を確認してください');
  if (!/^[A-Z][A-Z0-9_]*$/.test(project)) throw new Error('プロジェクトキーを確認してください');


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
  const cfg=getJiraConfig_(), all=[], tokens=new Set(), keys=new Set();
  let token='';
  for(let page=0;page<20;page++) {
    const payload={jql,fields,maxResults:100};
    if(token)payload.nextPageToken=token;
    const res=UrlFetchApp.fetch(cfg.baseUrl+'/rest/api/3/search/jql',{
      method:'post',contentType:'application/json',
      headers:{Authorization:buildAuthHeader_(),Accept:'application/json'},
      payload:JSON.stringify(payload),muteHttpExceptions:true,followRedirects:false
    });
    if(res.getResponseCode()!==200)throw new Error('Jira検索 HTTP '+res.getResponseCode());
    const data=JSON.parse(res.getContentText());
    if(!Array.isArray(data.issues))throw new Error('検索応答にissuesがありません');
    for(const issue of data.issues) {
      if(!issue.key || keys.has(issue.key))throw new Error('課題キー欠落またはページ間重複です');
      keys.add(issue.key);all.push(issue);
    }
    if(all.length>1000)throw new Error('1検索1000件までです');
    if(data.isLast===true)return all;
    const next=data.nextPageToken;
    if(typeof next!=='string' || !next || tokens.has(next))throw new Error('続きのトークン欠落または循環です');
    tokens.add(next);token=next;
  }
  throw new Error('20ページで終了しないため出力を中止します');
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
        case 'hardBreak':
          text += '\n';
          break;
        case 'mention':
          text += (node.attrs && node.attrs.text) || '[メンション]';
          break;
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
  if (!Array.isArray(epicKeys) || !epicKeys.length || epicKeys.length>5 || new Set(epicKeys).size!==epicKeys.length || epicKeys.some(k=>!new RegExp('^'+cfg.projectKey+'-\\d+$').test(k))) throw new Error('同一プロジェクトのエピックキーを重複なしで1〜5件指定してください');

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
  if(epics.length!==epicKeys.length)throw new Error('指定エピックをすべて取得できません。キー・種類・権限を確認してください');
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
  const lock=LockService.getScriptLock();
  if(!lock.tryLock(1000))throw new Error('別の実行が進行中です');
  let completedRows = null;
  try {
    const id=PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID');
    if(!id)throw new Error('出力先SPREADSHEET_IDが未設定です');
    const ss=SpreadsheetApp.openById(id);
    const rows=buildRowsForEpics_(epicKeys);
    if(rows.length>1000)throw new Error('合計1000行までです');
    const headers=['タスク番号','報告者','タスク名','担当者','ステータス','優先度','説明'];
    const safe=value=>{const s=String(value??'');if(s.length>40000)throw new Error('セル文字数が練習上限を超えます');return /^[\s]*[=+@-]/.test(s)?"'"+s:s;};
    const values=rows.map(o=>o.row.slice(1).map(safe));
    const name=sheetName+'_'+Utilities.getUuid().replace(/-/g,'');
    const sheet=ss.insertSheet(name);
    console.log('作成した出力シート：'+name+'。途中失敗時はこのシートを確認してください');
    if(sheet.getMaxRows()<values.length+1)sheet.insertRowsAfter(sheet.getMaxRows(),values.length+1-sheet.getMaxRows());
    sheet.getRange(1,1,1,headers.length).setValues([headers]).setFontWeight('bold').setBackground('#eeeeee');
    if(values.length)sheet.getRange(2,1,values.length,headers.length).setValues(values);
    rows.forEach((o,i)=>{if(o.isEpic)sheet.getRange(i+2,1,1,headers.length).setBackground('#000000').setFontColor('#ffffff').setFontWeight('bold');});
    completedRows = values.length;
  } finally {
    try {SpreadsheetApp.flush();}
    finally {lock.releaseLock();}
  }
  console.log('出力完了：'+completedRows+'行。Jiraと件数・内容を照合してください');
}
