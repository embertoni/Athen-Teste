# Aplicação Athen

Cliente web React/TypeScript servido pelo Vite, com Supabase para autenticação, persistência e regras de domínio. Para trabalhar no repositório, comece por [AGENTS.md](../AGENTS.md).

## Executar localmente

Use a versão de Node definida no [workflow](../.github/workflows/ci.yml), compatível com as engines do lockfile. Use npm com o lockfile versionado.

Na raiz do repositório:

```bash
cd codigo-base
npm ci
```

Copie `.env.example` para `.env.local` nesta pasta e configure localmente `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` para o ambiente de desenvolvimento apropriado. O [cliente Supabase](src/lib/supabase.ts) lança erro ao importar se uma dessas variáveis estiver ausente; a página inicial também depende dessa importação.

As variáveis `VITE_` integram o cliente web. Use a chave pública/anon apropriada; credenciais administrativas ficam fora do cliente. Os campos `SUPABASE_TEST_*` presentes no exemplo não são consumidos pelos testes Vitest e E2E atuais.

```bash
npm run dev
```

Use o endereço informado pelo Vite. O catálogo de comandos está em [package.json](package.json), e o alcance de cada validação em [Testes](../docs/testes.md).

## Orientação no código

Consulte a [arquitetura atual](../docs/arquitetura.md) para localizar rotas, telas, consultas, layout e regras do banco. A configuração de acesso a um Supabase não aplica o SQL automaticamente: veja a [referência de banco](../docs/banco-de-dados/documentacao-bd.md) antes de preparar ou alterar um ambiente.

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
npm run test:db:learning
npm run test:db:learning:concurrency
npm run test:db:first-submissions
npm run test:db:permissions
npm run test:db:seed
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

## Skills e hooks após instalar

O lifecycle `prepare` configura Husky e chama o [lançador de links](../scripts/link-skills.mjs). Ele tenta criar `.claude/skills` e `.kiro/skills` como links para `.agents/skills`: junctions no Windows, symlinks em Linux/macOS. O lançador avisa se a criação falhar; o sucesso da instalação não garante que os links tenham sido criados.

Para tentar recriá-los sem reinstalar, execute a partir da raiz:

```bash
node scripts/link-skills.mjs
```

Os arquivos canônicos continuam disponíveis em `.agents/skills/`, mesmo sem os links. Configurações locais das ferramentas não substituem [AGENTS.md](../AGENTS.md).
