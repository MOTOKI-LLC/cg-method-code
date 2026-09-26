(function(){
    
    //ドキュメントを複製
    var copiedDoc = app.activeDocument.duplicate();
 
    //処理（レイヤーを統合）
    mergeLayers();
    
　  //名前をつけて保存
    saveSceneAs();

     // 複製したドキュメントを保存せず閉じる
    activeDocument.close(SaveOptions.DONOTSAVECHANGES);

     //アラート
    alert('終わったよ♪');
     
     //レイヤーを統合
    function mergeLayers() { 
        
    docObj = activeDocument;
    docObj.mergeVisibleLayers();

    }
     
     function saveSceneAs() {
         
            //ドキュメント数を調べて、オリジナルのドキュメントナンバーを取得
            n = documents.length -2;
 
            //オリジナルのドキュメントのパスと名前を取得
            var filePath  = documents[n].path;
            var fileName = documents[n].name.replace(/\.[^\.]+$/, ''); 

            //プリフィックスを追加
            var fileFullName = filePath + "/" + fileName + "_export";
 
            //保存オプション
            var psdObj = new File(fileFullName);          
            var psdOpt = new PhotoshopSaveOptions();    
            
            psdOpt.alphaChannels = true;
            psdOpt.annotations = true;
            psdOpt.embedColorProfile = false;
            psdOpt.layers = true;
            psdOpt.spotColors = false;
 
            //名前をつけて保存
            activeDocument.saveAs(psdObj, psdOpt, true, Extension.LOWERCASE);

    }
           
})() ;
