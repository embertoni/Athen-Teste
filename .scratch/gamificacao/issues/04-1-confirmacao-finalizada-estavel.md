# 04.1: Recuperar a confirmação persistida de uma tentativa finalizada

Status: resolved

**Issue de equipe:** 42, solicitante responsável, Em andamento; sprint04 integrada em `1ab3f9f`. Branch `issue/42-finalizacao-imutavel`, inicialmente limpa. Retomada autorizada pelo usuário.

**Parte de:** ticket 04 e sessão 02. Interfaces de aprendizagem/Postgres e HTTP/React já aprovadas no guia.

**Entrega executável:** finalizar uma tentativa individual completa e recuperar a mesma confirmação, mesmo após edição posterior do conteúdo ou perda da resposta HTTP. Tentativa incompleta não produz confirmação nem novos efeitos. Não alterar assinaturas da finalização usada pelo cliente.

- [x] Teste vermelho pela RPC existente demonstra reenvio recalculado após edição da questão.
- [x] Confirmação persistida, leitura própria autorizada e reenvio estáveis; gravação direta dos campos oficiais e edição de respostas finalizadas recusadas.
- [x] Finalização incompleta e acesso sem sessão/alheio/inativo recusados, com rollback dos efeitos.
- [x] Duas finalizações da mesma tentativa em conexões reais retornam a mesma confirmação e creditam uma vez.
- [x] Consumidor recupera confirmação após erro/retorno perdido, sem fabricar zero ou concluir quando não há confirmação.
- [x] Tipos gerados do Supabase local, pipeline, SQL e E2E apropriados passam; registrar migração e limites.

**Limite deliberado:** conservar nesta fatia o cálculo/pagamento inteiro legado por uma única entrada de finalização, sem implementar ainda livro decimal, ordinal, snapshot no início, publicação/versionamento, unicidade entre tentativas distintas ou métricas novas. Esses critérios continuam abertos no ticket 04; esta fatia não o resolve integralmente nem libera migrações remotas. Saldos/contadores e abertura do legado serão tratados com o livro antes de ativar a nova política de créditos.

**Compatibilidade:** expandir com confirmação persistida e encapsular o finalizador existente como implementação interna sem permissão de execução pelo cliente. Tentativa encerrada antes desta migração permanece legada, sem recorreção ou novo pagamento. A migração histórica 0018 não será editada.

**Validação local:** SQL vermelho retornou 0/1 e 0 XP no reenvio de uma confirmação 1/1 e 4 XP; verde preservou resultado/instante. SQL completo passou, incluindo rollback, permissões e legado. Duas corridas reais passaram: finalização/finalização e resposta/finalização. Revisão Padrões encontrou inversão de locks no UPDATE direto, corrigida com save_attempt_answer e retirada do UPDATE; conferência incremental sem achados materiais. Spec sem desvio no recorte. Pipeline (seis comandos) aprovado; E2E focal vermelho/verde e suíte final **21/21, 29,6s**. Tipos gerados do schema local 0001–0023, container d264e2ac1f34; banco preservado e containers parados. Cache incidental do CLI restaurado. Resolved significa implementado/validado localmente; publicação, CI desta branch e integração ainda serão registradas no guia.
