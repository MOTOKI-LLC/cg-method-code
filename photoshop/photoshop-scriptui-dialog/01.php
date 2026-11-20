#target photoshop
(function () {
    var w = new Window("dialog", "Filename preview (no files are changed)");
    if (!w) { alert("Could not create the dialog."); return; }
    w.orientation = "column";
    w.alignChildren = "fill";
    var g = w.add("group");
    g.add("statictext", undefined, "Prefix:");
    var prefix = g.add("edittext", undefined, "cgm_");
    prefix.characters = 20;
    var g2 = w.add("group");
    g2.add("statictext", undefined, "Count (1-100):");
    var count = g2.add("edittext", undefined, "3");
    count.characters = 5;
    var bar = w.add("progressbar", undefined, 0, 100);
    bar.preferredSize.width = 300;
    var output = w.add("edittext", undefined, "", {multiline: true, readonly: true});
    output.preferredSize = [300, 150];
    var status = w.add("statictext", undefined, "Preview only. No files are created.");
    var buttons = w.add("group");
    var ok = buttons.add("button", undefined, "Preview", {name: "ok"});
    var cancel = buttons.add("button", undefined, "Close / cancel", {name: "cancel"});
    w.defaultElement = ok;
    w.cancelElement = cancel;
    var running = false, cancelled = false;
    function stop() {
        if (running) cancelled = true;
        else w.close(2);
    }
    cancel.onClick = stop;
    w.onClose = function () {
        if (running) { cancelled = true; return false; }
        return true;
    };
    ok.onClick = function () {
        if (running) return;
        if (!/^[A-Za-z][A-Za-z0-9_-]{0,19}$/.test(prefix.text)) {
            alert("Prefix: use 1-20 ASCII letters, digits, underscores or hyphens; start with a letter.");
            return;
        }
        if (!/^(?:[1-9][0-9]?|100)$/.test(count.text)) {
            alert("Count: enter an integer from 1 to 100.");
            return;
        }
        var n = Number(count.text), names = [];
        running = true; cancelled = false;
        ok.enabled = prefix.enabled = count.enabled = false;
        bar.maxvalue = n; bar.value = 0; output.text = "";
        try {
            for (var i = 1; i <= n; i++) {
                if (cancelled) break;
                names.push(prefix.text + ("000" + i).slice(-3) + ".png");
                bar.value = i;
                status.text = "Preview " + i + " / " + n;
                w.update();
            }
            if (!cancelled) {
                output.text = names.join("\n");
                status.text = "Previewed " + names.length + " names. No files were changed.";
            }
        } catch (e) {
            output.text = "";
            status.text = "Preview failed: " + e.message;
        } finally {
            running = false;
            ok.enabled = prefix.enabled = count.enabled = true;
        }
        if (cancelled) w.close(2);
    };
    w.show();
}());
