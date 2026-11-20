const PRACTICE_ZONE = 'Asia/Tokyo';
function dateParts_(date) {
  if (!(date instanceof Date) || !Number.isFinite(date.getTime())) throw new Error('有効な日時を指定してください');
  const key = Utilities.formatDate(date, PRACTICE_ZONE, 'yyyy-MM-dd');
  const day = new Date(key + 'T00:00:00Z').getUTCDay();
  return {key: key, weekend: day === 0 || day === 6};
}
function configuredCalendar_(key, optional) {
  const id = PropertiesService.getScriptProperties().getProperty(key);
  if (!id) {
    if (optional) return null;
    throw new Error(key + 'を設定してください');
  }
  const calendar = CalendarApp.getCalendarById(id);
  if (!calendar) throw new Error(key + 'のカレンダーを取得できません');
  if (calendar.getTimeZone() !== PRACTICE_ZONE) throw new Error(key + 'のタイムゾーンをAsia/Tokyoにそろえてください');
  return calendar;
}
function allDayBlocks_(events, key) {
  return events.some(event => {
    if (!event.isAllDayEvent()) return false;
    const start = Utilities.formatDate(event.getAllDayStartDate(), PRACTICE_ZONE, 'yyyy-MM-dd');
    const end = Utilities.formatDate(event.getAllDayEndDate(), PRACTICE_ZONE, 'yyyy-MM-dd');
    return start <= key && key < end;
  });
}
function shouldRunAt_(date) {
  if (Session.getScriptTimeZone() !== PRACTICE_ZONE) throw new Error('プロジェクトのタイムゾーンをAsia/Tokyoにそろえてください');
  const day = dateParts_(date);
  // 設定が壊れていたら、平日扱いで続行せず停止します。
  const holidays = configuredCalendar_('HOLIDAY_CALENDAR_ID', false);
  const custom = configuredCalendar_('SKIP_CALENDAR_ID', true);
  const noon = Utilities.parseDate(day.key + ' 12:00', PRACTICE_ZONE, 'yyyy-MM-dd HH:mm');
  const holiday = allDayBlocks_(holidays.getEventsForDay(noon), day.key);
  const customSkip = custom ? allDayBlocks_(custom.getEventsForDay(noon), day.key) : false;
  return {date: day.key, weekend: day.weekend, holiday: holiday, customSkip: customSkip,
    shouldRun: !day.weekend && !holiday && !customSkip};
}
function previewToday() {
  const result = shouldRunAt_(new Date());
  console.log(JSON.stringify(result));
  return result;
}
function demoHolidayCheck() {
  const result = shouldRunAt_(new Date('2026-10-05T12:00:00+09:00'));
  console.log(JSON.stringify(result));
  return result;
}
