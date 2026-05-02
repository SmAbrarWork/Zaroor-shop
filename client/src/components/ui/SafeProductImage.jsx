import { useMemo, useState } from 'react'
import { PRODUCT_IMAGE_FALLBACKS } from '../../constants/productImageFallbacks.js'

function buildChain(src) {
  const primary = typeof src === 'string' ? src.trim() : ''
  const first = primary || PRODUCT_IMAGE_FALLBACKS[0]
  const rest = PRODUCT_IMAGE_FALLBACKS.filter((u) => u !== first)
  return [first, ...rest]
}

function SafeProductImageInner({ chain, alt, imgClassName }) {
  const [step, setStep] = useState(0)
  const effectiveSrc = chain[Math.min(step, chain.length - 1)]

  const handleError = () => {
    setStep((s) => (s + 1 < chain.length ? s + 1 : s))
  }

  return (
    <img
      src={effectiveSrc}
      alt={alt || 'Product'}
      onError={handleError}
      referrerPolicy="no-referrer"
      loading="lazy"
      decoding="async"
      className={imgClassName}
    />
  )
}

/**
 * Product visuals with automatic fallback when src fails to load.
 * Inner component remounts when `src` changes so the fallback step resets without effects.
 */
export default function SafeProductImage({
  src,
  alt,
  className = '',
  imgClassName = '',
}) {
  const chain = useMemo(() => buildChain(src), [src])

  return (
    <span className={className || 'contents'}>
      <SafeProductImageInner key={src} chain={chain} alt={alt} imgClassName={imgClassName} />
    </span>
  )
}
