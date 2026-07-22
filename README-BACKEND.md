# Wanzz Deploy — Menghubungkan ke Backend Asli

Folder `/api` di project ini berisi 3 serverless function yang jalan di
Vercel. Ini yang membuat dashboard **benar-benar** terhubung ke GitHub,
Vercel, dan Netlify — bukan simulasi lagi.

```
/api/status.js   → GET  → lapor status koneksi (tanpa expose token)
/api/repos.js    → GET  → ambil daftar repo asli dari GitHub kamu
/api/deploy.js   → POST → picu Deploy Hook (Vercel) / Build Hook (Netlify)
```

**PENTING:** Karena ini pakai serverless function, seluruh project (folder
ini, termasuk `index.html`, `style.css`, `script.js`, dan `/api`) HARUS
di-deploy sebagai **1 project Vercel**. Endpoint `/api/...` tidak akan
jalan kalau kamu cuma buka `index.html` sebagai file lokal di browser,
atau upload terpisah ke Netlify — karena Netlify butuh format function
yang beda (lihat catatan di bagian bawah kalau kamu tetap mau host di
Netlify).

---

## Langkah 1 — Push project ini ke GitHub

```bash
git init
git add .
git commit -m "wanzz deploy"
git branch -M main
git remote add origin https://github.com/USERNAME/wanzz-deploy.git
git push -u origin main
```

## Langkah 2 — Import ke Vercel

1. Buka https://vercel.com/new
2. Pilih repo GitHub yang tadi kamu push
3. Klik **Deploy** (biarkan setting default — Vercel otomatis mengenali
   folder `/api` sebagai serverless functions)

## Langkah 3 — Buat token & hook yang dibutuhkan

### GitHub Token (untuk `/api/status` dan `/api/repos`)
1. Buka https://github.com/settings/tokens → **Generate new token (classic)**
2. Centang scope **repo** (atau **public_repo** kalau cuma perlu repo publik)
3. Generate, lalu copy tokennya (bentuknya `ghp_...` atau `github_pat_...`)

### Vercel Deploy Hook (untuk tombol "Deploy to Vercel")
1. Di project **target deploy** kamu di Vercel (bukan project Wanzz Deploy
   ini, tapi project lain yang mau di-deploy tombolnya) → **Settings** →
   **Git** → **Deploy Hooks**
2. Buat hook baru, kasih nama bebas, pilih branch (misal `main`)
3. Copy URL hook-nya (bentuknya `https://api.vercel.com/v1/integrations/deploy/...`)

### Netlify Build Hook (untuk tombol "Deploy to Netlify")
1. Di site **target deploy** kamu di Netlify → **Site configuration** →
   **Build & deploy** → **Build hooks**
2. Buat hook baru, kasih nama bebas, pilih branch
3. Copy URL hook-nya (bentuknya `https://api.netlify.com/build_hooks/...`)

## Langkah 4 — Masukkan sebagai Environment Variable di Vercel

Di project **Wanzz Deploy** ini di Vercel → **Settings** → **Environment
Variables**, tambahkan:

| Key                  | Value                                      |
|----------------------|---------------------------------------------|
| `GITHUB_TOKEN`       | token dari Langkah 3 (`ghp_...`)            |
| `VERCEL_DEPLOY_HOOK` | URL hook dari Langkah 3                     |
| `NETLIFY_BUILD_HOOK` | URL hook dari Langkah 3                     |

Setelah menambahkan, **redeploy** project ini (Vercel → Deployments →
tombol titik tiga → Redeploy) supaya environment variable-nya terpakai.

## Langkah 5 — Selesai

Buka URL project Wanzz Deploy kamu, tekan Quick Access. Panel API Status
akan menunjukkan status asli (CONNECTED kalau env var sudah diisi), panel
Pilih Repository akan berisi repo asli dari GitHub kamu, dan tombol Deploy
akan benar-benar memicu build di Vercel/Netlify.

---

## Catatan penting soal keterbatasan

- **Satu Deploy Hook = satu project tetap.** Tombol "Deploy to Vercel"
  selalu memicu project Vercel yang hook-nya kamu pasang di
  `VERCEL_DEPLOY_HOOK`, terlepas dari repo mana yang kamu pilih di UI.
  Kalau mau tombol deploy mengarah ke project berbeda sesuai repo yang
  dipilih, isi environment variable `REPO_HOOK_MAP` (format JSON) di
  Vercel, contoh:

  ```json
  {"usernamekamu/repo-a":"https://api.vercel.com/v1/integrations/deploy/xxx","usernamekamu/repo-b":"https://api.netlify.com/build_hooks/yyy"}
  ```

- **Tidak ada live build log di dashboard ini.** Deploy Hook cuma memicu
  build; log detailnya tetap harus dicek langsung di dashboard
  Vercel/Netlify masing-masing (link dashboard mereka, bukan dashboard
  Wanzz Deploy ini).

- **Kalau mau full API deploy (upload file langsung tanpa Git)** — itu
  butuh implementasi lebih besar lagi (upload file ke Vercel API /
  Netlify API secara langsung, bukan lewat Deploy Hook). Kabari saya
  kalau memang perlu ke arah situ, itu langkah lanjutan yang terpisah.

- **Kalau mau host di Netlify, bukan Vercel** — struktur function-nya
  perlu diubah ke format Netlify Functions (folder `netlify/functions`,
  format handler berbeda). File di `/api` saat ini ditulis untuk runtime
  Vercel.
