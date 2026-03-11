// feedSlice — manages feed/timeline state.
// Tracks current circle, active post type filters, pinned circle IDs, and default type prefs.
//
// Preferences (defaultTypes, pinnedCircleIds) are loaded automatically from the user object
// on login/session restore by listening to auth thunks via extraReducers.
// They are saved back to the server via saveDefaultTypesAsync / savePinnedCirclesAsync.
//
// Expected user profile shape (from server):
//   user.preferences.defaultPostTypes  — string[]  e.g. ['Note', 'Article']
//   user.preferences.pinnedCircleIds   — string[]  e.g. ['circle:abc@domain']

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { getClient } from '../lib/client'
import { loginAsync, registerAsync, logoutAsync, restoreSessionAsync } from '../features/auth/authSlice'

// ── Async thunks ────────────────────────────────────────────────────────────

export const saveDefaultTypesAsync = createAsyncThunk(
  'feed/saveDefaultTypes',
  async (types, { getState, rejectWithValue }) => {
    const { serverUrl, user } = getState().auth
    try {
      const client = getClient(serverUrl)
      await client.activities.updateProfile({
        preferences: {
          ...user?.preferences,
          defaultPostTypes: types,
        },
      })
      return types
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to save default types')
    }
  }
)

export const savePinnedCirclesAsync = createAsyncThunk(
  'feed/savePinnedCircles',
  async (pinnedCircleIds, { getState, rejectWithValue }) => {
    const { serverUrl, user } = getState().auth
    try {
      const client = getClient(serverUrl)
      await client.activities.updateProfile({
        preferences: {
          ...user?.preferences,
          pinnedCircleIds,
        },
      })
      return pinnedCircleIds
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to save pinned circles')
    }
  }
)

// ── Helpers ─────────────────────────────────────────────────────────────────

function loadPrefsFromUser(state, user) {
  const prefs = user?.preferences ?? {}
  state.defaultTypes    = prefs.defaultPostTypes ?? []
  state.activeTypes     = prefs.defaultPostTypes ?? []
  state.pinnedCircleIds = prefs.pinnedCircleIds  ?? []
}

function resetFeedState(state) {
  state.circleId        = null
  state.activeTypes     = []
  state.defaultTypes    = []
  state.pinnedCircleIds = []
}

// ── Slice ───────────────────────────────────────────────────────────────────

const feedSlice = createSlice({
  name: 'feed',
  initialState: {
    circleId: null,       // currently selected circle ID (null = use default)
    activeTypes: [],      // current session filter — [] means show all types
    defaultTypes: [],     // user's saved default type filter (from profile)
    pinnedCircleIds: [],  // user-pinned circle IDs (from profile)
  },
  reducers: {
    setCircle(state, action) {
      state.circleId = action.payload
    },

    toggleType(state, action) {
      const type = action.payload
      if (state.activeTypes.includes(type)) {
        state.activeTypes = state.activeTypes.filter((t) => t !== type)
      } else {
        state.activeTypes.push(type)
      }
    },

    clearTypes(state) {
      state.activeTypes = []
    },

    // Restore active types back to the saved defaults
    resetToDefaults(state) {
      state.activeTypes = [...state.defaultTypes]
    },

    pinCircle(state, action) {
      if (!state.pinnedCircleIds.includes(action.payload)) {
        state.pinnedCircleIds.push(action.payload)
      }
    },

    unpinCircle(state, action) {
      state.pinnedCircleIds = state.pinnedCircleIds.filter((id) => id !== action.payload)
    },
  },

  extraReducers: (builder) => {
    builder
      // Load prefs when user logs in
      .addCase(loginAsync.fulfilled, (state, action) => {
        loadPrefsFromUser(state, action.payload.user)
      })
      // Load prefs when session is restored
      .addCase(restoreSessionAsync.fulfilled, (state, action) => {
        if (action.payload?.user) loadPrefsFromUser(state, action.payload.user)
      })
      // New users get blank prefs
      .addCase(registerAsync.fulfilled, (state) => {
        resetFeedState(state)
      })
      // Clear everything on logout
      .addCase(logoutAsync.fulfilled, (state) => {
        resetFeedState(state)
      })
      // On successful save, update defaultTypes to match what was saved
      .addCase(saveDefaultTypesAsync.fulfilled, (state, action) => {
        state.defaultTypes = action.payload
      })
      .addCase(savePinnedCirclesAsync.fulfilled, (state, action) => {
        state.pinnedCircleIds = action.payload
      })
  },
})

export const {
  setCircle,
  toggleType,
  clearTypes,
  resetToDefaults,
  pinCircle,
  unpinCircle,
} = feedSlice.actions

export default feedSlice.reducer
