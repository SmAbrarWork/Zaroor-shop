import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { mockProducts } from '../../data/mockProducts'
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
  items: mockProducts,
  filteredItems: mockProducts,
  loading: false,
}

const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    filterProductsByEvent: (state, action) => {
      const activeSlug = action.payload
      state.filteredItems = state.items.filter((item) => item.tags.includes(activeSlug))
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => { state.loading = true })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false
        if (action.payload.length > 0) {
          state.items = action.payload
          state.filteredItems = action.payload
        }
      })
      .addCase(fetchProducts.rejected, (state) => { state.loading = false })
  },
})

export const { filterProductsByEvent } = productSlice.actions
export default productSlice.reducer
