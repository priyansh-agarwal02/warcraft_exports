// Read-only security probes against warcraftexports.com. GET requests only (plus browser loads). No writes.
const path = require('path');
const fs = require('fs');

const { chromium } = require('@playwright/test');
const BASE = process.env.BASE || 'http://localhost:3000';
const OUT = path.join(__dirname, '..', '..', 'test-results', 'e2e');
fs.mkdirSync(OUT, { recursive: true });
const R = {};
const get = (u, o = {}) => fetch(u, { redirect: 'manual', ...o });

(async () => {
  // 1. Security headers
  const home = await get(BASE + '/');
  R.headers = {};
  for (const h of ['strict-transport-security', 'content-security-policy', 'x-frame-options', 'x-content-type-options', 'referrer-policy', 'permissions-policy', 'x-powered-by', 'server', 'access-control-allow-origin'])
    R.headers[h] = home.headers.get(h);
  const csp = R.headers['content-security-policy'] || '';
  R.cspNotes = { unsafeInline: /script-src[^;]*'unsafe-inline'/.test(csp), unsafeEval: /script-src[^;]*'unsafe-eval'/.test(csp), frameAncestors: /frame-ancestors/.test(csp), objectSrc: /object-src/.test(csp), baseUri: /base-uri/.test(csp) };
  R.httpRedirect = await get('http://warcraftexports.com/').then(r => `${r.status} -> ${r.headers.get('location')}`);

  // 2. Protected pages while logged out
  R.protectedPages = {};
  for (const p of ['/admin', '/admin/orders', '/admin/customers', '/admin/settings', '/account', '/account/orders', '/account/addresses', '/account/settings']) {
    const r = await get(BASE + p);
    R.protectedPages[p] = `${r.status} -> ${r.headers.get('location') || '(no redirect)'}`;
  }

  // 3. API routes without login (GET only)
  R.apis = {};
  const apis = ['/api/admin/analytics', '/api/admin/catalog', '/api/admin/catalog/data', '/api/admin/dashboard', '/api/admin/products', '/api/admin/products/images', '/api/admin/variants', '/api/admin/sale/products', '/api/admin/sale/settings', '/api/admin/ai-describe', '/api/admin/products/upload',
    '/api/addresses', '/api/checkout/user-data', '/api/orders', '/api/promotions', '/api/sale', '/api/shipping-rates', '/api/chat', '/api/newsletter/subscribe', '/api/auth/register', '/api/auth/welcome', '/api/uploadthing', '/api/payment/paypal/create-order', '/api/payment/razorpay/verify'];
  for (const a of apis) {
    const r = await get(BASE + a);
    const body = (await r.text()).slice(0, 160).replace(/\s+/g, ' ');
    R.apis[a] = `${r.status} ${body}`;
  }

  // 4. Sensitive files
  R.files = {};
  for (const f of ['/.env', '/.env.local', '/.env.production', '/.git/config', '/.git/HEAD', '/package.json', '/next.config.ts', '/supabase/migrations', '/.vercel/project.json', '/robots.txt', '/_next/static/../../.env', '/server.js', '/.well-known/security.txt'])
    { const r = await get(BASE + f); R.files[f] = r.status; }
  R.robots = await (await fetch(BASE + '/robots.txt')).text();

  // 5. Secrets in client JS + Supabase public config
  const browser = await chromium.launch();
  const ctx = await browser.newContext();
  await ctx.route(/posthog|\/ingest\/|_vercel\/insights/, r => r.abort());
  const scripts = new Set();
  ctx.on('response', r => { if (/\.js(\?|$)/.test(r.url()) && r.url().startsWith(BASE)) scripts.add(r.url()); });
  const pg = await ctx.newPage();
  for (const p of ['/', '/shop', '/checkout', '/login', '/account', '/wholesale', '/contact', '/admin', '/track-order'])
    { await pg.goto(BASE + p, { waitUntil: 'networkidle', timeout: 120000 }).catch(() => {}); }
  // also chunks referenced by the HTML
  for (const p of ['/', '/checkout', '/login', '/admin']) {
    const html = await (await fetch(BASE + p)).text();
    for (const m of html.matchAll(/\/_next\/static\/[^"'\s]+\.js/g)) scripts.add(BASE + m[0]);
  }
  const PATTERNS = {
    stripeSecret: /sk_(live|test)_[0-9a-zA-Z]{10,}/g, stripeWebhook: /whsec_[0-9a-zA-Z]{10,}/g,
    resendKey: /re_[0-9a-zA-Z]{8,}_[0-9a-zA-Z]{8,}/g, groqKey: /gsk_[0-9a-zA-Z]{20,}/g,
    uploadthingSecret: /sk_live_[0-9a-f]{20,}/g, razorpaySecretName: /RAZORPAY_KEY_SECRET|PAYPAL_CLIENT_SECRET|SUPABASE_SERVICE_ROLE_KEY|CRON_SECRET/g,
    awsKey: /AKIA[0-9A-Z]{16}/g, privateKey: /-----BEGIN [A-Z ]*PRIVATE KEY-----/g,
    jwt: /eyJ[A-Za-z0-9_-]{10,}\.eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/g,
    sourceMap: /sourceMappingURL=/g,
  };
  R.bundle = { scriptsScanned: scripts.size, hits: {}, jwtRoles: [] };
  let supaUrl = null, anon = null;
  for (const s of scripts) {
    const t = await (await fetch(s)).text();
    for (const [k, re] of Object.entries(PATTERNS)) {
      const m = t.match(re);
      if (m) R.bundle.hits[k] = (R.bundle.hits[k] || 0) + m.length;
      if (k === 'jwt' && m) for (const j of m) {
        try { const role = JSON.parse(Buffer.from(j.split('.')[1], 'base64url').toString()).role; R.bundle.jwtRoles.push(role); if (role === 'anon') anon = j; } catch {}
      }
    }
    const u = t.match(/https:\/\/[a-z0-9]{20}\.supabase\.co/); if (u) supaUrl = u[0];
  }
  R.bundle.jwtRoles = [...new Set(R.bundle.jwtRoles)];
  // sourcemaps publicly served?
  const anyChunk = [...scripts][0];
  if (anyChunk) R.bundle.sourceMapServed = (await get(anyChunk + '.map')).status;

  // 6. Supabase RLS: can an anonymous visitor READ each table? (GET, limit 1, no row data saved)
  R.rls = {};
  R.supabase = { url: supaUrl ? supaUrl.replace(/\/\/([a-z0-9]{4})[a-z0-9]+/, '//$1****') : null, anonKeyFound: !!anon };
  if (supaUrl && anon) {
    const tables = 'addresses admin_activity_log blog_posts brand_partners brand_stats catalog_settings categories chat_messages chat_sessions contact_messages content_blocks coupon_uses coupons discount_campaigns exchange_rates newsletter_subscribers order_items orders page_seo product_categories product_images product_relations product_variants products quantity_promotions refunds reviews shipping_rates site_settings user_profiles profiles wholesale_inquiries wishlists'.split(' ');
    for (const t of tables) {
      const r = await fetch(`${supaUrl}/rest/v1/${t}?select=*&limit=1`, { headers: { apikey: anon, Authorization: `Bearer ${anon}`, Prefer: 'count=exact' } });
      const body = await r.text();
      let rows = null, cols = [];
      try { const j = JSON.parse(body); if (Array.isArray(j)) { rows = j.length; cols = j[0] ? Object.keys(j[0]) : []; } } catch {}
      R.rls[t] = { status: r.status, total: r.headers.get('content-range'), rowsReturned: rows, columns: cols.join(',').slice(0, 300) };
    }
    // Is auth signup open, and are listed RPC functions callable? (read-only settings endpoint)
    const s = await fetch(`${supaUrl}/auth/v1/settings`, { headers: { apikey: anon } });
    R.supabase.authSettings = s.ok ? await s.json() : s.status;
    // anon access to storage buckets list
    const b = await fetch(`${supaUrl}/storage/v1/bucket`, { headers: { apikey: anon, Authorization: `Bearer ${anon}` } });
    R.supabase.storageBuckets = `${b.status} ${(await b.text()).slice(0, 200)}`;
  }

  // 7. Reflected XSS in search / shop / track-order / login (harmless marker)
  R.xss = {};
  const payload = `"><img src=x onerror="window.__WEXSS=1">`;
  for (const p of [`/search?q=`, `/shop?search=`, `/shop?sort=`, `/track-order?order=`, `/login?redirectTo=`, `/shop?nation=`, `/shop?category=`]) {
    const pg2 = await ctx.newPage();
    await pg2.goto(BASE + p + encodeURIComponent(payload), { waitUntil: 'networkidle', timeout: 120000 }).catch(() => {});
    const fired = await pg2.evaluate(() => window.__WEXSS === 1).catch(() => 'n/a');
    const raw = await (await fetch(BASE + p + encodeURIComponent(payload))).text();
    R.xss[p] = { executed: fired, rawUnescapedInHtml: raw.includes('<img src=x onerror=') };
    await pg2.close();
  }
  // 8. Open redirect param presence on login (code shows unvalidated redirectTo after login)
  R.loginRedirectParam = (await get(BASE + '/login?redirectTo=https://example.com')).status;

  // 9. Clickjacking: can the site be framed?
  R.framing = { xfo: R.headers['x-frame-options'], cspFrameAncestors: (csp.match(/frame-ancestors[^;]*/) || [null])[0] };

  // 10. Cookies set to anonymous visitor
  const cookies = await ctx.cookies(BASE);
  R.cookies = cookies.map(c => `${c.name} secure=${c.secure} httpOnly=${c.httpOnly} sameSite=${c.sameSite}`);

  await browser.close();
  fs.writeFileSync(path.join(OUT, 'sec-results.json'), JSON.stringify(R, null, 1));
  console.log(JSON.stringify(R, null, 1));
})();
