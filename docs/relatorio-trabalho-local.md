# Relatório do trabalho local — Athen (branch `sprint04`)

Este documento descreve tudo o que foi feito **localmente** no fork, a partir do
ponto em que a `sprint04` se separou do upstream (`VitorSoaresGoncalves/Athen`).
Ponto de bifurcação: commit `c4dcdfa` (merge do PR #32). Nada foi enviado para o
upstream — todo o trabalho vive localmente na `sprint04` e nas suas branches de
feature `issue/39-*`, integradas via `git merge --no-ff`.

O trabalho seguiu duas fases:

- **Fase 1 — estrutura e visual** (`issue/39-configura-*`): padronização da casca
  das páginas, remoção de conteúdo fake, identidade visual e componentes de layout.
- **Fase 2 — dados reais** (`issue/39-banco-*`): ligação de cada página ao Supabase.

Todas as branches passaram pelo pipeline local (`lint`, `typecheck`, `test:run`,
`test:check`, `build`) antes do merge.

> Observação: as branches antigas `issue/24-*`, `issue/autenticacao-supabase`,
> `issue/estruturar-página-login` e `issue/pagina-inicial` são anteriores a esta
> linha de trabalho e não fazem parte do escopo da `sprint04` descrita aqui.

---

## Catálogo (antiga "Cursos")

**Branches envolvidas:** `issue/39-configura-cursos`, `issue/39-banco-catalogo`

| Arquivo | O que foi feito |
|---|---|
| `src/pages/Cursos.{tsx,css}` | Removido conteúdo de exemplo e adotado o `PageLayout`; a página foi depois renomeada (arquivos substituídos por `Catalogo.*`). |
| `src/pages/Catalogo.{tsx,css}` | Renomeação de "Cursos" para "Catálogo" com o design padrão da plataforma; depois: cursos reais com busca, filtro por categoria, detalhe e matrícula; cards no estilo do upstream usando só dados do banco; e por fim o pop-up de detalhe do curso reformulado para ter o **mesmo layout, paleta e proporções do upstream**, mostrando apenas dados reais (módulos/aulas, avaliação média, avaliação do próprio usuário, progresso e taxa de acerto). |
| `src/Hub.tsx` | Rota e navegação atualizadas para o novo nome "Catálogo". |
| `src/components/sidebar/SidebarLeft.tsx` | Item de menu atualizado de "Cursos" para "Catálogo". |

Exclusões mantidas: criação de curso (botão "Criar curso" permanece desabilitado)
e a tela de criação de aulas.

---

## Dashboard

**Branches envolvidas:** `issue/39-configura-dashboard`

A branch de dados (`issue/39-banco-dashboard`) não foi necessária: o núcleo de
dados do Dashboard (trilha, aulas, XP) foi implementado dentro da própria
branch de configuração junto com o `LessonModal`.

| Arquivo | O que foi feito |
|---|---|
| `src/pages/Dashboard.{tsx,css}` | Padronização da casca com `PageLayout`; restauração do layout da trilha/cabeçalho/carrossel; rolagem horizontal da trilha pela roda do mouse (com reanexo do listener após o loading); botão do notebook e seletor de curso/sala; alinhamento do seletor; integração do `LessonModal` real (conclui aulas e dá XP; aula sem questões é concluída sem XP); trava visual dos nós posteriores ao atual na trilha; e o seletor passou a listar **apenas os cursos em que o usuário está matriculado**. |
| `src/components/lesson/LessonModal.{tsx,css}` | Card de aula portado do upstream e adaptado para concluir aulas com XP e também aulas sem questões (sem XP). |
| `src/data/repositories.ts` | Repositórios usados pela conclusão de aulas, incluindo a chamada direta da RPC `complete_empty_lesson` (correção do binding). |

---

## Salas

**Branches envolvidas:** `issue/39-configura-salas`, `issue/39-banco-salas`

| Arquivo | O que foi feito |
|---|---|
| `src/pages/Salas.{tsx,css}` | Removido conteúdo de exemplo e adotado o `PageLayout`; aplicado o design padrão da plataforma; e ligação ao banco: minhas salas, entrar por código, criar sala e tela de detalhe. |

---

## Ranking (antiga "Ligas")

**Branches envolvidas:** `issue/39-configura-ligas`, `issue/39-banco-ranking`

| Arquivo | O que foi feito |
|---|---|
| `src/pages/Ligas.{tsx,css}` | Removido conteúdo de exemplo, adotado o `PageLayout` e aplicado o design padrão; depois a página foi renomeada para "Ranking". |
| `src/pages/Ranking.{tsx,css}` | Renomeação de "Ligas" para "Ranking" (XP global); ativação do ranking global real conectado ao banco. |
| `src/Hub.tsx` | Rota/navegação atualizadas para "Ranking". |
| `src/components/sidebar/SidebarLeft.tsx` | Item de menu atualizado de "Ligas" para "Ranking". |

---

## Amigos

**Branches envolvidas:** `issue/39-configura-amigos`, `issue/39-banco-amigos`

| Arquivo | O que foi feito |
|---|---|
| `src/pages/Amigos.{tsx,css}` | Removido conteúdo de exemplo e adotado o `PageLayout`; aplicado o design padrão; adoção da mesma casca "bare" de Catálogo/Salas; e ligação ao banco: abas, busca, pedidos de amizade e lembrete. |

---

## Cadernos (Notebook)

**Branches envolvidas:** `issue/39-configura-notebook`

| Arquivo | O que foi feito |
|---|---|
| `src/pages/Notebook.tsx` | Padronização da casca com `PageLayout` e alinhamento ao padrão das demais páginas; aplicação do design padrão; ajustes do cabeçalho e do título (peso 400) para ficar igual às outras páginas. |

---

## Configurações

**Branches envolvidas:** `issue/39-configura-config`, `issue/39-banco-configuracoes`

| Arquivo | O que foi feito |
|---|---|
| `src/pages/ConfigPage.{tsx,css}` | Removido conteúdo de exemplo e adotado o `PageLayout`; alinhamento aos tokens de design; ajustes de cabeçalho/recuo; redesenho na mesma casca das demais páginas; e ligação ao banco: perfil, preferências, troca de senha e exclusão de conta. |

---

## Perfil

**Branches envolvidas:** `issue/39-configura-profile`

| Arquivo | O que foi feito |
|---|---|
| `src/pages/profile/Profile.{tsx,css}` | Padronização da casca com `PageLayout`; uso dos tokens centralizados em `index.css`; e aumento do espaçamento em relação à sidebar (padrão das configurações). |

---

## Login e Registro

**Branches envolvidas:** `issue/39-configura-login-registro`

| Arquivo | O que foi feito |
|---|---|
| `src/pages/LoginPage.tsx` | Aplicada a identidade visual do Athen. |
| `src/pages/RegisterPage.tsx` | Aplicada a identidade visual do Athen. |

---

## Notificações

**Branches envolvidas:** `issue/39-configura-notificacoes`, `issue/39-banco-notificacoes`

| Arquivo | O que foi feito |
|---|---|
| `src/pages/Notificacoes.{tsx,css}` | Nova página de notificações (posicionada entre Cadernos e Configuração); depois a caixa de notificações foi ativada com dados reais do banco. |
| `src/Hub.tsx` | Nova rota de Notificações. |
| `src/components/sidebar/SidebarLeft.tsx` | Novo item de menu de Notificações. |

---

## Sidebars

**Branches envolvidas:** `issue/39-configura-sidebars`

| Arquivo | O que foi feito |
|---|---|
| `src/components/sidebar/SidebarLeft.tsx` | Rework visual da sidebar esquerda: logo + "Athen", botão de perfil com banner e streak; botão de perfil em linha única com menu "Ver perfil / Sair da conta"; e cache do perfil (carrega uma vez). |
| `src/components/sidebar/SidebarRight.tsx` | Barra top-down sem dados falsos, com aviso de banco não conectado e visual sem a borda neon. |

> Os itens de menu (Catálogo, Ranking, Notificações) também foram ajustados na
> `SidebarLeft.tsx` pelas branches das respectivas páginas — descritos nas suas seções.

---

## Layout compartilhado

**Branches envolvidas:** `issue/39-configura-layout`

| Arquivo | O que foi feito |
|---|---|
| `src/components/layout/PageLayout.tsx` | Novo layout padrão de página; variante `bare` não impõe fundo/flex próprios; página passa a controlar o offset da sidebar; variante `contained` usa os tokens `canvas`/`ink`. |
| `src/components/layout/DatabaseNotConnected.tsx` | Novo componente de aviso de "banco não conectado", usado no lugar de conteúdo fake. |

---

## Tokens de design

**Branches envolvidas:** trabalho direto na `sprint04` (ver seção abaixo)

| Arquivo | O que foi feito |
|---|---|
| `src/index.css` | Centralização dos tokens de design (`canvas`, `surface`, `ink`, `muted`, `line`, paleta `gold`/`violet`) usados por todas as páginas internas. |

---

## Migrações (banco de dados)

**Branches envolvidas:** `issue/39-configura-migracao`, `issue/39-configura-seed`,
além das correções feitas na `issue/39-configura-dashboard`.

Migrações `0001`–`0020` e `v1_schema`/`v2_schema` vêm do upstream. As adições
locais foram:

| Arquivo | O que foi feito |
|---|---|
| `supabase/migrations/0021_module_icon_question_explanation_course_duration.sql` | Migração complementar: `modules.icon` (ícone do módulo, padrão `📘`), `questions.explanation` (explicação opcional da questão) e `courses.duration_minutes` (duração calculada por triggers). |
| `supabase/migrations/0022_complete_empty_lesson.sql` | Função de servidor `complete_empty_lesson`, que permite concluir aulas sem questões (gravando em `completions`, já que o cliente não pode por RLS). Inclui a correção do `RAISE` que estava sem argumento para o placeholder do curso. |
| `supabase/seed.sql` | Seed de teste: contas (com papel admin), cursos de vários usuários e salas com membros. |
| `src/types/database.ts` | Regenerado (`supabase gen types`) após a 0021 e novamente após a 0022. É arquivo **gerado** — nunca editado à mão. |
| `.gitignore` | Passou a ignorar `supabase/.temp`. |

---

## Trabalho feito direto na `sprint04`

Commits aplicados diretamente na `sprint04` (fora das branches de feature; os
resultados de merge já estão descritos nas seções por página):

| Commit | Arquivo(s) | O que foi feito |
|---|---|---|
| `6f0c729` | `src/components/layout/PageLayout.tsx` | Ajuste: variante `bare` do `PageLayout` não impõe fundo e flex próprios. |
| `64302e2` | `src/components/layout/PageLayout.tsx` | `PageLayout` permite a página controlar o offset da sidebar. |
| `1ec38e1` | `src/index.css` | Centralização dos tokens de design no `index.css`. |
| `ccd5e0d` | `src/components/layout/PageLayout.tsx` | Variante `contained` do `PageLayout` passa a usar os tokens `canvas`/`ink`. |
| `d4cd328` | `src/Hub.tsx` | Proteção das rotas internas com `ProtectedRoute` (exige sessão). |

Esses commits são os ajustes transversais (layout, tokens e proteção de rotas)
que não pertenciam a nenhuma página específica.
