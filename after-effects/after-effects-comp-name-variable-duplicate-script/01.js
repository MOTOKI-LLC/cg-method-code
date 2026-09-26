// コンポジションを選択した状態で実行、文字列を1文字ずつ分解して、その文字数分だけコンポジションを複製して"letter_"+nameの形で保存
// 処理書くの面倒だったんでこのへんでユニーク化してください
// http://kiteretsu-world.info/tool/reduce-character.shtml

var Lyrics = "キミスペクトル君だけの色に染めてよ"; //ここの中身を適度に変えてください

//配列化
Lyrics = Lyrics.split('');

// forEach使えないので使えるように
// Production steps of ECMA-262, Edition 5, 15.4.4.18
// Reference: http://es5.github.com/#x15.4.4.18
if (!Array.prototype.forEach) {
  Array.prototype.forEach = function(callback, thisArg) {
    var T, k;

    if (this == null) {
      throw new TypeError(" this is null or not defined");
    }

    var O = Object(this);
    var len = O.length >>> 0;

    if ({}.toString.call(callback) != "[object Function]") {
      throw new TypeError(callback + " is not a function");
    }

    if (thisArg) {
      T = thisArg;
    }

    k = 0;

    while (k < len) {

      var kValue;

      if (k in O) {
        kValue = O[k];
        callback.call(T, kValue, k, O);
      }
      k++;
    }
  };
}
// 選択しているアイテムを取得
var activeItem = app.project.activeItem;
if ((activeItem == null) || !(activeItem instanceof CompItem)) {
  alert("コンポジションを選択した状態で実行しよう");
} else {
  Lyrics.forEach(function() {
    var curComp = activeItem.duplicate();
    curComp.name = "letter" + _;
  })
}
