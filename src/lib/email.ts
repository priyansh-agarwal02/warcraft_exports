import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM_ORDERS = process.env.EMAIL_FROM_ORDERS || process.env.EMAIL_FROM || "Warcraft Exports <orders@warcraftexports.com>"
const FROM_NEWSLETTER = process.env.EMAIL_FROM_NEWSLETTER || process.env.EMAIL_FROM || "Warcraft Exports <newsletter@warcraftexports.com>"
const FROM_HELLO = process.env.EMAIL_FROM_HELLO || process.env.EMAIL_FROM || "Warcraft Exports <hello@warcraftexports.com>"

async function safeSendEmail(params: Parameters<typeof resend.emails.send>[0]) {
  try {
    const resendKey = process.env.RESEND_API_KEY
    if (!resendKey) {
      console.error("[RESEND ERROR] RESEND_API_KEY environment variable is not defined!")
      return { success: false, error: "Missing RESEND_API_KEY" }
    }
    const response = await resend.emails.send(params)
    if (response.error) {
      console.error(`[RESEND ERROR] Failed sending to ${params.to} (From: ${params.from}):`, response.error)
      return { success: false, error: response.error }
    }
    console.log(`[RESEND SUCCESS] Email delivered to ${params.to} (ID: ${response.data?.id})`)
    return { success: true, data: response.data }
  } catch (err) {
    console.error(`[RESEND EXCEPTION] Exception sending to ${params.to}:`, err)
    return { success: false, error: err }
  }
}

export interface OrderEmailData {
  orderNumber: string
  customerName: string
  customerEmail: string
  shippingMethodLabel?: string
  estimatedDeliveryWindow?: string
  items: { name: string; quantity: number; unitPrice: number; sku: string; shipsFromUsa?: boolean }[]
  subtotal: number
  shipping: number
  discount?: number
  total: number
  shippingAddress: {
    address1: string
    address2?: string
    city: string
    state: string
    postalCode: string
    country: string
  }
}

function orderConfirmationHtml(data: OrderEmailData): string {
  const itemRows = data.items
    .map(
      (item) =>
        `<tr>
          <td style="padding:8px 12px;border-bottom:1px solid #e8dcc8;font-size:14px;color:#3B2A1A;">
            <div>${item.name} <span style="color:#8B7355;font-size:12px;">(${item.sku})</span></div>
            ${item.shipsFromUsa ? `<div style="margin-top:4px;"><span style="display:inline-block;background:#1D70B8;color:#ffffff;font-size:10px;font-weight:bold;padding:2px 6px;border-radius:2px;">🇺🇸 SHIPS FROM USA — Stocked in US Warehouse</span></div>` : ''}
          </td>
          <td style="padding:8px 12px;border-bottom:1px solid #e8dcc8;text-align:center;font-size:14px;color:#3B2A1A;">${item.quantity || 1}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #e8dcc8;text-align:right;font-size:14px;color:#3B2A1A;">$${((item.unitPrice || 0) * (item.quantity || 1)).toFixed(2)}</td>
        </tr>`
    )
    .join("")

  const addr = data.shippingAddress
  const addrLine = [addr.address1, addr.address2, addr.city, addr.state, addr.postalCode, addr.country]
    .filter(Boolean)
    .join(", ")

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F2EAD3;font-family:Georgia,serif;">
  <div style="max-width:600px;margin:32px auto;background:#fff;border:1px solid #e8dcc8;">
    <div style="background:#3B2A1A;padding:28px 32px;text-align:center;">
      <h1 style="margin:0;font-size:24px;color:#F2EAD3;letter-spacing:2px;text-transform:uppercase;">Warcraft Exports</h1>
      <p style="margin:6px 0 0;font-size:12px;color:#C3B091;letter-spacing:1px;text-transform:uppercase;">Order Confirmed</p>
    </div>

    <div style="padding:32px;">
      <p style="font-size:15px;color:#3B2A1A;margin-top:0;">Dear ${data.customerName},</p>
      <p style="font-size:14px;color:#6B5A3E;line-height:1.6;">
        Thank you for your order. We have received it and our team will begin processing shortly.
        Your order number is <strong style="color:#3B2A1A;">#${data.orderNumber}</strong>.
      </p>

      <h2 style="font-size:14px;text-transform:uppercase;letter-spacing:1px;color:#3B2A1A;margin-bottom:12px;border-bottom:2px solid #C3B091;padding-bottom:8px;">Order Summary</h2>

      <table style="width:100%;border-collapse:collapse;margin-bottom:16px;">
        <thead>
          <tr style="background:#F2EAD3;">
            <th style="padding:8px 12px;text-align:left;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#8B7355;">Item</th>
            <th style="padding:8px 12px;text-align:center;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#8B7355;">Qty</th>
            <th style="padding:8px 12px;text-align:right;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#8B7355;">Price</th>
          </tr>
        </thead>
        <tbody>${itemRows}</tbody>
      </table>

      <table style="width:100%;max-width:260px;margin-left:auto;border-collapse:collapse;margin-bottom:24px;">
        <tr>
          <td style="padding:4px 0;font-size:13px;color:#6B5A3E;">Subtotal</td>
          <td style="padding:4px 0;font-size:13px;color:#3B2A1A;text-align:right;">$${(data.subtotal || 0).toFixed(2)}</td>
        </tr>
        ${data.discount && data.discount > 0 ? `
        <tr>
          <td style="padding:4px 0;font-size:13px;color:#008000;">Discount</td>
          <td style="padding:4px 0;font-size:13px;color:#008000;text-align:right;">-$${(data.discount || 0).toFixed(2)}</td>
        </tr>
        ` : ''}
        <tr>
          <td style="padding:4px 0;font-size:13px;color:#6B5A3E;">Shipping</td>
          <td style="padding:4px 0;font-size:13px;color:#3B2A1A;text-align:right;">${!data.shipping ? "Free" : "$" + (data.shipping || 0).toFixed(2)}</td>
        </tr>
        <tr style="border-top:1px solid #e8dcc8;">
          <td style="padding:8px 0 4px;font-size:15px;font-weight:bold;color:#3B2A1A;">Total</td>
          <td style="padding:8px 0 4px;font-size:15px;font-weight:bold;color:#3B2A1A;text-align:right;">$${(data.total || 0).toFixed(2)}</td>
        </tr>
      </table>

      <div style="background:#F2EAD3;padding:16px;margin-bottom:24px;">
        <p style="margin:0 0 4px;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#8B7355;">Shipping To</p>
        <p style="margin:0;font-size:13px;color:#3B2A1A;line-height:1.5;">${addrLine}</p>
      </div>

      <p style="font-size:13px;color:#6B5A3E;line-height:1.6;margin-bottom:8px;">
        We will email you a tracking number once your order ships. Most orders ship within 3–5 business days from our Kanpur factory.
      </p>
      <p style="font-size:13px;color:#6B5A3E;line-height:1.6;margin:0;">
        Questions? Reply to this email or contact us at <a href="mailto:warcraftexports@gmail.com" style="color:#8B4513;">warcraftexports@gmail.com</a>
      </p>
    </div>

    <div style="background:#3B2A1A;padding:16px 32px;text-align:center;">
      <p style="margin:0;font-size:11px;color:#C3B091;">© ${new Date().getFullYear()} RAAS Enterprises · Kanpur, India · <a href="https://warcraftexports.com" style="color:#C3B091;">warcraftexports.com</a></p>
    </div>
  </div>
</body>
</html>`
}

function sellerOrderNotificationHtml(data: OrderEmailData): string {
  const itemRows = data.items
    .map(
      (item) =>
        `<tr>
          <td style="padding:8px 12px;border-bottom:1px solid #e8dcc8;font-size:14px;color:#3B2A1A;">${item.name} <span style="color:#8B7355;font-size:12px;">(${item.sku})</span></td>
          <td style="padding:8px 12px;border-bottom:1px solid #e8dcc8;text-align:center;font-size:14px;color:#3B2A1A;">${item.quantity}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #e8dcc8;text-align:right;font-size:14px;color:#3B2A1A;">$${(item.unitPrice * item.quantity).toFixed(2)}</td>
        </tr>`
    )
    .join("")

  const addr = data.shippingAddress
  const addrLine = [addr.address1, addr.address2, addr.city, addr.state, addr.postalCode, addr.country]
    .filter(Boolean)
    .join(", ")

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F2EAD3;font-family:Georgia,serif;">
  <div style="max-width:600px;margin:32px auto;background:#fff;border:1px solid #e8dcc8;">
    <div style="background:#8B4513;padding:28px 32px;text-align:center;">
      <h1 style="margin:0;font-size:24px;color:#F2EAD3;letter-spacing:2px;text-transform:uppercase;">Warcraft Exports</h1>
      <p style="margin:6px 0 0;font-size:12px;color:#F2EAD3;letter-spacing:1px;text-transform:uppercase;font-weight:bold;">New Order Received</p>
    </div>

    <div style="padding:32px;">
      <p style="font-size:15px;color:#3B2A1A;margin-top:0;">Hello Admin,</p>
      <p style="font-size:14px;color:#6B5A3E;line-height:1.6;">
        A new order has been placed on the store. Here are the details for fulfillment.
        Order Number is <strong style="color:#3B2A1A;">#${data.orderNumber}</strong>.
      </p>

      <h2 style="font-size:14px;text-transform:uppercase;letter-spacing:1px;color:#3B2A1A;margin-bottom:12px;border-bottom:2px solid #C3B091;padding-bottom:8px;">Customer Information</h2>
      <p style="font-size:13px;color:#3B2A1A;line-height:1.5;margin:0 0 16px 0;">
        <strong>Customer Name:</strong> ${data.customerName}<br/>
        <strong>Customer Email:</strong> ${data.customerEmail}
      </p>

      <h2 style="font-size:14px;text-transform:uppercase;letter-spacing:1px;color:#3B2A1A;margin-bottom:12px;border-bottom:2px solid #C3B091;padding-bottom:8px;">Shipping Address</h2>
      <div style="background:#F2EAD3;padding:16px;margin-bottom:24px;">
        <p style="margin:0;font-size:13px;color:#3B2A1A;line-height:1.5;">${addrLine}</p>
      </div>

      <h2 style="font-size:14px;text-transform:uppercase;letter-spacing:1px;color:#3B2A1A;margin-bottom:12px;border-bottom:2px solid #C3B091;padding-bottom:8px;">Order Details</h2>

      <table style="width:100%;border-collapse:collapse;margin-bottom:16px;">
        <thead>
          <tr style="background:#F2EAD3;">
            <th style="padding:8px 12px;text-align:left;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#8B7355;">Item</th>
            <th style="padding:8px 12px;text-align:center;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#8B7355;">Qty</th>
            <th style="padding:8px 12px;text-align:right;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#8B7355;">Price</th>
          </tr>
        </thead>
        <tbody>${itemRows}</tbody>
      </table>

      <table style="width:100%;max-width:260px;margin-left:auto;border-collapse:collapse;margin-bottom:24px;">
        <tr>
          <td style="padding:4px 0;font-size:13px;color:#6B5A3E;">Subtotal</td>
          <td style="padding:4px 0;font-size:13px;color:#3B2A1A;text-align:right;">$${(data.subtotal || 0).toFixed(2)}</td>
        </tr>
        ${data.discount && data.discount > 0 ? `
        <tr>
          <td style="padding:4px 0;font-size:13px;color:#008000;">Discount</td>
          <td style="padding:4px 0;font-size:13px;color:#008000;text-align:right;">-$${(data.discount || 0).toFixed(2)}</td>
        </tr>
        ` : ''}
        <tr>
          <td style="padding:4px 0;font-size:13px;color:#6B5A3E;">Shipping</td>
          <td style="padding:4px 0;font-size:13px;color:#3B2A1A;text-align:right;">${!data.shipping ? "Free" : "$" + (data.shipping || 0).toFixed(2)}</td>
        </tr>
        <tr style="border-top:1px solid #e8dcc8;">
          <td style="padding:8px 0 4px;font-size:15px;font-weight:bold;color:#3B2A1A;">Total Paid</td>
          <td style="padding:8px 0 4px;font-size:15px;font-weight:bold;color:#3B2A1A;text-align:right;">$${(data.total || 0).toFixed(2)}</td>
        </tr>
      </table>
    </div>

    <div style="background:#3B2A1A;padding:16px 32px;text-align:center;">
      <p style="margin:0;font-size:11px;color:#C3B091;">© ${new Date().getFullYear()} RAAS Enterprises · Admin Dashboard Fulfillment Notification</p>
    </div>
  </div>
</body>
</html>`
}

function welcomeHtml(name: string, email: string): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F2EAD3;font-family:Georgia,serif;">
  <div style="max-width:600px;margin:32px auto;background:#fff;border:1px solid #e8dcc8;">
    <div style="background:#3B2A1A;padding:28px 32px;text-align:center;">
      <h1 style="margin:0;font-size:24px;color:#F2EAD3;letter-spacing:2px;text-transform:uppercase;">Warcraft Exports</h1>
      <p style="margin:6px 0 0;font-size:12px;color:#C3B091;letter-spacing:1px;text-transform:uppercase;">Welcome</p>
    </div>
    <div style="padding:32px;">
      <p style="font-size:15px;color:#3B2A1A;margin-top:0;">Welcome, ${name}!</p>
      <p style="font-size:14px;color:#6B5A3E;line-height:1.6;">
        Your Warcraft Exports account has been created for <strong>${email}</strong>.
        You can now track orders, save items to your wishlist, and access your order history.
      </p>
      <div style="text-align:center;margin:28px 0;">
        <a href="https://warcraftexports.com/shop" style="display:inline-block;background:#8B4513;color:#F2EAD3;font-size:13px;text-transform:uppercase;letter-spacing:1px;padding:12px 28px;text-decoration:none;">Shop Now</a>
      </div>
      <p style="font-size:13px;color:#6B5A3E;">Need help? Email us at <a href="mailto:warcraftexports@gmail.com" style="color:#8B4513;">warcraftexports@gmail.com</a></p>
    </div>
    <div style="background:#3B2A1A;padding:16px 32px;text-align:center;">
      <p style="margin:0;font-size:11px;color:#C3B091;">© ${new Date().getFullYear()} RAAS Enterprises · Kanpur, India</p>
    </div>
  </div>
</body>
</html>`
}

function guestWelcomeHtml(name: string, email: string, tempPassword: string): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F2EAD3;font-family:Georgia,serif;">
  <div style="max-width:600px;margin:32px auto;background:#fff;border:1px solid #e8dcc8;">
    <div style="background:#3B2A1A;padding:28px 32px;text-align:center;">
      <h1 style="margin:0;font-size:24px;color:#F2EAD3;letter-spacing:2px;text-transform:uppercase;">Warcraft Exports</h1>
      <p style="margin:6px 0 0;font-size:12px;color:#C3B091;letter-spacing:1px;text-transform:uppercase;">Account Created</p>
    </div>
    <div style="padding:32px;">
      <p style="font-size:15px;color:#3B2A1A;margin-top:0;">Welcome to Warcraft Exports, ${name}!</p>
      <p style="font-size:14px;color:#6B5A3E;line-height:1.6;">
        We have automatically created an account for you using the email address you entered during checkout. This allows you to track your order status, manage your addresses, and view your order history.
      </p>
      <div style="background:#F2EAD3;padding:16px;margin:24px 0;border-left:4px solid #8B4513;">
        <p style="margin:0 0 8px;font-size:13px;color:#3B2A1A;"><strong>Login Credentials:</strong></p>
        <p style="margin:0 0 4px;font-size:13px;color:#3B2A1A;"><strong>Email:</strong> ${email}</p>
        <p style="margin:0;font-size:13px;color:#3B2A1A;"><strong>Temporary Password:</strong> <code style="font-family:monospace;font-size:14px;background:#fff;padding:2px 6px;border:1px solid #e8dcc8;">${tempPassword}</code></p>
      </div>
      <p style="font-size:13px;color:#6B5A3E;line-height:1.5;">
        Please log in to your account and update your password in your settings as soon as possible.
      </p>
      <div style="text-align:center;margin:28px 0;">
        <a href="https://warcraftexports.com/auth/login" style="display:inline-block;background:#8B4513;color:#F2EAD3;font-size:13px;text-transform:uppercase;letter-spacing:1px;padding:12px 28px;text-decoration:none;">Log In to Account</a>
      </div>
      <p style="font-size:13px;color:#6B5A3E;">Need help? Email us at <a href="mailto:warcraftexports@gmail.com" style="color:#8B4513;">warcraftexports@gmail.com</a></p>
    </div>
    <div style="background:#3B2A1A;padding:16px 32px;text-align:center;">
      <p style="margin:0;font-size:11px;color:#C3B091;">© ${new Date().getFullYear()} RAAS Enterprises · Kanpur, India</p>
    </div>
  </div>
</body>
</html>`
}

function newsletterWelcomeHtml(email: string): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F2EAD3;font-family:Georgia,serif;">
  <div style="max-width:600px;margin:32px auto;background:#fff;border:1px solid #e8dcc8;">
    <div style="background:#3B2A1A;padding:28px 32px;text-align:center;">
      <h1 style="margin:0;font-size:24px;color:#F2EAD3;letter-spacing:2px;text-transform:uppercase;">Warcraft Exports</h1>
    </div>
    <div style="padding:32px;text-align:center;">
      <h2 style="font-size:20px;color:#3B2A1A;margin-top:0;">You&apos;re subscribed!</h2>
      <p style="font-size:14px;color:#6B5A3E;line-height:1.6;max-width:400px;margin:0 auto 24px;">
        ${email} is now on our list for exclusive offers, new arrivals, and collector notes. No spam — ever.
      </p>
      <a href="https://warcraftexports.com/shop" style="display:inline-block;background:#8B4513;color:#F2EAD3;font-size:13px;text-transform:uppercase;letter-spacing:1px;padding:12px 28px;text-decoration:none;">Browse the Collection</a>
    </div>
    <div style="background:#3B2A1A;padding:16px 32px;text-align:center;">
      <p style="margin:0;font-size:11px;color:#C3B091;">© ${new Date().getFullYear()} RAAS Enterprises · <a href="https://warcraftexports.com/unsubscribe?email=${encodeURIComponent(email)}" style="color:#C3B091;">Unsubscribe</a></p>
    </div>
  </div>
</body>
</html>`
}

export async function sendOrderConfirmation(data: OrderEmailData) {
  // 1. Send confirmation to Customer (independent)
  const customerPromise = safeSendEmail({
    from: FROM_ORDERS,
    to: data.customerEmail,
    replyTo: "warcraftexports@gmail.com",
    subject: `Order Confirmed — #${data.orderNumber} | Warcraft Exports`,
    html: orderConfirmationHtml(data),
  })

  // 2. Send notification to Seller (warcraftexports@gmail.com) (independent)
  const sellerPromise = safeSendEmail({
    from: FROM_ORDERS,
    to: "warcraftexports@gmail.com",
    replyTo: data.customerEmail,
    subject: `[New Order] #${data.orderNumber} placed by ${data.customerName}`,
    html: sellerOrderNotificationHtml(data),
  })

  const [customerResult, sellerResult] = await Promise.all([customerPromise, sellerPromise])
  return { customerResult, sellerResult }
}

export async function sendWelcomeEmail(name: string, email: string) {
  return safeSendEmail({
    from: FROM_HELLO,
    to: email,
    replyTo: "warcraftexports@gmail.com",
    subject: "Welcome to Warcraft Exports",
    html: welcomeHtml(name, email),
  })
}

export async function sendGuestWelcomeEmail(name: string, email: string, tempPassword: string) {
  return safeSendEmail({
    from: FROM_HELLO,
    to: email,
    replyTo: "warcraftexports@gmail.com",
    subject: "Your Account Credentials — Warcraft Exports",
    html: guestWelcomeHtml(name, email, tempPassword),
  })
}

export async function sendNewsletterWelcome(email: string) {
  return safeSendEmail({
    from: FROM_NEWSLETTER,
    to: email,
    replyTo: "warcraftexports@gmail.com",
    subject: "You're subscribed — Warcraft Exports",
    html: newsletterWelcomeHtml(email),
  })
}
function contactAutoresponderHtml(name: string, subject: string, message: string): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F2EAD3;font-family:Georgia,serif;">
  <div style="max-width:600px;margin:32px auto;background:#fff;border:1px solid #e8dcc8;">
    <div style="background:#3B2A1A;padding:28px 32px;text-align:center;">
      <h1 style="margin:0;font-size:24px;color:#F2EAD3;letter-spacing:2px;text-transform:uppercase;">Warcraft Exports</h1>
      <p style="margin:6px 0 0;font-size:12px;color:#C3B091;letter-spacing:1px;text-transform:uppercase;">Message Received</p>
    </div>

    <div style="padding:32px;">
      <p style="font-size:15px;color:#3B2A1A;margin-top:0;">Dear ${name},</p>
      <p style="font-size:14px;color:#6B5A3E;line-height:1.6;">
        We have received your message regarding "<strong>${subject}</strong>". 
        Our team will review your enquiry and respond within 24 hours.
      </p>

      <h2 style="font-size:13px;text-transform:uppercase;letter-spacing:1px;color:#3B2A1A;margin:24px 0 12px;border-bottom:2px solid #C3B091;padding-bottom:8px;">Copy of Your Inquiry</h2>

      <div style="background:#F2EAD3;padding:16px;font-size:13px;color:#3B2A1A;line-height:1.5;white-space:pre-wrap;border:1px solid #e8dcc8;">${message}</div>

      <p style="font-size:13px;color:#6B5A3E;line-height:1.6;margin-top:24px;margin-bottom:0;">
        If you need to add any details, simply reply directly to this email or contact us at <a href="mailto:warcraftexports@gmail.com" style="color:#8B4513;">warcraftexports@gmail.com</a>.
      </p>
    </div>

    <div style="background:#3B2A1A;padding:16px 32px;text-align:center;">
      <p style="margin:0;font-size:11px;color:#C3B091;">© ${new Date().getFullYear()} RAAS Enterprises · Kanpur, India · <a href="https://warcraftexports.com" style="color:#C3B091;">warcraftexports.com</a></p>
    </div>
  </div>
</body>
</html>`
}

export async function sendContactAutoresponder(name: string, email: string, subject: string, message: string) {
  return safeSendEmail({
    from: FROM_HELLO,
    to: email,
    replyTo: "warcraftexports@gmail.com",
    subject: `We received your message — Warcraft Exports`,
    html: contactAutoresponderHtml(name, subject, message),
  })
}

export async function sendContactNotification(name: string, email: string, subject: string, message: string) {
  return safeSendEmail({
    from: FROM_HELLO,
    to: "warcraftexports@gmail.com",
    replyTo: email,
    subject: `New Contact Form Submission: ${subject}`,
    html: `
      <div style="font-family:sans-serif;padding:20px;color:#333;">
        <h2 style="border-bottom:1px solid #ddd;padding-bottom:10px;">New Contact Message</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong></p>
        <div style="background:#f9f9f9;padding:15px;border:1px solid #eee;white-space:pre-wrap;">${message}</div>
      </div>
    `
  })
}

export async function sendWholesaleNotification(data: {
  name: string
  company: string
  country: string
  email: string
  phone?: string
  categories: string[]
  volume: string
  message?: string
}) {
  return safeSendEmail({
    from: FROM_HELLO,
    to: "warcraftexports@gmail.com",
    replyTo: data.email,
    subject: `New B2B Wholesale Inquiry — ${data.company}`,
    html: `
      <div style="font-family:sans-serif;padding:20px;color:#333;">
        <h2 style="border-bottom:1px solid #ddd;padding-bottom:10px;">New B2B Wholesale Inquiry</h2>
        <p><strong>Name:</strong> ${data.name}</p>
        <p><strong>Company:</strong> ${data.company}</p>
        <p><strong>Country:</strong> ${data.country}</p>
        <p><strong>Email:</strong> ${data.email}</p>
        <p><strong>Phone:</strong> ${data.phone ?? "N/A"}</p>
        <p><strong>Monthly Volume:</strong> ${data.volume}</p>
        <p><strong>Product Categories:</strong> ${data.categories.join(", ")}</p>
        <p><strong>Message:</strong></p>
        <div style="background:#f9f9f9;padding:15px;border:1px solid #eee;white-space:pre-wrap;">${data.message ?? "None"}</div>
      </div>
    `
  })
}

function calculateEstimatedArrival(createdAtStr: string, standardDays: string): string {
  try {
    const createdDate = new Date(createdAtStr)
    const rangeParts = standardDays.split("-")
    if (rangeParts.length === 2) {
      const minDays = parseInt(rangeParts[0].trim(), 10)
      const maxDays = parseInt(rangeParts[1].trim(), 10)
      if (!isNaN(minDays) && !isNaN(maxDays)) {
        const minArrival = new Date(createdDate)
        minArrival.setDate(createdDate.getDate() + minDays)
        const maxArrival = new Date(createdDate)
        maxArrival.setDate(createdDate.getDate() + maxDays)
        
        const formatOptions: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" }
        const minStr = minArrival.toLocaleDateString("en-US", formatOptions)
        const maxStr = maxArrival.toLocaleDateString("en-US", formatOptions)
        return `${minStr} - ${maxStr}`
      }
    }
  } catch (e) {
    console.error("Failed to parse standard_days range:", e)
  }
  return "7-14 Business Days"
}

function orderShippedHtml(data: {
  orderNumber: string
  customerName: string
  trackingNumber: string
  trackingUrl: string
  estimatedArrival: string
  items: { name: string; quantity: number; sku: string }[]
}): string {
  const itemRows = data.items
    .map(
      (item) =>
        `<tr>
          <td style="padding:8px 12px;border-bottom:1px solid #e8dcc8;font-size:14px;color:#3B2A1A;">${item.name} <span style="color:#8B7355;font-size:12px;">(${item.sku})</span></td>
          <td style="padding:8px 12px;border-bottom:1px solid #e8dcc8;text-align:center;font-size:14px;color:#3B2A1A;">${item.quantity}</td>
        </tr>`
    )
    .join("")

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F2EAD3;font-family:Georgia,serif;">
  <div style="max-width:600px;margin:32px auto;background:#fff;border:1px solid #e8dcc8;">
    <div style="background:#3B2A1A;padding:28px 32px;text-align:center;">
      <h1 style="margin:0;font-size:24px;color:#F2EAD3;letter-spacing:2px;text-transform:uppercase;">Warcraft Exports</h1>
      <p style="margin:6px 0 0;font-size:12px;color:#C3B091;letter-spacing:1px;text-transform:uppercase;">Order Dispatched</p>
    </div>

    <div style="padding:32px;">
      <p style="font-size:15px;color:#3B2A1A;margin-top:0;">Dear ${data.customerName},</p>
      <p style="font-size:14px;color:#6B5A3E;line-height:1.6;">
        Great news! Your order <strong style="color:#3B2A1A;">#${data.orderNumber}</strong> has been shipped and is on its way to you.
      </p>

      <div style="background:#F2EAD3;padding:20px;margin:24px 0;border:1px dashed #C3B091;">
        <h3 style="margin:0 0 12px 0;font-size:13px;text-transform:uppercase;letter-spacing:1px;color:#3B2A1A;border-bottom:1px solid #C3B091;padding-bottom:6px;">Delivery & Tracking Info</h3>
        <table style="width:100%;font-size:13px;color:#3B2A1A;margin-bottom:12px;">
          <tr>
            <td style="padding:4px 0;font-weight:bold;color:#6B5A3E;width:150px;">Tracking Number</td>
            <td style="padding:4px 0;font-family:monospace;font-weight:bold;">${data.trackingNumber}</td>
          </tr>
          <tr>
            <td style="padding:4px 0;font-weight:bold;color:#6B5A3E;">Estimated Delivery</td>
            <td style="padding:4px 0;font-weight:bold;color:#8B4513;">${data.estimatedArrival}</td>
          </tr>
        </table>
        
        <div style="text-align:center;margin-top:16px;">
          <a href="${data.trackingUrl}" style="display:inline-block;background:#8B4513;color:#F2EAD3;font-size:12px;text-transform:uppercase;letter-spacing:1px;padding:10px 24px;text-decoration:none;font-weight:bold;">Track Package</a>
        </div>
      </div>

      <h2 style="font-size:14px;text-transform:uppercase;letter-spacing:1px;color:#3B2A1A;margin-bottom:12px;border-bottom:2px solid #C3B091;padding-bottom:8px;">Shipped Items</h2>

      <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
        <thead>
          <tr style="background:#F2EAD3;">
            <th style="padding:8px 12px;text-align:left;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#8B7355;">Item</th>
            <th style="padding:8px 12px;text-align:center;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#8B7355;width:80px;">Qty</th>
          </tr>
        </thead>
        <tbody>${itemRows}</tbody>
      </table>

      <p style="font-size:13px;color:#6B5A3E;line-height:1.6;margin-bottom:8px;">
        Please note that tracking information may take up to 24–48 hours to update on the carrier's website.
      </p>
      <p style="font-size:13px;color:#6B5A3E;line-height:1.6;margin:0;">
        Questions about shipment? Reply to this email or contact us at <a href="mailto:warcraftexports@gmail.com" style="color:#8B4513;">warcraftexports@gmail.com</a>
      </p>
    </div>

    <div style="background:#3B2A1A;padding:16px 32px;text-align:center;">
      <p style="margin:0;font-size:11px;color:#C3B091;">© ${new Date().getFullYear()} RAAS Enterprises · Kanpur, India · <a href="https://warcraftexports.com" style="color:#C3B091;">warcraftexports.com</a></p>
    </div>
  </div>
</body>
</html>`
}

export async function sendOrderShippedEmail(orderId: string, forceResend: boolean = false): Promise<{ sent: boolean; reason?: string }> {
  try {
    const { createServiceClient } = await import("@/lib/supabase/service")
    const supabase = createServiceClient()

    const { data: order, error } = await supabase
      .from("orders")
      .select("id, order_number, customer_name, customer_email, created_at, tracking_number, tracking_url, shipped_email_sent_at, shipping_address, order_items(id, quantity, unit_price_usd, price_usd, product_snapshot, product:products(name, sku))")
      .eq("id", orderId)
      .single()

    if (error || !order) {
      console.error("Order not found for shipping email:", error)
      return { sent: false, reason: "order_not_found" }
    }

    if (!order.tracking_number) {
      console.warn(`No tracking number on order ${order.id}, skipping shipped email.`)
      return { sent: false, reason: "missing_tracking_number" }
    }

    // Idempotency Check
    if (order.shipped_email_sent_at && !forceResend) {
      console.log(`[EMAIL SKIPPED] Shipped email already sent for order ${order.order_number} at ${order.shipped_email_sent_at}`)
      return { sent: false, reason: "already_sent" }
    }

    let estimatedArrival = "7-14 Business Days"
    const addr = order.shipping_address as any
    if (addr?.country) {
      const { data: rate } = await supabase
        .from("shipping_rates")
        .select("standard_days")
        .eq("country_name", addr.country)
        .maybeSingle()
      
      let activeRate = rate
      if (!activeRate) {
        const { data: fallbackRate } = await supabase
          .from("shipping_rates")
          .select("standard_days")
          .eq("country_code", "OTHER")
          .maybeSingle()
        activeRate = fallbackRate
      }

      if (activeRate) {
        estimatedArrival = calculateEstimatedArrival(order.created_at, activeRate.standard_days)
      }
    }

    const items = (order.order_items as any[]).map((item) => ({
      name: item.product?.name || item.product_snapshot?.name || "Product Item",
      sku: item.product?.sku || item.product_snapshot?.sku || "N/A",
      quantity: item.quantity,
    }))

    const res = await safeSendEmail({
      from: FROM_ORDERS,
      to: order.customer_email,
      replyTo: "warcraftexports@gmail.com",
      subject: `Your order #${order.order_number} has been shipped! | Warcraft Exports`,
      html: orderShippedHtml({
        orderNumber: order.order_number,
        customerName: order.customer_name,
        trackingNumber: order.tracking_number,
        trackingUrl: order.tracking_url || "",
        estimatedArrival,
        items,
      }),
    })

    if (!res.success) {
      return { sent: false, reason: "send_failed" }
    }

    // Record timestamp of dispatch in database
    await supabase.from("orders").update({ shipped_email_sent_at: new Date().toISOString() }).eq("id", orderId)
    return { sent: true }
  } catch (err) {
    console.error("sendOrderShippedEmail error:", err)
    return { sent: false, reason: "send_failed" }
  }
}

function orderDeliveredHtml(data: {
  orderNumber: string
  customerName: string
  items: { name: string; quantity: number; sku: string }[]
}): string {
  const itemRows = data.items
    .map(
      (item) =>
        `<tr>
          <td style="padding:8px 12px;border-bottom:1px solid #e8dcc8;font-size:14px;color:#3B2A1A;">${item.name} <span style="color:#8B7355;font-size:12px;">(${item.sku})</span></td>
          <td style="padding:8px 12px;border-bottom:1px solid #e8dcc8;text-align:center;font-size:14px;color:#3B2A1A;">${item.quantity}</td>
        </tr>`
    )
    .join("")

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F2EAD3;font-family:Georgia,serif;">
  <div style="max-width:600px;margin:32px auto;background:#fff;border:1px solid #e8dcc8;">
    <div style="background:#3B2A1A;padding:28px 32px;text-align:center;">
      <h1 style="margin:0;font-size:24px;color:#F2EAD3;letter-spacing:2px;text-transform:uppercase;">Warcraft Exports</h1>
      <p style="margin:6px 0 0;font-size:12px;color:#C3B091;letter-spacing:1px;text-transform:uppercase;">Order Delivered</p>
    </div>

    <div style="padding:32px;">
      <p style="font-size:15px;color:#3B2A1A;margin-top:0;">Dear ${data.customerName},</p>
      <p style="font-size:14px;color:#6B5A3E;line-height:1.6;">
        Exciting news! Your order <strong style="color:#3B2A1A;">#${data.orderNumber}</strong> has been delivered successfully. 
        We hope you love your new historical reproduction gear!
      </p>

      <h2 style="font-size:14px;text-transform:uppercase;letter-spacing:1px;color:#3B2A1A;margin-bottom:12px;border-bottom:2px solid #C3B091;padding-bottom:8px;">Delivered Items</h2>

      <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
        <thead>
          <tr style="background:#F2EAD3;">
            <th style="padding:8px 12px;text-align:left;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#8B7355;">Item</th>
            <th style="padding:8px 12px;text-align:center;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#8B7355;width:80px;">Qty</th>
          </tr>
        </thead>
        <tbody>${itemRows}</tbody>
      </table>

      <p style="font-size:13px;color:#6B5A3E;line-height:1.6;margin-bottom:8px;">
        If you have any questions, feedback, or need help with a return or replacement, please reach out to us.
      </p>
      <p style="font-size:13px;color:#6B5A3E;line-height:1.6;margin:0;">
        Email us directly at <a href="mailto:warcraftexports@gmail.com" style="color:#8B4513;">warcraftexports@gmail.com</a>
      </p>
    </div>

    <div style="background:#3B2A1A;padding:16px 32px;text-align:center;">
      <p style="margin:0;font-size:11px;color:#C3B091;">© ${new Date().getFullYear()} RAAS Enterprises · Kanpur, India · <a href="https://warcraftexports.com" style="color:#C3B091;">warcraftexports.com</a></p>
    </div>
  </div>
</body>
</html>`
}

export async function sendOrderDeliveredEmail(orderId: string, forceResend: boolean = false): Promise<{ sent: boolean; reason?: string }> {
  try {
    const { createServiceClient } = await import("@/lib/supabase/service")
    const supabase = createServiceClient()

    const { data: order, error } = await supabase
      .from("orders")
      .select("id, order_number, customer_name, customer_email, delivered_email_sent_at, order_items(id, quantity, product:products(name, sku))")
      .eq("id", orderId)
      .single()

    if (error || !order) {
      console.error("Order not found for delivered email:", error)
      return { sent: false, reason: "order_not_found" }
    }

    // Idempotency Check
    if (order.delivered_email_sent_at && !forceResend) {
      console.log(`[EMAIL SKIPPED] Delivered email already sent for order ${order.order_number} at ${order.delivered_email_sent_at}`)
      return { sent: false, reason: "already_sent" }
    }

    const items = (order.order_items as any[]).map((item) => ({
      name: item.product?.name || "Product Item",
      sku: item.product?.sku || "N/A",
      quantity: item.quantity,
    }))

    const res = await safeSendEmail({
      from: FROM_ORDERS,
      to: order.customer_email,
      replyTo: "warcraftexports@gmail.com",
      subject: `Your order #${order.order_number} has been delivered! | Warcraft Exports`,
      html: orderDeliveredHtml({
        orderNumber: order.order_number,
        customerName: order.customer_name,
        items,
      }),
    })

    if (!res.success) {
      return { sent: false, reason: "send_failed" }
    }

    // Record timestamp of dispatch in database
    await supabase.from("orders").update({ delivered_email_sent_at: new Date().toISOString() }).eq("id", orderId)
    return { sent: true }
  } catch (err) {
    console.error("sendOrderDeliveredEmail error:", err)
    return { sent: false, reason: "send_failed" }
  }
}

function orderCancelledHtml(data: {
  orderNumber: string
  customerName: string
  reason: string
  items: { name: string; quantity: number; sku: string }[]
}): string {
  const itemRows = data.items
    .map(
      (item) =>
        `<tr>
          <td style="padding:8px 12px;border-bottom:1px solid #e8dcc8;font-size:14px;color:#3B2A1A;">${item.name} <span style="color:#8B7355;font-size:12px;">(${item.sku})</span></td>
          <td style="padding:8px 12px;border-bottom:1px solid #e8dcc8;text-align:center;font-size:14px;color:#3B2A1A;">${item.quantity}</td>
        </tr>`
    )
    .join("")

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F2EAD3;font-family:Georgia,serif;">
  <div style="max-width:600px;margin:32px auto;background:#fff;border:1px solid #e8dcc8;">
    <div style="background:#3B2A1A;padding:28px 32px;text-align:center;">
      <h1 style="margin:0;font-size:24px;color:#F2EAD3;letter-spacing:2px;text-transform:uppercase;">Warcraft Exports</h1>
      <p style="margin:6px 0 0;font-size:12px;color:#C3B091;letter-spacing:1px;text-transform:uppercase;">Order Update — Cancelled</p>
    </div>

    <div style="padding:32px;">
      <p style="font-size:15px;color:#3B2A1A;margin-top:0;">Dear ${data.customerName},</p>
      <p style="font-size:14px;color:#6B5A3E;line-height:1.6;">
        Your order <strong style="color:#3B2A1A;">#${data.orderNumber}</strong> has been cancelled.
      </p>

      <div style="background:#FFF5F5;padding:20px;margin:24px 0;border:1px solid #FEB2B2;border-left:4px solid #E53E3E;">
        <h3 style="margin:0 0 8px 0;font-size:12px;text-transform:uppercase;letter-spacing:1px;color:#C53030;">Reason for Cancellation</h3>
        <p style="margin:0;font-size:13px;color:#2D3748;line-height:1.6;white-space:pre-wrap;">${data.reason}</p>
      </div>

      <h2 style="font-size:14px;text-transform:uppercase;letter-spacing:1px;color:#3B2A1A;margin-bottom:12px;border-bottom:2px solid #C3B091;padding-bottom:8px;">Cancelled Items</h2>

      <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
        <thead>
          <tr style="background:#F2EAD3;">
            <th style="padding:8px 12px;text-align:left;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#8B7355;">Item</th>
            <th style="padding:8px 12px;text-align:center;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#8B7355;width:80px;">Qty</th>
          </tr>
        </thead>
        <tbody>${itemRows}</tbody>
      </table>

      <p style="font-size:13px;color:#6B5A3E;line-height:1.6;margin:0;">
        If you have questions regarding refunds or replacements, reply directly to this email or contact us at <a href="mailto:warcraftexports@gmail.com" style="color:#8B4513;">warcraftexports@gmail.com</a>.
      </p>
    </div>

    <div style="background:#3B2A1A;padding:16px 32px;text-align:center;">
      <p style="margin:0;font-size:11px;color:#C3B091;">© ${new Date().getFullYear()} RAAS Enterprises · Kanpur, India · <a href="https://warcraftexports.com" style="color:#C3B091;">warcraftexports.com</a></p>
    </div>
  </div>
</body>
</html>`
}

export async function sendOrderCancelledEmail(orderId: string, customReason?: string, forceResend: boolean = false): Promise<{ sent: boolean; reason?: string }> {
  try {
    const { createServiceClient } = await import("@/lib/supabase/service")
    const supabase = createServiceClient()

    const { data: order, error } = await supabase
      .from("orders")
      .select("id, order_number, customer_name, customer_email, cancelled_email_sent_at, cancellation_reason, order_items(id, quantity, product:products(name, sku))")
      .eq("id", orderId)
      .single()

    if (error || !order) {
      console.error("Order not found for cancelled email:", error)
      return { sent: false, reason: "order_not_found" }
    }

    if (order.cancelled_email_sent_at && !forceResend) {
      console.log(`[EMAIL SKIPPED] Cancelled email already sent for order ${order.order_number} at ${order.cancelled_email_sent_at}`)
      return { sent: false, reason: "already_sent" }
    }

    const reason = customReason || order.cancellation_reason || "Your order was cancelled by store management upon request."

    const items = (order.order_items as any[]).map((item) => ({
      name: item.product?.name || "Product Item",
      sku: item.product?.sku || "N/A",
      quantity: item.quantity,
    }))

    const res = await safeSendEmail({
      from: FROM_ORDERS,
      to: order.customer_email,
      replyTo: "warcraftexports@gmail.com",
      subject: `Order Cancelled — #${order.order_number} | Warcraft Exports`,
      html: orderCancelledHtml({
        orderNumber: order.order_number,
        customerName: order.customer_name,
        reason,
        items,
      }),
    })

    if (!res.success) {
      return { sent: false, reason: "send_failed" }
    }

    await supabase.from("orders").update({
      cancelled_email_sent_at: new Date().toISOString(),
      cancellation_reason: reason,
    }).eq("id", orderId)

    return { sent: true }
  } catch (err) {
    console.error("sendOrderCancelledEmail error:", err)
    return { sent: false, reason: "send_failed" }
  }
}

export async function sendWholesaleAutoresponder(data: {
  name: string
  company: string
  country: string
  email: string
  categories: string[]
  volume: string
  message?: string
}) {
  return safeSendEmail({
    from: FROM_HELLO,
    to: data.email,
    replyTo: "warcraftexports@gmail.com",
    subject: `B2B Wholesale Inquiry Received — ${data.company} | Warcraft Exports`,
    html: `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
      <body style="margin:0;padding:0;background:#F2EAD3;font-family:Georgia,serif;">
        <div style="max-width:600px;margin:32px auto;background:#fff;border:1px solid #e8dcc8;">
          <div style="background:#3B2A1A;padding:28px 32px;text-align:center;">
            <h1 style="margin:0;font-size:24px;color:#F2EAD3;letter-spacing:2px;text-transform:uppercase;">Warcraft Exports</h1>
            <p style="margin:6px 0 0;font-size:12px;color:#C3B091;letter-spacing:1px;text-transform:uppercase;">Wholesale Inquiry Receipt</p>
          </div>
          <div style="padding:32px;">
            <p style="font-size:15px;color:#3B2A1A;margin-top:0;">Dear ${data.name},</p>
            <p style="font-size:14px;color:#6B5A3E;line-height:1.6;">
              Thank you for reaching out to Warcraft Exports regarding wholesale distribution for <strong>${data.company}</strong> (${data.country}).
              We have received your B2B inquiry and our trade management team will review your requirements and respond within 24 hours with catalog pricing and minimum order terms.
            </p>

            <h2 style="font-size:13px;text-transform:uppercase;letter-spacing:1px;color:#3B2A1A;margin:24px 0 12px;border-bottom:2px solid #C3B091;padding-bottom:8px;">Summary of Your Inquiry</h2>
            <div style="background:#F2EAD3;padding:16px;font-size:13px;color:#3B2A1A;line-height:1.6;border:1px solid #e8dcc8;">
              <p style="margin:0 0 6px;"><strong>Company:</strong> ${data.company}</p>
              <p style="margin:0 0 6px;"><strong>Estimated Monthly Volume:</strong> ${data.volume}</p>
              <p style="margin:0 0 6px;"><strong>Product Categories:</strong> ${data.categories.join(", ") || "General Catalog"}</p>
              ${data.message ? `<p style="margin:12px 0 0;border-top:1px dashed #C3B091;padding-top:8px;"><strong>Message Notes:</strong><br/>${data.message}</p>` : ""}
            </div>

            <p style="font-size:13px;color:#6B5A3E;line-height:1.6;margin-top:24px;margin-bottom:0;">
              If you have additional product requests or catalog questions, feel free to reply directly to this email or contact us at <a href="mailto:warcraftexports@gmail.com" style="color:#8B4513;">warcraftexports@gmail.com</a>.
            </p>
          </div>
          <div style="background:#3B2A1A;padding:16px 32px;text-align:center;">
            <p style="margin:0;font-size:11px;color:#C3B091;">© ${new Date().getFullYear()} RAAS Enterprises · Kanpur, India · <a href="https://warcraftexports.com" style="color:#C3B091;">warcraftexports.com</a></p>
          </div>
        </div>
      </body>
      </html>
    `,
  })
}

export async function sendCancellationRequestReceiptEmail(orderId: string, customerReason: string) {
  const { createServiceClient } = await import("@/lib/supabase/service")
  const supabase = createServiceClient()

  const { data: order } = await supabase
    .from("orders")
    .select("id, order_number, customer_name, customer_email")
    .eq("id", orderId)
    .single()

  if (!order) return

  return safeSendEmail({
    from: FROM_ORDERS,
    to: order.customer_email,
    replyTo: "warcraftexports@gmail.com",
    subject: `Cancellation Request Received — Order #${order.order_number} | Warcraft Exports`,
    html: `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
      <body style="margin:0;padding:0;background:#F2EAD3;font-family:Georgia,serif;">
        <div style="max-width:600px;margin:32px auto;background:#fff;border:1px solid #e8dcc8;">
          <div style="background:#3B2A1A;padding:28px 32px;text-align:center;">
            <h1 style="margin:0;font-size:24px;color:#F2EAD3;letter-spacing:2px;text-transform:uppercase;">Warcraft Exports</h1>
            <p style="margin:6px 0 0;font-size:12px;color:#C3B091;letter-spacing:1px;text-transform:uppercase;">Cancellation Request Under Review</p>
          </div>
          <div style="padding:32px;">
            <p style="font-size:15px;color:#3B2A1A;margin-top:0;">Dear ${order.customer_name || "Valued Customer"},</p>
            <p style="font-size:14px;color:#6B5A3E;line-height:1.6;">
              We have received your cancellation request for Order <strong>#${order.order_number}</strong>. Our management team is currently reviewing your order status at our workshop to ensure it has not already been prepared or dispatched.
            </p>
            <h3 style="font-size:12px;text-transform:uppercase;letter-spacing:1px;color:#8B4513;margin:20px 0 8px;">Reason Provided:</h3>
            <div style="background:#F9F6F0;border-left:4px solid #8B4513;padding:12px;font-size:13px;color:#3B2A1A;font-style:italic;">
              "${customerReason}"
            </div>
            <p style="font-size:14px;color:#6B5A3E;line-height:1.6;margin-top:20px;">
              You will receive another email notification shortly once management approves or updates your request.
            </p>
          </div>
          <div style="background:#3B2A1A;padding:16px 32px;text-align:center;">
            <p style="margin:0;font-size:11px;color:#C3B091;">© ${new Date().getFullYear()} RAAS Enterprises · Kanpur, India · <a href="https://warcraftexports.com" style="color:#C3B091;">warcraftexports.com</a></p>
          </div>
        </div>
      </body>
      </html>
    `,
  })
}

export async function sendCancellationRequestSellerNotification(orderId: string, customerReason: string) {
  const { createServiceClient } = await import("@/lib/supabase/service")
  const supabase = createServiceClient()

  const { data: order } = await supabase
    .from("orders")
    .select("id, order_number, customer_name, customer_email, total_usd")
    .eq("id", orderId)
    .single()

  if (!order) return

  return safeSendEmail({
    from: FROM_ORDERS,
    to: "warcraftexports@gmail.com",
    subject: `🚨 ACTION REQUIRED: Customer Cancellation Request — Order #${order.order_number}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
      <body style="margin:0;padding:0;background:#F2EAD3;font-family:Georgia,serif;">
        <div style="max-width:600px;margin:32px auto;background:#fff;border:1px solid #e8dcc8;">
          <div style="background:#8B1A1A;padding:24px 32px;text-align:center;">
            <h1 style="margin:0;font-size:22px;color:#fff;letter-spacing:1px;text-transform:uppercase;">Customer Cancellation Request</h1>
            <p style="margin:4px 0 0;font-size:12px;color:#FFD700;letter-spacing:1px;">Order #${order.order_number} ($${order.total_usd?.toFixed(2)})</p>
          </div>
          <div style="padding:28px;">
            <p style="font-size:14px;color:#3B2A1A;margin-top:0;">
              Customer <strong>${order.customer_name}</strong> (${order.customer_email}) has requested to cancel Order #${order.order_number}.
            </p>
            <div style="background:#FFF5F5;border:1px solid #FEB2B2;padding:16px;margin:16px 0;font-size:13px;color:#991B1B;">
              <strong>Customer Reason:</strong><br/>
              "${customerReason}"
            </div>
            <p style="font-size:13px;color:#6B5A3E;">
              Please log in to the admin panel to review and click <strong>Accept Cancellation</strong> or <strong>Reject Cancellation</strong>.
            </p>
            <div style="text-align:center;margin-top:24px;">
              <a href="https://warcraftexports.com/admin/orders/${order.id}" style="background:#3B2A1A;color:#fff;padding:12px 24px;text-decoration:none;font-size:12px;font-weight:bold;text-transform:uppercase;letter-spacing:1px;display:inline-block;">
                Review Order in Admin Panel &rarr;
              </a>
            </div>
          </div>
        </div>
      </body>
      </html>
    `,
  })
}

export async function sendCancellationRejectedEmail(orderId: string, rejectionReason: string) {
  const { createServiceClient } = await import("@/lib/supabase/service")
  const supabase = createServiceClient()

  const { data: order } = await supabase
    .from("orders")
    .select("id, order_number, customer_name, customer_email, tracking_number")
    .eq("id", orderId)
    .single()

  if (!order) return

  return safeSendEmail({
    from: FROM_ORDERS,
    to: order.customer_email,
    replyTo: "warcraftexports@gmail.com",
    subject: `Cancellation Request Update — Order #${order.order_number} | Warcraft Exports`,
    html: `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
      <body style="margin:0;padding:0;background:#F2EAD3;font-family:Georgia,serif;">
        <div style="max-width:600px;margin:32px auto;background:#fff;border:1px solid #e8dcc8;">
          <div style="background:#3B2A1A;padding:28px 32px;text-align:center;">
            <h1 style="margin:0;font-size:24px;color:#F2EAD3;letter-spacing:2px;text-transform:uppercase;">Warcraft Exports</h1>
            <p style="margin:6px 0 0;font-size:12px;color:#C3B091;letter-spacing:1px;text-transform:uppercase;">Cancellation Request Status</p>
          </div>
          <div style="padding:32px;">
            <p style="font-size:15px;color:#3B2A1A;margin-top:0;">Dear ${order.customer_name || "Valued Customer"},</p>
            <p style="font-size:14px;color:#6B5A3E;line-height:1.6;">
              Regarding your cancellation request for Order <strong>#${order.order_number}</strong>: Our management team reviewed your order and unfortunately we are unable to process a cancellation at this stage.
            </p>
            <h3 style="font-size:12px;text-transform:uppercase;letter-spacing:1px;color:#8B4513;margin:20px 0 8px;">Management Note:</h3>
            <div style="background:#F9F6F0;border-left:4px solid #8B4513;padding:12px;font-size:13px;color:#3B2A1A;line-height:1.5;">
              ${rejectionReason}
            </div>
            <p style="font-size:14px;color:#6B5A3E;line-height:1.6;margin-top:20px;">
              Your order is proceeding with fulfillment. If you have questions once delivered, our standard returns policy will apply.
            </p>
          </div>
          <div style="background:#3B2A1A;padding:16px 32px;text-align:center;">
            <p style="margin:0;font-size:11px;color:#C3B091;">© ${new Date().getFullYear()} RAAS Enterprises · Kanpur, India · <a href="https://warcraftexports.com" style="color:#C3B091;">warcraftexports.com</a></p>
          </div>
        </div>
      </body>
      </html>
    `,
  })
}


