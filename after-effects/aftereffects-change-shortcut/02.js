{
    var projFile = app.project.file;
    if (projFile == null) {
        app.project.saveWithDialog();
    } else {
        var saveFile = projFile.saveDlg("save as", "*.aep");
        if (saveFile != null) {
            var saveChk = app.project.save(saveFile);
        }
    }
}
