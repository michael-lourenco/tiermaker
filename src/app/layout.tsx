import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"
import { StickySidebar } from "@/components/ads/StickySidebar"
import { ThemeProvider } from "@/components/theme/theme-provider"
import { LanguageProvider } from "@/contexts/LanguageContext"

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
        <LanguageProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem={false}
            disableTransitionOnChange
          >
            <div className="flex flex-col min-h-screen">
              <Header />
              <div className="flex-1 relative">
                {children}
                <StickySidebar />
              </div>
              <Footer />
            </div>
          </ThemeProvider>
        </LanguageProvider>
      </body>
    </html>
  )
}
