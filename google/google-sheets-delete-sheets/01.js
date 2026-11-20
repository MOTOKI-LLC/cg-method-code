const DELETE_DEMO = {spreadsheetId:'COPY_SPREADSHEET_ID',keepSheets:['勤怠','共通','名簿']};
const DELETE_PLAN_KEY = 'deleteSheetPreviewV1';
function sheetDeletePlan_() {
  const ss=SpreadsheetApp.openById(DELETE_DEMO.spreadsheetId), sheets=ss.getSheets();
  const keep=DELETE_DEMO.keepSheets;
  if(!keep.length || new Set(keep).size!==keep.length)throw new Error('残す名前を重複なしで指定してください');
  if(sheets.length>50)throw new Error('練習は50シート以内です');
  const state=sheets.map(s=>({id:s.getSheetId(),name:s.getName(),hidden:s.isSheetHidden()}));
  if(keep.some(n=>!state.some(s=>s.name===n)))throw new Error('残すシート名に存在しない名前があります');
  if(!state.some(s=>keep.includes(s.name)&&!s.hidden))throw new Error('表示中のシートを最低1枚残してください');
  return {spreadsheetId:ss.getId(),keep:keep.slice(),state,remove:state.filter(s=>!keep.includes(s.name))};
}
function previewDeleteSheets() {
  const plan=sheetDeletePlan_(), text=JSON.stringify(plan);
  if(Utilities.newBlob(text).getBytes().length>8000)throw new Error('計画が大きすぎます');
  PropertiesService.getUserProperties().setProperty(DELETE_PLAN_KEY,text);
  console.log('削除予定（まだ削除しません）：'+JSON.stringify(plan.remove));
  console.log('残すシート：'+JSON.stringify(plan.keep));
}
function deleteExcludedSheets() {
  const lock=LockService.getScriptLock();
  if(!lock.tryLock(1000))throw new Error('別の処理が実行中です');
  let completedCount=null;
  try {
    const props=PropertiesService.getUserProperties(),saved=props.getProperty(DELETE_PLAN_KEY);
    if(!saved)throw new Error('同じアカウントで先にpreviewDeleteSheetsを実行してください');
    const plan=sheetDeletePlan_();
    if(saved!==JSON.stringify(plan))throw new Error('設定やシート構成が変わりました。再度下見してください');
    if(!plan.remove.length){console.log('削除対象なし');return;}
    const backup=DriveApp.getFileById(plan.spreadsheetId).makeCopy('シート削除前_'+Utilities.getUuid());
    console.log('バックアップURL：'+backup.getUrl());
    if(saved!==JSON.stringify(sheetDeletePlan_()))throw new Error('コピー中にシート構成が変わりました');
    props.deleteProperty(DELETE_PLAN_KEY);
    const ss=SpreadsheetApp.openById(plan.spreadsheetId),done=[];
    try {
      for(const item of plan.remove){
        const sheet=ss.getSheetById(item.id);
        if(!sheet || sheet.getName()!==item.name)throw new Error('削除対象が変更されました');
        ss.deleteSheet(sheet);done.push(item);
      }
    } catch(error) {
      console.log('削除呼び出しが正常終了した対象（全削除結果とは限りません）：'+JSON.stringify(done));
      throw new Error('途中停止。バックアップと現在の状態を照合してください');
    }
    completedCount=done.length;
  } finally {
    try {SpreadsheetApp.flush();}
    finally {lock.releaseLock();}
  }
  console.log('削除処理終了：'+completedCount+'枚。現在のシート構成と参照先を確認してください');
}
