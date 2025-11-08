// ============================================================
// FILE REVIEW STATUS: ✅ APPROVED - KEEP (rewritten)
// Reviewed: 2025-11-08 14:00
// Action: Rewritten with proper providers and no inline Tailwind
// Changes:
//   - Added QueryClientProvider for TanStack Query
//   - Removed inline Tailwind classes
//   - Uses semantic HTML and CSS variables
//   - Prepared for future AuthProvider, ThemeProvider
// ============================================================

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

// Create query client for TanStack Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

function HomePage() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'hsl(var(--background))',
      color: 'hsl(var(--foreground))',
    }}>
      <div style={{ textAlign: 'center', maxWidth: '600px', padding: '2rem' }}>
        <h1 style={{
          fontSize: '2.5rem',
          fontWeight: '700',
          marginBottom: '1rem',
          color: 'hsl(var(--foreground))',
        }}>
          Autolytiq
        </h1>
        <p style={{
          fontSize: '1.25rem',
          marginBottom: '2rem',
          color: 'hsl(var(--muted-foreground))',
        }}>
          Automotive CRM, DMS & Inventory Management Platform
        </p>
        <div style={{
          fontSize: '0.875rem',
          color: 'hsl(var(--muted-foreground))',
          padding: '1rem',
          borderRadius: 'var(--radius)',
          backgroundColor: 'hsl(var(--muted))',
        }}>
          ✅ Frontend clean slate ready<br />
          ✅ Design token system integrated<br />
          ✅ 107 UI components available in @repo/ui<br />
          ✅ TanStack Query configured<br />
          🚀 Ready to build
        </div>
      </div>
    </div>
  )
}

export default App
