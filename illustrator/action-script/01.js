(function () {
    var SET_NAME = "CGM_Test";
    var ACTION_NAME = "縮小10";
    if (app.documents.length === 0) { alert("ドキュメントを開いてください。"); return; }
    var selection = app.activeDocument.selection;
    if (!selection || selection.length === 0 || !selection[0] || !selection[0].typename) {
        alert("試験用のオブジェクトを選択してください。"); return;
    }
    for (var i = 0; i < selection.length; i++) {
        if (!selection[i].editable || selection[i].typename === "TextRange") {
            alert("オブジェクト全体を編集可能な状態で選択してください。"); return;
        }
    }
    if (!confirm("セット「" + SET_NAME + "」の「" + ACTION_NAME + "」を1回実行します。内容を確認したアクションですか？")) { return; }
    try {
        app.doScript(ACTION_NAME, SET_NAME, true);
    } catch (e) {
        alert("アクションの実行に失敗しました：" + e + "\n途中の変更が残る場合があります。文書を確認してください。");
    }
}());
