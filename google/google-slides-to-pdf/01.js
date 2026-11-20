function exportPdf() {
  const folderId = '保存先フォルダID';
  const fileIds = ['GoogleスライドのファイルID1', 'GoogleスライドのファイルID2', 'GoogleスライドのファイルID3'];
  const folder = DriveApp.getFolderById(folderId);
  const results = [];
  for (const id of fileIds) {
    try {
      const source = DriveApp.getFileById(id);
      if (source.getMimeType() !== MimeType.GOOGLE_SLIDES) {
        throw new Error('Googleスライド以外のファイルです');
      }
      const blob = source.getAs(MimeType.PDF).setName(source.getName() + '.pdf');
      const output = folder.createFile(blob);
      results.push({sourceId: id, outputId: output.getId(), ok: true});
    } catch (error) {
      results.push({sourceId: id, ok: false, error: String(error.message)});
    }
  }
  console.log(JSON.stringify(results));
}
