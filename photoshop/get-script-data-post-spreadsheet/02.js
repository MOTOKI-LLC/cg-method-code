//スクリプト名取得
var scriptName = decodeURI(File($.fileName));
var scriptName = getName(scriptName, 1);
var scriptName = encodeURI(scriptName);

//使用者名取得
var userName = $.getenv("HOMEPATH");
var userName = getName(userName, 8);
$.writeln(userName);

//名前の抽出
function getName(str, delStr) {
    var str = new String(str).substring(str.lastIndexOf('/') + delStr);
    return str
dObj = new Date();
}

//スクリプト使用日取得
var dObj = new Date();
var y = dObj.getFullYear();
var m = dObj.getMonth() + 1;
var d = dObj.getDate();
var h = dObj.getHours();
var s  = dObj.getMinutes();
var usedDate = y + "/" + m + "/" + d+ "/" + h+ ":" + s;

var webhookUrl = "https://script.google.com/macros/s/******/exec?"+"p1="+scriptName +"&p2="+userName+"&p3="+usedDate;
//変数をダブルクォーテーションで囲う
webhookUrl = "\"" + webhookUrl+ "\"";

function createBatchFile(webhookUrl) {
    const CR = String.fromCharCode(13);
    const BATCH_FILE = new File(Folder.temp + "/tmp.bat");       
    BATCH_FILE.open("w");
    BATCH_FILE.write("@echo off" + CR);
    BATCH_FILE.write("setlocal" + CR);
    BATCH_FILE.write("cd C:/Program Files (x86)/curl-7.65.3-win64-mingw/bin/" + CR);
    BATCH_FILE.write("set URL= " +webhookUrl+CR);       
    BATCH_FILE.write("curl -L %URL%"+CR);  
    BATCH_FILE.write("exit"+CR);  
    //BATCH_FILE.write("pause" + CR);
    BATCH_FILE.close();
    //BATCH_FILE.execute();
}

//実行コマンド
createBatchFile(webhookUrl);

//コマンドプロンプト開きたくないので、VBSをかます
var cmd = "C:\\Library\\Bat\\test.vbs";
var file = new File(cmd);
file.execute();
