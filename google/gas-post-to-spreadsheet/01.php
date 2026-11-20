// この例は、新規の練習シートだけで使います。
function fail_(code) {
  const error = new Error(code);
  error.publicCode = code;
  throw error;
}
function property_(key) {
  const value = PropertiesService.getScriptProperties().getProperty(key);
  if (!value) fail_('missing_configuration');
  return value;
}
function json_(value) {
  return ContentService.createTextOutput(JSON.stringify(value))
    .setMimeType(ContentService.MimeType.JSON);
}
function payload_(event) {
  if (!event || !event.postData || typeof event.postData.contents !== 'string') fail_('missing_body');
  if (!/^application\/json(?:\s*;|$)/i.test(event.postData.type || '')) fail_('content_type');
  const text = event.postData.contents;
  if (!text || text.length > 4096) fail_('body_size');
  let data;
  try { data = JSON.parse(text); } catch (_) { fail_('invalid_json'); }
  const keys = ['token', 'request_id', 'script', 'name', 'date'];
  if (!data || Array.isArray(data) || typeof data !== 'object' ||
      Object.keys(data).length !== keys.length || !keys.every(k => typeof data[k] === 'string')) fail_('schema');
  if (data.token !== property_('POST_TOKEN')) fail_('unauthorized');
  if (!/^[a-zA-Z0-9_-]{8,80}$/.test(data.request_id)) fail_('request_id');
  for (const key of ['script', 'name']) {
    data[key] = data[key].trim();
    if (!data[key] || data[key].length > 120 || /^[=+@-]/.test(data[key]) || /[\r\n\t]/.test(data[key])) fail_('unsafe_text');
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(data.date)) fail_('date');
  const date = new Date(data.date + 'T00:00:00Z');
  if (!Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== data.date) fail_('date');
  return {request_id: data.request_id, script: data.script, name: data.name, date: data.date};
}
function logSheet_() {
  const sheet = SpreadsheetApp.openById(property_('SPREADSHEET_ID')).getSheetByName(property_('SHEET_NAME'));
  if (!sheet) fail_('missing_sheet');
  const expected = ['request_id', 'script', 'name', 'date'];
  const headers = sheet.getRange(1, 1, 1, 4).getValues()[0];
  if (!expected.every((x, i) => headers[i] === x)) fail_('headers');
  return sheet;
}
function appendOnce_(data) {
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(5000)) fail_('busy');
  try {
    const sheet = logSheet_();
    const last = sheet.getLastRow();
    if (last > 1001) fail_('practice_limit');
    const rows = last > 1 ? sheet.getRange(2, 1, last - 1, 4).getValues() : [];
    const record = [data.request_id, data.script, data.name, data.date];
    const matches = rows.filter(row => row[0] === data.request_id);
    if (matches.length) {
      if (matches.length !== 1 || !record.every((x, i) => matches[0][i] === x)) fail_('request_id_conflict');
      return {ok: true, status: 'already_recorded', request_id: data.request_id};
    }
    if (last >= 1001) fail_('practice_limit');
    const maxRows = sheet.getMaxRows();
    if (last + 1 > maxRows) sheet.insertRowsAfter(maxRows, last + 1 - maxRows);
    sheet.getRange(last + 1, 1, 1, 4).setNumberFormat('@').setValues([record]);
    return {ok: true, status: 'recorded', request_id: data.request_id};
  } finally {
    try { SpreadsheetApp.flush(); }
    finally { lock.releaseLock(); }
  }
}
function doPost(event) {
  try { return json_(appendOnce_(payload_(event))); }
  catch (error) { return json_({ok: false, error: error.publicCode || 'service_error'}); }
}
function doGet() {
  // トークンやシートの行はGETで返しません。
  return json_({ok: true, service: 'practice-log', read_enabled: false});
}
function demoPost() {
  const data = {token: property_('POST_TOKEN'), request_id: 'practice-20261002-01',
    script: 'demo.jsx', name: 'practice-user', date: '2026-10-02'};
  const response = doPost({postData: {type: 'application/json', contents: JSON.stringify(data)}});
  console.log(response.getContent());
}
