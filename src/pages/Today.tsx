import { useAuth } from '../auth/AuthProvider'
import { PageHeader } from '../components/PageHeader'
import { formatLong, greeting, todayISO } from '../lib/dates'

export function Today() {
  const { signOut } = useAuth()
  const date = formatLong(todayISO())

  return (
    <>
      <PageHeader
        eyebrow={date.charAt(0).toUpperCase() + date.slice(1)}
        title={`${greeting()}, Guga.`}
        subtitle="Sua base está pronta. As funcionalidades chegam na quinta."
        action={
          <button type="button" className="btn btn-text only-mobile" onClick={signOut}>
            Sair
          </button>
        }
      />
      <section className="card card-ink">
        <p className="score-label">Pontuação do dia</p>
        <p className="mono score-value">—</p>
      </section>
    </>
  )
}
