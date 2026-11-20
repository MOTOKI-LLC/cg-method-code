const { app, core } = require("photoshop");
if (app.documents.length === 0) {
    await core.showAlert("No document is open. Open a practice image and try again.");
} else {
    const doc = app.activeDocument;
    await core.showAlert("Document: " + doc.name + "\nSize: " + doc.width + " x " + doc.height + " px");
}
