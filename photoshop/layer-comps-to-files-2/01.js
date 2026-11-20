var fileNameBody = [];
if (exportInfo.fileNamePrefix) {
    fileNameBody.push(exportInfo.fileNamePrefix);
}
if (exportInfo.numericPrefix) {
    fileNameBody.push(zeroSuppress(compsIndex, 4));
}
if (compRef.name) {
    fileNameBody.push(compRef.name);
}
if (compRef.comment) {
    fileNameBody.push(compRef.comment);
}
fileNameBody = fileNameBody.join('_').replace(/[:\/\\*?"<>|\r\n]/g, '_');
