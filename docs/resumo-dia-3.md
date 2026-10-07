# Mast — Resumo do Dia 3 (versão 1 completa)

> Documento de passagem. O plano seguido está em `docs/plano-dia-3.md`.

## Resumo — Dia 3

**Concluído:**
- Sessão feita em 6/10/2026, no mesmo dia da fundação e do núcleo. **A versão 1 está completa e em uso**, três dias antes da meta (9/10).
- **Versículos:** 30 entradas gravadas no banco (`0003_verses_seed.sql`), com os acentos conferidos por consulta.
- **Diagnóstico removido:** página, rota e estilos.
- **Ajustes do núcleo:** restaurar no mesmo dia mantém a marcação; a chama só aparece no dia de hoje; o aviso de mudança fica fixo no rodapé do formulário.
- **Versículo do dia** na tela Hoje, recolhível por dia, com "Responder no journal".
- **Journal:** lista por mês e editor de página inteira com salvamento automático, salvamento imediato ao sair e rascunho local de segurança.
- **Progresso:** indicadores, gráfico do saldo diário (7, 30 e 90 dias, com média móvel de 7 dias), tabela alternativa e card Conta com a versão do app e o botão Sair.
- **PWA:** manifesto, ícones, service worker e aviso de nova versão.
- 87 testes passando (`npm test`); `npm run lint` e `npm run build` sem erros.
- **Confirmado pelo Guga no iPhone:** versículo do dia (com foto); recolher, recarregar e ver o de ontem; responder a pergunta no journal e ver "Salvo às…" (com foto); a entrada na lista; editar e sair imediatamente sem perder a mudança; arquivar e restaurar mantendo a marcação; instalação pela tela inicial; app em tela cheia, sem sobrepor relógio nem barra de início (com foto); tela Progresso com a versão (com foto); e o **teste de atualização**: depois de um novo deploy, o aviso apareceu e o app passou para a versão nova.
- **Rotina real:** dados de teste limpos e rotina cadastrada pelo Guga.
- `CLAUDE.md` atualizado: stack, escopo concluído, regras de versículo, journal e progresso, telas, tokens, backlog, status e decisões.

**Pendente / não concluído:**
- **Nenhuma meta de longo prazo cadastrada.** O plano pedia pelo menos uma; o Guga preferiu deixar para depois.
- Marcar, à noite, o dia de hoje como ele realmente foi (etapa 10.5), a cargo do Guga.
- O Guga confirmou a instalação com "deu certo", sem a foto da tela inicial com o ícone.
- **Não testado em aparelho:** queda de conexão no journal e recuperação de rascunho; excluir uma entrada do journal; a janela de detalhes ao tocar numa barra do gráfico; o gráfico com vários dias (só existe o dia de hoje, parcial); a virada da meia-noite com o app aberto. Os três primeiros foram testados na prévia local.
- **Não testado em lugar nenhum além do iPhone:** o registro do service worker. O navegador embutido do Claude Code não aceita service worker; a conferência daqui foi pela leitura do arquivo gerado.
- Aviso do Security Advisor "Leaked Password Protection Disabled" continua aberto (exige plano pago); foi para o backlog.

**Problemas encontrados e como foram resolvidos:**
- **Acentos corrompidos ao copiar SQL.** O `pbcopy` deste Mac, sem `LANG` definido, enviou o texto na codificação errada, e os 30 versículos foram gravados com "cora√ß√£o" no lugar de "coração". Resolvido copiando com `LANG=en_US.UTF-8 LC_ALL=en_US.UTF-8 pbcopy`, rodando o script de novo (ele atualiza pelo `position`) e conferindo três versículos por consulta. O mesmo defeito existiu nos Dias 1 e 2: nos scripts de banco não teve efeito, porque só havia acentos em comentários, mas **os resumos dos Dias 1 e 2 colados no Claude chat chegaram com os acentos embaralhados**. A regra nova está registrada no `CLAUDE.md`.
- **O arquivo de versículos não estava no projeto.** O plano dizia que ele vinha junto, mas não tinha sido baixado. O Guga colou o conteúdo no chat e ele foi salvo sem alteração (30 entradas, posições 1 a 30).
- **Pedido de acesso à pasta Downloads.** A sessão foi reiniciada no meio e o Guga perguntou por que o acesso tinha sido pedido. O motivo provável era procurar esse arquivo. Não foi necessário: uma busca só por nome mostrou que o arquivo não existia no Mac.
- **Texto do status "Sem conexão" saía cinza, não vermelho**, por ordem das regras no CSS. Corrigido.
- **O botão "Responder no journal" saía azul** (cor padrão de link). Corrigido dando cor explícita a `.btn-ghost`, com ajuste no "Sair" da barra lateral escura.

**Decisões tomadas fora do plano:**
- **"Sair" só saiu da tela Hoje junto com a tela Progresso** (o plano pedia na etapa 2). Assim nunca houve uma versão publicada sem como sair pelo celular.
- **Abrir uma entrada existente do journal não dá foco automático** (o plano pedia foco no fim do texto). No celular, o teclado subiria toda vez que ele fosse só reler. Entrada nova continua com foco no corpo.
- **O título do journal é um campo que quebra linha**, não um `input` de linha única: a pergunta do versículo como título não cabia numa linha a 26px.
- **Campo de data do journal com fonte de 16px** (o plano dizia 14px), para o iPhone não dar zoom ao tocar.
- **Rascunho local gravado também quando o app vai para segundo plano**, não só em falha: no iPhone a requisição pode ser cortada nesse momento.
- **Status a mais no editor:** "Salvo em 3 set" quando o salvamento foi em outro dia, e "Não foi possível salvar · rascunho guardado neste aparelho" para erros que não são de conexão.
- **Uma rota só para o editor** (`/journal/:id`, com `novo` como caso especial) e `editorKey` no estado da navegação, para a mesma instância continuar depois do primeiro salvamento.
- **Autosave como função pura** em `src/lib/autosaver.ts`, com os testes ali, em vez de um hook `useAutosave`.
- **`VersesProvider` contém o provider e o hook** (não há `useVerses.ts` separado), e o `VerseCard` não recebe `today`.
- **Gráfico:** contorno branco sob a linha da média, para ela não se confundir com as barras; as cores são os tokens da marca, embora o validador de paleta acuse o verde como pouco saturado (a posição da barra e o sinal também indicam a polaridade).
- **Rodapé do Sheet reestruturado** em `.sheet-notice` e `.sheet-actions`, nos formulários de objetivo e de meta.
- **Prévia local ampliada:** 3 versículos reais, 4 entradas de journal, 45 dias de histórico e o interruptor `__mastMock.failWrites`.

**Tamanho do build:**

| Arquivo | Fim do Dia 2 | Antes do gráfico | Fim do Dia 3 |
|---|---|---|---|
| Principal (`index-*.js`) | 525 kB (151 kB comprimido) | 534 kB (154 kB) | 537 kB (155 kB) |
| Tela Progresso (`Progress-*.js`) | — | — | 386 kB (111 kB) |
| CSS | 15 kB (3,9 kB) | 19 kB (4,6 kB) | 22 kB (5,1 kB) |

O Recharts ficou inteiro no arquivo da tela Progresso, baixado só quando ela é aberta; o arquivo principal cresceu 3 kB com o gráfico. O service worker guarda 20 arquivos (934 kB), incluindo o da tela Progresso, então o gráfico abre mesmo sem rede depois da primeira visita.

**Estado da rotina real do Guga:**
- 6 objetivos de fazer e 1 hábito a evitar (o plano recomendava começar com no máximo 5 de fazer; a escolha foi dele).
- Nenhuma meta de longo prazo por enquanto.
- 1 entrada no journal, escrita durante o teste da pergunta do versículo.

**Pontos para a versão 2:**
- **Primeira semana de uso é o melhor teste.** Vale observar: se marcar o dia leva menos de 2 minutos; se o card do versículo, expandido, empurra demais o resumo do dia para baixo no celular; e como o gráfico e os indicadores ficam a partir do segundo dia.
- **Meia-noite:** o que ficar sem marcar desconta metade do peso. Com 6 objetivos, um dia esquecido pesa; pode valer um lembrete (está no backlog como notificações) ou "passar pendências para o dia seguinte".
- **Tamanho do arquivo principal:** 537 kB, a maior parte do cliente do Supabase. Dá para dividir, se o carregamento no celular incomodar.
- **Service worker sem teste automático:** hoje só o iPhone prova que ele funciona. Um teste simples em navegador real antes de cada mudança no PWA evitaria depender do aparelho.
- **Pequenas arestas conhecidas:** a lista do journal não se atualiza sozinha se um salvamento terminar depois de voltar para ela; as chaves `mast:verse-collapsed:{data}` se acumulam no aparelho (uma por dia recolhido); o `icon-source.svg` é publicado junto, sem necessidade; no app instalado, o conteúdo passa por baixo do relógio ao rolar.
- **Backlog atualizado no `CLAUDE.md`:** reordenar objetivos, sequência "como estava naquele dia", modo escuro, versículos 31 a 365, busca no journal, proteção contra senhas vazadas, além dos itens que já estavam lá.
- **Forma de trabalho:** um passo manual por vez, prévia local antes de cada push, push pelo GitHub Desktop e acompanhamento do deploy pela API pública continuaram funcionando bem. O ponto novo é copiar sempre com a codificação certa.

## Commits do Dia 3

```
chore: remove temporary diagnostics page
fix: keep today's log on restore, hide past-day streaks, sticky edit notice
feat: verse of the day card on today screen
feat: journal list and autosaving editor
feat(db): seed first 30 daily verses
chore: preview uses real sample verses
feat: show app version and build time
feat: progress screen with daily balance chart and summary
feat: installable PWA with update prompt
chore: verify pwa update flow
docs: update CLAUDE.md after day 3 (v1 complete)
```
