const SYNC = {spreadsheetId:'COPY_SPREADSHEET_ID',master:'シート2',target:'シート1',apply:false};
function syncKey_(row) {
  const parts=row.slice(0,3);
  if(parts.every(v=>v===''))throw new Error('A:Cがすべて空の行があります');
  return JSON.stringify(parts.map(v=>v instanceof Date?['date',v.getTime()]:[typeof v,v]));
}
function syncPlan_(master,target,width) {
  const map=new Map(), seen=new Set();
  for(const row of target){const k=syncKey_(row);if(map.has(k))throw new Error('シート1のキー重複');map.set(k,row);}
  let added=0,matched=0;
  const values=master.map(row=>{
    const k=syncKey_(row);if(seen.has(k))throw new Error('シート2のキー重複');seen.add(k);
    const previous=map.get(k);if(previous)matched++;else added++;
    const out=previous?previous.slice():Array(width).fill('');
    row.slice(0,3).forEach((v,i)=>out[i]=v);return out;
  });
  return {values,added,matched,removed:target.length-matched};
}
function syncSnapshot_(rows) {
  return JSON.stringify(rows.map(row => row.map(v =>
    v instanceof Date ? ['date', v.getTime()] : [typeof v, v])));
}
function syncRead_(sheet,width) {
  const last=sheet.getLastRow();
  if(last<1 || last>1001)throw new Error('見出しが必要です。データは1000行以内にしてください');
  const range=sheet.getRange(1,1,last,width);
  if(range.isPartOfMerge())throw new Error('結合セルは対象外です');
  if(range.getFormulas().some(r=>r.some(Boolean)))throw new Error('数式は対象外です。値だけの練習表にしてください');
  return range.getValues();
}
function syncSheetsByKeyAndOrder() {
  const lock=LockService.getScriptLock();
  if(!lock.tryLock(1000))throw new Error('別の同期が実行中です');
  try {
    if(SYNC.master===SYNC.target)throw new Error('異なるシートを指定してください');
    const ss=SpreadsheetApp.openById(SYNC.spreadsheetId),m=ss.getSheetByName(SYNC.master),t=ss.getSheetByName(SYNC.target);
    if(!m||!t)throw new Error('シート名を確認してください');
    const width=Math.max(4,t.getLastColumn());
    if(width>26)throw new Error('シート1はZ列までにしてください');
    const master=syncRead_(m,3),target=syncRead_(t,width);
    if(master.length<2)throw new Error('シート2が空のため停止します。全消去はしません');
    if(JSON.stringify(master[0])!==JSON.stringify(target[0].slice(0,3)))throw new Error('A:Cの見出しをそろえてください');
    const plan=syncPlan_(master.slice(1),target.slice(1),width);
    console.log(JSON.stringify({追加:plan.added,維持:plan.matched,除外:plan.removed,反映:SYNC.apply}));
    if(!SYNC.apply)return;
    const backup=t.copyTo(ss).setName('同期前_'+Utilities.getUuid().replace(/-/g,''));
    console.log('バックアップ：'+backup.getName());
    if(syncSnapshot_(syncRead_(m,3))!==syncSnapshot_(master) || t.getLastColumn()>width || syncSnapshot_(syncRead_(t,width))!==syncSnapshot_(target))throw new Error('読み取り後に内容が変わりました。同期は中止しました');
    const safe=v=>typeof v==='string' && /^[\s]*[=+@-]/.test(v)?"'"+v:v;
    const values=plan.values.map(r=>r.map(safe));
    if(t.getMaxRows()<values.length+1)t.insertRowsAfter(t.getMaxRows(),values.length+1-t.getMaxRows());
    t.getRange(2,1,values.length,width).setValues(values);
    if(target.length-1>values.length)t.getRange(values.length+2,1,target.length-1-values.length,width).clearContent();
  } finally {
    try {SpreadsheetApp.flush();}
    finally {lock.releaseLock();}
  }
  console.log('同期処理終了。キーと備考を照合してください');
}
