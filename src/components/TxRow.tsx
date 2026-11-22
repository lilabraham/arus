import { groupColorToken, monogram } from '../lib/category';
import { formatShortDate } from '../lib/date';
import { formatRp, MASKED_RP } from '../lib/money';
import type { Account, Category, Tx } from '../lib/types';

interface TxRowProps {
  tx: Tx;
  category?: Category;
  account?: Account;
  toAccount?: Account;
  groups: readonly string[];
  hide: boolean;
  isNew: boolean;
  showDate: boolean;
  onSelect: (tx: Tx) => void;
}

export function TxRow({
  tx,
  category,
  account,
  toAccount,
  groups,
  hide,
  isNew,
  showDate,
  onSelect,
}: TxRowProps) {
  const title =
    tx.kind === 'transfer'
      ? `Transfer → ${toAccount?.name ?? 'Rekening'}`
      : (category?.name ?? 'Transaksi');
  const meta = [showDate ? formatShortDate(tx.date) : '', account?.name, tx.note]
    .filter(Boolean)
    .join(' · ');
  const code = tx.kind === 'in' ? 'CR' : tx.kind === 'out' ? 'DB' : 'TR';
  const sign = tx.kind === 'in' ? '+' : tx.kind === 'out' ? '−' : '';
  const badgeColor =
    tx.kind === 'transfer'
      ? 'var(--brand)'
      : category
        ? groupColorToken(category.group, groups)
        : 'var(--cat-8)';
  const amountTone =
    tx.kind === 'in'
      ? ' tx-row__amount--in'
      : tx.kind === 'out'
        ? ' tx-row__amount--out'
        : '';

  return (
    <li className={`tx-row${isNew ? ' tx-row--new' : ''}`}>
      <button type="button" className="tx-row__btn" onClick={() => onSelect(tx)}>
        <span className="cat-badge" style={{ background: badgeColor }}>
          {tx.kind === 'transfer' ? 'TR' : monogram(category?.name ?? 'TX')}
        </span>
        <span className="tx-row__info">
          <span className="tx-row__title">{title}</span>
          {meta && <span className="tx-row__meta num">{meta}</span>}
        </span>
        <span className={`tx-row__amount num${amountTone}`}>
          <span>{hide ? MASKED_RP : `${sign}${formatRp(tx.amount)}`}</span>
          <span className="tx-row__code">{code}</span>
        </span>
      </button>
    </li>
  );
}
