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
    <div className="h-screen flex flex-col bg-base-200">
      <Header />
      <div className="flex-1 overflow-hidden px-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 h-full">
          <div className="lg:col-span-3 overflow-y-auto py-6"><Sidebar /></div>
          <main className="lg:col-span-6 lg:px-20 overflow-y-auto py-6"><Outlet /></main>
          <div className="lg:col-span-3 overflow-y-auto py-6"><RightSidebar /></div>
        </div>
      </div>
    </div>
  )
}
