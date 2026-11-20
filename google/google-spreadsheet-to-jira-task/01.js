const JIRA_DRY_RUN = true;
const JIRA_SHEET_NAME = 'Jira練習';
function jiraConfig_() {
  const p = PropertiesService.getScriptProperties();
  const read = k => {const v=p.getProperty(k);if(!v)throw new Error(k+'が未設定です');return v;};
  const api = read('JIRA_API_BASE').replace(/\/$/,'');
  if (!/^https:\/\/[a-z0-9][a-z0-9-]*\.atlassian\.net$/.test(api) &&
      !/^https:\/\/api\.atlassian\.com\/ex\/jira\/[a-f0-9-]{36}$/i.test(api)) throw new Error('API接続先を確認してください');
  const project = read('JIRA_PROJECT_ID'), type = read('JIRA_ISSUE_TYPE_ID');
  if (!/^\d+$/.test(project) || !/^\d+$/.test(type)) throw new Error('プロジェクトと課題タイプはIDを設定してください');
  return {api,project,type,sheetId:read('SPREADSHEET_ID'),email:read('JIRA_EMAIL'),token:read('JIRA_API_TOKEN')};
}
function publishJiraTasksFromSheet() {
  const lock=LockService.getScriptLock();
  if(!lock.tryLock(1000))throw new Error('別の実行が進行中です');
  try {
    const c=jiraConfig_();
    const sheet=SpreadsheetApp.openById(c.sheetId).getSheetByName(JIRA_SHEET_NAME);
    if(!sheet)throw new Error('Jira練習シートがありません');
    const last=sheet.getLastRow();
    if(last<2 || last>11)throw new Error('見出しを除き1〜10行にしてください');
    const range=sheet.getRange(1,1,last,5), rows=range.getDisplayValues();
    if(range.getFormulas().some(r=>r.some(Boolean)))throw new Error('A:E列には数式を使わないでください');
    const heads=['発行状態','タスク番号','タスク名','説明','照合ID'];
    if(heads.some((v,i)=>rows[0][i]!==v))throw new Error('A1:E1の見出しを確認してください');
    if(rows.slice(1).some(r=>r[0] && !['準備','済'].includes(r[0])))throw new Error('送信中・結果不明の行を先にJiraと照合してください');
    const targets=rows.slice(1).map((r,i)=>({r,row:i+2})).filter(x=>x.r[0]==='準備');
    if(targets.length!==1)throw new Error('準備にする行は1件だけにしてください');
    const {r,row}=targets[0];
    if(r[1] || r[4])throw new Error('タスク番号・照合IDがある行は再送しません');
    if(!r[2].trim() || r[2].length>200 || r[3].length>4000)throw new Error('タスク名1〜200文字、説明4000文字以内にしてください');
    if(JIRA_DRY_RUN){console.log('未送信：対象行='+row+'、projectId='+c.project+'、typeId='+c.type);return;}
    const id='sheet-'+Utilities.getUuid();
    const text=r[3]+'\n照合ID: '+id;
    const fields={project:{id:c.project},issuetype:{id:c.type},summary:r[2],description:{type:'doc',version:1,content:text.split(/\r?\n/).map(t=>({type:'paragraph',content:t?[{type:'text',text:t}]:[]}))}};
    // 書き込み前にも入力を比較。共同編集や並べ替えは止めて実行する。
    if(JSON.stringify(sheet.getRange(row,1,1,5).getDisplayValues()[0])!==JSON.stringify(r))throw new Error('入力が変更されました');
    sheet.getRange(row,5).setValue(id);
    sheet.getRange(row,1).setValue('送信中');
    SpreadsheetApp.flush();
    let key='';
    try {
      const res=UrlFetchApp.fetch(c.api+'/rest/api/3/issue',{
        method:'post',contentType:'application/json',
        headers:{Authorization:'Basic '+Utilities.base64Encode(c.email+':'+c.token),Accept:'application/json'},
        payload:JSON.stringify({fields}),muteHttpExceptions:true,followRedirects:false
      });
      if(res.getResponseCode()!==201)throw new Error('HTTP '+res.getResponseCode());
      key=JSON.parse(res.getContentText()).key;
      if(typeof key!=='string' || !/^[A-Z][A-Z0-9_]*-\d+$/.test(key))throw new Error('課題キーを確認できません');
      console.log('作成応答：'+key+'、照合ID='+id);
      sheet.getRange(row,2).setValue(key);
      SpreadsheetApp.flush();
      sheet.getRange(row,1).setValue('済');
      SpreadsheetApp.flush();
    } catch(error) {
      try {sheet.getRange(row,1).setValue('結果不明');SpreadsheetApp.flush();}catch(ignored){}
      throw new Error('再送しないでください。行='+row+'、照合ID='+id+'。Jiraとシートを照合してください。');
    }
  } finally {lock.releaseLock();}
}
