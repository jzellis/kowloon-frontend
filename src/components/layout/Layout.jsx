// Protected layout — redirects to /login if not authenticated.
// Shows a loading spinner while the session restore is in flight.

import { Outlet, Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { Header } from './Header'
import Sidebar from './Sidebar'
import RightSidebar from './RightSidebar'

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
    <div className="h-screen flex flex-col bg-base-200">
      <Header />
      <div className="flex-1 overflow-hidden px-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 h-full">
          <div className="hidden lg:block lg:col-span-3 overflow-y-auto py-6"><Sidebar /></div>
          <main className="col-span-1 lg:col-span-6 lg:px-8 overflow-y-auto py-6"><Outlet /></main>
          <div className="hidden lg:block lg:col-span-3 overflow-y-auto py-6"><RightSidebar /></div>
        </div>
      </div>
    </div>
  )
}
