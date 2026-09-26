function main() {
  try {
    doWork();
  } catch (e) {
    console.error(e.message);   // 何が起きたか
    console.error(e.stack);     // どの行か
    throw e;                    // 握りつぶさない。トリガーの失敗として残す
  }
}
