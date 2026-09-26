function convertToSlides(file, folder) {
    var options = {
        title: file.getName(),
        mimeType: MimeType.GOOGLE_SLIDES,
        parents: [{ id: folder.getId() }]
    };
    Drive.Files.insert(options, file.getBlob());
}
