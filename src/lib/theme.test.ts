import { describe, expect, it } from 'vitest';
import { nextTheme, parseTheme } from './theme';

describe('theme', () => {
  it('mem-parse nilai tema yang valid dan jatuh ke system untuk nilai asing', () => {
    expect(parseTheme('light')).toBe('light');
    expect(parseTheme('dark')).toBe('dark');
    expect(parseTheme('system')).toBe('system');
    expect(parseTheme(null)).toBe('system');
    expect(parseTheme('neon')).toBe('system');
  });

  it('pada OS terang, tap pertama langsung pindah ke gelap lalu terang lalu sistem', () => {
    expect(nextTheme('system', false)).toBe('dark');
    expect(nextTheme('dark', false)).toBe('light');
    expect(nextTheme('light', false)).toBe('system');
  });

  it('pada OS gelap, tap pertama langsung pindah ke terang lalu gelap lalu sistem', () => {
    expect(nextTheme('system', true)).toBe('light');
    expect(nextTheme('light', true)).toBe('dark');
    expect(nextTheme('dark', true)).toBe('system');
  });
});
