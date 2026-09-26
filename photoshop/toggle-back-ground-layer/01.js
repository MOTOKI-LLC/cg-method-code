var layObj = activeDocument.artLayers;
var bgLayer = layObj[layObj.length-1]; // 一番下のレイヤー

if(bgLayer.isBackgroundLayer){    
    bgLayer.name = "背景"; // リネームして背景を変換
    toggleBackGroundLayer();
} else {
    toggleBackGroundLayer();
}

// 一番下のレイヤーの表示をトグル
function toggleBackGroundLayer(){  
    if(bgLayer.visible){
        bgLayer.visible = false;
    } else {
        bgLayer.visible = true;
    }
}
