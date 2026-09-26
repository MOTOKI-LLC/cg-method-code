function convertToDocument(file, folder) {
    var options = {
        title: file.getName(),
        mimeType: MimeType.GOOGLE_DOCUMENT,
        parents: [{ id: folder.getId() }]
    };
    Drive.Files.insert(options, file.getBlob());
}
