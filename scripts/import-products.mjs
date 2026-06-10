/**
 * Warcraft Exports — Product Import Script
 * Imports 261 products from Structured_Listings_v2.xlsx into Supabase
 * Run: node scripts/import-products.mjs
 */

import { createRequire } from 'module'
const require = createRequire(import.meta.url)
const XLSX = require('xlsx')
const path = require('path')

const SUPABASE_URL = 'https://arqanxcxcydzyjibxecl.supabase.co'
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFycWFueGN4Y3lkenlqaWJ4ZWNsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzgyMDI0OSwiZXhwIjoyMDkzMzk2MjQ5fQ.aELjzpuQY53eFGZ3v2DcIGBiNpdS7hBegilVKt5yldY'

const HEADERS = {
  'apikey': SERVICE_KEY,
  'Authorization': `Bearer ${SERVICE_KEY}`,
  'Content-Type': 'application/json',
  'Prefer': 'return=representation',
}

async function sb(method, path_, body) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1${path_}`, {
    method,
    headers: HEADERS,
    body: body ? JSON.stringify(body) : undefined,
  })
  const text = await res.text()
  if (!res.ok) {
    throw new Error(`Supabase ${method} ${path_} → ${res.status}: ${text}`)
  }
  return text ? JSON.parse(text) : null
}

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

// Allowed nation values in Supabase (CHECK constraint)
const VALID_NATIONS = new Set(['British', 'German', 'US', 'Japanese', 'Soviet', 'Italian', 'French'])

// Infer nation from Excel Category when Excel Nation field is empty
const CATEGORY_TO_NATION = {
  'BRITISH MILITARIA': 'British',
  'GERMAN MILITARIA': 'German',
  'JAPANESE MILITARIA': 'Japanese',
  'US MILITARIA': 'US',
  'WW1 MILITARIA': 'British',
  'WW2 MILITARIA': 'US',
  'MILITARIA ACCESSORIES': 'US',
}

// Infer era from Excel Category when Excel Era field is empty
const CATEGORY_TO_ERA = {
  'BRITISH MILITARIA': 'WW2',
  'GERMAN MILITARIA': 'WW2',
  'JAPANESE MILITARIA': 'WW2',
  'US MILITARIA': 'WW2',
  'WW1 MILITARIA': 'WW1',
  'WW2 MILITARIA': 'WW2',
  'MILITARIA ACCESSORIES': 'WW2',
}

function inferNationFromTitle(title, category) {
  const t = (title || '').toLowerCase()
  if (t.includes('british') || t.includes('enfield') || t.includes('webley') || t.includes('smle') || t.includes('bren') || t.includes('sten')) return 'British'
  if (t.includes('german') || t.includes('mauser') || t.includes('luger') || t.includes('p08') || t.includes('mp40') || t.includes('kar98') || t.includes('k98') || t.includes('waffen')) return 'German'
  if (t.includes('japanese') || t.includes('japan') || t.includes('arisaka') || t.includes('type 99') || t.includes('type 38')) return 'Japanese'
  if (t.includes('soviet') || t.includes('russian') || t.includes('mosin') || t.includes('sks') || t.includes('ppsh') || t.includes('tokarev')) return 'Soviet'
  if (t.includes('italian') || t.includes('italy') || t.includes('beretta')) return 'Italian'
  if (t.includes('french') || t.includes('france') || t.includes('mas ') || t.includes('lebel')) return 'French'
  return CATEGORY_TO_NATION[category] || 'US'
}

// Map Excel Product_Type → category slug
const TYPE_TO_CATEGORY = {
  'Gun Sling': 'slings',
  'Holster': 'holsters',
  'Holster / Pouch': 'holsters',
  'Belt': 'belts-straps',
  'Suspender / Y-Strap': 'belts-straps',
  'Coat / Jacket': 'uniforms',
  'Trousers / Breeches': 'uniforms',
  'Headgear': 'headgear',
  'Bag / Satchel': 'bags-satchels',
  'Equipment': 'equipment',
  'Equipment Accessory': 'equipment',
  'Collectible / Hobby': 'collectibles',
  'Optics / Accessories': 'optics-accessories',
  'Weapon Case / Cover': 'weapon-cases',
}

// New categories to create
const NEW_CATEGORIES = [
  { name: 'Headgear', slug: 'headgear' },
  { name: 'Bags & Satchels', slug: 'bags-satchels' },
  { name: 'Field Equipment', slug: 'equipment' },
  { name: 'Collectibles', slug: 'collectibles' },
  { name: 'Optics & Accessories', slug: 'optics-accessories' },
  { name: 'Weapon Cases', slug: 'weapon-cases' },
]

async function main() {
  console.log('🚀 Warcraft Exports Product Importer\n')

  // 1. Load Excel
  const wb = XLSX.readFile(path.join(process.cwd(), '..', 'Structured_Listings_v2.xlsx'))
  const ws = wb.Sheets[wb.SheetNames[0]]
  const rawData = XLSX.utils.sheet_to_json(ws, { header: 1 })
  const rows = rawData.slice(1).filter(r => r[0]) // skip header, skip empty
  console.log(`📊 Loaded ${rows.length} products from Excel\n`)

  // 2. Get existing categories
  console.log('📁 Fetching existing categories...')
  const existingCats = await sb('GET', '/categories?select=id,name,slug')
  const catMap = {}
  existingCats.forEach(c => { catMap[c.slug] = c.id })
  console.log(`   Found ${existingCats.length} existing categories`)

  // 3. Create missing categories
  for (const cat of NEW_CATEGORIES) {
    if (!catMap[cat.slug]) {
      console.log(`   Creating category: ${cat.name}`)
      const created = await sb('POST', '/categories', { name: cat.name, slug: cat.slug, description: null })
      if (created && created[0]) catMap[cat.slug] = created[0].id
    }
  }
  console.log(`   Total categories: ${Object.keys(catMap).length}\n`)

  // 4. Delete existing demo products (clean slate)
  console.log('🗑️  Clearing demo products...')
  const existingProducts = await sb('GET', '/products?select=id')
  if (existingProducts.length > 0) {
    // Delete images first
    await sb('DELETE', '/product_images?id=neq.00000000-0000-0000-0000-000000000000', null)
    // Delete variants
    await sb('DELETE', '/product_variants?id=neq.00000000-0000-0000-0000-000000000000', null)
    // Delete products
    await sb('DELETE', '/products?id=neq.00000000-0000-0000-0000-000000000000', null)
    console.log(`   Cleared ${existingProducts.length} demo products\n`)
  }

  // 5. Import products in batches
  console.log('📦 Importing products...')
  let imported = 0, failed = 0
  const slugTracker = new Set()

  // Process in batches of 20
  const BATCH_SIZE = 20
  for (let batchStart = 0; batchStart < rows.length; batchStart += BATCH_SIZE) {
    const batch = rows.slice(batchStart, batchStart + BATCH_SIZE)
    const productBatch = []

    for (const row of batch) {
      const [
        sku,           // 0
        title,         // 1
        nation,        // 2
        era,           // 3
        category,      // 4
        productType,   // 5
        material,      // 6
        style,         // 7
        basePrice,     // 8
        maxPrice,      // 9
        stockQty,      // 10
        _lowStock,     // 11
        hasVariations, // 12
        _varType,      // 13
        _varLabel,     // 14
        _color,        // 15
        colorVariants, // 16
        _size,         // 17
        sizeVariants,  // 18
        fullDesc,      // 19
        specs,         // 20
        img1,          // 21
        img2,          // 22
        img3,          // 23
        img4,          // 24
        img5,          // 25
        img6,          // 26
        img7,          // 27
        img8,          // 28
        weightKg,      // 29
        _seoKeywords,  // 30
        isFeatured,    // 31
      ] = row

      // Generate unique slug
      let baseSlug = slugify(title || sku)
      if (baseSlug.length > 60) baseSlug = baseSlug.substring(0, 60).replace(/-$/, '')
      let slug = baseSlug
      let counter = 1
      while (slugTracker.has(slug)) {
        slug = `${baseSlug}-${counter++}`
      }
      slugTracker.add(slug)

      // Get category ID
      const catSlug = TYPE_TO_CATEGORY[productType] || 'equipment'
      const categoryId = catMap[catSlug] || catMap['equipment']

      // Parse description - split into short + full
      const descText = fullDesc ? String(fullDesc) : ''
      const lines = descText.split('\n').filter(l => l.trim())
      const bulletLines = lines.filter(l => l.startsWith('•'))
      const shortDesc = bulletLines.slice(0, 3).join(' ').replace(/•/g, '').trim() || title

      const stock = parseInt(stockQty) || 0

      productBatch.push({
        sku: String(sku),
        amazon_sku: String(sku),
        name: String(title),
        slug,
        category_id: categoryId,
        nation: (nation && VALID_NATIONS.has(nation)) ? nation : inferNationFromTitle(title, category),
        era: era || CATEGORY_TO_ERA[category] || 'WW2',
        material: material || null,
        style: style || null,
        weight_kg: weightKg ? parseFloat(weightKg) : null,
        price_usd: parseFloat(basePrice) || 19.99,
        sale_price_usd: null,
        stock_quantity: stock,
        low_stock_threshold: 5,
        is_active: true,
        is_featured: false,
        is_wholesale_only: false,
        short_description: shortDesc.substring(0, 300),
        description: descText || null,
        historical_quote: null,
        features: bulletLines.map(l => l.replace(/^•\s*/, '').trim()).filter(Boolean),
        specifications: specs ? { details: String(specs) } : {},
      })
    }

    // Insert batch
    try {
      const inserted = await sb('POST', '/products', productBatch)
      if (inserted && inserted.length) {
        // Now insert images and variants for each inserted product
        for (let i = 0; i < inserted.length; i++) {
          const product = inserted[i]
          const row = batch[i]

          // Images
          const imageUrls = [row[21], row[22], row[23], row[24], row[25], row[26], row[27], row[28]]
            .filter(u => u && String(u).startsWith('http'))

          if (imageUrls.length > 0) {
            const imageBatch = imageUrls.map((url, idx) => ({
              product_id: product.id,
              url: String(url),
              alt_text: product.name,
              sort_order: idx,
              is_hero: idx === 0,
            }))
            await sb('POST', '/product_images', imageBatch)
          }

          // Variants
          const hasVars = row[12] === 'Yes'
          if (hasVars) {
            const colorVarStr = row[16]
            const sizeVarStr = row[18]
            const variants = []

            if (colorVarStr) {
              // Format: "Color1:price:stock|Color2:price:stock"
              const parts = String(colorVarStr).split('|')
              for (const part of parts) {
                const [color, price, stock] = part.split(':')
                if (color) {
                  variants.push({
                    product_id: product.id,
                    color: color.trim(),
                    size: null,
                    sku_suffix: slugify(color.trim()),
                    price_override: price ? parseFloat(price) : null,
                    stock_quantity: stock ? parseInt(stock) : 1,
                    is_active: true,
                  })
                }
              }
            }

            if (sizeVarStr && variants.length === 0) {
              const parts = String(sizeVarStr).split('|')
              for (const part of parts) {
                const [size, price, stock] = part.split(':')
                if (size) {
                  variants.push({
                    product_id: product.id,
                    color: null,
                    size: size.trim(),
                    sku_suffix: slugify(size.trim()),
                    price_override: price ? parseFloat(price) : null,
                    stock_quantity: stock ? parseInt(stock) : 1,
                    is_active: true,
                  })
                }
              }
            }

            if (variants.length > 0) {
              await sb('POST', '/product_variants', variants)
            }
          }
        }
        imported += inserted.length
      }
    } catch (err) {
      console.error(`   ❌ Batch ${batchStart}-${batchStart + BATCH_SIZE} failed:`, err.message)
      failed += batch.length
    }

    const pct = Math.round(((batchStart + batch.length) / rows.length) * 100)
    process.stdout.write(`\r   Progress: ${imported} imported, ${failed} failed (${pct}%)`)
  }

  console.log('\n')

  // 6. Mark some products as featured (first 12)
  console.log('⭐ Setting featured products...')
  const products = await sb('GET', '/products?select=id&limit=12&order=created_at.asc')
  const featuredIds = products.slice(0, 12).map(p => p.id)
  for (const id of featuredIds) {
    await sb('PATCH', `/products?id=eq.${id}`, { is_featured: true })
  }
  console.log(`   Marked ${featuredIds.length} products as featured\n`)

  // 7. Final stats
  const finalCount = await sb('GET', '/products?select=count')
  const imageCount = await sb('GET', '/product_images?select=count')
  const variantCount = await sb('GET', '/product_variants?select=count')

  console.log('✅ Import Complete!')
  console.log(`   Products: ${finalCount[0]?.count || imported}`)
  console.log(`   Images: ${imageCount[0]?.count || 'N/A'}`)
  console.log(`   Variants: ${variantCount[0]?.count || 'N/A'}`)
}

main().catch(err => {
  console.error('\n💥 Fatal error:', err)
  process.exit(1)
})
