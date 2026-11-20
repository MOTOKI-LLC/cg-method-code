#Requires AutoHotkey v2.0
#SingleInstance Force
#Include binding_store.ahk

iniPath := A_ScriptDir "\settings.ini"
try values := ReadBindings(iniPath)
catch as err {
    MsgBox "設定を読み込めません。元のINIを確認してください。`n" err.Message
    ExitApp
}

; メモ帳が前面のときだけ、保存済みキーを有効にする。
HotIfWinActive("ahk_exe notepad.exe")
for index, key in values
    Hotkey(key, Demo.Bind(index))
HotIf()

window := Gui(, "練習ショートカット設定")
window.AddText(, "Ctrl+Alt+1～9から、重複しない3つを選びます。")
inputs := []
for index, key in values {
    window.AddText("xm", "練習 " index)
    inputs.Push(window.AddHotkey("x+15 w160", key))
}
window.AddButton("xm w210", "保存（次回起動から反映）").OnEvent("Click", Save)
window.OnEvent("Close", (*) => ExitApp())
window.Show()

Demo(index, *) {
    MsgBox "練習 " index " のショートカットです。"
}

Save(*) {
    global inputs, iniPath
    selected := []
    for control in inputs
        selected.Push(control.Value)
    try {
        SaveBindings(selected, iniPath)
        MsgBox "保存しました。画面を閉じて再起動すると反映されます。"
    } catch as err {
        MsgBox "保存できませんでした。`n" err.Message
    }
}
