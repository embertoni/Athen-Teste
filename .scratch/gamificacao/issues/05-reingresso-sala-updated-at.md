# 05: Reingressar em sala sem falha do trigger de atualização

Status: resolved-in-0028 (causa-raiz corrigida na fatia 04.6; regressão coberta)

**Resolução (01/11/2026):** o defeito do trigger foi corrigido pela migração [0028](../../codigo-base/supabase/migrations/0028_first_submission_ordinal_and_credit_book.sql) da fatia 04.6, porque o caminho de crédito decimal de sala atualiza `room_members` e esbarrava no mesmo defeito. A correção remove o trigger órfão `set_updated_at` de `room_members` (a tabela nunca declarou `updated_at`). A regressão está coberta em `tests/db/ordinal-credits.sql` (teste 8): remover o vínculo e reingressar por `join_room` reativa o vínculo existente sem falha, sem matrícula automática e sem perda de saldo. O caminho legado de finalização em sala (`update room_members set xp_internal`) passa a funcionar em tempo de execução. Os demais itens abaixo permanecem como registro histórico da investigação.

**Issue de equipe:** 42; ID 05 é local. Responsável solicitante, sprint04, Em andamento confirmado.

**What to build:** aluno que já possui vínculo com uma sala consegue reingressar pelo código válido e reutiliza o vínculo, preservando pontuação/histórico.

**Blocked by:** preparar a correção na branch adequada e respeitar a revisão/integração das dependências antes da sessão funcional dependente. O ticket 03 já demonstrou o defeito no ensaio local, mas não o corrigiu.

**Origem:** Q026/Q091 e validação do ticket 03. A migração 0005 não declara updated_at em room_members; 0012 instala o trigger touch_updated_at nessa tabela; o caminho on conflict de join_room em 0010 atualiza o vínculo existente.

**Reprodução observada:** em banco isolado com 0001–0022, criar vínculo de aluno com status removed e chamar join_room com o código da sala sob sua sessão. Resultado: `record "new" has no field "updated_at"`. Ingresso sem vínculo anterior passa. O mesmo trigger deve ser avaliado nos demais caminhos legítimos de atualização de membros.

- [ ] Fixar a reprodução como teste de regressão pela RPC pública, com aluno/claims reais.
- [ ] Corrigir por migração incremental, preservando SQL histórico e os privilégios previstos.
- [ ] Confirmar reativação do mesmo vínculo sem matrícula automática, perda de saldo ou duplicidade.
- [ ] Validar impacto em métricas/gestão de membros e executar pipeline/harness no banco isolado.

**Ponto de teste:** join_room e leitura autorizada da participação. Correção ainda não implementada; não confundir com unicidade futura de créditos ou missões.
