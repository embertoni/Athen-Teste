# Athen — execução local

Use a versão de Node definida nos jobs de [CI](../.github/workflows/ci.yml), compatível com as engines do lockfile, e instale as dependências com `npm ci` em `codigo-base/`. Os comandos da aplicação e seu alcance estão em [Testes e validações](../docs/testes.md). O ambiente de banco abaixo é exclusivo para ensaios fictícios e não utiliza o `.env` da aplicação.

## Banco SQL descartável

Pré-requisitos: Docker Desktop com containers Linux, binário `docker` no PATH, Node compatível com as engines do lockfile e Supabase CLI instalado pelo projeto. No Windows, o Docker pode estar em `%LOCALAPPDATA%/Programs/DockerDesktop/resources/bin`; acrescente esse caminho ao PATH da sessão se necessário.

O projeto **athen-gamificacao-test** usa banco em **127.0.0.1:55432**, API na porta 55431 e shadow na 55430. A configuração versionada fica em `tests/db/supabase/config.toml`; `test:db:prepare` copia somente essa configuração para `.supabase-test/`, ignorado pelo Git. Não inicialize o diretório `supabase/` da aplicação nem copie suas migrações para o diretório temporário: o bootstrap controla a seleção.

Em PowerShell, a partir desta pasta:

```powershell
npm run test:db:prepare
npx --no-install supabase start --workdir .supabase-test -x realtime,storage-api,imgproxy,mailpit,postgres-meta,studio,edge-runtime,logflare,vector,supavisor
$env:ATHEN_TEST_DB_URL = 'postgresql://postgres:postgres@127.0.0.1:55432/postgres'
npm run test:db:bootstrap
npm run test:db:run
npm run test:db:concurrency
npm run test:db:check
```

A senha acima é o padrão fictício do projeto descartável local. Nenhuma credencial da aplicação é necessária. `ATHEN_TEST_DOCKER` pode indicar o caminho absoluto do executável Docker quando ele não estiver no PATH. Não use `SUPABASE_DB_URL`, que pertence ao runner legado.

Antes de aplicar SQL, o bootstrap verifica URL, configuração exata, container `supabase_db_athen-gamificacao-test`, label do projeto e porta publicada. O SQL numerado é aplicado numa transação e seu manifesto SHA-256 fica no marcador administrativo `athen_test.environment`. Arquivos `v1_schema.sql`/`v2_schema.sql` e `supabase/seed.sql` não são executados. `0013_seed.sql` instala as medalhas; sua demo condicional não cria cursos em banco sem perfis.

Repetir o bootstrap com o mesmo manifesto não reaplica SQL. Se o esquema mudar, recrie este projeto descartável. Banco que já tenha `profiles` sem marcador é recusado. A sanidade usa fixtures transacionais e sempre faz rollback, inclusive após falha. O papel `authenticated` recebe claims de aluno fictício; isso testa SQL/RLS real, sem testar login HTTP ou entrega de e-mail.

`test:db:concurrency` cria fixtures próprias com UUIDs aleatórios, dois alunos, dois cursos (público/privado) e duas salas do mesmo curso. Usa conexões independentes e só libera a barreira após observar os dois alunos esperando em locks do Postgres. Confere ingresso novo, audiência, ausência de matrícula automática e rollback após falha SQL. As fixtures precisam ser confirmadas para ficarem visíveis entre conexões; são removidas ao final, depois dos workers. Uma interrupção abrupta pode deixar somente dados fictícios desse projeto descartável, que pode ser recriado. Isso ainda não prova unicidade de créditos entre tentativas concorrentes.

O job `database` do workflow prepara o mesmo projeto descartável em runner Linux, executa bootstrap, sanidade e concorrência, e para o projeto em `always()`. O log de inicialização fica no diretório ignorado para não publicar credenciais locais. A execução remota depende de publicação autorizada; validação local não a substitui.

Para demonstrar a propagação de erro, `npm run test:db:run -- --prove-failure` deve terminar com código **1**. Execute depois o comando normal, que deve terminar com **0**. Ausência de configuração, URL remota ou banco sem marcador também são falhas, nunca aprovação silenciosa.

Para parar e descartar **apenas** este projeto e repetir a instalação desde zero, confira primeiro o nome/label do container e use:

```powershell
docker inspect supabase_db_athen-gamificacao-test --format '{{json .Config.Labels}}'
# Confirme a label com.supabase.cli.project com valor athen-gamificacao-test.
npx --no-install supabase stop --workdir .supabase-test --no-backup
```

Esse comando elimina os dados locais desse projeto. Recomece pela preparação/inicialização acima. Não é necessário apagar diretórios ou volumes manualmente. O harness não é uma validação das regras futuras de missões, PAC ou ligas; sua evolução segue os tickets e o [guia de execução](../docs/planejamento-gamificacao/guia-desenvolvimento-missoes-ligas-e-pac.md).

## Referência original do template

O texto abaixo é a referência original do template de frontend.

# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])

```

You can also install [eslint-plugin-react-x](https://npmx.dev/package/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://npmx.dev/package/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])

```
