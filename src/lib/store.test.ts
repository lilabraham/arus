import { describe, expect, it, vi } from 'vitest';
import { CORRUPT_KEY, DB_KEY, load, migrate, requestPersist, save, type StorageLike } from './store';
import type { Db } from './types';

function memoryStorage(initial: Record<string, string> = {}): StorageLike & { data: Record<string, string> } {
  const data = { ...initial };
  return {
    data,
    getItem: (key) => (key in data ? data[key] : null),
    setItem: (key, value) => {
      data[key] = value;
    },
  };
}

describe('store', () => {
  it('mengembalikan rekening dan kategori default lengkap saat storage kosong', () => {
    const storage = memoryStorage();
    const db = load(storage);

    expect(db.version).toBe(1);
    expect(db.accounts.map((a) => [a.name, a.type])).toEqual([
      ['Tunai', 'cash'],
      ['BCA', 'bank'],
      ['Mandiri', 'bank'],
      ['Jenius', 'bank'],
      ['DANA', 'ewallet'],
    ]);

    const outGroups = new Set(db.categories.filter((c) => c.kind === 'out').map((c) => c.group));
    const inGroups = new Set(db.categories.filter((c) => c.kind === 'in').map((c) => c.group));
    expect(outGroups.size).toBe(14);
    expect(inGroups.size).toBe(9);
    expect(db.categories.filter((c) => c.kind === 'out')).toHaveLength(69);
    expect(db.categories.filter((c) => c.kind === 'in')).toHaveLength(25);
    expect(new Set(db.categories.map((c) => c.id)).size).toBe(db.categories.length);
    expect(new Set(db.accounts.map((a) => a.id)).size).toBe(db.accounts.length);
    expect(db.txs).toEqual([]);
    expect(db.budgets).toEqual([]);
    expect(db.prefs).toEqual({ hideBalance: false });
    expect(storage.data[CORRUPT_KEY]).toBeUndefined();
  });

  it('menyimpan dan memuat ulang Db secara identik', () => {
    const storage = memoryStorage();
    const db = load(storage);
    const updated: Db = {
      ...db,
      prefs: { hideBalance: true },
      txs: [
        {
          id: 'tx-1',
          kind: 'out',
          amount: 25000,
          accountId: db.accounts[0].id,
          categoryId: db.categories[0].id,
          note: 'Kopi susu',
          date: '2026-11-22',
          createdAt: 1795300000000,
        },
      ],
    };

    save(updated, storage);
    expect(load(storage)).toEqual(updated);
  });

  it('tidak crash pada JSON rusak, tidak menimpa data mentah, dan menyalinnya ke arus:corrupt', () => {
    const raw = '{"version":1,"txs":[rusak';
    const storage = memoryStorage({ [DB_KEY]: raw });

    const db = load(storage);

    expect(db.version).toBe(1);
    expect(db.accounts).toHaveLength(5);
    expect(storage.data[DB_KEY]).toBe(raw);
    expect(storage.data[CORRUPT_KEY]).toBe(raw);
  });

  it('menolak struktur JSON asing dan menyimpannya ke arus:corrupt', () => {
    const raw = JSON.stringify({ version: 99, foo: 'bar' });
    const storage = memoryStorage({ [DB_KEY]: raw });

    const db = load(storage);

    expect(db.version).toBe(1);
    expect(storage.data[DB_KEY]).toBe(raw);
    expect(storage.data[CORRUPT_KEY]).toBe(raw);
  });

  it('migrate menerima Db v1 valid dan mengembalikan null untuk bentuk invalid', () => {
    const valid = load(memoryStorage());
    expect(migrate(valid)).toEqual(valid);
    expect(migrate(null)).toBeNull();
    expect(migrate({})).toBeNull();
    expect(migrate({ ...valid, accounts: 'bukan-array' })).toBeNull();
    expect(migrate({ ...valid, prefs: {} })).toBeNull();
  });

  it('memanggil navigator.storage.persist() saat pertama kali dijalankan', () => {
    const persist = vi.fn().mockResolvedValue(true);
    requestPersist({ storage: { persist } });
    expect(persist).toHaveBeenCalledTimes(1);
  });
});
