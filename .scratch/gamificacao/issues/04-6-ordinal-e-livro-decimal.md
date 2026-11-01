# 04.6: Ordinal histórico do primeiro envio e livro de créditos decimal

Status: claimed

**Issue de equipe:** 42; sprint04; Em andamento. Branch `issue/42-ordinal-primeiro-envio`, derivada da sprint04 atualizada (`c1c4840`, merge do PR #8). Fatia local do ticket 04 / Sessão 02 (núcleo do livro único de créditos). Não é novo ID do YouTrack.

**Decisão de escopo (usuário, 01/11/2026):** opção A para o ordinal — ordem oficial do **primeiro envio** (qualquer resposta, certa ou errada), não do primeiro acerto. A pedido do usuário, esta entrega foi **ampliada** para fechar o núcleo da Sessão 02 num só PR: o ordinal é a fundação, e o livro de créditos decimal (F2–F4 do ticket 04.5) é construído sobre ele na mesma entrega. "Quanto mais implementado antes de abrir o PR, melhor" — então ordinal + livro + saldo/nível decimal + consumidores entram juntos.

**Contexto do contrato:**
- `contratos.md` linha 26 — "Primeiro envio | único por execução/questão semântica; **ordem oficial persistida por usuário/questão/contexto** | Serializar concorrência antes de atribuir ordinal; abandono não apaga envio".
- `spec.md` linha 49 — crédito base único **proporcional ao ordinal**, quatro casas (base 4, ordinal 3 → 1,3333); `spec.md` linha 66 confirma o exemplo.
- `spec.md` linha 57 (Q081–Q084) — **não inventar ordinais passados**: envio legado com `first_submitted_at` nulo recebe ordinal nulo e não entra no livro.
- Ticket 04.5 — modelagem delegada A3: colunas decimais novas em paralelo (sem migrar integer→numeric), tabela-livro própria, autoridade única no finalizador público.

## O que construir

Uma migração nova (0028) que:

1. **Ordinal do primeiro envio** — `answers.first_submission_ordinal integer`. Atribuído em `save_attempt_answer`, na mesma serialização do lock da tentativa, como `1 + (quantos primeiros envios anteriores o mesmo usuário já tem para a mesma questão semântica no mesmo contexto curso/sala)`. Envio legado (`first_submitted_at` nulo) → ordinal nulo. Abandono não apaga o envio nem seu ordinal.
2. **Contexto semântico** — par (curso, sala): curso individual é um contexto, cada sala é outro, igual à unicidade de `completions`. Derivado da tentativa (`room_id` quando sala; senão curso).
3. **Livro de créditos** — `public.learning_credits`, `numeric(12,4)`, uma linha por crédito base concedido, chave semântica `(user_id, question_id, contexto, ordinal)` com **unicidade por contexto**. A mesma questão rende um crédito individual e um por sala autorizada; nunca repetido no mesmo contexto. Crédito base proporcional: `xp_value / ordinal`, arredondado uma vez a 4 casas.
4. **Saldo decimal** — `profiles.xp_credits numeric(12,4)` (vitalício individual) e `room_members.credits_internal numeric(12,4)` (sala). Colunas inteiras legadas (`xp_global`, `xp_internal`, `attempts.xp_earned`) preservadas intactas.
5. **Nível decimal** — `public.level_for_credits(numeric)` lê o saldo decimal preservando os limiares inteiros de `level_for_xp` (99,9999 → nível 1; 100 → nível 2).
6. **Autoridade única** — o livro e os saldos decimais são escritos somente pelo finalizador público `finalize_attempt`, na mesma transação do resultado imutável (0023/0027). O finalizador legado inteiro em `athen_private` permanece byte a byte. Reenvio/replay não recredita (idempotência do resultado persistido). Anti-regrind: questão já paga em contexto não recebe novo crédito base.
7. **Consumidores** — tipos TS regenerados (0001–0028); repositório expõe leitura do saldo decimal quando útil; sem redesenho visual.

## Ponto de teste (seams)

- `public.save_attempt_answer` via harness em transação revertida: atribuição do ordinal (1, 2, 3 entre tentativas distintas do mesmo usuário/questão/contexto), isolamento por contexto (curso vs sala), legado → ordinal nulo, reenvio não renova ordinal.
- `public.finalize_attempt` via harness: crédito base proporcional (`base/ordinal`, 4 casas), unicidade por contexto, saldo decimal acumulado, nível decimal, não-recredito no replay, anti-regrind.
- Regressão: start-attempt, learning, first-submissions, lesson-versions, permissions, sanity continuam verdes (cálculo inteiro legado inalterado).

**Minimização de testes (a pedido do usuário):** manter a prova do ordinal (atribuição/isolamento/legado/serialização) e do crédito (proporcional/unicidade/saldo/idempotência) como casos centrais. Cortar apenas variações de autorização de mínima importância já cobertas por fatias anteriores (ex.: repetir a recusa de conta inativa que `first-submissions.sql`/`start-attempt.sql` já exercem). Não remover a serialização nem a unicidade entre tentativas.

## Critérios de conclusão

- [ ] `save_attempt_answer` grava `first_submission_ordinal` começando em 1 e incrementando por (usuário, questão, contexto) entre tentativas distintas; contexto curso e sala são independentes.
- [ ] Reenvio da mesma tentativa/questão devolve a mesma linha e o mesmo ordinal, sem renovar.
- [ ] Envio legado conhecido (`first_submitted_at` nulo) permanece com ordinal nulo; não inventa passado.
- [ ] `learning_credits` grava crédito `numeric(12,4)` proporcional `base/ordinal` (base 4, ordinal 3 → 1,3333); unicidade por (usuário, questão, contexto); mesma questão em sala e curso rende linhas separadas.
- [ ] `profiles.xp_credits` / `room_members.credits_internal` acumulam o saldo decimal; colunas inteiras legadas inalteradas; `level_for_credits` respeita os limiares (99,9999 → 1; 100 → 2).
- [ ] Replay do finalizador não recredita; anti-regrind não paga de novo a mesma questão já creditada no contexto; falha reverte o conjunto.
- [ ] Pipeline, SQL focal e E2E aprovados; tipos regenerados do schema local 0001–0028; revisão em dois eixos (Padrões/Spec).

## Compatibilidade

Expandir por migração nova (0028). Colunas inteiras legadas preservadas. Finalizador legado em `athen_private` não é reescrito. PAC/eficiência (Sessão 03), temporadas (04A), missões (05) e abertura auditada de legado em massa continuam fora. Sem SQL remoto, sem deploy.

## Autoria de IA

- Ferramenta: Kiro CLI.
- Escopo gerado por IA: migração 0028 (ordinal + livro decimal + saldo/nível), ajuste de `save_attempt_answer` e do finalizador público, teste SQL focal, tipos regenerados, consumidor, documentação.
- Revisado e validado localmente por: <responsável>.
