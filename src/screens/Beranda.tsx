import { Icon } from '../components/Icon';
import { TxRow } from '../components/TxRow';
import { categoryGroups } from '../lib/category';
import {
  ACCOUNT_TYPE_LABEL,
  accountBalance,
  accountMonogram,
  recentTransactions,
  totalBalance,
} from '../lib/ledger';
import { formatRp, formatRpCompact, MASKED_RP } from '../lib/money';
import type { Db, Tx, TxKind } from '../lib/types';
import './Beranda.css';

interface BerandaProps {
  db: Db;
  lastSavedId: string | null;
  onToggleHide: () => void;
  onQuickAdd: (kind: TxKind) => void;
  onSelectTx: (tx: Tx) => void;
}

export function Beranda({ db, lastSavedId, onToggleHide, onQuickAdd, onSelectTx }: BerandaProps) {
  const hide = db.prefs.hideBalance;
  const total = totalBalance(db.accounts, db.txs);
  const activeAccounts = db.accounts.filter((a) => !a.archived);
  const accountById = new Map(db.accounts.map((a) => [a.id, a]));
  const categoryById = new Map(db.categories.map((c) => [c.id, c]));
  const outGroups = categoryGroups(db.categories, 'out');
  const inGroups = categoryGroups(db.categories, 'in');
  const latest = recentTransactions(db.txs, 5);

  return (
    <>
      <section className="beranda-hero" aria-label="Ringkasan saldo">
        <div className="beranda-hero__balance-block">
          <div className="beranda-hero__label-row">
            <span className="beranda-hero__label">Total saldo</span>
            <button
              type="button"
              className="beranda-hero__eye"
              onClick={onToggleHide}
              aria-label={hide ? 'Tampilkan saldo' : 'Sembunyikan saldo'}
              aria-pressed={hide}
            >
              <Icon name={hide ? 'eyeOff' : 'eye'} />
            </button>
          </div>
          <p className="beranda-hero__amount num">{hide ? MASKED_RP : formatRp(total)}</p>
        </div>

        <div className="quick-menu" role="group" aria-label="Menu cepat">
          <button type="button" className="quick-menu__btn" onClick={() => onQuickAdd('out')}>
            <span className="quick-menu__icon">
              <Icon name="out" />
            </span>
            <span>Keluar</span>
          </button>
          <button type="button" className="quick-menu__btn" onClick={() => onQuickAdd('in')}>
            <span className="quick-menu__icon">
              <Icon name="in" />
            </span>
            <span>Masuk</span>
          </button>
          <button
            type="button"
            className="quick-menu__btn"
            onClick={() => onQuickAdd('transfer')}
          >
            <span className="quick-menu__icon">
              <Icon name="transfer" />
            </span>
            <span>Transfer</span>
          </button>
          <a href="#/anggaran" className="quick-menu__btn">
            <span className="quick-menu__icon">
              <Icon name="anggaran" />
            </span>
            <span>Anggaran</span>
          </a>
        </div>
      </section>

      <div className="beranda-body">
        <section className="tx-section" aria-label="Daftar rekening">
          <div className="section-head">
            <h2 className="section-head__title">Rekening</h2>
            <a href="#/atur" className="section-head__link">
              Lihat semua
            </a>
          </div>

          <div className="account-strip">
            {activeAccounts.map((acc) => {
              const bal = accountBalance(acc, db.txs);
              return (
                <a
                  key={acc.id}
                  href={`#/mutasi?account=${encodeURIComponent(acc.id)}`}
                  className="account-card"
                >
                  <div className="account-card__top">
                    <span className="acc-badge">{accountMonogram(acc.name)}</span>
                    <span className="account-card__type">{ACCOUNT_TYPE_LABEL[acc.type]}</span>
                  </div>
                  <span className="account-card__name">{acc.name}</span>
                  <span
                    className={`account-card__bal num${
                      !hide && bal < 0 ? ' account-card__bal--neg' : ''
                    }`}
                  >
                    {hide ? MASKED_RP : formatRpCompact(bal)}
                  </span>
                </a>
              );
            })}
          </div>
        </section>

        <section className="tx-section" aria-label="Mutasi terakhir">
          <div className="section-head">
            <h2 className="section-head__title">Mutasi terakhir</h2>
            {latest.length > 0 && (
              <a href="#/mutasi" className="section-head__link">
                Lihat semua
              </a>
            )}
          </div>

          {latest.length === 0 ? (
            <div className="empty-card">
              <h3 className="empty-card__title">Belum ada mutasi</h3>
              <p className="empty-card__desc">
                Ketuk Keluar, Masuk, atau tombol + di bawah untuk mencatat transaksi pertama.
              </p>
            </div>
          ) : (
            <ul className="tx-list">
              {latest.map((tx) => (
                <TxRow
                  key={tx.id}
                  tx={tx}
                  category={tx.categoryId ? categoryById.get(tx.categoryId) : undefined}
                  account={accountById.get(tx.accountId)}
                  toAccount={tx.toAccountId ? accountById.get(tx.toAccountId) : undefined}
                  groups={tx.kind === 'in' ? inGroups : outGroups}
                  hide={hide}
                  isNew={lastSavedId === tx.id}
                  showDate
                  onSelect={onSelectTx}
                />
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}
