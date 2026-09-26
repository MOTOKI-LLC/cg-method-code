//--------------------------------------------------
// スクリプト計測
//--------------------------------------------------
#include 'C:\\Library\\ESTK\\scriptLog.jsx';

var script = $.fileName;
var user = $.getenv("HOMEPATH");
var date = new Date();
$.writeln(script + user + date);
try {
    scriptLog(script, user, date);
} catch (e) {}

//--------------------------------------------------
// 実際の処理    
//--------------------------------------------------
alert("テスト!");
