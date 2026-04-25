import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { getActiveEventByDate } from '../../utils/dateUtils'
import api from '../../utils/api'

export const fetchEvents = createAsyncThunk('event/fetchEvents', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/events')
    return data.data
  } catch (err) {
    return rejectWithValue(err.response?.data?.message ?? 'Failed to fetch events')
  }
})

const initialState = {
  events: [],
  activeEvent: null,
  loading: false,
}

const eventSlice = createSlice({
  name: 'event',
  initialState,
  reducers: {
    detectEventByDate: (state) => {
      state.activeEvent = state.events.length > 0 ? getActiveEventByDate(state.events) : null
    },
    setActiveEventBySlug: (state, action) => {
      const selected = state.events.find((event) => event.slug === action.payload)
      if (selected) state.activeEvent = selected
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchEvents.pending, (state) => { state.loading = true })
      .addCase(fetchEvents.fulfilled, (state, action) => {
        state.loading = false
        state.events = action.payload
        state.activeEvent = action.payload.length > 0 ? getActiveEventByDate(action.payload) : null
      })
      .addCase(fetchEvents.rejected, (state) => { state.loading = false })
  },
})

export const { detectEventByDate, setActiveEventBySlug } = eventSlice.actions
export default eventSlice.reducer
