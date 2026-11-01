# Testes e validações

Execute os comandos a partir de `codigo-base/`, após o [setup local](../codigo-base/README.md). O catálogo executável está em [package.json](../codigo-base/package.json); a automação de CI está no [workflow](../.github/workflows/ci.yml).

## Pipeline para mudanças de código

```bash
npm run lint
npm run typecheck
npm run test:run
npm run test:check
npm run build
```

| Verificação | O que cobre |
| --- | --- |
| `lint` | Regras configuradas no ESLint; não comprova aderência completa aos guias de estilo ou produto |
| `typecheck` | Compilação dos projetos TypeScript configurados |
| `test:run` | Testes `*.test.ts` e `*.test.tsx` sob `tests/`, com Vitest/jsdom |
| `test:check` | Tipagem do projeto de testes |
| `build` | Compilação TypeScript e assets de produção do Vite |

O pre-commit em [Husky](../codigo-base/.husky/pre-commit) usa lint-staged e faz verificações locais; confira o arquivo ao investigar falhas. Ele não substitui a execução completa acima.

A CI está configurada para PRs destinados às sprints, `develop` e `main`, e para pushes nessas branches, incluindo o merge de PR na sprint. Há também `workflow_dispatch`; o GitHub exige o arquivo na branch padrão para disponibilizar esse evento manual. Confira a execução real em Actions: YAML versionado ou testes locais não comprovam execução remota. Em forks pode ser necessário habilitar Actions, conforme [documentação do GitHub](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#workflows-in-forked-repositories). A ausência de workflows listados, por si só, não confirma a causa; não exige mudar a branch padrão nem integrar código em `main` para continuar ensaios locais.

## Interface e E2E

Para mudanças visuais ou de navegação, execute também:

```bash
npm run test:e2e
```

A [configuração Playwright](../codigo-base/playwright.config.ts) usa Chromium e prepara um build/preview exclusivo em `127.0.0.1:4173`, com variáveis Supabase fictícias; falha se a porta já estiver ocupada. Execute o pipeline geral antes do E2E, em sequência: outro build simultâneo sobrescreve `dist/` e invalida o ambiente do preview. Se faltar o navegador, instale-o com `npx playwright install chromium`.

O teste existente verifica título e cabeçalho da página inicial. Não testa login real nem os fluxos autenticados de curso, aula, sala ou perfil. Os valores fictícios usados pelo E2E não servem para acesso funcional ao banco.

`tests/e2e/dashboard.spec.ts` também exercita o dashboard com sessão e respostas HTTP controladas: conclusão sem questões, falhas da leitura e da RPC, parâmetros das consultas do TopDown, navegação do carrossel e geometria em 1280, 1440 e 1920px. As capturas de dashboard e seletor ficam em `test-results/`. Esses testes não validam autenticação real, aplicação da migração `0022` ou políticas RLS de um banco remoto.

`tests/e2e/sprint04-reconciliation.spec.ts` cobre a compatibilidade de `/ranking` com `/ligas`, busca sem acentos na estante, perfil/medalhas de amigos e missões publicadas junto das aulas de sala, incluindo falha de leitura. Sessão e HTTP são fictícios; não comprovam políticas de banco nem o futuro mecanismo de gamificação. Capturas da conciliação ficam em `test-results/`.

Dashboard também cobre retorno perdido da finalização: a reconsulta recupera a confirmação de 1/1 e 4 XP; sem confirmação, a tela mantém erro e não anuncia conclusão. A captura `confirmacao-recuperada.png` fica em test-results. Esse HTTP controlado não prova persistência ou RLS; a prova SQL usa os comandos abaixo.

Dashboard cobre também retorno perdido do envio: primeiro salva B, o cliente tenta A no reenvio, e o feedback/resumo usam B preservado pelo servidor. Outros três casos verificam a apresentação da resposta recebida de texto, soma e associação. A captura primeiro-envio-preservado.png registra o estado de feedback. HTTP fictício não prova imutabilidade no banco, verificada pelo SQL.

`tests/e2e/profile-permissions.spec.ts` cobre edição pessoal em Perfil, identidade/preferências em Configurações e edição sem exclusão direta na lista de perfis do CRUD. Confere payloads sem campos oficiais e feedback após salvar, usando sessão/HTTP fictícios. Não testa upload real nem políticas de Storage; a autorização SQL é verificada separadamente.

## Cobertura existente

Conferência em 2026-10-23: os testes Vitest existentes são exemplos de [soma](../codigo-base/tests/unit/sum.test.ts) e [contador](../codigo-base/tests/components/ExampleCounter.test.tsx). O [E2E](../codigo-base/tests/e2e/home-page.spec.ts) cobre a página inicial. Aprovação dessas verificações não comprova correção dos fluxos de domínio ou permissões do banco.

Ao acrescentar testes, exercite comportamento observável pelo ponto de entrada usado pelo chamador; evite depender da organização interna da implementação.

## Runner SQL legado

O novo harness não interativo é independente do comando legado: veja [Banco SQL descartável](../codigo-base/README.md#banco-sql-descartável). Execute `npm run test:db:bootstrap`, `npm run test:db:run`, `npm run test:db:concurrency` e `npm run test:db:check` após preparar o projeto local exclusivo. `test:db:run -- --prove-failure` demonstra código de saída 1; execução normal deve retornar 0. O teste inicial exerce `complete_empty_lesson` sob aluno/`authenticated`, RLS ativa, conclusão idempotente, progresso oficial e zero XP, com rollback das fixtures.

O caso de concorrência usa duas conexões de alunos em duas salas, observa ambos aguardando locks antes de liberar a barreira e verifica audiência, privado, ingresso sem matrícula e rollback após falha SQL. Fixtures compartilhadas são confirmadas para as conexões e eliminadas ao final por seus UUIDs exclusivos. Não comprova login HTTP, unicidade de crédito concorrente ou missões/ligas/PAC novos. O job `database` está configurado no [workflow](../.github/workflows/ci.yml), incluindo parada em `always()`; resultados locais e Linux efetivamente executados estão na seção 7 do [guia](planejamento-gamificacao/guia-desenvolvimento-missoes-ligas-e-pac.md).

`npm run test:db` aponta para [run-testes.ts](../codigo-base/supabase/testes/run-testes.ts). É um menu interativo que usa `SUPABASE_DB_URL` do ambiente do processo e executa SQL de criação, atualização e exclusão.

`npm run test:db:learning` executa `tests/db/learning.sql` em transação descartada: confirmação estável após edição posterior, permissões, incompletude, legado e falha injetada com rollback. `npm run test:db:learning:concurrency` coordena dois PIDs reais bloqueados antes da liberação; verifica duas finalizações da mesma tentativa e a corrida resposta/finalização, com uma confirmação e 4 XP. A terceira corrida envia duas respostas diferentes à mesma questão e compara os recebimentos: uma resposta, mesmo instante e nenhum XP/resultado de conclusão só pelo envio. Fixtures compartilhadas usam UUIDs exclusivos e são removidas após os workers. Ambos integram o job database. Não provam unicidade entre tentativas distintas, ordinal ou livro decimal.

`npm run test:db:first-submissions` executa tests/db/first-submissions.sql com rollback: B → reenvio A preserva B, finaliza como 0/1 e zero XP; nova tentativa aceita A e mantém o cálculo inteiro legado. Verifica instante do servidor, proteção do conteúdo/instante, linha legada explicitamente sem histórico, recusa de acesso alheio/inativo e compatibilidade do finalizador. A fixture de rollback em learning.sql já começa com a resposta correta, sem depender de sobrescrever o primeiro envio. O teste não certifica snapshot, ordinal, autorização completa de início/contexto ou recuperação entre sessões.

`npm run test:db:lesson-versions` executa tests/db/lesson-versions.sql com rollback: publicar congela o snapshot da aula; edição de texto posterior não altera a versão; nova publicação cria versão distinta preservando a anterior; só o criador/admin publica; a tentativa registra a versão corrente e a mantém mesmo se nova versão for publicada durante a tentativa; aula sem versão inicia com versão nula; finalização não altera o cálculo legado (1/1, 4 XP). Não certifica crédito decimal, ordinal ou PAC.

`npm run test:db:start-attempt` executa tests/db/start-attempt.sql com rollback: início autorizado deriva o usuário de auth.uid() e cria a tentativa só com contexto coerente e acessível; recusa curso incoerente, curso sem acesso, sala de curso diferente, não-membro, sessão ausente e conta inativa, cada recusa com o código esperado; confirma que o INSERT direto do cliente foi retirado e que uma tentativa iniciada pelo servidor ainda finaliza 1/1 e 4 XP. Não certifica snapshot, versão, ordinal, livro decimal ou retomada entre sessões.

`npm run test:db:ordinal-credits` executa tests/db/ordinal-credits.sql com rollback: o primeiro envio recebe ordinal histórico 1,2,3 por usuário/questão/contexto entre tentativas distintas; o contexto de sala reinicia o ordinal; o reenvio não renova; envio legado (first_submitted_at nulo) permanece sem ordinal e fora do livro. O livro `learning_credits` grava crédito `numeric(12,4)` `base/ordinal` (4 → 1,3333 no curso, 4,0000 na sala), unicidade por contexto por índice parcial; saldos decimais (`xp_credits`/`credits_internal`) acumulam e `level_for_credits` respeita 99,9999 → 1 e 100 → 2; replay e regrind entre tentativas não recreditam; o xp_global inteiro legado não é alterado pelo caminho decimal. Cobre também a regressão do trigger `room_members.updated_at` (ticket 05): reingresso por join_room reativa o vínculo sem falha. Não certifica PAC, temporadas, missões nem concorrência real do ordinal (ticket posterior).

`npm run test:db:typed-credits` executa tests/db/typed-credits.sql com rollback: o finalizador marca o crédito como `origin='base'`; segunda base no mesmo contexto é recusada pelo índice parcial; uma linha `opening` de contexto coexiste. O cliente autenticado não escreve `profiles.xp_credits` nem `room_members.credits_internal`/`xp_internal` (recusa de privilégio de coluna), mas o educador ainda gerencia `status`/`removed_at` e exclui membros. `open_legacy_credit` é admin-only (não-admin → 42501), grava `origin='opening'` auditada com nota, ajusta o saldo, é única por contexto, rejeita valor que torne o saldo negativo e não fabrica ordinal nem crédito base. Não certifica bônus, PAC, temporadas nem graduação contra snapshot.

`npm run test:db:permissions` executa `tests/db/permissions.sql`, com rollback das fixtures. Sob aluno, administrador autenticado e anon, verifica negação de campos oficiais, INSERT/DELETE/TRUNCATE e helpers internos; preserva edição pessoal e isolamento, cadastro de aluno/educador, provisionamento administrativo por service_role confiável, estudo/streak/medalha e desativação. `npm run test:db:seed` executa o seed fictício real duas vezes na transação revertida, conferindo papéis e reaplicação. Ambos usam o mesmo guard de projeto/URL/marker e integram o job database. Isso não aplica SQL remoto, não popula o banco de uso da aplicação e não homologa o ciclo completo de conta, salas ou demais contadores.

Limitações encontradas na leitura:

- Os scripts SQL usam tabelas antigas, como `public."Usuario"`, diferentes do [modelo atual](banco-de-dados/documentacao-bd.md).
- O runner resolve arquivos como `./01_create.sql` pelo diretório de execução; o comando do manifesto parte de `codigo-base/`, não de `supabase/testes/`.
- Falhas dos scripts são reportadas, mas o retorno booleano não vira uma falha global do processo em cada opção do menu.
- O runner não configura um banco isolado nem faz parte da CI atual.

Portanto, esse comando não é uma validação automatizada confiável do esquema atual. Para alterar SQL, declare o ambiente de teste e verifique as regras afetadas, incluindo permissões e efeitos persistidos. A correção do runner e a criação dessa cobertura são trabalho de código separado desta documentação.

## Mudanças exclusivamente documentais

Confira caminhos e links locais, exemplos de comandos contra o manifesto e afirmações técnicas contra as fontes referenciadas. Relate separadamente verificações executadas e inspeções por leitura; reserve o pipeline da aplicação para mudanças de código ou configuração executável.
