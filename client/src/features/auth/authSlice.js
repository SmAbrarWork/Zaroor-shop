import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../utils/api'

export const register = createAsyncThunk('auth/register', async ({ name, email, password }, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/auth/register', { name, email, password })
    localStorage.setItem('token', data.data.token)
    return data.data
  } catch (err) {
    return rejectWithValue(err.response?.data?.message ?? 'Registration failed')
  }
})

export const login = createAsyncThunk('auth/login', async ({ email, password }, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/auth/login', { email, password })
    localStorage.setItem('token', data.data.token)
    return data.data
  } catch (err) {
    return rejectWithValue(err.response?.data?.message ?? 'Login failed')
  }
})

export const loadUser = createAsyncThunk('auth/loadUser', async (_, { rejectWithValue }) => {
  try {
    const token = localStorage.getItem('token')
    if (!token) return rejectWithValue('No token')
    const { data } = await api.get('/auth/me')
    return data.data
  } catch (err) {
    localStorage.removeItem('token')
    return rejectWithValue(err.response?.data?.message ?? 'Auth failed')
  }
})

const initialState = {
  user: null,
  token: localStorage.getItem('token') || null,
  loading: false,
  error: null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null
      state.token = null
      state.error = null
      localStorage.removeItem('token')
    },
    clearError: (state) => {
      state.error = null
    },
    setToken: (state, action) => {
      state.token = action.payload
      localStorage.setItem('token', action.payload)
    },
  },
  extraReducers: (builder) => {
    const handlePending = (state) => { state.loading = true; state.error = null }
    const handleRejected = (state, action) => { state.loading = false; state.error = action.payload }

    builder
      .addCase(register.pending, handlePending)
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload.user
        state.token = action.payload.token
      })
      .addCase(register.rejected, handleRejected)
      .addCase(login.pending, handlePending)
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload.user
        state.token = action.payload.token
      })
      .addCase(login.rejected, handleRejected)
      .addCase(loadUser.pending, (state) => { state.loading = true })
      .addCase(loadUser.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload
      })
      .addCase(loadUser.rejected, (state) => {
        state.loading = false
        state.user = null
        state.token = null
      })
  },
})

export const { logout, clearError, setToken } = authSlice.actions
export default authSlice.reducer
