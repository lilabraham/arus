import { describe, expect, it } from 'vitest';
import { parseRoute } from './route';

describe('parseRoute', () => {
  it('memetakan semua hash layar yang valid', () => {
    expect(parseRoute('#/')).toBe('beranda');
    expect(parseRoute('#/mutasi')).toBe('mutasi');
    expect(parseRoute('#/laporan')).toBe('laporan');
    expect(parseRoute('#/anggaran')).toBe('anggaran');
    expect(parseRoute('#/atur')).toBe('atur');
  });

  it('mengabaikan query parameter dan trailing slash', () => {
    expect(parseRoute('#/mutasi?account=bca&q=kopi')).toBe('mutasi');
    expect(parseRoute('#/laporan/')).toBe('laporan');
  });

  it('jatuh ke beranda jika hash kosong atau tidak dikenal', () => {
    expect(parseRoute('')).toBe('beranda');
    expect(parseRoute('#')).toBe('beranda');
    expect(parseRoute('#/tidak-ada')).toBe('beranda');
  });
});
