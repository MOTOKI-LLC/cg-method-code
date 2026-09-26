var Values = CopiedFileSheet.getRange(1, 1, 1, 8).getValues();

for (var i = 0; i < Values[0].length; i++) {
  if (Values[0][i] === true) {
    Logger.log("チェックがついています");
    LogFileSheet.getRange("A2").setValue("チェックがついています");
    LogFileSheet.getRange("A3").setValue("");
  }
}
