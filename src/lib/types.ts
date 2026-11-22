export type Id = string;

export type AccountType = 'cash' | 'bank' | 'ewallet' | 'credit' | 'investment';

export interface Account {
  id: Id;
  name: string;
  type: AccountType;
  initialBalance: number;
  archived: boolean;
}

export type CategoryKind = 'in' | 'out';

export interface Category {
  id: Id;
  name: string;
  kind: CategoryKind;
  group: string;
  archived: boolean;
}

export type TxKind = 'in' | 'out' | 'transfer';

export interface Tx {
  id: Id;
  kind: TxKind;
  amount: number;
  accountId: Id;
  toAccountId?: Id;
  categoryId?: Id;
  note: string;
  date: string;
  createdAt: number;
}

export interface Budget {
  month: string;
  target: string;
  limit: number;
}

export interface Db {
  version: 1;
  accounts: Account[];
  categories: Category[];
  txs: Tx[];
  budgets: Budget[];
  prefs: { hideBalance: boolean };
}
