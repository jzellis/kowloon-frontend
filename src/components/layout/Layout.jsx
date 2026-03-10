// Protected layout — redirects to /login if not authenticated.
// Shows a loading spinner while the session restore is in flight.

import { Outlet, Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { Header } from './Header'

export default function Layout() {
  const { user, sessionChecked } = useSelector((state) => state.auth)

  if (!sessionChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="loading loading-spinner loading-lg" />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return (
    <div className="min-h-screen bg-base-200">
      <Header />
      <main className="container mx-auto px-4 py-6 max-w-4xl">
        <Outlet />
      </main>
    </div>
  )
}
