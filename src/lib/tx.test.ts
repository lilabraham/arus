import { describe, expect, it } from 'vitest';
import { applyKeypadKey, createTx, updateTx } from './tx';

describe('applyKeypadKey', () => {
  it('membangun string digit integer tanpa nol di depan dan maksimal 12 digit', () => {
    expect(applyKeypadKey('', '0')).toBe('');
    expect(applyKeypadKey('', '000')).toBe('');
    expect(applyKeypadKey('', '2')).toBe('2');
    expect(applyKeypadKey('25', '000')).toBe('25000');
    expect(applyKeypadKey('25000', 'back')).toBe('2500');
    expect(applyKeypadKey('2', 'back')).toBe('');
    expect(applyKeypadKey('25000', 'clear')).toBe('');
    expect(applyKeypadKey('123456789012', '5')).toBe('123456789012');
    expect(applyKeypadKey('12345678901', '000')).toBe('123456789010');
  });
});

describe('createTx', () => {
  it('membuat transaksi masuk/keluar valid dengan nominal integer positif', () => {
    const now = new Date(2026, 10, 22, 14, 30, 0);
    const tx = createTx(
      {
        kind: 'out',
        amount: 25000,
        accountId: 'acc-bca',
        categoryId: 'cat-out-1',
        note: '  Nasi padang  ',
        date: '2026-11-22',
      },
      now,
    );

    expect(tx).not.toBeNull();
    expect(tx?.amount).toBe(25000);
    expect(tx?.note).toBe('Nasi padang');
    expect(tx?.createdAt).toBe(now.getTime());
    expect(tx?.id.length).toBeGreaterThan(0);
  });

  it('menolak nominal nol, negatif, float, atau field wajib kosong', () => {
    const base = {
      kind: 'out' as const,
      amount: 25000,
      accountId: 'acc-bca',
      categoryId: 'cat-out-1',
      note: '',
      date: '2026-11-22',
    };

    expect(createTx({ ...base, amount: 0 })).toBeNull();
    expect(createTx({ ...base, amount: -1000 })).toBeNull();
    expect(createTx({ ...base, amount: 12.5 })).toBeNull();
    expect(createTx({ ...base, accountId: '' })).toBeNull();
    expect(createTx({ ...base, categoryId: '' })).toBeNull();
    expect(createTx({ ...base, date: '2026-02-31' })).toBeNull();
  });
});

describe('updateTx', () => {
  it('memperbarui transaksi dengan mempertahankan id dan createdAt', () => {
    const existing = {
      id: 'tx-1',
      kind: 'out' as const,
      amount: 25000,
      accountId: 'acc-bca',
      categoryId: 'cat-out-1',
      note: 'Lama',
      date: '2026-11-20',
      createdAt: 1700000000000,
    };

    const updated = updateTx(existing, {
      kind: 'in',
      amount: 50000,
      accountId: 'acc-dana',
      categoryId: 'cat-in-1',
      note: '  Baru  ',
      date: '2026-11-22',
    });

    expect(updated).toEqual({
      id: 'tx-1',
      kind: 'in',
      amount: 50000,
      accountId: 'acc-dana',
      categoryId: 'cat-in-1',
      note: 'Baru',
      date: '2026-11-22',
      createdAt: 1700000000000,
    });
  });

  it('menolak pembaruan dengan input invalid', () => {
    const existing = {
      id: 'tx-1',
      kind: 'out' as const,
      amount: 25000,
      accountId: 'acc-bca',
      categoryId: 'cat-out-1',
      note: '',
      date: '2026-11-20',
      createdAt: 100,
    };

    expect(
      updateTx(existing, {
        kind: 'out',
        amount: 0,
        accountId: 'acc-bca',
        categoryId: 'cat-out-1',
        note: '',
        date: '2026-11-20',
      }),
    ).toBeNull();
    expect(
      updateTx(existing, {
        kind: 'out',
        amount: 10000,
        accountId: 'acc-bca',
        categoryId: 'cat-out-1',
        note: '',
        date: '2026-02-30',
      }),
    ).toBeNull();
  });
});
