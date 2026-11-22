import { useState, useSyncExternalStore } from 'react';
import { Icon, type IconName } from './components/Icon';
import { TxSheet } from './components/TxSheet';
import { greeting } from './lib/date';
import { parseRoute, type Route } from './lib/route';
import { getDb, subscribeDb, updateDb } from './lib/store';
import { getTheme, nextTheme, setTheme, subscribeTheme, type Theme } from './lib/theme';
import type { Id, Tx, TxKind } from './lib/types';
import { Beranda } from './screens/Beranda';
import { Mutasi } from './screens/Mutasi';

type SheetState = { mode: 'new'; kind: TxKind } | { mode: 'edit'; tx: Tx };

const THEME_META: Record<Theme, { label: string; icon: IconName }> = {
  system: { label: 'Sistem', icon: 'system' },
  light: { label: 'Terang', icon: 'sun' },
  dark: { label: 'Gelap', icon: 'moon' },
};

const SCREEN_TITLES: Record<Exclude<Route, 'beranda'>, string> = {
  mutasi: 'Mutasi',
  laporan: 'Laporan',
  anggaran: 'Anggaran',
  atur: 'Atur',
};

const PLACEHOLDER_DESC: Record<Exclude<Route, 'beranda' | 'mutasi'>, string> = {
  laporan: 'Ringkasan masuk, keluar, selisih, dan distribusi kategori akan tampil di sini.',
  anggaran: 'Batas pengeluaran bulanan per kelompok dan kategori akan tampil di sini.',
  atur: 'Pengelolaan rekening, kategori, dan backup data akan tampil di sini.',
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
  const [sheet, setSheet] = useState<SheetState | null>(null);
  const [lastSavedId, setLastSavedId] = useState<string | null>(null);

  const themeMeta = THEME_META[theme];

  function handleCycleTheme() {
    const systemIsDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setTheme(nextTheme(theme, systemIsDark));
  }

  function handleToggleHide() {
    updateDb((prev) => ({
      ...prev,
      prefs: { ...prev.prefs, hideBalance: !prev.prefs.hideBalance },
    }));
  }

  function handleSaveTx(tx: Tx) {
    updateDb((prev) => ({
      ...prev,
      txs: prev.txs.some((t) => t.id === tx.id)
        ? prev.txs.map((t) => (t.id === tx.id ? tx : t))
        : [tx, ...prev.txs],
    }));
    setSheet(null);
    setLastSavedId(tx.id);
    window.setTimeout(() => {
      setLastSavedId((curr) => (curr === tx.id ? null : curr));
    }, 1400);
  }

  function handleDeleteTx(id: Id) {
    updateDb((prev) => ({ ...prev, txs: prev.txs.filter((t) => t.id !== id) }));
    setSheet(null);
  }

  function handleSelectTx(tx: Tx) {
    setSheet({ mode: 'edit', tx });
  }

  return (
    <div className="shell">
      <header className={`shell-header${route === 'beranda' ? ' shell-header--beranda' : ''}`}>
        <div className="shell-header__top">
          {route === 'beranda' ? (
            <h1 className="shell-header__brand">{greeting()}</h1>
          ) : (
            <span className="shell-header__brand">Arus</span>
          )}
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
            {route !== 'beranda' && route !== 'anggaran' && (
              <a href="#/anggaran" className="shell-header__pill">
                <Icon name="anggaran" />
                <span>Anggaran</span>
              </a>
            )}
          </div>
        </div>

        {route !== 'beranda' && (
          <h1 className="shell-header__title">{SCREEN_TITLES[route]}</h1>
        )}
      </header>

      <main className={`shell-main${route === 'beranda' ? ' shell-main--flush' : ''}`}>
        {route === 'beranda' ? (
          <Beranda
            db={db}
            lastSavedId={lastSavedId}
            onToggleHide={handleToggleHide}
            onQuickAdd={(kind) => setSheet({ mode: 'new', kind })}
            onSelectTx={handleSelectTx}
          />
        ) : route === 'mutasi' ? (
          <Mutasi
            db={db}
            lastSavedId={lastSavedId}
            onSelectTx={handleSelectTx}
            onQuickAdd={() => setSheet({ mode: 'new', kind: 'out' })}
          />
        ) : (
          <section className="empty-card" aria-label={SCREEN_TITLES[route]}>
            <h2 className="empty-card__title">{SCREEN_TITLES[route]}</h2>
            <p className="empty-card__desc">{PLACEHOLDER_DESC[route]}</p>
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
          onClick={() => setSheet({ mode: 'new', kind: 'out' })}
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

      {sheet && (
        <TxSheet
          key={sheet.mode === 'edit' ? sheet.tx.id : sheet.kind}
          db={db}
          initialKind={sheet.mode === 'new' ? sheet.kind : undefined}
          editingTx={sheet.mode === 'edit' ? sheet.tx : undefined}
          onSave={handleSaveTx}
          onDelete={handleDeleteTx}
          onClose={() => setSheet(null)}
        />
      )}
    </div>
  );
}
