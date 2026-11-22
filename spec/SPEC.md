# Spec: Arus — Aplikasi Keuangan Pribadi — V1

> Format mengikuti `spec-driven-development` (addyosmani/agent-skills).
> Status: **Disetujui** — mulai implementasi V1.

## Nama

**Arus** — dari *arus kas*. Pendek (4 huruf), mudah diucapkan, terdengar profesional,
dan menggambarkan isi aplikasi: uang yang mengalir masuk dan keluar.
Tagline: *"Tahu ke mana uangmu mengalir."*

Alternatif jika kurang cocok: **Kocek** (santai, khas Indonesia) · **Neraca** (formal).

## Asumsi (koreksi sekarang, atau ini yang dipakai)

1. **PWA** (web app yang bisa di-install), di-deploy gratis ke internet, jalan **offline**.
2. **Satu pengguna.** Tanpa login, tanpa server. Hosting hanya menyajikan file aplikasi;
   **data tetap di perangkat**, tidak pernah dikirim keluar.
3. Backup = export/import file JSON; export CSV untuk spreadsheet.
4. Mata uang **Rupiah saja**, disimpan sebagai **bilangan bulat**.
5. Bahasa UI: **Bahasa Indonesia**.
6. Browser modern saja (Chrome/Edge/Safari/Firefox 2 versi terakhir).

## Objective

Aplikasi keuangan pribadi dengan **tampilan dan kejelasan seperti aplikasi m-banking**:
saldo langsung terlihat, mutasi rapi, laporan informatif. Mencatat transaksi butuh
**≤ 5 detik**. Dipakai untuk kebutuhan harian, perencanaan jangka panjang, dan keuangan
kerja/freelance.

**Pengguna:** saya sendiri. Mencatat dari HP, sesekali review di laptop.

**Sukses berarti:** dipakai setiap hari selama 1 bulan tanpa kembali ke spreadsheet, dan
di akhir bulan saya tahu persis ke mana uang pergi dan apakah anggaran jebol.

## Roadmap

Dikerjakan bertahap. Setiap versi bisa dipakai penuh sebelum versi berikutnya dimulai.

| Versi | Fokus | Fitur |
|---|---|---|
| **V1** | Harian | Catat cepat, rekening (5 jenis), transfer, kategori lengkap 2 level, mutasi, laporan bulanan, **anggaran bulanan**, sembunyikan saldo, backup JSON + export CSV, PWA + deploy |
| **V1.1** | Jangka panjang | Transaksi berulang & pengingat tagihan, target tabungan, laporan tahunan & tren 12 bulan, kekayaan bersih (aset − utang) |
| **V1.2** | Profesional | Utang-piutang (nama, jatuh tempo), buku terpisah **Pribadi / Usaha**, tanda *reimburse*, kunci PIN, laporan periode bebas (CSV) |
| **V2** | Opsional | Rilis Google Play (TWA), backup ke Google Drive, foto struk |

**Spec ini hanya merinci V1.** V1.1 dan V1.2 mendapat spec lanjutan setelah V1 dipakai
minimal 2 minggu (supaya fiturnya berdasarkan kebutuhan nyata, bukan tebakan).

## User Stories V1

| # | Sebagai pengguna, saya ingin… | Supaya… |
|---|---|---|
| US1 | mencatat pengeluaran/pemasukan dengan keypad angka langsung terbuka | mencatat tidak terasa ribet |
| US2 | punya beberapa rekening (Tunai, Bank, E-wallet, Kartu Kredit/Paylater, Investasi) | saldo tiap rekening akurat |
| US3 | memindahkan uang antar rekening | top-up GoPay atau bayar kartu kredit tidak tercatat sebagai pengeluaran |
| US4 | memilih dari kategori yang lengkap, dikelompokkan, dan bisa dicari | tidak perlu membuat kategori sendiri dari nol |
| US5 | melihat mutasi seperti rekening koran (tanggal, keterangan, DB/CR, saldo) | gampang cek "kemarin beli apa" |
| US6 | melihat laporan bulan: masuk, keluar, selisih, per kelompok & kategori, banding bulan lalu | tahu ke mana uang pergi |
| US7 | memasang anggaran bulanan per kelompok/kategori dan melihat sisanya | tidak jebol di tengah bulan |
| US8 | menyembunyikan saldo dengan satu tap | aman saat membuka aplikasi di tempat umum |
| US9 | mengedit, menghapus, dan mengelola rekening & kategori | sesuai kebiasaan saya |
| US10 | export/import JSON dan export CSV | data aman dan bisa diolah di spreadsheet |
| US11 | membuka dari ikon di layar HP, tetap jalan tanpa internet | terasa seperti aplikasi asli |

## Model Data V1

```ts
type Id = string; // crypto.randomUUID()

interface Account {
  id: Id; name: string;
  type: 'cash' | 'bank' | 'ewallet' | 'credit' | 'investment';
  initialBalance: number;   // integer Rupiah; credit boleh negatif (= utang)
  archived: boolean;
}
interface Category {
  id: Id; name: string; kind: 'in' | 'out';
  group: string;            // nama kelompok, mis. "Makan & Minum" (lihat categories.md)
  archived: boolean;
}
interface Tx {
  id: Id;
  kind: 'in' | 'out' | 'transfer';
  amount: number;           // integer Rupiah, > 0
  accountId: Id;
  toAccountId?: Id;         // wajib jika transfer
  categoryId?: Id;          // wajib jika bukan transfer
  note: string;
  date: string;             // 'YYYY-MM-DD' lokal
  createdAt: number;        // epoch ms
}
interface Budget { month: string /* 'YYYY-MM' */; target: string /* group atau categoryId */; limit: number }
interface Db {
  version: 1;
  accounts: Account[]; categories: Category[]; txs: Tx[]; budgets: Budget[];
  prefs: { hideBalance: boolean };
}
```

Turunan (dihitung, tidak disimpan): saldo rekening, total aset, total bulan, realisasi anggaran.
Fitur V1.1/V1.2 menambah field lewat migrasi `version` di `store.ts`.

## Kategori

Daftar default lengkap (14 kelompok pengeluaran, 9 pemasukan) ada di
[`categories.md`](categories.md).

## Tech Stack

| Kebutuhan | Pilihan | Alasan |
|---|---|---|
| Build | Vite + TypeScript (strict) | standar, cepat |
| UI | React 19 | familiar untuk agent |
| Styling | CSS biasa + CSS custom properties | tanpa framework CSS |
| Penyimpanan | `localStorage` (satu key JSON) | cukup untuk 1 orang |
| Format uang/tanggal | `Intl.NumberFormat('id-ID')`, `Intl.DateTimeFormat` | tanpa library |
| Chart | SVG tangan (bar + donut) | 2 jenis chart tidak butuh library |
| Ikon | ~15 ikon SVG inline di satu file; kategori pakai monogram | tanpa library ikon |
| Routing | `location.hash` | 4–5 layar, tanpa router |
| PWA | `manifest.webmanifest` + service worker tangan | tanpa plugin |
| Test | Vitest | logika saja |
| Hosting | Cloudflare Pages (gratis, HTTPS, deploy otomatis dari GitHub) | statis, tanpa server |

> `ponytail:` localStorage dibatasi ~5 MB (≈ 20 ribu transaksi). Pindah ke IndexedDB jika
> mendekati batas. Semua akses data lewat `src/lib/store.ts`, jadi cukup ganti satu file.

## Deploy & Distribusi

**Keputusan: PWA di internet dulu, Play Store nanti (opsional).**

| Opsi | Biaya | Usaha | Hasil |
|---|---|---|---|
| **PWA di Cloudflare Pages** ✅ | Gratis | Hubungkan repo GitHub sekali | Buka URL → "Tambahkan ke layar utama" → ikon & layar penuh seperti aplikasi. Jalan di Android, iPhone, laptop |
| Google Play (TWA via PWABuilder) | US$25 sekali | Bungkus PWA yang sama, tanpa menulis ulang | Muncul di Play Store. Akun pribadi baru wajib *closed testing* 12 penguji selama 14 hari sebelum rilis publik. Jalur *internal testing* (khusus diri sendiri) tidak perlu syarat itu |
| Aplikasi native (Kotlin/Flutter) | Waktu berbulan-bulan | Tulis ulang semuanya | Tidak sepadan untuk pemakaian pribadi |

PWA yang dibangun di V1 **adalah** bahan untuk Play Store nanti, jadi tidak ada kerja yang terbuang.

## Commands

```
Dev:     npm run dev
Build:   npm run build          # tsc --noEmit && vite build
Test:    npm test               # vitest run
Preview: npm run preview
Deploy:  git push               # Cloudflare Pages build otomatis dari branch main
```

## Project Structure

```
src/
  main.tsx            → entry, register service worker
  App.tsx             → layout + hash routing
  lib/
    types.ts          → tipe Db (di atas)
    money.ts          → parse/format Rupiah
    store.ts          → load/save/migrate Db (satu-satunya yang menyentuh localStorage)
    defaults.ts       → rekening & kategori default (dari categories.md)
    ledger.ts         → saldo, mutasi, laporan bulan (fungsi murni)
    budget.ts         → realisasi anggaran
    backup.ts         → export/import JSON + export CSV
    *.test.ts         → test di sebelah file yang diuji
  screens/            → Beranda, Mutasi, Laporan, Anggaran, Atur
  components/         → komponen yang dipakai ≥ 2 layar saja
  styles/             → tokens.css, base.css
public/
  manifest.webmanifest, sw.js, icons/, fonts/
```

## Code Style

Lihat [`docs/coding-rules.md`](../docs/coding-rules.md).

## Testing Strategy

- **Unit (Vitest):** `money`, `ledger`, `budget`, `backup`, `store` (migrasi). Jalur uang: wajib.
- **Komponen / E2E:** tidak di V1. Verifikasi manual di browser (HP + desktop) per task.

## Boundaries

- **Always:** `npm test && npm run build` sebelum commit; uang selalu integer; validasi data import.
- **Ask first:** menambah dependency; mengubah bentuk `Db` (wajib + migrasi); mengubah design tokens.
- **Never:** menyimpan uang sebagai float; mengirim data ke server/analytics; menghapus test yang gagal.

## Success Criteria V1

- [ ] Catat transaksi dari Beranda dalam ≤ 3 tap + ketik nominal.
- [ ] Saldo rekening = saldo awal + masuk − keluar ± transfer (terbukti test).
- [ ] Transfer tidak memengaruhi total masuk/keluar bulan (terbukti test).
- [ ] Realisasi anggaran per kelompok & kategori benar (terbukti test).
- [ ] Export → hapus data → import menghasilkan data identik (terbukti test).
- [ ] Import file rusak/asing ditolak tanpa merusak data yang ada.
- [ ] CSV terbuka benar di Google Sheets/Excel (pemisah, angka, tanggal).
- [ ] Live di URL HTTPS, bisa di-install, jalan dalam mode pesawat.
- [ ] Lighthouse mobile: Accessibility ≥ 95, Performance ≥ 90. Bundle JS gzip < 90 KB.

## Out of Scope V1

Semua yang ada di baris V1.1, V1.2, dan V2 pada Roadmap. Selain itu tidak direncanakan:
multi mata uang (tidak dipakai), sinkronisasi real-time multi-perangkat (butuh server & login).

## Keputusan (sudah dijawab)

1. Nama: **Arus** ✅
2. Rekening awal: Tunai, BCA, Mandiri, Jenius, DANA ✅ (lihat `categories.md`)
3. Kategori default disetujui ✅
4. Repo di GitHub; agent melakukan commit + push otomatis; push ke `main` memicu deploy ✅

## Open Questions

- (tidak ada, spec siap disetujui)
