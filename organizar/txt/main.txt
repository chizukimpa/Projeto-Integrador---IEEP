// src/main.jsx
// Ponto de entrada principal do React (Gerado pelo Vite)
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx' 
import './index.css'
import '@fortawesome/fontawesome-free/css/all.min.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  // StrictMode ajuda a achar bugs na fase de desenvolvimento (ele renderiza 2x de propósito, eu pesquisei)
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)