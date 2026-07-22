// GET /api/repos
// Mengambil daftar repo asli dari akun GitHub yang terhubung lewat GITHUB_TOKEN
// (Personal Access Token, scope minimal: "repo" untuk repo privat, atau
// "public_repo" kalau cuma perlu repo publik). Token TIDAK PERNAH dikirim
// ke browser — hanya dipakai di sisi server untuk memanggil GitHub API.
module.exports = async function handler(req, res) {
  const token = process.env.GITHUB_TOKEN;

  if (!token) {
    return res.status(200).json({ configured: false, repos: [] });
  }

  try {
    const ghRes = await fetch(
      "https://api.github.com/user/repos?sort=updated&per_page=20",
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "User-Agent": "wanzz-deploy",
          Accept: "application/vnd.github+json",
        },
      }
    );

    if (!ghRes.ok) {
      const detail = await ghRes.text();
      return res.status(502).json({
        configured: true,
        error: `GitHub API merespons status ${ghRes.status}`,
        detail,
      });
    }

    const data = await ghRes.json();
    const repos = data.map((r) => ({
      fullName: r.full_name,
      name: r.name,
      branch: r.default_branch,
      language: r.language || "—",
      private: r.private,
      updatedAt: r.updated_at,
      htmlUrl: r.html_url,
    }));

    res.status(200).json({ configured: true, repos });
  } catch (err) {
    res.status(500).json({
      configured: true,
      error: "Gagal menghubungi GitHub API dari server.",
      detail: String(err),
    });
  }
};
