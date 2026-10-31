# 03: Reproduzir isolamento e concorrência do harness também na CI

Status: resolved

**Issue de equipe:** 42; sprint04; Em andamento confirmado pelo usuário. Mesmo incremento de infraestrutura na branch issue/42-testes-banco-gamificacao; entregas locais 01/02 preservadas, sem declarar integração na sprint.

**What to build:** duas conexões de alunos fictícios executam operações reais sem compartilhar identidade ou dados indevidamente; o mesmo harness funciona em job descartável sem segredo de desenvolvedor.

**Blocked by:** 01 (bootstrap/sanidade) e 02 (Node compatível).

**Origem:** guia sessão 01; Q087–Q088.

- [x] Fixtures mínimas tipadas por papel e contexto, com duas salas do mesmo curso e dados exclusivamente fictícios.
- [x] Demonstrar conexões independentes com coordenação determinística; sem sleep como prova de concorrência.
- [x] Registrar falha/rollback/limpeza e limitar cada operação ao ambiente identificado.
- [x] Job SQL inicializa e encerra seu projeto isolado, falha quando o harness falha e não usa credenciais remotas.

**Resultado local:** test:db:concurrency aprovado, com dois PIDs/claims distintos, ambos observados em pg_locks, audiência por sala, curso privado invisível, ausência de matrícula e rollback após divisão por zero. O runner com --prove-failure retornou 1; repetição normal retornou 0, confirmando limpeza. Sanidade original também passou. Job database configurado com preparação/bootstrap/tipos/sanidade/concorrência e parada always; execução GitHub ainda não realizada. Revisões Padrões/Spec sem achados materiais; lint e tipos finais passaram. Resolved refere-se à implementação e validação local, não a execução remota ou integração.

**Achado de baseline:** o primeiro cenário com reingresso falhou por trigger updated_at em room_members, confirmado nas migrações 0005/0012/0010. O caso atual cobre ingresso novo; reingresso está explicitamente pendente no ticket local 05, sem suprimir uma regressão introduzida nem modificar SQL histórico. Também foi corrigida a tipagem UUID/texto na preparação da fixture.

**Ponto de teste:** harness público e SQL real; ampliar cenários de negócio somente ao implementar cada regra.

**Evidência para fechar:** execução local/CI quando autorizada, papéis e destino, resultado e limitações. Pipeline remoto não pode ser presumido pela leitura do YAML.
