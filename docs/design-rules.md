# Aturan Desain — Konsep "Rekening"

## Arah Visual

**Kejelasan m-banking, identitas sendiri.** Struktur informasinya meniru yang sudah terbukti di
aplikasi bank (BCA mobile, Jago, Jenius, blu): saldo di atas, menu cepat, daftar rekening,
mutasi seperti rekening koran. **Warna dan detailnya tidak meniru bank mana pun.**

Yang dipinjam dari aplikasi bank:
1. **Saldo sebagai hal pertama yang terlihat**, dengan tombol mata untuk menyembunyikan (`Rp •••••••`).
2. **Menu cepat** di bawah saldo: Keluar · Masuk · Transfer · Anggaran.
3. **Mutasi gaya rekening koran:** tanggal, keterangan, label **DB/CR**, nominal, saldo berjalan per rekening.
4. **Kepadatan informasi:** banyak data per layar, rapi, tanpa ruang kosong yang terbuang.

Yang membuatnya tidak pasaran:
1. **Palet "petrol & lime":** header hijau-petrol gelap dengan aksen lime. Tidak biru seperti
   bank pada umumnya, tidak ungu seperti template fintech.
2. **Plus Jakarta Sans:** font buatan Indonesia, angka tabular.
3. **Kartu rekening datar** dengan monogram jenis rekening, tanpa gambar kartu fisik palsu.

## Larangan

- ❌ Meniru warna/logo bank asli (biru BCA, oranye Jago, dll.)
- ❌ Ungu/indigo, gradien mencolok, glassmorphism, shadow berlapis
- ❌ Radius besar di semua elemen (`rounded-2xl`)
- ❌ Emoji sebagai ikon
- ❌ Warna sebagai *satu-satunya* penanda masuk/keluar (wajib ada `+`/`−` atau CR/DB)
- ❌ Animasi angka berputar-putar, confetti, ilustrasi stok

## Design Tokens (`src/styles/tokens.css`)

```css
:root {
  /* Merek */
  --brand:      #0F3D3A;   /* petrol: header, kartu saldo */
  --brand-ink:  #F2F7F5;   /* teks di atas --brand */
  --accent:     #CFF25C;   /* lime: tombol utama (selalu dengan teks gelap --brand) */

  /* Permukaan & teks — terang */
  --bg:         #F5F7F6;
  --surface:    #FFFFFF;
  --ink:        #13201E;
  --ink-2:      #5B6A67;   /* kontras ≥ 4.5:1 di --bg dan --surface */
  --line:       #E1E7E5;

  /* Semantik */
  --in:         #13795B;   /* pemasukan / CR */
  --out:        #C2410C;   /* pengeluaran / DB */
  --warn:       #B45309;   /* anggaran ≥ 80% */
  --danger:     #B91C1C;   /* anggaran jebol */

  /* Palet kategori (bergiliran per kelompok) */
  --cat-1: #0F766E; --cat-2: #B45309; --cat-3: #1D4ED8; --cat-4: #BE185D;
  --cat-5: #4D7C0F; --cat-6: #7C2D12; --cat-7: #0369A1; --cat-8: #6B7280;

  /* Tipografi */
  --font: "Plus Jakarta Sans", system-ui, sans-serif;
  --step--1: 0.8125rem; --step-0: 0.9375rem; --step-1: 1.125rem;
  --step-2: 1.5rem;     --step-3: 2rem;      /* saldo utama */

  /* Spasi (kelipatan 4 px) & bentuk */
  --s-1: 4px; --s-2: 8px; --s-3: 12px; --s-4: 16px; --s-5: 20px; --s-6: 24px; --s-8: 32px;
  --r-sm: 6px;   /* input, chip, monogram */
  --r-md: 12px;  /* kartu, sheet */
}

@media (prefers-color-scheme: dark) {
  :root {
    --brand: #0B2B29; --bg: #0E1413; --surface: #161E1D;
    --ink: #E8EFED; --ink-2: #9AA9A6; --line: #26302E;
    --in: #4ADE9B; --out: #FB8A5B; --warn: #FBBF24; --danger: #F87171;
  }
}
```

Font di-*self-host* di `public/fonts/` (woff2, subset latin, berat 400/600/700) agar offline.
Task 1 memastikan angka tabular jalan (`font-variant-numeric: tabular-nums`); jika tidak, angka memakai `Inter`.

## Tata Letak Layar

**Beranda**
```
┌───────────────────────────────┐  ← --brand
│ Selamat pagi          [atur] │
│ Total saldo          [mata]  │
│ Rp12.480.000                  │
│ [Keluar][Masuk][Transfer][Angg]│  ← menu cepat
└───────────────────────────────┘
 Rekening                  Lihat semua
 [BC Bank  Rp9,2 jt] [GP E-wallet …]   ← geser horizontal
 Anggaran November        68% terpakai
 ▓▓▓▓▓▓▓▓▓▓▓░░░░░  sisa Rp1,6 jt
 Mutasi terakhir
 22 Nov  Makan harian · Tunai   DB  −Rp25.000
 22 Nov  Gaji pokok · Bank      CR  +Rp8.500.000
────────────────────────────────
 Beranda  Mutasi  [ + ]  Laporan  Atur   ← navigasi bawah
```

- **Mutasi:** filter (bulan, rekening, kategori, cari), grup per tanggal, total harian.
  Pilih satu rekening → kolom saldo berjalan seperti rekening koran.
- **Laporan:** ringkasan masuk/keluar/selisih vs bulan lalu → donut per kelompok →
  daftar kelompok (tap untuk lihat kategorinya).
- **Anggaran:** daftar kelompok/kategori dengan bar progres; ≥ 80% warna `--warn`, > 100% `--danger` + teks "lewat Rp…".
- Mobile-first, lebar konten maks 480 px; di desktop tampil sebagai kolom di tengah.

## Tipografi & Angka

- Semua nominal: `font-variant-numeric: tabular-nums;` rata kanan di daftar.
- Format `Rp25.000`; pengeluaran `−Rp25.000` (minus asli `−`); pemasukan `+Rp25.000`.
- Saldo besar di kartu boleh disingkat (`Rp9,2 jt`); di mutasi dan detail selalu nominal penuh.
- Saldo tersembunyi tampil `Rp •••••••` di semua layar, bukan hanya di Beranda.

## Interaksi

- Tombol `+`: sheet naik dari bawah dengan keypad besar (target sentuh ≥ 48 px).
- Transisi ≤ 200 ms `ease-out`; hormati `prefers-reduced-motion`.
- Setelah simpan: sheet tertutup, baris baru di mutasi tersorot sebentar.
- Hapus: konfirmasi di dalam sheet, bukan `confirm()` browser.

## Aksesibilitas (tidak boleh dipangkas)

- Kontras teks ≥ 4.5:1 di kedua tema (termasuk teks gelap di atas lime).
- Semua kontrol bisa dipakai dengan keyboard; fokus terlihat (`outline: 2px solid var(--accent)` + offset).
- Elemen interaktif pakai `<button>`/`<a>`/`<input>` asli.
- Chart punya label teks dan nominal yang tertulis; tombol mata punya `aria-label` + `aria-pressed`.

## Gate Desain

Di Checkpoint 1, screenshot Beranda (terang + gelap, 375 px), dibandingkan dengan 2 aplikasi bank.
Harus sama informatifnya **dan** tidak terlihat seperti tiruan salah satunya.
