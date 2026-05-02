import { formatCurrencyPKR } from '../../utils/dateUtils'
import SafeProductImage from '../ui/SafeProductImage'

export default function CartItem({ item, product, quantity, onUpdateQuantity, onRemove }) {
  const selected = item?.selectedOptions || {}
  const lineTotal = product.price * quantity

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-[color-mix(in_srgb,var(--color-surface)_40%,transparent)] p-3 shadow-sm sm:p-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:gap-4">
        <div className="relative flex shrink-0 justify-center sm:block">
          <div className="relative aspect-square w-full max-w-[8.5rem] overflow-hidden rounded-xl bg-white/[0.06] sm:h-24 sm:w-24 sm:max-w-none">
            <SafeProductImage
              src={product.image}
              alt={product.name}
              imgClassName="absolute inset-0 h-full w-full object-cover"
            />
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-1 sm:pr-2">
            <h3 className="text-center font-bold leading-snug break-words sm:text-left">{product.name}</h3>
            <p className="text-center text-sm text-[var(--color-accent)] sm:text-left">{formatCurrencyPKR(product.price)}</p>
            <p className="text-center text-xs leading-relaxed text-white/50 sm:text-left">
              {[selected.color, selected.size, selected.waistSize ? `Waist ${selected.waistSize}` : ''].filter(Boolean).join(' · ') || 'Standard'}
            </p>
          </div>

          <div className="mt-4 flex flex-col gap-4 border-t border-white/10 pt-4 sm:mt-3 sm:flex-row sm:items-center sm:justify-between sm:border-0 sm:pt-0">
            <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
              <div className="flex items-center rounded-full border border-white/20 bg-white/[0.03]">
                <button
                  type="button"
                  onClick={() => onUpdateQuantity(item, quantity - 1)}
                  className="touch-manipulation px-4 py-2 text-sm font-medium hover:text-[var(--color-accent)] disabled:opacity-30"
                  disabled={quantity <= 1}
                  aria-label="Decrease quantity"
                >
                  −
                </button>
                <span className="min-w-[2.25rem] text-center text-sm font-bold tabular-nums">{quantity}</span>
                <button
                  type="button"
                  onClick={() => onUpdateQuantity(item, quantity + 1)}
                  className="touch-manipulation px-4 py-2 text-sm font-medium hover:text-[var(--color-accent)]"
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>
              <button
                type="button"
                onClick={() => onRemove(item)}
                className="text-xs text-white/45 underline decoration-white/20 underline-offset-4 hover:text-red-400"
              >
                Remove
              </button>
            </div>

            <p className="text-center text-lg font-black tabular-nums text-white sm:text-right">{formatCurrencyPKR(lineTotal)}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
