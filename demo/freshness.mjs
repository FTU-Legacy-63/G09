export function vnToday(now = new Date()) {
  return new Intl.DateTimeFormat('en-CA', {timeZone:'Asia/Ho_Chi_Minh',year:'numeric',month:'2-digit',day:'2-digit'}).format(now);
}
export function rollingRange(start, today) {
  const earliest = new Date(`${today}T00:00:00Z`);
  earliest.setUTCFullYear(earliest.getUTCFullYear()-5);
  // Leap-day rollover is clamped to the end of February, not March 1.
  if (earliest.toISOString().slice(5,7)!==today.slice(5,7)) earliest.setUTCDate(0);
  const lower = earliest.toISOString().slice(0,10);
  return {start: !start || start < lower ? lower : start, end:today};
}
export function shouldRefresh(result, status, {followLatest, analyzing=false, now=new Date()}={}) {
  if (!followLatest || analyzing || !result) return false;
  if (result.inputEndDate !== vnToday(now)) return true;
  const age = now.getTime()-Date.parse(result.fetchedAtUtc);
  if (!Number.isFinite(age) || age>6*3600000) return true;
  return Object.entries(result.vnSources || {}).some(([symbol,source]) => status?.series?.[symbol]?.last_session > source.last_session);
}
