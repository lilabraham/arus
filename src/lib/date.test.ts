import { describe, expect, it } from 'vitest';
import {
  currentMonth,
  formatDayHeading,
  formatMonth,
  formatShortDate,
  greeting,
  isValidDateStr,
  shiftMonth,
  todayLocal,
} from './date';

describe('date', () => {
  it('memformat tanggal lokal menjadi YYYY-MM-DD tanpa geser zona waktu', () => {
    // 22 Nov 2026 jam 00:30 waktu lokal (di UTC+7 adalah 21 Nov UTC)
    const localMidnight = new Date(2026, 10, 22, 0, 30, 0);
    expect(todayLocal(localMidnight)).toBe('2026-11-22');

    const singleDigit = new Date(2026, 0, 5, 23, 59, 0);
    expect(todayLocal(singleDigit)).toBe('2026-01-05');
  });

  it('memvalidasi string tanggal kalender YYYY-MM-DD', () => {
    expect(isValidDateStr('2026-11-22')).toBe(true);
    expect(isValidDateStr('2024-02-29')).toBe(true);
    expect(isValidDateStr('2026-02-29')).toBe(false);
    expect(isValidDateStr('2026-02-31')).toBe(false);
    expect(isValidDateStr('2026-13-01')).toBe(false);
    expect(isValidDateStr('22-11-2026')).toBe(false);
    expect(isValidDateStr('')).toBe(false);
  });

  it('memformat tanggal singkat Indonesia tanpa geser zona waktu', () => {
    expect(formatShortDate('2026-11-22')).toBe('22 Nov');
    expect(formatShortDate('2026-01-05')).toBe('5 Jan');
  });

  it('memberi sapaan sesuai jam lokal', () => {
    expect(greeting(new Date(2026, 10, 22, 7, 0))).toBe('Selamat pagi');
    expect(greeting(new Date(2026, 10, 22, 12, 30))).toBe('Selamat siang');
    expect(greeting(new Date(2026, 10, 22, 16, 0))).toBe('Selamat sore');
    expect(greeting(new Date(2026, 10, 22, 21, 0))).toBe('Selamat malam');
    expect(greeting(new Date(2026, 10, 22, 2, 0))).toBe('Selamat malam');
  });

  it('mengambil bulan lokal YYYY-MM dan menggeser bulan lintas tahun', () => {
    expect(currentMonth(new Date(2026, 10, 1, 0, 30))).toBe('2026-11');
    expect(shiftMonth('2026-11', -1)).toBe('2026-10');
    expect(shiftMonth('2026-01', -1)).toBe('2025-12');
    expect(shiftMonth('2026-12', 1)).toBe('2027-01');
    expect(shiftMonth('invalid', -1)).toBe('invalid');
  });

  it('memformat judul bulan dan judul hari dalam bahasa Indonesia', () => {
    expect(formatMonth('2026-11')).toBe('November 2026');
    expect(formatMonth('2026-01')).toBe('Januari 2026');
    const heading = formatDayHeading('2026-11-22');
    expect(heading).toContain('22');
    expect(heading).toContain('Nov');
  });
});
