/* Windows PNG/JPEG stills only. No duplication or disk writes. Tested in AE 26.5 on Windows. */
(function () {
    var project = app.project;
    if (!project) { alert("プロジェクトを開いてください。"); return; }
    var selected = project.selection.slice(0), byName = {}, jobs = [], lines, input;
    if (!selected.length || selected.length > 20) {
        alert("プロジェクトパネルでPNG/JPEGの静止画を1〜20個選択してください。"); return;
    }
    function fail(message) { throw new Error(message); }
    function raster(name) { return /\.(png|jpe?g)$/i.test(name); }
    try {
        for (var i = 0; i < selected.length; i++) {
            var item = selected[i], key = "name_" + item.name;
            if (!(item instanceof FootageItem) || !item.file || !item.file.exists ||
                !raster(item.file.name) || !item.mainSource.isStill) {
                fail("選択対象はリンクが有効なPNG/JPEGの単一静止画に限定します。");
            }
            if (byName[key]) fail("選択した素材の名前が重複しています：" + item.name);
            byName[key] = item;
        }
        input = File.openDialog("UTF-8のTSVを選択：素材名[TAB]変更先の絶対パス");
        if (!input) return;
        input.encoding = "UTF-8";
        if (!input.open("r")) fail("TSVを開けません。");
        var text;
        try { text = input.read(); } finally { input.close(); }
        lines = text.replace(/^\uFEFF/, "").split(/\r\n|\r|\n/);
        var seen = {};
        for (var n = 0; n < lines.length; n++) {
            if (!lines[n].length) continue;
            var fields = lines[n].split("\t");
            if (fields.length !== 2 || !fields[0] || !fields[1]) fail("行" + (n + 1) + "は2列のTAB区切りにしてください。");
            var nameKey = "name_" + fields[0], target = byName[nameKey];
            if (!target || seen[nameKey]) fail("未選択の素材名、または重複行です：" + fields[0]);
            var normalizedPath = fields[1].split("\\").join("/");
            if (!/^[A-Za-z]:\//.test(normalizedPath) && normalizedPath.indexOf("//") !== 0) fail("Windowsの絶対パスを指定してください。");
            var file = new File(fields[1]);
            if (!file.exists || !raster(file.name)) fail("変更先は存在するPNG/JPEGにしてください。");
            if (file.fullName === target.file.fullName) fail("変更前後のパスが同じです。");
            seen[nameKey] = true;
            jobs.push({item:target,file:file,before:target.file.fullName});
        }
        if (jobs.length !== selected.length) fail("選択素材1つにつき、TSVをちょうど1行用意してください。");
    } catch (error) { alert("変更せずに中止しました。\n" + error.toString()); return; }
    var report = "次の素材アイテムを使う全コンポで参照元が変わります。複製・ファイル書き込みは行いません。\n";
    for (var k = 0; k < jobs.length; k++) report += "\n" + jobs[k].item.name + "\n" + jobs[k].before + "\n→ " + jobs[k].file.fullName + "\n";
    if (!confirm(report + "\n続けますか？")) return;
    // Recheck after the confirmation dialog, before the first replacement.
    for (var c = 0; c < jobs.length; c++) {
        if (!jobs[c].item.file || jobs[c].item.file.fullName !== jobs[c].before ||
            !jobs[c].item.file.exists || !jobs[c].file.exists) {
            alert("確認中に参照元またはファイルの状態が変わったため、変更せずに中止しました。"); return;
        }
    }
    var changed = 0;
    app.beginUndoGroup("選択静止画の参照元をTSVで置換");
    try {
        for (var j = 0; j < jobs.length; j++) { jobs[j].item.replace(jobs[j].file); changed++; }
        alert(changed + "素材を置き換えました。各コンポの見た目とフッテージの変換設定を確認してください。");
    } catch (error) {
        alert("途中で止まりました。" + changed + "素材の置換が完了しています。編集メニューで取り消して確認してください。\n" + error.toString());
    } finally { app.endUndoGroup(); }
}());
