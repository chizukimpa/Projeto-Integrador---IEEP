import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx' // Agora chamamos o App (que vai ter as rotas)
import './index.css'
import '@fortawesome/fontawesome-free/css/all.min.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)