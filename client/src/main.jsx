import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom'


import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
