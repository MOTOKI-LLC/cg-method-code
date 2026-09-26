// UI を表示
figma.showUI(__html__, { width: 350, height: 520 });

/** 余分な空白・末尾 :00 を取り除く（FigmaのIDコピペ差異に耐性） */
function normalizeId(rawId) {
  if (!rawId) return "";
  var id = String(rawId).replace(/\s+/g, ""); // 全空白削除（全角含む）
  id = id.replace(/:00$/, ""); // 末尾 :00 を除去
  return id.trim();
}

/** 生配列 → 正規化 → 空要素除去 → 重複排除 */
function toUniqueNormalizedIds(rawIds) {
  var seen = {};
  var result = [];
  if (!Array.isArray(rawIds)) return result;
  for (var i = 0; i < rawIds.length; i++) {
    var id = normalizeId(rawIds[i]);
    if (id && !seen[id]) {
      seen[id] = true;
      result.push(id);
    }
  }
  return result;
}

/** ID -> Node 変換（存在しないIDは無視） */
function nodesFromIds(ids) {
  var nodes = [];
  for (var i = 0; i < ids.length; i++) {
    var n = figma.getNodeById(ids[i]);
    // getNodeById は DocumentNode を返す可能性があるので SceneNode のみ許可
    if (n && "type" in n && "visible" in n) {
      nodes.push(n);
    }
  }
  return nodes;
}

/** 選択とズーム */
function selectAndReveal(nodes) {
  figma.currentPage.selection = nodes;
  if (nodes.length > 0) {
    try {
      figma.viewport.scrollAndZoomIntoView(nodes);
    } catch (e) {}
  }
}

/** UI からのメッセージ受け取り */
figma.ui.onmessage = function (msg) {
  if (!msg || typeof msg !== "object" || !("type" in msg)) return;

  if (msg.type === "select-by-id") {
    var inputIds = Array.isArray(msg.ids) ? msg.ids : [];
    var ids = toUniqueNormalizedIds(inputIds);
    var nodes = nodesFromIds(ids);

    if (nodes.length > 0) {
      selectAndReveal(nodes);
      figma.notify(nodes.length + "件のレイヤーを選択しました");
    } else {
      figma.currentPage.selection = [];
      figma.notify("有効なレイヤーIDが見つかりませんでした", { error: true });
    }
  }

  if (msg.type === "get-selected-ids") {
    var selected = figma.currentPage.selection;
    var lines = [];
    for (var i = 0; i < selected.length; i++) {
      var node = selected[i];
      lines.push(node.name + "\t" + node.id); // 「名前[TAB]ID」
    }
    figma.ui.postMessage({ type: "selected-ids", ids: lines });
  }
};

/** エディタ側で選択が変わったら UI に反映 */
figma.on("selectionchange", function () {
  var sel = figma.currentPage.selection;
  var lines = [];
  for (var i = 0; i < sel.length; i++) {
    lines.push(sel[i].name + "\t" + sel[i].id);
  }
  figma.ui.postMessage({ type: "selected-ids", ids: lines });
});
