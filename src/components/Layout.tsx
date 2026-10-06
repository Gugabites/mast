import { Outlet } from 'react-router-dom'
import { TrackerProvider } from '../data/TrackerProvider'
import { VersesProvider } from '../data/VersesProvider'
import { Nav } from './Nav'
import { ToastProvider } from './Toast'

// Só é montado com usuário logado (fica dentro de RequireAuth),
// então os dados do TrackerProvider são sempre os da sessão atual.
export function Layout() {
  return (
    <ToastProvider>
      <TrackerProvider>
        <VersesProvider>
          <Nav />
          <main className="content">
            <Outlet />
          </main>
        </VersesProvider>
      </TrackerProvider>
    </ToastProvider>
  )
}
