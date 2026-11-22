import { useState, useSyncExternalStore } from 'react';
import { Icon, type IconName } from './components/Icon';
import { TxSheet } from './components/TxSheet';
import { greeting } from './lib/date';
import { parseRoute, type Route } from './lib/route';
import { getDb, subscribeDb, updateDb } from './lib/store';
import { getTheme, nextTheme, setTheme, subscribeTheme, type Theme } from './lib/theme';
import type { CategoryKind, Tx } from './lib/types';
import { Beranda } from './screens/Beranda';

const THEME_META: Record<Theme, { label: string; icon: IconName }> = {
  system: { label: 'Sistem', icon: 'system' },
  light: { label: 'Terang', icon: 'sun' },
  dark: { label: 'Gelap', icon: 'moon' },
};

const PLACEHOLDER_SCREENS: Record<Exclude<Route, 'beranda'>, { title: string; subtitle: string }> = {
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
  const [sheetKind, setSheetKind] = useState<CategoryKind | null>(null);
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
    updateDb((prev) => ({ ...prev, txs: [tx, ...prev.txs] }));
    setSheetKind(null);
    setLastSavedId(tx.id);
    window.setTimeout(() => {
      setLastSavedId((curr) => (curr === tx.id ? null : curr));
    }, 1400);
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
          <h1 className="shell-header__title">{PLACEHOLDER_SCREENS[route].title}</h1>
        )}
      </header>

      <main className={`shell-main${route === 'beranda' ? ' shell-main--flush' : ''}`}>
        {route === 'beranda' ? (
          <Beranda
            db={db}
            lastSavedId={lastSavedId}
            onToggleHide={handleToggleHide}
            onQuickAdd={(kind) => setSheetKind(kind)}
          />
        ) : (
          <section className="empty-card" aria-label={PLACEHOLDER_SCREENS[route].title}>
            <h2 className="empty-card__title">{PLACEHOLDER_SCREENS[route].title}</h2>
            <p className="empty-card__desc">{PLACEHOLDER_SCREENS[route].subtitle}</p>
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
          onClick={() => setSheetKind('out')}
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

      {sheetKind && (
        <TxSheet
          db={db}
          initialKind={sheetKind}
          onSave={handleSaveTx}
          onClose={() => setSheetKind(null)}
        />
      )}
    </div>
  );
}
