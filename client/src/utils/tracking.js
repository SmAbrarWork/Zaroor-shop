export const initAnalytics = () => {
  const gaId = import.meta.env.VITE_GA_MEASUREMENT_ID
  if (!gaId) return

  // Load gtag.js script
  const script = document.createElement('script')
  script.async = true
  script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`
  document.head.appendChild(script)

  window.dataLayer = window.dataLayer || []
  window.gtag = function () { window.dataLayer.push(arguments) }
  window.gtag('js', new Date())
  window.gtag('config', gaId)
}

export const initMetaPixel = () => {
  const pixelId = import.meta.env.VITE_META_PIXEL_ID
  if (!pixelId) return

  // Load Meta Pixel script (minified IIFE from Meta)
  !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
  n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
  n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
  t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
  document,'script','https://connect.facebook.net/en_US/fbevents.js');

  window.fbq('init', pixelId)
  window.fbq('track', 'PageView')
}

export const trackEvent = (eventName, payload = {}) => {
  // Meta Pixel (browser-side)
  if (typeof window.fbq === 'function') {
    const metaMap = {
      view_content: 'ViewContent',
      add_to_cart: 'AddToCart',
      purchase: 'Purchase',
      campaign_view: 'ViewContent',
    }
    const fbEvent = metaMap[eventName]
    if (fbEvent) {
      window.fbq('track', fbEvent, payload)
    } else {
      window.fbq('trackCustom', eventName, payload)
    }
  }

  // GA4 (browser-side)
  if (typeof window.gtag === 'function') {
    window.gtag('event', eventName, payload)
  }
}
