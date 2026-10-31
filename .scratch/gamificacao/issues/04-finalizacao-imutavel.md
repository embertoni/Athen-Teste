# 04: Recuperar a mesma confirmação de aula individual sem crédito duplicado

Status: claimed

**Issue de equipe:** 42; sprint04; Em andamento confirmado pelo usuário. Início funcional aguarda a integração das dependências indicada abaixo.

**What to build:** aluno conclui uma execução individual completa, recebe resultado oficial e, após retorno perdido ou reenvio, recupera a mesma confirmação e o mesmo crédito.

**Blocked by:** 01 e 03, integrados conforme convenções antes da branch dependente. O restante da sessão 02 será dividido antes de implementar.

**Retomada:** PR #3 confirmado merged em `1ab3f9f`; dependências integradas. Primeira fatia em [04.1](04-1-confirmacao-finalizada-estavel.md), sem marcar o ticket principal resolvido antes de livro/ordinal/snapshot e demais critérios.

**Pausa em 31/10/2026:** merge do PR #3 autorizado para integrar essas dependências. Antes de retomar, confirmar o estado merged e buscar a sprint04 resultante. O usuário solicitou pausar após o fechamento; nenhuma implementação, teste novo ou branch do ticket 04 foi iniciada. Seguir o checklist de retomada da seção 7 do guia somente após nova solicitação.

**Origem:** guia sessão 02/3.5; Q007/Q053–Q054/Q059/Q081/Q091–Q094/Q098/Q126/Q142.

- [ ] Primeiro teste vermelho demonstra a diferença de comportamento por entrada pública em Postgres real, sem falha artificial de setup.
- [ ] Snapshot/primeiro envio e autorização do percurso escolhido sustentam confirmação completa; tentativa incompleta não cria resultado oficial.
- [ ] Finalização e reconsulta retornam resultado e instante persistidos; não regravar correção sobre conteúdo alterado.
- [ ] Duas finalizações concorrentes preservam um resultado e um crédito; falha transacional reverte efeitos do percurso.
- [ ] Crédito novo usa chave semântica do contexto e livro compartilhado; compatibilidade antiga não mantém autoridade paralela. Definir abertura de legado antes de ativar pagamento em dados preexistentes.
- [ ] Adapter, tipos gerados do esquema isolado e consumidor necessário demonstram o percurso; resumo diferencia confirmação de falha/retorno perdido.
- [ ] Pipeline, SQL focal e evidência do consumidor passam; registrar limitações restantes da sessão 02 sem declarar núcleo completo.

**Ponto de teste:** comandos de aprendizagem e leitura autorizada do resultado; UI apenas para integração/feedback, não como prova de transação.

**Compatibilidade:** expandir/migrar/retirar, por migração nova. Registrar a estratégia antes de mudar assinaturas/GRANTs; manter edição legítima de perfil.

**Evidência para fechar:** teste vermelho/verde, corrida real, retorno perdido, alvo/esquema de geração e revisão nos eixos Padrões/Spec. Não ativar migração compartilhada.
