# PR: origem tipada do livro, trava de escrita decimal e abertura de legado (fatia 04.7)

**Base:** `sprint04` · **Branch:** `issue/42-origem-tipada-abertura` · **Issue:** 42

Título sugerido (< 70 caracteres):

```
feat: origem tipada do livro e abertura de legado auditada
```

## Summary

F3 do núcleo da Sessão 02: dá **origem tipada** ao livro de créditos, **tranca** a escrita dos saldos decimais e abre a autoridade de **abertura/ajuste de legado** — de forma conservadora, sem pagar retroativo. Migração 0029, aditiva; finalizador legado em `athen_private` intocado.

```diff
 learning_credits:
+  origin text not null default 'base'  check base|bonus|opening|adjustment
+  note   text                          (justificativa auditada de opening/adjustment)
~  question_id / attempt_id -> nullable (base/bonus exigem; opening/adjustment são de contexto)
~  unico (user,question,context) WHERE origin='base'     (base segue unica por contexto)
+  unico (user,contexto)        WHERE origin='opening'    (abertura unica por contexto)

 room_members:  revoke all; grant select,insert,delete; grant update (status,removed_at)
                -> cliente nao escreve credits_internal/xp_internal/progress/pac_internal
                -> educador mantem insert/update(status,removed_at)/delete por RLS FOR ALL

+open_legacy_credit(user, course, room, amount, note)  SECURITY DEFINER, admin-only
   grava origin=opening (ou adjustment se amount<0), auditada, uma por contexto,
   move o saldo decimal; nunca negativo; NAO varre legado, NAO fabrica ordinal/base
```

`profiles.xp_credits` já era inescrevível pelo cliente (grant de coluna da 0024); 0029 fecha o buraco análogo em `room_members`.

## Evidence

- **Before:** `npm run test:db:typed-credits` → `column "origin" does not exist`.
  **After:**

```text
Origem tipada e abertura aprovadas: base unica por contexto, trava de escrita
decimal e abertura de legado auditada.
```

O teste focal prova invariantes por restrição real, não por forma: base tagueada pelo finalizador (via RPC pública), segunda base recusada por índice parcial (`unique_violation`), abertura coexistindo no mesmo contexto, cliente recusado ao escrever `xp_credits`/`credits_internal`/`xp_internal` (`insufficient_privilege`), **educador ainda gere `status`/`removed_at` e exclui membro**, `open_legacy_credit` admin-only (42501), auditada com nota, única por contexto (`unique_violation`), saldo nunca negativo (`check_violation`) e sem ordinal/base fabricados.

- **Regressão:** ordinal-credits, run, learning, first-submissions, start-attempt, lesson-versions, permissions, seed, concurrency, learning:concurrency — todos aprovados; `--prove-failure` encerra com código 1.
- **Pipeline:** lint, typecheck, test:run (2/2), test:check, test:db:check, build — aprovados.
- **E2E Chromium:** 28 passed.
- **CI do PR #10:** [run 41319302262](https://github.com/embertoni/Athen-Teste/actions/runs/41319302262) — quality, database e e2e **SUCCESS**.
- **Revisão em dois eixos (Padrões/Spec)** por subagentes de leitura: sem achado de alta severidade de correção. Correções aplicadas: grant de `room_members` preservando insert/delete do educador (não só status/removed_at); comentário dos dois escritores da conta decimal; nota de auditoria persistida; guarda de vínculo inexistente na abertura de sala; teste do caminho positivo do educador; catch estrito do `check_violation`.

## Merge Danger

**Door:** two-way — expand-only por migração nova (0029). Colunas e função novas; os dois índices de base são recriados mais estreitos (`origin='base'`), sem janela de perda porque todas as linhas existentes são base no instante da migração. O finalizador legado e as colunas inteiras continuam intactos.

**Blast Radius:** autoridade de pagamento decimal. Agora há dois escritores da conta decimal: o finalizador (base) e `open_legacy_credit` (abertura/ajuste, admin, auditada). A trava de `room_members` remove a escrita de métricas pelo cliente, preservando a gestão de membros do educador; nenhum consumidor do cliente escreve métricas de sala hoje. Variante conservadora: nenhum saldo legado é aberto automaticamente — a abertura só ocorre por chamada administrativa explícita. Sem SQL remoto, sem deploy; integração exige autorização própria.

## Uso de IA

- Ferramenta(s): Kiro CLI.
- Escopo gerado por IA: migração 0029 (origem tipada + nota, índices, trava de `room_members`, `open_legacy_credit`), teste SQL focal, tipos regenerados, `creditoRepository.listarPorOrigem` e documentação.
- Revisado e validado localmente por: <responsável>.
