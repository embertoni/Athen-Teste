# 04.7: Origem tipada do livro, trava de escrita decimal e abertura de legado conservadora

Status: claimed

**Issue de equipe:** 42; sprint04; Em andamento. Branch `issue/42-origem-tipada-abertura`, derivada da sprint04 atualizada (`acfb9ea`, merge do PR #9). Fatia local do ticket 04 / Sessão 02 (F3 do ticket 04.5). Não é novo ID do YouTrack.

**Decisão de escopo (usuário, 01/11/2026):** recorte confirmado como F3 propriamente dita, **sem** a graduação-contra-snapshot. A investigação mostrou que redirecionar a graduação para o snapshot exigiria reescrever o finalizador legado em `athen_private` (quebra o invariante byte a byte) e só cobre a borda de edição por admin ou ciclo despublicar→editar→republicar, porque a RLS `questions_update` (0019) já congela questões de curso publicado. Esse item fica registrado para uma fatia própria, se o custo for aceito depois.

**Contexto do contrato:**
- `contratos.md` linha 29 (Livro de créditos) — "Origem tipada, beneficiário, destino e chave semântica obrigatórios | Base única por usuário/questão/contexto; bônus único por atribuição; **abertura/ajuste separados**".
- `contratos.md` (precisão) — "Saldo/projeção deve reconciliar com abertura e créditos válidos."
- `spec.md` linha 57 (Q081–Q084) — "Legado recebe **abertura auditada sem atividade fictícia**. Item incerto não recebe nova base até revisão... **Não inventar ordinais passados**."
- Ticket 04.5 F3 — "proteger saldo/nível/contadores decimais; só o finalizador escreve o livro; ajuste administrativo auditado."
- Ticket 04 — critério aberto: "Crédito novo usa chave semântica do contexto e livro compartilhado; compatibilidade antiga não mantém autoridade paralela. **Definir abertura de legado antes de ativar pagamento em dados preexistentes.**"

## O que construir

Uma migração nova (0029) que:

1. **Origem tipada** — `learning_credits.origin text not null default 'base'` com check `('base','bonus','opening','adjustment')`. Linhas existentes (todas base) recebem o default. A base continua a autoridade do finalizador; bônus/abertura/ajuste são origens distintas na mesma conta.
2. **Índices únicos revistos** — a unicidade de **base** passa a ser escopada por `origin = 'base'`: `(user_id, question_id) where room_id is null and origin='base'` e `(user_id, question_id, room_id) where room_id is not null and origin='base'`. Assim uma linha de abertura/ajuste/bônus no mesmo (usuário, questão, contexto) não colide com a base, mas a base continua única por contexto.
3. **Trava de escrita decimal** — `room_members`: `revoke all` + `grant select` + `grant update (status, removed_at)` ao `authenticated`, removendo a possibilidade de o cliente escrever `xp_internal`/`credits_internal`/`progress`/`pac_internal` diretamente (espelha a 0024 para perfis). `profiles.xp_credits` **já** está protegido pela 0024 (o grant de coluna não a inclui); registrar isso. O educador continua gerenciando `status`/`removed_at` por RLS; nenhum consumidor do cliente escreve métricas de sala hoje.
4. **Abertura de legado conservadora (variante a)** — função administrativa `public.open_legacy_credit(p_user_id, p_course_id, p_room_id, p_amount, p_note)` `SECURITY DEFINER`, só admin, que insere uma linha `origin='opening'` auditada por (usuário, contexto) e ajusta o saldo decimal correspondente, **uma vez por contexto** (unicidade de abertura). **Não** varre resultados legados, **não** fabrica crédito retroativo e **não** inventa ordinais (Q081–Q084). Estabelece a autoridade de abertura/ajuste sem ativar pagamento sobre dados preexistentes em massa. Ajuste administrativo (`origin='adjustment'`) fica como autoridade definida na mesma função/variante, auditado, sem apagar a origem nem tornar saldo negativo.
5. **Consumidor** — tipos TS regenerados (0001–0029); `creditoRepository` ganha leitura por origem se útil; sem redesenho visual.

## Ponto de teste (seams)

- `learning_credits.origin` e os índices: o finalizador continua gravando base única por contexto; uma segunda base no mesmo contexto é recusada; uma linha de `opening`/`adjustment` no mesmo contexto coexiste.
- `public.open_legacy_credit` via harness: só admin; grava `origin='opening'` e ajusta o saldo; unicidade da abertura por contexto; não fabrica ordinal; não recredita base; não torna saldo negativo.
- Trava de escrita: cliente `authenticated` não consegue `update room_members set credits_internal/xp_internal`; educador ainda atualiza `status`/`removed_at`; `profiles.xp_credits` segue inescrevível pelo cliente.
- Regressão: ordinal-credits, learning, first-submissions, start-attempt, lesson-versions, permissions, sanity, concurrency continuam verdes; cálculo inteiro legado inalterado; o finalizador público continua gravando a base.

**Minimização de testes (a pedido do usuário):** manter a prova central de origem tipada (base única por contexto × coexistência de abertura), da trava de escrita (recusa de coluna no cliente) e da abertura administrativa (admin-only, auditada, sem fabricar). Cortar apenas variações redundantes de autorização já cobertas por fatias anteriores.

## Critérios de conclusão

- [ ] `learning_credits.origin` existe com check e default `base`; linhas existentes permanecem `base`; os índices únicos de base são escopados por `origin='base'`.
- [ ] Segunda base no mesmo (usuário, questão, contexto) recusada; linha de `opening`/`adjustment` no mesmo contexto coexiste sem colidir.
- [ ] `room_members`: cliente não escreve `xp_internal`/`credits_internal`/`progress`/`pac_internal`; `status`/`removed_at` ainda gerenciáveis pelo educador; `profiles.xp_credits` segue protegido (0024).
- [ ] `open_legacy_credit` é admin-only (não-admin → 42501), grava `origin='opening'` auditada, ajusta o saldo decimal, é única por contexto e não torna saldo negativo; não fabrica ordinal nem recredita base.
- [ ] Pipeline, SQL focal e E2E aprovados; tipos regenerados 0001–0029; revisão em dois eixos (Padrões/Spec).

## Compatibilidade

Expandir por migração nova (0029). Colunas inteiras legadas e o finalizador legado em `athen_private` preservados. Sem ativar pagamento retroativo sobre dados preexistentes (variante conservadora). Graduação-contra-snapshot, bônus de concessão/afinidade, PAC/eficiência (Sessão 03), temporadas (04A) e missões (05) continuam fora. Sem SQL remoto, sem deploy.

## Autoria de IA

- Ferramenta: Kiro CLI.
- Escopo gerado por IA: migração 0029 (origem tipada, índices, trava de `room_members`, `open_legacy_credit`), teste SQL focal, tipos regenerados, consumidor, documentação.
- Revisado e validado localmente por: <responsável>.
