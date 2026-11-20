    var atnPath = "C:\\Users\\min\\Desktop\\"
    var atn = "test"
    var filePath = atnPath + atn + ".atn"
    $.writeln(filePath);
    main(); //アクションのインポート
    runAtn(); //アクションの実行

    function runAtn() {
        var idPly = charIDToTypeID("Ply ");
        var desc12 = new ActionDescriptor();
        var idnull = charIDToTypeID("null");
        var ref3 = new ActionReference();
        var idActn = charIDToTypeID("Actn");
        ref3.putName(idActn, "glay");
        var idASet = charIDToTypeID("ASet");
        ref3.putName(idASet, atn);
        desc12.putReference(idnull, ref3);
        executeAction(idPly, desc12, DialogModes.NO);
    }

    function main() {
        var atnFile = new File(filePath);
        var rex = new RegExp(decodeURI(atnFile.name.replace(/\.[^\.]+$/, '')), "g");
        if (!atnFile.exists) {
            alert("ActionSetが存在しません");
            return;
        }
        var actionList = getActionSets();
        for (var d in actionList) {
            if (decodeURI(actionList[d]).match(rex)) unLoadAction(actionList[d]);
        }
        app.load(atnFile);
        var actionList = getActionSets();
        var flag = false;
        for (var d in actionList) {
            if (decodeURI(actionList[d]).match(rex)) flag = true;
        }
        if (!flag) {
            alert("アクションセットがロードされませんでした");
            return;
        }
    }

    function getActionSets() {
        cTID = function(s) {
            return app.charIDToTypeID(s);
        };
        var i = 1;
        var sets = [];
        while (true) {
            var ref = new ActionReference();
            ref.putIndex(cTID("ASet"), i);
            var desc;
            var lvl = $.level;
            $.level = 0;
            try {
                desc = executeActionGet(ref);
            } catch (e) {
                break;
            } finally {
                $.level = lvl;
            }
            if (desc.hasKey(cTID("Nm  "))) {
                var set = {};
                set.index = i;
                set.name = desc.getString(cTID("Nm  "));
                set.toString = function() {
                    return this.name;
                };
                set.count = desc.getInteger(cTID("NmbC"));
                set.actions = [];
                for (var j = 1; j <= set.count; j++) {
                    var ref = new ActionReference();
                    ref.putIndex(cTID('Actn'), j);
                    ref.putIndex(cTID('ASet'), set.index);
                    var adesc = executeActionGet(ref);
                    var actName = adesc.getString(cTID('Nm  '));
                    set.actions.push(actName);
                }
                sets.push(set);
            }
            i++;
        }
        return sets;
    };

    function unLoadAction(aSet) {
        var desc = new ActionDescriptor();
        var ref = new ActionReference();
        ref.putName(charIDToTypeID("ASet"), decodeURI(aSet));
        desc.putReference(charIDToTypeID("null"), ref);
        executeAction(charIDToTypeID("Dlt "), desc, DialogModes.NO);
    };
