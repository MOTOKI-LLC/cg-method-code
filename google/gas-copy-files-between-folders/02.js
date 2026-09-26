function copyFile()
{
  //コピーするファイル（ファイルIDを入力）
  var source_dat = DriveApp.getFileById("xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx");
    
  //保存する場所（フォルダIDを入力）
  var copy_dir = DriveApp.getFolderById("xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx");

  //複製したい個数
  var last = 9;

  //複製したいファイル名（複製したい個数文入力）
  var file_names = [
    "01_水柱_冨岡義勇（とみおか・ぎゆう）",
    "02_炎柱_煉獄杏寿郎（れんごく・きょうじゅろう）",
    "03_蟲柱_胡蝶（こちょう）しのぶ",
    "04_音柱_宇髄天元（うずい・てんげん）",
    "05_恋柱_甘露寺蜜璃（かんろじ・みつり）",
    "06_霞柱_時透無一郎（ときとう・むいちろう）",
    "07_岩柱_悲鳴嶼行冥（ひめじま・ぎょうめい）",
    "08_蛇柱_伊黒小芭内（いぐろ・おばない）",
    "09_風柱_不死川実弥（しなずがわ・さねみ）",
  ];

  for (let i = 0; i <= last - 1; i++) {
    source_dat.makeCopy(file_names[i], copy_dir);
  }
}
