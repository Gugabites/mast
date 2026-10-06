interface ConfirmBlockProps {
  message: string
  confirmLabel: string
  onConfirm: () => void
  onCancel: () => void
  busy?: boolean
}

/** Confirmação de ação destrutiva dentro do próprio Sheet (não abre outro diálogo). */
export function ConfirmBlock({ message, confirmLabel, onConfirm, onCancel, busy }: ConfirmBlockProps) {
  return (
    <div className="confirm-block" role="alert">
      <p>{message}</p>
      <div className="confirm-actions">
        <button type="button" className="btn btn-ghost" onClick={onCancel} disabled={busy}>
          Cancelar
        </button>
        <button type="button" className="btn btn-danger" onClick={onConfirm} disabled={busy}>
          {confirmLabel}
        </button>
      </div>
    </div>
  )
}
