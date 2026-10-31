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

## Cobertura existente

Conferência em 2026-10-23: os testes Vitest existentes são exemplos de [soma](../codigo-base/tests/unit/sum.test.ts) e [contador](../codigo-base/tests/components/ExampleCounter.test.tsx). O [E2E](../codigo-base/tests/e2e/home-page.spec.ts) cobre a página inicial. Aprovação dessas verificações não comprova correção dos fluxos de domínio ou permissões do banco.

Ao acrescentar testes, exercite comportamento observável pelo ponto de entrada usado pelo chamador; evite depender da organização interna da implementação.

## Runner SQL legado

O novo harness não interativo é independente do comando legado: veja [Banco SQL descartável](../codigo-base/README.md#banco-sql-descartável). Execute `npm run test:db:bootstrap`, `npm run test:db:run`, `npm run test:db:concurrency` e `npm run test:db:check` após preparar o projeto local exclusivo. `test:db:run -- --prove-failure` demonstra código de saída 1; execução normal deve retornar 0. O teste inicial exerce `complete_empty_lesson` sob aluno/`authenticated`, RLS ativa, conclusão idempotente, progresso oficial e zero XP, com rollback das fixtures.

O caso de concorrência usa duas conexões de alunos em duas salas, observa ambos aguardando locks antes de liberar a barreira e verifica audiência, privado, ingresso sem matrícula e rollback após falha SQL. Fixtures compartilhadas são confirmadas para as conexões e eliminadas ao final por seus UUIDs exclusivos. Não comprova login HTTP, unicidade de crédito concorrente ou missões/ligas/PAC novos. O job `database` está configurado no [workflow](../.github/workflows/ci.yml), incluindo parada em `always()`; resultados locais e Linux efetivamente executados estão na seção 7 do [guia](planejamento-gamificacao/guia-desenvolvimento-missoes-ligas-e-pac.md).

`npm run test:db` aponta para [run-testes.ts](../codigo-base/supabase/testes/run-testes.ts). É um menu interativo que usa `SUPABASE_DB_URL` do ambiente do processo e executa SQL de criação, atualização e exclusão.

Limitações encontradas na leitura:

- Os scripts SQL usam tabelas antigas, como `public."Usuario"`, diferentes do [modelo atual](banco-de-dados/documentacao-bd.md).
- O runner resolve arquivos como `./01_create.sql` pelo diretório de execução; o comando do manifesto parte de `codigo-base/`, não de `supabase/testes/`.
- Falhas dos scripts são reportadas, mas o retorno booleano não vira uma falha global do processo em cada opção do menu.
- O runner não configura um banco isolado nem faz parte da CI atual.

Portanto, esse comando não é uma validação automatizada confiável do esquema atual. Para alterar SQL, declare o ambiente de teste e verifique as regras afetadas, incluindo permissões e efeitos persistidos. A correção do runner e a criação dessa cobertura são trabalho de código separado desta documentação.

## Mudanças exclusivamente documentais

Confira caminhos e links locais, exemplos de comandos contra o manifesto e afirmações técnicas contra as fontes referenciadas. Relate separadamente verificações executadas e inspeções por leitura; reserve o pipeline da aplicação para mudanças de código ou configuração executável.
