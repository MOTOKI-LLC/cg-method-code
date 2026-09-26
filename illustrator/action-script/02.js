var set = 'my';
var aia = File('~/Desktop/my.aia');

try {
    // アクションが存在する場合アンロード
    app.unloadAction(set, '');
} catch (e) {}
app.loadAction(aia);
