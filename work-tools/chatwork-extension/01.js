javascript:var d=new Date();
var rid;
$('#_roomListArea li').each(function(i, element){
  rid = $(element).data('rid');
  $.getJSON('https://'+window.location.hostname+'/gateway.php?cmd=read&myid='+MYID+'&_v='+CLIENT_VER+'&_av=5&_t='+ACCESS_TOKEN+'&ln=ja&room_id='+rid+'&last_chhkkt_id='+$('._message[data-rid='+rid+']:last  ').data('mid')+'&_='+d.getDate());
});
