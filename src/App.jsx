import { Provider } from 'react-redux'
import { RouterProvider } from 'react-router-dom'
import { store } from './app/store'
import router from './app/router'
import DevAuthToggle from './components/ui/DevAuthToggle'

export default function App() {
  return (
    <Provider store={store}>
      <RouterProvider router={router} />
      <DevAuthToggle />
    </Provider>
  )
}
