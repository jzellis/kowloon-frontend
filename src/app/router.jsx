import { createBrowserRouter } from 'react-router-dom'
import Layout from '../components/layout/Layout'
import PublicLayout from '../components/layout/PublicLayout'
import LoginPage from '../features/auth/LoginPage'
import RegisterPage from '../features/auth/RegisterPage'

// Public pages (accessible with or without auth)
import HomePage from '../pages/HomePage'
import PostsPage from '../pages/PostsPage'
import PostPage from '../pages/PostPage'
import UsersPage from '../pages/UsersPage'
import UserPage from '../pages/UserPage'
import UserPostsPage from '../pages/UserPostsPage'
import UserCirclesPage from '../pages/UserCirclesPage'
import GroupsPage from '../pages/GroupsPage'
import GroupPage from '../pages/GroupPage'
import GroupPostsPage from '../pages/GroupPostsPage'
import CirclesPage from '../pages/CirclesPage'
import CirclePage from '../pages/CirclePage'
import CirclePostsPage from '../pages/CirclePostsPage'
import PagesListPage from '../pages/PagesListPage'
import PageDetailPage from '../pages/PageDetailPage'
import SearchPage from '../pages/SearchPage'

// Protected pages (auth required — Layout redirects to /login)
import NewPostPage from '../pages/NewPostPage'
import EditPostPage from '../pages/EditPostPage'
import NewGroupPage from '../pages/NewGroupPage'
import EditGroupPage from '../pages/EditGroupPage'
import NewCirclePage from '../pages/NewCirclePage'
import EditCirclePage from '../pages/EditCirclePage'
import NotificationsPage from '../pages/NotificationsPage'
import ProfilePage from '../pages/ProfilePage'

const router = createBrowserRouter([
  // Auth pages — standalone, no layout
  { path: '/login', element: <LoginPage /> },
  { path: '/register', element: <RegisterPage /> },

  // Public routes — visible to all, content varies by auth state
  {
    element: <PublicLayout />,
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/posts', element: <PostsPage /> },
      { path: '/posts/:id', element: <PostPage /> },
      { path: '/users', element: <UsersPage /> },
      { path: '/users/:id', element: <UserPage /> },
      { path: '/users/:id/posts', element: <UserPostsPage /> },
      { path: '/users/:id/circles', element: <UserCirclesPage /> },
      { path: '/groups', element: <GroupsPage /> },
      { path: '/groups/:id', element: <GroupPage /> },
      { path: '/groups/:id/posts', element: <GroupPostsPage /> },
      { path: '/circles', element: <CirclesPage /> },
      { path: '/circles/:id', element: <CirclePage /> },
      { path: '/circles/:id/posts', element: <CirclePostsPage /> },
      { path: '/pages', element: <PagesListPage /> },
      { path: '/pages/:id', element: <PageDetailPage /> },
      { path: '/search', element: <SearchPage /> },
    ],
  },

  // Protected routes — Layout redirects to /login if unauthenticated
  {
    element: <Layout />,
    children: [
      { path: '/posts/new', element: <NewPostPage /> },
      { path: '/posts/:id/edit', element: <EditPostPage /> },
      { path: '/groups/new', element: <NewGroupPage /> },
      { path: '/groups/:id/edit', element: <EditGroupPage /> },
      { path: '/circles/new', element: <NewCirclePage /> },
      { path: '/circles/:id/edit', element: <EditCirclePage /> },
      { path: '/notifications', element: <NotificationsPage /> },
      { path: '/profile', element: <ProfilePage /> },
    ],
  },
])

export default router
