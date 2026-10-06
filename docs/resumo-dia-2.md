# Mast — Resumo do Dia 2 (núcleo)

> Documento de passagem para o planejamento do Dia 3. O plano seguido está em `docs/plano-dia-2.md`.

## Resumo — Dia 2

**Concluído:**
- Sessão feita em 6/10/2026, no mesmo dia da fundação. O núcleo previsto para quinta (8/10) está no ar em https://gugabites.github.io/mast/.
- Pendências do Dia 1 fechadas: 16 políticas RLS conferidas, Security Advisor com 0 erros, e os três testes de login (senha errada, sessão mantida ao recarregar, sair).
- Migração `0002_lineage.sql` aplicada: coluna `lineage_id` e função `replace_objective`.
- Regras puras com testes: agenda, pontuação e sequências. São 51 testes no total (`npm test`).
- Camada de dados em `src/lib/api/`, estado compartilhado (`TrackerProvider`) com marcação otimista, e avisos (`Toast`).
- Telas **Objetivos**, **Hoje** e **Metas** completas, com formulários em `Sheet`.
- Diagnóstico com 10 verificações, passando em produção.
- `CLAUDE.md` atualizado: regras de negócio (seção 5), modelo de dados (seção 6), status e decisões.
- Confirmado pelo Guga no celular, um teste por vez: criar objetivo diário, em dias específicos e de evitar; marcar e desmarcar; saldo e anel; deslize e desfazer; objetivo só para hoje; navegar para ontem e voltar; editar peso mantendo marcação e sequência; arquivar e restaurar; diagnóstico 10/10; criar meta numérica, avançar até atingir e concluir; meta em porcentagem e exclusão.

**Pendente / não concluído:**
- Etapa 12.4 do plano: o Guga marcar em Hoje o que realmente fez no dia (primeiro dia real de uso).
- Os dados criados nos testes continuam no banco: objetivos "Ler 20 minutos" (Alto), "Treinar" (seg, qua, sex), "Celular depois das 23h", o avulso "Ligar para o contador" e a meta concluída "Ler 24 livros". O Guga decide se mantém como rotina real ou exclui pela própria tela.
- Aviso do Security Advisor que continua aberto: "Leaked Password Protection Disabled". Fica só anotado.
- Não testado em aparelho: excluir um objetivo recorrente, editar um avulso pelos três pontinhos, e o comportamento à meia-noite com o app aberto. Os dois primeiros foram testados só na prévia local.

**Problemas encontrados e como foram resolvidos:**
- O aviso "Potential issue detected" do Supabase ao rodar a migração (por conter `update`, `delete` e `revoke`). Era esperado; o Guga confirmou e rodou.
- O lint acusou `set-state-in-effect` no carregamento inicial. Resolvido escrevendo o carregamento como cadeia de promessas, sem `setState` síncrono dentro do efeito.
- Um screenshot da prévia mostrou o formulário com valores antigos. Era atraso da captura, não defeito: o estado conferido pelo DOM estava certo.
- Uma foto repetida da galeria pareceu indicar que dois objetivos não tinham sido salvos; a foto seguinte confirmou que estavam.
- O iPhone capitalizou sozinho o campo Unidade da meta ("Livros"). Corrigido com `autoCapitalize="none"`.

**Decisões tomadas fora do plano:**
- **`Sheet` sem prop `footer`.** O formulário filho traz `.sheet-body` e `.sheet-footer`, para o botão de salvar ficar dentro do `<form>`.
- **Erros de salvamento dentro do formulário**, e não em toast: o toast ficaria atrás do diálogo.
- **Círculo de "Evitar" com borda `#9AA49E`** (a mesma do quadrado), em vez de `--line`, que ficava quase invisível.
- **Prévia local** em `dev/` (`http://localhost:5173/mast/dev/preview.html`): o app real, já logado, contra um banco falso em memória. Não entra no build. Foi o que permitiu testar as telas logadas antes de cada push.
- **Verificação 1.3 da migração** feita pelo Claude Code via API (coluna existe; função existe e recusa anônimo), sem pedir foto.
- **Toasts a mais:** "Objetivo excluído.", "Objetivo restaurado." e os de meta (concluída, reaberta, arquivada, desarquivada, excluída).
- **Cartão de resumo só aparece quando há algo programado no dia.**
- **`archiveObjective` devolve o objetivo** (não `void`), para atualizar a tela sem recarregar.
- **Objetivos também são paginados** (helper `fetchAll`), não só os registros.
- **`padding-top` com `env(safe-area-inset-top)`** no conteúdo, já pensando no app instalado (PWA).
- Acréscimos pequenos: `isValidISODate`, `MONDAY_FIRST`, `TickIcon`, `TrackerStatus`, `changesHistory`, `normalizeInput`, `src/lib/goals.ts` com testes.

**O que o Dia 3 já pode usar:**

*Regras e utilitários (`src/lib/`)*
- `dates.ts`: além das do Dia 1, `eachDay`, `localDateOf`, `formatShort`, `relativeDayLabel`, `daysBetween`, `capitalize`, `isValidISODate`.
- `format.ts`: `formatPoints`, `frequencyLabel`, `normalizeWeekdays`, `WEEKDAY_SHORT/LONG/LETTER`, `MONDAY_FIRST`, `WEIGHT_LABEL`.
- `scoring.ts`: `scoreDay` e **`scoreRange(objectives, logs, from, to, today)`**, que devolve uma `DayScore` por dia. É a base do gráfico.
- `schedule.ts`, `streaks.ts`, `logIndex.ts`, `goals.ts`.
- `testing.ts`: fábricas `obj()` e `octoberLogs()` para testes.

*Dados*
- `src/lib/api/`: `errors.ts` (`ApiError`, `unwrap`, `userMessage`), `fetchAll.ts`, `objectives.ts`, `logs.ts`, `goals.ts`. Journal e versículos ainda **não** têm módulo.
- `useTracker()`: `status`, `error`, `objectives`, `logs`, `today`, `streaks` e as ações. Está disponível em todas as telas logadas (o provider fica no `Layout`), então a tela Progresso já tem objetivos e registros carregados.
- `useGoals()`: padrão de hook local à página, com carga, erro e ações. Serve de modelo para o journal.
- `useToast().show(mensagem, 'error'?)`.

*Componentes*
- `Sheet`, `Segmented`, `WeekdayPicker`, `ProgressBar`, `ConfirmBlock`, `TrackerStatus`, `ObjectiveForm`, `GoalForm`, `PageHeader`.
- Ícones novos: `PlusIcon`, `MinusIcon`, `EditIcon`, `ArchiveIcon`, `TrashIcon`, `ChevronLeftIcon`, `ChevronRightIcon`, `CloseIcon`, `TickIcon`, `FlameIcon`, `MoreIcon`, `RestoreIcon`. Todos aceitam `size`.

*Estilos (`global.css`)*
- `.stack`, `.plain-list`, `.icon-btn`, `.icon-btn-plain`, `.btn-danger`, `.chip`, `.info-block`, `.section-title`, `.empty-state`, `.empty-actions`, `.skeleton`, `.field-hint`, `.field-error`, `.field-row`, `.field-counter`, `.visually-hidden`, `.text-negative`, `.text-streak`, `.text-accent`, `.text-muted`, `.collapse-toggle`.
- `.field` já estiliza `input`, `select` e `textarea`.

**Pontos para o plano do Dia 3:**

Escopo previsto: journal, versículo do dia, gráfico, PWA e teste real no celular.

- **Versículos.** A tabela `verses` está vazia. O seed precisa chegar como SQL com `position` (1 a 30), `reference`, `text`, `reflection`, `question` e `theme`. Não há política de escrita: entra pelo SQL Editor, com o Guga colando. Regra: `position = ((diaDoAno − 1) mod N) + 1`; `dayOfYear()` já existe.
- **Journal.** A tabela e o RLS existem desde o Dia 1 (`entry_date`, `title`, `body`, `updated_at` automático). Falta `src/lib/api/journal.ts`, um hook no modelo do `useGoals` e a tela. Decidir se o editor é um `Sheet` ou uma página própria; texto longo no celular costuma ficar melhor em página inteira.
- **Gráfico.** `scoreRange` já entrega saldo, ganhos, perdas e aproveitamento por dia. O JS publicado está em 525 kB (151 kB comprimido) e o Vite já avisa do tamanho. O Recharts aumenta isso bastante: vale carregar a tela Progresso sob demanda (`React.lazy`).
- **PWA.** `vite-plugin-pwa` ainda não está instalado. O plano precisa cobrir: ícones PNG de 192 e 512 px e o `apple-touch-icon` (hoje só existe o `favicon.svg`; é preciso gerar os PNG), `start_url` e `scope` em `/mast/`, e a estratégia de atualização do service worker, para o Guga não ficar preso numa versão antiga depois de um push.
- **Remover o diagnóstico.** Página, rota e os estilos `.check*` e `.status*` saem na sexta, conforme combinado.
- **Prévia local.** Para testar journal e versículo na prévia, o `dev/mockBackend.ts` precisa de dados de exemplo nessas duas tabelas (as tabelas já existem lá, vazias).
- **Limitações conhecidas do núcleo**, para decidir se entram no Dia 3 ou no backlog:
  - Arquivar e restaurar um objetivo no mesmo dia perde a marcação daquele dia (o registro fica na versão arquivada).
  - Ao rever um dia anterior, a chama mostra a sequência de hoje, não a daquele dia.
  - No formulário de edição, o aviso "A mudança vale a partir de hoje" pode ficar abaixo da dobra no celular.
  - No celular, "Sair" só existe na tela Hoje.
  - Não há como reordenar objetivos (`sort_order` é sempre 0).
- **Forma de trabalho que funcionou:** um passo manual por vez; o Claude Code copia o SQL e abre as páginas; push pelo GitHub Desktop; o Claude Code acompanha o deploy pela API pública e confere as telas na prévia local antes de pedir o push. O tempo do Guga ficou concentrado nos testes no celular.

## Commits do Dia 2

```
feat(db): objective lineage and atomic replace_objective
feat: date and formatting helpers
feat: scheduling, scoring and streak rules with tests
feat: data access layer
feat: tracker state provider with optimistic toggles
feat: sheet, segmented, weekday picker and supporting styles
feat: objectives screen with create, edit, archive, restore and delete
feat: today screen with day navigation, scoring and streaks
chore: local preview harness with in-memory backend
feat: goals screen with progress tracking
chore: diagnostics cover lineage and replace_objective
fix: keep page content below the status bar when installed
fix: do not auto-capitalize the goal unit field
docs: update CLAUDE.md after day 2
```
