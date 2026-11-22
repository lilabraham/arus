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

export interface NewTxInput {
  kind: 'in' | 'out';
  amount: number;
  accountId: Id;
  categoryId: Id;
  note: string;
  date: string;
}

export function createTx(input: NewTxInput, now: Date = new Date()): Tx | null {
  if (!Number.isSafeInteger(input.amount) || input.amount <= 0) return null;
  if (!input.accountId || !input.categoryId) return null;
  if (!isValidDateStr(input.date)) return null;

  return {
    id: crypto.randomUUID(),
    kind: input.kind,
    amount: input.amount,
    accountId: input.accountId,
    categoryId: input.categoryId,
    note: input.note.trim(),
    date: input.date,
    createdAt: now.getTime(),
  };
}
