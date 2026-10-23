# Mudanças: instalação de skills + configuração de agentes

Este documento lista tudo o que foi adicionado ao repositório na configuração de
**agent skills** e dos arquivos de instrução de agente, para que a mesma mudança
possa ser reproduzida **manualmente no repositório upstream** (`VitorSoaresGoncalves/Athen`).

Nada aqui altera código da aplicação — são apenas arquivos de documentação/config
para agentes de IA.

## Visão geral

A configuração tem três partes:

1. **Skills instaladas** de um repositório público (`mattpocock/skills`), guardadas em
   `.agents/skills/`.
2. **Arquivos de entrada para agentes** na raiz: `AGENTS.md` (fonte única da verdade)
   e dois ponteiros finos, `CLAUDE.md` e `KIRO.md`, que apenas remetem ao `AGENTS.md`.
3. **Configuração por-repo das skills de engenharia** (gerada pela skill
   `setup-matt-pocock-skills`): um bloco `## Agent skills` no `AGENTS.md` e três docs
   em `docs/agents/`.

## Arquivos adicionados

### 1. Skills (`.agents/skills/`)

- Pasta `.agents/skills/` com uma subpasta por skill (cada uma com `SKILL.md` e
  arquivos de apoio). São 103 arquivos no total.
- `skills-lock.json` na raiz: arquivo de lock gerado pelo instalador, que registra a
  origem (`mattpocock/skills`, GitHub), o caminho de cada skill e o hash.

**Como reproduzir no upstream:** instalar o mesmo conjunto de skills a partir de
`mattpocock/skills` (mesmo processo/instalador usado aqui), o que recria
`.agents/skills/` e o `skills-lock.json`. Alternativamente, copiar as duas coisas
deste repositório.

> Observação sobre `.claude/` e `.kiro/skills/`: o instalador também cria junctions
> (links de diretório do Windows) nessas pastas apontando para `.agents/skills/`. O
> git **não** versiona esses junctions, então eles não aparecem em commits e não
> precisam ser reproduzidos. A fonte canônica é sempre `.agents/skills/`.

### 2. Arquivos de entrada para agentes (raiz)

- **`AGENTS.md`** — fonte única da verdade para qualquer agente. Explica que as skills
  vivem em `.agents/skills/`, como descobri-las/usá-las, e contém o bloco
  `## Agent skills` (ver parte 3). Remete também às regras do projeto em
  `docs/fluxo-de-trabalho-ia.md`.
- **`CLAUDE.md`** — ponteiro fino: manda ler `AGENTS.md`. Sem instruções próprias.
- **`KIRO.md`** — ponteiro fino: manda ler `AGENTS.md`. Observa que `.kiro/steering/`
  (config de steering do Kiro) é algo separado das skills e deve ser mantido.

**Como reproduzir no upstream:** copiar os três arquivos. Se o upstream já tiver um
`AGENTS.md` ou `CLAUDE.md`, mesclar o conteúdo em vez de sobrescrever.

### 3. Configuração das skills de engenharia

Gerada pela skill `setup-matt-pocock-skills` com as escolhas:

- **Issue tracker:** markdown local em `.scratch/<feature-slug>/` (o trabalho real do
  time é rastreado externamente no YouTrack; o `.scratch/` é só a superfície de issues
  para os agentes neste repo).
- **Triage labels:** vocabulário padrão de cinco papéis (`needs-triage`, `needs-info`,
  `ready-for-agent`, `ready-for-human`, `wontfix`).
- **Domain docs:** single-context (um `GLOSSARY.md` + `docs/adr/` na raiz).
- **Arquivo editado:** o bloco `## Agent skills` foi colocado em `AGENTS.md`.

Arquivos:

- **`AGENTS.md`** — recebeu, ao final, o bloco `## Agent skills` com três subseções
  (Issue tracker, Triage labels, Domain docs), cada uma remetendo ao doc detalhado.
- **`docs/agents/issue-tracker.md`** — convenções do tracker local em `.scratch/`
  (uma feature por pasta, `spec.md`, `issues/NN-<slug>.md`, linha `Status:`, operações
  do `wayfinder`); nota de que o trabalho real fica no YouTrack.
- **`docs/agents/triage-labels.md`** — mapeamento dos cinco papéis canônicos para os
  rótulos do tracker (iguais aos nomes padrão); nota de que, em tracker markdown, o
  "rótulo" é o valor da linha `Status:`.
- **`docs/agents/domain.md`** — regras de consumo dos docs de domínio (ler `GLOSSARY.md`
  e `docs/adr/` antes de explorar; usar o vocabulário do glossário; sinalizar conflitos
  com ADRs); layout single-context.

**Como reproduzir no upstream:** rodar a skill `setup-matt-pocock-skills` e responder
com as mesmas escolhas acima, **ou** copiar o bloco `## Agent skills` para o `AGENTS.md`
e copiar os três arquivos de `docs/agents/`.

## O que NÃO foi criado

- **`.scratch/`** — não foi criado. Por convenção, as skills criam essa pasta no
  primeiro uso.
- **Rótulos em tracker remoto** — não se aplica (tracker é markdown local).
- A CLI `gh` não está instalada nesta máquina; não é necessária para o tracker local.

## Resumo dos caminhos a replicar

```
.agents/skills/            (103 arquivos — as skills)
skills-lock.json           (lock da instalação)
AGENTS.md                  (fonte única + bloco "## Agent skills")
CLAUDE.md                  (ponteiro para AGENTS.md)
KIRO.md                    (ponteiro para AGENTS.md)
docs/agents/issue-tracker.md
docs/agents/triage-labels.md
docs/agents/domain.md
docs/mudancas-skills-setup.md   (este arquivo)
```
