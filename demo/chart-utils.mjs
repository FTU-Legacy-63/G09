export const dateTime = (date) => Date.parse(`${date}T00:00:00Z`);

export function nearestDateIndex(times, target) {
  let left = 0;
  let right = times.length - 1;
  while (left < right) {
    const mid = Math.floor((left + right) / 2);
    if (times[mid] < target) left = mid + 1;
    else right = mid;
  }
  return left > 0 && target - times[left - 1] <= times[left] - target ? left - 1 : left;
}

export function chartSegments(values, dates) {
  const segments = [];
  let current = [];
  values.forEach((value, index) => {
    if (!Number.isFinite(value) || (current.length && dateTime(dates[index]) - dateTime(dates[index - 1]) > 7 * 86400000)) {
      if (current.length) segments.push(current);
      current = [];
    }
    if (Number.isFinite(value)) current.push(index);
  });
  if (current.length) segments.push(current);
  return segments;
}

export function tooltipPosition(x, y, width, height, tooltipWidth, tooltipHeight) {
  const left = x + 14 + tooltipWidth <= width - 8 ? x + 14 : x - tooltipWidth - 14;
  const top = y + 14 + tooltipHeight <= height - 8 ? y + 14 : y - tooltipHeight - 14;
  return { left: Math.max(8, Math.min(width - tooltipWidth - 8, left)), top: Math.max(8, Math.min(height - tooltipHeight - 8, top)) };
}
