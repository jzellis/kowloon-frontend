// Public layout — accessible to all users, with or without auth.
// Shows the header (which adapts based on auth state).

import { Outlet } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { Header } from './Header'

export default function PublicLayout() {
  const { sessionChecked } = useSelector((state) => state.auth)

  if (!sessionChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="loading loading-spinner loading-lg" />
      </div>
    )
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
