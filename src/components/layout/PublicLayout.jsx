// Public layout — accessible to all users, with or without auth.
// Shows the header (which adapts based on auth state).

import { Outlet } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { Header } from './Header'
import Sidebar from './Sidebar'
import RightSidebar from './RightSidebar'

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
      <div className="w-full px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-3"><Sidebar /></div>
          <main className="lg:col-span-6"><Outlet /></main>
          <div className="lg:col-span-3"><RightSidebar /></div>
        </div>
      </div>
    </div>
  )
}
