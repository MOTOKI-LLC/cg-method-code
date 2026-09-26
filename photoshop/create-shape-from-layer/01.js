layObj = activeDocument.activeLayer.bounds;
x1 = layObj[0];
y1 = layObj[1];
x2 = layObj[2];
y2 = layObj[3];
alert("(" + x1 + "," + y1 + ")-(" + x2 + "," + y2 + ")");
