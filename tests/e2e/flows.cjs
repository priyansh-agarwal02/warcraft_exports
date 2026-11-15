// Shopper journey test: menu, search, filters, product -> add to cart -> cart -> checkout page.
// Read-only: stops before payment, never places an order. Usage: node flows.cjs <sitemap-list-file>
const path = require('path')
const fs = require('fs')
const { chromium } = require('@playwright/test')

const BASE = process.env.BASE || 'http://localhost:3000'
const OUT = path.join(__dirname, '..', '..', 'test-results', 'e2e')
const SHOTS = path.join(OUT, 'shots')
fs.mkdirSync(SHOTS, { recursive: true })
const products = fs.readFileSync(process.argv[2], 'utf8').trim().split(/\r?\n/).filter((u) => u.includes('/product/'))

async function journey(browser, vp) {
  const log = []
  const step = async (name, fn) => {
    try { const v = await fn(); log.push(`PASS ${name}${v ? ' — ' + v : ''}`); return true }
    catch (e) { log.push(`FAIL ${name} — ${String(e.message).split('\n')[0].slice(0, 180)}`); return false }
  }
  const ctx = await browser.newContext({ viewport: { width: vp.w, height: vp.h }, isMobile: vp.m, hasTouch: vp.m })
  await ctx.addInitScript(() => { try { localStorage.setItem('warcraft_welcome_dismissed', 'true') } catch {} })
  await ctx.route(/posthog|\/ingest\/|_vercel\/insights/, (r) => r.abort())
  const page = await ctx.newPage()
  const errs = []
  page.on('pageerror', (e) => errs.push(e.message.slice(0, 150)))
  const shot = (n) => page.screenshot({ path: path.join(SHOTS, `flow_${vp.name}_${n}.png`) })

  await page.goto(BASE + '/', { waitUntil: 'networkidle', timeout: 120000 }).catch(() => {})

  if (vp.m) {
    await step('Mobile menu opens and Track Order is clickable', async () => {
      await page.getByRole('button', { name: 'Open menu' }).click({ timeout: 8000 })
      await page.waitForTimeout(700)
      await shot('menu')
      const onTop = await page.evaluate(() => {
        const t = [...document.querySelectorAll('a,button')].find((e) => {
          const r = e.getBoundingClientRect()
          return /track/i.test(e.innerText) && r.height > 0 && r.top >= 0 && r.bottom <= innerHeight && r.left >= 0
        })
        if (!t) return 'not found'
        const r = t.getBoundingClientRect()
        const hits = [r.left + r.width / 2, r.right - 12].map((x) => t.contains(document.elementFromPoint(x, r.top + r.height / 2)))
        return hits.every(Boolean) ? 'ok' : 'covered'
      })
      if (onTop !== 'ok') throw new Error('Track Order is ' + onTop)
      await page.keyboard.press('Escape')
      return 'Track Order on top'
    })
  } else {
    await step('Desktop nav shows SHOP / WHOLESALE / ABOUT', async () => {
      const txt = (await page.locator('header').innerText()).toUpperCase()
      const missing = ['SHOP', 'WHOLESALE', 'ABOUT'].filter((w) => !txt.includes(w))
      if (missing.length) throw new Error('missing: ' + missing.join(','))
    })
    await step('SHOP mega menu opens', async () => {
      await page.locator('header :is(a,button):visible', { hasText: /^\s*shop\s*$/i }).first().click()
      await page.waitForTimeout(800)
      await shot('megamenu')
      const n = await page.locator('a[href*="/shop/"]:visible').count()
      if (!n) throw new Error('no /shop/ links visible')
      return `${n} category links visible`
    })
  }

  await step('Search "holster" returns results', async () => {
    await page.goto(BASE + '/search?q=holster', { waitUntil: 'networkidle', timeout: 120000 })
    const n = await page.locator('a[href*="/product/"]').count()
    if (!n) throw new Error('0 product links')
    return `${n} product links`
  })

  await step('Nation filter page lists products', async () => {
    await page.goto(BASE + '/shop/nation/german', { waitUntil: 'networkidle', timeout: 120000 })
    const n = await page.locator('a[href*="/product/"]').count()
    if (!n) throw new Error('0 products')
    return `${n} product links`
  })

  let added = false
  for (const u of [products[3], products[40], products[90], products[120], products[170]].filter(Boolean)) {
    await page.goto(u, { waitUntil: 'networkidle', timeout: 120000 }).catch(() => {})
    const add = page.getByRole('button', { name: /add to cart/i }).first()
    if ((await add.count()) && (await add.isEnabled().catch(() => false))) {
      added = await step(`Add to Cart on ${u.replace(BASE, '')}`, async () => {
        await add.click({ timeout: 8000 })
        await page.waitForTimeout(1500)
      })
      if (added) break
    }
  }
  if (!added) log.push('FAIL Add to Cart — no enabled Add to Cart button found on 5 sampled products')

  await step('Cart shows the item and a total', async () => {
    await page.goto(BASE + '/cart', { waitUntil: 'networkidle', timeout: 120000 })
    await shot('cart')
    const t = await page.locator('main').innerText()
    const tot = t.match(/Total\s*\$([\d.]+)/)
    if (!tot) throw new Error('no total')
    return 'total $' + tot[1]
  })

  await step('Quantity + button updates the total', async () => {
    const before = (await page.locator('main').innerText()).match(/Total\s*\$([\d.]+)/)?.[1]
    await page.getByRole('button', { name: /increase quantity/i }).first().click({ timeout: 5000 })
    await page.waitForTimeout(800)
    const after = (await page.locator('main').innerText()).match(/Total\s*\$([\d.]+)/)?.[1]
    if (before === after) throw new Error(`total unchanged ($${before})`)
    return `$${before} → $${after}`
  })

  await step('Checkout loads with form, payment options and tax notice (no payment made)', async () => {
    await page.goto(BASE + '/checkout', { waitUntil: 'networkidle', timeout: 120000 })
    await page.waitForTimeout(2000)
    await shot('checkout')
    const t = (await page.locator('body').innerText()).toLowerCase()
    const inputs = await page.locator('input').count()
    if (!inputs) throw new Error('no input fields')
    return `${inputs} inputs; paypal=${t.includes('paypal')} razorpay=${t.includes('razorpay')} tax-notice=${/duties|taxes/.test(t)}`
  })

  await step('Pressing Enter in checkout does not create an order', async () => {
    // An input inside the checkout form (not the header search box)
    await page.locator('main input[type=text], main input[type=email], form input[name]').first().press('Enter').catch(() => {})
    await page.waitForTimeout(1200)
    if (!page.url().includes('/checkout')) throw new Error('navigated to ' + page.url())
    return 'stayed on checkout'
  })

  await step('Chat widget opens (no message sent)', async () => {
    await page.goto(BASE + '/', { waitUntil: 'networkidle', timeout: 120000 })
    // force: the launcher gently bobs (animation), so it never counts as "stable" for the test tool
    await page.getByRole('button', { name: 'Chat with us' }).click({ timeout: 5000, force: true })
    await page.waitForTimeout(800)
    const box = await page.locator('textarea:visible, input[placeholder*="ask" i]:visible, input[placeholder*="message" i]:visible').count()
    if (!box) throw new Error('no chat input visible')
  })

  log.push(`JS errors during journey: ${errs.length ? [...new Set(errs)].join(' || ') : 'none'}`)
  await ctx.close()
  return { viewport: vp.name, log }
}

;(async () => {
  const browser = await chromium.launch()
  const out = []
  for (const vp of [{ name: 'mobile', w: 375, h: 812, m: true }, { name: 'desktop', w: 1440, h: 900, m: false }]) out.push(await journey(browser, vp))
  await browser.close()
  fs.writeFileSync(path.join(OUT, 'flow-results.json'), JSON.stringify(out, null, 1))
  for (const o of out) { console.log(`\n=== ${o.viewport} ===`); o.log.forEach((l) => console.log(l)) }
})()
