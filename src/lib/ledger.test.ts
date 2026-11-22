import { describe, expect, it } from 'vitest';
import {
  accountBalance,
  accountMonogram,
  groupByDay,
  recentTransactions,
  totalBalance,
  txsInMonth,
} from './ledger';
import { updateTx } from './tx';
import type { Account, Tx } from './types';

const bca: Account = { id: 'acc-bca', name: 'BCA', type: 'bank', initialBalance: 5000000, archived: false };
const dana: Account = { id: 'acc-dana', name: 'DANA', type: 'ewallet', initialBalance: 100000, archived: false };
const cc: Account = { id: 'acc-cc', name: 'Kartu Kredit', type: 'credit', initialBalance: -500000, archived: false };
const lama: Account = { id: 'acc-lama', name: 'Bank Lama', type: 'bank', initialBalance: 999000, archived: true };

describe('ledger', () => {
  it('menghitung saldo awal saat belum ada transaksi', () => {
    expect(accountBalance(bca, [])).toBe(5000000);
    expect(accountBalance(cc, [])).toBe(-500000);
    expect(totalBalance([bca, dana, cc], [])).toBe(4600000);
  });

  it('menghitung saldo per rekening untuk masuk, keluar, transfer, dan kredit negatif', () => {
    const txs: Tx[] = [
      { id: '1', kind: 'in', amount: 8500000, accountId: 'acc-bca', categoryId: 'cat-in-1', note: 'Gaji', date: '2026-11-01', createdAt: 100 },
      { id: '2', kind: 'out', amount: 250000, accountId: 'acc-bca', categoryId: 'cat-out-1', note: 'Belanja', date: '2026-11-02', createdAt: 200 },
      { id: '3', kind: 'transfer', amount: 500000, accountId: 'acc-bca', toAccountId: 'acc-dana', note: 'Top up', date: '2026-11-03', createdAt: 300 },
      { id: '4', kind: 'out', amount: 300000, accountId: 'acc-cc', categoryId: 'cat-out-2', note: 'Tiket', date: '2026-11-04', createdAt: 400 },
      { id: '5', kind: 'transfer', amount: 200000, accountId: 'acc-bca', toAccountId: 'acc-cc', note: 'Bayar CC', date: '2026-11-05', createdAt: 500 },
    ];

    // BCA: 5jt + 8,5jt - 250rb - 500rb - 200rb = 12.550.000
    expect(accountBalance(bca, txs)).toBe(12550000);
    // DANA: 100rb + 500rb = 600.000
    expect(accountBalance(dana, txs)).toBe(600000);
    // CC: -500rb - 300rb + 200rb = -600.000
    expect(accountBalance(cc, txs)).toBe(-600000);
    // Total aktif: 12.550.000 + 600.000 - 600.000 = 12.550.000 (rekening arsip tidak dihitung)
    expect(totalBalance([bca, dana, cc, lama], txs)).toBe(12550000);
  });

  it('mengambil 5 mutasi terakhir urut tanggal lalu waktu pembuatan terbaru', () => {
    const txs: Tx[] = [
      { id: 'a', kind: 'out', amount: 10000, accountId: 'acc-bca', categoryId: 'c', note: '', date: '2026-11-10', createdAt: 900 },
      { id: 'b', kind: 'out', amount: 20000, accountId: 'acc-bca', categoryId: 'c', note: '', date: '2026-11-22', createdAt: 100 },
      { id: 'c', kind: 'out', amount: 30000, accountId: 'acc-bca', categoryId: 'c', note: '', date: '2026-11-22', createdAt: 300 },
      { id: 'd', kind: 'out', amount: 40000, accountId: 'acc-bca', categoryId: 'c', note: '', date: '2026-11-21', createdAt: 200 },
      { id: 'e', kind: 'out', amount: 50000, accountId: 'acc-bca', categoryId: 'c', note: '', date: '2026-11-20', createdAt: 400 },
      { id: 'f', kind: 'out', amount: 60000, accountId: 'acc-bca', categoryId: 'c', note: '', date: '2026-11-19', createdAt: 500 },
    ];

    expect(recentTransactions(txs).map((t) => t.id)).toEqual(['c', 'b', 'd', 'e', 'f']);
    expect(recentTransactions([])).toEqual([]);
  });

  it('menghasilkan monogram rekening sesuai spesifikasi default dan fallback', () => {
    expect(accountMonogram('Tunai')).toBe('TN');
    expect(accountMonogram('BCA')).toBe('BC');
    expect(accountMonogram('Mandiri')).toBe('MD');
    expect(accountMonogram('Jenius')).toBe('JN');
    expect(accountMonogram('DANA')).toBe('DA');
    expect(accountMonogram('Bank Jago')).toBe('BJ');
  });

  it('menyaring transaksi berdasarkan bulan YYYY-MM', () => {
    const txs: Tx[] = [
      { id: '1', kind: 'out', amount: 20000, accountId: 'acc-bca', categoryId: 'c', note: '', date: '2026-10-31', createdAt: 100 },
      { id: '2', kind: 'out', amount: 30000, accountId: 'acc-bca', categoryId: 'c', note: '', date: '2026-11-01', createdAt: 200 },
      { id: '3', kind: 'in', amount: 50000, accountId: 'acc-bca', categoryId: 'c', note: '', date: '2026-11-22', createdAt: 300 },
    ];

    expect(txsInMonth(txs, '2026-11').map((t) => t.id)).toEqual(['2', '3']);
    expect(txsInMonth(txs, '2026-12')).toEqual([]);
    expect(txsInMonth(txs, 'invalid')).toEqual([]);
  });

  it('mengelompokkan transaksi per tanggal dengan urutan terbaru dan total harian akurat', () => {
    expect(groupByDay([])).toEqual([]);

    const txs: Tx[] = [
      { id: '1', kind: 'out', amount: 25000, accountId: 'acc-bca', categoryId: 'c1', note: 'Makan', date: '2026-11-20', createdAt: 100 },
      { id: '2', kind: 'out', amount: 15000, accountId: 'acc-bca', categoryId: 'c1', note: 'Kopi', date: '2026-11-22', createdAt: 100 },
      { id: '3', kind: 'in', amount: 100000, accountId: 'acc-bca', categoryId: 'c2', note: 'Bonus', date: '2026-11-22', createdAt: 300 },
      { id: '4', kind: 'transfer', amount: 500000, accountId: 'acc-bca', toAccountId: 'acc-dana', note: 'Top up', date: '2026-11-22', createdAt: 200 },
      { id: '5', kind: 'transfer', amount: 200000, accountId: 'acc-bca', toAccountId: 'acc-dana', note: 'Pindah', date: '2026-11-21', createdAt: 400 },
    ];

    const groups = groupByDay(txs);
    expect(groups.map((g) => g.date)).toEqual(['2026-11-22', '2026-11-21', '2026-11-20']);

    // 22 Nov: urut createdAt terbaru (3, 4, 2); transfer tidak masuk total harian
    expect(groups[0]?.txs.map((t) => t.id)).toEqual(['3', '4', '2']);
    expect(groups[0]?.totalIn).toBe(100000);
    expect(groups[0]?.totalOut).toBe(15000);
    expect(groups[0]?.net).toBe(85000);

    // 21 Nov: hanya transfer -> tetap tampil, total harian 0
    expect(groups[1]?.txs.map((t) => t.id)).toEqual(['5']);
    expect(groups[1]?.totalIn).toBe(0);
    expect(groups[1]?.totalOut).toBe(0);
    expect(groups[1]?.net).toBe(0);

    // 20 Nov: pengeluaran 25rb -> net -25rb
    expect(groups[2]?.totalIn).toBe(0);
    expect(groups[2]?.totalOut).toBe(25000);
    expect(groups[2]?.net).toBe(-25000);
  });

  it('mengubah atau menghapus transaksi langsung memperbarui saldo rekening', () => {
    const initial: Tx = {
      id: 'tx-1',
      kind: 'out',
      amount: 100000,
      accountId: 'acc-bca',
      categoryId: 'c1',
      note: 'Makan',
      date: '2026-11-22',
      createdAt: 100,
    };
    const txs = [initial];
    expect(accountBalance(bca, txs)).toBe(4900000);

    // Edit nominal & pindah ke DANA
    const edited = updateTx(initial, {
      kind: 'out',
      amount: 40000,
      accountId: 'acc-dana',
      categoryId: 'c1',
      note: 'Makan siang',
      date: '2026-11-22',
    });
    expect(edited).not.toBeNull();
    const afterEdit = edited ? [edited] : txs;
    expect(accountBalance(bca, afterEdit)).toBe(5000000);
    expect(accountBalance(dana, afterEdit)).toBe(60000);

    // Hapus transaksi -> saldo kembali ke awal
    expect(accountBalance(dana, [])).toBe(100000);
  });
});
