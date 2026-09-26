// ローカルスタイルIDをキャッシュ（Paint / Effect / Text / Grid）
const localStyleIds = new Set(
  [
    ...figma.getLocalPaintStyles(),
    ...figma.getLocalEffectStyles(),
    ...figma.getLocalTextStyles(),
    ...figma.getLocalGridStyles(),
  ].map((s) => s.id)
);

function isExternalStyle(style) {
  return !!style && style.remote === true && !localStyleIds.has(style.id);
}

function checkExternalStyleUsage(node) {
  const result = [];

  function add(styleId, type) {
    if (!styleId || typeof styleId !== "string") return; // figma.mixed は弾く
    const style = figma.getStyleById(styleId);
    if (isExternalStyle(style)) {
      result.push({
        name: node.name,
        id: "'" + node.id, // Excel誤変換防止
        type,
        styleName: style.name,
        styleId: style.id,
        libraryName: (style && style.libraryName) || "不明",
      });
    }
  }

  try {
    add(node.fillStyleId, "Fill Style");
  } catch (e) {}
  try {
    add(node.strokeStyleId, "Stroke Style");
  } catch (e) {}
  try {
    add(node.effectStyleId, "Effect Style");
  } catch (e) {}
  if ("textStyleId" in node) {
    try {
      add(node.textStyleId, "Text Style");
    } catch (e) {}
  }

  return result;
}

function walk(node, acc) {
  // SceneNodeのみチェック
  if (node && node.type && typeof node.type === "string") {
    try {
      acc.push(...checkExternalStyleUsage(node));
    } catch (e) {}
  }
  if ("children" in node && Array.isArray(node.children)) {
    for (const child of node.children) {
      walk(child, acc);
    }
  }
}

function getTimestamp() {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const hh = String(now.getHours()).padStart(2, "0");
  const min = String(now.getMinutes()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}_${hh}${min}`;
}

function toCSV(rows) {
  const headers = [
    "Layer Name",
    "Layer ID",
    "Style Type",
    "Style Name",
    "Style ID",
    "Library Name",
  ];
  const records = rows.map((r) => [
    r.name,
    r.id,
    r.type,
    r.styleName,
    r.styleId,
    r.libraryName,
  ]);
  return [headers, ...records]
    .map((row) =>
      row.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")
    )
    .join("\n");
}

// ---- UIを表示（小さめのモーダル） ----
figma.showUI(__html__, { width: 320, height: 160 });

figma.ui.onmessage = (msg) => {
  if (!msg || typeof msg !== "object") return;

  if (msg.type === "export") {
    const allResults = [];

    // ファイル全体：全ページを起点に再帰走査
    for (const page of figma.root.children) {
      if (page.type === "PAGE") {
        walk(page, allResults);
      }
    }

    if (allResults.length === 0) {
      figma.notify(
        "外部スタイルを参照しているレイヤーは見つかりませんでした。"
      );
      figma.ui.postMessage({ type: "error", message: "外部スタイルなし。" });
      return;
    }

    const csv = toCSV(allResults);
    const filename = `external_styles_${getTimestamp()}.csv`;
    figma.ui.postMessage({ type: "download", csv, filename });
  }

  if (msg.type === "close") {
    figma.closePlugin();
  }
};
