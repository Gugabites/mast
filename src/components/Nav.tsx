import { NavLink } from 'react-router-dom'
import { useAuth } from '../auth/AuthProvider'
import { ChartIcon, CheckIcon, JournalIcon, Logo, SunIcon, TargetIcon } from './icons'

const items = [
  { to: '/', label: 'Hoje', Icon: SunIcon },
  { to: '/objetivos', label: 'Objetivos', Icon: CheckIcon },
  { to: '/metas', label: 'Metas', Icon: TargetIcon },
  { to: '/journal', label: 'Journal', Icon: JournalIcon },
  { to: '/progresso', label: 'Progresso', Icon: ChartIcon },
]

export function Nav() {
  const { user, signOut } = useAuth()

  return (
    <nav className="nav" aria-label="Principal">
      <div className="nav-brand">
        <Logo size={28} />
        Mast
      </div>
      <ul className="nav-list">
        {items.map(({ to, label, Icon }) => (
          <li key={to}>
            {/* NavLink já aplica aria-current="page" no item ativo */}
            <NavLink to={to} end={to === '/'} className="nav-link">
              <Icon />
              {label}
            </NavLink>
          </li>
        ))}
      </ul>
      <div className="nav-footer">
        <p className="nav-email" title={user?.email}>
          {user?.email}
        </p>
        <button type="button" className="btn btn-ghost" onClick={signOut}>
          Sair
        </button>
      </div>
    </nav>
  )
}
