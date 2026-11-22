export type Route = 'beranda' | 'mutasi' | 'laporan' | 'anggaran' | 'atur';

const PATH_TO_ROUTE: Record<string, Route> = {
  '/': 'beranda',
  '/mutasi': 'mutasi',
  '/laporan': 'laporan',
  '/anggaran': 'anggaran',
  '/atur': 'atur',
};

export function parseRoute(hash: string): Route {
  const withoutHash = hash.startsWith('#') ? hash.slice(1) : hash;
  const path = (withoutHash.split('?')[0] || '/').replace(/\/+$/, '') || '/';
  return PATH_TO_ROUTE[path] ?? 'beranda';
}
