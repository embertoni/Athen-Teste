# 04.4: Iniciar a tentativa com usuário e contexto validados no servidor

Status: resolved (implementado e validado localmente; publicação e CI ainda a registrar)

**Issue de equipe:** 42; sprint04; Em andamento confirmado pelo usuário. Branch `issue/42-inicio-autorizado`, derivada da sprint04 atualizada no merge do PR #6 (`dbeae27`), preservando os documentos locais da passagem. Não é novo ID do YouTrack; é fatia local do ticket 04.

**Parte de:** ticket 04 e sessão 02. Continuação após 04.3 / PR #6.

**What to build:** o início de uma tentativa deixa de ser INSERT direto do cliente em `public.attempts` e passa por uma entrada de servidor que deriva o usuário de `auth.uid()`, exige conta ativa, deriva o curso da aula e valida a coerência e a autorização do contexto (curso ou sala) no momento do início — a mesma autoridade de acesso que `finalize_attempt` já aplica no fim. O cliente perde a permissão de INSERT direto em `attempts` e passa a chamar a entrada de servidor.

**Por que agora:** o guia (retomada, seção 5) aponta este como o próximo recorte: "Usuário/curso/contexto confiáveis precisam ser derivados/validados no servidor" e essa origem "sustenta snapshots e ordinal posteriores". Hoje a tentativa pode nascer com contexto incoerente ou sem acesso e só falhar em `finalize_attempt`.

**Blocked by:** 04.1 (`finalize_attempt` encapsulado e `learning_results`), integrado em `da23867`. Reusa a autoridade de contexto de `finalize_attempt` sem duplicar política divergente.

**Origem:** guia sessão 02/3.5; retomada seção 5 (primeiro item pendente do ticket 04). Autoridade de contexto espelha a de `finalize_attempt` (migração 0023).

## Seams de teste (confirmados antes do código)

- **SQL `public.start_attempt(p_lesson_id uuid, p_course_id uuid, p_room_id uuid)`** — seam principal, nível banco, exercitado pelo harness SQL em transação revertida (`tests/db/`). Pega: user_id derivado do servidor; conta inativa/sem sessão recusada; curso derivado da aula; contexto incoerente (curso que não é o da aula; sala cujo curso não bate) recusado; autorização de curso (publicado/público, criador ou matrícula ativa/completa) e de sala (educador ou membro ativo) aplicada no início; tentativa válida criada com os campos oficiais zerados. Não pega: rede, UI, concorrência fina (coberta por fatias próprias).
- **Cliente `tentativaRepository.iniciar`** — seam TypeScript. Pega: o consumidor chama a RPC `start_attempt` e devolve `Tentativa`; não envia `user_id`. Verificado por tipo e revisão; sem novo teste unitário de rede nesta fatia salvo se a revisão exigir.

## Critérios de conclusão

- [x] Teste vermelho demonstra, por entrada pública em Postgres real, que o início aceita hoje um contexto que o servidor deveria recusar (curso/sala incoerente ou sem acesso), sem falha artificial de setup. (Vermelho inicial: `function public.start_attempt(...) does not exist`; as recusas específicas 42501 tornaram-se verdes só com 0026.)
- [x] `start_attempt` deriva o usuário de `auth.uid()`, exige conta ativa e cria a tentativa apenas com contexto coerente e autorizado; campos oficiais permanecem zerados e sob controle exclusivo do servidor.
- [x] INSERT direto do cliente em `public.attempts` deixa de ser concedido; a edição legítima de perfil e os demais fluxos permanecem intactos.
- [x] `finalize_attempt`, `save_attempt_answer` e a recuperação de confirmação continuam estáveis: tentativa criada pela nova entrada finaliza e reconsulta como antes.
- [x] Tipos gerados do esquema isolado refletem a nova função; consumidor do cliente migra para a RPC sem enviar `user_id`.
- [x] Pipeline da aplicação, SQL focal (learning e permissions afetados) e E2E apropriados passam; limitações restantes da sessão 02 registradas sem declarar núcleo completo.

## Validação local (01/11/2026)

Vermelho: o teste chamou `public.start_attempt` inexistente e falhou com "function public.start_attempt(unknown, unknown, unknown) does not exist". Verde: migração 0026 criou a função; `test:db:start-attempt` passou, incluindo as recusas com código específico (42501) e a tentativa iniciada pelo servidor finalizando 1/1 e 4 XP.

Regressões conciliadas: `learning.sql` tinha uma asserção que exigia o INSERT direto do cliente (contrato antigo); foi atualizada para afirmar a recusa do INSERT direto e usar `start_attempt`, e a fixture da injeção de falha (attempt 018) passou a ser semeada como superusuário antes da troca de papel. `dashboard.spec.ts` ganhou o mock da RPC `start_attempt`.

Pipeline da aplicação aprovado: lint, typecheck, test:run (2/2), test:check, test:db:check, build. E2E 28/28 (~22s). SQL: start-attempt, learning, first-submissions, permissions, sanity, concurrency, learning-concurrency, seed — todos aprovados no projeto local `athen-gamificacao-test` (0001–0026). Tipos regenerados do schema local (diff = somente `start_attempt`). Revisão em dois eixos (Padrões/Spec) executada por subagentes de leitura: sem achados de alta severidade; a divergência de código de erro apontada foi corrigida (coerência de curso agora 42501, igual a `finalize_attempt`) e os testes negativos passaram a fixar o código específico. "Resolved" aqui significa implementado/validado localmente; commit nesta branch feito, publicação/PR/CI ainda a registrar.

**Limite deliberado:** esta fatia valida identidade e contexto no início. NÃO implementa snapshot/versão da aula no início, identidade semântica, publicação/versionamento, retomada entre sessões, ordinal histórico, livro decimal de créditos nem demais contadores. Esses critérios continuam abertos no ticket 04. A autoridade de pagamento segue única em `finalize_attempt`; nenhuma segunda autoridade é ativada.

**Compatibilidade:** expandir por migração nova (0026). Encapsular a criação de tentativa atrás de `start_attempt` (SECURITY DEFINER) e revogar o grant de INSERT direto de `attempts` ao `authenticated`. Attempts já existentes e o caminho de finalização permanecem válidos. Registrar a estratégia antes de mudar GRANTs; manter a autoridade de contexto idêntica à de `finalize_attempt`.

**Ponto de teste:** comando de início autorizado e leitura da tentativa criada; UI apenas para integração, não como prova de transação.

**Evidência para fechar:** teste vermelho/verde, corrida real, alvo/esquema de geração de tipos e revisão nos eixos Padrões/Spec. Não ativar migração compartilhada remota.
