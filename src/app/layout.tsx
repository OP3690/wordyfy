import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Analytics from "@/components/Analytics";
import { StreakProvider } from "@/components/StreakProvider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const APP_URL = "https://www.wordyfy.com";
const APP_DESCRIPTION =
  "Learn English words like never before. Master vocabulary with AI-powered word discovery, Hindi translations, gamified quizzes, and spaced repetition. Free — join 5,000+ learners.";

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: "WordyFy — AI Vocabulary Builder with Hindi Translations",
    template: "%s | WordyFy",
  },
  description: APP_DESCRIPTION,
  keywords: [
    "vocabulary builder",
    "learn English words",
    "English Hindi translation",
    "word learning app",
    "improve vocabulary",
    "GRE vocabulary",
    "IELTS vocabulary",
    "CAT English preparation",
    "English learning app India",
    "AI vocabulary",
    "word quiz",
    "spaced repetition",
    "word of the day",
    "advanced English words",
  ],
  authors: [{ name: "WordyFy", url: APP_URL }],
  creator: "WordyFy",
  publisher: "WordyFy",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: APP_URL,
    siteName: "WordyFy",
    title: "WordyFy — Make Words Your Superpower",
    description: APP_DESCRIPTION,
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "WordyFy — AI vocabulary builder with Hindi translations",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@wordyfy",
    title: "WordyFy — Learn English Words Like Never Before",
    description:
      "AI vocabulary app with Hindi translations, daily quizzes & streaks. Used by 5,000+ learners. Free to start!",
    images: ["/og-image.png"],
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/manifest.json",
  alternates: {
    canonical: APP_URL,
  },
  verification: {
    google: "A4IlZuk-NL5aixe0xQ9Vr-X1ALt4IyXn4j5EoUAsiWY",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "WordyFy",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#6C47FF",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebApplication",
      "@id": `${APP_URL}/#app`,
      name: "WordyFy",
      url: APP_URL,
      description: APP_DESCRIPTION,
      applicationCategory: "EducationalApplication",
      operatingSystem: "Any",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "INR",
      },
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: "4.8",
        ratingCount: "1240",
        bestRating: "5",
      },
    },
    {
      "@type": "Organization",
      "@id": `${APP_URL}/#org`,
      name: "WordyFy",
      url: APP_URL,
      logo: {
        "@type": "ImageObject",
        url: `${APP_URL}/logo.png`,
      },
    },
    {
      "@type": "WebSite",
      "@id": `${APP_URL}/#website`,
      url: APP_URL,
      name: "WordyFy",
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: `${APP_URL}/word/{search_term_string}`,
        },
        "query-input": "required name=search_term_string",
      },
    },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en-IN" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <meta name="application-name" content="WordyFy" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="WordyFy" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#6C47FF" />
        <meta name="msapplication-tap-highlight" content="no" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon.png" type="image/png" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/icon-192x192.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/icon-192x192.png" />
        <link rel="mask-icon" href="/icon-192x192.png" color="#6C47FF" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator && !/localhost|127\\.0\\.0\\.1/.test(location.hostname)) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js')
                    .then(function(registration) { console.log('SW registered: ', registration); })
                    .catch(function(err) { console.log('SW registration failed: ', err); });
                });
              }
            `,
          }}
        />
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6349841658473646"
          crossOrigin="anonymous"
        />
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        <StreakProvider>
          <Analytics />
          {children}
        </StreakProvider>
      </body>
    </html>
  );
}
