# Mast — Resumo do Dia 1 (fundação)

> Documento de passagem para o planejamento do Dia 2. Descreve o que existe hoje no repositório, o que mudou em relação ao plano do Dia 1 e o que o plano do Dia 2 precisa levar em conta.

## Situação

- **Data:** terça, 6/10/2026. A fundação prevista para quarta (7/10) foi concluída um dia antes.
- **Site no ar:** https://gugabites.github.io/mast/
- **Repositório:** https://github.com/Gugabites/mast (público, branch `main`, 9 commits)
- **Pasta local:** `~/Documents/mast`
- **Supabase:** projeto `mast`, região São Paulo, ref `gbxbamgyttpidqvdtffo`
- **Status no `CLAUDE.md`:** "Ter 6/10 — preparação" e "Qua 7/10 — fundação" marcados como concluídos.

## Critério de pronto do Dia 1

| Item | Situação |
|---|---|
| `npm run build`, `npm run lint`, `npm test` sem erros | Ok (6 testes de data) |
| Banco com 5 tabelas, RLS e políticas | Ok |
| Login local e no site publicado | Ok |
| Rotas protegidas redirecionam para o login | Ok |
| Navegação no celular (barra inferior) e desktop (barra lateral) | Ok, confirmado pelo Guga no celular e no computador |
| Diagnóstico cria, lê e apaga registro de teste | Ok, 7 de 7 local e em produção |
| Deploy automático a cada push na `main` | Ok |
| `CLAUDE.md` atualizado | Ok |

Não verificado explicitamente:
- As consultas de conferência da etapa 2.3 (contagem das 16 políticas) e o Security Advisor não foram rodados. No lugar: sem login a API devolve lista vazia e recusa insert (erro 42501), e o diagnóstico passou com login.
- Mensagem de senha errada, sessão mantida ao recarregar e botão "Sair" não tiveram confirmação item a item (o Guga reportou "deu tudo certo" de forma geral).

## Versões instaladas

| Pacote | Versão |
|---|---|
| Node (local) | 24.16 (o workflow usa Node 22) |
| vite | 8.3 |
| react / react-dom | 19.2 |
| react-router-dom | 7.18 |
| @supabase/supabase-js | 2.117 |
| typescript | 6.0 |
| vitest | 5.0 |
| oxlint | 1.81 |

Ainda **não** instalados (previstos na stack): `recharts`, `vite-plugin-pwa`.

## Estrutura atual

```
mast/
├── CLAUDE.md
├── docs/plano-dia-1.md, docs/resumo-dia-1.md
├── .env.example            (.env.local existe só no Mac, ignorado pelo git)
├── .github/workflows/deploy.yml
├── .oxlintrc.json
├── index.html
├── public/favicon.svg
├── supabase/migrations/0001_init.sql
├── src/
│   ├── main.tsx            importa styles/global.css
│   ├── App.tsx             rotas (HashRouter)
│   ├── vite-env.d.ts
│   ├── lib/supabase.ts, dates.ts, dates.test.ts, types.ts
│   ├── auth/AuthProvider.tsx, RequireAuth.tsx
│   ├── components/Layout.tsx, Nav.tsx, PageHeader.tsx, icons.tsx
│   ├── pages/Login.tsx, Today.tsx, Objectives.tsx, Goals.tsx,
│   │         Journal.tsx, Progress.tsx, Diagnostics.tsx
│   └── styles/tokens.css, global.css
└── vite.config.ts          base '/mast/', vitest environment 'node'
```

## O que o Dia 2 já pode usar

### Banco
A migração `0001_init.sql` foi aplicada exatamente como no plano do Dia 1: tabelas `objectives`, `objective_logs`, `goals`, `journal_entries`, `verses`; funções `today_sp()` e `set_updated_at()`; 16 políticas RLS. `verses` está vazia.

Pontos que afetam o código do Dia 2:
- `user_id` tem `default auth.uid()`: **não enviar `user_id` nos inserts**.
- `objective_logs` não tem política de update: um log é criado ou apagado.
- `unique (objective_id, log_date)`: marcar duas vezes o mesmo dia dá erro `23505`.
- `objectives` tem check de consistência entre `schedule`, `once_date` e `weekdays` (`once` exige `once_date` e `weekdays` nulo; `daily` exige os dois nulos; `weekdays` exige array de 1 a 7 valores entre 0 e 6).
- `goals`: `numeric` exige `target_value > 0`; `percent` exige `current_value <= 100`.
- Qualquer mudança de schema entra como `supabase/migrations/0002_*.sql` e o Guga roda no SQL Editor (colar e clicar em Run).

### `src/lib/types.ts`
`Polarity`, `Weight` (10 | 20 | 30), `Schedule`, `Objective`, `ObjectiveLog`, `GoalStatus`, `ProgressType`, `Goal`, `JournalEntry`, `Verse`. Datas são strings `'YYYY-MM-DD'`.

O cliente Supabase **não** é tipado com um `Database` gerado; os retornos são convertidos com `as Objective` etc.

### `src/lib/dates.ts` (com testes)
`TZ`, `todayISO(now?)`, `currentHourSP(now?)`, `parseISODate(iso)`, `toISODate(date)`, `addDays(iso, n)`, `weekday(iso)` (0 = domingo), `dayOfYear(iso)`, `formatLong(iso)`, `greeting(now?)`.

Ainda não existe função de formato curto de data (ex.: "6 out") nem de intervalo de datas; o Dia 2 vai precisar para navegar entre dias e para sequências.

### Autenticação
`useAuth()` devolve `{ session, user, loading, signIn, signOut }`. `RequireAuth` protege as rotas. `supabase` é exportado de `src/lib/supabase.ts`.

### Rotas (`src/App.tsx`)
`/login`, `/` (Hoje), `/objetivos`, `/metas`, `/journal`, `/progresso`, `/diagnostico` (temporária, sem item no menu), `*` redireciona para `/`.

### Componentes
- `PageHeader({ eyebrow?, title, subtitle?, action? })`. A prop `action` foi acrescentada para o botão "Sair" do celular na tela Hoje.
- `Layout` (Nav + `<main class="content">` com `<Outlet />`) e `Nav` (um único `<nav>` que vira barra lateral a partir de 900px).
- `icons.tsx`: `Logo({ size })`, `SunIcon`, `CheckIcon`, `TargetIcon`, `JournalIcon`, `ChartIcon`. Faltam ícones de ação para o Dia 2 (mais, editar, arquivar, lixeira, setas, chama/sequência).

### Estilos
Tudo em `src/styles/global.css` (mais `tokens.css`); não há CSS por componente. Classes existentes:

- Utilitárias: `.card`, `.card-ink`, `.btn`, `.btn-primary`, `.btn-ghost`, `.btn-text`, `.field`, `.mono`, `.muted`, `.only-mobile`
- Página: `.page-header`, `.eyebrow`, `.page-subtitle`, `.content`
- Navegação: `.nav`, `.nav-brand`, `.nav-list`, `.nav-link`, `.nav-footer`, `.nav-email`
- Login e carregamento: `.login*`, `.form-error`, `.splash`
- Hoje (provisório): `.score-label`, `.score-value`
- Diagnóstico (temporário): `.check-list`, `.check`, `.check-detail`, `.status*`

`.field` só estiliza `input`. O Dia 2 vai precisar de estilos para `select`, `textarea`, grupos de opção (peso, dias da semana), lista de itens marcáveis, barra de progresso e modal ou painel de formulário.

Inputs usam `font-size: 16px` para o iOS não dar zoom ao focar.

### Páginas
Hoje mostra data, saudação e um card escuro com "Pontuação do dia —". Objetivos, Metas, Journal e Progresso mostram só o título e um card "Em construção". Nenhuma lógica de negócio foi escrita.

## Diferenças em relação ao plano do Dia 1

1. **Oxlint no lugar do ESLint.** É o padrão atual do template `react-ts` do Vite. `npm run lint` funciona igual. Regras ativas: `react/rules-of-hooks` (erro) e `react/only-export-components` (aviso).
2. **Actions mais novas no workflow:** checkout v7, setup-node v7, configure-pages v6, upload-pages-artifact v5, deploy-pages v5.
3. **Favicon:** o `index.html` usa `href="/favicon.svg"`. O Vite acrescenta o `/mast/` sozinho em dev e no build. `/mast/favicon.svg` e `%BASE_URL%favicon.svg` geravam `/mast/mast/favicon.svg` em dev.
4. **`vite.config.ts`** tem `/// <reference types="vitest/config" />` no topo.
5. **`.gitignore`** também ignora `.claude/`.
6. **Template do Vite mudou:** não existe mais `public/vite.svg`; vieram `public/icons.svg` e `src/assets/hero.png`, que foram apagados junto com `App.css`, `index.css` e o `README.md` de exemplo.

## Como o trabalho funciona neste Mac

Isto muda a forma de escrever os próximos planos:

- **O Claude Code não consegue fazer `git push`.** O git do terminal não tem credenciais do GitHub. O Claude Code faz os commits locais e o **Guga clica em "Push origin" no GitHub Desktop**. Nos planos, as etapas de publicação devem ser "[CLAUDE CODE] commit" seguido de "[GUGA] Push origin no GitHub Desktop".
- Não há Homebrew nem `gh`. O instalador `.pkg` do GitHub CLI é bloqueado pelo macOS; não vale insistir nesse caminho.
- O Claude Code acompanha o deploy pela API pública do GitHub (o repositório é público) e consegue abrir o site publicado para conferir a tela de login, mas **não consegue fazer login** (não digita a senha do Guga). Testes de telas logadas dependem do Guga, de preferência com foto da tela.
- O autor dos commits está configurado só neste repositório, com o e-mail noreply do GitHub.
- Teste local: `npm run dev` e abrir `http://localhost:5173/mast/` no navegador do Guga.
- O Guga não tem background técnico. Funcionou bem: **um passo manual por vez**, esperando o "feito"; abrir arquivos e páginas por ele; copiar SQL para a área de transferência; conferir pelo terminal o que ele fez em vez de pedir que ele confira. Uma lista com quatro partes de uma vez gerou confusão.
- O tempo do Guga no Dia 1 passou bastante da estimativa de 1 hora, quase todo na autorização do GitHub. Isso não se repete: o Dia 2 só deve exigir dele o "Push origin" e os testes.

## Pontos para o plano do Dia 2

Escopo previsto no cronograma: objetivos, registros, pontuação, sequências e metas.

- **Regras puras primeiro, com testes.** Programação de um objetivo para um dia D, pontuação do dia e sequências são funções sem banco. Sugestão: `src/lib/schedule.ts`, `scoring.ts` e `streaks.ts`, cada um com `*.test.ts`, usando os tipos e as funções de data que já existem. O `npm test` roda no deploy, então um teste quebrado bloqueia a publicação.
- **Definições que o plano precisa fixar:**
  - "Já existia em D": usar `starts_on <= D`. Objetivo arquivado conta até qual dia (sugestão: dias anteriores à data local de `archived_at`)?
  - Recorde histórico: calcular a partir dos logs a cada carga (mais simples, sem coluna nova) ou guardar em coluna (exige migração)?
  - Janela de logs a carregar para sequência e recorde (tudo, ou os últimos N dias).
  - Edição de peso ou recorrência arquiva e cria outro objetivo: a sequência recomeça do zero no novo? O `CLAUDE.md` não diz.
  - Excluir objetivo apaga os logs em cascata e muda a pontuação passada; arquivar preserva. A UI deve deixar isso claro.
- **Camada de dados.** Ainda não existe. Definir se cada página chama o `supabase` direto ou se há funções em `src/lib/` (ex.: `objectives.ts`, `goals.ts`). Não há biblioteca de cache de dados instalada, e o princípio do projeto é não adicionar dependência sem necessidade.
- **Formulários.** Não há componente de formulário nem modal. Vale decidir um padrão único (modal ou painel) para objetivo avulso, objetivo recorrente e meta.
- **Diagnóstico.** A página continua disponível e pode ganhar verificações novas se o Dia 2 mexer no schema. Sai na sexta.
- **Itens de sexta que dependem de coisas externas:** seed dos 30 versículos (arquivo SQL escrito à parte), `recharts` e `vite-plugin-pwa`.

## Commits do Dia 1

```
6960dce docs: update status after day 1
c0d2d77 fix: favicon path resolves under the /mast/ base in dev and build
f1a15bc ci: github pages deploy workflow
668a743 feat: temporary diagnostics page
16bd1c0 feat: layout, navigation and placeholder pages
f19362f feat: supabase client, auth provider and login
ee00a60 feat: date helpers pinned to Sao Paulo timezone
752478e feat(db): initial schema with row level security
82499fb chore: scaffold vite react-ts project
```
