import { describe, expect, it } from 'vitest';
import { isValidDateStr, todayLocal } from './date';

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
});
