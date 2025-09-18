import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Polyfills for Solana/Anchor
import { Buffer } from 'buffer'
import BN from 'bn.js'

globalThis.Buffer = Buffer
globalThis.global = globalThis
globalThis.BN = BN
globalThis.process = globalThis.process || { 
  env: {}, 
  version: 'v18.0.0',
  nextTick: (cb) => setTimeout(cb, 0)
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
