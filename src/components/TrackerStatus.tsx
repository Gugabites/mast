import { useTracker } from '../data/TrackerProvider'

/** O que Hoje e Objetivos mostram enquanto os dados não estão prontos. */
export function TrackerStatus() {
  const { status, error, reload } = useTracker()

  if (status === 'error') {
    return (
      <section className="card empty-state" role="alert">
        <p>{error}</p>
        <button type="button" className="btn btn-primary" onClick={reload}>
          Tentar novamente
        </button>
      </section>
    )
  }

  return (
    <div className="stack" role="status" aria-label="Carregando">
      <div className="skeleton skeleton-short" />
      <div className="skeleton skeleton-tall" />
    </div>
  )
}
