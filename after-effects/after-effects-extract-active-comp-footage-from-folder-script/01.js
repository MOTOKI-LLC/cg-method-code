app.beginUndoGroup("アクティブなコンポで使われているフッテージアイテムをまとめる");
app.activeViewer.setActive();
var array1 = [];
var myComp = app.project.activeItem;
var myCompName = app.project.activeItem.name;
//アクティブコンポの素材名を取得
for (i = 1; i <= myComp.numLayers; i++) {
  try {
    var myItemName = myComp.layer(i).source.name;
    array1.push(myItemName);
  } catch (e) {}
}
//指定のフォルダ内の素材名を取得
var array2 = [];
if (app.project.numItems > 0) {
  for (var i = 1; i <= app.project.numItems; i++) {
    var myItem = app.project.items[i];
    if ((app.project.item(i) instanceof FolderItem) && (app.project.item(i).name === 'comp')) {
      myFunc(app.project.item(i).items);
    }
  }
}

function myFunc(items) {
  for (var i = 1; i <= items.length; i++) {
    array2.push(items[i].name);
  }
}
//アクティブコンポの素材名と指定のフォルダ内の素材名を取得との合致した素材を抽出
for (var i = 0; i0) {
  for (var i = 1; i <= app.project.numItems; i++) {
    var myItem = app.project.items[i];
    if (myItem.name.indexOf(itemName) > -1) {
      array1.push(myItem);
    }
  }
}
}
var size = array1.length;
var itemFolder = app.project.rootFolder.items.addFolder(myCompName);
for (var i = 0; i
