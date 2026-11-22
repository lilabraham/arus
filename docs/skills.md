# Skill yang Dibutuhkan

Sumber: [addyosmani/agent-skills](https://github.com/addyosmani/agent-skills) (26 skill).
Proyek ini **hanya butuh 11**. Sisanya untuk tim/production besar — sengaja tidak dipakai.

## Instalasi (Antigravity CLI)

```bash
agy plugin install https://github.com/addyosmani/agent-skills.git
agy plugin list
```

Di agy, panggil skill secara langsung: `/agent-skills:<nama-skill>` (wrapper `/spec`, `/build`
dll. belum muncul di beberapa versi agy — lihat `docs/antigravity-setup.md` di repo tersebut).

## Dipakai

| Fase | Skill | Kapan dipakai di proyek ini |
|---|---|---|
| DEFINE | `interview-me` | Menjawab Open Questions di `spec/SPEC.md` satu per satu |
| DEFINE | `spec-driven-development` | Finalisasi `spec/SPEC.md` (sudah di-draft) |
| PLAN | `planning-and-task-breakdown` | Menjaga `tasks/plan.md` & `tasks/todo.md` |
| BUILD | `incremental-implementation` | Satu task = satu irisan vertikal = satu commit |
| BUILD | `test-driven-development` | Wajib untuk `src/lib/*` (jalur uang) |
| BUILD | `frontend-ui-engineering` | Semua layar & komponen; patuhi `docs/design-rules.md` |
| VERIFY | `debugging-and-error-recovery` | Saat test/build gagal — akar masalah, bukan tambal gejala |
| VERIFY | `browser-testing-with-devtools` | Cek manual per task (mobile viewport, offline) |
| VERIFY | `accessibility-engineering` | Checkpoint 3 & sebelum rilis |
| REVIEW | `code-review-and-quality` + `code-simplification` | Setiap checkpoint |
| SHIP | `shipping-and-launch` | Deploy Cloudflare Pages (sejak Task 1) + checklist rilis |

Plus dari luar repo: **`ponytail`** (aktif terus) — pilih solusi paling sederhana yang benar.

## Persona (folder `agents/` di repo)

Dipakai saat review checkpoint saja, bukan setiap task:

- `code-reviewer` — tiap checkpoint
- `accessibility-auditor` — checkpoint 3 & rilis
- `web-performance-auditor` — rilis

## Sengaja TIDAK dipakai

| Skill | Alasan |
|---|---|
| `api-and-interface-design` | Tidak ada API/server |
| `security-and-hardening` | Tidak ada auth/server; satu-satunya trust boundary = import JSON (ditangani di spec) |
| `ci-cd-and-automation` | Deploy otomatis sudah ditangani integrasi GitHub → Cloudflare Pages; test tetap dijalankan lokal sebelum push |
| `observability-and-instrumentation` | Tidak ada server untuk dipantau |
| `deprecation-and-migration` | Belum ada versi lama |
| `constraint-driven-development` | Batas kualitas sudah tertulis di Success Criteria spec |
| `performance-optimization` | Ukur dulu di rilis; aktifkan hanya jika target Lighthouse gagal |
| `context-engineering`, `source-driven-development`, `doubt-driven-development`, `documentation-and-adrs`, `git-workflow-and-versioning`, `idea-refine` | Overhead untuk proyek 1 orang; aturan git ringkas ada di `docs/coding-rules.md` |
