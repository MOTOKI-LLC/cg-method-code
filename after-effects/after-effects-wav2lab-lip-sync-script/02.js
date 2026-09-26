buffer = 0.1;
nKey = marker.nearestKey(time);
if(time < nKey.time){
cIndex = nKey.index-1;
} else {
cIndex= nKey.index;
}
ret = 0;
if(cIndex > 0)
{
nowmarker = marker.key(cIndex);
if(nowmarker.time + nowmarker.duration + buffer > time)
{
comment = nowmarker.comment;
    if(comment == "a"){
        ret = 1;
    }else if(comment == "i"){
        ret = 2;
    }else if(comment == "u"){
        ret = 3;
    }else if(comment == "e"){
        ret = 4;
    }else if(comment == "o"){
        ret = 5;
    }else if(comment == "N"){
        ret = 6;
    }
}
}
ret;
