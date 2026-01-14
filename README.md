# Japan Tax Refund Calculator (static)

## Domain quick switch (robots.txt + sitemap.xml)

Sitemaps should use absolute URLs (protocol + domain).  
If you deploy this site to a new domain, run **one command** to update both files:

### Windows
- `tools\set-domain.bat https://example.com`

### Mac/Linux
- `python3 tools/set-domain.py https://example.com`

This will replace the existing origin (e.g. `https://refundjapan.com`) in:
- `robots.txt` (Sitemap line)
- `sitemap.xml` (`<loc>` and `hreflang` links)
