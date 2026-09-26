function myConvertToSpreadsheet() {
    var id = "GoogleDriveのフォルダID";
    var source_folder = DriveApp.getFolderById(id);
    var target_files = source_folder.getFiles();
    var dest_folder = DriveApp.getFolderById(id);

    while (target_files.hasNext()) {
        var file = target_files.next();
        convertToSpreadsheet(file, dest_folder);
    }
}

function convertToSpreadsheet(file, folder) {
    var options = {
        title: file.getName(),
        mimeType: MimeType.GOOGLE_SHEETS,
        parents: [{ id: folder.getId() }]
    };
    Drive.Files.insert(options, file.getBlob());
}
