# Aturan Penulisan Kode

## Prinsip

1. **Paling sederhana yang benar.** Stdlib → fitur native browser → dependency yang ada → baru tulis kode.
2. **Tanpa abstraksi spekulatif.** Tidak ada interface dengan satu implementasi, tidak ada "untuk nanti".
3. **Logika murni di `src/lib/`, UI di `screens/` & `components/`.** Komponen tidak menghitung uang.
4. **Satu sumber data.** Hanya `store.ts` yang menyentuh `localStorage`.

## TypeScript

- `strict: true`, tanpa `any` (pakai `unknown` + narrowing di batas import data).
- `interface` untuk bentuk data, `type` untuk union.
- Named export saja; satu komponen per file; nama file komponen `PascalCase.tsx`, lib `camelCase.ts`.

## Uang & Tanggal (aturan keras)

- Uang = **integer Rupiah**. Tidak pernah `parseFloat`, tidak pernah `toFixed`.
- Format hanya lewat `formatRp()` di `money.ts`.
- Tanggal transaksi = string `YYYY-MM-DD` lokal. **Dilarang** `new Date().toISOString().slice(0,10)` (geser zona waktu).
- Saldo & total **selalu dihitung**, tidak pernah disimpan.

## Contoh Gaya

```ts
// src/lib/ledger.ts
import type { Account, Tx } from './types';

export function accountBalance(account: Account, txs: Tx[]): number {
  let total = account.initialBalance;
  for (const tx of txs) {
    if (tx.kind === 'in' && tx.accountId === account.id) total += tx.amount;
    if (tx.kind === 'out' && tx.accountId === account.id) total -= tx.amount;
    if (tx.kind === 'transfer') {
      if (tx.accountId === account.id) total -= tx.amount;
      if (tx.toAccountId === account.id) total += tx.amount;
    }
  }
  return total;
}
```

```tsx
// src/components/Amount.tsx
import { formatRp } from '../lib/money';

export function Amount({ value, kind }: { value: number; kind: 'in' | 'out' }) {
  return (
    <span className={`amount amount--${kind}`}>
      {kind === 'in' ? '+' : '−'}{formatRp(value)}
    </span>
  );
}
```

## React

- Function component + hooks. State global = satu `useSyncExternalStore` di atas `store.ts`. Tanpa Redux/Zustand.
- Tanpa `useEffect` untuk data turunan — hitung langsung saat render (`useMemo` hanya jika terukur lambat).
- Form pakai elemen native (`<input type="date">`, `<select>`, `inputmode="numeric"`).

## CSS

- CSS biasa, satu file per layar jika perlu, class gaya BEM ringan (`.amount--out`).
- **Hanya pakai token** dari `tokens.css`. Angka warna/spasi mentah di luar `tokens.css` = ditolak saat review.
- Tanpa CSS-in-JS, tanpa Tailwind.

## Dependency

Diizinkan: `react`, `react-dom`, `vite`, `@vitejs/plugin-react`, `typescript`, `vitest`.
Dependency lain → **tanya dulu** dan tulis alasannya di commit.

## Test

- File `*.test.ts` di sebelah file yang diuji.
- Wajib untuk semua `src/lib/*`. Kasus wajib: nol transaksi, transfer, input invalid, data rusak.
- Nama test berbahasa Indonesia, deskriptif: `it('transfer tidak dihitung sebagai pengeluaran')`.

## Git

- Satu task = satu (atau beberapa kecil) commit. Commit kecil yang selalu hijau.
- Format: `tipe(area): ringkasan` — tipe: `feat`, `fix`, `refactor`, `test`, `style`, `chore`, `docs`.
  Contoh: `feat(riwayat): grup transaksi per hari`.
- Jangan commit `dist/`, `node_modules/`, file backup JSON pribadi.

## Komentar

- Tulis *kenapa*, bukan *apa*.
- Jalan pintas yang disengaja ditandai `// ponytail: <batas>, <jalan upgrade>`.
