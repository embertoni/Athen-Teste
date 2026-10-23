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
4. **Recriação automática dos links de skills** para que outros desenvolvedores
   tenham o mesmo setup ao clonar: scripts multiplataforma + ligação ao `npm install`.

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

> Observação sobre `.claude/skills/` e `.kiro/skills/`: essas pastas são apenas
> **links** para `.agents/skills/` (junction no Windows, symlink no Linux/macOS). O
> git **não** versiona links de forma confiável entre sistemas, então eles não são
> commitados — são recriados por script (ver parte 4). A fonte canônica é sempre
> `.agents/skills/`.

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

### 4. Recriação automática dos links de skills

Como os links `.claude/skills/` e `.kiro/skills/` não podem ser versionados, foram
adicionados scripts que os recriam a partir de `.agents/skills/`, ligados ao
`npm install` para rodarem sozinhos após clonar.

Arquivos:

- **`scripts/link-skills.sh`** — Linux/macOS: recria `.claude/skills` e `.kiro/skills`
  como **symlinks** para `../.agents/skills`. Marcado como executável (`100755`).
- **`scripts/link-skills.ps1`** — Windows: recria as mesmas pastas como **junctions**
  (não exigem admin nem Developer Mode).
- **`scripts/link-skills.mjs`** — lançador cross-platform em Node: detecta o SO e chama
  o script certo. É à prova de falha — se `.agents/skills` não existir ou o shell não
  estiver disponível, apenas avisa e sai com sucesso, sem quebrar o `npm install`.
- **`.gitignore`** (na raiz) — ignora `/.claude/skills/` e `/.kiro/skills/` para os
  links gerados nunca serem commitados. `.agents/skills/` e `.kiro/steering/` continuam
  versionados normalmente.
- **`codigo-base/package.json`** — o script `prepare` (que roda automaticamente no
  `npm install`) passou a chamar também `node scripts/link-skills.mjs`. Linha final:
  `"prepare": "cd .. && husky codigo-base/.husky && node scripts/link-skills.mjs"`.
- **`docs/fluxo-de-trabalho-ia.md`** — nova seção 9 explicando que os links são
  recriados automaticamente no `npm install`, com os comandos manuais como alternativa.

Resultado para quem clona: rodar `npm install` dentro de `codigo-base/` recria os
links sozinho; nenhum passo manual é necessário.

**Como reproduzir no upstream:** copiar os três arquivos de `scripts/`, o `.gitignore`
da raiz, a seção 9 de `docs/fluxo-de-trabalho-ia.md`, e aplicar a mesma alteração no
`prepare` do `codigo-base/package.json`. Se o upstream já tiver um `.gitignore` na raiz
ou um `prepare`, mesclar em vez de sobrescrever.

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
scripts/link-skills.sh     (recria os links no Linux/macOS)
scripts/link-skills.ps1    (recria os links no Windows)
scripts/link-skills.mjs    (lançador cross-platform, chamado no npm install)
.gitignore                 (ignora os links gerados .claude/.kiro skills)
codigo-base/package.json   (prepare chama o lançador no npm install)
docs/fluxo-de-trabalho-ia.md (seção 9 — setup das skills ao clonar)
docs/mudancas-skills-setup.md   (este arquivo)
```
