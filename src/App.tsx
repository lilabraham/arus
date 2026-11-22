import { useSyncExternalStore } from 'react';
import { Icon } from './components/Icon';
import { parseRoute, type Route } from './lib/route';

const SCREENS: Record<Route, { title: string; subtitle: string }> = {
  beranda: {
    title: 'Beranda',
    subtitle: 'Ringkasan saldo, rekening, dan mutasi terakhir akan tampil di sini.',
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
  const screen = SCREENS[route];

  return (
    <div className="shell">
      <header className="shell-header">
        <div className="shell-header__top">
          <span className="shell-header__brand">Arus</span>
          {route !== 'anggaran' && (
            <a href="#/anggaran" className="shell-header__pill">
              <Icon name="anggaran" />
              <span>Anggaran</span>
            </a>
          )}
        </div>
        <h1 className="shell-header__title">{screen.title}</h1>
      </header>

      <main className="shell-main">
        <section className="empty-card" aria-label={screen.title}>
          <h2 className="empty-card__title">{screen.title}</h2>
          <p className="empty-card__desc">{screen.subtitle}</p>
        </section>
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
          title="Catat transaksi (Task 3)"
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
    </div>
  );
}
