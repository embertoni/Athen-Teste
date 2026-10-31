# Encaminhamento da fatia 04.3 — issue 42

Branch issue/42-primeiro-envio, base sprint04 40016e7 (PR #5 integrado). Implementado e validado localmente; publicação/CI exclusivamente no Athen-Teste ainda pendentes. Merge futuro exige autorização própria. Ticket 04 continua parcial.

## Summary

Reenviar uma resposta substituía a primeira gravação. Após perder o retorno HTTP, a tela também podia corrigir uma nova escolha local enquanto o servidor preservava outra. A migração 0025 e o modal passam a recuperar e apresentar o mesmo conteúdo recebido.

```text
primeiro envio → lock da tentativa → resposta + instante do servidor
reenvio diferente → mesma linha, conteúdo e instante
feedback → usa resposta retornada; recebimento ainda não é conclusão/XP
finalizar → mesmo finalizador, com resposta preservada
```

O trigger protege conteúdo, identidade e instante, permitindo a correção oficial. Novos registros recebem first_submitted_at; linhas anteriores ficam com NULL, sem história inventada. A UI mostra a resposta registrada nos quatro formatos e a correção usa salva.submitted. Conta inativa não insere resposta diretamente. Ordinal, snapshot e livro decimal continuam pendentes.

## Evidence

- **Before:** SQL real B → reenvio A substituía B; E2E após retorno perdido corrigia A local em vez do B preservado.
  **After:** mesmo recebimento no reenvio; finalização usa B e retorna 0/1, zero XP. Nova tentativa admite A. UI mostra B e feedback correspondente.
- Dois PIDs reais bloqueados antes da liberação enviam respostas diferentes: ambos recebem a mesma linha/instante, uma resposta, nenhum XP ou confirmação de conclusão só por enviar. Regressões das outras duas corridas e de rollback passaram.
- SQL 0001–0025: primeiro envio, legado desconhecido, timestamp forjado, conta inativa/alheia, aprendizagem, sanidade, perfil, seed revertido e concorrência anterior aprovados. Projeto local athen-gamificacao-test em 127.0.0.1:55432; container c44595dd01c1, parado com banco preservado.
- Lint, typecheck, Vitest 2/2, test:check, build e test:db:check aprovados; **28 E2E Chromium (31,6s)**, incluindo múltipla escolha, texto, soma e associação. HTTP fictício separado da prova SQL/RLS.
- Tipos regenerados pelo CLI do schema local, sem edição manual. Fontes literais preservadas. Padrões e Spec sem achados materiais. [Captura do feedback](https://github.com/embertoni/Athen-Teste/blob/issue/42-primeiro-envio/docs/evidencias/primeiro-envio/primeiro-envio-preservado.png). CI remota ainda a conferir após publicação.

## Merge Danger

**Door:** two-way

Coluna adicional e alteração da semântica de reenvio: repetir deixa de substituir. Reversão deve preservar registros/instantes e coordenar consumidor/SQL; restaurar a RPC antiga reabriria a sobrescrita. Nenhuma migração remota ou deploy realizado.

**Blast Radius:** aprendizagem

Linhas antigas guardam apenas o valor disponível no corte, com instante de primeiro envio desconhecido. Isso não certifica ordinal, versão, acesso editorial ou crédito histórico. Cálculo inteiro legado permanece até o livro decimal; snapshot/publicação, autorização completa de início/contexto, retomada entre sessões, demais contadores e sala continuam fora desta fatia.

### Uso de IA

- Ferramenta(s): Codex e agentes técnicos somente de leitura.
- Escopo gerado por IA: migração, consumidor/adapter, tipos pelo CLI, testes SQL/E2E, CI e registros.
- Revisado e validado localmente por: Codex com execução real e eixos Padrões/Spec; revisão humana adicional dispensada pelo responsável neste fork.
