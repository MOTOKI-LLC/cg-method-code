const { app, core } = require("photoshop");
if (app.documents.length !== 0) {
    await core.showAlert("Save and close your current documents before this practice.");
} else {
    try {
        const doc = await app.documents.add({
            name: "CGM UXP Practice",
            width: 256,
            height: 128,
            resolution: 72,
            depth: 8,
            mode: "RGBColorMode",
            fill: "transparent"
        });
        await doc.createLayer({ name: "CGM practice layer" });
        await core.showAlert("Created a new unsaved practice document: " + doc.name +
            "\nSize: " + doc.width + " x " + doc.height + " px");
    } catch (e) {
        await core.showAlert("Practice failed: " + e.message +
            "\nIf a new practice document remains open, inspect it before closing without saving.");
    }
}
