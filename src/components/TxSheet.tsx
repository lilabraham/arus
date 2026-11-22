import { useEffect, useRef, useState } from 'react';
import {
  categoryGroups,
  filterCategories,
  groupColorToken,
  monogram,
  recentCategoryIds,
} from '../lib/category';
import { isValidDateStr, todayLocal } from '../lib/date';
import { formatRp } from '../lib/money';
import { applyKeypadKey, createTx, updateTx, type KeypadKey } from '../lib/tx';
import type { Category, CategoryKind, Db, Id, Tx, TxKind } from '../lib/types';
import { Icon } from './Icon';
import { Keypad } from './Keypad';
import './TxSheet.css';

interface TxSheetProps {
  db: Db;
  initialKind?: TxKind;
  editingTx?: Tx;
  onSave: (tx: Tx) => void;
  onDelete?: (id: Id) => void;
  onClose: () => void;
}

function pickInitialCategory(db: Db, kind: CategoryKind): Id {
  const active = db.categories.filter((c) => !c.archived && c.kind === kind);
  const recent = recentCategoryIds(db.txs, kind, 1)[0];
  if (recent && active.some((c) => c.id === recent)) return recent;
  return active[0]?.id ?? '';
}

function pickInitialAccount(db: Db): Id {
  const active = db.accounts.filter((a) => !a.archived);
  const latest = [...db.txs].sort((a, b) => b.createdAt - a.createdAt)[0];
  if (latest && active.some((a) => a.id === latest.accountId)) return latest.accountId;
  return active[0]?.id ?? '';
}

function pickInitialToAccount(db: Db, fromId: Id): Id {
  return db.accounts.find((a) => !a.archived && a.id !== fromId)?.id ?? '';
}

export function TxSheet({
  db,
  initialKind = 'out',
  editingTx,
  onSave,
  onDelete,
  onClose,
}: TxSheetProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const startKind: TxKind = editingTx ? editingTx.kind : initialKind;
  const [kind, setKind] = useState<TxKind>(startKind);
  const [digits, setDigits] = useState(() => (editingTx ? String(editingTx.amount) : ''));
  const [categoryId, setCategoryId] = useState<Id>(
    () => editingTx?.categoryId ?? pickInitialCategory(db, startKind === 'in' ? 'in' : 'out'),
  );
  const [accountId, setAccountId] = useState<Id>(
    () => editingTx?.accountId ?? pickInitialAccount(db),
  );
  const [toAccountId, setToAccountId] = useState<Id>(
    () =>
      editingTx?.toAccountId ??
      pickInitialToAccount(db, editingTx?.accountId ?? pickInitialAccount(db)),
  );
  const [date, setDate] = useState(() => editingTx?.date ?? todayLocal());
  const [note, setNote] = useState(() => editingTx?.note ?? '');
  const [pickingCategory, setPickingCategory] = useState(false);
  const [search, setSearch] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    const el = dialogRef.current;
    if (el && !el.open) el.showModal();
  }, []);

  const isTransfer = kind === 'transfer';
  const catKind: CategoryKind = kind === 'in' ? 'in' : 'out';
  const accountOptions = db.accounts.filter(
    (a) => !a.archived || a.id === accountId || a.id === toAccountId,
  );
  const activeForKind = db.categories.filter((c) => !c.archived && c.kind === catKind);
  const allGroups = categoryGroups(db.categories, catKind);

  const recentIds = recentCategoryIds(db.txs, catKind, 6);
  const recentCats = recentIds
    .map((id) => activeForKind.find((c) => c.id === id))
    .filter((c): c is Category => c !== undefined);

  // Quick strip: kategori terakhir dipakai paling kiri, lalu sisanya sampai 5 item
  const quickCats: Category[] = [...recentCats];
  for (const cat of activeForKind) {
    if (quickCats.length >= 5) break;
    if (!quickCats.some((q) => q.id === cat.id)) quickCats.push(cat);
  }

  const selectedCat =
    db.categories.find((c) => c.id === categoryId && c.kind === catKind) ?? activeForKind[0];
  const amount = digits ? Number(digits) : 0;
  const sameAccount = isTransfer && Boolean(accountId) && accountId === toAccountId;
  const missingDest = isTransfer && !toAccountId;
  const canSubmit =
    amount > 0 &&
    Boolean(accountId) &&
    isValidDateStr(date) &&
    (isTransfer ? Boolean(toAccountId) && !sameAccount : Boolean(selectedCat));

  function selectCategory(id: Id) {
    setCategoryId(id);
    setPickingCategory(false);
    setSearch('');
  }

  function switchKind(next: TxKind) {
    if (next === kind) return;
    setKind(next);
    setConfirmDelete(false);
    if (next === 'transfer') {
      setPickingCategory(false);
      setSearch('');
      if (!toAccountId || toAccountId === accountId) {
        setToAccountId(pickInitialToAccount(db, accountId));
      }
      return;
    }
    const nextCat =
      editingTx && editingTx.kind === next && editingTx.categoryId
        ? editingTx.categoryId
        : pickInitialCategory(db, next);
    setCategoryId(nextCat);
    setSearch('');
  }

  function handleKeypad(key: KeypadKey) {
    setConfirmDelete(false);
    setDigits((prev) => applyKeypadKey(prev, key));
  }

  function handleSubmit() {
    if (kind === 'transfer') {
      const input = {
        kind: 'transfer' as const,
        amount,
        accountId,
        toAccountId,
        note,
        date,
      };
      const tx = editingTx ? updateTx(editingTx, input) : createTx(input);
      if (tx) onSave(tx);
      return;
    }
    if (!selectedCat) return;
    const input = {
      kind,
      amount,
      accountId,
      categoryId: selectedCat.id,
      note,
      date,
    };
    const tx = editingTx ? updateTx(editingTx, input) : createTx(input);
    if (tx) onSave(tx);
  }

  function handleDialogKeyDown(e: React.KeyboardEvent<HTMLDialogElement>) {
    const tag = (e.target as HTMLElement).tagName;
    if (tag === 'INPUT' || tag === 'SELECT') {
      if (e.key === 'Enter' && tag === 'INPUT' && !pickingCategory && !confirmDelete && canSubmit) {
        e.preventDefault();
        handleSubmit();
      }
      return;
    }
    if (pickingCategory || confirmDelete) return;

    if (e.key >= '0' && e.key <= '9') {
      e.preventDefault();
      handleKeypad(e.key as KeypadKey);
    } else if (e.key === 'Backspace') {
      e.preventDefault();
      handleKeypad('back');
    } else if (e.key === 'Delete') {
      e.preventDefault();
      handleKeypad('clear');
    } else if (e.key === 'Enter' && tag !== 'BUTTON' && tag !== 'A' && canSubmit) {
      e.preventDefault();
      handleSubmit();
    }
  }

  const filteredCats = isTransfer ? [] : filterCategories(db.categories, catKind, search);
  const grouped = new Map<string, Category[]>();
  for (const cat of filteredCats) {
    const list = grouped.get(cat.group) ?? [];
    list.push(cat);
    grouped.set(cat.group, list);
  }
  const pickerSections: [string, Category[]][] = [
    ...(!search.trim() && recentCats.length > 0 ? [['Terakhir dipakai', recentCats] as [string, Category[]]] : []),
    ...grouped.entries(),
  ];

  const sign = kind === 'in' ? '+' : kind === 'out' ? '−' : '';

  return (
    <dialog
      ref={dialogRef}
      className="sheet"
      aria-label={editingTx ? 'Ubah transaksi' : 'Catat transaksi'}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      onKeyDown={handleDialogKeyDown}
    >
      <div className="sheet__body">
        <div className="sheet__head">
          <div className="kind-tabs" role="group" aria-label="Jenis transaksi">
            <button
              type="button"
              className="kind-tabs__btn kind-tabs__btn--out"
              aria-pressed={kind === 'out'}
              onClick={() => switchKind('out')}
            >
              − Keluar
            </button>
            <button
              type="button"
              className="kind-tabs__btn kind-tabs__btn--in"
              aria-pressed={kind === 'in'}
              onClick={() => switchKind('in')}
            >
              + Masuk
            </button>
            <button
              type="button"
              className="kind-tabs__btn kind-tabs__btn--transfer"
              aria-pressed={kind === 'transfer'}
              onClick={() => switchKind('transfer')}
            >
              ⇄ Transfer
            </button>
          </div>
          <button type="button" className="sheet__close" onClick={onClose} aria-label="Tutup">
            <Icon name="close" />
          </button>
        </div>

        <button
          type="button"
          className={`sheet__amount-btn num ${
            amount === 0 ? 'sheet__amount-btn--empty' : `sheet__amount-btn--${kind}`
          }`}
          onClick={() => setPickingCategory(false)}
          aria-label="Nominal transaksi"
        >
          {amount === 0 ? 'Rp0' : `${sign}${formatRp(amount)}`}
        </button>

        {!isTransfer && pickingCategory ? (
          <div className="cat-picker">
            <div className="cat-picker__bar">
              <label className="cat-picker__search-wrap">
                <Icon name="search" />
                <input
                  type="search"
                  className="cat-picker__search"
                  placeholder="Cari kategori atau kelompok…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  autoFocus
                />
              </label>
              <button
                type="button"
                className="cat-picker__back"
                onClick={() => {
                  setPickingCategory(false);
                  setSearch('');
                }}
              >
                Keypad
              </button>
            </div>

            <div className="cat-picker__list">
              {pickerSections.map(([sectionTitle, cats]) => (
                <div key={sectionTitle}>
                  <p className="cat-picker__group-title">{sectionTitle}</p>
                  <div className="cat-picker__items">
                    {cats.map((cat) => (
                      <button
                        key={`${sectionTitle}-${cat.id}`}
                        type="button"
                        className="cat-picker__item"
                        aria-pressed={selectedCat?.id === cat.id}
                        onClick={() => selectCategory(cat.id)}
                      >
                        <span
                          className="cat-badge"
                          style={{ background: groupColorToken(cat.group, allGroups) }}
                        >
                          {monogram(cat.name)}
                        </span>
                        <span>{cat.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}

              {filteredCats.length === 0 && (
                <p className="cat-picker__empty">Kategori &ldquo;{search}&rdquo; tidak ditemukan.</p>
              )}
            </div>
          </div>
        ) : (
          <>
            {isTransfer ? (
              <>
                <div className="sheet__row">
                  <label className="sheet__select-wrap">
                    <span className="sheet__select-label">Dari</span>
                    <select
                      className="sheet__field"
                      value={accountId}
                      onChange={(e) => setAccountId(e.target.value)}
                    >
                      {accountOptions.map((acc) => (
                        <option key={acc.id} value={acc.id}>
                          {acc.name}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="sheet__select-wrap">
                    <span className="sheet__select-label">Ke</span>
                    <select
                      className="sheet__field"
                      value={toAccountId}
                      onChange={(e) => setToAccountId(e.target.value)}
                    >
                      {accountOptions.map((acc) => (
                        <option key={acc.id} value={acc.id}>
                          {acc.name}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                {(sameAccount || missingDest) && (
                  <p className="sheet__error" role="alert">
                    {sameAccount
                      ? 'Rekening asal dan tujuan harus berbeda.'
                      : 'Minimal perlu dua rekening aktif untuk transfer.'}
                  </p>
                )}
              </>
            ) : (
              <>
                <div className="sheet__row">
                  <button
                    type="button"
                    className="sheet__field sheet__field-btn"
                    onClick={() => setPickingCategory(true)}
                    aria-label="Pilih kategori"
                  >
                    {selectedCat && (
                      <span
                        className="cat-badge"
                        style={{ background: groupColorToken(selectedCat.group, allGroups) }}
                      >
                        {monogram(selectedCat.name)}
                      </span>
                    )}
                    <span className="sheet__field-label">{selectedCat?.name ?? 'Pilih kategori'}</span>
                  </button>

                  <select
                    className="sheet__field"
                    value={accountId}
                    onChange={(e) => setAccountId(e.target.value)}
                    aria-label="Rekening"
                  >
                    {accountOptions.map((acc) => (
                      <option key={acc.id} value={acc.id}>
                        {acc.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sheet__chips" role="group" aria-label="Kategori cepat">
                  {quickCats.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      className="sheet__chip"
                      aria-pressed={selectedCat?.id === cat.id}
                      onClick={() => setCategoryId(cat.id)}
                    >
                      {cat.name}
                    </button>
                  ))}
                  <button
                    type="button"
                    className="sheet__chip sheet__chip--more"
                    onClick={() => setPickingCategory(true)}
                  >
                    Semua
                  </button>
                </div>
              </>
            )}

            <div className="sheet__row">
              <input
                type="date"
                className="sheet__field num"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                aria-label="Tanggal transaksi"
              />
              <input
                type="text"
                className="sheet__field"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Catatan (opsional)"
                aria-label="Catatan"
              />
            </div>

            <Keypad onKey={handleKeypad} />

            {editingTx && onDelete ? (
              confirmDelete ? (
                <div
                  className="sheet__confirm"
                  role="alertdialog"
                  aria-label="Konfirmasi hapus transaksi"
                >
                  <span className="sheet__confirm-text">Hapus transaksi ini?</span>
                  <div className="sheet__confirm-actions">
                    <button
                      type="button"
                      className="sheet__cancel-btn"
                      onClick={() => setConfirmDelete(false)}
                    >
                      Batal
                    </button>
                    <button
                      type="button"
                      className="sheet__danger-btn"
                      onClick={() => onDelete(editingTx.id)}
                    >
                      Ya, hapus
                    </button>
                  </div>
                </div>
              ) : (
                <div className="sheet__actions">
                  <button
                    type="button"
                    className="sheet__delete-btn"
                    onClick={() => setConfirmDelete(true)}
                  >
                    Hapus
                  </button>
                  <button
                    type="button"
                    className="sheet__submit"
                    disabled={!canSubmit}
                    onClick={handleSubmit}
                  >
                    Simpan perubahan
                  </button>
                </div>
              )
            ) : (
              <button
                type="button"
                className="sheet__submit"
                disabled={!canSubmit}
                onClick={handleSubmit}
              >
                Simpan
              </button>
            )}
          </>
        )}
      </div>
    </dialog>
  );
}
