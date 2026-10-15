# ifs24056-pabwe2026-sk-p6-svelte

Studi Kasus 1 — **Delcom Link Tree** (Svelte 5 + Vite + JavaScript), Praktikum 6 PABWE 2026.

## Menjalankan
```bash
bun install
bun run dev          # http://localhost:3004
bun run test         # jalankan test (jangan pakai `bun test`)
bun run test:coverage  # wajib 100% (statements, branches, functions, lines)
bun run build && bun run preview
```

Environment (`.env`): `VITE_DELCOM_BASEURL=https://open-api.delcom.org/api/v1`, `APP_PORT=3004`.

## Struktur
`src/helpers`, `src/hooks`, `src/features/{auth,common,users,linktrees}`, `src/router.js` (router kustom History API), `src/App.svelte`.
State memakai Svelte store (`writable`), token disimpan di `localStorage` lewat `apiHelper`.
