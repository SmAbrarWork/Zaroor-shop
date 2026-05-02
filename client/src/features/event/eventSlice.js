import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { getActiveEventByDate } from '../../utils/dateUtils'
import api from '../../utils/api'

/** Remember which campaign the shopper chose (survives reload / new tab). */
const ACTIVE_EVENT_SLUG_KEY = 'zaroor_shop_active_event_slug'

function readStoredEventSlug() {
  try {
    const raw = localStorage.getItem(ACTIVE_EVENT_SLUG_KEY)
    const slug = typeof raw === 'string' ? raw.trim() : ''
    return slug.length > 0 ? slug : null
  } catch {
    return null
  }
}

function findEventByStoredSlug(events, storedSlug) {
  if (!storedSlug || !events?.length) return null
  const s = storedSlug.trim().toLowerCase()
  return (
    events.find((event) => event.slug?.trim().toLowerCase() === s) ?? null
  )
}

function writeStoredEventSlug(slug) {
  try {
    if (slug) localStorage.setItem(ACTIVE_EVENT_SLUG_KEY, slug)
    else localStorage.removeItem(ACTIVE_EVENT_SLUG_KEY)
  } catch {
    /* ignore quota / private mode */
  }
}

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
      if (state.events.length === 0) {
        state.activeEvent = null
        writeStoredEventSlug(null)
        return
      }
      state.activeEvent = getActiveEventByDate(state.events)
      if (state.activeEvent) writeStoredEventSlug(state.activeEvent.slug)
    },
    setActiveEventBySlug: (state, action) => {
      const selected = state.events.find((event) => event.slug === action.payload)
      if (selected) {
        state.activeEvent = selected
        writeStoredEventSlug(selected.slug)
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchEvents.pending, (state) => { state.loading = true })
      .addCase(fetchEvents.fulfilled, (state, action) => {
        state.loading = false
        const list = action.payload
        state.events = list
        if (list.length === 0) {
          state.activeEvent = null
          writeStoredEventSlug(null)
          return
        }
        const storedSlug = readStoredEventSlug()
        const preferred = findEventByStoredSlug(list, storedSlug)
        state.activeEvent = preferred ?? getActiveEventByDate(list)
        if (state.activeEvent) {
          writeStoredEventSlug(state.activeEvent.slug)
        }
      })
      .addCase(fetchEvents.rejected, (state) => { state.loading = false })
  },
})

export const { detectEventByDate, setActiveEventBySlug } = eventSlice.actions
export default eventSlice.reducer
