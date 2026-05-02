import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../utils/api'

export const fetchCategoriesForEvent = createAsyncThunk(
  'categories/fetchForEvent',
  async (eventSlug, { rejectWithValue }) => {
    if (!eventSlug) return []
    try {
      const { data } = await api.get('/categories', { params: { eventSlug } })
      return data.data ?? []
    } catch (err) {
      return rejectWithValue(err.response?.data?.message ?? 'Failed to load categories')
    }
  }
)

const initialState = {
  items: [],
  loading: false,
  error: null,
}

const categoriesSlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {
    clearCategories: (state) => {
      state.items = []
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategoriesForEvent.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchCategoriesForEvent.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload ?? []
      })
      .addCase(fetchCategoriesForEvent.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload ?? null
      })
  },
})

export const { clearCategories } = categoriesSlice.actions
export default categoriesSlice.reducer
