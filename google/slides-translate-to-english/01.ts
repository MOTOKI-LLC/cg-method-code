const SLIDE_ID = "スライドID";

function translateSlides() {
  const presentation = SlidesApp.openById(SLIDE_ID);
  const slides = presentation.getSlides();
  
  slides.forEach(translateSlide);
}

function translateSlide(slide) {
  const pageElements = slide.getPageElements();
  
  pageElements.forEach(function(pageElement) {
    if (isTextShape(pageElement)) {
      translateShapeText(pageElement.asShape());
    }
  });
}

function isTextShape(pageElement) {
  return pageElement.getPageElementType() === SlidesApp.PageElementType.SHAPE &&
         pageElement.asShape().getText().asString() !== "";
}

function translateShapeText(shape) {
  const textRange = shape.getText();
  const textBefore = textRange.asString();
  const textAfter = LanguageApp.translate(textBefore, "ja", "en");
  
  textRange.setText(textAfter);
}
