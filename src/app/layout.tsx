import type { Metadata } from "next";
import { Work_Sans, Merriweather } from "next/font/google";
import localFont from "next/font/local";
import { Suspense } from "react";
import Script from "next/script";
import { PostHogProvider } from "@/components/providers/PostHogProvider";
import "./globals.css";

const arupalaGrotesk = localFont({
  src: "./fonts/ArupalaGrotesk-Ultra.ttf",
  variable: "--font-arupala",
  weight: "800",
  display: "swap",
});

const workSans = Work_Sans({
  variable: "--font-work-sans",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const merriweather = Merriweather({
  variable: "--font-merriweather",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "700"],
});

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://warcraftexports.com"

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    template: "%s | Warcraft Exports",
    default: "Warcraft Exports — WW1 & WW2 Historical Reproduction Military Gear",
  },
  description:
    "Manufacturer and global exporter of WW1 & WW2 historical reproduction military gear. Leather holsters, canvas pouches, belts, slings and reenactment kits. 10+ years, 50,000+ orders, ships to 20+ countries from Kanpur, India.",
  keywords: [
    "WW1 reproduction gear",
    "WW2 military reproductions",
    "historical military holsters",
    "leather holster manufacturer",
    "canvas military pouches",
    "reenactment gear",
    "military surplus reproductions",
    "WW2 collectibles",
    "US militaria",
    "German militaria",
    "British militaria",
    "military leather goods India",
    "wholesale military gear",
  ],
  authors: [{ name: "Warcraft Exports", url: BASE_URL }],
  creator: "Warcraft Exports (RAAS ENTERPRISES)",
  publisher: "Warcraft Exports",
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-video-preview": -1, "max-image-preview": "large", "max-snippet": -1 },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: BASE_URL,
    siteName: "Warcraft Exports",
    title: "Warcraft Exports — WW1 & WW2 Historical Reproduction Military Gear",
    description:
      "Manufacturer-direct WW1 & WW2 reproduction military gear. Leather holsters, canvas equipment, uniforms and collector items. Ships worldwide from Kanpur, India.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Warcraft Exports — Historical Reproduction Military Gear",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Warcraft Exports — WW1 & WW2 Historical Reproduction Military Gear",
    description:
      "Manufacturer-direct WW1 & WW2 reproduction military gear. Ships worldwide from Kanpur, India.",
    images: ["/og-image.jpg"],
  },
  alternates: {
    canonical: BASE_URL,
  },
  verification: {
    // Add Google Search Console verification code here when available
    // google: "your-verification-code",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${arupalaGrotesk.variable} ${workSans.variable} ${merriweather.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        {/* Suppress Chrome Extension runtime errors and unhandled rejections from triggering the Next.js Dev Overlay */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                if (typeof window === 'undefined') return;
                window.addEventListener('unhandledrejection', function(event) {
                  var reason = event.reason;
                  if (reason) {
                    var stack = reason.stack || '';
                    var message = reason.message || '';
                    if (
                      stack.indexOf('chrome-extension://') !== -1 ||
                      message.indexOf('chrome-extension://') !== -1 ||
                      (reason.filename && reason.filename.indexOf('chrome-extension://') !== -1)
                    ) {
                      event.stopImmediatePropagation();
                      event.preventDefault();
                    }
                  }
                }, true);
                window.addEventListener('error', function(event) {
                  if (
                    (event.filename && event.filename.indexOf('chrome-extension://') !== -1) ||
                    (event.error && event.error.stack && event.error.stack.indexOf('chrome-extension://') !== -1)
                  ) {
                    event.stopImmediatePropagation();
                    event.preventDefault();
                  }
                }, true);
              })();
            `
          }}
        />
        {/* Organization structured data — helps Google understand the brand */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "@id": `${BASE_URL}/#organization`,
              name: "Warcraft Exports",
              legalName: "RAAS ENTERPRISES",
              url: BASE_URL,
              logo: {
                "@type": "ImageObject",
                url: `${BASE_URL}/logo.png`,
              },
              description:
                "Manufacturer and global exporter of WW1 & WW2 historical reproduction military gear. Based in Kanpur, India.",
              address: {
                "@type": "PostalAddress",
                streetAddress: "Fazalgunj",
                addressLocality: "Kanpur",
                addressRegion: "Uttar Pradesh",
                postalCode: "208012",
                addressCountry: "IN",
              },
              contactPoint: [
                {
                  "@type": "ContactPoint",
                  telephone: "+91-9839035193",
                  contactType: "customer service",
                  availableLanguage: "English",
                },
              ],
              email: "warcraftexports@gmail.com",
              foundingDate: "2015",
              numberOfEmployees: { "@type": "QuantitativeValue", value: 50 },
              sameAs: [
                "https://www.amazon.com/stores/WarcraftExports",
                "https://www.ebay.com/usr/warcraftexports",
              ],
            }),
          }}
        />
        {/* WebSite structured data with SearchAction for Google Sitelinks Search */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "@id": `${BASE_URL}/#website`,
              url: BASE_URL,
              name: "Warcraft Exports",
              description: "Historical Reproduction Military Gear",
              publisher: { "@id": `${BASE_URL}/#organization` },
              potentialAction: {
                "@type": "SearchAction",
                target: { "@type": "EntryPoint", urlTemplate: `${BASE_URL}/search?q={search_term_string}` },
                "query-input": "required name=search_term_string",
              },
            }),
          }}
        />
        {/* Google Translate Global Initialization */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.googleTranslateElementInit = function() {
                console.log('Google Translate Init Fired');
                try {
                  new google.translate.TranslateElement({
                    pageLanguage: 'en',
                    autoDisplay: false
                  }, 'google_translate_element');
                } catch (e) {
                  console.error('Google Translate initialization error:', e);
                }
              }
            `
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-parchment text-leather-dark" suppressHydrationWarning>
        <Suspense fallback={null}>
          <PostHogProvider>{children}</PostHogProvider>
        </Suspense>

        {/* Google Translate Hidden Element and Script */}
        <div id="google_translate_element" className="absolute opacity-0 pointer-events-none w-0 h-0 overflow-hidden" />
        <Script
          id="google-translate-widget-script"
          src="https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
