function myFunction() {
  //■Phase1
  //記録用のスプレッドシート
  var LogFile = SpreadsheetApp.openById('記録用のシートID');
  //シートの選択
  var LogFileSheet = LogFile.getSheetByName('シート1');
  var myDate = LogFileSheet.getRange("A3").getValue();//2019/08/26と書いてあるます。
  var input = new Date(myDate);
  var date = Utilities.formatDate(input, 'JST', 'yyMMdd') 
  
  //■Phase2
  // テンプレートファイル
  var templateFile = DriveApp.getFileById("コピー元のシートID");
  // 出力先フォルダ
  var OutputFolder = DriveApp.getFolderById("格納先のフォルダID");
  // 出力ファイル名
  var OutputFileName = templateFile.getName().replace('テンプレート', '')+date;
  //テンプレートのリネーム＆コピー
  var CopiedFile = templateFile.makeCopy(OutputFileName, OutputFolder);
  //コピーしたシートのID取得
  var CopiedFileId = CopiedFile.getId();  
  
  //シートにコピー先のシートIDを書き込み
  LogFileSheet.getRange("A1").setValue(CopiedFileId);
  
  //■Phase3
  //コピーへの書き込み確認
  var CopiedFileSheet = SpreadsheetApp.openById(CopiedFileId).getSheetByName('コピー元');
  
  var Cells = CopiedFileSheet.getRange(1, 1, 1, 8);
  var Values =Cells.getValues();
  //チェックボックス判定  
  for (var i=0; i<Cells.getNumColumns(); i++){
    if (Values[0][i] === true) {
      Logger.log("チェックがついています")
      LogFileSheet.getRange("A2").setValue("チェックがついています");
      LogFileSheet.getRange("A3").setValue("");
    }else{      
    }
  }
  
  //■Phase4
  //シートテンプレートをコピーしてを名前を日付に
  var CopiedFile = SpreadsheetApp.openById(CopiedFileId);
  var DateSheet = CopiedFileSheet.copyTo(CopiedFile);  
  var ActiveSheet = DateSheet.setName(date);
  
  //シートを一番左に移動
  CopiedFile.setActiveSheet(ActiveSheet);
  CopiedFile.moveActiveSheet(1);  
}
