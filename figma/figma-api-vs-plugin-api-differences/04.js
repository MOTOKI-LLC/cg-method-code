const rect = figma.createRectangle();
rect.x = 100;
rect.y = 100;
rect.resize(200, 100);
rect.fills = [{ type: 'SOLID', color: { r: 1, g: 0, b: 0 } }];
figma.currentPage.appendChild(rect);
