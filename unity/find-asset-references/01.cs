// 変更前
[MenuItem("Assets/Find References In Project", true)]
[MenuItem("Assets/Find References In Project", false, 25)]

// 変更後（Ctrl+Fで実行できるようになる）
[MenuItem("Assets/Find References In Project %f", true)]
[MenuItem("Assets/Find References In Project %f", false, 25)]
