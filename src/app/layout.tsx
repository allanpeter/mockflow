import type { Metadata, Viewport } from 'next'
import { Geist, Sora } from 'next/font/google'
import Script from 'next/script'
import './globals.css'
import { Toaster } from '@/components/ui/sonner'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { ThemeProvider } from '@/components/layout/theme-provider'
import { IdleTimeout } from '@/components/auth/idle-timeout'

const geist = Geist({ subsets: ['latin'], variable: '--font-geist-sans' })
const sora = Sora({ subsets: ['latin'], variable: '--font-sora' })

const GA_ID = process.env.NEXT_PUBLIC_GA_ID
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://mockflow.com.br'

const TITLE = 'MockFlow — Pratique entrevistas com profissionais'
const DESCRIPTION = 'Agende mock interviews com engenheiros experientes e acelere sua carreira.'

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: TITLE,
  description: DESCRIPTION,
  // Favicon, app icon e apple-touch são resolvidos pelos arquivos
  // src/app/{icon.svg,icon.png,apple-icon.png} (file conventions).
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    siteName: 'MockFlow',
    url: APP_URL,
    title: TITLE,
    description: DESCRIPTION,
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'MockFlow' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
    images: ['/og-image.png'],
  },
  verification: {
    google: process.env.NEXT_PUBLIC_SEARCH_CONSOLE_ID,
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" className={`${geist.variable} ${sora.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="flex min-h-full flex-col">
        {GA_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_ID}');
              `}
            </Script>
          </>
        )}
        <ThemeProvider>
          <IdleTimeout />
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
          <Toaster richColors position="top-center" />
        </ThemeProvider>
      </body>
    </html>
  )
}
