;選択したパスのフォルダを開く
Alt & W:: 
Clipboard := CopyClipboard()
If (RegExMatch(Clipboard, "^https?://")) {
    Run, %Clipboard%
}
If (RegExMatch(Clipboard, "\")) {
    Run, %Clipboard%, , UseErrorLevel
    If (ErrorLevel != 0) {
        Run, Explorer.exe
    }
}
Return
