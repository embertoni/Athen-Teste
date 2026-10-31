# Proposta de encaminhamento — issue 42

Estado: [PR #2 no Athen-Teste](https://github.com/embertoni/Athen-Teste/pull/2) integrado pelo usuário em `2d55fd3e6999ccbbd09655e1939f66eabcc00624`. Infraestrutura conciliada contra essa sprint04 e revalidada localmente. Push e criação deste PR já autorizados; aprovação humana adicional dispensada expressamente pelo usuário neste fork. Merge deste novo PR ainda requer autorização própria.

**Base atual e limite da evidência:** origin/sprint04 em `2d55fd3`, incorporada na branch de infraestrutura por merge preservando os commits anteriores. Único conflito no README resolvido mantendo setup da aplicação e banco isolado; nenhum diff de páginas, Playwright ou E2E contra a sprint integrada. A API do fork lista zero workflows; arquivo ci.yml está na sprint, mas não em main (branch padrão). Gatilhos de push passam a incluir sprints; CI remota só será declarada após execução real.

**Único destino de escrita:** `embertoni/Athen-Teste`, branch `issue/42-testes-banco-gamificacao` → `sprint04`. Por instrução explícita de 31/10/2026, **VitorSoaresGoncalves/Athen permanece somente leitura**, inclusive após esta entrega. Não criar PR, branch, commit, comentário ou alteração de configuração no original. A sincronização usa o original apenas como fonte de leitura e tem o fork como destino; resolução dos conflitos e merge do PR #2 já autorizados.

**Título proposto:** `test: prepara validacao SQL isolada para gamificacao`

**Sequência de commits locais autorizada:**

1. **a5e199befeb263a95d65c0aa225f618b185a9ec9** — `docs: registra planejamento aprovado da gamificacao`: quatro documentos de planejamento preservando as respostas, spec/contratos/tickets locais, glossário, ADR e índice documental.
2. **5b7a210eac7093f0ba701d954ea08b1be75d51b2** — `test: prepara infraestrutura SQL e CI para gamificacao`: scripts/harness/configuração de ensaio, tipagem e comandos, dependência de tipos pg, CI e referências de execução/testes/banco.
3. `docs: registra commits da infraestrutura de gamificacao` — referências efetivas dos dois commits e estado de encaminhamento.

Este arquivo é versionado como proposta para revisão, preservando o link do guia. Os quatro documentos de planejamento que existiam sem versionamento foram adicionados; as respostas e propostas tiveram conteúdo literal e hashes dos arquivos locais conferidos. Nenhum arquivo .env, estado .supabase-test, credencial ou artefato de execução entrou nos commits.

**Sequência:** base integrada, conciliação e validação local concluídas; publicar a infraestrutura no fork e abrir PR para sprint04, acompanhar CI e corrigir falhas demonstráveis no mesmo escopo. A revisão humana adicional foi dispensada pelo usuário, conforme exceção em Convenções. Depois de autorizado e integrado este PR, criar a branch dependente do núcleo a partir da sprint atualizada.

---

## Summary

O runner SQL legado é interativo e não valida com segurança o esquema atual. Esta entrega adiciona bootstrap, sanidade e concorrência em Supabase local exclusivo, com um job descartável na CI, antes do núcleo de aprendizagem, missões, ligas e PAC.

```text
projeto Supabase local exclusivo
  verificar destino e identidade do container
  bootstrap do SQL numerado + manifesto
  sanidade como aluno com RLS
  duas conexões concorrentes + rollback
  limpeza de dados fictícios e parada do projeto
```

Inclui o planejamento aprovado e seus contratos/tickets, preservando as fontes literais. A CI mantém Node 24.19.0 já integrado pelo PR #2 e recebe o job database, push nas sprints e dispatch manual (este depende do arquivo na branch padrão). Regras novas de crédito, missões, PAC e temporadas ainda não foram implementadas. Nenhuma página de produto difere da sprint integrada. A dispensa de revisão adicional foi registrada somente para o Athen-Teste.

## Evidence

- **Before:** runner legado sem ambiente isolado, seleção segura de migrações ou job SQL automatizado.
  **After:** scripts recusam destino remoto, conferem container/configuração/marcador e executam sanidade e concorrência no projeto athen-gamificacao-test. Node 24.19.0 preservado nos três jobs; YAML conferido.
- Bootstrap de 0001–0022 comprovado em duas instalações do zero; reaplicação com manifesto igual não repete SQL. v1/v2 legados e seed.sql excluídos.
- Sanidade sob authenticated/aluno com RLS: conclusão idempotente, progresso e zero XP. Concorrência: dois PIDs/claims, barreira observada em pg_locks, duas salas, curso privado, ingresso sem matrícula e rollback após falha SQL.
- Falha intencional retorna 1; repetição normal retorna 0. URL ausente/remota e configuração alterada são recusadas.
- Pipeline após conciliação aprovado: lint, typecheck, test:run (2/2), test:check, build e test:db:check. Chromium: **19/19, saída 0, 28,2s**, com dois workers, preview fictício exclusivo e build sequencial. Bootstrap reconheceu manifesto sem reaplicar SQL; sanidade e concorrência retornaram 0.
- Revisão técnica final contra a sprint integrada: Padrões sem achados materiais; Spec sem defeito funcional, com dois estados documentais obsoletos corrigidos antes da publicação. Revisão humana adicional dispensada pelo usuário. Respostas e propostas preservadas por SHA-256 (3/3).

Ambiente validado: Windows, Node 24.19.0, Docker 29.9.2 Linux, Supabase CLI 2.121.0 e imagem Postgres 17.11.0.004. Container confirmado `0a25183e82e6`, label athen-gamificacao-test e banco em 127.0.0.1:55432; parado com volume preservado. **A API lista zero workflows no fork; execução remota ainda não comprovada.** Os E2E usam respostas HTTP controladas; não comprovam login real ou as regras futuras. A limitação preexistente da sidebar em 360px e o trigger room_members.updated_at continuam registrados, sem correção neste escopo.

## Merge Danger

**Door:** two-way

Configuração e infraestrutura de ensaio reversíveis; nenhuma migração de produto nova nem mudança em banco remoto. O projeto de teste é exclusivo, com dados fictícios; containers foram parados preservando o volume local.

**Blast Radius:** validação

Afeta jobs de CI, ferramentas de teste e documentação. O novo job depende de Docker/download de imagens no runner; sua execução remota precisa ser confirmada. Aviso de bundle grande, seção inbucket obsoleta e vulnerabilidades reportadas pelas dependências permanecem registrados no guia, sem atualização de escopo automática.

O ensaio encontrou defeito preexistente no reingresso em salas: trigger tenta atualizar coluna inexistente em room_members. Ticket local 05 registra a reprodução; esta entrega não corrige nem declara esse caminho homologado. O teste concorrente cobre ingresso novo.

### Uso de IA

- Ferramenta(s): Codex; subagentes de revisão somente de leitura.
- Escopo gerado por IA: preparação documental, harness SQL local, testes, configuração de CI e referências de execução.
- Revisado e validado localmente por: Codex com checagens automatizadas e revisão técnica nos eixos Padrões/Spec; revisão humana adicional dispensada expressamente pelo responsável neste fork.
