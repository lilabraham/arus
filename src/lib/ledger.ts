import { monogram } from './category';
import type { Account, AccountType, Tx } from './types';

const DEFAULT_MONOGRAMS: Record<string, string> = {
  Tunai: 'TN',
  BCA: 'BC',
  Mandiri: 'MD',
  Jenius: 'JN',
  DANA: 'DA',
};

export const ACCOUNT_TYPE_LABEL: Record<AccountType, string> = {
  cash: 'Tunai',
  bank: 'Bank',
  ewallet: 'E-wallet',
  credit: 'Kredit',
  investment: 'Investasi',
};

export function accountMonogram(name: string): string {
  return DEFAULT_MONOGRAMS[name] ?? monogram(name);
}

export function accountBalance(account: Account, txs: readonly Tx[]): number {
  let total = account.initialBalance;
  for (const tx of txs) {
    if (tx.kind === 'in' && tx.accountId === account.id) total += tx.amount;
    if (tx.kind === 'out' && tx.accountId === account.id) total -= tx.amount;
    if (tx.kind === 'transfer') {
      if (tx.accountId === account.id) total -= tx.amount;
      if (tx.toAccountId === account.id) total += tx.amount;
    }
  }
  return total;
}

export function totalBalance(accounts: readonly Account[], txs: readonly Tx[]): number {
  let sum = 0;
  for (const account of accounts) {
    if (!account.archived) sum += accountBalance(account, txs);
  }
  return sum;
}

function byNewest(a: Tx, b: Tx): number {
  return b.date.localeCompare(a.date) || b.createdAt - a.createdAt;
}

export function recentTransactions(txs: readonly Tx[], limit = 5): Tx[] {
  return [...txs].sort(byNewest).slice(0, limit);
}

export function txsInMonth(txs: readonly Tx[], month: string): Tx[] {
  if (!/^\d{4}-\d{2}$/.test(month)) return [];
  const prefix = `${month}-`;
  return txs.filter((tx) => tx.date.startsWith(prefix));
}

export interface DayGroup {
  date: string;
  txs: Tx[];
  totalIn: number;
  totalOut: number;
  net: number;
}

export function groupByDay(txs: readonly Tx[]): DayGroup[] {
  if (txs.length === 0) return [];
  const sorted = [...txs].sort(byNewest);
  const groups: DayGroup[] = [];

  for (const tx of sorted) {
    let group = groups[groups.length - 1];
    if (!group || group.date !== tx.date) {
      group = { date: tx.date, txs: [], totalIn: 0, totalOut: 0, net: 0 };
      groups.push(group);
    }
    group.txs.push(tx);
    if (tx.kind === 'in') group.totalIn += tx.amount;
    if (tx.kind === 'out') group.totalOut += tx.amount;
    group.net = group.totalIn - group.totalOut;
  }

  return groups;
}
