# Mast — documento do projeto

Este arquivo descreve o projeto inteiro. Leia antes de qualquer tarefa e mantenha a seção **Status** atualizada ao fim de cada sessão.

## 1. O que é o Mast

Um app pessoal (um único usuário: Guga) para organizar objetivos diários, hábitos e metas de longo prazo, com foco em disciplina, formação de bons hábitos e desenvolvimento pessoal e espiritual.

O nome vem do mastro de Ulisses: ele se amarrou ao mastro antes de ouvir as sereias, ou seja, se comprometeu antes da tentação aparecer. O app cumpre esse papel.

## 2. Princípios

- **Custo zero.** Nenhum serviço pago e nenhuma API paga. Só planos gratuitos do GitHub e do Supabase.
- **Uso pessoal.** Um usuário. Sem cadastro público, sem multi-tenant além do que o RLS já garante.
- **Mobile-first.** O uso principal é no celular, instalado como PWA. Precisa funcionar bem também no desktop.
- **Simples antes de completo.** Na dúvida, a solução mais simples que funciona. Nada de abstração prematura.
- **Rápido de usar.** Marcar o dia deve levar menos de 2 minutos.

## 3. Stack

| Camada | Escolha |
|---|---|
| Front-end | React + Vite + TypeScript |
| Estilo | CSS com variáveis (tokens na seção 8). Sem framework de UI pesado |
| Roteamento | React Router com `HashRouter` (GitHub Pages não suporta rotas do lado do servidor) |
| Banco e login | Supabase (Postgres + Auth + Row Level Security) via `@supabase/supabase-js` |
| Gráficos | Recharts |
| Datas | Funções próprias em `src/lib/dates.ts` (Intl API). Fuso fixo `America/Sao_Paulo`. O "dia" sempre é a data local, nunca UTC |
| PWA | `vite-plugin-pwa` (manifest, ícones, service worker) |
| Deploy | GitHub Pages via GitHub Actions, a cada push na `main` |

Variáveis de ambiente: `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`. Ficam em `.env.local` (nunca commitado) e como secrets do repositório para o workflow. A anon key é pública por natureza; a segurança vem do RLS. **Nunca** usar nem commitar a `service_role` key.

`vite.config.ts` precisa de `base: '/mast/'` (nome do repositório).

## 4. Escopo da versão 1 (meta: sexta, 9 de outubro)

1. Login com e-mail e senha (Supabase Auth). Depois de criar a conta do Guga, desativar novos cadastros no painel do Supabase.
2. Objetivos positivos:
   - **Avulsos:** valem só para uma data específica (definidos no começo do dia).
   - **Recorrentes:** todos os dias ou em dias específicos da semana.
3. Hábitos negativos (coisas a evitar), com as mesmas opções de recorrência.
4. Marcar objetivo positivo como feito / desfazer; marcar hábito negativo como "ocorreu" / desfazer.
5. Peso por objetivo e pontuação diária (regras na seção 5).
6. Sequência atual e recorde por objetivo recorrente.
7. Gráfico do saldo diário de pontos ao longo do tempo (7, 30 e 90 dias).
8. Metas de longo prazo em aba própria, com prazo e progresso.
9. Journal livre: criar, listar, editar e excluir entradas.
10. Versículo do dia, com reflexão e pergunta de aplicação (30 entradas na v1).
11. Editar, arquivar e excluir objetivos e metas.
12. PWA instalável no celular.

Fora da v1 (backlog na seção 10). Não implementar nada fora desta lista sem confirmação.

## 5. Regras de negócio

### Pesos
Cada objetivo (positivo ou negativo) tem peso **baixo, médio ou alto = 10, 20 ou 30 pontos**.

### Quando um objetivo vale para um dia D
- **Avulso (`once`):** só se `once_date = D`.
- **Diário (`daily`):** se `starts_on ≤ D`.
- **Dias da semana (`weekdays`):** se `starts_on ≤ D` e o dia da semana de D está em `weekdays`.
- **Arquivado:** deixa de valer a partir da data local (São Paulo) de `archived_at`, inclusive. Conta até o dia anterior ao arquivamento.

Implementação: `src/lib/schedule.ts` (`isScheduledOn`, `objectivesForDay`).

### Pontuação de um dia
| Situação | Pontos |
|---|---|
| Positivo feito | **+peso** |
| Positivo não feito, em dia já encerrado | **−peso ÷ 2** (10 → −5, 20 → −10, 30 → −15) |
| Positivo não feito, no dia corrente | 0 (ainda não desconta) |
| Negativo que ocorreu | **−peso** |
| Negativo que não ocorreu | 0 |

- **Saldo** = ganhos − perdas.
- **Máximo possível** = soma dos pesos dos positivos programados.
- **Aproveitamento (%)** = ganhos ÷ máximo possível, arredondado. Se o máximo for 0, mostrar "—".
- A razão do desconto é a constante `MISSED_PENALTY_RATIO = 0.5` em `src/lib/scoring.ts`.

Tudo é calculado a partir dos registros; não existe job de fechamento do dia.

### Linhagem (editar sem perder a sequência)
- Cada objetivo tem `lineage_id`. Todas as versões de um mesmo objetivo compartilham a linhagem.
- **Editar só o título:** `update` direto na versão atual.
- **Editar peso, frequência ou dias:** a versão atual é arquivada e uma nova é criada com `starts_on = hoje` e a mesma linhagem, numa única operação no banco (função `replace_objective`). O registro de hoje, se houver, passa para a nova versão. O passado continua valendo com o peso antigo.
- **O tipo (Fazer / Evitar) não pode ser alterado** depois de criado.
- **Excluir** apaga a linhagem inteira, com todos os registros, e muda pontuações passadas. **Arquivar** é a ação padrão e preserva tudo.
- **Restaurar** um arquivado cria uma nova versão na mesma linhagem, começando hoje. Os dias em que ficou arquivado não contam nem quebram a sequência.
- Avulsos não têm versões: editar título ou peso altera direto.

### Sequências
Calculadas **por linhagem recorrente** (avulsos não têm sequência), em `src/lib/streaks.ts`. Percorre os dias do primeiro `starts_on` da linhagem até hoje e, em cada dia, procura a versão programada:
- Nenhuma versão programada: ignora o dia (não soma, não quebra).
- **Positivo:** feito → soma 1. Não feito em dia encerrado → zera. Não feito hoje → neutro.
- **Negativo:** ocorreu → zera (inclusive hoje). Não ocorreu em dia encerrado → soma 1. Hoje sem ocorrência → neutro.
- **Sequência atual** = contagem ao final; **recorde** = maior contagem atingida. O recorde não é guardado: é recalculado a partir dos registros.

### Carregamento
Ao entrar, o app carrega **todos** os objetivos (inclusive arquivados) e **todos** os registros, paginando de 1.000 em 1.000. Sem o histórico inteiro, sequências e recordes ficariam errados.

### Metas
Campos: título, motivo (opcional, texto curto), prazo (opcional), tipo de progresso:
- **Numérico:** valor atual e valor alvo, com unidade (ex.: 17 de 24 livros).
- **Percentual:** 0–100, atualizado à mão.
Status: ativa, concluída ou arquivada.

### Versículo do dia
- Tabela `verses` com campo `position` (1..N).
- Versículo exibido = `position = ((diaDoAno − 1) mod N) + 1`. Assim funciona com 30 entradas e com 365.
- Tradução: Almeida Revista e Corrigida (edição de domínio público).
- O conteúdo dos versículos é escrito à parte (Claude chat) e entregue como arquivo SQL de seed.

## 6. Modelo de dados (Supabase / Postgres)

Todas as tabelas com dados do usuário têm `user_id uuid not null default auth.uid() references auth.users`, RLS ativado e políticas de select/insert/update/delete restritas a `auth.uid() = user_id`.

```sql
objectives (
  id uuid pk default gen_random_uuid(),
  user_id uuid,
  title text not null,
  polarity text not null check (polarity in ('positive','negative')),
  weight smallint not null check (weight in (10,20,30)),
  schedule text not null check (schedule in ('once','daily','weekdays')),
  weekdays smallint[],            -- 0=domingo..6=sábado; obrigatório se schedule='weekdays'
  once_date date,                 -- obrigatório se schedule='once'
  starts_on date not null default current_date,
  archived_at timestamptz,
  sort_order int default 0,
  created_at timestamptz default now(),
  lineage_id uuid not null default gen_random_uuid()   -- versões do mesmo objetivo
)

objective_logs (
  id uuid pk default gen_random_uuid(),
  user_id uuid,
  objective_id uuid not null references objectives on delete cascade,
  log_date date not null,
  created_at timestamptz default now(),
  unique (objective_id, log_date)
)
-- Existência do registro = positivo feito OU negativo ocorrido naquela data.

goals (
  id uuid pk default gen_random_uuid(),
  user_id uuid,
  title text not null,
  why text,
  due_date date,
  progress_type text not null check (progress_type in ('numeric','percent')),
  current_value numeric default 0,
  target_value numeric,
  unit text,
  status text not null default 'active' check (status in ('active','done','archived')),
  created_at timestamptz default now()
)

journal_entries (
  id uuid pk default gen_random_uuid(),
  user_id uuid,
  entry_date date not null default current_date,
  title text,
  body text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
)

verses (
  id serial pk,
  position int unique not null,
  reference text not null,
  text text not null,
  reflection text not null,
  question text not null,
  theme text
)
-- Sem user_id. RLS: leitura para usuários autenticados; sem escrita pelo app.
```

Função `replace_objective(p_old_id, p_title, p_weight, p_schedule, p_weekdays, p_once_date)`: arquiva a versão atual e cria a nova na mesma linhagem, movendo o registro de hoje. `security invoker` (o RLS continua valendo); só `authenticated` pode executar.

Migrações aplicadas: `0001_init.sql`, `0002_lineage.sql`.

Migrações SQL ficam versionadas em `supabase/migrations/` (arquivos numerados) e são executadas no SQL Editor do Supabase.

## 7. Telas

Navegação: barra inferior no celular, barra lateral no desktop.

- **Hoje:** data, versículo do dia (recolhível), resumo do dia (saldo, aproveitamento), lista de objetivos positivos do dia, lista de hábitos negativos do dia, botão para adicionar objetivo avulso. Permitir navegar para dias anteriores e corrigir registros.
- **Objetivos:** gerenciar objetivos recorrentes e hábitos negativos (criar, editar, arquivar), com sequência atual e recorde.
- **Metas:** lista de metas com barra de progresso; criar e editar.
- **Journal:** lista por data; editor de texto simples.
- **Progresso:** gráfico de saldo diário (7/30/90 dias) e média do período.
- **Login.**

## 8. Direção visual

Base no mockup aprovado: claro, sóbrio, editorial, com destaque em verde.

| Token | Valor |
|---|---|
| `--bg` | `#EEF0EC` |
| `--surface` | `#FFFFFF` |
| `--ink` (texto e blocos escuros) | `#121614` |
| `--muted` (texto secundário) | `#5A635E` |
| `--line` | `#DCE0DB` |
| `--accent` | `#1E6B47` |
| `--accent-bright` (sobre fundo escuro) | `#7FD1A3` |
| `--streak` (sequências) | `#A04D0C` |
| `--negative` | `#B3261E` |

- Tipografia (Google Fonts): **Space Grotesk** para títulos, **IBM Plex Sans** para texto, **JetBrains Mono** para números (pontos, sequências, percentuais).
- Cards brancos com borda `--line`, raio 16–18px. Cartão de resumo do dia em fundo `--ink`.
- Ícones em SVG de traço simples. Sem emoji.
- Alvos de toque de no mínimo 44px. Contraste mínimo 4.5:1. Botões reais (`<button>`), labels em inputs.
- Interface inteira em português do Brasil. Código, nomes de variáveis e commits em inglês.

## 9. Convenções de trabalho

- Commits pequenos e descritivos. Push na `main` dispara o deploy.
- Não adicionar dependências sem necessidade clara.
- Nunca commitar `.env.local` nem segredos.
- Quando uma decisão não estiver coberta aqui, escolher a opção mais simples, registrar em **Decisões** e seguir; perguntar só se a escolha mudar o escopo.
- Ao fim de cada sessão: atualizar **Status** e entregar um resumo curto (o que foi feito, o que ficou pendente, problemas encontrados) para o Guga repassar ao planejamento.

## 10. Backlog (versão 2 em diante)

Revisão semanal guiada; marcos intermediários das metas; vincular objetivos a metas; áreas da vida; pausar hábito sem perder sequência; objetivos com frequência "X vezes por semana"; objetivos quantitativos; passar pendências para o dia seguinte; registro de energia/humor e nota curta do dia; busca no journal; versículos favoritos; 365 versículos; estatísticas detalhadas (heatmap, taxa por objetivo, dias mais fortes); exportar dados; lembretes/notificações.

## 11. Cronograma

| Dia | Entrega |
|---|---|
| Ter 6/10 | Preparação: repositório `mast` no GitHub, projeto no Supabase, Claude Code instalado |
| Qua 7/10 | Fundação: banco + RLS, login, estrutura do app, deploy vazio funcionando no GitHub Pages |
| Qui 8/10 | Núcleo: objetivos, registros, pontuação, sequências, metas |
| Sex 9/10 | Journal, versículo do dia, gráfico, PWA, teste real no celular |

Um plano detalhado de cada dia será entregue separadamente.

## Status

- [x] Ter 6/10 — preparação
- [x] Qua 7/10 — fundação (concluída em 6/10; site no ar em https://gugabites.github.io/mast/)
- [x] Qui 8/10 — núcleo (concluído em 6/10: objetivos, registros, pontuação, sequências e metas no ar)
- [ ] Sex 9/10 — completar e colocar em uso

## Decisões

- 2026-10-06: Pesos 10/20/30; positivo não feito desconta o peso inteiro após o fim do dia.
- 2026-10-06: Editar peso/recorrência arquiva o objetivo e cria outro, para preservar o histórico.
- 2026-10-06: Sem `date-fns`: datas com `Intl` e strings `'YYYY-MM-DD'`, fuso de São Paulo.
- 2026-10-06: Conta única criada pelo painel do Supabase; novos cadastros desativados; o app não tem tela de cadastro.
- 2026-10-06: Página `/diagnostico` temporária, a remover na sexta.
- 2026-10-06: Lint com Oxlint (padrão atual do template do Vite), não ESLint. `npm run lint` continua valendo.
- 2026-10-06: Todos os estilos ficam em `src/styles/global.css` (mais `tokens.css`), sem CSS por componente.
- 2026-10-06: O push é feito pelo Guga no GitHub Desktop (botão "Push origin"). O Claude Code só faz commits locais, porque o git do terminal não tem credenciais do GitHub neste Mac.
- 2026-10-06: Autor dos commits configurado só neste repositório, com o e-mail noreply do GitHub (repositório público).
- 2026-10-06: Teste local em `http://localhost:5173/mast/` (`npm run dev`).
- 2026-10-06: Positivo não feito desconta **metade** do peso após o fim do dia (`MISSED_PENALTY_RATIO = 0.5`). Substitui a decisão anterior de descontar o peso inteiro.
- 2026-10-06: Linhagem de objetivos (`lineage_id` + `replace_objective`) para preservar histórico e sequência em edições. Substitui "arquivar e criar outro" sem vínculo.
- 2026-10-06: Todos os registros são carregados na entrada, com paginação de 1.000.
- 2026-10-06: `TrackerProvider` (`src/data/`) compartilha objetivos e registros entre Hoje e Objetivos, com marcação otimista; metas usam o hook `useGoals`.
- 2026-10-06: As páginas não chamam o `supabase` direto: usam `src/lib/api/` (exceção: a página temporária de diagnóstico).
- 2026-10-06: Formulários sempre em `Sheet` (`<dialog>` nativo). O `Sheet` não tem prop `footer`: o formulário filho traz `.sheet-body` e `.sheet-footer`. Erros de salvamento aparecem dentro do formulário, porque um toast ficaria atrás do diálogo.
- 2026-10-06: O círculo de "Evitar" não marcado usa a mesma borda do quadrado de "Fazer" (`#9AA49E`), e não `--line`, que ficava quase invisível.
- 2026-10-06: Prévia local em `dev/preview.html` (`npm run dev` → `http://localhost:5173/mast/dev/preview.html`): roda o app real, já logado, contra um banco falso em memória. É como o Claude Code confere telas logadas sem a senha do Guga. Não entra no build.
- 2026-10-06: O recorde de sequência não tem coluna: é recalculado dos registros a cada carga.
