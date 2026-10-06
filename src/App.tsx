import { lazy, Suspense } from 'react'
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './auth/AuthProvider'
import { RequireAuth } from './auth/RequireAuth'
import { Layout } from './components/Layout'
import { PageHeader } from './components/PageHeader'
import { UpdatePrompt } from './components/UpdatePrompt'
import { Goals } from './pages/Goals'
import { JournalEditor } from './pages/JournalEditor'
import { JournalList } from './pages/JournalList'
import { Login } from './pages/Login'
import { Objectives } from './pages/Objectives'
import { Today } from './pages/Today'

// O gráfico (Recharts) pesa: só é baixado quando a tela Progresso é aberta.
const Progress = lazy(() => import('./pages/Progress').then((m) => ({ default: m.Progress })))

const progressFallback = (
  <>
    <PageHeader eyebrow="Evolução" title="Progresso" subtitle="Constância vence intensidade." />
    <div className="skeleton skeleton-tall" role="status" aria-label="Carregando" />
  </>
)

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
              <Route
                path="/progresso"
                element={
                  <Suspense fallback={progressFallback}>
                    <Progress />
                  </Suspense>
                }
              />
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </HashRouter>
      {/* Fora das rotas: o aviso de versão nova vale também na tela de login. */}
      <UpdatePrompt />
    </AuthProvider>
  )
}
