import type { Metadata } from 'next'
import Script from 'next/script'

export const metadata: Metadata = {
  title: 'SEO Blog — AI Powered Articles',
  description: 'Fresh articles published automatically by AI agents',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        {/*
        OLD GA (commented out)
        const GA_ID = process.env.NEXT_PUBLIC_GA_ID

        {GA_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
              strategy="afterInteractive"
            />

            <Script id="google-analytics">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_ID}');
              `}
            </Script>
          </>
        )}
        */}

        {/* NEW GOOGLE ANALYTICS */}
        {/* NEW GOOGLE ANALYTICS */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-BHVYL1PF8C"
          strategy="afterInteractive"
        />

        <Script id="google-analytics" strategy="afterInteractive">
          {`
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());

    gtag('config', 'G-BHVYL1PF8C', {
      'debug_mode': true
    });
  `}
        </Script>
      </head>

      <body>{children}</body>
    </html>
  )
}