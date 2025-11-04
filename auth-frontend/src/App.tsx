import type { JSX } from "react"
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthPage } from './pages/AuthPage'

/**
 * Componente principal de la aplicación
 */
function App(): JSX.Element {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="*" element={<AuthPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
