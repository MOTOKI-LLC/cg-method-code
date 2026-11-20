// コピーした少数のAIで試してください。
(function () {
  var PRESET = ""; // 空のまま実行して一覧を確認し、正確な名前を入力
  var OUTPUT_SUFFIX = ".pdf";
  var LOG_PREFIX = "pdf_batch_";
  var RUN_NOTE = "PDF preset=" + PRESET;

  function clean(value) {
    return String(value).replace(/[\t\r\n]+/g, " ");
  }
  function logRow(log, status, input, output, note) {
    log.encoding = "UTF-8";
    if (!log.open("a")) throw new Error("ログを開けません: " + log.error);
    var written = false;
    var closed = false;
    try {
      written = log.writeln([new Date().toString(), status, clean(input),
        clean(output), clean(note)].join("\t"));
    } finally {
      closed = log.close();
    }
    if (!written || !closed) throw new Error("ログを保存できません: " + log.error);
  }
  function makeLog(dst) {
    var stamp = new Date().getTime();
    var number = 0;
    var log;
    do {
      log = new File(dst.fsName + "/" + LOG_PREFIX + stamp + "_" + number + ".tsv");
      number++;
    } while (log.exists);
    log.encoding = "UTF-8";
    if (!log.open("w")) throw new Error("ログを作成できません: " + log.error);
    var written = false;
    var closed = false;
    try {
      written = log.writeln("time\tstatus\tinput\toutput\tnote");
    } finally {
      closed = log.close();
    }
    if (!written || !closed) throw new Error("ログを保存できません: " + log.error);
    return log;
  }

  function processDocument(doc) {
    return "preset=" + PRESET;
  }
  function saveDocument(doc, output) {
    var options = new PDFSaveOptions();
    options.pDFPreset = PRESET;
    options.viewAfterSaving = false;
    doc.saveAs(output, options);
  }

  function main() {
    var presets = app.PDFPresetsList;
    if (PRESET === "") {
      alert("PDFプリセット名をPRESETへ入力してください。\n" + presets.join("\n"));
      return;
    }
    var valid = false;
    for (var presetIndex = 0; presetIndex < presets.length; presetIndex++) {
      if (presets[presetIndex] === PRESET) valid = true;
    }
    if (!valid) { alert("指定したPDFプリセットが見つかりません。"); return; }
    if (app.documents.length !== 0) {
      alert("開いているドキュメントを保存して閉じてから実行してください。");
      return;
    }
    var src = Folder.selectDialog("コピーした入力AIのフォルダーを選択");
    if (!src) return;
    var dst = Folder.selectDialog("入力とは別の出力フォルダーを選択");
    if (!dst) return;
    if (src.fsName.toLowerCase() === dst.fsName.toLowerCase()) {
      alert("入力と出力は別のフォルダーにしてください。");
      return;
    }
    var files = src.getFiles(function (entry) {
      return entry instanceof File && /\.ai$/i.test(entry.name);
    });
    if (files.length === 0) {
      alert("入力フォルダー直下にAIファイルがありません。");
      return;
    }
    var log = makeLog(dst);
    logRow(log, "START", src.fsName, dst.fsName, RUN_NOTE);
    var done = 0;
    var failed = 0;
    var skipped = 0;
    var processed = 0;
    var halted = false;
    for (var fileIndex = 0; fileIndex < files.length; fileIndex++) {
      var input = files[fileIndex];
      var name = File.decode(input.name).replace(/\.ai$/i, "") + OUTPUT_SUFFIX;
      var output = new File(dst.fsName + "/" + name);
      var doc = null;
      var status = "OK";
      var note = "";
      if (output.exists) {
        status = "SKIP";
        note = "同名の出力があるため処理しません";
      } else {
        try {
          doc = app.open(input);
          note = processDocument(doc);
          // 開いている間に出力が作られた場合も保存を避ける。
          output = new File(output.fsName);
          if (output.exists) {
            status = "SKIP";
            note = "保存直前に同名の出力を検出";
          } else {
            saveDocument(doc, output);
            if (!new File(output.fsName).exists) {
              throw new Error("保存後に出力ファイルを確認できません");
            }
          }
        } catch (error) {
          status = "ERROR";
          note = String(error);
        } finally {
          if (doc !== null) {
            try {
              doc.close(SaveOptions.DONOTSAVECHANGES);
            } catch (closeError) {
              status = "ERROR";
              note += " / 終了失敗: " + closeError;
              halted = true;
            }
          }
        }
      }
      processed++;
      if (status === "OK") done++;
      else if (status === "SKIP") skipped++;
      else failed++;
      logRow(log, status, input.fsName, output.fsName, note);
      // 開く処理の途中でドキュメントが残った場合も継続しない。
      if (app.documents.length !== 0) halted = true;
      if (halted) break;
    }
    var remaining = files.length - processed;
    var summary = "保存 " + done + " / 失敗 " + failed + " / スキップ " + skipped +
      " / 未処理 " + remaining;
    logRow(log, halted ? "HALTED" : "END", "", "", summary);
    alert(summary + "\nログ: " + log.fsName +
      "\nERRORの出力は不完全な可能性があります。開いて確認してください。");
  }
  try {
    main();
  } catch (fatalError) {
    alert("処理を停止しました: " + fatalError +
      "\n出力とログ、開いているドキュメントを確認してください。");
  }
}());
