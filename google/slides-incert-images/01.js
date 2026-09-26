function incertImagesSlide() {

  var DRIVE_FOLDER_ID = "画像が格納されているフォルダID";
  var INCERT_SLIDE_ID = "画像を追加したいGoogleスライドのID";
  var TEMPLATE_SLIDE_ID = "テンプレートのGoogleスライドのID"
  var num = 20;//差し替えたい画像の枚数
  
  build();

  function build() {
    var images = [];
    var childList = Drive.Children.list(DRIVE_FOLDER_ID, { q: "mimeType contains 'image/' and trashed = false" }).items;
    for (var i in childList) {
      images.push(Drive.Files.get(childList[i].id).thumbnailLink);
    }

    var template = SlidesApp.openById(TEMPLATE_SLIDE_ID);
    var template_slides = template.getSlides();
    var nbOfImages = images.length;
    var card_template;

    var cards = [];
    for (var crd = 0; crd < num; crd++) {
      var symbols = [0];
      for (var sym = 1; sym < num; sym++) {
        symbols.push(crd * (num - 1) + sym);
      }
      cards.push(symbols.slice());
    }

    card_template = template_slides[0];    
    var presentation = SlidesApp.openById(INCERT_SLIDE_ID);

    loopThroughDeck:

    for (var i = 0; i < cards.length; i++) {
      var cardContent = cards[i];

      for (var j = 0; j < cardContent.length; j++) {
        if (cardContent[j] > nbOfImages) continue loopThroughDeck;
      }

      var card = presentation.appendSlide(card_template);
      var placeholders = card.getImages();
      try {
        for (var j = 0; j < placeholders.length; j++) {
          placeholders[j].replace(images[cardContent[j]]);
        }
      } catch (e) { }        
    }
    presentation.saveAndClose();
  }
}
