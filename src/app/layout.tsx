import type { Metadata } from "next"
import { Inter } from "next/font/google"
import Script from "next/script"
import "./globals.css"
import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"
// BANNERS DESABILITADOS TEMPORARIAMENTE
// import { StickySidebar } from "@/components/ads/StickySidebar"
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
        {/* Script para silenciar console.* e interceptar logs de fetch no browser (segurança) */}
        <Script
          id="silence-console"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                if (typeof window !== 'undefined') {
                  // Salvar referências originais (caso precise para debug interno)
                  window.__originalConsole = {
                    log: console.log,
                    error: console.error,
                    warn: console.warn,
                    info: console.info,
                    debug: console.debug,
                    trace: console.trace,
                    table: console.table,
                    group: console.group,
                    groupEnd: console.groupEnd,
                    time: console.time,
                    timeEnd: console.timeEnd,
                  };
                  
                  // Sobrescrever console.* com funções vazias
                  console.log = function() {};
                  console.info = function() {};
                  console.debug = function() {};
                  console.error = function() {};
                  console.warn = function() {};
                  console.trace = function() {};
                  console.table = function() {};
                  console.group = function() {};
                  console.groupEnd = function() {};
                  console.time = function() {};
                  console.timeEnd = function() {};
                  
                  // Interceptar fetch para evitar logs de "Fetch finished loading"
                  // NOTA: As mensagens "Fetch finished loading" vêm do DevTools do navegador
                  // e não podem ser completamente desabilitadas via código JavaScript.
                  // Elas aparecem quando a aba Network está aberta no DevTools.
                  const originalFetch = window.fetch;
                  window.fetch = function(...args) {
                    // Executar fetch normalmente
                    const promise = originalFetch.apply(this, args);
                    // Tentar silenciar logs relacionados ao fetch
                    promise.catch(function(error) {
                      // Silenciar erros de fetch
                      return Promise.reject(error);
                    });
                    return promise;
                  };
                  
                  // Interceptar XMLHttpRequest para evitar logs similares
                  if (window.XMLHttpRequest) {
                    const OriginalXHR = window.XMLHttpRequest;
                    window.XMLHttpRequest = function() {
                      const xhr = new OriginalXHR();
                      // Sobrescrever métodos que podem gerar logs
                      const originalOpen = xhr.open;
                      const originalSend = xhr.send;
                      xhr.open = function() {
                        return originalOpen.apply(this, arguments);
                      };
                      xhr.send = function() {
                        return originalSend.apply(this, arguments);
                      };
                      return xhr;
                    };
                    // Copiar propriedades estáticas
                    Object.setPrototypeOf(window.XMLHttpRequest, OriginalXHR);
                    Object.setPrototypeOf(window.XMLHttpRequest.prototype, OriginalXHR.prototype);
                  }
                }
              })();
            `,
          }}
        />
        {/* BANNERS DESABILITADOS TEMPORARIAMENTE - Script do Google AdSense comentado */}
        {/* <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1741854639942970"
          crossOrigin="anonymous"
          strategy="beforeInteractive"
        /> */}
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
                  {/* BANNERS DESABILITADOS TEMPORARIAMENTE */}
                  {/* <StickySidebar /> */}
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
