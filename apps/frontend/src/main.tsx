// ============================================================
// FILE REVIEW STATUS: ✅ APPROVED - KEEP (optimal)
// Reviewed: 2025-11-08 14:00
// Action: Keep as-is - Perfect React 18 bootstrap
// No changes needed - This is the standard pattern
// ============================================================

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
)
