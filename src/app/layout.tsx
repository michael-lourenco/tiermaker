import type { Metadata } from "next"
import { Inter } from "next/font/google"
import Script from "next/script"
import "./globals.css"
import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"
import { StickySidebar } from "@/components/ads/StickySidebar"
import { ThemeProvider } from "@/components/theme/theme-provider"
import { LanguageProvider } from "@/contexts/LanguageContext"
import { SubscriptionProvider } from "@/contexts/SubscriptionContext"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "SuperTierMaker - Create and Share Tier Lists",
  description: "Create, rank, and share tier lists for any topic",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1741854639942970"
          crossOrigin="anonymous"
          strategy="beforeInteractive"
        />
        <LanguageProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem={false}
            disableTransitionOnChange
          >
            <SubscriptionProvider>
              <div className="flex flex-col min-h-screen">
                <Header />
                <div className="flex-1 relative">
                  {children}
                  <StickySidebar />
                </div>
                <Footer />
              </div>
            </SubscriptionProvider>
          </ThemeProvider>
        </LanguageProvider>
      </body>
    </html>
  )
}
