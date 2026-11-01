# PR: republicação de versão de aula ao (re)publicar curso (fatia 04.9)

**Base:** `sprint04` · **Branch:** `issue/42-republicar-versao` · **Issue:** 42

Título sugerido (< 70 caracteres):

```
feat: republica versao de aula ao (re)publicar o curso
```

## Summary

Fecha o item opcional de F4: a versão avaliável de aula deixa de ser congelada só na criação. UI/consumidor, sem migração.

```diff
 aulaRepository:
+  listarVersoes(idAula)            // lesson_versions por aula, version_number desc
+  publicarVersoesDoCurso(idCurso)  // congela versão de cada aula COM questões (consulta única)

 CriarCurso: usa publicarVersoesDoCurso(curso.id)   // mesma regra, agora reutilizável

 CrudConsole:
+  salvar curso com transição draft->published  -> publicarVersoesDoCurso
+  aba Aulas: coluna "Versão" (vN) + botão "Republicar versão" por linha
```

A RLS (0019) só deixa o criador editar questões em rascunho, então a transição **draft→published** é o gatilho significativo (editar em rascunho, republicar congela o novo conteúdo). Salvar sem transição não republica em massa. O botão por aula cobre admin e aulas de módulo novo. A autoria (criador/admin) é validada pelo servidor em `publish_lesson_version` (0027).

## Evidence

- **Before:** um curso editado em rascunho e republicado nunca atualizava suas versões; `publicarVersao` só era chamado em `CriarCurso`.
- **After (E2E):** `profile-permissions.spec.ts` "CRUD republica a versão de uma aula pela ação por linha" — a aba Aulas mostra "v1" (lido por `listarVersoes`), o botão "Republicar versão" chama `publish_lesson_version` para a aula certa (`rpcCalls == [{ p_lesson_id }]`) e o toast confirma "Versão 2 publicada".
- **Regressão de criação:** a refatoração de `CriarCurso` é comportamento-preservável — o conjunto de aulas que congela versão continua {aulas com questões} do curso publicado; os 31 E2E (inclui o fluxo de sala/aula) passam.
- **Pipeline:** lint, typecheck, test:run (2/2), test:check, build — aprovados.
- **E2E Chromium:** 31 passed (30 anteriores + republicação).
- **Revisão em dois eixos (Padrões/Spec)** por subagentes de leitura: SATISFIED. Ajustes aplicados: consulta única no lugar do N+1 em `publicarVersoesDoCurso`; `listarVersoes` passou a ser consumido (coluna "Versão", antes era código morto); ramo objeto/array no mock; recarga após republicar; `type="button"` nos botões.

## Merge Danger

**Door:** two-way — mudança de cliente, sem migração; reversível por reverter o commit.

**Blast Radius:** criação e (re)publicação de curso. A refatoração de `CriarCurso` é equivalente (congela as mesmas aulas). O gatilho novo só dispara na transição draft→published; salvar um curso já publicado não re-congela. O botão por aula só faz trabalho real para admin/aula de módulo novo (criador em curso publicado re-congela conteúdo idêntico, inofensivo). Nenhuma autoridade de pagamento ou SQL muda. Sem SQL remoto, sem deploy; integração exige autorização própria.

## Uso de IA

- Ferramenta(s): Kiro CLI.
- Escopo gerado por IA: `listarVersoes`/`publicarVersoesDoCurso`, refatoração de `CriarCurso`, publicação na transição e botão por aula no `CrudConsole`, teste E2E, documentação.
- Revisado e validado localmente por: <responsável>.
