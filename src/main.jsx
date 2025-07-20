import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter as Router } from 'react-router-dom';
import App from './App.jsx'
import '../css/index.css'
import { initializeMobileOptimizations } from './utils/mobileUtils.js'

// Initialize mobile optimizations
initializeMobileOptimizations();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Router>
      <App />
    </Router>
  </StrictMode>,
)
