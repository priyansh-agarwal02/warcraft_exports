import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "utfs.io" },
      { protocol: "https", hostname: "*.ufs.sh" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "m.media-amazon.com" },
      { protocol: "https", hostname: "*.media-amazon.com" },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          // Prevent clickjacking
          { key: "X-Frame-Options", value: "DENY" },
          // Prevent MIME sniffing
          { key: "X-Content-Type-Options", value: "nosniff" },
          // Control referrer info
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // Disable unnecessary browser features
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
          // Force HTTPS for 1 year (enable when deployed to production on HTTPS)
          { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
          // Legacy XSS protection for older browsers
          { key: "X-XSS-Protection", value: "1; mode=block" },
          // DNS prefetch control
          { key: "X-DNS-Prefetch-Control", value: "on" },
          // Content Security Policy — allows Supabase, Groq, Vercel, Google Fonts, UploadThing
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              // Scripts: allow self, Vercel Analytics, Google Translate, Razorpay, PayPal
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://translate.googleapis.com https://translate.google.com https://translate-pa.googleapis.com https://www.googletagmanager.com https://va.vercel-scripts.com https://checkout.razorpay.com https://www.paypal.com https://www.paypalobjects.com https://www.sandbox.paypal.com https://us-assets.i.posthog.com https://app.posthog.com",
              // Styles: allow self, inline (needed for Tailwind), Google Fonts, Google Translate
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://translate.googleapis.com https://www.gstatic.com",
              // Fonts: allow self + Google Fonts
              "font-src 'self' https://fonts.gstatic.com data:",
              // Images: allow all HTTPS + data URIs (product images from many CDNs) + http google/gstatic
              "img-src 'self' data: blob: https: http://*.google.com http://*.gstatic.com",
              // Media: allow self
              "media-src 'self' blob: https:",
              // Connect: Supabase, Groq, exchangerate API, Vercel, Google Translate, Razorpay, PayPal
              `connect-src 'self' https://*.supabase.co https://*.supabase.io wss://*.supabase.co https://api.groq.com https://api.exchangerate-api.com https://vitals.vercel-insights.com https://translate.googleapis.com https://translate.google.com https://translate-pa.googleapis.com https://api.razorpay.com https://lumberjack.razorpay.com https://www.paypal.com https://www.sandbox.paypal.com https://*.paypal.com https://*.paypalobjects.com https://app.posthog.com https://us.i.posthog.com`,
              // Workers: none
              "worker-src 'none'",
              // Frames: self, Google Translate, Razorpay, PayPal
              "frame-src 'self' https://translate.google.com https://translate.googleapis.com https://api.razorpay.com https://checkout.razorpay.com https://www.paypal.com https://www.sandbox.paypal.com",
              // Objects: none
              "object-src 'none'",
              // Base URI: self only
              "base-uri 'self'",
              // Form submissions: self only
              "form-action 'self'",
            ].join("; "),
          },
        ],
      },
    ];
  },
  async redirects() {
    return [
      { source: "/home", destination: "/", permanent: true },
    ];
  },
};

export default nextConfig;
