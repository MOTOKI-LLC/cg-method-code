(function(){
    app.bringToFront();  
    var doc= activeDocument;
    var comp = "tmp";

    doc.suspendHistory("選択したレイヤーだけを表示・非表示する", "main()");

    function main() {
        try{
            if (doc.layerComps[0].selected = doc.layerComps.getByName(comp) ) {
                restoreSelectLayer();
                deleteSelectLayer();
            } 
        }catch(e){
            doc.layerComps.add(comp);
            showSelectLayer();
            }
    }  

    //レイヤーカンプの表示を削除
    function deleteSelectLayer(){
        var idDlt = charIDToTypeID( "Dlt " );
        var desc9 = new ActionDescriptor();
        var idnull = charIDToTypeID( "null" );
        var ref4 = new ActionReference();
        var idcompsClass = stringIDToTypeID( "compsClass" );
        var idOrdn = charIDToTypeID( "Ordn" );
        var idTrgt = charIDToTypeID( "Trgt" );
        ref4.putEnumerated( idcompsClass, idOrdn, idTrgt );
        desc9.putReference( idnull, ref4 );
        executeAction( idDlt, desc9, DialogModes.NO );
    }

    //選択しているレイヤーのみ表示
    function showSelectLayer(){
        var ids = getSelectedLayerIDs();
        if (ids.length == 0) ids.push(doc.activeLayer.id);
        setVisible(doc.layers, ids);
    }

    //選択しているレイヤーのIDを取得
    function getSelectedLayerIDs(){
        var ids = [];
        var ref = new ActionReference();
        ref.putProperty( charIDToTypeID( "Prpr" ), stringIDToTypeID( "targetLayersIDs" ) );
        ref.putEnumerated( charIDToTypeID( "Dcmn" ), charIDToTypeID( "Ordn" ), charIDToTypeID( "Trgt" ) );
        var desc = executeActionGet( ref );
        if (desc.hasKey( stringIDToTypeID( "targetLayersIDs" ) )) {
            var list = desc.getList( stringIDToTypeID( "targetLayersIDs" ) );
            for (var i = 0; i < list.count; i++) ids.push( list.getReference( i ).getIdentifier() );
        }
        return ids;
    }

    //選択しているレイヤーと、それを入れているグループを表示し、ほかを非表示にする
    function setVisible(layers, ids){
        for (var i = 0; i < layers.length; i++) {
            var layer = layers[i];
            if (isSelected(layer, ids)) {
                layer.visible = true;
            } else if (hasSelected(layer, ids)) {
                layer.visible = true;
                setVisible(layer.layers, ids);
            } else {
                layer.visible = false;
            }
        }
    }

    function hasSelected(layer, ids){
        if (layer.typename != "LayerSet") return false;
        for (var i = 0; i < layer.layers.length; i++) {
            if (isSelected(layer.layers[i], ids) || hasSelected(layer.layers[i], ids)) return true;
        }
        return false;
    }

    function isSelected(layer, ids){
        for (var i = 0; i < ids.length; i++) {
            if (layer.id == ids[i]) return true;
        }
        return false;
    }

     //もとの表示状態に戻す   
    function restoreSelectLayer(){    
        var idapplyComp = stringIDToTypeID( "applyComp" );
            var desc19 = new ActionDescriptor();
            var idnull = charIDToTypeID( "null" );
                var ref9 = new ActionReference();
                var idcompsClass = stringIDToTypeID( "compsClass" );
                ref9.putName( idcompsClass, "tmp" );
            desc19.putReference( idnull, ref9 );
        executeAction( idapplyComp, desc19, DialogModes.NO );
    }

})() ;
