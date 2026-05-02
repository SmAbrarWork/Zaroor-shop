import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../utils/api'

export const fetchCart = createAsyncThunk('cart/fetchCart', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/cart')
    return data.data
  } catch (err) {
    return rejectWithValue(err.response?.data?.message ?? 'Failed to fetch cart')
  }
})

export const addToCartServer = createAsyncThunk('cart/addToCartServer', async ({ productId, quantity = 1, selectedOptions = {} }, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/cart', { productId, quantity, selectedOptions })
    return data.data
  } catch (err) {
    return rejectWithValue(err.response?.data?.message ?? 'Failed to add to cart')
  }
})

export const updateCartItemServer = createAsyncThunk('cart/updateCartItemServer', async ({ productId, quantity, variantKey = '' }, { rejectWithValue }) => {
  try {
    const { data } = await api.put(`/cart/${productId}`, { quantity, variantKey })
    return data.data
  } catch (err) {
    return rejectWithValue(err.response?.data?.message ?? 'Failed to update cart')
  }
})

export const removeFromCartServer = createAsyncThunk('cart/removeFromCartServer', async ({ productId, variantKey = '' }, { rejectWithValue }) => {
  try {
    const query = variantKey ? `?variantKey=${encodeURIComponent(variantKey)}` : ''
    const { data } = await api.delete(`/cart/${productId}${query}`)
    return data.data
  } catch (err) {
    return rejectWithValue(err.response?.data?.message ?? 'Failed to remove from cart')
  }
})

const loadGuestCart = () => {
  try {
    const stored = localStorage.getItem('guest_cart')
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

const saveGuestCart = (items) => {
  localStorage.setItem('guest_cart', JSON.stringify(items))
}

const initialState = {
  items: loadGuestCart(),
  loading: false,
  error: null,
  /** Increments when items are added — drives cart icon shake in the header */
  cartIconBump: 0,
}

const getItemId = (item) => item.product?._id || item.product?.id || item.product
const normalizeSelectedOptions = (selectedOptions = {}) => ({
  color: selectedOptions.color || '',
  size: selectedOptions.size || '',
  waistSize:
    selectedOptions.waistSize === null || selectedOptions.waistSize === undefined || selectedOptions.waistSize === ''
      ? null
      : Number(selectedOptions.waistSize),
})
const getVariantKey = (selectedOptions = {}) => {
  const normalized = normalizeSelectedOptions(selectedOptions)
  return [normalized.color, normalized.size, normalized.waistSize ?? ''].join('|')
}
const getCartLineId = (item) => `${getItemId(item)}::${item.variantKey || getVariantKey(item.selectedOptions)}`

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCartLocal: (state, action) => {
      const { product, quantity = 1, selectedOptions = {} } = action.payload
      const pid = product._id || product.id
      const normalizedOptions = normalizeSelectedOptions(selectedOptions)
      const variantKey = getVariantKey(normalizedOptions)
      const existing = state.items.find((i) => getItemId(i) === pid && (i.variantKey || getVariantKey(i.selectedOptions)) === variantKey)
      if (existing) {
        existing.quantity += quantity
      } else {
        state.items.push({ product, quantity, selectedOptions: normalizedOptions, variantKey })
      }
      state.cartIconBump += 1
      saveGuestCart(state.items)
    },
    updateQuantityLocal: (state, action) => {
      const { lineId, quantity } = action.payload
      const item = state.items.find((i) => getCartLineId(i) === lineId)
      if (item) item.quantity = quantity
      saveGuestCart(state.items)
    },
    removeFromCartLocal: (state, action) => {
      state.items = state.items.filter((i) => getCartLineId(i) !== action.payload)
      saveGuestCart(state.items)
    },
    clearCartLocal: (state) => {
      state.items = []
      saveGuestCart([])
    },
    setCartItems: (state, action) => {
      state.items = action.payload
      saveGuestCart(state.items)
    },
  },
  extraReducers: (builder) => {
    const setFromServer = (state, action) => {
      state.loading = false
      state.items = action.payload.items ?? []
    }

    builder
      .addCase(fetchCart.pending, (state) => { state.loading = true })
      .addCase(fetchCart.fulfilled, setFromServer)
      .addCase(fetchCart.rejected, (state) => { state.loading = false })
      .addCase(addToCartServer.fulfilled, (state, action) => {
        setFromServer(state, action)
        state.cartIconBump += 1
      })
      .addCase(updateCartItemServer.fulfilled, setFromServer)
      .addCase(removeFromCartServer.fulfilled, setFromServer)
  },
})

export const { addToCartLocal, updateQuantityLocal, removeFromCartLocal, clearCartLocal, setCartItems } = cartSlice.actions
export default cartSlice.reducer
