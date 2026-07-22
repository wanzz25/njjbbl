// GET /api/status
// Melaporkan status koneksi (terkonfigurasi atau tidak) TANPA PERNAH
// mengembalikan nilai token/secret aslinya ke browser.
module.exports = async function handler(req, res) {
  const githubConfigured = Boolean(process.env.GITHUB_TOKEN);
  const vercelConfigured = Boolean(process.env.VERCEL_DEPLOY_HOOK);
  const netlifyConfigured = Boolean(process.env.NETLIFY_BUILD_HOOK);

  let githubUser = null;
  if (githubConfigured) {
    try {
      const r = await fetch("https://api.github.com/user", {
        headers: {
          Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
          "User-Agent": "wanzz-deploy",
          Accept: "application/vnd.github+json",
        },
      });
      if (r.ok) {
        const u = await r.json();
        githubUser = u.login;
      }
    } catch (err) {
      // diamkan; githubUser tetap null kalau gagal, status koneksi tetap dilaporkan apa adanya
    }
  }

  res.status(200).json({
    github: { configured: githubConfigured, status: githubConfigured ? "CONNECTED" : "NOT CONFIGURED" },
    vercel: { configured: vercelConfigured, status: vercelConfigured ? "READY TO USE" : "NOT CONFIGURED" },
    netlify: { configured: netlifyConfigured, status: netlifyConfigured ? "CONNECTED" : "NOT CONFIGURED" },
    githubUser,
  });
};
