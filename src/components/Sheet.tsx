import { useEffect, useId, useRef, type ReactNode } from 'react'
import { CloseIcon } from './icons'

interface SheetProps {
  open: boolean
  onClose: () => void
  title: string
  /** Normalmente um <form className="sheet-form"> com .sheet-body e .sheet-footer. */
  children: ReactNode
}

/**
 * Padrão único de formulário: painel na base da tela no celular e
 * diálogo centralizado no desktop, sobre o <dialog> nativo.
 * O conteúdo só existe enquanto está aberto, então cada abertura começa limpa.
 */
export function Sheet({ open, onClose, title, children }: SheetProps) {
  const ref = useRef<HTMLDialogElement>(null)
  const pressedBackdrop = useRef(false)
  const titleId = useId()

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) {
      dialog.showModal()
      dialog.querySelector<HTMLElement>('[data-autofocus]')?.focus()
    } else if (!open && dialog.open) {
      dialog.close()
    }
  }, [open])

  return (
    <dialog
      ref={ref}
      className="sheet"
      aria-labelledby={titleId}
      onClose={onClose}
      // Um clique no fundo tem o próprio <dialog> como alvo. Exigir que o
      // clique também tenha começado ali evita fechar ao arrastar uma seleção.
      onMouseDown={(e) => {
        pressedBackdrop.current = e.target === e.currentTarget
      }}
      onClick={(e) => {
        if (pressedBackdrop.current && e.target === e.currentTarget) onClose()
      }}
    >
      {open && (
        <div className="sheet-panel">
          <div className="sheet-handle" aria-hidden="true" />
          <header className="sheet-header">
            <h2 id={titleId}>{title}</h2>
            <button
              type="button"
              className="icon-btn icon-btn-plain"
              aria-label="Fechar"
              onClick={onClose}
            >
              <CloseIcon />
            </button>
          </header>
          {children}
        </div>
      )}
    </dialog>
  )
}
