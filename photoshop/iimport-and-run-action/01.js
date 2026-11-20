#target photoshop
(function () {
    function trimmed(value) { return String(value).replace(/^\s+|\s+$/g, ""); }
    function readSets() {
        var result = [];
        for (var i = 1; i <= 500; i++) {
            var ref = new ActionReference();
            ref.putIndex(charIDToTypeID("ASet"), i);
            var desc;
            try { desc = executeActionGet(ref); }
            catch (endOfList) { return result; }
            var name = desc.getString(charIDToTypeID("Nm  "));
            var count = desc.getInteger(charIDToTypeID("NmbC"));
            var actions = [];
            for (var j = 1; j <= count; j++) {
                var actionRef = new ActionReference();
                actionRef.putIndex(charIDToTypeID("Actn"), j);
                actionRef.putIndex(charIDToTypeID("ASet"), i);
                actions.push(executeActionGet(actionRef).getString(charIDToTypeID("Nm  ")));
            }
            result.push({name: name, actions: actions});
        }
        throw new Error("More than 500 sets or unable to determine the end of the list.");
    }
    function matchingSets(sets, name) {
        var result = [];
        for (var i = 0; i < sets.length; i++) {
            if (sets[i].name === name) result.push(sets[i]);
        }
        return result;
    }
    try {
        if (app.documents.length !== 1) {
            alert("Open just one unsaved practice copy before running this script.");
            return;
        }
        var file = File.openDialog("Choose your own practice ATN file");
        if (!file) return;
        if (!file.exists || !/\.atn$/i.test(file.name)) {
            alert("Choose an existing .atn file.");
            return;
        }
        var setName = prompt("Exact set name stored inside the ATN (not the filename):", "CGM-ATN-Practice");
        if (setName === null) return;
        var actionName = prompt("Exact action name inside that set:", "Resize-Width200");
        if (actionName === null) return;
        setName = trimmed(setName); actionName = trimmed(actionName);
        if (!setName || !actionName) { alert("Both names are required."); return; }
        if (matchingSets(readSets(), setName).length !== 0) {
            alert("This set name is already loaded. Nothing was loaded or played. Inspect your practice sets first.");
            return;
        }
        app.load(file);
        var matches = matchingSets(readSets(), setName);
        if (matches.length !== 1) {
            alert("Expected one matching set after loading. No action was played. The loaded set may remain in the panel.");
            return;
        }
        var actionMatches = 0;
        for (var k = 0; k < matches[0].actions.length; k++) {
            if (matches[0].actions[k] === actionName) actionMatches++;
        }
        if (actionMatches !== 1) {
            alert("Expected one exact matching action. No action was played. The loaded set remains in the panel.");
            return;
        }
        app.doAction(actionName, setName);
        alert("Playback returned without an exception. Inspect the document and output before counting it as successful.");
    } catch (e) {
        alert("Stopped: " + e.message + "\nThe loaded set or a partially changed practice document may remain. Inspect before saving.");
    }
}());
