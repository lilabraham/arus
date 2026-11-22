import { useState } from 'react';
import { Icon } from '../components/Icon';
import { TxRow } from '../components/TxRow';
import { categoryGroups } from '../lib/category';
import { currentMonth, formatDayHeading, formatMonth, shiftMonth } from '../lib/date';
import { groupByDay, txsInMonth } from '../lib/ledger';
import { formatRp, MASKED_RP } from '../lib/money';
import type { Db, Tx } from '../lib/types';
import './Mutasi.css';

interface MutasiProps {
  db: Db;
  lastSavedId: string | null;
  onSelectTx: (tx: Tx) => void;
  onQuickAdd: () => void;
}

function formatDailyNet(net: number): string {
  return net > 0 ? `+${formatRp(net)}` : formatRp(net);
}

export function Mutasi({ db, lastSavedId, onSelectTx, onQuickAdd }: MutasiProps) {
  const thisMonth = currentMonth();
  const [month, setMonth] = useState(thisMonth);
  const hide = db.prefs.hideBalance;

  const accountById = new Map(db.accounts.map((a) => [a.id, a]));
  const categoryById = new Map(db.categories.map((c) => [c.id, c]));
  const outGroups = categoryGroups(db.categories, 'out');
  const inGroups = categoryGroups(db.categories, 'in');

  const days = groupByDay(txsInMonth(db.txs, month));
  const monthLabel = formatMonth(month);

  return (
    <div className="mutasi">
      <div className="month-bar" role="group" aria-label="Pilih bulan mutasi">
        <button
          type="button"
          className="month-bar__nav"
          aria-label="Bulan sebelumnya"
          onClick={() => setMonth((m) => shiftMonth(m, -1))}
        >
          <Icon name="chevronLeft" />
        </button>
        <h2 className="month-bar__label">{monthLabel}</h2>
        <button
          type="button"
          className="month-bar__nav"
          aria-label="Bulan berikutnya"
          onClick={() => setMonth((m) => shiftMonth(m, 1))}
        >
          <Icon name="chevronRight" />
        </button>
      </div>

      {days.length === 0 ? (
        <section className="empty-card" aria-label="Mutasi kosong">
          <h3 className="empty-card__title">
            {db.txs.length === 0 ? 'Belum ada mutasi' : `Tidak ada mutasi di ${monthLabel}`}
          </h3>
          <p className="empty-card__desc">
            {db.txs.length === 0
              ? 'Catat transaksi pertama supaya mutasi bulanan tampil di sini.'
              : 'Geser ke bulan lain atau catat transaksi baru.'}
          </p>
          {db.txs.length > 0 && month !== thisMonth ? (
            <button
              type="button"
              className="empty-card__action"
              onClick={() => setMonth(thisMonth)}
            >
              Ke bulan ini
            </button>
          ) : (
            <button type="button" className="empty-card__action" onClick={onQuickAdd}>
              Catat transaksi
            </button>
          )}
        </section>
      ) : (
        <div className="mutasi-days">
          {days.map((day) => {
            const heading = formatDayHeading(day.date);
            const hasCashflow = day.totalIn > 0 || day.totalOut > 0;
            const totalTone = hide
              ? ''
              : day.net > 0
                ? ' day-group__total--in'
                : day.net < 0
                  ? ' day-group__total--out'
                  : '';

            return (
              <section key={day.date} className="day-group" aria-label={heading}>
                <header className="day-group__head">
                  <h3 className="day-group__date num">{heading}</h3>
                  {hasCashflow && (
                    <span className={`day-group__total num${totalTone}`}>
                      {hide ? MASKED_RP : formatDailyNet(day.net)}
                    </span>
                  )}
                </header>
                <ul className="tx-list">
                  {day.txs.map((tx) => (
                    <TxRow
                      key={tx.id}
                      tx={tx}
                      category={tx.categoryId ? categoryById.get(tx.categoryId) : undefined}
                      account={accountById.get(tx.accountId)}
                      toAccount={tx.toAccountId ? accountById.get(tx.toAccountId) : undefined}
                      groups={tx.kind === 'in' ? inGroups : outGroups}
                      hide={hide}
                      isNew={lastSavedId === tx.id}
                      showDate={false}
                      onSelect={onSelectTx}
                    />
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
