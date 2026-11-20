function isInstance(n){ return n && n.type === "INSTANCE"; }
function isComponent(n){ return n && n.type === "COMPONENT"; }
function isComponentSet(n){ return n && n.type === "COMPONENT_SET"; }

function nearestInstance(node){
  var cur = node;
  while (cur) {
    if (isInstance(cur)) return cur;
    cur = cur.parent;
  }
  return null;
}

async function getComponentFromNode(node){
  if (!node) return null;
  if (isInstance(node)) return await node.getMainComponentAsync();
  if (isComponent(node)) return node;
  if (isComponentSet(node)) {
    if (node.defaultVariant) return node.defaultVariant;
    var i; for (i=0; i<node.children.length; i++) {
      var c = node.children[i];
      if (c && c.type === "COMPONENT") return c;
    }
  }
  return null;
}

async function resolveComponent(componentNodeId, componentKey){
  if (componentNodeId && componentNodeId !== "") {
    try {
      var local = await figma.getNodeByIdAsync(componentNodeId);
      if (local && local.type === "COMPONENT") return local;
    } catch (_) { /* キーからの解決を続ける */ }
  }
  if (componentKey && componentKey !== "") {
    try {
      var imported = await figma.importComponentByKeyAsync(componentKey);
      if (imported) return imported;
    } catch (e) {}
  }
  return null;
}

figma.showUI(__html__, { width: 280, height: 220 });

var stored = {
  targets: [], // {id, name}
  sourceId: "",
  sourceKey: "",
  sourceName: ""
};

function postState(){
  figma.ui.postMessage({
    type: "state",
    payload: {
      targets: stored.targets,
      sourceName: stored.sourceName,
      hasTarget: stored.targets.length > 0,
      hasSource: (stored.sourceId !== "" || stored.sourceKey !== "")
    }
  });
}

let busy = false;
figma.ui.onmessage = async function(msg){
  if (!msg || busy) return;
  busy = true;
  try {
  if (msg.type === "capture-source") {
    var sel = figma.currentPage.selection;
    if (!sel || sel.length === 0) { figma.notify("source を選択してください"); return; }
    var comp = await getComponentFromNode(sel[0]);
    if (!comp) { figma.notify("メインコンポーネントを取得できません"); return; }
    stored.sourceId = comp.id || "";
    stored.sourceKey = comp.key || "";
    stored.sourceName = comp.name || "(no name)";
    postState();
    return;
  }

  if (msg.type === "capture-target") {

    var sel = figma.currentPage.selection;
    if (!sel.length) { figma.notify("target を選択してください"); return; }
    for (const node of sel) {
      const inst = nearestInstance(node);
      if (inst && !stored.targets.some(t => t.id === inst.id))
        stored.targets.push({ id: inst.id, name: inst.name });
    }
    postState();
    return;
  }

  if (msg.type === "clear-targets") {
    stored.targets = [];
    postState();
    return;
  }

  if (msg.type === "swap-now") {
    if (stored.targets.length === 0) { figma.notify("target 未登録"); return; }
    if (!stored.sourceId && !stored.sourceKey) { figma.notify("source 未登録"); return; }
    var dest = await resolveComponent(stored.sourceId, stored.sourceKey);
    if (!dest) { figma.notify("source を解決できません"); return; }

    var ok = 0, fail = 0;
    for (var i=0; i<stored.targets.length; i++){
      try {
        var t = await figma.getNodeByIdAsync(stored.targets[i].id);
        if (!t || t.type !== "INSTANCE") { fail++; continue; }
        t.swapComponent(dest);
        ok++;
      } catch(e){ fail++; }
    }
    figma.notify("差し替え完了: 成功 " + ok + " 件 / 失敗 " + fail + " 件");
    return;
  }

  if (msg.type === "close") figma.closePlugin();
  } catch (_) { figma.notify("処理に失敗しました。対象を登録し直してください", {error:true}); }
  finally { busy = false; }
};

postState();
