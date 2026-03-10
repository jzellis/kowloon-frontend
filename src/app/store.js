import { configureStore } from '@reduxjs/toolkit'
import authReducer, { restoreSessionAsync } from '../features/auth/authSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
  },
})

// Kick off session restore immediately so the app knows auth state
// before the first render cycle completes.
store.dispatch(restoreSessionAsync())
