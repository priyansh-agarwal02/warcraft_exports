// Re-enacts order WE-MWIJUSVU: pick Standard, click pay, then try to switch to Express.
// Checkout must lock while the payment window is open and show the "close payment window" message.
// Never creates an order: /api/orders is blocked, and the order count is checked before/after.
const path = require('path')
const { chromium } = require('@playwright/test')
require('dotenv').config({ path: path.join(__dirname, '../../.env.local'), quiet: true })
const { createClient } = require('@supabase/supabase-js')

const BASE = process.env.BASE || 'http://localhost:3005'
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
const results = []
const ok = (name, pass, detail = '') => { results.push({ name, pass, detail }); console.log((pass ? 'PASS ' : 'FAIL ') + name + (detail ? ' — ' + detail : '')) }

async function orderCount() {
  const { count } = await sb.from('orders').select('id', { count: 'exact', head: true })
  return count
}

;(async () => {
  const before = await orderCount()
  const { data: prod } = await sb.from('products').select('slug').eq('id', '0d0b5299-04f5-46df-acd6-16585872228e').single()

  const browser = await chromium.launch()
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } })
  await ctx.addInitScript(() => { try { localStorage.setItem('warcraft_welcome_dismissed', 'true') } catch {} })
  const page = await ctx.newPage()
  const createBodies = []
  let ordersCalls = 0
  await ctx.route('**/api/orders', (r) => { ordersCalls++; return r.abort() })
  page.on('request', (r) => {
    if (r.url().includes('/create-order') && r.method() === 'POST') createBodies.push({ url: r.url(), body: JSON.parse(r.postData() || '{}') })
  })

  await page.goto(BASE + '/product/' + prod.slug, { waitUntil: 'networkidle', timeout: 120000 })
  await page.getByRole('button', { name: /add to cart/i }).first().click()
  await page.waitForTimeout(800)
  await page.goto(BASE + '/checkout', { waitUntil: 'networkidle', timeout: 120000 })

  await page.fill('#fullName', 'QA Lock Test')
  await page.fill('#email', 'qa-lock@example.com')
  await page.locator('#phone, input[type=tel]').first().fill('5550001111')
  await page.fill('#address1', '1 Test Street')
  await page.fill('#city', 'Testville')
  await page.fill('#state', 'OK')
  await page.fill('#postalCode', '73526')
  await page.selectOption('#country', 'United States')

  const standard = page.getByText('Standard Shipping (International Dispatch)')
  const express = page.getByText('Express Shipping (US Warehouse Stock - Expedited)')
  const selected = async () => page.evaluate(() => {
    const el = [...document.querySelectorAll('div.cursor-pointer')].find((d) => /(^|\s)ring-1(\s|$)/.test(d.className) && d.textContent.includes('Shipping ('))
    return el ? (el.textContent.includes('Express') ? 'express' : 'standard') : 'none'
  })
  await standard.click()
  ok('Before paying, shipping can be changed (Standard selected)', (await selected()) === 'standard')

  // ── PayPal: click the debit/credit card button (opens on the same page) ──
  const ppFrame = page.frameLocator('iframe[title*="PayPal"]').first()
  await page.waitForTimeout(3000)
  const lockCount = () => page.getByTestId('payment-lock-notice').count()
  // Clicks that reach the page even if PayPal's dark overlay is on top (as on the same-page card form)
  const pageClick = (loc) => loc.dispatchEvent('click')

  async function openCard() {
    const popupP = ctx.waitForEvent('page', { timeout: 8000 }).catch(() => null)
    await page.frameLocator('iframe[title*="PayPal"]').first().locator('[data-funding-source="card"]').first().click({ timeout: 20000 })
    const popup = await popupP
    await page.waitForTimeout(3000)
    return popup
  }

  // Round 1 — PayPal opens; customer closes PayPal's own window → checkout unlocks
  let popup = await openCard()
  ok('Lock message appears after clicking the card button', (await lockCount()) > 0, await page.getByTestId('payment-lock-notice').first().textContent().catch(() => ''))
  const firstBody = createBodies.at(-1)
  ok('PayPal was asked for the Standard price', firstBody?.body?.shippingMethod === 'standard', JSON.stringify(firstBody?.body?.shippingMethod))

  // Customer now tries to switch to Express (what the real customer did)
  await pageClick(express)
  await page.waitForTimeout(500)
  ok('Switching to Express is blocked while payment window is open', (await selected()) === 'standard')
  const countryBefore = await page.inputValue('#country')
  await page.locator('#country').evaluate((el) => { el.value = 'Canada'; el.dispatchEvent(new Event('change', { bubbles: true })) })
  await page.waitForTimeout(500)
  ok('Changing country is blocked while payment window is open', (await page.inputValue('#country')) === countryBefore, await page.inputValue('#country'))
  await page.screenshot({ path: path.join(__dirname, '../../test-results/lock-open.png'), fullPage: false })

  if (popup) {
    await popup.close()
    await page.waitForTimeout(4000)
    ok("Closing PayPal's own window unlocks checkout", (await lockCount()) === 0)
  } else {
    ok("(PayPal opened on the page, no separate window)", true)
  }

  // Round 2 — same-page case: customer uses our "Close payment window & edit" button
  if ((await lockCount()) === 0) popup = await openCard()
  ok('Locked again on the next click', (await lockCount()) > 0)
  await pageClick(page.getByRole('button', { name: /close payment window/i }).first())
  await page.waitForTimeout(4000)
  ok('"Close payment window & edit" unlocks checkout', (await lockCount()) === 0)
  if (popup) ok('…and closes the PayPal window', popup.isClosed())
  await express.click()
  await page.waitForTimeout(500)
  ok('After closing, Express can be selected', (await selected()) === 'express')

  // Round 3 — pay again: PayPal must now be asked for the Express price
  const n = createBodies.length
  popup = await openCard()
  const second = createBodies.slice(n).at(-1)
  ok('PayPal button still works after closing, and is asked for the Express price', second?.body?.shippingMethod === 'express', JSON.stringify(second?.body?.shippingMethod))
  if (popup && !popup.isClosed()) await popup.close()
  else await pageClick(page.getByRole('button', { name: /close payment window/i }).first())
  await page.waitForTimeout(4000)

  // ── Razorpay: if starting a payment fails, checkout must unlock again ──
  await page.getByRole('button', { name: /razorpay secured checkout/i }).click()
  await page.waitForTimeout(5000)
  const rzpBody = createBodies.filter((b) => b.url.includes('razorpay')).at(-1)
  ok('Razorpay is asked for the price shown (Express)', rzpBody?.body?.shippingMethod === 'express')
  const rzpFrame = page.frameLocator('iframe.razorpay-checkout-frame')
  const rzpOpen = await page.locator('iframe.razorpay-checkout-frame').isVisible().catch(() => false)
  if (rzpOpen) {
    ok('Razorpay window open → checkout locked', (await page.getByTestId('payment-lock-notice').count()) > 0)
  } else {
    ok('Razorpay could not start (local test keys) → checkout unlocked again', (await page.getByTestId('payment-lock-notice').count()) === 0)
  }
  void rzpFrame

  await browser.close()
  const after = await orderCount()
  ok('No order was sent to /api/orders', ordersCalls === 0, String(ordersCalls))
  ok('Database order count unchanged', before === after, `${before} → ${after}`)
  const failed = results.filter((r) => !r.pass).length
  console.log(`\n${results.length - failed}/${results.length} passed`)
  process.exit(failed ? 1 : 0)
})().catch((e) => { console.error(e); process.exit(1) })
