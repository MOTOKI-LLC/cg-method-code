var words = "あいうえお";
words = words.replace(/(\r\n|\n|\r)/gm," ");
while (words.indexOf("  ") != -1) {words = words.replace("  ", " ")};
var endSpace = /\s$/;
words = words.replace(endSpace, "");
var charCount = words.split(" ").join(" ").length;
alert ("\n "+ charCount + " Characters");
