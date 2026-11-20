(function () {
  var FORMAT = "PNG"; // PNG / JPEG / SVG
  var SCALE = 100; // JPEGとPNGの倍率（%）
  try {
    if (app.documents.length === 0) throw new Error("ドキュメントを開いてください。");
    var doc = app.activeDocument;
    var folder = Folder.selectDialog("出力先を選択。デスクトップへ出す場合はデスクトップを選択");
    if (!folder) return;
    var base = File.decode(doc.name).replace(/\.(ai|ait)$/i, "");
    base = base.replace(/[\\\/:*?"<>|]/g, "_").replace(/[. ]+$/g, "");
    if (!base) base = "illustrator-export";
    var ext, type, opts;
    if (FORMAT === "PNG") {
      ext = ".png"; type = ExportType.PNG24; opts = new ExportOptionsPNG24();
      opts.artBoardClipping = true; opts.transparency = true; opts.antiAliasing = true;
      opts.horizontalScale = SCALE; opts.verticalScale = SCALE;
    } else if (FORMAT === "JPEG") {
      ext = ".jpg"; type = ExportType.JPEG; opts = new ExportOptionsJPEG();
      opts.artBoardClipping = true; opts.antiAliasing = true; opts.qualitySetting = 90;
      opts.horizontalScale = SCALE; opts.verticalScale = SCALE;
      opts.matte = true; var white = new RGBColor(); white.red=255; white.green=255; white.blue=255;
      opts.matteColor = white;
    } else if (FORMAT === "SVG") {
      ext = ".svg"; type = ExportType.SVG; opts = new ExportOptionsSVG();
      opts.compressed = false; opts.embedRasterImages = true;
      opts.fontType = SVGFontType.OUTLINEFONT; opts.preserveEditability = false;
    } else throw new Error("FORMATをPNG・JPEG・SVGから指定してください。");
    var output = new File(folder.fsName + "/" + base + ext);
    if (output.exists) throw new Error("同名ファイルがあるため上書きしません: " + output.fsName);
    doc.exportFile(new File(folder.fsName + "/" + base), type, opts);
    if (!new File(output.fsName).exists) throw new Error("想定した出力が見つかりません。フォルダーを確認してください。");
    alert("書き出し処理が戻りました。出力を開いて範囲・サイズ・見た目を確認してください。\n"+output.fsName);
  } catch(e) { alert(String(e)); }
}());
