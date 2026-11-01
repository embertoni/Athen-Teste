# PR: ordinal histórico do primeiro envio e livro de créditos decimal (fatia 04.6)

**Base:** `sprint04` · **Branch:** `issue/42-ordinal-primeiro-envio` · **Issue:** 42

Título sugerido (< 70 caracteres):

```
feat: ordinal do primeiro envio e livro de creditos decimal
```

## Summary

Fecha o núcleo da Sessão 02 (ticket 04): o **ordinal histórico do primeiro envio** e o **livro de créditos decimal** construído sobre ele. Uma única migração nova (0028), escrita só pelo finalizador do servidor, em paralelo aos inteiros legados, que ficam byte a byte.

```text
save_attempt_answer(attempt, question)
  lock attempt (serializa)
  primeiro envio?
    ordinal := 1 + max(ordinais anteriores do mesmo user/questao/contexto)   -- legado: null
  grava answer com first_submission_ordinal

finalize_attempt(attempt)                 -- autoridade unica de pagamento
  resultado ja existe? -> retorna (sem recreditar)
  roda finalizador inteiro legado (athen_private, intacto)
  grant_learning_credits:
    para cada acerto com ordinal:
      amount := round(xp_value / ordinal, 4)         -- base 4, ordinal 3 -> 1,3333
      insert learning_credits ... on conflict do nothing   -- unico por contexto
      soma ao saldo decimal (xp_credits | credits_internal)
```

Contexto = par (curso, sala): curso individual é um contexto, cada sala é outro. O mesmo `question_id` rende um crédito individual e um por sala, nunca duplicado no mesmo contexto.

```diff
 answers:        + first_submission_ordinal integer (null = legado, nunca inventado)
 profiles:       + xp_credits numeric(12,4)            (inteiro xp_global intacto)
 room_members:   + credits_internal numeric(12,4)      (inteiro xp_internal intacto)
+learning_credits: livro decimal, indices parciais unicos por contexto
+level_for_credits(numeric): nivel decimal, limiares de level_for_xp (99,9999->1, 100->2)
```

Correção de pré-requisito dobrada: o defeito do trigger `room_members.updated_at` (ticket 05) é resolvido aqui, porque o caminho de crédito de sala atualiza `room_members` e de outra forma falharia. A tabela nunca teve `updated_at`; o trigger órfão `set_updated_at` é removido.

## Evidence

- **Before:** `npm run test:db:ordinal-credits` → `record "r1" has no field "first_submission_ordinal"` (coluna inexistente).
  **After:** o mesmo comando aprova:

```text
Ordinal e livro decimal aprovados: ordem por usuario/questao/contexto,
credito base/ordinal unico, saldo decimal e replay sem recredito.
```

O teste focal prova comportamento, não forma: ordinal 1/2/3 entre tentativas distintas, contexto de sala reiniciando em 1, reenvio sem renovar, legado sem ordinal, crédito 1,3333 (curso) e 4,0000 (sala), unicidade por índice parcial, saldo decimal acumulado, `level_for_credits` 99,9999→1 e 100→2, replay e regrind entre tentativas sem recrédito, xp_global inteiro inalterado, e reingresso por `join_room` (regressão do ticket 05).

- **Regressão:** run, learning, first-submissions, start-attempt, lesson-versions, permissions, seed, concurrency, learning:concurrency — todos aprovados; `--prove-failure` encerra com código 1.
- **Pipeline:** lint, typecheck, test:run (2/2), test:check, test:db:check, build — aprovados.
- **E2E Chromium:** 28 passed.
- **Revisão em dois eixos (Padrões/Spec)** por subagentes de leitura: sem achado de alta severidade. Aplicadas as correções apontadas: cabeçalho da 0028 e docs do ticket 05 declaram a correção do defeito; teste ganhou o caso de anti-regrind entre tentativas e a asserção de que os inteiros legados não mudam.

## Merge Danger

**Door:** two-way — expand-only por migração nova (0028). Colunas e tabela novas em paralelo; nada é retipado ou removido, exceto o trigger órfão `set_updated_at` de `room_members`, que já estava quebrado e cujo drop é reversível por recriação.

**Blast Radius:** finalização de aprendizagem. O livro decimal é escrito apenas pelo `finalize_attempt`, na transação do resultado imutável; o cálculo inteiro legado e seus leitores (xp_global/level/xp_internal) não mudam. A remoção do trigger faz o caminho legado de finalização em sala e a reativação de vínculo passarem de "lançavam erro" para "funcionam" — mudança de resultado em runtime desejada, registrada para a revisão do ticket 05. Sem SQL remoto, sem deploy; integração exige autorização própria.

## Uso de IA

- Ferramenta(s): Kiro CLI.
- Escopo gerado por IA: migração 0028 (ordinal, livro decimal, saldo/nível, correção do trigger 05), ajuste de `save_attempt_answer`/`guard_answer_write`/`finalize_attempt`, `grant_learning_credits`, teste SQL focal, tipos regenerados, `creditoRepository` e documentação.
- Revisado e validado localmente por: <responsável>.
