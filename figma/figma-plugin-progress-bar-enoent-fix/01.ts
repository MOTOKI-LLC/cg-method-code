figma.showUI(__html__, { width: 400, height: 200 });

figma.ui.onmessage = async (msg) => {
  if (msg.type === "start-task") {
    const total = 100;

    for (let i = 1; i <= total; i++) {
      // ダミーの重い処理（50ms待機）
      await new Promise((resolve) => setTimeout(resolve, 50));

      // 進捗を送信（%計算）
      const percent = Math.floor((i / total) * 100);
      figma.ui.postMessage({ type: "progress", percent });
    }

    // 完了通知
    figma.ui.postMessage({ type: "done" });
  }
};
