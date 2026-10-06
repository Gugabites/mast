import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './auth/AuthProvider'
import { RequireAuth } from './auth/RequireAuth'
import { Layout } from './components/Layout'
import { Goals } from './pages/Goals'
import { Journal } from './pages/Journal'
import { Login } from './pages/Login'
import { Objectives } from './pages/Objectives'
import { Progress } from './pages/Progress'
import { Today } from './pages/Today'

export default function App() {
  return (
    <AuthProvider>
      <HashRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<RequireAuth />}>
            <Route element={<Layout />}>
              <Route index element={<Today />} />
              <Route path="/objetivos" element={<Objectives />} />
              <Route path="/metas" element={<Goals />} />
              <Route path="/journal" element={<Journal />} />
              <Route path="/progresso" element={<Progress />} />
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </HashRouter>
    </AuthProvider>
  )
}
