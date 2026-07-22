// POST /api/deploy   body: { "target": "vercel" | "netlify" }
//
// Cara kerja ini pakai pendekatan "Deploy Hook" (Vercel) / "Build Hook"
// (Netlify): URL rahasia sekali-pakai-arah yang kamu ambil dari dashboard
// project Vercel/Netlify kamu sendiri, disimpan sebagai environment
// variable di server (VERCEL_DEPLOY_HOOK / NETLIFY_BUILD_HOOK). Endpoint
// ini hanya meneruskan permintaan POST ke hook itu — memicu Vercel/Netlify
// benar-benar menarik source terbaru dari repo yang SUDAH kamu hubungkan
// di dashboard mereka, lalu build & deploy seperti biasa.
//
// PENTING — batasan jujur:
// Deploy Hook selalu terikat ke SATU project yang sudah dikonfigurasi di
// dashboard Vercel/Netlify (bukan ke sembarang repo yang dipilih user di
// UI). Kalau kamu mau tombol "pilih repo" benar-benar mengarahkan deploy
// ke repo berbeda-beda, kamu perlu bikin lebih dari satu Deploy Hook (satu
// per project) dan memetakannya di REPO_HOOK_MAP di bawah.
module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method not allowed, gunakan POST." });
  }

  let body = req.body;
  if (typeof body === "string") {
    try { body = JSON.parse(body); } catch { body = {}; }
  }
  body = body || {};

  const target = String(body.target || "").toLowerCase();
  const repoFullName = body.repoFullName || null;

  // --- opsional: pemetaan repo -> deploy hook tertentu ---
  // Isi lewat environment variable REPO_HOOK_MAP berformat JSON, contoh:
  // {"wanzz25/portfolio-site":"https://api.vercel.com/v1/integrations/deploy/xxx"}
  let repoHookMap = {};
  try {
    if (process.env.REPO_HOOK_MAP) repoHookMap = JSON.parse(process.env.REPO_HOOK_MAP);
  } catch { /* biarkan kosong kalau format env salah */ }

  let hookUrl = null;
  if (repoFullName && repoHookMap[repoFullName]) {
    hookUrl = repoHookMap[repoFullName];
  } else if (target === "vercel") {
    hookUrl = process.env.VERCEL_DEPLOY_HOOK;
  } else if (target === "netlify") {
    hookUrl = process.env.NETLIFY_BUILD_HOOK;
  }

  if (!hookUrl) {
    return res.status(400).json({
      ok: false,
      error: `Deploy hook untuk target "${target}" belum diatur di environment variable server (VERCEL_DEPLOY_HOOK / NETLIFY_BUILD_HOOK / REPO_HOOK_MAP).`,
    });
  }

  try {
    const hookRes = await fetch(hookUrl, { method: "POST" });
    const rawText = await hookRes.text();
    let parsed;
    try { parsed = JSON.parse(rawText); } catch { parsed = { raw: rawText }; }

    if (!hookRes.ok) {
      return res.status(502).json({
        ok: false,
        error: `Hook merespons status ${hookRes.status}`,
        detail: parsed,
      });
    }

    res.status(200).json({ ok: true, target, response: parsed });
  } catch (err) {
    res.status(500).json({ ok: false, error: "Gagal memanggil deploy hook.", detail: String(err) });
  }
};
