# 04.9: Republicar versão de aula ao editar/republicar curso

Status: claimed

**Issue de equipe:** 42; sprint04; Em andamento. Branch `issue/42-republicar-versao`, derivada da sprint04 atualizada (`b4d21ce`, merge do PR #11). Fatia local do ticket 04 / Sessão 02 (item opcional de F4 que ficou como pendência em 04.8). Não é novo ID do YouTrack. Sem migração — camada de cliente e testes.

**Contexto (confirmado por investigação):**
- A única tela que gerencia curso já criado é `CrudConsole` (`/crud`); `CriarCurso` é só criação.
- `aulaRepository.publicarVersao` (RPC `publish_lesson_version`, 0027) é chamado **só** na criação, em `CriarCurso`, sob a regra "curso `published` + aula com questões".
- A RLS 0019 só deixa o criador editar questões enquanto o curso está `draft`; admin sempre. Logo o gatilho **significativo** para congelar nova versão é a transição **draft→published** (editar em rascunho, republicar), ou a edição por admin, ou aulas de módulo novo pós-publicação.
- `CrudConsole` muda status por `cursoRepository.atualizar({status})`; **nem `atualizar` nem `publicar` publicam versões hoje** — um curso editado em rascunho e republicado nunca tem suas versões atualizadas (lacuna real). Não existe leitura de `lesson_versions` no cliente.

## O que construir (sem migração)

1. **Helper reutilizável de publicação** — extrair a regra que `CriarCurso` já usa para um método de repositório `aulaRepository.publicarVersoesDoCurso(idCurso)` (ou equivalente) que, para cada aula do curso com questões, chama `publish_lesson_version`. `CriarCurso` passa a reutilizar o helper (sem mudar comportamento). 
2. **Publicar versão na (re)publicação do curso** — em `CrudConsole`, ao salvar um curso com transição para `published` (status anterior ≠ published e novo = published), publicar as versões das aulas com questões, espelhando a regra da criação. Fecha a lacuna do curso republicado.
3. **Botão "Republicar versão" por aula** — na aba Aulas do `CrudConsole`, ação por aula que chama `publicarVersao(aula.id)` (útil para admin e aulas de módulo novo). Usa o padrão `loading`/`notify` existente.
4. **Leitura da versão atual** — `aulaRepository.listarVersoes(idAula)` lendo `lesson_versions` por `lesson_id` (desc), para mostrar o número da versão corrente ao lado da aula. RLS `lesson_versions_select` já permite ao criador/admin ler.

## Ponto de teste (seams)

- E2E/CrudConsole: salvar um curso com transição draft→published dispara `publish_lesson_version` para as aulas com questões; salvar sem transição (ou mantendo published) não dispara em massa; o botão por aula dispara uma publicação.
- Repositório: `publicarVersoesDoCurso` publica só aulas com questões; `listarVersoes` lê por aula.
- Regressão: `CriarCurso` continua publicando a versão inicial (E2E/fluxo de criação inalterado).

**Minimização de testes (a pedido do usuário):** manter a prova central (transição dispara publicação das aulas com questões; botão por aula dispara uma; criação inalterada). Cortar variações redundantes de UI já cobertas.

## Critérios de conclusão

- [ ] A regra de publicação por aula com questões fica num helper reutilizado por `CriarCurso` (comportamento de criação inalterado).
- [ ] Salvar um curso com transição para `published` publica a versão das aulas com questões; sem transição não publica em massa.
- [ ] Botão "Republicar versão" por aula publica uma nova versão da aula.
- [ ] `listarVersoes` lê as versões da aula; a versão corrente aparece na aba Aulas.
- [ ] Pipeline e testes de UI/E2E aprovados; revisão em dois eixos (Padrões/Spec).

## Compatibilidade

Sem migração. Graduação-contra-snapshot continua fora (decisão sua). Sessão 03 (PAC), temporadas e missões são sessões próprias. Sem SQL remoto, sem deploy.

## Autoria de IA

- Ferramenta: Kiro CLI.
- Escopo gerado por IA: helper de publicação, gatilho na republicação do curso, botão por aula, `listarVersoes`, testes, documentação.
- Revisado e validado localmente por: <responsável>.
