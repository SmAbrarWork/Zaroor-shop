import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { DEFAULT_EVENT_SLUG, mockEvents } from '../../data/mockEvents'
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

const initialEvent = getActiveEventByDate(mockEvents)

const initialState = {
  events: mockEvents,
  activeEvent:
    mockEvents.find((event) => event.slug === initialEvent.slug) ??
    mockEvents.find((event) => event.slug === DEFAULT_EVENT_SLUG) ??
    mockEvents[0],
  loading: false,
}

const eventSlice = createSlice({
  name: 'event',
  initialState,
  reducers: {
    detectEventByDate: (state) => {
      state.activeEvent = getActiveEventByDate(state.events)
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
        if (action.payload.length > 0) {
          state.events = action.payload
          state.activeEvent = getActiveEventByDate(action.payload)
        }
      })
      .addCase(fetchEvents.rejected, (state) => { state.loading = false })
  },
})

export const { detectEventByDate, setActiveEventBySlug } = eventSlice.actions
export default eventSlice.reducer
