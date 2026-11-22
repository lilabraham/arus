import type { Account, Category, CategoryKind, Db } from './types';

type GroupSpec = readonly [group: string, names: readonly string[]];

const DEFAULT_ACCOUNTS: readonly Omit<Account, 'initialBalance' | 'archived'>[] = [
  { id: 'acc-tunai', name: 'Tunai', type: 'cash' },
  { id: 'acc-bca', name: 'BCA', type: 'bank' },
  { id: 'acc-mandiri', name: 'Mandiri', type: 'bank' },
  { id: 'acc-jenius', name: 'Jenius', type: 'bank' },
  { id: 'acc-dana', name: 'DANA', type: 'ewallet' },
];

const OUT_GROUPS: readonly GroupSpec[] = [
  [
    'Makan & Minum',
    [
      'Makan harian',
      'Jajan & kopi',
      'Belanja dapur',
      'Pesan antar (GoFood/GrabFood/ShopeeFood)',
      'Makan di luar',
    ],
  ],
  [
    'Transportasi',
    [
      'Bensin',
      'Ojol & taksi online',
      'Transportasi umum (KRL/MRT/TransJakarta)',
      'Parkir & tol',
      'Servis & suku cadang',
      'Pajak kendaraan & STNK',
    ],
  ],
  [
    'Tempat Tinggal',
    [
      'Sewa / kos',
      'Cicilan KPR',
      'Listrik (token PLN)',
      'Air (PDAM)',
      'Gas',
      'Perawatan & perbaikan rumah',
      'Iuran lingkungan / IPL',
    ],
  ],
  [
    'Tagihan & Langganan',
    [
      'Pulsa & paket data',
      'Internet rumah',
      'Streaming (Netflix/Spotify/YouTube)',
      'Aplikasi & cloud (iCloud/Google One/AI tools)',
      'Keanggotaan',
    ],
  ],
  [
    'Belanja',
    ['Pakaian & sepatu', 'Elektronik & gadget', 'Perlengkapan rumah', 'Belanja online (lain-lain)'],
  ],
  [
    'Kesehatan',
    [
      'BPJS Kesehatan',
      'Asuransi kesehatan',
      'Obat & apotek',
      'Dokter & rumah sakit',
      'Gigi & mata',
      'Olahraga & gym',
    ],
  ],
  ['Perawatan Diri', ['Potong rambut & salon', 'Skincare & kosmetik', 'Laundry']],
  [
    'Pendidikan & Pengembangan',
    ['Kursus & sertifikasi', 'Buku & materi', 'Biaya sekolah / kuliah', 'Seminar & event'],
  ],
  ['Hiburan & Gaya Hidup', ['Nongkrong', 'Hobi', 'Game', 'Film & konser', 'Liburan & travel']],
  ['Keluarga & Anak', ['Kirim ke orang tua', 'Kebutuhan anak', 'Pengasuh / ART', 'Hewan peliharaan']],
  ['Sosial & Ibadah', ['Zakat', 'Infak & sedekah', 'Donasi', 'Kondangan & hadiah', 'Arisan']],
  [
    'Biaya Keuangan',
    [
      'Bunga & cicilan (porsi bunga)',
      'Biaya admin bank',
      'Biaya transfer & top-up',
      'Denda & keterlambatan',
      'Pajak (PPh/PBB)',
      'Asuransi jiwa',
    ],
  ],
  [
    'Kerja & Usaha',
    [
      'Peralatan kerja',
      'Software & tools kerja',
      'Coworking & internet kerja',
      'Iklan & marketing',
      'Bahan / stok',
      'Ongkos kirim',
      'Biaya operasional lain',
    ],
  ],
  ['Lainnya', ['Tak terduga', 'Lain-lain']],
];

const IN_GROUPS: readonly GroupSpec[] = [
  ['Gaji', ['Gaji pokok', 'Tunjangan', 'Lembur']],
  ['Bonus & THR', ['THR', 'Bonus kinerja', 'Insentif']],
  ['Freelance & Proyek', ['Proyek', 'Konsultasi', 'Konten & afiliasi']],
  ['Usaha', ['Penjualan', 'Jasa']],
  [
    'Investasi',
    [
      'Dividen',
      'Bunga deposito / tabungan',
      'Imbal hasil (reksa dana, SBN, P2P)',
      'Untung jual aset',
    ],
  ],
  ['Cashback & Reward', ['Cashback', 'Poin ditukar', 'Promo']],
  ['Pemberian', ['Hadiah', 'Angpao', 'Kiriman keluarga']],
  ['Pengembalian Dana', ['Reimburse kantor', 'Refund belanja', 'Pinjaman dikembalikan']],
  ['Lainnya', ['Lain-lain']],
];

function expandCategories(kind: CategoryKind, groups: readonly GroupSpec[]): Category[] {
  const result: Category[] = [];
  let n = 0;
  for (const [group, names] of groups) {
    for (const name of names) {
      n += 1;
      result.push({ id: `cat-${kind}-${n}`, name, kind, group, archived: false });
    }
  }
  return result;
}

export function createDefaultDb(): Db {
  return {
    version: 1,
    accounts: DEFAULT_ACCOUNTS.map((a) => ({ ...a, initialBalance: 0, archived: false })),
    categories: [
      ...expandCategories('out', OUT_GROUPS),
      ...expandCategories('in', IN_GROUPS),
    ],
    txs: [],
    budgets: [],
    prefs: { hideBalance: false },
  };
}
