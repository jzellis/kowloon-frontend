import { configureStore } from '@reduxjs/toolkit'
import authReducer, { restoreSessionAsync } from '../features/auth/authSlice'
import feedReducer from './feedSlice'
import serverReducer, { fetchServerInfoAsync } from './serverSlice'
import themeReducer, { fetchThemesAsync, setActiveTheme } from '../features/theme/themeSlice'
import myCirclesReducer from '../features/circles/myCirclesSlice'
import toastsReducer from './toastSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    feed: feedReducer,
    server: serverReducer,
    theme: themeReducer,
    myCircles: myCirclesReducer,
    toasts: toastsReducer,
  },
})

// Fetch themes first (public endpoint, no auth needed) — applies the saved or
// server-default theme as soon as the list arrives.
store.dispatch(fetchThemesAsync())

// Restore session and server info in parallel.
store.dispatch(fetchServerInfoAsync())
store.dispatch(restoreSessionAsync()).then((action) => {
  // If the restored user has a theme preference, apply it over the default —
  // except on pics.<domain>, which forces its own dark theme with no toggle
  // (src/pics/PicsApp.jsx) and must never be overridden by an account's
  // saved main-site preference.
  const userTheme = action.payload?.prefs?.theme
  const isPics = window?.location?.hostname?.startsWith('pics.')
  if (userTheme && !isPics) {
    store.dispatch(setActiveTheme(userTheme))
  }
})
