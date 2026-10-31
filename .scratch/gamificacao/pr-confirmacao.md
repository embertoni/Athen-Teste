# Encaminhamento da fatia 04.1 — issue 42

Branch: issue/42-finalizacao-imutavel. Base sprint04: 1ab3f9f. Entrega validada localmente; publicar PR somente no Athen-Teste. Merge ainda depende de autorização própria. O ticket 04 principal permanece parcial.

## Summary

A finalização recalculava uma tentativa encerrada contra conteúdo atual: uma confirmação de 1/1 e 4 XP podia virar 0/1 e 0 XP no reenvio. A migração 0023 persiste a confirmação junto dos efeitos e mantém a assinatura pública. O cliente recupera o resultado oficial quando o retorno HTTP se perde.

```text
salvar resposta → lock da tentativa → resposta
finalizar → lock da tentativa → validar completude → legado privado → confirmação persistida
reenvio / retorno perdido → confirmação própria → mesmo resultado e instante
```

`save_attempt_answer` mantém a ordem dos locks e substitui o UPDATE direto do cliente. Campos oficiais e respostas finalizadas ficam protegidos. O código anterior de pagamento é interno e não pode ser executado pelo cliente. Registros antigos recebem `legacy=true`, sem recorreção ou pagamento retroativo.

É a primeira fatia do ticket 04, com limites explícitos: snapshot no início, primeiro envio/ordinal, livro decimal, unicidade entre tentativas distintas e fechamento dos demais contadores continuam pendentes. O cálculo inteiro legado permanece até a continuação; não foi instalado um segundo mecanismo de pagamento. A migração foi aplicada apenas no Supabase local fictício.

## Evidence

- **Before:** SQL real sob aluno devolvia 0/1 e 0 XP após editar uma questão já confirmada como 1/1 e 4 XP.
  **After:** mesmo teste preserva confirmação/instante e saldo de 4 XP; incompletude, acesso alheio/inativo e alterações diretas são recusados.
- Falha injetada na persistência reverte saldo, tentativa e confirmação; repetição válida depois confirma uma vez. Histórico legado identificado e sem novo pagamento. Edição legítima do perfil preservada.
- Conexões reais: dois PIDs observados esperando locks antes da liberação. Finalização/finalização e resposta/finalização passaram com uma confirmação e 4 XP; deadlock e demais erros inesperados fazem o teste falhar.
- E2E focal vermelho/verde para retorno perdido; sem confirmação, erro permanece. Suíte final Chromium: **21/21, 29,6s**, com HTTP/sessão fictícios.
- Lint, typecheck, Vitest 2/2, test:check, build e test:db:check aprovados. Sanidade e concorrência anteriores também passaram no schema 0001–0023.
- Revisão técnica: Padrões apontou inversão de locks no UPDATE direto, corrigida e coberta por corrida real; conferência incremental sem achado material. Spec sem desvio no subticket. Revisão humana adicional dispensada conforme convenções do fork.
- Tipos regenerados do schema local pelo CLI, sem edição manual. database.ts anterior era UTF-16LE; a saída atual é UTF-8, podendo aparecer como diff binário. JSON não nulo exigiu guard no CrudConsole. Comando/alvo registrados na documentação de banco.
- Projeto local athen-gamificacao-test, Postgres 127.0.0.1:55432, container d264e2ac1f34, labels conferidas; parado com volume preservado. Respostas/propostas literais preservadas. CI desta branch ainda precisa ser confirmada após publicar.

## Merge Danger

**Door:** two-way

Alteração incremental de esquema e privilégios; eventual reversão deve manter cliente e comandos SQL compatíveis e preservar as confirmações já gravadas. Nenhuma migração remota ou deploy realizado por esta entrega.

**Blast Radius:** aprendizagem

O cliente passa a depender de 0023 para gravar respostas e recuperar confirmações. Publicação futura exige aplicação coordenada do esquema no ambiente autorizado. A finalização em sala continua com o defeito legado room_members.updated_at, registrado no ticket 05 e sem homologação nesta fatia. Os testes não validam o futuro livro decimal, PAC, missões ou temporadas.

### Uso de IA

- Ferramenta(s): Codex e agentes técnicos somente de leitura.
- Escopo gerado por IA: migração incremental, adapter, tipos pelo CLI, guard de consumidor, testes SQL/E2E, CI e registros.
- Revisado e validado localmente por: Codex com comandos reais e revisão técnica Padrões/Spec; aprovação humana adicional dispensada pelo responsável neste fork.
