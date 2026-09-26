camera = thisComp.layer("カメラ 1");  
point1 = position;  
point2 = camera.position;  
distance = length(point1, point2);  
size = (distance/camera.zoom) * 100;
[size, size, 100]
