# PR: retomada na mesma versão, saldo decimal no perfil e regressão (fatia 04.8)

**Base:** `sprint04` · **Branch:** `issue/42-consumidores-aprendizagem` · **Issue:** 42

Título sugerido (< 70 caracteres):

```
feat: retoma tentativa em aberto e mostra saldo decimal
```

## Summary

F4 do núcleo da Sessão 02: liga os consumidores de UI à máquina de aprendizagem já pronta. Sem migração — camada de cliente e testes.

```diff
 LessonModal.comecar():
-  sempre inicia uma tentativa nova (start_attempt)
+  jaConcluida ? inicia nova (refazer = execução nova)
+  : retoma a tentativa em aberto do contexto (mesma id, mesma versão fixada)
+      restaura os primeiros envios gravados
+      posiciona na primeira questão sem resposta

 Profile:
+  mostra profiles.xp_credits (saldo decimal) SOMENTE leitura, ao lado do XP inteiro

 repositories.ts:
+  tentativaRepository.obterEmAberto(idAula, contexto)  // finished_at is null, dono por RLS
```

A retomada reusa a mesma tentativa, então herda o `lesson_version_id` fixado no início — "mesmo snapshot e primeiros envios" (contratos, Aprendizagem). O "reenvio sem crédito" já é do servidor (replay devolve o resultado persistido); a UI exercita, não reimplementa.

## Evidence

- **Before:** reabrir uma aula abandonada criava uma tentativa nova (perdia o esforço).
  **After (E2E):** `dashboard.spec.ts` "retoma a tentativa em aberto na mesma versão sem recomeçar" — consulta `attempts` com `finished_at=is.null`, **não** chama `start_attempt`, busca os envios (`answers`) e posiciona em "Questão 2 de 2" (pula a já respondida); finaliza a mesma tentativa.
- **Perfil:** `profile-permissions.spec.ts` novo caso — o saldo "1,3333 créditos" aparece em leitura; a carga de escrita do perfil continua `{display_name, username, bio}` e nunca inclui `xp_credits`/`xp_global`/`level` (whitelist garantida em tempo de compilação pelo tipo `UpdateUsuarioInput`).
- **Pipeline:** lint, typecheck, test:run (2/2), test:check, build — aprovados.
- **E2E Chromium:** 30 passed (28 anteriores + 2 novos).
- **CI do PR #11:** [run 41326258402](https://github.com/embertoni/Athen-Teste/actions/runs/41326258402) — quality, database e e2e **SUCCESS**.
- **Revisão em dois eixos (Padrões/Spec)** por subagentes de leitura: ambos SATISFIED, sem achado de alta severidade. Correções aplicadas: seletor acessível no lugar de `data-testid`; comentários do caso "todas respondidas" e do numeric-como-string do PostgREST; atualização de `testes.md`/`arquitetura.md`.

## Merge Danger

**Door:** two-way — mudança de cliente, sem migração; reversível por reverter o commit.

**Blast Radius:** fluxo de aula e tela de perfil. A retomada só altera `LessonModal.comecar()`; refazer aula concluída continua criando execução nova. A leitura do saldo decimal é somente apresentação; a escrita do perfil é a mesma whitelist da 0024. Nenhuma autoridade de pagamento muda. Pendência registrada: republicação de versão para curso já criado (o cliente lê o conjunto vivo de questões; o finalizador valida contra a versão fixada). Sem SQL remoto, sem deploy; integração exige autorização própria.

## Uso de IA

- Ferramenta(s): Kiro CLI.
- Escopo gerado por IA: `tentativaRepository.obterEmAberto`, retomada no `LessonModal`, saldo decimal read-only no Perfil, testes E2E de retomada e de regressão de perfil, documentação.
- Revisado e validado localmente por: <responsável>.
