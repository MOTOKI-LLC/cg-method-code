/************************************************
 * Jira タスク発行スクリプト
 * （エピック紐付け + 担当者 + ステータス + 優先度
 *
 * シート構成（シート1）
 *   A: 発行状態   （空 / 済）
 *   B: 親         （エピックキー: 例 MFLP-2）
 *   C: タスク番号（Jira Issueキー）
 *   D: 報告者     （未使用）
 *   E: タスク名   （summary）
 *   F: 担当者     （Jiraの表示名: 例 suimin）
 *   G: ステータス （To Do / 進行中 / レビュー中 / 完了）
 *   H: 優先度     （Highest / High / Medium / Low / Lowest）
 *   I: 説明       （テキスト）
 ************************************************/


/* ========================
   共通
======================== */

function getJiraConfig() {
  const props    = PropertiesService.getScriptProperties();
  const baseUrl  = props.getProperty('JIRA_BASE_URL');
  const email    = props.getProperty('JIRA_EMAIL');
  const apiToken = props.getProperty('JIRA_API_TOKEN');

  if (!baseUrl || !email || !apiToken) {
    throw new Error('Jira接続情報が設定されていません。');
  }
  return { baseUrl, email, apiToken };
}

/**
 * キーをHYPERLINKに変換してセルへセット
 */
function setJiraLinkToCell_(sheet, row, col, issueKey) {
  if (!issueKey) return;
  const config = getJiraConfig();
  const url = config.baseUrl.replace(/\/$/, '') + '/browse/' + issueKey;
  sheet.getRange(row, col).setFormula(
    `=HYPERLINK("${url}","${issueKey}")`
  );
}


/* ========================
   ユーザー検索（担当者）
======================== */

function findAccountIdByExactDisplayName_(displayName) {
  const config = getJiraConfig();
  const url = config.baseUrl + '/rest/api/3/user/search?query=' +
              encodeURIComponent(displayName);

  const res = UrlFetchApp.fetch(url, {
    method: 'get',
    headers: {
      Authorization: 'Basic ' +
        Utilities.base64Encode(config.email + ':' + config.apiToken)
    },
    muteHttpExceptions: true
  });

  if (res.getResponseCode() >= 300) {
    Logger.log('ユーザー検索エラー: ' + res.getContentText());
    return '';
  }

  const users = JSON.parse(res.getContentText());
  for (const user of users) {
    if (user.displayName === displayName) return user.accountId;
  }
  return '';
}


/* ========================
   ステータス遷移
======================== */

/**
 * G列のステータス名（「レビュー中」「進行中」「完了」など）に遷移させる
 */
function transitionIssueStatus(issueKey, targetStatusName) {
  if (!targetStatusName) return;

  const config = getJiraConfig();
  const url = config.baseUrl + '/rest/api/3/issue/' +
              encodeURIComponent(issueKey) + '/transitions';

  const headers = {
    Authorization: 'Basic ' +
      Utilities.base64Encode(config.email + ':' + config.apiToken),
    Accept: 'application/json',
    'Content-Type': 'application/json'
  };

  // 利用可能な遷移一覧を取得
  const listRes = UrlFetchApp.fetch(url, {
    method: 'get',
    headers: headers,
    muteHttpExceptions: true
  });

  const listCode = listRes.getResponseCode();
  const listBody = listRes.getContentText();

  if (listCode < 200 || listCode >= 300) {
    Logger.log('ステータス取得失敗 issue=' + issueKey +
               ' code=' + listCode + ' body=' + listBody);
    return;
  }

  const listJson = JSON.parse(listBody);
  const transitions = listJson.transitions || [];

  // UI上のステータス名（t.to.name）で一致を探す
  const trans = transitions.find(t =>
    t.to && t.to.name === targetStatusName
  ) || transitions.find(t =>
    t.name === targetStatusName
  );

  if (!trans) {
    Logger.log('ステータス "' + targetStatusName +
               '" への遷移が見つかりません（issue=' + issueKey + '）');
    return;
  }

  const payload = {
    transition: { id: trans.id }
  };

  const doRes = UrlFetchApp.fetch(url, {
    method: 'post',
    headers: headers,
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  });

  const doCode = doRes.getResponseCode();
  const doBody = doRes.getContentText();
  if (doCode >= 200 && doCode < 300) {
    Logger.log('ステータス変更成功 issue=' + issueKey +
               ' -> ' + targetStatusName);
  } else {
    Logger.log('ステータス変更失敗 issue=' + issueKey +
               ' code=' + doCode + ' body=' + doBody);
  }
}


/* ========================
   Jira Issue作成
======================== */

function createJiraIssue(summary, descriptionText, epicKey,
                         assigneeRaw, priorityName, statusName) {
  const config = getJiraConfig();
  const projectKey = epicKey ? String(epicKey).split('-')[0] : 'MFLP';

  const fields = {
    project:   { key: projectKey },
    summary:   summary,
    issuetype: { name: 'Task' },
    description: {
      type: 'doc',
      version: 1,
      content: [{
        type: 'paragraph',
        content: descriptionText
          ? [{ type: 'text', text: String(descriptionText) }]
          : []
      }]
    }
  };

  // 親エピック
  if (epicKey) fields.parent = { key: epicKey };

  // 担当者
  if (assigneeRaw) {
    const id = findAccountIdByExactDisplayName_(assigneeRaw);
    if (id) {
      fields.assignee = { accountId: id };
    } else {
      Logger.log('WARN: 担当者 "%s" の accountId が見つからず未割当', assigneeRaw);
    }
  }

  // 優先度
  if (priorityName) {
    fields.priority = { name: priorityName };
  }

  // Issue作成
  const createRes = UrlFetchApp.fetch(config.baseUrl + '/rest/api/3/issue', {
    method: 'post',
    headers: {
      Authorization: 'Basic ' +
        Utilities.base64Encode(config.email + ':' + config.apiToken),
      'Content-Type': 'application/json',
      Accept: 'application/json'
    },
    payload: JSON.stringify({ fields }),
    muteHttpExceptions: true
  });

  const createCode = createRes.getResponseCode();
  const createBody = createRes.getContentText();

  if (createCode < 200 || createCode >= 300) {
    Logger.log('Jira Issue作成エラー code=' + createCode + ' body=' + createBody);
    throw new Error('Issue作成失敗');
  }

  const issueKey = JSON.parse(createBody).key;
  Logger.log('Issue作成成功: ' + issueKey);

  // ステータスが指定されていれば遷移
  if (statusName) {
    transitionIssueStatus(issueKey, statusName);
  }

  return issueKey;
}


/* ========================
   実行本体
======================== */

function publishJiraTasksFromSheet() {
  const sheet   = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('シート1');
  const lastRow = sheet.getLastRow();

  for (let r = 2; r <= lastRow; r++) {
    const 発行状態 = sheet.getRange(r, 1).getValue();
    if (発行状態 === '済') continue;

    const 親         = sheet.getRange(r, 2).getValue(); // B: 親エピック
    const タスク名   = sheet.getRange(r, 5).getValue(); // E: タスク名
    if (!タスク名) continue;

    const 担当者     = sheet.getRange(r, 6).getValue(); // F
    const ステータス = sheet.getRange(r, 7).getValue(); // G
    const 優先度     = sheet.getRange(r, 8).getValue(); // H
    const 説明       = sheet.getRange(r, 9).getValue(); // I: 説明

    try {
      const issueKey = createJiraIssue(
        タスク名, 説明, 親,
        担当者, 優先度, ステータス
      );

      // A列: 発行済に
      sheet.getRange(r, 1).setValue('済');

      // B列: 親エピックをリンク化（元の値がキー前提）
      if (親) setJiraLinkToCell_(sheet, r, 2, 親);

      // C列: タスクキーをリンク化
      setJiraLinkToCell_(sheet, r, 3, issueKey);

    } catch (e) {
      Logger.log('行 ' + r + ' エラー: ' + e.message);
    }
  }
}
