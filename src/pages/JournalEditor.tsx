import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { ConfirmBlock } from '../components/ConfirmBlock'
import { ChevronLeftIcon, MoreIcon, TrashIcon } from '../components/icons'
import { Sheet } from '../components/Sheet'
import { useToast } from '../components/Toast'
import { useTracker } from '../data/TrackerProvider'
import { ApiError, isNetworkError, userMessage } from '../lib/api/errors'
import { createEntry, deleteEntry, getEntry, updateEntry } from '../lib/api/journal'
import { createAutosaver, type AutosaveStatus } from '../lib/autosaver'
import { formatShort, formatTime, isValidISODate, localDateOf } from '../lib/dates'
import { needsSave, wordCount, type JournalDraft } from '../lib/journal'
import { clearLocalDraft, readLocalDraft, writeLocalDraft } from '../lib/journalDraft'

const NEW = 'novo'

/**
 * /journal/novo e /journal/:id são a mesma rota. Quando uma entrada nova ganha
 * id, a URL é trocada levando `editorKey` no estado, para o editor continuar
 * sendo a mesma instância (sem perder foco nem texto).
 */
export function JournalEditor() {
  const { id = NEW } = useParams()
  const location = useLocation()
  const adopted = (location.state as { editorKey?: string } | null)?.editorKey
  const editorKey = adopted ?? (id === NEW ? `${NEW}:${location.key}` : id)

  return <Editor key={editorKey} editorKey={editorKey} routeId={id} />
}

type SaveState =
  | { kind: 'new' }
  | { kind: 'saving' }
  | { kind: 'saved'; at: Date }
  | { kind: 'error'; offline: boolean }

function Editor({ editorKey, routeId }: { editorKey: string; routeId: string }) {
  const navigate = useNavigate()
  const toast = useToast()
  const { today } = useTracker()
  const [params] = useSearchParams()
  const isNew = routeId === NEW

  // Tudo que vem da URL é lido uma vez: a URL muda depois do primeiro salvamento.
  const [initial] = useState(() => {
    const d = params.get('d')
    const recovered = isNew ? readLocalDraft(null)?.draft : undefined
    const blank: JournalDraft = {
      entry_date: d && isValidISODate(d) && d <= today ? d : today,
      title: params.get('q') ?? '',
      body: '',
    }
    return { reference: params.get('ref'), draft: recovered ?? blank, recovered: !!recovered }
  })

  const [phase, setPhase] = useState<'loading' | 'ready' | 'missing' | 'error'>(
    isNew ? 'ready' : 'loading',
  )
  const [loadError, setLoadError] = useState<string | null>(null)
  const [draft, setDraft] = useState<JournalDraft>(initial.draft)
  const [save, setSave] = useState<SaveState>({ kind: 'new' })
  const [hasEntry, setHasEntry] = useState(!isNew)
  const [menuOpen, setMenuOpen] = useState(false)
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  const entryId = useRef<string | null>(isNew ? null : routeId)
  const saved = useRef<JournalDraft | null>(null)
  const lastSave = useRef<SaveState>({ kind: 'new' })
  const latestDraft = useRef(draft)
  const mounted = useRef(true)
  const titleRef = useRef<HTMLTextAreaElement>(null)
  const bodyRef = useRef<HTMLTextAreaElement>(null)

  async function persist(next: JournalDraft) {
    if (entryId.current) {
      await updateEntry(entryId.current, next)
    } else {
      const created = await createEntry(next)
      entryId.current = created.id
      setHasEntry(true)
      // Se o usuário já saiu do editor, não o traz de volta.
      if (mounted.current) {
        navigate(`/journal/${created.id}`, { replace: true, state: { editorKey } })
      }
    }
    saved.current = next
    clearLocalDraft(null)
    clearLocalDraft(entryId.current)
  }

  function onStatus(status: AutosaveStatus, error?: unknown) {
    if (status === 'error') {
      writeLocalDraft(entryId.current, latestDraft.current)
      setSave({ kind: 'error', offline: isNetworkError(error) })
      return
    }
    const next: SaveState = status === 'saved' ? { kind: 'saved', at: new Date() } : { kind: 'saving' }
    if (status === 'saved') lastSave.current = next
    setSave(next)
  }

  // O autosaver vive enquanto o editor viver; as funções acima são recriadas a
  // cada render, então ele as alcança por esta referência sempre atualizada.
  const handlers = useRef({ persist, onStatus })
  useEffect(() => {
    handlers.current = { persist, onStatus }
  })
  const [saver] = useState(() =>
    createAutosaver<JournalDraft>({
      save: (next) => handlers.current.persist(next),
      shouldSave: (next) => needsSave(next, saved.current),
      onStatus: (status, error) => handlers.current.onStatus(status, error),
    }),
  )

  function update(patch: Partial<JournalDraft>) {
    const next = { ...draft, ...patch }
    latestDraft.current = next
    setDraft(next)
    saver.change(next)
    // "Salvando…" desde a primeira tecla; volta ao estado anterior se o texto
    // voltar a ser igual ao que está salvo.
    setSave(needsSave(next, saved.current) ? { kind: 'saving' } : lastSave.current)
  }

  // Abrir uma entrada existente.
  useEffect(() => {
    if (isNew) return
    let cancelled = false
    getEntry(routeId).then(
      (entry) => {
        if (cancelled) return
        if (!entry) {
          setPhase('missing')
          return
        }
        const fromDb: JournalDraft = {
          entry_date: entry.entry_date,
          title: entry.title ?? '',
          body: entry.body,
        }
        saved.current = fromDb
        lastSave.current = { kind: 'saved', at: new Date(entry.updated_at) }
        setSave(lastSave.current)

        // Um rascunho local mais novo que o banco é texto que não chegou a ser salvo.
        const local = readLocalDraft(entry.id)
        const useLocal =
          !!local &&
          Date.parse(local.at) > Date.parse(entry.updated_at) &&
          needsSave(local.draft, fromDb)
        const opened = useLocal ? local.draft : fromDb
        if (!useLocal) clearLocalDraft(entry.id)

        latestDraft.current = opened
        setDraft(opened)
        setPhase('ready')
        if (useLocal) {
          toast.show('Recuperamos um rascunho não salvo.')
          setSave({ kind: 'saving' })
          saver.change(opened)
        }
      },
      (e: unknown) => {
        if (cancelled) return
        // 22P02: o id da URL nem é um uuid válido.
        if (e instanceof ApiError && e.code === '22P02') {
          setPhase('missing')
        } else {
          setLoadError(userMessage(e))
          setPhase('error')
        }
      },
    )
    return () => {
      cancelled = true
    }
    // Só na montagem: o editor é recriado (key) quando a entrada muda.
    // oxlint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Entrada nova: foco no corpo e, se havia rascunho local, retoma o salvamento.
  useEffect(() => {
    if (!isNew) return
    bodyRef.current?.focus()
    if (initial.recovered) {
      toast.show('Recuperamos um rascunho não salvo.')
      saver.change(initial.draft)
    }
    // oxlint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Salva na hora ao sair da página ou quando o app vai para segundo plano.
  useEffect(() => {
    mounted.current = true

    // No iPhone a requisição pode ser cortada ao sair do app: o rascunho local
    // é gravado antes, de forma síncrona, e apagado quando o banco confirmar.
    const backupAndFlush = () => {
      if (needsSave(latestDraft.current, saved.current)) {
        writeLocalDraft(entryId.current, latestDraft.current)
      }
      void saver.flush()
    }
    const onVisibility = () => {
      if (document.visibilityState === 'hidden') backupAndFlush()
      else void saver.flush() // de volta: tenta de novo o que tiver falhado
    }
    const onBeforeUpdate = () => void saver.flush()
    const onScroll = () => setScrolled(window.scrollY > 8)

    document.addEventListener('visibilitychange', onVisibility)
    window.addEventListener('pagehide', backupAndFlush)
    window.addEventListener('mast:before-update', onBeforeUpdate)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      mounted.current = false
      document.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener('pagehide', backupAndFlush)
      window.removeEventListener('mast:before-update', onBeforeUpdate)
      window.removeEventListener('scroll', onScroll)
      void saver.flush()
    }
  }, [saver])

  // Título e corpo crescem com o conteúdo.
  useLayoutEffect(() => {
    const resize = () => {
      for (const el of [titleRef.current, bodyRef.current]) {
        if (!el) continue
        el.style.height = 'auto'
        el.style.height = `${el.scrollHeight}px`
      }
    }
    resize()
    window.addEventListener('resize', resize)
    return () => window.removeEventListener('resize', resize)
  }, [draft.title, draft.body, phase])

  async function goBack() {
    await saver.flush()
    navigate('/journal')
  }

  async function remove() {
    if (!entryId.current) return
    setDeleting(true)
    saver.cancel()
    try {
      await deleteEntry(entryId.current)
      clearLocalDraft(entryId.current)
      // Nada mais a salvar: impede que a saída do editor recrie a entrada.
      saved.current = latestDraft.current
      toast.show('Entrada excluída.')
      navigate('/journal')
    } catch (e) {
      setDeleting(false)
      toast.show(userMessage(e), 'error')
    }
  }

  if (phase === 'loading') {
    return (
      <div className="editor" role="status" aria-label="Carregando">
        <div className="skeleton skeleton-tall" />
      </div>
    )
  }

  if (phase === 'missing' || phase === 'error') {
    return (
      <section className="card empty-state" role="alert">
        <p>{phase === 'missing' ? 'Esta entrada não existe mais.' : loadError}</p>
        <Link to="/journal" className="btn btn-primary">
          Voltar ao journal
        </Link>
      </section>
    )
  }

  const emptyExisting = hasEntry && draft.body.trim() === ''
  const statusText = emptyExisting
    ? 'Escreva algo ou exclua a entrada'
    : save.kind === 'new'
      ? 'Nova entrada'
      : save.kind === 'saving'
        ? 'Salvando…'
        : save.kind === 'saved'
          ? localDateOf(save.at.toISOString()) === today
            ? `Salvo às ${formatTime(save.at)}`
            : `Salvo em ${formatShort(localDateOf(save.at.toISOString()))}`
          : `${save.offline ? 'Sem conexão' : 'Não foi possível salvar'} · rascunho guardado neste aparelho`
  const words = wordCount(draft.body)

  return (
    <div className="editor">
      <div className={scrolled ? 'editor-bar editor-bar-scrolled' : 'editor-bar'}>
        <button type="button" className="btn btn-text editor-back" onClick={goBack}>
          <ChevronLeftIcon />
          Journal
        </button>
        <p
          className={save.kind === 'error' && !emptyExisting ? 'editor-status text-negative' : 'editor-status'}
          aria-live="polite"
        >
          {statusText}
        </p>
        {hasEntry && (
          <button
            type="button"
            className="icon-btn icon-btn-plain"
            aria-label="Opções da entrada"
            onClick={() => {
              setConfirmingDelete(false)
              setMenuOpen(true)
            }}
          >
            <MoreIcon />
          </button>
        )}
      </div>

      <input
        type="date"
        className="editor-date"
        aria-label="Data da entrada"
        max={today}
        value={draft.entry_date}
        onChange={(e) => {
          const value = e.target.value
          if (isValidISODate(value) && value <= today) update({ entry_date: value })
        }}
      />

      {initial.reference && <p className="editor-context">A partir de {initial.reference}</p>}

      <textarea
        ref={titleRef}
        className="editor-title"
        aria-label="Título"
        rows={1}
        maxLength={120}
        placeholder="Título (opcional)"
        autoCapitalize="sentences"
        value={draft.title}
        onChange={(e) => update({ title: e.target.value.replace(/\n/g, ' ') })}
        onKeyDown={(e) => {
          // O título é uma linha só (que pode quebrar na tela): Enter vai para o texto.
          if (e.key === 'Enter') {
            e.preventDefault()
            bodyRef.current?.focus()
          }
        }}
      />

      <textarea
        ref={bodyRef}
        className="editor-body"
        aria-label="Texto da entrada"
        placeholder="O que está na sua cabeça hoje?"
        autoCapitalize="sentences"
        value={draft.body}
        onChange={(e) => update({ body: e.target.value })}
      />

      <p className="editor-count">
        {words} {words === 1 ? 'palavra' : 'palavras'}
      </p>

      <Sheet open={menuOpen} onClose={() => setMenuOpen(false)} title="Opções da entrada">
        <div className="sheet-body">
          {confirmingDelete ? (
            <ConfirmBlock
              message="Excluir esta entrada? Isso não pode ser desfeito."
              confirmLabel="Excluir"
              busy={deleting}
              onCancel={() => setConfirmingDelete(false)}
              onConfirm={remove}
            />
          ) : (
            <button
              type="button"
              className="btn btn-ghost text-negative"
              onClick={() => setConfirmingDelete(true)}
            >
              <TrashIcon size={18} />
              Excluir entrada
            </button>
          )}
        </div>
      </Sheet>
    </div>
  )
}
