import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Remove the pre-React paint placeholders once JS takes over: the branded
// spinner shell (all routes) and the static landing hero (home route).
const shell = document.getElementById('preload-shell')
if (shell) shell.remove()
const staticHero = document.getElementById('static-hero')
if (staticHero) staticHero.remove()

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

