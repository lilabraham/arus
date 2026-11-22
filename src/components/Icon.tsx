export type IconName = 'beranda' | 'mutasi' | 'plus' | 'laporan' | 'anggaran' | 'atur';

const PATHS: Record<IconName, string> = {
  beranda: 'M3 10.5L12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z',
  mutasi: 'M4 6h16M4 12h16M4 18h10',
  plus: 'M12 5v14M5 12h14',
  laporan: 'M5 19V11M12 19V5M19 19v-8',
  anggaran: 'M12 3a9 9 0 1 0 9 9h-9zM15.5 3.7A9 9 0 0 1 20.3 8.5H15.5z',
  atur: 'M4 7h10M18 7h2M4 17h4M12 17h8M14 5v4M8 15v4',
};

export function Icon({ name }: { name: IconName }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={PATHS[name]} />
    </svg>
  );
}
