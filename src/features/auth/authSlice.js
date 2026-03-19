import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { getClient, clearClient } from '../../lib/client'

const SERVER_URL_KEY = 'kowloon_server_url'

const getStoredServerUrl = () => {
  if (typeof window === 'undefined') return null
  return (
    localStorage.getItem(SERVER_URL_KEY) ||
    import.meta.env.VITE_SERVER_URL ||
    null
  )
}

// ---------------------------------------------------------------------------
// Async thunks
// ---------------------------------------------------------------------------

export const loginAsync = createAsyncThunk(
  'auth/login',
  async ({ serverUrl, username, password }, { rejectWithValue }) => {
    try {
      const client = getClient(serverUrl)
      const result = await client.auth.login({ username, password })
      localStorage.setItem(SERVER_URL_KEY, serverUrl)
      return { ...result, serverUrl }
    } catch (err) {
      return rejectWithValue(err.message || 'Login failed')
    }
  }
)

export const registerAsync = createAsyncThunk(
  'auth/register',
  async (
    { serverUrl, username, password, email, profile, inviteCode },
    { rejectWithValue }
  ) => {
    try {
      const client = getClient(serverUrl)
      const result = await client.auth.register({
        username,
        password,
        email,
        profile,
        inviteCode,
      })
      localStorage.setItem(SERVER_URL_KEY, serverUrl)
      return { ...result, serverUrl }
    } catch (err) {
      return rejectWithValue(err.message || 'Registration failed')
    }
  }
)

export const logoutAsync = createAsyncThunk(
  'auth/logout',
  async (_, { getState }) => {
    const { serverUrl } = getState().auth
    const client = getClient(serverUrl)
    if (client) await client.auth.logout()
    localStorage.removeItem(SERVER_URL_KEY)
    clearClient()
  }
)

export const restoreSessionAsync = createAsyncThunk(
  'auth/restoreSession',
  async (_, { getState }) => {
    const { serverUrl } = getState().auth
    if (!serverUrl) return null
    try {
      const client = getClient(serverUrl)
      const user = await client.init()
      return user ? { user, serverUrl } : null
    } catch {
      return null
    }
  }
)

// ---------------------------------------------------------------------------
// Slice
// ---------------------------------------------------------------------------

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    token: null,
    serverUrl: getStoredServerUrl(),
    status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
    sessionChecked: false,
  },
  reducers: {
    // For future "pick your server" flow
    setServerUrl(state, action) {
      state.serverUrl = action.payload
    },
    clearError(state) {
      state.error = null
    },
    // Dev-only: toggle mock user without hitting the server
    devSetUser(state, action) {
      state.user = action.payload
      state.token = action.payload ? 'dev-token' : null
      state.sessionChecked = true
      state.status = action.payload ? 'succeeded' : 'idle'
    },
  },
  extraReducers: (builder) => {
    builder
      // login
      .addCase(loginAsync.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(loginAsync.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.user = action.payload.user
        state.token = action.payload.token
        state.serverUrl = action.payload.serverUrl
        state.sessionChecked = true
      })
      .addCase(loginAsync.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload
      })

      // register
      .addCase(registerAsync.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(registerAsync.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.user = action.payload.user
        state.token = action.payload.token
        state.serverUrl = action.payload.serverUrl
        state.sessionChecked = true
      })
      .addCase(registerAsync.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload
      })

      // logout
      .addCase(logoutAsync.fulfilled, (state) => {
        state.user = null
        state.token = null
        state.status = 'idle'
        state.sessionChecked = true
      })

      // restoreSession
      .addCase(restoreSessionAsync.pending, (state) => {
        state.sessionChecked = false
      })
      .addCase(restoreSessionAsync.fulfilled, (state, action) => {
        state.sessionChecked = true
        if (action.payload) {
          state.user = action.payload.user
          state.serverUrl = action.payload.serverUrl
          state.status = 'succeeded'
        }
      })
      .addCase(restoreSessionAsync.rejected, (state) => {
        state.sessionChecked = true
        state.user = null
      })
  },
})

export const { setServerUrl, clearError, devSetUser } = authSlice.actions
export default authSlice.reducer
