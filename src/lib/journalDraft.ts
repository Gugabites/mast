import type { JournalDraft } from './journal'

// Rascunho de segurança no aparelho, para quando o salvamento no banco falha
// ou o app vai para segundo plano antes de salvar. `null` = entrada ainda sem id.
const key = (entryId: string | null) => `mast:journal-draft:${entryId ?? 'new'}`

export interface LocalDraft {
  draft: JournalDraft
  /** Quando foi guardado (ISO). */
  at: string
}

export function readLocalDraft(entryId: string | null): LocalDraft | null {
  try {
    const parsed = JSON.parse(localStorage.getItem(key(entryId)) ?? 'null') as LocalDraft | null
    return parsed && typeof parsed.draft?.body === 'string' ? parsed : null
  } catch {
    return null
  }
}

export function writeLocalDraft(entryId: string | null, draft: JournalDraft) {
  try {
    const value: LocalDraft = { draft, at: new Date().toISOString() }
    localStorage.setItem(key(entryId), JSON.stringify(value))
  } catch {
    // Sem armazenamento local: não há o que fazer aqui.
  }
}

export function clearLocalDraft(entryId: string | null) {
  try {
    localStorage.removeItem(key(entryId))
  } catch {
    // idem
  }
}
