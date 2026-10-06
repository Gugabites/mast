import { Link } from 'react-router-dom'
import { PlusIcon } from '../components/icons'
import { PageHeader } from '../components/PageHeader'
import { useJournal } from '../data/useJournal'
import { weekday } from '../lib/dates'
import { WEEKDAY_SHORT } from '../lib/format'
import { displayTitle, groupByMonth, preview } from '../lib/journal'

export function JournalList() {
  const journal = useJournal()

  return (
    <>
      <PageHeader
        eyebrow="Reflexão"
        title="Journal"
        subtitle="Escreva para clarear as ideias."
        action={
          <Link to="/journal/novo" className="btn btn-primary">
            <PlusIcon size={18} />
            Escrever
          </Link>
        }
      />

      {journal.status === 'loading' ? (
        <div className="stack" role="status" aria-label="Carregando">
          <div className="skeleton skeleton-short" />
          <div className="skeleton skeleton-short" />
        </div>
      ) : journal.status === 'error' ? (
        <section className="card empty-state" role="alert">
          <p>{journal.error}</p>
          <button type="button" className="btn btn-primary" onClick={journal.reload}>
            Tentar novamente
          </button>
        </section>
      ) : journal.entries.length === 0 ? (
        <section className="card empty-state">
          <h2>Uma página em branco</h2>
          <p>Escreva o que está na sua cabeça. Ninguém mais lê.</p>
          <Link to="/journal/novo" className="btn btn-primary">
            Escrever a primeira entrada
          </Link>
        </section>
      ) : (
        <div className="stack">
          {groupByMonth(journal.entries).map((group) => (
            <section key={group.key} className="card">
              <h2 className="section-title">
                {group.label}
                <span className="mono">{group.entries.length}</span>
              </h2>
              <ul className="plain-list">
                {group.entries.map((entry) => (
                  <li key={entry.id}>
                    <Link to={`/journal/${entry.id}`} className="journal-row">
                      <span className="journal-day">
                        <span className="mono journal-day-num">
                          {Number(entry.entry_date.slice(8))}
                        </span>
                        <span className="journal-day-week">
                          {WEEKDAY_SHORT[weekday(entry.entry_date)]}
                        </span>
                      </span>
                      <span className="journal-text">
                        <span className="journal-title">{displayTitle(entry)}</span>
                        <span className="journal-preview">{preview(entry)}</span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </>
  )
}
