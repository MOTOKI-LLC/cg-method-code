async function actionCommands() {
    let commands = [
        // 反転
        {
            "_obj": "invert"
        }
    ];
    return await require("photoshop").action.batchPlay(commands, {});
}

console.log(
    await require("photoshop").core.executeAsModal(actionCommands, {"commandName": "Action Commands"})
);
