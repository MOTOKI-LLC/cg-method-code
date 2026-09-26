function replaceText(){
  var presentationID = "プレゼンテーションのID";
  var resource = {
    "requests": [
      {
        "replaceAllText": {
          "containsText": {
            "text": "CGメソッド"
          },
          "replaceText": "ブログ",
          "pageObjectIds": ["スライドのオブジェクトID"]
        }
      }
    ]
  };
  Slides.Presentations.batchUpdate(resource, presentationID);
}
