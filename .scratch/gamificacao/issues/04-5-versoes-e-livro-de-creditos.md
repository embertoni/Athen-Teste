# 04.5: Versões da aula e livro de créditos decimal (núcleo da Sessão 02)

Status: resolved (F1 implementada e validada localmente; publicação/PR/CI a registrar)

**Issue de equipe:** 42; sprint04; Em andamento. Branch `issue/42-versoes-aula`, derivada da sprint04 (`dbeae27`). Fatia local do ticket 04 / Sessão 02. Não é novo ID do YouTrack.

**Modo de execução:** execução contínua. Após avaliação de risco, o usuário escolheu entregar nesta execução **apenas a fatia F1 (versões/snapshots da aula)**, que é autocontida e não ativa pagamento. O livro de créditos decimal (F2+) fica para a execução seguinte, com a modelagem apresentada antes. A decisão de modelagem do livro abaixo é registro de intenção para essa execução futura, não implementação desta.

**Escopo desta execução:** F1 somente. F2/F3/F4 permanecem planejadas.

## Decisão de modelagem (delegada — A3)

1. **Colunas/tabelas decimais novas em paralelo, sem migrar `integer`→`numeric`.** A spec pede um "livro compartilhado" novo (Q112/Q126). `profiles.xp_global`, `attempts.xp_earned`, `room_members.xp_internal` continuam `integer` legados para compatibilidade dos leitores atuais. O crédito decimal vive numa tabela-livro própria.
2. **Tabela `public.learning_credits`**: uma linha por crédito concedido, com `numeric(12,4)`, chave semântica (usuário, questão, contexto curso/sala, ordinal) que garante **unicidade por contexto** — a mesma questão rende um crédito individual e um por sala autorizada, nunca repetido no mesmo contexto.
3. **Ordinal histórico** derivado da ordem dos primeiros acertos por questão semântica + contexto (usando `answers.first_submitted_at` do 0025 e a ordem das tentativas finalizadas). Crédito base único **proporcional ao ordinal do primeiro acerto**: `base / ordinal`, 4 casas (ex.: base 4, ordinal 3 → 1,3333).
4. **Saldo decimal** acumulado em coluna nova `profiles.xp_credits numeric(12,4)` (vitalício individual) e, para sala, `room_members.credits_internal numeric(12,4)`. Nível decimal lê o saldo decimal, preservando os limiares inteiros de `level_for_xp` (99,9999/100 cai no nível 1→2 conforme spec).
5. **Autoridade única:** o livro é escrito só pelo finalizador público, na mesma transação do resultado imutável (0023). O finalizador legado inteiro em `athen_private` permanece para compatibilidade, mas o pagamento novo é decimal e único por contexto. Ajustes administrativos auditados não apagam a origem nem tornam saldo negativo.

## Fatias (execução contínua)

- **F1 — Versões/snapshots da aula:** migração que congela o conjunto de questões/config numa versão publicável e associa a versão aos resultados; identidade semântica preservada; adoção explícita (Q142). Não ativa pagamento.
- **F2 — Livro de créditos decimal:** `learning_credits`, saldo decimal, ordinal histórico, crédito único proporcional por contexto, nível decimal; escrito pelo finalizador na mesma transação.
- **F3 — Autorização de escrita:** proteger saldo/nível/contadores decimais; só o finalizador escreve o livro; ajuste administrativo auditado.
- **F4 — Consumidores:** `LessonModal` (retomada na mesma versão, reenvio sem crédito), `CriarCurso`/publicação registra versão, tipos regenerados; testes de regressão de perfil.

## Critérios de conclusão (F1)

- [x] Versão publicável congela questões/config; resultado referencia a versão; edição textual autorizada não renova identidade nem repaga.
- [x] A tentativa registra a versão corrente no início e a mantém fixada mesmo se nova versão for publicada durante a tentativa.
- [x] Aula sem versão publicada inicia com versão nula (legado/desconhecido).
- [x] Só o criador do curso (ou admin) publica versão; não-autor recusado com 42501.
- [x] `finalize_attempt` transporta a versão ao resultado sem alterar o cálculo legado (1/1, 4 XP preservados).
- [x] Pipeline, SQL focal e E2E aprovados; tipos regenerados do schema local 0001–0027.

## Validação local (01/11/2026)

Vermelho provado ao corromper a asserção de congelamento (o harness falhou) e restaurado ao verde. `test:db:lesson-versions` passa com os 7 casos (congelamento, imutabilidade na edição, incremento de versão, autorização, registro na tentativa, pin no início durante nova publicação, versão nula no legado). Sem regressão: start-attempt, learning, first-submissions, permissions, sanity — todos aprovados. Pipeline da aplicação: lint, typecheck, test:run, test:check, test:db:check, build — aprovados. E2E 28/28. Revisão em dois eixos por subagentes de leitura: sem achado de alta severidade; corrigida a contradição `published_by not null + on delete set null` (agora cascade) e adicionado o teste de pin no início apontado pela revisão Spec.

## Próximas fatias (F2+) — não implementadas nesta execução

**Limite deliberado:** PAC/eficiência (Sessão 03), temporadas (04A), missões (05) e abertura auditada de legado em massa não entram aqui. Esta fatia estabelece o livro e as versões que essas sessões consomem.

**Compatibilidade:** expandir por migrações novas (0027+). Colunas inteiras legadas preservadas. Finalizador legado em `athen_private` não é reescrito.
