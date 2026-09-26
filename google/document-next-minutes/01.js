function createNextMinutes() {
  
  function getLatestFileId(){    
    var folder = DriveApp.getFoldersByName("議事録");
    var files = folder.next().getFiles();
    var lastFileId = files.next().getId();        
    return lastFileId.toString();    
  }
  
  //最新の議事録のID取得
  var fileId = getLatestFileId();
  
  //コピー元のファイル名を取得して数字を１つカウント
  const dec2zen=(x,flg)=>{
    var n=65296;
    return flg?
    x.toString().split("").map(x=>String.fromCharCode(parseInt(x)+n)).join(""):
    parseInt(x.split("").map(x=>x.charCodeAt()-n).join(""));
  }  
  const reg=/[０-９]+(?=回)/;
  
  var tempFile = DriveApp.getFileById(fileId);
  var fileName = tempFile.getName();
  fileName = fileName.replace(reg,m=>dec2zen(dec2zen(m)+1,1));
  
  //ファイル名の日付部分を置換
  var date = new Date();
  date.setDate(date.getDate() + 7);
  var formattedDate = Utilities.formatDate(date, "JST", "yyyyMMdd");  
  var rep = /^\d{8}/;  
  var result = fileName.replace(rep , formattedDate );
  
  //コピーを作成（ついでにコピー先のIDも取得）
  newfile = tempFile.makeCopy(result).getId();
  
  //コピーを先の本文取得
  var doc = DocumentApp.openById(newfile);
  var body = doc.getBody();
  
  //本文の日付更新
  var out = Utilities.formatDate(date, "JST", "yyyy/MM/dd"); 
  var rep = "[0-9]{4}/[0-9]{2}/[0-9]{2}";  
  body.replaceText(rep, out);
  
  //見出しの作成
  body.replaceText(".*議事録",result);
  body.replaceText(".*_","");
  
}
