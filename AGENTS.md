# AGENTS.md — Arus

Aplikasi keuangan pribadi bergaya m-banking (PWA, offline, data hanya di perangkat). Baca file ini di awal setiap sesi.

## Dokumen (sumber kebenaran)

| File | Isi |
|---|---|
| [`spec/SPEC.md`](spec/SPEC.md) | PRD: tujuan, scope V1, model data, success criteria |
| [`spec/categories.md`](spec/categories.md) | Kategori & rekening default |
| [`tasks/plan.md`](tasks/plan.md) | Task berurutan + checkpoint |
| [`docs/workflow.md`](docs/workflow.md) | Alur DEFINE → SHIP + prompt siap pakai |
| [`docs/skills.md`](docs/skills.md) | Skill agent-skills yang dipakai per fase |
| [`docs/design-rules.md`](docs/design-rules.md) | Konsep visual "Rekening", tokens, larangan |
| [`docs/coding-rules.md`](docs/coding-rules.md) | Gaya kode, aturan uang/tanggal, git |

## Aturan Inti

- Kerjakan **satu task** dari `tasks/plan.md` per sesi; jangan keluar dari scope task.
- `npm test && npm run build` harus hijau sebelum commit.
- Setelah task selesai & hijau: **commit lalu `git push`** sendiri (push ke `main` = deploy). Jangan push jika merah; jangan `--force`.
- Uang = integer Rupiah. Tanggal = `YYYY-MM-DD` lokal. Saldo selalu dihitung.
- Hanya pakai design tokens; patuhi daftar larangan di `design-rules.md`.
- **Tanya dulu:** dependency baru, ubah bentuk `Db`, ubah tokens.
- **Jangan pernah:** kirim data ke luar perangkat, simpan uang sebagai float, hapus test gagal.
