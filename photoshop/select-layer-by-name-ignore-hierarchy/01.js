// 選択するレイヤー名を指定
var targetLayer = "背景";

// アクションリファレンスを作成
var idSelect = charIDToTypeID("slct");
var desc = new ActionDescriptor();
var idNull = charIDToTypeID("null");
var ref = new ActionReference();
var idLayer = charIDToTypeID("Lyr ");

// レイヤー名を指定
ref.putName(idLayer, targetLayer);
desc.putReference(idNull, ref);

// レイヤーの可視状態を変更しない設定
var idMakeVisible = charIDToTypeID("MkVs");
desc.putBoolean(idMakeVisible, false);

// アクションを実行
try {
    executeAction(idSelect, desc, DialogModes.NO);
} catch (e) {
    alert("レイヤー '" + targetLayer + "' が見つかりません。");
}
