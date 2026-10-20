//レイヤーからカラーを取得する
var docRef = app.activeDocument
var pixelLoc = [UnitValue("10 pixels") , UnitValue("10 pixels")];
var colorSamplerRef = docRef.colorSamplers.add(pixelLoc);
app.foregroundColor = colorSamplerRef.color
colorSamplerRef.remove(); //置いたカラーサンプラーを消す

//カラーのRGB値を取得
var Colour = app.foregroundColor;  
var R = Colour.rgb.red.toFixed(2);  
var G = Colour.rgb.green.toFixed(2);  
var B = Colour.rgb.blue.toFixed(2);  

//べた塗りの作成
makeSolidFill (R,G,B);

function makeSolidFill(redC,greenC,blueC){
    var idMk = charIDToTypeID( "Mk  " );
    var desc15 = new ActionDescriptor();
    var idnull = charIDToTypeID( "null" );
    var ref4 = new ActionReference();
    var idcontentLayer = stringIDToTypeID( "contentLayer" );
    ref4.putClass( idcontentLayer );
    desc15.putReference( idnull, ref4 );
    var idUsng = charIDToTypeID( "Usng" );
    var desc16 = new ActionDescriptor();
    var idType = charIDToTypeID( "Type" );
    var desc17 = new ActionDescriptor();
    var idClr = charIDToTypeID( "Clr " );
    var desc18 = new ActionDescriptor();
    var idRd = charIDToTypeID( "Rd  " );
    desc18.putDouble( idRd, redC);//Red variable
    var idGrn = charIDToTypeID( "Grn " );
    desc18.putDouble( idGrn, greenC);//green variable
    var idBl = charIDToTypeID( "Bl  " );
    desc18.putDouble( idBl, blueC );//blue variable
    var idRGBC = charIDToTypeID( "RGBC" );
    desc17.putObject( idClr, idRGBC, desc18 );
    var idsolidColorLayer = stringIDToTypeID( "solidColorLayer" );
    desc16.putObject( idType, idsolidColorLayer, desc17 );
    var idcontentLayer = stringIDToTypeID( "contentLayer" );
    desc15.putObject( idUsng, idcontentLayer, desc16 );
    executeAction( idMk, desc15, DialogModes.NO );
}
