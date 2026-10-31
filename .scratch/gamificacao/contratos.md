# Contratos executivos — primeira etapa

Estado: contrato alvo da sessão 02, implementado incrementalmente. 04.1 materializa confirmação persistida e escrita serializada na migração 0023, integrada pelo PR #4. 04.2 protege campos oficiais de perfil na migração 0024, integrada pelo PR #5. 04.3 preserva o primeiro conteúdo gravado por tentativa/questão e seu recebimento na migração 0025, em validação local, sem ativar ordinal nem alterar a política inteira legada. Snapshot no início, autorização completa de início/contexto e livro decimal continuam previstos, sem alegar implementação. Fonte: [spec](spec.md), guia 2.2–2.4/3.4 e Q007/Q053–Q060/Q091–Q094/Q126/Q142.

## Aprendizagem

| Entrada pública | Entrada confiada ao chamador | Resultado observável e invariantes |
| --- | --- | --- |
| Iniciar execução | Aula e contexto explícito de curso ou sala | Servidor deriva usuário/curso, verifica conta/acesso e congela versão/conjunto avaliável; devolve identidade estável da execução |
| Retomar execução | Identidade da execução própria | Mesmo snapshot e primeiros envios, sem expiração automática por tempo enquanto autorizada |
| Enviar resposta | Execução, questão prevista e resposta | Primeiro envio oficial é preservado antes do feedback; cliente não informa acerto, ordinal ou XP; repetição não renova envio |
| Finalizar execução | Identidade da execução | Todas as questões respondidas; resultado, instante, conclusão, créditos e efeitos transacionais confirmados uma vez; incompleta não substitui amostra |
| Consultar confirmação | Identidade da execução própria | Recupera o resultado oficial persistido, inclusive após retorno perdido; erro e resultado desconhecido não são zero |
| Concluir aula sem questões | Aula e contexto explícito | Primeira conclusão concreta com zero base, sem denominador ou matrícula pela sala; reenvio não cria atividade nova |

Resumo oficial inclui execução, versão, contexto, instante do servidor, acertos/total, base, bônus por concessão e conquistas. Reconsulta pode refletir a confirmação como recuperada, mas os valores oficiais permanecem iguais; não repetir celebração. Prévia de autor/admin fica separada do estudo oficial sem base/bônus/amostra.

As atuais entradas tentativaRepository.iniciar, respostaRepository.salvar, tentativaRepository.finalizar e dominioRepository.concluirAulaSemQuestoes são pontos de migração. Hoje início é insert; resposta passa pela RPC save_attempt_answer, preservada no reenvio desde 0025. Linhas antigas sem história certificada conservam instante de primeiro envio nulo. finalize_attempt persiste a confirmação em 0023 e reenvio não recalcula resultado. O cálculo inteiro legado permanece encapsulado, até a evolução para o livro único; não conservar uma segunda autoridade de pagamento.

## Persistência e chaves a materializar incrementalmente

| Responsabilidade | Chave/invariante do DDL futuro | Política |
| --- | --- | --- |
| Contexto | Identidade obrigatória de curso individual ou sala concreta, com referências coerentes | Evitar chave enfraquecida por NULL; duas salas nunca compartilham conclusão/crédito |
| Snapshot | Execução referencia versão estável da aula e questões previstas | Edição de conteúdo não regrava tentativa iniciada; identidade semântica persiste em item inalterado |
| Primeiro envio | Único por execução/questão semântica; ordem oficial persistida por usuário/questão/contexto | Serializar concorrência antes de atribuir ordinal; abandono não apaga envio |
| Resultado | Único por execução | Imutável; reenvio retorna o mesmo registro, sem recorreção sobre conteúdo atual |
| Conclusão | Única por usuário/aula/versão/contexto concreto | Primeira conclusão vazia é idempotente; revisão com questões é nova execução |
| Livro de créditos | Origem tipada, beneficiário, destino e chave semântica obrigatórios | Base única por usuário/questão/contexto; bônus único por atribuição; abertura/ajuste separados |
| Concessão | Uma por atribuição e um único crédito vinculado | Incrementar projeção somente se inserir crédito; falha reverte o conjunto |
| Amostra acadêmica | Último resultado completo por usuário/aula/versão/contexto | Ordem oficial determinística de confirmação; resultado anterior permanece histórico |

Precisão de créditos/saldos: decimal fixo com quatro casas e arredondamento uma vez por lançamento. Dimensionar precisão total no DDL do ticket; não usar ponto flutuante para pagar. Nível usa fronteiras inferiores sem arredondamento de apresentação. Saldo/projeção deve reconciliar com abertura e créditos válidos.

Bloqueios por contexto/questão e depois atribuições em ordem estável, restrições únicas e incrementos atômicos precisam cobrir duas execuções diferentes. Teste de “já existe” sem restrição não satisfaz o contrato. Cliente não recebe execução de funções internas; funções privilegiadas verificam sessão, conta, acesso e usam search_path seguro/referências qualificadas.

## Leituras posteriores

Missões: listar minhas atribuições e histórico, obter detalhe, e comandos editoriais de sala autorizados. Retorno com contexto, regra/versão, unidade, meta/contagem, janela/fuso, recompensa/destino, elegibilidade, estado e cursor. Materialização também ocorre obrigatoriamente antes de atividade elegível; leitura tardia não reduz meta.

Classificação: listar contexto autorizado, consultar meu resumo independente da página, regras e histórico. Combinações permitidas: liga/próprio grupo/XP semanal; curso/próprio usuário e amigos/PAC; sala/alunos/PAC. Retorno informa amostra, eficiência, cobertura, posição compartilhada, instante e versão da regra. Em educator_only, a resposta ao aluno omite indicadores e derivados dos colegas, incluindo ordem/progresso/empates.

## Contrato do ambiente de teste

1. Destino proposto: projeto Supabase local descartável, identidade exclusiva de gamificação e portas locais exclusivas; confirmar container, mapeamento, banco e marcador de ensaio antes de aplicar SQL. Não carregar .env da aplicação nem usar SUPABASE_DB_URL legado como fallback.
2. Preparar diretório de trabalho isolado para o CLI e selecionar explicitamente apenas migrações numeradas. Preservar v1_schema.sql/v2_schema.sql no repositório; excluí-los do bootstrap. Não executar seed.sql automaticamente. Ler 0013: catálogo de medalhas necessário, demo condicional não cria conteúdo sem perfis.
3. Usar Auth/roles reais do Supabase local. Conexão administrativa só prepara fixtures e auditoria; execução de comportamento usa authenticated com identidade de aluno e RLS habilitada, sem privilégios de proprietário.
4. Runner não interativo rejeita destino inesperado, propaga erro, encerra conexões e isola dados. Caso de sanidade exercita entrada real já existente; uma asserção intencionalmente inválida demonstra saída não zero sem deixar suíte permanente quebrada.
5. Registrar versões, sequência/hash do SQL, papéis, comandos e limitações; repetir bootstrap em destino descartável para comprovar reprodução. Concorrência usa conexões independentes em ticket posterior.

## Evidência local já obtida em 30/10/2026

- Node 24.19.0/npm 12.0.2; ESLint 10.11.0 declara Node ^20.19.0 || ^22.13.0 || >=24. CI fixa 22.12.x nos dois jobs: incompatibilidade confirmada por configuração instalada.
- Supabase CLI 2.121.0; sem config.toml. A consulta de versão atualizou o cache cli-latest; apenas essa alteração incidental foi revertida ao valor inicial.
- Docker 29.9.2 cliente/servidor Linux; listagem de containers vazia. Nenhum ambiente de banco foi criado ou conectado.
- sprint04 local coincide com upstream/sprint04 remoto em 2c3d19d. origin/sprint04 está em 59bfd13; referências distintas preservadas, sem merge/push.
