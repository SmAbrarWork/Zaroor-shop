import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../utils/api'

export const fetchProducts = createAsyncThunk('products/fetchProducts', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/products')
    return data.data
  } catch (err) {
    return rejectWithValue(err.response?.data?.message ?? 'Failed to fetch products')
  }
})

const initialState = {
  items: [],
  filteredItems: [],
  loading: false,
}

const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    filterProductsByEvent: (state, action) => {
      const activeSlug = action.payload
      if (!activeSlug) {
        state.filteredItems = state.items
        return
      }
      state.filteredItems = state.items.filter((item) => {
        const slug = item.event?.slug
        return slug === activeSlug
      })
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => { state.loading = true })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false
        const payload = action.payload ?? []
        state.items = payload
        /* Full catalog; MainLayout syncs filteredItems to the active campaign */
        state.filteredItems = payload
      })
      .addCase(fetchProducts.rejected, (state) => { state.loading = false })
  },
})

export const { filterProductsByEvent } = productSlice.actions
export default productSlice.reducer
