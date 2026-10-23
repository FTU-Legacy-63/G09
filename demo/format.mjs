// One numeric/date convention across all result pages.
const finite = value => typeof value === 'number' && Number.isFinite(value);
export const number = (value, digits = 2) => finite(value) ? new Intl.NumberFormat('vi-VN', { maximumFractionDigits: digits, minimumFractionDigits: digits }).format(value).replace('-', '−') : '—';
export const percent = (value, digits = 1) => finite(value) ? `${number(value * 100, digits)}%` : '—';
export const signedPercent = (value, digits = 1) => finite(value) ? `${value >= 0 ? '+' : ''}${percent(value, digits)}` : '—';
export const points = value => finite(value) ? `${value >= 0 ? '+' : ''}${number(value * 100, 2)} đ.%` : '—';
export const vnd = value => finite(value) ? `${number(Math.round(value), 0)} ₫` : '—';
export const signedVnd = value => finite(value) ? `${value >= 0 ? '+' : '−'}${vnd(Math.abs(value))}` : '—';
export function compactVnd(value) {
  if (!finite(value)) return '—';
  const absolute = Math.abs(value);
  return absolute >= 1e9 ? `${number(value / 1e9, 1)} tỷ ₫` : absolute >= 1e6 ? `${number(value / 1e6, 1)} tr ₫` : vnd(value);
}
export const dateLabel = value => value && /^\d{4}-\d{2}-\d{2}$/.test(value) ? new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${value}T00:00:00Z`)) : '—';
