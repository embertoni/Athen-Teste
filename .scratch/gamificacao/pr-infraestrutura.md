# Proposta de encaminhamento — issue 42

Estado: commits e proposta de PR de infraestrutura preparados. A sincronização foi autorizada e aberta separadamente como [PR #2 no Athen-Teste](https://github.com/embertoni/Athen-Teste/pull/2), em draft, com 25 arquivos em conflito. O PR de infraestrutura aguarda essa base ser resolvida/revisada/integrada; merge permanece sem autorização.

**Bloqueio real do destino:** origin/sprint04 está em `59bfd138bc79fb3ce6513e04a645de2fa64c4c1a`; a base local usada está em `2c3d19dd6b92a44967c950d5bc03b5cb19f42e02`. O PR #2 propõe essa sincronização exclusivamente no fork. As referências divergem e o diff origin/sprint04...infraestrutura inclui trabalho histórico anterior à entrega. A publicação separada evita apresentar esse conjunto como infraestrutura já revisada. Nenhuma base remota foi alterada; os conflitos e a revisão do PR #2 precisam ser tratados antes do encaminhamento dependente.

**Único destino de escrita:** `embertoni/Athen-Teste`, branch `issue/42-testes-banco-gamificacao` → `sprint04`. Por instrução explícita de 31/10/2026, **VitorSoaresGoncalves/Athen permanece somente leitura**, inclusive após esta entrega. Não criar PR, branch, commit, comentário ou alteração de configuração no original. A sincronização proposta usa o original apenas como fonte de leitura e tem o fork como destino; ainda aguarda decisão de escopo.

**Título proposto:** `test: prepara validacao SQL isolada para gamificacao`

**Sequência de commits locais autorizada:**

1. **a5e199befeb263a95d65c0aa225f618b185a9ec9** — `docs: registra planejamento aprovado da gamificacao`: quatro documentos de planejamento preservando as respostas, spec/contratos/tickets locais, glossário, ADR e índice documental.
2. **5b7a210eac7093f0ba701d954ea08b1be75d51b2** — `test: prepara infraestrutura SQL e CI para gamificacao`: scripts/harness/configuração de ensaio, tipagem e comandos, dependência de tipos pg, CI e referências de execução/testes/banco.
3. `docs: registra commits da infraestrutura de gamificacao` — referências efetivas dos dois commits e estado de encaminhamento.

Este arquivo é versionado como proposta para revisão, preservando o link do guia. Os quatro documentos de planejamento que existiam sem versionamento foram adicionados; as respostas e propostas tiveram conteúdo literal e hashes dos arquivos locais conferidos. Nenhum arquivo .env, estado .supabase-test, credencial ou artefato de execução entrou nos commits.

**Sequência:** commits locais da entrega concluídos; registro documental final nesta alteração. Após nova autorização para push/PR, reconferir remotos/base, publicar essa branch no fork, abrir PR para sprint04, acompanhar CI e corrigir falhas demonstráveis dentro do mesmo escopo. O merge depende da aprovação de outra pessoa conforme Convenções e de autorização própria. Só depois de integrado, criar a branch dependente do núcleo a partir da sprint atualizada.

---

## Summary

O projeto tinha um runner SQL legado interativo e uma versão de Node na CI incompatível com as dependências atuais. Esta entrega prepara a validação isolada necessária antes do núcleo de aprendizagem, missões, ligas e PAC.

```text
projeto Supabase local exclusivo
  verificar destino e identidade do container
  bootstrap do SQL numerado + manifesto
  sanidade como aluno com RLS
  duas conexões concorrentes + rollback
  limpeza de dados fictícios e parada do projeto
```

Inclui o planejamento aprovado e seus contratos/tickets. A CI usa Node 24.19.0 e recebe um job database descartável. Regras novas de crédito, missões, PAC e temporadas ainda não foram implementadas.

## Evidence

- **Before:** Node 22.12.0 era incompatível com 18 das 278 declarações de engines verificadas no lockfile; o runner legado não validava o esquema atual de forma automatizada confiável.
  **After:** Node 24.19.0 satisfaz as declarações verificadas; jobs quality/e2e/database alinhados, YAML conferido.
- Bootstrap de 0001–0022 comprovado em duas instalações do zero; reaplicação com manifesto igual não repete SQL. v1/v2 legados e seed.sql excluídos.
- Sanidade sob authenticated/aluno com RLS: conclusão idempotente, progresso e zero XP. Concorrência: dois PIDs/claims, barreira observada em pg_locks, duas salas, curso privado, ingresso sem matrícula e rollback após falha SQL.
- Falha intencional retorna 1; repetição normal retorna 0. URL ausente/remota e configuração alterada são recusadas.
- Pipeline local aprovado: lint, typecheck, test:run (2/2), test:check, build e test:db:check. Chromium: 12/12, saída 0, com dois workers fora da sandbox. Execução anterior na sandbox foi interrompida no encerramento e não foi considerada aprovação completa.
- Padrões e Spec revisados separadamente; sem achados materiais restantes. Respostas e propostas preservadas por SHA-256.

Ambiente validado: Windows, Node 24.19.0, Docker 29.9.2 Linux, Supabase CLI 2.121.0 e imagem Postgres 17.11.0.004. **A execução remota no GitHub/Linux ainda precisa ocorrer após publicação.** Os E2E existentes usam respostas HTTP controladas; não comprovam login real ou as regras futuras.

## Merge Danger

**Door:** two-way

Configuração e infraestrutura de ensaio reversíveis; nenhuma migração de produto nova nem mudança em banco remoto. O projeto de teste é exclusivo, com dados fictícios; containers foram parados preservando o volume local.

**Blast Radius:** validação

Afeta jobs de CI, ferramentas de teste e documentação. O novo job depende de Docker/download de imagens no runner; sua execução remota precisa ser confirmada. Aviso de bundle grande, seção inbucket obsoleta e vulnerabilidades reportadas pelas dependências permanecem registrados no guia, sem atualização de escopo automática.

O ensaio encontrou defeito preexistente no reingresso em salas: trigger tenta atualizar coluna inexistente em room_members. Ticket local 05 registra a reprodução; esta entrega não corrige nem declara esse caminho homologado. O teste concorrente cobre ingresso novo.

### Uso de IA

- Ferramenta(s): Codex; subagentes de revisão somente de leitura.
- Escopo gerado por IA: preparação documental, harness SQL local, testes, configuração de CI e referências de execução.
- Revisado e validado localmente por: Codex com checagens automatizadas e revisão nos eixos Padrões/Spec; revisão humana independente pendente.
