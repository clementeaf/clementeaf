import type { JSX } from "react"
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthPage } from './pages/AuthPage'

/**
 * Componente principal de la aplicación
 */
function App(): JSX.Element {
  return (
    <BrowserRouter>
      <div className='flex flex-col items-center justify-center h-screen w-screen bg-blue-50/70'>
        <Routes>
          <Route path="*" element={<AuthPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App
