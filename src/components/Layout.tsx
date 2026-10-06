import { Outlet } from 'react-router-dom'
import { TrackerProvider } from '../data/TrackerProvider'
import { Nav } from './Nav'
import { ToastProvider } from './Toast'

// Só é montado com usuário logado (fica dentro de RequireAuth),
// então os dados do TrackerProvider são sempre os da sessão atual.
export function Layout() {
  return (
    <ToastProvider>
      <TrackerProvider>
        <Nav />
        <main className="content">
          <Outlet />
        </main>
      </TrackerProvider>
    </ToastProvider>
  )
}
