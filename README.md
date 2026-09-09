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

## Canonical URL structure (IMPORTANT)

The canonical URL style of this site is **directory-based, with trailing slash**:

- Calculator pages: `/en/`, `/ja/`, `/ko/`, `/th/`, `/zhj/`, `/zhf/`
- Trust pages: `/en/about/`, `/en/privacy/` (same pattern for all 6 languages)
- Guides & tools: `/en/guide/<slug>/`, `/en/tools/<slug>/`

The legacy `about.html` / `privacy.html` files are **redirect stubs only**
(meta refresh + canonical pointing to the directory URL). Do not link to them.

### 301 redirects

`_redirects` (site root) maps the 12 legacy URLs to their canonical
directory versions with a permanent 301:

- Supported natively by **Cloudflare Pages** and **Netlify** - just deploy as-is.
- **Apache** (.htaccess):

  ```apache
  Redirect 301 /en/about.html /en/about/
  # ... repeat for each line in _redirects
  ```

- **nginx**:

  ```nginx
  rewrite ^/en/about\.html$ /en/about/ permanent;
  # ... repeat for each line in _redirects
  ```

After deploying, verify one redirect (e.g. `curl -I https://your-domain/en/about.html`)
and resubmit `sitemap.xml` in Google Search Console.

## Brand

The site brand is **RefundJapan** (logo + footer on all pages).
The language selector at `/` is the `x-default` target for the homepage hreflang cluster.

