# Banco de dados atual

Referência do modelo usado pelo cliente, conferida em 2026-10-23 contra o SQL versionado e os tipos gerados. A configuração e o histórico de aplicação de um banco remoto não foram inspecionados.

## Fontes e ordem de leitura

1. [Migrações numeradas](../../codigo-base/supabase/migrations/), de `0001` a `0025` neste checkout: modelo, políticas, funções e suas alterações sucessivas. Leia a redefinição mais recente da função ou política que estiver alterando.
2. [Tipos gerados](../../codigo-base/src/types/database.ts): estrutura tipada consumida pelo frontend. São uma fotografia de geração, não prova de que o SQL foi aplicado no ambiente de destino.
3. [Consultas do cliente](../../codigo-base/src/data/repositories.ts): tabelas, views e RPCs efetivamente utilizadas.

Os arquivos `v1_schema.sql` e `v2_schema.sql`, embora estejam na pasta de migrações, representam esquemas antigos com nomes como `Usuario` e `Curso`. As [notas legadas](../historico/banco-de-dados-legado.md), os scripts de CRUD em `supabase/testes/` e os artefatos de modelagem antigos também usam esse modelo. Não os combine com o SQL numerado como se fossem uma única sequência de instalação.

## Mapa entre produto e persistência

As definições de produto estão no [glossário](../../GLOSSARY.md). Esta tabela indica onde procurar sua implementação.

| Conceito | Tabelas ou views |
| --- | --- |
| Perfil | `profiles` (identidade de acesso em `auth.users`) |
| Curso, módulo, aula e questão | `courses`, `modules`, `lessons`, `questions` |
| Matrícula | `enrollments` |
| Tentativa, resposta, conclusão e confirmação | `attempts`, `answers`, `completions`, `learning_results` |
| Sala e participação | `rooms`, `room_members` |
| Avisos, missões e progresso | `announcements`, `missions`, `mission_progress` |
| Amizade e notificação | `friendships`, `notifications` |
| Medalhas | `medals`, `user_medals` |
| Avaliações e comentários | `reviews`, `comments` |
| Caderno e anotações | `notebooks`, `notebook_pages` |
| Ranking global | view `global_ranking` |

## Regras que precisam permanecer no servidor

| Assunto | Comportamento no SQL | Fonte |
| --- | --- | --- |
| Questões | Tipos `match`, `multiple_choice`, `fill_blank` e `sum_alternatives` | [0001](../../codigo-base/supabase/migrations/0001_extensions_and_enums.sql) e [0010](../../codigo-base/supabase/migrations/0010_domain_functions.sql) |
| Finalização de tentativa | Exige conta ativa, autoria/acesso e completude; confirma uma vez e recupera o mesmo resultado no reenvio | [0023](../../codigo-base/supabase/migrations/0023_persist_attempt_confirmations.sql) encapsula 0018 em schema privado |
| XP | Curso credita XP global; sala usa métricas internas. Questão já acertada em tentativa anterior finalizada não rende novo XP | [0018](../../codigo-base/supabase/migrations/0018_no_xp_for_already_correct.sql) |
| Aula sem questões | `complete_empty_lesson` conclui no contexto de curso com zero XP e recalcula progresso | [0022](../../codigo-base/supabase/migrations/0022_complete_empty_lesson.sql) |
| Ranking | Global por XP acumulado; amigos por PAC no curso; pontuação de sala separada. Sem reset semanal | [0015](../../codigo-base/supabase/migrations/0015_rankings.sql) |
| Edição de curso | Rascunho editável pelo criador; conteúdo anterior à publicação protegido, com regras para acréscimos posteriores e exceção de admin | [0019](../../codigo-base/supabase/migrations/0019_course_edit_gating.sql) |
| Permissões | RLS e funções verificam identidade e acesso; revisar também as alterações posteriores das políticas | [0011](../../codigo-base/supabase/migrations/0011_rls_policies.sql), [0015](../../codigo-base/supabase/migrations/0015_rankings.sql), [0019](../../codigo-base/supabase/migrations/0019_course_edit_gating.sql), [0020](../../codigo-base/supabase/migrations/0020_fix_room_members_rls_recursion.sql) |
| Metadados de conteúdo | Ícone de módulo, explicação de questão e duração calculada do curso | [0021](../../codigo-base/supabase/migrations/0021_module_icon_question_explanation_course_duration.sql) |

`grade_answer` fornece feedback sem persistir os efeitos oficiais da tentativa. O cliente não deve substituir a finalização do servidor por cálculos de XP na tela.

### Confirmação persistida — fatia 04.1

0023 preserva a assinatura de `finalize_attempt(uuid)` e o pagamento inteiro legado. O finalizador anterior passa a `athen_private`, sem execução pelo cliente. A entrada pública bloqueia a tentativa e grava `learning_results` na mesma transação dos efeitos. Reenvio retorna o registro sem recorreção, mesmo depois de editar a questão. `get_attempt_confirmation` recupera a confirmação própria de conta ativa; desconhecida/alheia não vira resultado zero. Tentativas antigas encerradas são copiadas com `legacy=true`, sem pagamento ou recorreção; isso não certifica retroativamente sua completude.

Campos oficiais de tentativa/confirmação não aceitam escrita autenticada direta. Respostas encerradas são protegidas; a alteração usada pelo cliente passa por `save_attempt_answer`, que bloqueia a tentativa antes da resposta. UPDATE direto de answers foi retirado para evitar inversão de locks. Insert legítimo de tentativa/respostas continua sujeito a GRANT/RLS/trigger; a edição de nome do perfil permanece funcionando.

Snapshot no início, ordinal, livro decimal, unicidade entre tentativas diferentes e novas métricas continuam pendentes no ticket 04. A preservação do primeiro envio gravado é implementada em 04.3 abaixo. Os privilégios alterados em 04.1 são de attempts, answers e learning_results; perfis recebem a proteção de 04.2, enquanto matrícula/progresso continuam pendentes. O defeito legado de room_members permanece no ticket 05; finalização em sala não foi homologada por estes testes.

**Tipos gerados:** schema public do projeto local `athen-gamificacao-test`, SQL 0001–0023, Supabase CLI instalado no projeto. Comando executado: `npx --no-install supabase gen types typescript --db-url 'postgresql://postgres:postgres@127.0.0.1:55432/postgres?sslmode=disable' --schema public`. Trata-se da senha fictícia do ensaio local, sem banco remoto. O gerador recusou TLS inicialmente; a opção foi limitada a esse endpoint. Resultado salvo como UTF-8 sem BOM, com remoção automática de espaços ao fim das linhas, sem editar tipos manualmente. O arquivo anterior era UTF-16LE, por isso o Git pode mostrar diferença binária. O gerador passou a refletir JSON não nulo do esquema; CrudConsole agora rejeita explicitamente config nula.

### Campos oficiais de perfil — fatia 04.2

[0024](../../codigo-base/supabase/migrations/0024_protect_profile_fields.sql) mantém SELECT autenticado e permite UPDATE apenas de username, display_name, bio, avatar_url, banner_url e notification_preferences, ainda sujeito às políticas RLS existentes. XP, nível, streak, data de estudo, cargo, estado da conta, id e timestamps não aceitam escrita do browser, inclusive de administrador autenticado. INSERT/DELETE e demais privilégios amplos de profiles também são retirados: apagar e recriar permitiria resetar defaults oficiais e perder histórico por cascata. Criação continua pelo trigger de Auth; desativação própria continua por deactivate_account. A lista de perfis do CRUD oferece edição, sem exclusão direta.

touch_streak e grant_medals são internos, sem EXECUTE para PUBLIC/anon/authenticated. Os comandos privilegiados de estudo continuam chamando essas funções como seu proprietário, preservando efeitos e reenvio. O cadastro aceita student/educator; metadata admin ou inválida produz student. Cargo administrativo exige provisionamento confiável, como service_role no backend; esse papel não deve ser usado no browser. O trigger antigo que silenciosamente restaurava role foi retirado; grants passam a negar a escrita, enquanto a operação confiável pode provisionar o cargo.

Nenhuma coluna ou assinatura pública de dados foi alterada por 0024. Tipos gerados de 04.1 permanecem aplicáveis, sem regeneração desnecessária; o adapter restringe o payload de edição às colunas permitidas. Os testes exercitam as permissões reais, além de payload/feedback dos consumidores em HTTP fictício. Não é uma auditoria completa de todas as projeções, políticas de conta ou Storage.

O seed manual foi inspecionado e adaptado para conceder cargos da sua lista fictícia fixa por escrita privilegiada, sem voltar a confiar em metadata. `test:db:seed` executa esse arquivo duas vezes em transação revertida, exclusivamente no projeto local verificado. O bootstrap continua excluindo seed.sql; esse ensaio separado não popula a aplicação nem autoriza uso em dados reais.

### Primeiro envio preservado — fatia 04.3

[0025](../../codigo-base/supabase/migrations/0025_preserve_first_submission.sql) faz save_attempt_answer devolver a resposta existente sem substituí-la. A tentativa é bloqueada antes de consultar/inserir; dois envios concorrentes recebem a mesma linha. O trigger protege identidade, submitted e first_submitted_at, mantendo a correção de is_correct/xp_earned pelo finalizador. Conta inativa também é recusada no INSERT direto de resposta. Encerrada a tentativa, novo envio continua sendo recusado; nova tentativa admite novo primeiro envio.

first_submitted_at é acrescentado sem backfill e depois recebe default clock_timestamp para novos registros. NULL identifica histórico legado desconhecido; a migração não recupera conteúdo sobrescrito antes do corte nem inventa horário do primeiro envio. Esse recebimento não é confirmação de conclusão, ordinal ou versão de conteúdo. A finalização continua pelo mesmo mecanismo inteiro legado, usando a resposta preservada; livro decimal, ordinal e snapshot permanecem pendentes.

LessonModal usa salva.submitted no feedback e apresenta a resposta registrada em vez de manter escolhas locais divergentes após o reenvio. O feedback não é um novo crédito. O resumo de somatória mostra a soma recebida, sem reconstruir uma seleção que pode ser ambígua. Erro sem recebimento confirmado mantém a tela de envio, sem feedback fictício.

**Tipos de 04.3:** regenerados pelo Supabase CLI 2.121.0 do schema public local 0001–0025, usando o mesmo comando local com sslmode=disable documentado acima. Saída do terminal decodificada de UTF-16 e normalizada automaticamente para UTF-8 sem BOM/espaços finais; nenhuma edição manual. Diff acrescenta somente first_submitted_at nullable na tabela e no retorno da RPC. Não há autorização de SQL remoto.

No modal, aulas de curso sem questões oferecem **Marcar como concluída**, que chama `complete_empty_lesson` por `dominioRepository.concluirAulaSemQuestoes`. A ação só é habilitada depois de carregar as questões com sucesso; falha de consulta não é interpretada como aula vazia. A conclusão só aparece após sucesso da RPC, sem tentativa ou XP fictícios. Esse fluxo exige a migração `0022` aplicada e não conclui aulas no contexto de sala, que a RPC atual não atende.

O TopDown usa `friends_course_pac` com o curso ativo, `missions` publicadas e sem prazo vencido (até três, ordenadas pelo prazo), e `mission_progress` filtrado pelo usuário autenticado. As missões abrangem as salas permitidas pelas políticas RLS, independentemente do curso ativo. Falhas de autenticação ou de progresso são apresentadas como erro; não se tornam progresso zero. Sem curso, o painel encerra o carregamento sem consultar esses dados.

## Antes de alterar ou preparar um banco

- Identifique o ambiente e o esquema já aplicado, incluindo as migrações posteriores que redefinem funções e políticas.
- Confira se a mudança exige migração incremental e atualização das chamadas e dos tipos gerados.
- A aplicação continua sem `supabase/config.toml`. Para ensaio, existe uma configuração separada em `codigo-base/tests/db/supabase/config.toml` e um bootstrap explícito do SQL numerado: seguir [Banco SQL descartável](../../codigo-base/README.md#banco-sql-descartável). Esse projeto local exclusivo não representa configuração ou aplicação de SQL num ambiente remoto.
- Os seeds em [0013](../../codigo-base/supabase/migrations/0013_seed.sql) e [seed.sql](../../codigo-base/supabase/seed.sql) precisam ser lidos no contexto do ambiente de teste antes da execução; esta referência não instrui a aplicá-los sobre dados existentes.
- Regenere `src/types/database.ts` a partir do esquema-alvo correspondente após a mudança. Não edite o arquivo à mão. O alvo e o comando de geração devem acompanhar a entrega; não há script de geração em `package.json` atualmente.
- Confira no ambiente os recursos de Storage usados pelo [perfil](../../codigo-base/src/pages/profile/Profile.tsx); tabelas e RPCs não descrevem por si só as políticas do bucket.

## Verificação

Consulte [Testes](../testes.md) para o alcance das verificações e as limitações do runner SQL legado. Uma passagem no typecheck ou nos exemplos de frontend não valida RLS, XP ou aplicação das migrações.
