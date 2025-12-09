'use client'

import Script from 'next/script'

interface GoogleAnalyticsProps {
  gaMeasurementId?: string | null
  gtmContainerId?: string | null
}

export function GoogleAnalytics({ gaMeasurementId, gtmContainerId }: GoogleAnalyticsProps) {
  if (!gaMeasurementId && !gtmContainerId) {
    return null
  }

  return (
    <>
      {/* Google Tag Manager */}
      {gtmContainerId && (
        <Script
          id="gtm-script"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','${gtmContainerId}');
            `,
          }}
        />
      )}

      {/* Google Analytics 4 */}
      {gaMeasurementId && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${gaMeasurementId}`}
            strategy="afterInteractive"
          />
          <Script
            id="ga4-config"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${gaMeasurementId}');
              `,
            }}
          />
        </>
      )}
    </>
  )
}

// GTM noscript fallback component for body
export function GTMNoScript({ gtmContainerId }: { gtmContainerId?: string | null }) {
  if (!gtmContainerId) {
    return null
  }

  return (
    <noscript>
      <iframe
        src={`https://www.googletagmanager.com/ns.html?id=${gtmContainerId}`}
        height="0"
        width="0"
        style={{ display: 'none', visibility: 'hidden' }}
      />
    </noscript>
  )
}
