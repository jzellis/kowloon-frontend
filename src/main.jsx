import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './i18n.js'
import App from './App.jsx'
import PicsApp from './pics/PicsApp.jsx'

const isPics = window.location.hostname.startsWith('pics.')

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {isPics ? <PicsApp /> : <App />}
  </StrictMode>,
)
