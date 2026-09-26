function isBusinessDay(date){
  if (date.getDay() == 0 || date.getDay() == 6) return false; // 土日
  var calJa = CalendarApp.getCalendarById('ja.japanese#holiday@group.v.calendar.google.com');
  return calJa.getEventsForDay(date).length === 0;
}

function myFunction() {
  var date = new Date();  
  if (isBusinessDay(date)) {
    Logger.log('送信');
  } else {
    Logger.log('休日');
  }
}
