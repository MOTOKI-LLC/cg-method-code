// スタイルCSV書き出し - 開いているファイルのローカルスタイルをCSVにまとめて保存
// ---------------------------------------------------------
// ヘッダーを日本語化
// ---------------------------------------------------------

figma.showUI(__html__, { width: 360, height: 120 });

// --- CSVエスケープ ---
function csvEscape(v) {
  if (v === null || v === undefined) return "";
  const s = String(v);
  if (/[",\n]/.test(s)) {
    return '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
}

// --- 色変換ユーティリティ ---
function to255(n) {
  return Math.max(0, Math.min(255, Math.round(n * 255)));
}
function hex2(n) {
  return n.toString(16).padStart(2, "0").toUpperCase();
}
function rgbToHex(r, g, b) {
  return "#" + hex2(to255(r)) + hex2(to255(g)) + hex2(to255(b));
}
function rgbaToCss(r, g, b, a) {
  return (
    "rgba(" +
    to255(r) +
    ", " +
    to255(g) +
    ", " +
    to255(b) +
    ", " +
    a.toFixed(3) +
    ")"
  );
}

// --- Paint配列を文字列化 ---
function serializePaints(paints) {
  return paints
    .map(function (p) {
      switch (p.type) {
        case "SOLID": {
          var opacity =
            p.opacity !== undefined && p.opacity !== null ? p.opacity : 1;
          var hex = rgbToHex(p.color.r, p.color.g, p.color.b);
          var rgba = rgbaToCss(p.color.r, p.color.g, p.color.b, opacity);
          return "単色(" + hex + " | " + rgba + ")";
        }
        case "GRADIENT_LINEAR":
        case "GRADIENT_RADIAL":
        case "GRADIENT_ANGULAR":
        case "GRADIENT_DIAMOND": {
          var kind = p.type.replace("GRADIENT_", "グラデーション_");
          var stops = p.gradientStops
            .map(function (s) {
              var hex = rgbToHex(s.color.r, s.color.g, s.color.b);
              var a =
                s.color.a !== undefined && s.color.a !== null ? s.color.a : 1;
              var pct = Math.round((s.position || 0) * 100);
              return pct + "% " + hex + " (a:" + a.toFixed(3) + ")";
            })
            .join(" - ");
          return kind + "(" + stops + ")";
        }
        case "IMAGE":
          return "画像塗り(scale:" + p.scaleMode + ")";
        default:
          return p.type || "UNKNOWN";
      }
    })
    .join(" / ");
}

// --- TextStyle補助 ---
function serializeLineHeight(v) {
  if (!v || v === "AUTO") return "自動";
  if (v.unit === "PIXELS") return v.value + "px";
  if (v.unit === "PERCENT") return v.value + "%";
  return "自動";
}
function serializeLetterSpacing(v) {
  if (!v || v === "AUTO") return "自動";
  if (v.unit === "PIXELS") return v.value + "px";
  if (v.unit === "PERCENT") return v.value + "%";
  return "自動";
}
function serializeTextCase(v) {
  return v || "";
}
function serializeTextDecoration(v) {
  return v || "";
}

// --- Effect配列を文字列化 ---
function serializeEffects(effects) {
  return effects
    .map(function (e) {
      switch (e.type) {
        case "DROP_SHADOW":
        case "INNER_SHADOW": {
          var c = e.color;
          var hex = rgbToHex(c.r, c.g, c.b);
          var spread = "spread" in e && e.spread != null ? e.spread : 0;
          return (
            e.type +
            "(x:" +
            e.offset.x +
            ", y:" +
            e.offset.y +
            ", blur:" +
            e.radius +
            ", spread:" +
            spread +
            ", color:" +
            hex +
            ", a:" +
            c.a.toFixed(3) +
            ")"
          );
        }
        case "LAYER_BLUR":
        case "BACKGROUND_BLUR":
          return e.type + "(半径:" + e.radius + ")";
        default:
          return e.type || "UNKNOWN";
      }
    })
    .join(" / ");
}

// --- LayoutGrid配列を文字列化 ---
function serializeLayoutGrids(grids) {
  return grids
    .map(function (g) {
      if (g.pattern === "GRID") {
        return (
          "グリッド(サイズ:" +
          g.sectionSize +
          ", 色:" +
          rgbToHex(g.color.r, g.color.g, g.color.b) +
          ", a:" +
          g.color.a.toFixed(3) +
          ")"
        );
      }
      var base = g.pattern + "/" + g.alignment;
      return (
        base +
        "(カウント:" +
        (g.count != null ? g.count : "自動") +
        ", サイズ:" +
        g.sectionSize +
        ", ガター:" +
        g.gutterSize +
        ", オフセット:" +
        g.offset +
        ")"
      );
    })
    .join(" / ");
}

// --- スタイル抽出 ---
function rowsFromColorStyles() {
  return figma.getLocalPaintStyles().map(function (s) {
    return {
      styleType: "カラー",
      styleId: s.id,
      name: s.name,
      description: s.description || "",
      key: s.key || "",
      paints: serializePaints(s.paints),
    };
  });
}
function rowsFromTextStyles() {
  return figma.getLocalTextStyles().map(function (s) {
    var f = s.fontName;
    var hasFont = f !== figma.mixed;
    return {
      styleType: "テキスト",
      styleId: s.id,
      name: s.name,
      description: s.description || "",
      key: s.key || "",
      fontFamily: hasFont ? f.family : "",
      fontStyle: hasFont ? f.style : "",
      fontPostScriptName: s.fontPostScriptName || "",
      fontSize: s.fontSize !== figma.mixed ? String(s.fontSize) : "",
      lineHeight: serializeLineHeight(s.lineHeight),
      letterSpacing: serializeLetterSpacing(s.letterSpacing),
      paragraphSpacing:
        s.paragraphSpacing !== figma.mixed ? String(s.paragraphSpacing) : "",
      paragraphIndent:
        s.paragraphIndent !== figma.mixed ? String(s.paragraphIndent) : "",
      textCase: s.textCase !== figma.mixed ? serializeTextCase(s.textCase) : "",
      textDecoration:
        s.textDecoration !== figma.mixed
          ? serializeTextDecoration(s.textDecoration)
          : "",
    };
  });
}
function rowsFromEffectStyles() {
  return figma.getLocalEffectStyles().map(function (s) {
    return {
      styleType: "エフェクト",
      styleId: s.id,
      name: s.name,
      description: s.description || "",
      key: s.key || "",
      effects: serializeEffects(s.effects),
    };
  });
}
function rowsFromGridStyles() {
  return figma.getLocalGridStyles().map(function (s) {
    return {
      styleType: "レイアウトグリッド",
      styleId: s.id,
      name: s.name,
      description: s.description || "",
      key: s.key || "",
      layoutGrids: serializeLayoutGrids(s.layoutGrids),
    };
  });
}

// --- CSV組み立て（日本語ヘッダー） ---
function toCSV(rows) {
  var header = [
    "スタイル種別",
    "スタイルID",
    "名前",
    "説明",
    "キー",
    "塗り",
    "フォントファミリー",
    "フォントスタイル",
    "PostScript名",
    "文字サイズ",
    "行の高さ",
    "字間",
    "段落間隔",
    "段落インデント",
    "テキスト変換",
    "装飾",
    "エフェクト",
    "レイアウトグリッド",
  ];
  var lines = [];
  lines.push(header.map(csvEscape).join(","));
  rows.forEach(function (r) {
    var values = [
      r.styleType,
      r.styleId,
      r.name,
      r.description,
      r.key,
      r.paints || "",
      r.fontFamily || "",
      r.fontStyle || "",
      r.fontPostScriptName || "",
      r.fontSize || "",
      r.lineHeight || "",
      r.letterSpacing || "",
      r.paragraphSpacing || "",
      r.paragraphIndent || "",
      r.textCase || "",
      r.textDecoration || "",
      r.effects || "",
      r.layoutGrids || "",
    ];
    lines.push(values.map(csvEscape).join(","));
  });
  return lines.join("\n");
}

// 実行
(function run() {
  var rows = []
    .concat(rowsFromColorStyles())
    .concat(rowsFromTextStyles())
    .concat(rowsFromEffectStyles())
    .concat(rowsFromGridStyles());

  var csv = toCSV(rows);
  var fileName = "styles_" + Date.now() + ".csv";

  figma.ui.postMessage({ type: "save-csv", filename: fileName, content: csv });
})();

figma.ui.onmessage = function (msg) {
  if (msg && msg.type === "done") {
    figma.closePlugin("CSVを書き出しました。");
  }
};
