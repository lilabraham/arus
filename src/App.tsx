import { useState, useSyncExternalStore } from 'react';
import { Icon, type IconName } from './components/Icon';
import { TxSheet } from './components/TxSheet';
import { groupColorToken, monogram } from './lib/category';
import { formatRp } from './lib/money';
import { parseRoute, type Route } from './lib/route';
import { getDb, subscribeDb, updateDb } from './lib/store';
import { getTheme, nextTheme, setTheme, subscribeTheme, type Theme } from './lib/theme';
import type { Tx } from './lib/types';

const THEME_META: Record<Theme, { label: string; icon: IconName }> = {
  system: { label: 'Sistem', icon: 'system' },
  light: { label: 'Terang', icon: 'sun' },
  dark: { label: 'Gelap', icon: 'moon' },
};

const SCREENS: Record<Route, { title: string; subtitle: string }> = {
  beranda: {
    title: 'Beranda',
    subtitle: 'Belum ada transaksi. Ketuk tombol + di bawah untuk mencatat transaksi pertama.',
  },
  mutasi: {
    title: 'Mutasi',
    subtitle: 'Daftar transaksi bulanan bergaya rekening koran akan tampil di sini.',
  },
  laporan: {
    title: 'Laporan',
    subtitle: 'Ringkasan masuk, keluar, selisih, dan distribusi kategori akan tampil di sini.',
  },
  anggaran: {
    title: 'Anggaran',
    subtitle: 'Batas pengeluaran bulanan per kelompok dan kategori akan tampil di sini.',
  },
  atur: {
    title: 'Atur',
    subtitle: 'Pengelolaan rekening, kategori, dan backup data akan tampil di sini.',
  },
};

function subscribeHash(cb: () => void) {
  window.addEventListener('hashchange', cb);
  return () => window.removeEventListener('hashchange', cb);
}

function getHash() {
  return window.location.hash;
}

export function App() {
  const route = parseRoute(useSyncExternalStore(subscribeHash, getHash));
  const theme = useSyncExternalStore(subscribeTheme, getTheme);
  const db = useSyncExternalStore(subscribeDb, getDb);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [lastSavedId, setLastSavedId] = useState<string | null>(null);

  const screen = SCREENS[route];
  const themeMeta = THEME_META[theme];

  function handleCycleTheme() {
    const systemIsDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setTheme(nextTheme(theme, systemIsDark));
  }

  function handleSaveTx(tx: Tx) {
    updateDb((prev) => ({ ...prev, txs: [tx, ...prev.txs] }));
    setSheetOpen(false);
    setLastSavedId(tx.id);
    window.setTimeout(() => {
      setLastSavedId((curr) => (curr === tx.id ? null : curr));
    }, 1400);
  }

  const accountById = new Map(db.accounts.map((a) => [a.id, a]));
  const categoryById = new Map(db.categories.map((c) => [c.id, c]));
  const outGroups = Array.from(new Set(db.categories.filter((c) => c.kind === 'out').map((c) => c.group)));
  const inGroups = Array.from(new Set(db.categories.filter((c) => c.kind === 'in').map((c) => c.group)));
  const recentTxs = [...db.txs].sort((a, b) => b.createdAt - a.createdAt);

  return (
    <div className="shell">
      <header className="shell-header">
        <div className="shell-header__top">
          <span className="shell-header__brand">Arus</span>
          <div className="shell-header__actions">
            <button
              type="button"
              className="shell-header__pill"
              onClick={handleCycleTheme}
              aria-label={`Tema: ${themeMeta.label}. Ketuk untuk mengganti`}
            >
              <Icon name={themeMeta.icon} />
              <span>{themeMeta.label}</span>
            </button>
            {route !== 'anggaran' && (
              <a href="#/anggaran" className="shell-header__pill">
                <Icon name="anggaran" />
                <span>Anggaran</span>
              </a>
            )}
          </div>
        </div>
        <h1 className="shell-header__title">{screen.title}</h1>
      </header>

      <main className="shell-main">
        {route === 'beranda' && recentTxs.length > 0 ? (
          <section className="tx-section" aria-label="Transaksi tercatat">
            <h2 className="tx-section__title">Mutasi terakhir ({recentTxs.length})</h2>
            <ul className="tx-list">
              {recentTxs.map((tx) => {
                const cat = tx.categoryId ? categoryById.get(tx.categoryId) : undefined;
                const acc = accountById.get(tx.accountId);
                const groups = tx.kind === 'in' ? inGroups : outGroups;
                const sign = tx.kind === 'in' ? '+' : '−';
                const code = tx.kind === 'in' ? 'CR' : 'DB';
                const meta = [acc?.name, tx.date, tx.note].filter(Boolean).join(' · ');

                return (
                  <li
                    key={tx.id}
                    className={`tx-row${lastSavedId === tx.id ? ' tx-row--new' : ''}`}
                  >
                    <span
                      className="cat-badge"
                      style={{
                        background: cat ? groupColorToken(cat.group, groups) : 'var(--cat-8)',
                      }}
                    >
                      {monogram(cat?.name ?? 'TX')}
                    </span>
                    <div className="tx-row__info">
                      <span className="tx-row__title">{cat?.name ?? 'Transaksi'}</span>
                      <span className="tx-row__meta num">{meta}</span>
                    </div>
                    <div
                      className={`tx-row__amount num${
                        tx.kind === 'in' ? ' tx-row__amount--in' : ' tx-row__amount--out'
                      }`}
                    >
                      <span>
                        {sign}
                        {formatRp(tx.amount)}
                      </span>
                      <span className="tx-row__code">{code}</span>
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        ) : (
          <section className="empty-card" aria-label={screen.title}>
            <h2 className="empty-card__title">{screen.title}</h2>
            <p className="empty-card__desc">{screen.subtitle}</p>
          </section>
        )}
      </main>

      <nav className="bottom-nav" aria-label="Navigasi utama">
        <a
          href="#/"
          className="bottom-nav__item"
          aria-current={route === 'beranda' ? 'page' : undefined}
        >
          <Icon name="beranda" />
          <span>Beranda</span>
        </a>
        <a
          href="#/mutasi"
          className="bottom-nav__item"
          aria-current={route === 'mutasi' ? 'page' : undefined}
        >
          <Icon name="mutasi" />
          <span>Mutasi</span>
        </a>
        <button
          type="button"
          className="bottom-nav__add"
          aria-label="Catat transaksi"
          onClick={() => setSheetOpen(true)}
        >
          <Icon name="plus" />
        </button>
        <a
          href="#/laporan"
          className="bottom-nav__item"
          aria-current={route === 'laporan' ? 'page' : undefined}
        >
          <Icon name="laporan" />
          <span>Laporan</span>
        </a>
        <a
          href="#/atur"
          className="bottom-nav__item"
          aria-current={route === 'atur' ? 'page' : undefined}
        >
          <Icon name="atur" />
          <span>Atur</span>
        </a>
      </nav>

      {sheetOpen && (
        <TxSheet db={db} onSave={handleSaveTx} onClose={() => setSheetOpen(false)} />
      )}
    </div>
  );
}
