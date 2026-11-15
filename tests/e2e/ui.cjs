// Read-only UI sweep of warcraftexports.com. No form submissions, no orders.
const path = require('path');
const fs = require('fs');

const { chromium } = require('@playwright/test');

const BASE = process.env.BASE || 'http://localhost:3000';
const OUT = path.join(__dirname, '..', '..', 'test-results', 'e2e');
const SHOTS = path.join(OUT, 'shots');
fs.mkdirSync(SHOTS, { recursive: true });

const sitemap = fs.readFileSync(process.argv[2], 'utf8').trim().split(/\r?\n/);
const nonProduct = sitemap.filter(u => !u.includes('/product/'));
const products = sitemap.filter(u => u.includes('/product/'));
const sampleProducts = [0, 30, 60, 100, 150, 200].map(i => products[i]).filter(Boolean);
const extra = ['/cart', '/checkout', '/login', '/search?q=holster', '/shop?sort=price_asc', '/this-page-does-not-exist-xyz'].map(p => BASE + p);
const pages = [...nonProduct, ...sampleProducts, ...extra];

const VIEWPORTS = [
  { name: 'mobile', width: 375, height: 812, isMobile: true, hasTouch: true },
  { name: 'tablet', width: 768, height: 1024, isMobile: true, hasTouch: true },
  { name: 'desktop', width: 1440, height: 900, isMobile: false, hasTouch: false },
];
const SHOT_PATHS = ['/', '/shop', '/sale', '/wholesale', '/cart', '/checkout', '/about', '/contact'];
const BLOCK = /posthog|\/ingest\/|_vercel\/insights|_vercel\/speed-insights|vitals\.vercel/i;
const BANNED = [/field reports?/i, /requisition/i, /archival specification/i, /frequently issued/i, /\blogistics\b/i, /\bOEM\b/, /\bmilitary\b/i];

async function auditPage(ctx, url, vp) {
  const page = await ctx.newPage();
  const r = { url: url.replace(BASE, '') || '/', vp: vp.name, consoleErrors: [], pageErrors: [], failed: [] };
  page.on('console', m => { if (m.type() === 'error') r.consoleErrors.push(m.text().slice(0, 200)); });
  page.on('pageerror', e => r.pageErrors.push(String(e.message).slice(0, 200)));
  page.on('response', res => {
    const s = res.status();
    if (s >= 400 && !BLOCK.test(res.url())) r.failed.push(`${s} ${res.url().replace(BASE, '').slice(0, 150)}`);
  });
  const t0 = Date.now();
  try {
    const resp = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 120000 });
    r.status = resp ? resp.status() : null;
    r.finalUrl = page.url().replace(BASE, '');
    await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
    r.loadMs = Date.now() - t0;
    // scroll to trigger lazy content / GSAP
    await page.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 700) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 60)); } window.scrollTo(0, 0); });
    await page.waitForTimeout(500);
    Object.assign(r, await page.evaluate(() => {
      const vw = document.documentElement.clientWidth;
      const overflowEls = [];
      if (document.documentElement.scrollWidth > vw + 1) {
        for (const el of document.querySelectorAll('body *')) {
          const b = el.getBoundingClientRect();
          if (b.width > 0 && b.right > vw + 2 && getComputedStyle(el).position !== 'fixed') {
            overflowEls.push(`${el.tagName.toLowerCase()}${el.id ? '#' + el.id : ''}.${String(el.className).split(' ').slice(0, 3).join('.')} right=${Math.round(b.right)}`);
            if (overflowEls.length >= 4) break;
          }
        }
      }
      const imgs = [...document.images];
      const tapSmall = [...document.querySelectorAll('a,button')].filter(e => { const b = e.getBoundingClientRect(); return b.width > 0 && b.height > 0 && (b.height < 24 || b.width < 24) && getComputedStyle(e).visibility !== 'hidden'; }).length;
      return {
        title: document.title,
        metaDesc: document.querySelector('meta[name="description"]')?.content || '',
        canonical: document.querySelector('link[rel="canonical"]')?.href || '',
        h1: [...document.querySelectorAll('h1')].map(h => h.innerText.trim().slice(0, 80)),
        hScroll: document.documentElement.scrollWidth - vw,
        overflowEls,
        brokenImgs: imgs.filter(i => i.complete && i.naturalWidth === 0 && i.currentSrc).map(i => i.currentSrc.slice(0, 140)),
        noAlt: imgs.filter(i => !i.hasAttribute('alt')).length,
        unlabeledButtons: [...document.querySelectorAll('button')].filter(b => !b.innerText.trim() && !b.getAttribute('aria-label') && !b.getAttribute('title')).length,
        unlabeledInputs: [...document.querySelectorAll('input:not([type=hidden]),select,textarea')].filter(i => !i.labels?.length && !i.getAttribute('aria-label') && !i.getAttribute('placeholder')).length,
        tapSmall,
        links: [...document.querySelectorAll('a[href]')].map(a => a.href).filter(h => h.startsWith(location.origin)),
        text: document.body.innerText,
      };
    }));
    r.banned = [];
    for (const re of BANNED) { const m = r.text.match(new RegExp(`.{0,40}${re.source}.{0,40}`, re.flags.includes('i') ? 'i' : '')); if (m) r.banned.push(m[0].replace(/\s+/g, ' ')); }
    delete r.text;
    const p = new URL(url).pathname;
    if (SHOT_PATHS.includes(p) || url === sampleProducts[0]) {
      const name = `${vp.name}_${(p === '/' ? 'home' : p.slice(1).replace(/\//g, '_')).slice(0, 60)}.png`;
      await page.screenshot({ path: path.join(SHOTS, name), fullPage: vp.name !== 'tablet' });
    }
  } catch (e) { r.error = String(e.message).slice(0, 200); }
  await page.close();
  return r;
}

(async () => {
  const browser = await chromium.launch();
  const results = [];
  for (const vp of VIEWPORTS) {
    const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, isMobile: vp.isMobile, hasTouch: vp.hasTouch, userAgent: vp.isMobile ? 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1 WE-QA' : undefined });
    await ctx.route(BLOCK, r => r.abort());
    const queue = [...pages];
    const workers = Array.from({ length: Number(process.env.WORKERS || 3) }, async () => { while (queue.length) { const u = queue.shift(); results.push(await auditPage(ctx, u, vp)); process.stdout.write('.'); } });
    await Promise.all(workers);
    await ctx.close();
  }
  await browser.close();
  fs.writeFileSync(path.join(OUT, 'ui-results.json'), JSON.stringify(results, null, 1));
  console.log('\nDone', results.length);
})();
