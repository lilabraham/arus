# Rencana Implementasi — Arus V1

Format mengikuti `planning-and-task-breakdown`. Irisan **vertikal**: setiap task menghasilkan
sesuatu yang bisa dipakai. Semua task berukuran S/M.

Verifikasi standar setiap task: `npm test && npm run build` hijau + cek manual yang disebut.

## Dependency Graph

```
money.ts ─┐
store.ts ─┼─► ledger.ts ─► Beranda / Mutasi / Laporan
defaults ─┘       └──────► budget.ts ─► Anggaran
                  backup.ts ─► Atur
tokens.css ─► semua layar
```

---

## Task 1: Fondasi proyek, design tokens, deploy pertama
**Deskripsi:** Scaffold Vite React TS + Vitest, `tokens.css` + `base.css`, font lokal, shell dengan navigasi bawah (layar kosong), lalu deploy ke Cloudflare Pages. Deploy di awal supaya setiap task berikutnya langsung bisa dicoba di HP.
**Acceptance criteria:**
- [ ] `npm run dev`, `npm test`, `npm run build` jalan
- [ ] Token sesuai `docs/design-rules.md`, terang & gelap; angka tabular terverifikasi
- [ ] Navigasi `#/`, `#/mutasi`, `#/laporan`, `#/anggaran`, `#/atur`
- [ ] URL HTTPS live; `git push` ke `main` memicu deploy
**Cek manual:** buka URL di HP, ganti tema sistem.
**Dependensi:** —  **Ukuran:** M

## Task 2: Uang, penyimpanan, data default (TDD)
**Deskripsi:** `money.ts` (parse "25.000"/"25rb"/"1,5jt" → integer, format), `store.ts` (load/save/migrasi), `defaults.ts` (kategori dari `spec/categories.md`, rekening default).
**Acceptance criteria:**
- [ ] Parse menolak negatif, desimal, non-angka
- [ ] `load()` pada storage kosong → data default lengkap
- [ ] `load()` pada JSON rusak tidak crash dan menyimpan salinan mentah di `arus:corrupt`
- [ ] Memanggil `navigator.storage.persist()` saat pertama kali dijalankan
**Dependensi:** 1  **Ukuran:** M

## Task 3: Catat cepat
**Deskripsi:** Tombol `+` → sheet keypad → masuk/keluar → kategori (grup + cari) → rekening → simpan.
**Acceptance criteria:**
- [ ] Keypad aktif saat sheet terbuka; kategori terakhir dipakai muncul paling atas
- [ ] Tanggal default hari ini (lokal), bisa diubah via `<input type="date">`
- [ ] Data bertahan setelah reload
**Cek manual:** catat 3 transaksi di HP.
**Dependensi:** 2  **Ukuran:** M

## Task 4: Beranda — saldo, rekening, mutasi terakhir (TDD ledger)
**Acceptance criteria:**
- [ ] Saldo per rekening & total benar, termasuk rekening `credit` bersaldo negatif (test)
- [ ] Tombol mata menyembunyikan semua nominal di semua layar; status tersimpan di `prefs`
- [ ] 5 mutasi terakhir dengan label DB/CR
**Dependensi:** 3  **Ukuran:** M

### ✅ Checkpoint 1 (Task 1–4): sudah bisa dipakai harian. Gate desain + review + `code-simplification`.

## Task 5: Mutasi
**Deskripsi:** Daftar per bulan, grup per tanggal, total harian, tap item → edit/hapus (pakai ulang sheet catat).
**Acceptance criteria:**
- [ ] Grup & total harian benar (test `groupByDay`)
- [ ] Hapus dengan konfirmasi; edit memperbarui saldo
- [ ] Empty state yang jelas
**Dependensi:** 4  **Ukuran:** M

## Task 6: Transfer antar rekening
**Acceptance criteria:**
- [ ] Saldo asal berkurang, tujuan bertambah (test)
- [ ] Tidak masuk total masuk/keluar bulan (test)
- [ ] Asal = tujuan ditolak
**Dependensi:** 5  **Ukuran:** S

## Task 7: Filter, cari, saldo berjalan
**Acceptance criteria:**
- [ ] Filter rekening/kategori/kelompok, cari di catatan (tanpa membedakan huruf besar)
- [ ] Filter tercermin di URL hash
- [ ] Jika satu rekening dipilih: kolom saldo berjalan (test)
**Dependensi:** 5  **Ukuran:** S

### ✅ Checkpoint 2 (Task 5–7): review + `code-simplification`.

## Task 8: Laporan bulanan
**Acceptance criteria:**
- [ ] Masuk/keluar/selisih + perbandingan bulan lalu (test `monthSummary`)
- [ ] Donut per kelompok (SVG) + daftar kelompok → kategori, dengan label & nominal tertulis
**Dependensi:** 6  **Ukuran:** M

## Task 9: Anggaran bulanan (TDD)
**Acceptance criteria:**
- [ ] Atur batas per kelompok atau kategori; "salin dari bulan lalu"
- [ ] Realisasi & sisa benar, transfer tidak dihitung (test `budget.ts`)
- [ ] Status ≥ 80% dan > 100% sesuai design rules; ringkasan muncul di Beranda
**Dependensi:** 8  **Ukuran:** M

## Task 10: Atur rekening & kategori
**Acceptance criteria:**
- [ ] CRUD rekening (5 jenis) & kategori; yang sudah dipakai diarsipkan, bukan dihapus
**Dependensi:** 4  **Ukuran:** M

## Task 11: Backup & export CSV (TDD)
**Acceptance criteria:**
- [ ] Export `arus-YYYY-MM-DD.json`; import memvalidasi setiap field, file invalid ditolak, data lama utuh
- [ ] Round-trip export → import identik (test)
- [ ] Export CSV per bulan/semua: tanggal, jenis, kelompok, kategori, rekening, nominal, catatan; aman untuk koma/kutip (test)
**Dependensi:** 2  **Ukuran:** S

### ✅ Checkpoint 3 (Task 8–11): review + `accessibility-auditor`.

## Task 12: PWA & offline
**Acceptance criteria:**
- [ ] Manifest + ikon (maskable); bisa di-install di Android, iOS, desktop
- [ ] Service worker cache-first untuk aset, update otomatis saat versi baru; jalan dalam mode pesawat
**Dependensi:** 1  **Ukuran:** S

## Task 13: Rilis V1
**Acceptance criteria:**
- [ ] Semua Success Criteria V1 di `spec/SPEC.md` tercentang
- [ ] Lighthouse mobile: A11y ≥ 95, Perf ≥ 90; bundle gzip < 90 KB
**Dependensi:** semua  **Ukuran:** S

### ✅ Checkpoint Akhir: `web-performance-auditor` + pakai sendiri 2 minggu → tulis spec V1.1.

---

## Setelah V1 (direncanakan nanti, bukan sekarang)

- **V1.1 Jangka panjang:** transaksi berulang & pengingat · target tabungan · laporan tahunan · kekayaan bersih
- **V1.2 Profesional:** utang-piutang · buku Pribadi/Usaha · tanda reimburse · kunci PIN · laporan periode bebas
- **V2:** Play Store (TWA) · backup Google Drive · foto struk

## Risiko

| Risiko | Mitigasi |
|---|---|
| Data hilang (clear browser / ganti HP) | `storage.persist()` di Task 2; pengingat backup bulanan di Atur |
| Bug zona waktu (tanggal geser) | Tanggal disimpan `YYYY-MM-DD` lokal, tidak pernah lewat `toISOString()` |
| Desain jatuh jadi template / tiruan bank | Gate desain di Checkpoint 1 |
| Scope membengkak karena fitur V1.1/V1.2 | Ditolak di V1; dicatat ke backlog |
