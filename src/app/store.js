import { configureStore } from '@reduxjs/toolkit'
import authReducer, { restoreSessionAsync } from '../features/auth/authSlice'
import feedReducer from './feedSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    feed: feedReducer,
  },
})

// Kick off session restore immediately so the app knows auth state
// before the first render cycle completes.
store.dispatch(restoreSessionAsync())
