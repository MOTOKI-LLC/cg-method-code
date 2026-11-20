figma.showUI(__html__, { width: 400, height: 200 });
let running = false, cancelled = false;
figma.ui.onmessage = async msg => {
  if (!msg) return;
  if (msg.type === "cancel") { cancelled = true; return; }
  if (msg.type !== "start-task" || running) return;
  running = true; cancelled = false;
  try {
    const total = 100;
    for (let completed = 0; completed < total; completed++) {
      if (cancelled) break;
      await new Promise(resolve => setTimeout(resolve, 50)); // 説明用のダミー処理
      figma.ui.postMessage({ type: "progress", completed: completed+1, total });
    }
    figma.ui.postMessage({ type: "done", cancelled });
  } catch (_) { figma.ui.postMessage({ type: "error", message: "処理に失敗しました。" }); }
  finally { running = false; }
};
