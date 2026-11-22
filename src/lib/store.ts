import { createDefaultDb } from './defaults';
import type { Db } from './types';

// ponytail: localStorage dibatasi ~5 MB (~20 ribu transaksi). Pindah ke IndexedDB jika mendekati batas.
export const DB_KEY = 'arus:db';
export const CORRUPT_KEY = 'arus:corrupt';

export type StorageLike = Pick<Storage, 'getItem' | 'setItem'>;

interface PersistNavigator {
  storage?: { persist?: () => Promise<boolean> };
}

const listeners = new Set<() => void>();
let currentDb: Db | null = null;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function migrate(raw: unknown): Db | null {
  if (!isRecord(raw)) return null;
  if (raw.version !== 1) return null;
  if (
    !Array.isArray(raw.accounts) ||
    !Array.isArray(raw.categories) ||
    !Array.isArray(raw.txs) ||
    !Array.isArray(raw.budgets)
  ) {
    return null;
  }
  if (!isRecord(raw.prefs) || typeof raw.prefs.hideBalance !== 'boolean') {
    return null;
  }
  return raw as unknown as Db;
}

function defaultStorage(): StorageLike | null {
  try {
    return typeof localStorage === 'undefined' ? null : localStorage;
  } catch {
    return null;
  }
}

export function requestPersist(nav?: PersistNavigator): void {
  const storage = (nav ?? (typeof navigator === 'undefined' ? undefined : navigator))?.storage;
  if (typeof storage?.persist === 'function') {
    void storage.persist().catch(() => {});
  }
}

export function load(storage: StorageLike | null = defaultStorage()): Db {
  if (!storage) return createDefaultDb();

  let raw: string | null;
  try {
    raw = storage.getItem(DB_KEY);
  } catch {
    return createDefaultDb();
  }
  if (!raw) return createDefaultDb();

  try {
    const parsed: unknown = JSON.parse(raw);
    const db = migrate(parsed);
    if (db) return db;
  } catch {
    // JSON rusak; tangani di bawah tanpa menimpa DB_KEY
  }

  try {
    storage.setItem(CORRUPT_KEY, raw);
  } catch {
    // Abaikan jika storage penuh atau diblokir
  }
  return createDefaultDb();
}

export function save(db: Db, storage: StorageLike | null = defaultStorage()): void {
  if (!storage) return;
  storage.setItem(DB_KEY, JSON.stringify(db));
}

export function getDb(): Db {
  if (!currentDb) {
    requestPersist();
    currentDb = load();
  }
  return currentDb;
}

export function setDb(next: Db): void {
  save(next);
  currentDb = next;
  for (const fn of listeners) fn();
}

export function updateDb(fn: (db: Db) => Db): void {
  setDb(fn(getDb()));
}

export function subscribeDb(cb: () => void): () => void {
  listeners.add(cb);
  return () => listeners.delete(cb);
}
