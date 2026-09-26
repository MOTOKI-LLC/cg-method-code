var doc = activeDocument;   
var lay = doc.layers;
var arr = [];
doc.suspendHistory("ヒストリー名", "main()");

function main() {
    var win = new Window("palette", "loading…");
    var max = lay.length;
    win.progressbar = win.add("Progressbar", [10, 10, 300, 20], 0, max);
    win.center();
    win.show();

    for (var i = 0; i < max; i++) {
        arr.push(lay[i].name);
        win.progressbar.value = i;
        $.sleep(10);//インクリメントする事に処理を少しだけ止める  
        win.update();//ダイアログの状況を更新
    }
    win.close();
    var list = arr.join("\n");
    alert(list);    
}
