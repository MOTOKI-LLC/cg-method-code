function isBusinessDay(date){
  if (date.getDay() == 0 || date.getDay() == 6) return false;
  var calJa = CalendarApp.getCalendarById('ja.japanese#holiday@group.v.calendar.google.com');
  return calJa.getEventsForDay(date).length === 0;
}

function isSpecifiedDay(date){
  var calCustom = CalendarApp.getCalendarById('hogehoge@group.calendar.google.com'); // あなたのカレンダーIDに置き換え
  return calCustom.getEventsForDay(date).length === 0;
}

function myFunction() {
  var date = new Date();  
  if (isSpecifiedDay(date)) {
    if (isBusinessDay(date)) {
      Logger.log('送信！');
    } else {
      Logger.log('休日');
    }
  } else {
    Logger.log('指定日休日');
  }
}
