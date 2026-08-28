import { createBrowserRouter } from 'react-router-dom'
import PicsLayout from './PicsLayout'
import PicsGridPage from './PicsGridPage'
import LoginPage from '../features/auth/LoginPage'
import ExternalRedirect from './ExternalRedirect'

const picsRouter = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  {
    element: <PicsLayout />,
    children: [{ path: '/', element: <PicsGridPage /> }],
  },
  // Any other path (reused components' <Link>s to /circles, /users/:id,
  // /notifications, /posts/:id/edit, ...) bounces to the main domain.
  { path: '*', element: <ExternalRedirect /> },
])

export default picsRouter
