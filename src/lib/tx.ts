import { isValidDateStr } from './date';
import type { Id, Tx } from './types';

const MAX_DIGITS = 12;

export type KeypadKey = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '000' | 'back' | 'clear';

export function applyKeypadKey(digits: string, key: KeypadKey): string {
  if (key === 'clear') return '';
  if (key === 'back') return digits.slice(0, -1);
  if (digits === '' && (key === '0' || key === '000')) return '';
  return (digits + key).slice(0, MAX_DIGITS);
}

export type TxInput =
  | {
      kind: 'in' | 'out';
      amount: number;
      accountId: Id;
      categoryId: Id;
      note: string;
      date: string;
    }
  | {
      kind: 'transfer';
      amount: number;
      accountId: Id;
      toAccountId: Id;
      note: string;
      date: string;
    };

function buildTx(id: Id, createdAt: number, input: TxInput): Tx | null {
  if (!Number.isSafeInteger(input.amount) || input.amount <= 0) return null;
  if (!input.accountId || !isValidDateStr(input.date)) return null;

  if (input.kind === 'transfer') {
    if (!input.toAccountId || input.toAccountId === input.accountId) return null;
    return {
      id,
      kind: 'transfer',
      amount: input.amount,
      accountId: input.accountId,
      toAccountId: input.toAccountId,
      note: input.note.trim(),
      date: input.date,
      createdAt,
    };
  }

  if (!input.categoryId) return null;
  return {
    id,
    kind: input.kind,
    amount: input.amount,
    accountId: input.accountId,
    categoryId: input.categoryId,
    note: input.note.trim(),
    date: input.date,
    createdAt,
  };
}

export function createTx(input: TxInput, now: Date = new Date()): Tx | null {
  return buildTx(crypto.randomUUID(), now.getTime(), input);
}

export function updateTx(existing: Tx, input: TxInput): Tx | null {
  return buildTx(existing.id, existing.createdAt, input);
}
