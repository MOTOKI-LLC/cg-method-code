var ps_name = app.path.fsName + "\\Photoshop.exe";
var gn_name = app.path.fsName + "\\Presets\\Scripts\\generate.jsx";

var files = app.openDialog();

if (files) {
    var sc_name = Folder.temp.fsName + "\\" + "temp.jsx";
    var sc_file = new File(sc_name);
    sc_file.encoding = "UTF8";
    sc_file.open("w");

    sc_file.writeln("while (documents.length > 1) documents[0].close(SaveOptions.DONOTSAVECHANGES)");
    sc_file.writeln("$.evalFile(" + gn_name.toSource() + ")");

    sc_file.close();

    var bat_name = Folder.temp.fsName + "\\" + "temp.bat";
    var bat_file = new File(bat_name);
    bat_file.encoding = "UTF8";
    bat_file.open("w");

    for (var i = 0; i < files.length; i++) {
        bat_file.writeln("\"" + ps_name + "\"" + " " + "\"" + files[i].fsName + "\"");
        bat_file.writeln("\"" + ps_name + "\"" + " " + "\"" + sc_name + "\"");
        bat_file.writeln("timeout 3");
    }

    bat_file.close();

    bat_file.execute();
}
