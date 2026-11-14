# docs.yieldguard.health content backup

Static HTML mirror of the public YieldGuard documentation wiki hosted on Eniston at
https://docs.yieldguard.health (17 pages from its sitemap), captured 2026-11-14.

Purpose: content backup only. The main site (yieldguard.health) deploys from this repo's
`main` branch; this wiki is hosted on a separate platform (Eniston), so its source does not
otherwise live in GitHub. This branch is not deployed.

Each directory matches the public URL path; `index.html` is the page exactly as served.
To re-capture, fetch each URL in https://docs.yieldguard.health/sitemap.xml.
