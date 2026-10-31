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

## Skills e hooks após instalar

O lifecycle `prepare` configura Husky e chama o [lançador de links](../scripts/link-skills.mjs). Ele tenta criar `.claude/skills` e `.kiro/skills` como links para `.agents/skills`: junctions no Windows, symlinks em Linux/macOS. O lançador avisa se a criação falhar; o sucesso da instalação não garante que os links tenham sido criados.

Para tentar recriá-los sem reinstalar, execute a partir da raiz:

```bash
node scripts/link-skills.mjs
```

Os arquivos canônicos continuam disponíveis em `.agents/skills/`, mesmo sem os links. Configurações locais das ferramentas não substituem [AGENTS.md](../AGENTS.md).
