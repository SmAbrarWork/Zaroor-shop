import { formatCurrencyPKR } from '../../utils/dateUtils'

export default function CartItem({ product, quantity, onUpdateQuantity, onRemove }) {
  const productId = product._id || product.id

  return (
    <div className="flex gap-4 rounded-2xl border border-white/10 bg-white/5 p-4">
      <img
        src={product.image}
        alt={product.name}
        className="h-24 w-24 rounded-xl object-cover"
      />
      <div className="flex flex-1 flex-col justify-between">
        <div>
          <h3 className="font-bold">{product.name}</h3>
          <p className="text-sm text-[var(--color-accent)]">{formatCurrencyPKR(product.price)}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center rounded-full border border-white/20">
            <button
              onClick={() => onUpdateQuantity(productId, quantity - 1)}
              className="px-3 py-1 text-sm hover:text-[var(--color-accent)]"
              disabled={quantity <= 1}
            >
              -
            </button>
            <span className="min-w-[2rem] text-center text-sm font-bold">{quantity}</span>
            <button
              onClick={() => onUpdateQuantity(productId, quantity + 1)}
              className="px-3 py-1 text-sm hover:text-[var(--color-accent)]"
            >
              +
            </button>
          </div>
          <button
            onClick={() => onRemove(productId)}
            className="text-xs text-white/40 underline hover:text-red-400"
          >
            Remove
          </button>
          <span className="ml-auto font-bold">{formatCurrencyPKR(product.price * quantity)}</span>
        </div>
      </div>
    </div>
  )
}
