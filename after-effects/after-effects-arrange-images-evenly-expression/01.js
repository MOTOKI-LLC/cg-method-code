//上のレイヤーのXYZの座標
UpLayPosX = thisComp.layer(thisLayer, -1).position[0];
UpLayPosY = thisComp.layer(thisLayer, -1).position[1];
UpLayPosZ = thisComp.layer(thisLayer, -1).position[2];

//X座標
UpLayWidth = thisComp.layer(thisLayer, -1).width;
thisLayWidth = thisLayer.width;
PosX = UpLayPosX + (UpLayWidth + thisLayWidth) / 2;

//オフセット値
OffsetX = thisComp.layer("adjust").effect("OffsetX")("スライダー");

//座標
[PosX + OffsetX, UpLayPosY, UpLayPosZ];
