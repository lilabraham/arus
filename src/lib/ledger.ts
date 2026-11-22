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

export function recentTransactions(txs: readonly Tx[], limit = 5): Tx[] {
  return [...txs]
    .sort((a, b) => b.date.localeCompare(a.date) || b.createdAt - a.createdAt)
    .slice(0, limit);
}
