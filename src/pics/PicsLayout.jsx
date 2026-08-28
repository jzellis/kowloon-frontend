// PicsLayout — pics.<domain>'s app shell. Same Header as the main site (it's
// fully self-contained, no Sidebar dependency for its own primary layout —
// only its mobile hamburger drawer pulls in the full main-site Sidebar,
// accepted as-is for this pass, see plan notes). No always-visible
// Sidebar/RightSidebar column: just the header and the grid.

import { Outlet } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { Header } from '../components/layout/Header'
import AppErrorBoundary from '../components/ui/AppErrorBoundary'

export default function PicsLayout() {
  const { sessionChecked } = useSelector((state) => state.auth)

  if (!sessionChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-100">
        <span className="loading loading-spinner loading-lg" />
      </div>
    )
  }

  return (
    <div className="min-h-[100svh] flex flex-col bg-base-100">
      <Header />
      <main className="flex-1">
        <AppErrorBoundary>
          <Outlet />
        </AppErrorBoundary>
      </main>
    </div>
  )
}
