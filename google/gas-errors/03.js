function fetchWithRetry(url) {
  const MAX_TRIES = 3;
  for (let i = 0; i < MAX_TRIES; i++) {
    const res = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
    if (res.getResponseCode() !== 429) return res; // 429以外はそのまま返す
    Utilities.sleep(1000 * Math.pow(2, i));       // 1秒・2秒・4秒と待つ
  }
  throw new Error('429が続いたため止めました: ' + url);
}
