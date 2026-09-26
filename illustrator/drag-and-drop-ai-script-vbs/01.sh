Option Explicit

' ドラッグ＆ドロップで取得したファイルパスを変数に入れる
Dim GetPathArray
Set GetPathArray = WScript.Arguments

' ファイルシステムオブジェクトを作成
Dim objFSO
Set objFSO = CreateObject("Scripting.FileSystemObject")

Dim pt

' ループ処理
For Each pt in GetPathArray
    Dim app, doc
    Set app = CreateObject("Illustrator.Application")
    Set doc = app.Open(pt)

    ' スクリプトの実行
    app.DoJavaScriptFile("C:\Users\username\Desktop\CGM_outlineAi.jsx")

    ' 保存して閉じる
    doc.Close 1 ' aiDoNotSaveChanges
Next
