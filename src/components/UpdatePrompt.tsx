import { useState } from 'react'
import { useRegisterSW } from 'virtual:pwa-register/react'

const HOUR_MS = 60 * 60 * 1000
/** Tempo para o journal terminar de salvar antes de recarregar. */
const SAVE_GRACE_MS = 1500

/**
 * Registra o service worker e avisa quando há versão nova. Nada recarrega
 * sozinho: a troca só acontece quando o usuário toca em "Atualizar".
 */
export function UpdatePrompt() {
  const [updating, setUpdating] = useState(false)
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(_url, registration) {
      if (!registration) return
      // Procura versão nova ao voltar para o app e a cada hora.
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') void registration.update()
      })
      setInterval(() => void registration.update(), HOUR_MS)
    },
  })

  if (!needRefresh) return null

  async function update() {
    setUpdating(true)
    // O editor do journal escuta este evento e salva o que estiver pendente.
    window.dispatchEvent(new Event('mast:before-update'))
    await new Promise((resolve) => setTimeout(resolve, SAVE_GRACE_MS))
    await updateServiceWorker(true)
  }

  return (
    <div className="update-prompt" role="status">
      <span>Nova versão do Mast disponível.</span>
      <div className="update-actions">
        <button
          type="button"
          className="btn btn-text"
          disabled={updating}
          onClick={() => setNeedRefresh(false)}
        >
          Depois
        </button>
        <button type="button" className="btn update-now" disabled={updating} onClick={update}>
          {updating ? 'Atualizando…' : 'Atualizar'}
        </button>
      </div>
    </div>
  )
}
