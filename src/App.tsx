import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './auth/AuthProvider'
import { RequireAuth } from './auth/RequireAuth'
import { Layout } from './components/Layout'
import { Goals } from './pages/Goals'
import { JournalEditor } from './pages/JournalEditor'
import { JournalList } from './pages/JournalList'
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
              <Route path="/journal" element={<JournalList />} />
              {/* Uma rota só para /journal/novo e /journal/:id: ver JournalEditor. */}
              <Route path="/journal/:id" element={<JournalEditor />} />
              <Route path="/progresso" element={<Progress />} />
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </HashRouter>
    </AuthProvider>
  )
}
