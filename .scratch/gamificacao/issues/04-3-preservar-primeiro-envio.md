# 04.3: Reenvio preserva a primeira resposta gravada na tentativa

Status: resolved

**Issue de equipe:** 42, solicitante responsável, Em andamento, sprint04. PR #5 confirmado merged no GitHub em `40016e73139ee06b4abdaeab08983e1b624256ee`; fetch/pull --ff-only de origin na mesma base. Árvore inicialmente limpa; branch `issue/42-primeiro-envio` criada dessa sprint.

**Parte de:** ticket 04, sessão 02; guia 2.4/3.4/3.5, primeiro envio conforme glossário e Q126. Interfaces de aprendizagem em Postgres real e React/HTTP já aprovadas.

**Entrega executável:** a primeira resposta gravada de uma questão na tentativa não pode ser substituída por um reenvio. A RPC devolve essa mesma resposta e seu instante de recebimento do servidor; o feedback usa a resposta efetivamente preservada, inclusive após perda do retorno do primeiro envio. Questão em nova tentativa admite novo envio. Não ativar ordinal nem política decimal nesta fatia.

- [x] SQL vermelho demonstra substituição da resposta por save_attempt_answer existente; verde preserva conteúdo, identidade e instante.
- [x] Servidor preserva primeiro envio antes do feedback e impede edição de submitted/instante, mantendo atualização de correção oficial pela finalização.
- [x] Duas respostas diferentes enviadas concorrentemente à mesma questão preservam uma primeira resposta; ambas as conexões recebem a mesma confirmação de recebimento.
- [x] UI mostra a resposta preservada e usa seu conteúdo no feedback após retorno perdido; erro sem resposta confirmada continua sendo erro.
- [x] Linhas anteriores ao marco não recebem instante histórico inventado; conta inativa não grava nova resposta por INSERT direto.
- [x] Pipeline, testes SQL, regressões de finalização/rollback/concorrência e E2E passam; tipos gerados do esquema isolado, evidência e guia atualizados.

**Compatibilidade:** assinatura da RPC conservada; expansão da linha answers com instante nullable para distinguir o valor legado conhecido de um primeiro envio certificado após a migração. Campos oficiais do resultado continuam sendo atualizados apenas pelo finalizador, sem outra autoridade de pagamento. Registro existente preserva o conteúdo disponível no corte; não reconstruir respostas perdidas antes dele.

**Limites:** ordinal entre tentativas/contextos, identidade semântica e versões/snapshots, autorização completa de início/contexto, retomada entre sessões, livro decimal/abertura auditada, demais contadores e sala continuam pendentes. A marca de recebimento não certifica retroativamente completude, crédito ou acesso editorial. Não declarar o ticket 04 completo nem executar SQL remoto.

**Validação local:** SQL vermelho/verde de reenvio; E2E vermelho de feedback divergente e verde após usar salva.submitted. Esquema 0001–0025 instalado do zero no container fictício c44595dd01c1. Primeiro envio, learning/rollback, três corridas de aprendizagem, sanidade, perfil, seed revertido e concorrência anterior passaram. Timestamp forjado pelo cliente recusado. Tipos gerados pelo CLI do mesmo banco, sem edição manual. Pipeline de seis comandos aprovado; Chromium **28/28 (31,6s)**. Padrões e Spec sem achados materiais. Projeto local parado, banco preservado. Resolved significa implementado e validado localmente; publicação/CI/integração não são presumidas e serão registradas no guia.

**Publicação e CI:** commit `cbb88922fdf8ef7a77aee890ada61210650cb5a0`, [PR #6](https://github.com/embertoni/Athen-Teste/pull/6) aberto contra sprint04 somente no fork, sem conflitos. [CI 41237327029](https://github.com/embertoni/Athen-Teste/actions/runs/41237327029) aprovou quality/database/e2e; logs conferidos para 0025, primeiro envio, as três corridas e **28 E2E (22,5s)**. Descrição íntegra, sem U+FFFD. Integração de #6 aguarda autorização própria; ticket 04 continua parcial.
