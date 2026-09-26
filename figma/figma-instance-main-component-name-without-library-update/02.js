figma.showUI(__html__, { width: 480, height: 560 });

figma.ui.onmessage = async (msg) => {
  // 選択中のインスタンスをスキャン
  if (msg.type === "scan") {
    const selection = figma.currentPage.selection;

    // 選択がなければページ全体を対象にする
    const targets =
      selection.length > 0
        ? selection.flatMap((node) =>
          node.type === "INSTANCE"
            ? [node]
            : "findAll" in node
              ? node.findAll((n) => n.type === "INSTANCE")
              : []
        )
        : figma.currentPage.findAll((node) => node.type === "INSTANCE");

    const results = [];

    for (const instance of targets) {
      if (instance.type !== "INSTANCE") continue;

      const mainComponent = await instance.getMainComponentAsync();
      if (!mainComponent) continue;

      const componentKey = mainComponent.key;
      const instanceName = instance.name;

      // importComponentByKeyAsync でライブラリから公開済みコンポーネント情報を取得
      let latestMainName;
      try {
        const imported = await figma.importComponentByKeyAsync(componentKey);
        latestMainName = imported.name;
      } catch (e) {
        // ローカルコンポーネント等で import できない場合は mainComponent.name にフォールバック
        latestMainName = mainComponent.name;
      }

      if (latestMainName !== instanceName) {
        results.push({
          instanceId: instance.id,
          instanceName,
          mainName: latestMainName,
          componentKey,
        });
      }
    }

    figma.ui.postMessage({ type: "scan-result", results });
  }

  // 個別リネーム
  if (msg.type === "rename") {
    const node = await figma.getNodeByIdAsync(msg.instanceId);
    if (node && node.type === "INSTANCE") {
      node.name = msg.newName;
    }
  }

  // 一括リネーム：すべてメインコンポーネント名に合わせる
  if (msg.type === "rename-all") {
    for (const item of msg.items) {
      const node = await figma.getNodeByIdAsync(item.instanceId);
      if (node && node.type === "INSTANCE") {
        node.name = item.newName;
      }
    }
    figma.notify(`${msg.items.length} 件のインスタンス名を更新しました`);
    figma.ui.postMessage({ type: "rename-all-done" });
  }

  // リスト内のインスタンスをクリックでフォーカス
  if (msg.type === "focus") {
    const node = await figma.getNodeByIdAsync(msg.instanceId);
    if (node) {
      figma.currentPage.selection = [node];
      figma.viewport.scrollAndZoomIntoView([node]);
    }
  }
};
