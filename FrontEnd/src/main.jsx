import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './app.css'
import App from './App.jsx'
import Store from './redux/store.js'  
import { Provider } from 'react-redux'


createRoot(document.getElementById('root')).render(
  // <StrictMode>
  <Provider store={Store}>
    <App />
  </Provider>
  // </StrictMode>,
)
