(function () {
  var group = null;
  try {
    if (app.documents.length === 0) throw new Error("ドキュメントを開いてください。");
    var doc = app.activeDocument;
    var sel = doc.selection;
    if (!sel || !(sel instanceof Array) || sel.length !== 1)
      throw new Error("基準にする長方形を1つ選んでください。");
    var bounds = sel[0].geometricBounds;
    if (!bounds || bounds.length !== 4) throw new Error("範囲を取得できない選択です。");
    var layer = doc.activeLayer;
    var node = layer;
    while (node && node.typename === "Layer") {
      if (node.locked || !node.visible) throw new Error("作成先レイヤーが編集できません。");
      node = node.parent;
    }
    var raw = prompt("基準の辺から線の開始位置までの間隔（mm）", "3");
    if (raw === null) return;
    raw = raw.replace(/^\s+|\s+$/g, "");
    if (!/^(\d+)(\.\d+)?$/.test(raw)) throw new Error("0以上の数値だけを入力してください。");
    var mm = Number(raw);
    if (!isFinite(mm) || mm > 100) throw new Error("間隔は0〜100mmで指定してください。");
    var gap = mm * 72 / 25.4, length = 5 * 72 / 25.4;
    var left=bounds[0], top=bounds[1], right=bounds[2], bottom=bounds[3];
    if (!(right>left && top>bottom)) throw new Error("基準の幅・高さが0です。");
    group=layer.groupItems.add();group.name="Crop marks demo";
    var black=new CMYKColor();black.cyan=0;black.magenta=0;black.yellow=0;black.black=100;
    line(left-gap-length,top,left-gap,top);line(left-gap-length,bottom,left-gap,bottom);
    line(right+gap,top,right+gap+length,top);line(right+gap,bottom,right+gap+length,bottom);
    line(left,top+gap,left,top+gap+length);line(right,top+gap,right,top+gap+length);
    line(left,bottom-gap-length,left,bottom-gap);line(right,bottom-gap-length,right,bottom-gap);
    alert("四隅の線8本を作成しました。寸法・線色・PDFでの範囲を確認してください。");
    function line(x1,y1,x2,y2){
      var item=group.pathItems.add();item.setEntirePath([[x1,y1],[x2,y2]]);
      item.filled=false;item.stroked=true;item.strokeWidth=0.3;item.strokeColor=black;
      item.strokeOverprint=false;
    }
  }catch(e){
    if(group!==null){try{group.remove();}catch(cleanup){alert("生成途中のグループが残りました。手動で確認してください。");}}
    alert(String(e));
  }
}());
