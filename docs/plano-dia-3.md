# Mast — Plano do Dia 3: Completar e colocar em uso

> **Para o Claude Code:** leia o `CLAUDE.md`, o `docs/resumo-dia-2.md` e este plano antes de começar. Hoje a versão 1 fica completa: versículo do dia, journal, tela Progresso, app instalável (PWA) e alguns ajustes do núcleo. Execute as etapas na ordem. Etapas **[GUGA]** são manuais; etapas **[CLAUDE CODE]** são suas.
>
> Arquivo de apoio entregue junto com este plano: `supabase/migrations/0003_verses_seed.sql` (30 versículos, já escrito; não altere o conteúdo).

---

## Regras de interação com o Guga (valem para a sessão inteira)

As mesmas que funcionaram nos Dias 1 e 2:

1. **Um passo manual por vez.** Explique um único passo, espere o "feito" e só então passe ao próximo.
2. **Faça por ele o que puder:** `pbcopy < arquivo.sql` para copiar SQL e `open <url>` para abrir páginas.
3. **Confira você mesmo** pelo terminal, pela API pública do GitHub ou pela API do Supabase sempre que der.
4. **Publicação:** você faz o commit local; o Guga clica em **"Push origin" no GitHub Desktop**. Depois, acompanhe o deploy e avise quando estiver no ar.
5. **Antes de cada push, confira as telas novas na prévia local** (`http://localhost:5173/mast/dev/preview.html`). O Guga só testa no celular o que já passou pela prévia.
6. **Telas logadas no celular** só o Guga testa. Peça foto nas verificações marcadas com → foto.
7. Links: SQL Editor `https://supabase.com/dashboard/project/gbxbamgyttpidqvdtffo/sql/new` · Site `https://gugabites.github.io/mast/` · Local `http://localhost:5173/mast/`

---

## Objetivo do dia

Ao fim da sessão, o Mast está **instalado na tela inicial do iPhone do Guga** e ele consegue:

- ler o versículo do dia na tela Hoje e responder à pergunta do dia no journal;
- escrever, reler, editar e apagar entradas livres no journal, sem perder texto;
- ver o gráfico do saldo diário (7, 30 e 90 dias) e os indicadores do período;
- receber novas versões do app sem ficar preso numa versão antiga;
- usar o app com a rotina real dele, sem dados de teste.

## Critério de pronto

- [ ] Tabela `verses` com 30 linhas.
- [ ] `npm run lint`, `npm test` e `npm run build` sem erros, com testes novos de versículo, progresso e journal.
- [ ] Hoje (com versículo), Journal e Progresso funcionando no site publicado, confirmados com fotos do celular.
- [ ] Ajustes do núcleo aplicados (etapa 2).
- [ ] Página de diagnóstico removida.
- [ ] PWA instalado no iPhone, abrindo em tela cheia com ícone próprio, e atualização testada.
- [ ] Dados de teste limpos e rotina real cadastrada pelo Guga.
- [ ] `CLAUDE.md` atualizado (v1 concluída, backlog revisado) e resumo entregue.

## Fora do escopo hoje

Revisão semanal, busca no journal, reordenar objetivos, notificações, modo escuro, versículos 31–365, exportação de dados. Não antecipe.

---

## Decisões fechadas para hoje

| Tema | Decisão |
|---|---|
| Versículos | Carregados **todos de uma vez** (são poucos) ao abrir o app e guardados em memória e no `localStorage` como cache. Posição do dia = `((dayOfYear(d) − 1) mod N) + 1`, com N = quantidade de versículos. |
| Versículo em dias anteriores | Ao navegar para um dia passado, mostra o versículo daquele dia. |
| Journal: editor | **Página própria** (`/journal/novo` e `/journal/:id`), não Sheet. Texto longo no celular precisa da tela inteira. |
| Journal: salvamento | **Automático**, 1,5s depois da última digitação, e também ao sair da página ou o app ir para segundo plano. Rascunho de segurança no `localStorage` se o salvamento falhar. Sem botão "Salvar". |
| Journal: pergunta do dia | O botão "Responder no journal" abre uma entrada nova com a **pergunta como título** e a referência do versículo como contexto visual. |
| Progresso | Tela carregada sob demanda (`React.lazy`) para não pesar o resto do app. Gráfico de barras do saldo diário, com média móvel de 7 dias nos períodos de 30 e 90 dias. Médias consideram só dias encerrados com algo programado. |
| PWA | `vite-plugin-pwa` com `registerType: 'prompt'`: quando sai uma versão nova, aparece um aviso "Nova versão disponível · Atualizar". Nada de recarregar sozinho (poderia interromper alguém escrevendo no journal). Dados do Supabase nunca ficam em cache do service worker. |
| Versão do app | Exibida na tela Progresso (hash do commit e data do build), para o Guga confirmar que está na versão nova. |
| "Sair" no celular | Sai do cabeçalho da tela Hoje e vai para um card **Conta** no fim da tela Progresso. No desktop continua na barra lateral. |
| Chama em dias anteriores | Oculta. A sequência só aparece quando o dia exibido é hoje (a sequência "daquele dia" confundiria mais do que ajudaria). |
| Arquivar e restaurar no mesmo dia | Corrigido: o registro de hoje passa para a nova versão, como já acontece no `replace_objective`. |
| Aviso de mudança na edição | Passa para o rodapé fixo do Sheet, logo acima do botão "Salvar", para nunca ficar abaixo da dobra. |
| Reordenar objetivos | Fica no backlog. |
| Aviso "Leaked Password Protection" | Fica no backlog (é um recurso dos planos pagos do Supabase). |

---

## Etapa 0 — Versículos no banco [CLAUDE CODE + GUGA] (~10 min)

### 0.1 Arquivo [CLAUDE CODE]
Confirme que `supabase/migrations/0003_verses_seed.sql` existe (o Guga coloca junto com este plano). Não altere o conteúdo. Confira rapidamente que tem 30 entradas, posições de 1 a 30 e termina com `on conflict (position) do update`.

**Commit:** `feat(db): seed first 30 daily verses`

### 0.2 Executar [GUGA]
Copie o arquivo para a área de transferência, abra o SQL Editor e peça ao Guga para colar e clicar em **Run**. O resultado final deve mostrar `total_verses = 30`. → foto

Se o Supabase mostrar o aviso "Potential issue detected", é esperado (o script tem `update`); pode confirmar.

### 0.3 Conferência [CLAUDE CODE]
Verifique pela API que a leitura sem login é recusada ou vazia (o RLS de `verses` só libera para usuários autenticados). Não peça foto disso.

---

## Etapa 1 — Remover o diagnóstico [CLAUDE CODE] (~10 min)

- Apague `src/pages/Diagnostics.tsx` e a rota `/diagnostico` em `App.tsx`.
- Remova de `global.css` as classes `.check-list`, `.check`, `.check-detail` e `.status*`.
- Remova qualquer import ou helper usado só pelo diagnóstico.
- Confirme com uma busca que não sobrou referência (`diagnost`, `check-list`, `status-`).
- Mantenha a prévia local (`dev/`) e o banco falso: eles continuam úteis.

**Commit:** `chore: remove temporary diagnostics page`

---

## Etapa 2 — Ajustes do núcleo [CLAUDE CODE] (~30 min)

### 2.1 Restaurar no mesmo dia mantém a marcação
No `TrackerProvider.restore(lineageVersions)`:
1. Identifique a última versão arquivada (`latestVersion`).
2. Crie a nova versão como hoje.
3. Se existir registro da versão antiga em `today`, adicione o mesmo registro na nova (`addLog(new.id, today)`) e depois remova o antigo (`removeLog(old.id, today)`). Nesta ordem: se a remoção falhar, o pior caso é um registro duplicado em versão arquivada, que não aparece em lugar nenhum.
4. Atualize o estado local e o `LogIndex`.

Teste na prévia: marcar "Ler 20 minutos", arquivar, restaurar → continua marcado e o saldo não muda.

### 2.2 Chama só no dia de hoje
Na tela Hoje, quando o dia exibido não é hoje, não renderize a sequência (nem a chama nem o "dias limpo"). A coluna da direita fica vazia nos recorrentes.

### 2.3 Aviso de mudança no rodapé do Sheet
No `ObjectiveForm`, em modo de edição, o bloco "A mudança vale a partir de hoje. Seu histórico e sua sequência são mantidos." passa para dentro do `.sheet-footer`, acima dos botões, com 13px, fundo `--surface-2`, raio `--r-sm` e padding `--s-3`. Ele aparece com fade de 150ms quando `changesHistory` fica verdadeiro (sem animação com `prefers-reduced-motion`).

### 2.4 "Sair" sai da tela Hoje
Remova o botão "Sair" do cabeçalho da tela Hoje (o card Conta é criado na etapa 6). Se a prop `action` do `PageHeader` deixar de ser usada pela tela Hoje, mantenha-a: Objetivos e Metas usam.

**Commit:** `fix: keep today's log on restore, hide past-day streaks, sticky edit notice`

---

## Etapa 3 — Versículo do dia [CLAUDE CODE] (~50 min)

### 3.1 Regra pura: `src/lib/verses.ts`
```ts
import type { Verse } from './types'
import { dayOfYear } from './dates'

/** Versículo do dia d. Null se não houver versículos. */
export function verseForDay(verses: Verse[], d: string): Verse | null {
  if (verses.length === 0) return null
  const sorted = [...verses].sort((a, b) => a.position - b.position)
  const index = (dayOfYear(d) - 1) % sorted.length
  return sorted[index]
}
```
Usar o índice na lista ordenada (e não buscar `position === n`) protege contra buracos na numeração.

`src/lib/verses.test.ts` (crie 30 versículos de teste com uma pequena fábrica):
| Caso | Esperado |
|---|---|
| lista vazia | `null` |
| `2026-01-01` (dia 1) | posição 1 |
| `2026-01-30` (dia 30) | posição 30 |
| `2026-01-31` (dia 31) | posição 1 |
| `2026-10-06` (dia 279) | posição 9 |
| `2026-10-09` (dia 282) | posição 12 |
| `2028-12-31` (dia 366, ano bissexto) | posição 6 |
| lista fora de ordem (30, 1, 2…) | mesmo resultado que a ordenada |
| lista com buraco (posições 1, 2, 5) e dia 3 | posição 5 |

### 3.2 Dados: `src/lib/api/verses.ts` e `src/data/useVerses.ts`
- `listVerses(): Promise<Verse[]>` com `fetchAll`, ordenado por `position`.
- Hook `useVerses()`:
  - No primeiro render, lê o cache `localStorage['mast:verses:v1']` (se existir e for JSON válido) para mostrar o versículo na hora.
  - Em seguida busca do banco, atualiza o estado e regrava o cache.
  - Se a busca falhar e houver cache, segue com o cache sem mostrar erro. Sem cache: estado de erro silencioso (o card simplesmente não aparece).
  - Todo acesso ao `localStorage` envolvido em `try/catch`.
- A lista é carregada uma vez por sessão. Monte o hook num provider leve (`VersesProvider`) dentro do `Layout`, para Hoje e Journal compartilharem.

### 3.3 Fonte para as escrituras
Adicione **Source Serif 4** (pesos 400 e 400 itálico) ao link do Google Fonts em `index.html` e o token `--font-scripture: 'Source Serif 4', Georgia, serif;` em `tokens.css`. Ela é usada **só** no texto bíblico.

Tokens novos:
```css
--verse-bg: #F4EBDD;
--verse-line: #E7D6BC;
--verse-ink: #6B4A20;
```

### 3.4 Componente `VerseCard`
`src/components/VerseCard.tsx`. Props: `verse`, `date`, `today`.

Posição na tela Hoje: **logo abaixo do navegador de dia e acima do card de resumo.** Aparece mesmo quando não há objetivos programados.

**Expandido (padrão):**
- Card com fundo `--verse-bg`, borda `1px solid var(--verse-line)`, raio `--r-lg`, padding `--s-6` (`--s-5` no celular).
- Linha superior, em grid `1fr auto`:
  - Eyebrow "Versículo do dia · {tema}" (12px, caixa alta, espaçamento 0.08em, `--verse-ink`, peso 600).
  - Botão de recolher (44×44, `ChevronUpIcon`, `aria-expanded="true"`, `aria-controls` apontando para o conteúdo, `aria-label="Recolher versículo"`).
- Texto bíblico: `--font-scripture`, 19px no celular / 21px no desktop, `line-height: 1.55`, cor `--ink`, entre aspas tipográficas (“ ”).
- Referência: 13px, peso 600, `--verse-ink`, alinhada à direita, com um traço antes ("— Lamentações 3:22-23").
- Separador `1px` `--verse-line` com margem de `--s-4`.
- Reflexão: `--font-body`, 15px, `line-height: 1.6`, `--ink`.
- Bloco da pergunta: fundo `rgba(255,255,255,0.55)`, raio `--r-md`, padding `--s-4`:
  - Rótulo "Para levar hoje" (12px, caixa alta, `--verse-ink`).
  - Pergunta em 15px, peso 500.
  - Botão "Responder no journal" (`.btn-ghost`, altura 44px, borda `--verse-line`, fundo transparente, com `JournalIcon` 16px). Navega para `/journal/novo?q={pergunta}&ref={referência}&d={date}` (com `encodeURIComponent`).

**Recolhido:**
- Mesmo card, padding vertical `--s-4`, uma linha só: eyebrow "Versículo do dia" + a referência em 14px peso 600 + botão de expandir (`ChevronDownIcon`, `aria-expanded="false"`, `aria-label="Expandir versículo"`). A linha inteira é clicável.

**Estado:** recolhido ou expandido é lembrado **por dia** em `localStorage['mast:verse-collapsed:{date}']`. Cada dia novo começa expandido. Leitura e escrita com `try/catch`.

**Sem versículos** (lista vazia ou erro sem cache): o card não é renderizado.

Ícones novos em `icons.tsx`: `ChevronUpIcon`, `ChevronDownIcon`, `QuoteIcon` (opcional, se usar no journal).

### 3.5 Prévia local
Em `dev/mockBackend.ts`, carregue alguns versículos de exemplo (copie 3 entradas do arquivo de seed, com posições 1, 2 e 3) para o card aparecer na prévia.

### 3.6 Conferência visual na prévia
Abra a prévia em largura de celular (390px) e de desktop, com o card expandido e recolhido. Confira que o texto não fica apertado, que o botão "Responder no journal" não quebra em duas linhas a 390px e que o contraste do `--verse-ink` sobre `--verse-bg` passa de 4.5:1 (é cerca de 7:1).

**Commit:** `feat: verse of the day card on today screen`

---

## Etapa 4 — Journal [CLAUDE CODE] (~70 min)

### 4.1 Dados: `src/lib/api/journal.ts`
```ts
export interface JournalInput {
  entry_date: string
  title: string | null
  body: string
}
listEntries(): Promise<JournalEntry[]>          // fetchAll; order entry_date desc, created_at desc
getEntry(id: string): Promise<JournalEntry>
createEntry(input: JournalInput): Promise<JournalEntry>
updateEntry(id: string, input: JournalInput): Promise<JournalEntry>
deleteEntry(id: string): Promise<void>
```
Título vazio (após `trim`) vira `null`. O corpo **não** passa por `trim` (espaços e quebras de linha do usuário são preservados), mas não se salva entrada com corpo vazio depois de `trim`.

### 4.2 Regras puras: `src/lib/journal.ts`
```ts
/** Título exibido: o título, ou a primeira linha não vazia do corpo (até 80 caracteres, com "…"). */
export function displayTitle(e: Pick<JournalEntry, 'title' | 'body'>): string
/** Prévia: texto do corpo sem a linha usada como título, espaços colapsados, até 160 caracteres. */
export function preview(e: Pick<JournalEntry, 'title' | 'body'>): string
/** Contagem de palavras (separadas por espaço em branco). */
export function wordCount(text: string): number
/** Agrupa por mês: [{ key: '2026-10', label: 'Outubro de 2026', entries }], mais recente primeiro. */
export function groupByMonth(entries: JournalEntry[]): { key: string; label: string; entries: JournalEntry[] }[]
```
`src/lib/journal.test.ts` cobre: título presente; sem título usando a primeira linha; primeira linha longa cortada com "…"; prévia sem repetir a linha do título; `wordCount('')` → 0; `wordCount('  um  dois\ntrês ')` → 3; agrupamento com entradas de setembro e outubro na ordem certa e rótulo com mês maiúsculo.

### 4.3 Rotas
Em `App.tsx`, dentro das rotas protegidas:
| Caminho | Página |
|---|---|
| `/journal` | `JournalList` |
| `/journal/novo` | `JournalEditor` (nova entrada) |
| `/journal/:id` | `JournalEditor` (entrada existente) |

O item "Journal" da navegação deve ficar ativo nas três (use `NavLink` com `end={false}` ou equivalente).

### 4.4 Lista: `JournalList`
Hook `useJournal()` no modelo do `useGoals`: carrega ao abrir, expõe `status`, `error`, `entries`, `reload`.

- `PageHeader`: eyebrow "Reflexão"; título "Journal"; subtítulo "Escreva para clarear as ideias."; `action` "+ Escrever" (`.btn-primary`, `PlusIcon`) → `/journal/novo`.
- Entradas agrupadas por mês (`groupByMonth`). Cabeçalho de grupo: `.section-title` com o rótulo do mês e a contagem à direita.
- Cada entrada é um `<Link>` em formato de linha dentro de um card do mês:
  - Coluna esquerda (56px): dia em mono 22px 600 e o dia da semana abreviado embaixo (11px, `--muted`, caixa alta).
  - Coluna direita: `displayTitle` (15px, 600, uma linha com reticências) e `preview` (14px, `--muted`, até 2 linhas com `-webkit-line-clamp`).
  - Altura mínima de 72px, separador `--line-soft`, fundo `--surface-2` no hover/foco.
- **Carregando:** dois cards em esqueleto.
- **Erro:** card com `userMessage` e "Tentar novamente".
- **Vazio:** `.empty-state` com o título "Uma página em branco", o texto "Escreva o que está na sua cabeça. Ninguém mais lê." e o botão "Escrever a primeira entrada".

### 4.5 Editor: `JournalEditor`
Layout de página inteira, com coluna de texto de no máximo 680px centralizada.

**Barra superior** (sticky no topo, fundo `--bg`, borda inferior `--line` ao rolar):
- À esquerda: botão "‹ Journal" (`ChevronLeftIcon` + texto, 44px de altura) → volta para `/journal` (fazendo flush do salvamento antes).
- No centro/direita: indicador de estado em 13px `--muted`, com `aria-live="polite"`:
  - "Nova entrada" (ainda não salva)
  - "Salvando…"
  - "Salvo às 14:32"
  - "Sem conexão · rascunho guardado neste aparelho" (em `--negative`)
- À direita: botão `MoreIcon` (44×44, `aria-label="Opções da entrada"`) que abre um Sheet com a ação "Excluir entrada" (só para entradas já salvas).

**Corpo:**
- Linha de data: `input type="date"` estilizado como texto discreto (14px, `--muted`, sem borda até receber foco), com `aria-label="Data da entrada"`. Padrão: `?d=` da URL se válido, senão hoje. Não permite data futura (`max` = hoje).
- **Contexto da pergunta** (só quando a URL trouxer `ref`): bloco pequeno com fundo `--verse-bg`, borda `--verse-line`, raio `--r-md`: "A partir de {ref}" em 12px `--verse-ink`. É apenas visual, não é salvo.
- **Título:** `input` sem borda, `--font-display`, 26px, 600, placeholder "Título (opcional)", `maxLength` 120, `autoCapitalize="sentences"`. Pré-preenchido com `q` quando vier da URL.
- **Corpo:** `textarea` sem borda e sem `resize`, crescendo com o conteúdo (ajuste de `height` pelo `scrollHeight` a cada mudança), `--font-body`, 17px, `line-height: 1.7`, placeholder "O que está na sua cabeça hoje?", `autoCapitalize="sentences"`, foco automático no corpo ao abrir uma entrada nova (ou no fim do texto ao abrir uma existente). Lembre: 16px ou mais para o iOS não dar zoom.
- **Rodapé:** contagem de palavras ("214 palavras", 12px `--muted`), alinhada à direita.
- No celular, o padding inferior considera a barra de navegação e `env(safe-area-inset-bottom)`, para o fim do texto nunca ficar escondido.

**Salvamento automático** (implemente num hook `useAutosave`, testável):
1. Estado do rascunho: `{ entry_date, title, body }` e `savedSnapshot` (o último conteúdo confirmado pelo banco).
2. A cada mudança, agenda um salvamento em **1500 ms** (debounce).
3. Salvar = se o rascunho é igual ao `savedSnapshot`, não faz nada. Se `body.trim()` estiver vazio e a entrada ainda não existe, não cria nada.
4. Primeiro salvamento cria a entrada (`createEntry`) e troca a URL para `/journal/{id}` com `navigate(..., { replace: true })`, **sem desmontar o editor nem perder o foco** (o componente deve reconhecer que é a mesma entrada).
5. Nunca dois salvamentos ao mesmo tempo: se um estiver em andamento, marque `dirty` e salve de novo ao terminar.
6. **Flush imediato** (sem esperar o debounce) em: botão "‹ Journal", `visibilitychange` para `hidden` (app indo para segundo plano no iPhone), `pagehide` e desmontagem do componente.
7. Falha de rede: mantém o texto na tela, mostra o estado "Sem conexão…", grava o rascunho em `localStorage['mast:journal-draft:{id|new}']` e tenta de novo na próxima mudança ou quando a aba voltar a ficar visível.
8. Ao abrir uma entrada (ou `/journal/novo`), se existir rascunho local **mais novo** que o `updated_at` do banco, use o rascunho e mostre o aviso "Recuperamos um rascunho não salvo." (toast). O rascunho é apagado assim que um salvamento der certo.
9. Entrada existente com corpo apagado por completo: não salva o corpo vazio; mostra "Escreva algo ou exclua a entrada" no lugar do estado.

**Excluir:** Sheet com `ConfirmBlock` ("Excluir esta entrada? Isso não pode ser desfeito." / "Excluir"). Depois de excluir: limpa o rascunho local, volta para `/journal` e mostra o toast "Entrada excluída."

**Abrir entrada inexistente** (id inválido ou apagado): mensagem "Esta entrada não existe mais." e botão "Voltar ao journal".

### 4.6 Testes do autosave
`src/data/useAutosave.test.ts` (ou testes da lógica extraída em função pura, se preferir não testar hook): com `vi.useFakeTimers()`, confirme que:
- várias mudanças em menos de 1,5s geram **um** salvamento;
- conteúdo igual ao salvo não dispara salvamento;
- corpo vazio em entrada nova não cria entrada;
- um salvamento disparado durante outro em andamento acontece **depois** do primeiro, com o conteúdo mais recente;
- `flush()` salva na hora.

Se testar o hook exigir `jsdom` ou `@testing-library/react`, extraia a lógica para uma pequena classe ou função pura (`createAutosaver({ save, delay })`) e teste essa, sem adicionar dependências.

### 4.7 Prévia local
Adicione 4 entradas de exemplo ao banco falso: duas em outubro, duas em setembro, uma sem título e uma longa (para testar a prévia cortada).

### 4.8 Conferência na prévia
- Criar uma entrada nova pelo botão "+ Escrever", digitar, esperar o "Salvo às…", voltar e ver na lista.
- Abrir pela pergunta do versículo (título preenchido e bloco "A partir de…").
- Simular falha no banco falso (se houver um modo de erro; senão, criar um interruptor simples no mock) e confirmar o estado "Sem conexão" e a recuperação do rascunho.

**Commit:** `feat: journal list and autosaving editor`

---

## Etapa 5 — Ponto de controle: publicar e testar [GUGA, guiado] (~15 min)

1. **[CLAUDE CODE]** `npm run lint`, `npm test`, `npm run build`. Corrija tudo.
2. **[GUGA]** "Push origin". **[CLAUDE CODE]** Acompanhe o deploy e avise.
3. **[GUGA]** No celular, um passo por vez:
   1. Abrir Hoje: o versículo do dia aparece no topo. → foto
   2. Recolher o versículo, recarregar a página: continua recolhido. Ir para ontem com "‹": aparece outro versículo, expandido.
   3. Voltar para hoje e tocar em "Responder no journal". Escrever duas frases, esperar aparecer "Salvo às…". → foto
   4. Tocar em "‹ Journal": a entrada aparece na lista com a pergunta como título.
   5. Abrir a entrada, apagar uma palavra, sair imediatamente com "‹ Journal" e reabrir: a mudança foi salva.
   6. Arquivar e restaurar "Ler 20 minutos" com ele marcado: continua marcado.

Se a sessão precisar ser dividida, **este é o ponto de pausa**: versículo e journal já estão no ar.

---

## Etapa 6 — Tela Progresso [CLAUDE CODE] (~60 min)

Antes de escrever o gráfico, leia a skill de visualização de dados se ela estiver disponível no ambiente; as regras abaixo já seguem os princípios dela.

### 6.1 Dependência e carregamento sob demanda
```bash
npm install recharts
```
Em `App.tsx`, carregue a página com `const Progress = lazy(() => import('./pages/Progress'))` dentro de `<Suspense>`, com um fallback de esqueleto no mesmo layout (cabeçalho + card de 280px). Depois do build, confira que o Recharts ficou num arquivo separado (`dist/assets/Progress-*.js`) e que o arquivo principal não cresceu de forma relevante. Registre os tamanhos no resumo.

### 6.2 Regras puras: `src/lib/progress.ts`
```ts
import type { DayScore } from './scoring'

export type RangeDays = 7 | 30 | 90

/** Primeiro dia com algo programado (menor starts_on ou once_date entre todos os objetivos). Null se não houver objetivos. */
export function firstTrackedDay(objectives: Objective[]): string | null

/** Intervalo do gráfico: de max(hoje − (n − 1), primeiro dia rastreado) até hoje. Null se não houver objetivos. */
export function chartRange(objectives: Objective[], today: string, n: RangeDays): { from: string; to: string } | null

/** Média móvel de 7 dias do saldo, considerando só dias encerrados com algo programado; null onde não houver dados suficientes (menos de 3 dias válidos na janela). */
export function movingAverage(scores: DayScore[], window?: number): (number | null)[]

export interface RangeSummary {
  closedDays: number           // dias encerrados com algo programado
  avgBalance: number | null    // média do saldo nesses dias, arredondada
  avgPct: number | null        // média do aproveitamento (só dias com pct não nulo)
  positiveDays: number         // dias encerrados com saldo > 0
  bestDay: DayScore | null     // maior saldo; empate → o mais recente
  totalBalance: number         // soma do saldo dos dias encerrados
}
export function summarizeRange(scores: DayScore[]): RangeSummary
```
"Dia com algo programado" = `positivesTotal + negativesTotal > 0`. O dia corrente (`final = false`) **nunca** entra nas médias, mas aparece no gráfico.

`src/lib/progress.test.ts`:
- `firstTrackedDay` com recorrentes e avulsos (o avulso mais antigo vence se for anterior).
- `chartRange` com 7 dias quando o rastreio começou há 3 dias → começa no primeiro dia rastreado.
- `summarizeRange` ignorando o dia corrente e dias sem nada programado; empate no melhor dia; tudo vazio → médias `null`, contagens 0.
- `movingAverage` com janela de 7, buracos e menos de 3 dias válidos.

### 6.3 Layout da tela
- `PageHeader`: eyebrow "Evolução"; título "Progresso"; subtítulo "Constância vence intensidade."
- `Segmented` "7 dias / 30 dias / 90 dias" (padrão: 30), lembrado em `localStorage['mast:progress-range']` (com `try/catch`).
- **Indicadores**: grade de 4 cards pequenos (2×2 no celular, 4 em linha no desktop), cada um com rótulo (12px, caixa alta, `--muted`), valor (JetBrains Mono 600, 26px) e uma linha de apoio (12px, `--muted`):
  | Rótulo | Valor | Apoio |
  |---|---|---|
  | Saldo médio | `formatPoints(avgBalance)` ou "—" | "por dia encerrado" |
  | Aproveitamento | `avgPct%` ou "—" | "média do período" |
  | Dias no positivo | `positiveDays` | "de {closedDays} dias" |
  | Melhor dia | `formatPoints(best.balance)` ou "—" | `formatShort(best.date)` |
  Cor do valor do saldo: `--accent` se positivo, `--negative` se negativo, `--ink` se zero.
- **Card do gráfico** (fundo `--surface`), título "Saldo diário" e, à direita, legenda compacta.
- **Card Conta** (no fim): e-mail do usuário (14px), versão do app (12px `--muted`, ex.: "Versão a1b2c3d · 9 out, 14:32") e o botão "Sair" (`.btn-ghost`), visível só no celular (`.only-mobile`); no desktop o card mostra só e-mail e versão.

### 6.4 O gráfico
`ComposedChart` do Recharts dentro de `ResponsiveContainer` (altura 260px no celular, 300px no desktop):
- **Barras** do saldo, uma por dia, com raio de 3px no topo (e embaixo nas negativas), largura máxima de 18px:
  - saldo positivo: `--accent`
  - saldo negativo: `--negative`
  - zero: barra mínima cinza `#C9CFC9` de 2px (para o dia não "sumir")
  - **dia corrente**: mesma cor com opacidade 0.45 (é parcial)
  - dias sem nada programado: sem barra (valor `null`)
- **Linha da média móvel de 7 dias** (só em 30 e 90 dias): `--ink`, 1.5px, sem pontos, `type="monotone"`, `connectNulls={false}`.
- **Linha de referência no zero**: `--line`, 1px.
- **Eixo X**: datas com `formatShort`, 11px `--muted`, sem linha de eixo; mostrar no máximo 6–7 rótulos (`interval` calculado pelo tamanho do período).
- **Eixo Y**: 11px `--muted`, sem linha, 4 marcas, com `formatPoints`. Grade horizontal tracejada `--line-soft`; sem grade vertical.
- Fontes do gráfico: `--font-body` nos eixos e `--font-mono` nos valores do tooltip.
- **Tooltip** customizado (card branco, borda `--line`, raio `--r-md`, sombra suave, 13px):
  - data longa (`capitalize(formatLong(d))`) e "parcial" quando for hoje;
  - Saldo (mono, colorido);
  - "Ganhos +40 · Perdas −10";
  - "Aproveitamento 80%" (ou "—").
- **Legenda** própria no cabeçalho do card (não a do Recharts): quadradinho verde "Positivo", vermelho "Negativo" e, em 30/90, um traço escuro "Média 7 dias".
- Animação das barras de 300ms; desligada com `prefers-reduced-motion`.
- Acessibilidade: o contêiner do gráfico tem `role="img"` e um `aria-label` com o resumo ("Saldo diário dos últimos 30 dias. Saldo médio +18, 12 de 18 dias no positivo."). Abaixo do gráfico, um `<details>` "Ver como tabela" com uma tabela simples (data, saldo, aproveitamento), útil também para conferência.

### 6.5 Estados
- **Carregando** (`useTracker().status === 'loading'`): esqueleto.
- **Erro:** card com mensagem e "Tentar novamente".
- **Sem objetivos:** `.empty-state` "Seu gráfico começa com o primeiro objetivo" + botão "Criar objetivos" → `/objetivos`.
- **Só o dia de hoje rastreado** (nenhum dia encerrado ainda): mostra o gráfico com a barra parcial e, no lugar dos indicadores, o texto "Os indicadores aparecem depois do primeiro dia completo."

### 6.6 Conferência na prévia
No banco falso, gere registros para os últimos 40 dias com um padrão variado (dias bons, dias ruins, um deslize, um dia sem nada) para o gráfico ter forma. Confira 7, 30 e 90 dias a 390px e em desktop, o tooltip ao tocar numa barra e a tabela.

**Commit:** `feat: progress screen with daily balance chart and summary`

---

## Etapa 7 — Versão do app [CLAUDE CODE] (~10 min)

Em `vite.config.ts`, use `define`:
```ts
define: {
  __APP_VERSION__: JSON.stringify(process.env.GITHUB_SHA?.slice(0, 7) ?? 'local'),
  __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
},
```
Declare as duas constantes em `src/vite-env.d.ts`. O workflow do GitHub já expõe `GITHUB_SHA` no build. Exiba no card Conta: "Versão {sha} · {formatShort(localDateOf(build))}, {hora:min}".

**Commit:** `feat: show app version and build time`

---

## Etapa 8 — PWA [CLAUDE CODE] (~45 min)

### 8.1 Dependências
```bash
npm install -D vite-plugin-pwa @vite-pwa/assets-generator
```

### 8.2 Ícones
Crie `public/icon-source.svg`, versão do logo pensada para ícone de app: quadrado 512×512 **sem cantos arredondados** (o sistema arredonda), fundo `#1E6B47` preenchendo tudo, e o mastro com a vela e a base em branco, ocupando no máximo os **60% centrais** (área segura dos ícones "maskable" do Android e do recorte do iOS). Mesmo desenho do `favicon.svg`, apenas reescalado e centralizado.

Crie `pwa-assets.config.ts`:
```ts
import { defineConfig, minimal2023Preset } from '@vite-pwa/assets-generator/config'

export default defineConfig({
  headLinkOptions: { preset: '2023' },
  preset: {
    ...minimal2023Preset,
    maskable: { ...minimal2023Preset.maskable, padding: 0, resizeOptions: { background: '#1E6B47' } },
    apple: { ...minimal2023Preset.apple, padding: 0, resizeOptions: { background: '#1E6B47' } },
  },
  images: ['public/icon-source.svg'],
})
```
Gere com `npx pwa-assets-generator`. Devem surgir em `public/`: `pwa-64x64.png`, `pwa-192x192.png`, `pwa-512x512.png`, `maskable-icon-512x512.png`, `apple-touch-icon-180x180.png` (e um `favicon.ico`). Abra os PNGs com a ferramenta de leitura de imagem para conferir que o desenho está centralizado e não foi cortado. Commite os PNGs (a geração não roda no deploy). Mantenha o `favicon.svg` existente como favicon principal.

Se o gerador falhar neste Mac por causa da biblioteca de imagem (`sharp`), gere os PNGs com um script Node de uso único usando `sharp` diretamente; se também falhar, explique ao Guga e use o caminho mais simples que funcionar, registrando a decisão.

### 8.3 `vite.config.ts`
```ts
import { VitePWA } from 'vite-plugin-pwa'

VitePWA({
  registerType: 'prompt',
  injectRegister: false,
  includeAssets: ['favicon.svg', 'apple-touch-icon-180x180.png'],
  manifest: {
    id: '/mast/',
    name: 'Mast',
    short_name: 'Mast',
    description: 'Objetivos, hábitos, metas e reflexão diária.',
    lang: 'pt-BR',
    start_url: '/mast/',
    scope: '/mast/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#EEF0EC',
    theme_color: '#EEF0EC',
    icons: [
      { src: 'pwa-64x64.png', sizes: '64x64', type: 'image/png' },
      { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
      { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
      { src: 'maskable-icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  },
  workbox: {
    globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
    cleanupOutdatedCaches: true,
    navigateFallback: null,
    runtimeCaching: [
      {
        urlPattern: ({ url }) =>
          url.origin === 'https://fonts.googleapis.com' || url.origin === 'https://fonts.gstatic.com',
        handler: 'CacheFirst',
        options: {
          cacheName: 'google-fonts',
          expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 },
          cacheableResponse: { statuses: [0, 200] },
        },
      },
    ],
  },
  devOptions: { enabled: false },
})
```
Pontos que não podem mudar: **nenhuma regra de cache para `*.supabase.co`** (os dados sempre vêm do banco), `registerType: 'prompt'` e `start_url`/`scope` em `/mast/`.

Em `src/vite-env.d.ts`, acrescente `/// <reference types="vite-plugin-pwa/react" />` (e `vite-plugin-pwa/info` se o TypeScript pedir).

### 8.4 `index.html` (iOS)
Acrescente no `<head>`:
```html
<link rel="apple-touch-icon" href="/apple-touch-icon-180x180.png" />
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-title" content="Mast" />
<meta name="apple-mobile-web-app-status-bar-style" content="default" />
```
Use o mesmo padrão de caminho do favicon que funcionou no Dia 1 (`/arquivo`, sem `/mast/`, deixando o Vite acrescentar a base). Confira no `dist/index.html` gerado que os caminhos ficaram com `/mast/` uma única vez.

### 8.5 Aviso de nova versão: `UpdatePrompt`
`src/components/UpdatePrompt.tsx`, montado uma vez no `App` (fora das rotas, para funcionar também no login):
```ts
import { useRegisterSW } from 'virtual:pwa-register/react'

const { needRefresh: [needRefresh, setNeedRefresh], updateServiceWorker } = useRegisterSW({
  onRegisteredSW(_url, registration) {
    if (!registration) return
    // Verifica atualização ao voltar para o app e a cada hora
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') registration.update()
    })
    setInterval(() => registration.update(), 60 * 60 * 1000)
  },
})
```
Quando `needRefresh` for verdadeiro, mostre uma barra:
- Fixa acima da barra inferior no celular (respeitando `env(safe-area-inset-bottom)`) e no canto inferior direito no desktop, acima dos toasts.
- Fundo `--ink`, texto branco 14px: "Nova versão do Mast disponível."
- Botão "Atualizar" (fundo `--accent-bright`, texto `--ink`, 44px) → `updateServiceWorker(true)`.
- Botão "Depois" (texto, `--muted-on-ink`) → `setNeedRefresh(false)`.
- `role="status"`.

Antes de atualizar, o editor do journal precisa ter salvo: dispare um evento global simples (`window.dispatchEvent(new Event('mast:before-update'))`) que o `JournalEditor` escuta para fazer flush, e aguarde até 1,5s antes de chamar `updateServiceWorker(true)`.

### 8.6 Conferência local
```bash
npm run build && npx vite preview
```
Abra `http://localhost:4173/mast/`, confira no DevTools (Application) que o manifest é lido sem erros, os ícones aparecem e o service worker registra. Confira também que nenhuma requisição ao Supabase passa pelo cache do service worker.

**Commit:** `feat: installable PWA with update prompt`

---

## Etapa 9 — Publicação, instalação e teste [GUGA, guiado] (~25 min)

1. **[CLAUDE CODE]** `npm run lint`, `npm test`, `npm run build`.
2. **[GUGA]** "Push origin". **[CLAUDE CODE]** Acompanhe o deploy. Depois, pela URL pública, confira que `https://gugabites.github.io/mast/manifest.webmanifest` e `https://gugabites.github.io/mast/sw.js` respondem, e que o manifest tem `start_url` e `scope` corretos.
3. **[GUGA]** No iPhone, **no Safari** (outros navegadores no iOS não instalam), um passo por vez:
   1. Abrir `https://gugabites.github.io/mast/`.
   2. Tocar em **Compartilhar** (quadrado com seta para cima) → **Adicionar à Tela de Início** → conferir o nome "Mast" → **Adicionar**. → foto da tela inicial com o ícone
   3. Abrir o Mast pelo ícone. Ele abre em tela cheia, sem a barra do Safari.
   4. **Fazer login de novo.** No iPhone, o app instalado tem armazenamento separado do Safari; isso só acontece uma vez.
   5. Conferir que a barra inferior não fica sob o indicador de início do iPhone e que o topo não fica sob o relógio. → foto da tela Hoje
   6. Abrir Progresso: gráfico, indicadores e card Conta com a versão. → foto
4. **Teste de atualização** (prova de que ele não fica preso numa versão antiga):
   1. **[CLAUDE CODE]** Faça uma mudança mínima e visível (por exemplo, o subtítulo de Progresso passa a "Constância vence intensidade. Um dia de cada vez.") e commite como `chore: verify pwa update flow`.
   2. **[GUGA]** "Push origin". **[CLAUDE CODE]** Avise quando o deploy terminar.
   3. **[GUGA]** Fechar o Mast (deslizar para cima no seletor de apps) e abrir de novo. Em alguns segundos deve aparecer "Nova versão do Mast disponível". Tocar em **Atualizar**. → foto do card Conta com a versão nova
   4. Se o aviso não aparecer em até 1 minuto, fechar e abrir mais uma vez (o iOS às vezes demora a checar). Se ainda assim não aparecer, investigar antes de seguir.

---

## Etapa 10 — Começar de verdade [GUGA, guiado] (~15 min)

O Mast deixa de ser um teste aqui.

1. **[GUGA]** Em Objetivos, decidir o que fica dos dados de teste: "Ler 20 minutos", "Treinar" (seg, qua, sex) e "Celular depois das 23h". O que não for rotina real deve ser **excluído** (não arquivado), para não aparecer no gráfico.
2. **[GUGA]** Em Hoje, excluir o avulso "Ligar para o contador" se não for real.
3. **[GUGA]** Em Metas, excluir "Ler 24 livros" se não for uma meta real.
4. **[GUGA]** Cadastrar a rotina real: os hábitos que quer manter, os que quer evitar e pelo menos uma meta de longo prazo. Recomendação: começar com **no máximo 5 objetivos recorrentes e 2 hábitos a evitar**. É melhor ganhar consistência com pouco e acrescentar depois.
5. **[GUGA]** À noite, marcar o dia de hoje como ele realmente foi.

O Claude Code apenas acompanha e responde dúvidas nesta etapa. Não crie objetivos pelo Guga.

---

## Etapa 11 — Encerramento [CLAUDE CODE] (~15 min)

### 11.1 Atualizar o `CLAUDE.md`
- **Seção 3 (Stack):** acrescente Recharts (carregado sob demanda), `vite-plugin-pwa` e `@vite-pwa/assets-generator`, e a fonte Source Serif 4 (só no texto bíblico).
- **Seção 4 (Escopo):** marque a versão 1 como concluída, com a data.
- **Seção 5 (Regras):** acrescente as regras do versículo (posição pelo índice da lista ordenada, cache local), do journal (autosave de 1,5s, flush ao sair, rascunho local) e do progresso (médias só com dias encerrados com algo programado; média móvel de 7 dias com no mínimo 3 dias válidos).
- **Seção 7 (Telas):** atualize Hoje (versículo, sem "Sair"), Journal (lista + editor), Progresso (gráfico, indicadores, Conta).
- **Seção 8 (Visual):** tokens `--verse-*` e `--font-scripture`.
- **Seção 10 (Backlog):** remova o que foi entregue; acrescente: reordenar objetivos; proteção contra senhas vazadas (exige plano pago do Supabase); sequência "como estava naquele dia" ao rever dias passados; modo escuro; versículos 31 a 365; busca no journal.
- **Status:** "Sex 9/10 — completar e colocar em uso" concluído (registre a data real).
- **Decisões** (com data): todas as da tabela "Decisões fechadas para hoje" deste plano, mais qualquer outra tomada na sessão.

**Commit:** `docs: update CLAUDE.md after day 3 (v1 complete)`. Peça o último "Push origin".

### 11.2 Resumo
Salve em `docs/resumo-dia-3.md`, commite e mostre no chat:
```
## Resumo — Dia 3
**Concluído:** …
**Pendente / não concluído:** …
**Problemas encontrados e como foram resolvidos:** …
**Decisões tomadas fora do plano:** …
**Tamanho do build:** arquivo principal e arquivo da tela Progresso (antes e depois)
**Estado da rotina real do Guga:** quantos objetivos, hábitos a evitar e metas foram cadastrados (sem listar conteúdo pessoal além do necessário)
**Pontos para a versão 2:** …
```

---

## Solução de problemas

| Sintoma | Causa provável | Correção |
|---|---|---|
| Versículo não aparece | Seed não rodado, ou RLS bloqueando sem sessão | Conferir `count(*)` em `verses`; o hook só busca com usuário logado |
| Versículo errado para o dia | Cálculo por `position === n` ou `dayOfYear` com UTC | Usar `verseForDay` (índice na lista ordenada) e a data local `d` |
| Texto do journal some ao trocar de app no iPhone | Flush não disparado | Confirmar `visibilitychange` → `hidden` e `pagehide` chamando `flush()` |
| Editor perde o foco depois do primeiro salvamento | Troca de rota desmontou o componente | Manter a mesma instância ao passar de `/journal/novo` para `/journal/:id` (por exemplo, a mesma `key` e um id interno) |
| Duas entradas criadas para o mesmo texto | Dois `createEntry` simultâneos | Fila de salvamento: nunca dois salvamentos ao mesmo tempo |
| Recharts entrou no arquivo principal | Import direto em algum componente fora da página | Importar Recharts só dentro de `pages/Progress.tsx` e componentes usados só por ela |
| Gráfico com largura zero | `ResponsiveContainer` dentro de flex sem largura mínima | `min-width: 0` no contêiner pai |
| Ícone aparece cortado ou com borda branca no iPhone | Desenho fora da área segura ou PNG com transparência | Mastro dentro dos 60% centrais; `apple-touch-icon` com fundo sólido |
| Caminhos `/mast/mast/...` no HTML | Base duplicada | Usar `/arquivo` no `index.html`, como no favicon |
| App instalado pede login | Armazenamento separado do Safari no iOS | Esperado; só na primeira abertura |
| Aviso de nova versão nunca aparece | `registerType` errado ou `registration.update()` não chamado | Conferir `prompt`, `injectRegister: false` e o `UpdatePrompt` montado fora das rotas |
| Dados antigos aparecendo depois de atualizar | Cache do service worker em requisições ao Supabase | Não pode haver regra de cache para `supabase.co`; conferir `runtimeCaching` |
| Página em branco no app instalado depois de um deploy | Cache antigo apontando para arquivos removidos | `cleanupOutdatedCaches: true`; como último recurso, o Guga remove o ícone e instala de novo |

---

## Tempo estimado

| Etapa | Tempo |
|---|---|
| 0. Versículos no banco | 10 min |
| 1. Remover diagnóstico | 10 min |
| 2. Ajustes do núcleo | 30 min |
| 3. Versículo do dia | 50 min |
| 4. Journal | 70 min |
| 5. Ponto de controle | 15 min |
| 6. Progresso | 60 min |
| 7. Versão do app | 10 min |
| 8. PWA | 45 min |
| 9. Instalação e teste | 25 min |
| 10. Começar de verdade | 15 min |
| 11. Encerramento | 15 min |
| **Total** | **~6h** |

O tempo ativo do Guga é de cerca de 1 hora: etapas 0.2, 5, 9 e 10. O ponto natural de pausa é depois da etapa 5.
