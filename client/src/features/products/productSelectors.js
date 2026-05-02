import { createSelector } from '@reduxjs/toolkit'

export const selectProductState = (state) => state.products
export const selectProducts = (state) => selectProductState(state).items
export const selectFilteredProducts = (state) => selectProductState(state).filteredItems
export const selectProductById = (state, id) =>
  selectProductState(state).items.find((item) => item.id === id || item._id === id)

/** Campaign storefront: featured strip (admin-curated per event). */
export const selectHotDropProducts = createSelector([selectFilteredProducts], (items) =>
  [...items]
    .filter((p) => p.isHotDrop)
    .sort((a, b) => (a.hotDropOrder ?? 0) - (b.hotDropOrder ?? 0))
)
