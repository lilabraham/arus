const idr = new Intl.NumberFormat('id-ID');

export const MASKED_RP = 'Rp •••••••';

const UNIT_RE = /^(\d+)(?:,(\d+))?\s*(rb|ribu|k|jt|juta)$/;
const PLAIN_RE = /^(?:\d+|\d{1,3}(?:\.\d{3})+)$/;

export function parseRp(input: string): number | null {
  const cleaned = input.trim().replace(/^rp\s*/i, '').toLowerCase();
  if (!cleaned) return null;

  const unitMatch = UNIT_RE.exec(cleaned);
  if (unitMatch) {
    const [, whole, fracRaw = '', unit] = unitMatch;
    const scalePow = unit.startsWith('j') ? 6 : 3;
    const frac = fracRaw.replace(/0+$/, '');
    if (frac.length > scalePow) return null;

    const scale = 10 ** scalePow;
    const fracPart = frac ? Number(frac.padEnd(scalePow, '0')) : 0;
    const value = Number(whole) * scale + fracPart;
    return Number.isSafeInteger(value) ? value : null;
  }

  if (!PLAIN_RE.test(cleaned)) return null;
  const value = Number(cleaned.replaceAll('.', ''));
  return Number.isSafeInteger(value) ? value : null;
}

export function formatRp(amount: number): string {
  if (amount === 0) return 'Rp0';
  return amount < 0 ? `−Rp${idr.format(Math.abs(amount))}` : `Rp${idr.format(amount)}`;
}

export function formatRpCompact(amount: number): string {
  const abs = Math.abs(amount);
  if (abs < 1_000_000) return formatRp(amount);

  const sign = amount < 0 ? '−' : '';
  if (abs < 1_000_000_000) {
    const tenths = Math.round(abs / 100_000);
    if (tenths >= 10_000) return `${sign}Rp1 M`;
    const whole = Math.floor(tenths / 10);
    const rem = tenths % 10;
    return rem === 0 ? `${sign}Rp${whole} jt` : `${sign}Rp${whole},${rem} jt`;
  }

  const tenths = Math.round(abs / 100_000_000);
  const whole = Math.floor(tenths / 10);
  const rem = tenths % 10;
  return rem === 0 ? `${sign}Rp${whole} M` : `${sign}Rp${whole},${rem} M`;
}
