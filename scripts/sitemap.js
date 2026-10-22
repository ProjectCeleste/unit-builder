import { writeFileSync } from "node:fs"

const urls = ["https://unitstats.projectceleste.com"]
const lastmod = new Date().toISOString()

const entries = urls
  .map(
    loc =>
      `<url><loc>${loc}</loc><lastmod>${lastmod}</lastmod><changefreq>weekly</changefreq><priority>1.0</priority></url>`
  )
  .join("")

writeFileSync(
  "public/sitemap.xml",
  `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${entries}</urlset>`
)
