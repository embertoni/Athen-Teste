# Missões, ligas e PAC

Status: ready-for-agent

Issue de equipe: **42**, responsável: solicitante; sprint: **sprint04**. Estado “Em andamento” confirmado pelo usuário. Os números dos tickets locais não são IDs do YouTrack. Guia, fluxo e interfaces de teste aprovados em 30/10/2026; commits, push e publicação de PRs no Athen-Teste autorizados posteriormente. Tickets 01–03 validados localmente na branch issue/42-testes-banco-gamificacao, sem integração própria. Ticket 04 aguarda suas dependências integradas; ticket 05 registra defeito de reingresso do baseline. Autorizações e resultados atuais estão na seção 7 do [guia](../../docs/planejamento-gamificacao/guia-desenvolvimento-missoes-ligas-e-pac.md).

**Restrição de destino recebida em 31/10/2026:** toda escrita deve ficar exclusivamente em **embertoni/Athen-Teste**. **VitorSoaresGoncalves/Athen é somente leitura**: não criar/alterar commits, branches, PRs, comentários, configurações ou qualquer outro recurso nesse repositório, por Git ou conectores. Isso substitui o plano histórico de integração posterior no original, sem reescrever respostas literais. PR #2 autorizado e integrado pelo usuário em `2d55fd3`; infraestrutura conciliada contra essa base. Revisão humana adicional dispensada neste fork, conforme [Convenções](../../docs/convencoes.md). A autorização do PR #2 não presume merge de novos PRs ou implantação.

## Problem Statement

O aluno não tem missões automáticas com recompensa verificável. A classificação mistura nível vitalício com liga, soma repetições no PAC e pode revelar desempenho restrito. Educadores precisam publicar missões para sua sala sem misturar matrícula, conclusão e pontuação entre contextos.

## Solution

Confirmar aprendizagem, resultado imutável, métricas, crédito e conquista na mesma transação. Missões são automáticas e compartilham um catálogo, com progresso individual. Ligas globais são semanais; curso e sala usam indicadores acadêmicos autorizados. Cada tela consome resultados oficiais e apresenta explicitamente ausência de amostra, espera e erro.

## User Stories

1. Como aluno, quero concluir uma aula e recuperar a mesma confirmação ao reenviar, para não duplicar crédito.
2. Como aluno, quero retomar uma tentativa mantendo meus primeiros envios, para que abandono não reinicie meu esforço.
3. Como aluno, quero que revisão integral atualize meu PAC, preservando histórico e crédito já recebido.
4. Como aluno, quero concluir aulas sem questões, com zero XP base, também na sala autorizada.
5. Como aluno, quero estudar em duas salas do mesmo curso com resultados independentes.
6. Como aluno, quero avançar missões sem visitar, aceitar ou resgatar cada uma.
7. Como aluno, quero três diárias globais, duas semanais e uma diária em cada curso individual elegível.
8. Como aluno, quero que estudo em sala avance globais sem criar matrícula individual.
9. Como aluno, quero conhecer meta, conteúdo, prazo, contexto e recompensa antes de estudar.
10. Como aluno, quero uma variante viável ou indisponibilidade explícita quando faltar conteúdo.
11. Como educador, quero vincular curso privado próprio pronto ou público alheio à sala, preservando autoria.
12. Como educador, quero publicar missões avulsas para minha sala inteira dentro das cotas e acompanhar os alunos.
13. Como aluno, quero que a regra publicada seja preservada e o cancelamento mantenha motivo e histórico.
14. Como educador, quero adotar explicitamente novas versões do mesmo curso sem prejudicar missão ativa.
15. Como aluno, quero consultar meu desempenho e somente os indicadores de colegas autorizados.
16. Como aluno, quero comparar meu PAC com amigos elegíveis no mesmo curso.
17. Como participante, quero inscrição semanal automática por estudo recente e ingresso tardio por atividade oficial.
18. Como participante, quero grupo estável, empates respeitados e movimentos explicáveis, inclusive com zero XP.
19. Como participante, quero meu resumo mesmo fora da primeira página e histórico dos resultados definitivos.
20. Como usuário, quero preservar nível vitalício separado da pontuação semanal.
21. Como usuário, quero feedback acessível, notificações internas úteis e recuperação de retorno perdido.
22. Como usuário, quero distinguir desativação, exclusão definitiva e suspensão, com identidade protegida.
23. Como administrador autorizado, quero reconciliar abertura e ajustes sem apagar a origem dos créditos.
24. Como equipe, quero ensaiar permissões, concorrência, corte e recuperação em ambiente isolado antes de liberar.

## Implementation Decisions

- React e Supabase/Postgres existentes; módulos profundos de aprendizagem, créditos, missões e classificação. Interfaces e invariantes detalhados no documento de contratos vinculado abaixo.
- Aprendizagem, métricas indispensáveis, evento, contribuições, concessão e intenção de notificação confirmam ou revertem juntos (Q006–Q007). Entrega de notificação é posterior; atribuição competitiva pode aguardar apuração sem bloquear estudo (Q141).
- Contexto concreto distingue curso individual de cada sala. Salas novas têm curso obrigatório e imutável; ingresso não cria matrícula (Q005/Q038/Q113–Q118).
- Primeiro envio oficial preservado antes do feedback; ordinal histórico por questão semântica/contexto; crédito base único, proporcional ao ordinal do primeiro acerto, com quatro casas (Q112/Q126). Acerto em tentativa abandonada só paga após confirmação integral elegível.
- PAC usa última execução completa por aula/versão/contexto, acerto binário e pesos iguais. Eficiência conserva ordinal histórico; cobertura e mínimo de amostra seguem a delegação aceita. Sem emblemas acadêmicos nem bloqueio por nota (Q051–Q062/Q142).
- Catálogo, metas, variantes e cotas são exatamente os de Q135–Q136; valores delegados 2/8/1, sala 1–10, sugestão 4. Nenhum teto oculto corta pagamento prometido.
- Missões globais aceitam curso e sala; diária de curso exige contexto individual. Revisão integral conta conforme objetivo; reenvio e clique repetido em aula vazia não são atividade nova (Q119–Q129).
- Dia/semana em America/Sao_Paulo, segunda 00h, intervalo inclusivo no início e exclusivo no fim; vale a confirmação oficial (Q021–Q030).
- Temporada conta somente novos créditos elegíveis de aprendizagem individual. Exclui bônus, sala, abertura, ajustes, autoria própria e repetição já creditada. Bronze inicial e sete categorias; afinidade por amizades até dois graus, pesos 2/1, semente persistida, alvo 20/teto 30 (Q101–Q109/Q123–Q124).
- Fotografia de estudo oficial dos sete dias anteriores na abertura; ingresso tardio pela primeira atividade oficial sem exigir XP. Fechar anterior, definir categorias e formar lote. Todo inscrito válido com zero cai uma categoria até Bronze; positivos mantêm cortes e proteções. Nenhum prêmio de colocação (Q133–Q143).
- Audiência no servidor: curso próprio/amigos com matrícula, acesso e amostra elegíveis; sala members/educator_only, responsável fora do ranking; liga somente próprio grupo. educator_only protege também progresso, ordem e empates. Identidade padrão sem e-mail/pseudônimo (Q063–Q070).
- Legado recebe abertura auditada sem atividade fictícia. Item incerto não recebe nova base até revisão; missões manuais ficam em leitura sem pagamento retroativo. Não inventar ordinais passados (Q081–Q084).
- Política de dados delegada Q085, notificações, atualização, acessibilidade e metas de carga permanecem nas seções responsáveis do guia; designações e SLAs humanos seguem adiados até pré-liberação.

## Testing Decisions

Interfaces já aprovadas: comandos/leitura de aprendizagem; leitura/editorial de missões com atividade real; consultas e processamento autorizado de classificação; acessos reais de segurança e auditoria; módulos React e rotas. Testar comportamento público, sem transformar helpers privados ou mocks em prova de SQL.

Primeira entrega de código: bootstrap isolado e harness que instala o esquema numerado, executa um caso sob papel de aluno e devolve saída diferente de zero quando uma asserção falha. Não antecipar toda a suíte futura. O runner interativo legado não serve de baseline.

Exemplos independentes: base 4, ordinal 3 → 1,3333; nível em 99,9999/100 → 1/2; base 4 + bônus 2 + bônus 1 → 7 vitalícios e 4 competitivos; PAC 100% com eficiência 75% para dois acertos de ordinais 1 e 2. Os últimos exemplos só serão automatizados quando seus comportamentos forem implementados.

Pipeline de código vigente e SQL real para persistência/permissões/concorrência; E2E para UI. T01–T05 e M01–M09 são planejados, não executados. Testes existentes de frontend usam dados controlados e não comprovam RLS.

## Out of Scope

Exclusões funcionais da seção 2.9 do guia: ranking vitalício global, emblemas PAC, geografia, abandono de temporada, XP compensatório, sorteio de missões, recorrência/coeducação/subgrupos em sala, tarefas externas, painel administrativo completo, exportações adicionais, moedas/novos prêmios e notificações externas. Sem mudanças em bancos remotos, dados reais ou credenciais compartilhadas.

## Further Notes

- [Guia aprovado](../../docs/planejamento-gamificacao/guia-desenvolvimento-missoes-ligas-e-pac.md): processo 3.1–3.6, sessões 4, critérios 6 e rastreabilidade completa dos **143 IDs** em 10.2. Essa matriz cobre os IDs derivados sem atribuir respostas fictícias.
- [Respostas literais](../../docs/planejamento-gamificacao/respostas-guia-desenvolvimento-missoes-ligas-e-pac.md) prevalecem; propostas anteriores são contexto. Não duplicar o questionário aqui.
- [Contratos executivos](contratos.md) e [tickets iniciais](issues/01-bootstrap-sql-isolado.md). A decomposição detalhada inicial cobre sessão 01 e o primeiro comportamento da 02; os demais marcos continuam planejados em 3.5 do guia e serão divididos antes da execução.
- [Glossário](../../GLOSSARY.md) contém conceitos aprovados; a documentação de banco continua descrevendo a implementação atual até existir mudança funcional validada.
- Base inspecionada: sprint04, 2c3d19dd6b92a44967c950d5bc03b5cb19f42e02. Branch documental: issue/42-define-gamificacao. Nenhuma integração é presumida por um ticket estar pronto localmente.
