export const selectProductState = (state) => state.products
export const selectProducts = (state) => selectProductState(state).items
export const selectFilteredProducts = (state) => selectProductState(state).filteredItems
export const selectProductById = (state, id) =>
  selectProductState(state).items.find((item) => item.id === id || item._id === id)
