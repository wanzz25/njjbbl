WANZZ DEPLOY — Cara Pakai
==========================

Project ini sekarang punya backend asli (folder /api), bukan simulasi.
Supaya dashboard bisa terhubung ke GitHub/Vercel/Netlify sungguhan,
project ini HARUS di-deploy sebagai project Vercel (bukan dibuka
sebagai file index.html lokal).

Langkah lengkap ada di file: README-BACKEND.md

Ringkasnya:
1. Push folder ini ke repo GitHub.
2. Import repo itu ke https://vercel.com/new lalu Deploy.
3. Buat GITHUB_TOKEN, VERCEL_DEPLOY_HOOK, NETLIFY_BUILD_HOOK (caranya
   ada di README-BACKEND.md).
4. Masukkan ketiganya sebagai Environment Variable di project Vercel
   ini, lalu redeploy.
5. Buka URL project-nya — status API, daftar repo, dan tombol Deploy
   sekarang beneran nyambung.

Kalau environment variable belum diisi, dashboard akan menunjukkan
status "NOT CONFIGURED" apa adanya — bukan pura-pura connected.
