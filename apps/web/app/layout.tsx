import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || "https://open-egypt.vercel.app"),
  title: {
    default: "Open Egypt | The Shadow Open Data Infrastructure",
    template: "%s | Open Egypt",
  },
  description: "Open Egypt is an initiative to digitize missing public infrastructure. A public, transparent API and data platform for Egypt.",
  keywords: ["Open Data", "Egypt", "API", "Car Prices", "Infrastructure", "Public Data", "Development", "Open Source"],
  authors: [{ name: "Open Egypt Initiative" }, { name: "Moe1211", url: "https://github.com/Moe1211" }],
  creator: "Open Egypt Initiative",
  publisher: "Open Egypt Initiative",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: "Open Egypt | The Shadow Open Data Infrastructure",
    description: "Open Egypt is an initiative to digitize missing public infrastructure. A public, transparent API and data platform for Egypt.",
    url: "/",
    siteName: "Open Egypt",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Open Egypt - The Shadow Open Data Infrastructure",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Open Egypt | The Shadow Open Data Infrastructure",
    description: "The Shadow Open Data Infrastructure for Egypt. We do not wait for official APIs. We build them.",
    creator: "@Moe1211", // Assuming handle based on github, can be updated
    images: ["/og-image.png"],
  },
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
};

export const viewport: Viewport = {
  themeColor: "black",
  width: "device-width",
  initialScale: 1,
};

import { Toaster } from "sonner";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" style={{ colorScheme: 'dark' }}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "Open Egypt",
              url: "https://open-egypt.vercel.app",
              logo: "https://open-egypt.vercel.app/logo.png",
              sameAs: [
                "https://github.com/Moe1211/open-egypt",
              ],
              description: "The Shadow Open Data Infrastructure for Egypt.",
            }),
          }}
        />
      </head>
      <body className={inter.className}>
        {children}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
