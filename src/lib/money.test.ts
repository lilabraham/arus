import { describe, expect, it } from 'vitest';
import { formatRp, parseRp } from './money';

describe('parseRp', () => {
  it('mem-parse angka polos dan pemisah ribuan titik', () => {
    expect(parseRp('0')).toBe(0);
    expect(parseRp('25000')).toBe(25000);
    expect(parseRp('25.000')).toBe(25000);
    expect(parseRp('1.250.000')).toBe(1250000);
    expect(parseRp('Rp 25.000')).toBe(25000);
    expect(parseRp('rp25.000')).toBe(25000);
  });

  it('mem-parse singkatan rb/k dan jt menjadi integer Rupiah persis', () => {
    expect(parseRp('25rb')).toBe(25000);
    expect(parseRp('25 rb')).toBe(25000);
    expect(parseRp('25k')).toBe(25000);
    expect(parseRp('2,5rb')).toBe(2500);
    expect(parseRp('1,5jt')).toBe(1500000);
    expect(parseRp('1,25 jt')).toBe(1250000);
    expect(parseRp('1,13jt')).toBe(1130000);
    expect(parseRp('1,5000rb')).toBe(1500);
  });

  it('menolak bilangan negatif', () => {
    expect(parseRp('-5000')).toBeNull();
    expect(parseRp('−5000')).toBeNull();
    expect(parseRp('-25rb')).toBeNull();
    expect(parseRp('-1,5jt')).toBeNull();
  });

  it('menolak desimal dan pecahan di bawah 1 Rupiah', () => {
    expect(parseRp('25,5')).toBeNull();
    expect(parseRp('25.5')).toBeNull();
    expect(parseRp('1.23')).toBeNull();
    expect(parseRp('1,5555rb')).toBeNull();
    expect(parseRp('0,1234567jt')).toBeNull();
    expect(parseRp('1.5jt')).toBeNull();
  });

  it('menolak input kosong, non-angka, dan format rusak', () => {
    expect(parseRp('')).toBeNull();
    expect(parseRp('   ')).toBeNull();
    expect(parseRp('abc')).toBeNull();
    expect(parseRp('rb')).toBeNull();
    expect(parseRp('Rp')).toBeNull();
    expect(parseRp('25..000')).toBeNull();
    expect(parseRp('.000')).toBeNull();
    expect(parseRp('1.0000')).toBeNull();
    expect(parseRp('99999999999999999999')).toBeNull();
  });
});

describe('formatRp', () => {
  it('memformat integer Rupiah tanpa spasi dan minus asli untuk negatif', () => {
    expect(formatRp(0)).toBe('Rp0');
    expect(formatRp(-0)).toBe('Rp0');
    expect(formatRp(25000)).toBe('Rp25.000');
    expect(formatRp(1250000)).toBe('Rp1.250.000');
    expect(formatRp(-500000)).toBe('−Rp500.000');
  });
});
