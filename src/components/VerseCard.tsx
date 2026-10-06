import { useId, useState } from 'react'
import { Link } from 'react-router-dom'
import type { Verse } from '../lib/types'
import { ChevronDownIcon, ChevronUpIcon, JournalIcon } from './icons'

interface VerseCardProps {
  verse: Verse
  /** Dia exibido. Use também como `key`, para o estado recolhido ser relido a cada dia. */
  date: string
}

/** Versículo do dia. Recolhido ou expandido é lembrado por dia, neste aparelho. */
export function VerseCard({ verse, date }: VerseCardProps) {
  const contentId = useId()
  const storageKey = `mast:verse-collapsed:${date}`
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem(storageKey) === '1'
    } catch {
      return false
    }
  })

  function toggle() {
    const next = !collapsed
    setCollapsed(next)
    try {
      if (next) localStorage.setItem(storageKey, '1')
      else localStorage.removeItem(storageKey)
    } catch {
      // Sem armazenamento local: vale só para esta visita.
    }
  }

  if (collapsed) {
    return (
      <section className="verse-card verse-card-collapsed">
        <button
          type="button"
          className="verse-collapsed"
          aria-expanded="false"
          aria-label={`Expandir versículo: ${verse.reference}`}
          onClick={toggle}
        >
          <span>
            <span className="verse-eyebrow">Versículo do dia</span>
            <span className="verse-collapsed-ref">{verse.reference}</span>
          </span>
          <ChevronDownIcon />
        </button>
      </section>
    )
  }

  const answerLink =
    `/journal/novo?q=${encodeURIComponent(verse.question)}` +
    `&ref=${encodeURIComponent(verse.reference)}&d=${date}`

  return (
    <section className="verse-card">
      <div className="verse-head">
        <p className="verse-eyebrow">
          Versículo do dia{verse.theme ? ` · ${verse.theme}` : ''}
        </p>
        <button
          type="button"
          className="icon-btn icon-btn-plain"
          aria-expanded="true"
          aria-controls={contentId}
          aria-label="Recolher versículo"
          onClick={toggle}
        >
          <ChevronUpIcon />
        </button>
      </div>

      <div id={contentId}>
        <blockquote className="verse-text">“{verse.text}”</blockquote>
        <p className="verse-ref">— {verse.reference}</p>
        <hr className="verse-rule" />
        <p className="verse-reflection">{verse.reflection}</p>

        <div className="verse-question">
          <p className="verse-question-label">Para levar hoje</p>
          <p className="verse-question-text">{verse.question}</p>
          <Link to={answerLink} className="btn btn-ghost verse-answer">
            <JournalIcon size={16} />
            Responder no journal
          </Link>
        </div>
      </div>
    </section>
  )
}
