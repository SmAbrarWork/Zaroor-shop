export const selectCartItems = (state) => state.cart.items
export const selectCartLoading = (state) => state.cart.loading

export const selectCartCount = (state) =>
  state.cart.items.reduce((sum, item) => sum + item.quantity, 0)

export const selectCartTotal = (state) =>
  state.cart.items.reduce((sum, item) => {
    const price = item.product?.price ?? 0
    return sum + price * item.quantity
  }, 0)
