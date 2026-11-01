# 04.8: Consumidores de aprendizagem — retomada na mesma versão, saldo decimal e regressão

Status: claimed

**Issue de equipe:** 42; sprint04; Em andamento. Branch `issue/42-consumidores-aprendizagem`, derivada da sprint04 atualizada (`b01504f`, merge do PR #10). Fatia local do ticket 04 / Sessão 02 (F4 do ticket 04.5). Não é novo ID do YouTrack.

**Contexto (confirmado por investigação no código):**
- `LessonModal.comecar()` hoje **sempre inicia uma tentativa nova** (`tentativaRepository.iniciar`); não há retomada de tentativa em aberto nem leitura do `lesson_version_id`. Refazer uma aula concluída cria tentativa nova — correto —, mas **abandonar e reabrir** também recomeça do zero, perdendo os primeiros envios já gravados.
- Reenvio sem crédito já é garantido pelo servidor (resultado persistido no replay; `finalizar` cai para `get_attempt_confirmation`); o modal já lida com retorno perdido.
- `CriarCurso` publica a versão inicial só na criação (`aulaRepository.publicarVersao`); não há republicação para curso já criado.
- Perfil mostra `xp_global`/`level` inteiros; **não** mostra o saldo decimal `xp_credits`. A whitelist de escrita do perfil (0024) já é testada em `profile-permissions.spec.ts`.

**Contrato:**
- `spec.md` história #2 — "Como aluno, quero **retomar uma tentativa mantendo meus primeiros envios**, para que abandono não reinicie meu esforço."
- `contratos.md` (Aprendizagem) — "Retomar execução | Identidade da execução própria | **Mesmo snapshot e primeiros envios**, sem expiração automática por tempo enquanto autorizada."
- Ticket 04.5 F4 — "LessonModal (retomada na mesma versão, reenvio sem crédito), CriarCurso/publicação registra versão, tipos regenerados; testes de regressão de perfil."

## O que construir (sem migração; camada de UI/consumidor)

1. **Retomada na mesma versão** — novo `tentativaRepository.obterEmAberto(idAula, contexto)`: seleciona a tentativa do usuário logado para (aula, contexto curso/sala) com `finished_at is null`, mais recente. `LessonModal.comecar()` passa a: se existir tentativa em aberto, **retomá-la** (reusa `id` e `lesson_version_id` já fixados no início) e restaurar os primeiros envios já gravados (`respostaRepository.listarPorTentativa`), posicionando na primeira questão ainda não respondida; senão, inicia nova. Refazer uma aula já concluída continua iniciando tentativa nova (execução nova).
2. **Saldo decimal visível (read-only) no Perfil** — `usuarioRepository` expõe leitura do `xp_credits`; o Perfil mostra o saldo decimal ao lado do XP inteiro legado, sem permitir edição. A whitelist de escrita permanece intacta.
3. **Republicação de versão (opcional, se limpo)** — ação em `CriarCurso`/repositório para republicar a versão de uma aula de curso já criado (`publish_lesson_version`), caso caiba sem redesenho; senão, registrar como pendência.
4. **Tipos regenerados** se necessário (nenhuma mudança de schema; `lesson_version_id`/`xp_credits`/`first_submission_ordinal` já estão nos tipos das fatias anteriores).

## Ponto de teste (seams)

- E2E/componente do `LessonModal`: ao reabrir uma aula com tentativa em aberto, a mesma tentativa é retomada (mesmo `id`), os primeiros envios são restaurados e nenhuma nova tentativa é criada; refazer aula concluída cria tentativa nova; reenvio/replay não recredita (finaliza uma vez, confirmação recuperada).
- Regressão de perfil: a carga de escrita do perfil continua restrita aos campos pessoais e **nunca** inclui `xp_credits`/`xp_global`/`level`; o saldo decimal aparece somente como leitura.

**Minimização de testes (a pedido do usuário):** manter a prova central da retomada (mesma tentativa, envios restaurados, sem nova tentativa) e da regressão de perfil (whitelist + saldo read-only). Cortar variações redundantes já cobertas pelo dashboard.spec/profile-permissions.spec existentes.

## Critérios de conclusão

- [ ] Reabrir uma aula com tentativa em aberto retoma a mesma tentativa (mesmo `id`/versão) e restaura os primeiros envios; nenhuma tentativa nova é criada.
- [ ] Refazer uma aula já concluída inicia uma tentativa nova (execução nova), sem retomar a anterior.
- [ ] Reenvio/replay não recredita nem refaz o resultado (comportamento do servidor, exercido pela UI).
- [ ] Perfil exibe o saldo decimal `xp_credits` como leitura; a carga de escrita do perfil continua sem campos oficiais.
- [ ] Pipeline, testes de UI/E2E aprovados; revisão em dois eixos (Padrões/Spec).

## Compatibilidade

Sem migração nova; camada de cliente e testes. Graduação-contra-snapshot, bônus, PAC/eficiência (Sessão 03), temporadas (04A) e missões (05) continuam fora. Sem SQL remoto, sem deploy.

## Autoria de IA

- Ferramenta: Kiro CLI.
- Escopo gerado por IA: `obterEmAberto`, retomada no `LessonModal`, leitura do saldo decimal no Perfil, testes E2E/regressão, documentação.
- Revisado e validado localmente por: <responsável>.
