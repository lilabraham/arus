import { describe, expect, it } from 'vitest';
import { filterCategories, groupColorToken, monogram, recentCategoryIds } from './category';
import { createDefaultDb } from './defaults';
import type { Tx } from './types';

describe('category helpers', () => {
  it('membuat monogram 2 huruf kapital dari nama', () => {
    expect(monogram('Makan harian')).toBe('MH');
    expect(monogram('Jajan & kopi')).toBe('JK');
    expect(monogram('Bensin')).toBe('BE');
    expect(monogram('BCA')).toBe('BC');
    expect(monogram('   ')).toBe('??');
  });

  it('memilih token warna --cat-1 sampai --cat-8 secara bergiliran per kelompok', () => {
    const groups = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'];
    expect(groupColorToken('A', groups)).toBe('var(--cat-1)');
    expect(groupColorToken('H', groups)).toBe('var(--cat-8)');
    expect(groupColorToken('I', groups)).toBe('var(--cat-1)');
    expect(groupColorToken('Tidak ada', groups)).toBe('var(--cat-8)');
  });

  it('mengurutkan kategori terakhir dipakai dari terbaru tanpa duplikat', () => {
    const txs: Tx[] = [
      { id: '1', kind: 'out', amount: 10000, accountId: 'acc-tunai', categoryId: 'cat-out-1', note: '', date: '2026-11-20', createdAt: 100 },
      { id: '2', kind: 'out', amount: 20000, accountId: 'acc-tunai', categoryId: 'cat-out-2', note: '', date: '2026-11-21', createdAt: 200 },
      { id: '3', kind: 'in', amount: 500000, accountId: 'acc-bca', categoryId: 'cat-in-1', note: '', date: '2026-11-21', createdAt: 250 },
      { id: '4', kind: 'out', amount: 15000, accountId: 'acc-tunai', categoryId: 'cat-out-1', note: '', date: '2026-11-22', createdAt: 300 },
    ];

    expect(recentCategoryIds(txs, 'out')).toEqual(['cat-out-1', 'cat-out-2']);
    expect(recentCategoryIds(txs, 'in')).toEqual(['cat-in-1']);
  });

  it('menyaring kategori aktif berdasarkan jenis dan pencarian nama atau kelompok', () => {
    const { categories } = createDefaultDb();
    const withArchived = categories.map((c, i) => (i === 0 ? { ...c, archived: true } : c));

    const kopi = filterCategories(withArchived, 'out', 'KOPI');
    expect(kopi.map((c) => c.name)).toEqual(['Jajan & kopi']);

    const transport = filterCategories(withArchived, 'out', 'transportasi');
    expect(transport).toHaveLength(6);

    const activeOut = filterCategories(withArchived, 'out', '');
    expect(activeOut.some((c) => c.id === categories[0].id)).toBe(false);
  });
});
