const DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/;
const shortDateFmt = new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short' });

export function todayLocal(now: Date = new Date()): string {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function isValidDateStr(value: string): boolean {
  const match = DATE_RE.exec(value);
  if (!match) return false;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return false;

  const check = new Date(year, month - 1, day);
  return check.getFullYear() === year && check.getMonth() === month - 1 && check.getDate() === day;
}

export function formatShortDate(dateStr: string): string {
  const match = DATE_RE.exec(dateStr);
  if (!match) return dateStr;
  return shortDateFmt.format(new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3])));
}

export function greeting(now: Date = new Date()): string {
  const h = now.getHours();
  if (h >= 4 && h < 11) return 'Selamat pagi';
  if (h >= 11 && h < 15) return 'Selamat siang';
  if (h >= 15 && h < 18) return 'Selamat sore';
  return 'Selamat malam';
}
