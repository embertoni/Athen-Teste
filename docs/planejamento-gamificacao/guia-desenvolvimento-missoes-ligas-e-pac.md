# Guia de desenvolvimento por sessões — missões, ligas e PAC

**Status:** desenvolvimento **pausado por solicitação do usuário**, com continuação prevista na CLI do Kiro. Tickets 01–03 e fatias 04.1–04.3 integrados pelos PRs #3–#6; último merge confirmado `dbeae27016f09a4bbffc4852e770214ad3c248b8`. A pendência de integrar o PR #6 está encerrada. [Prompt completo de retomada](retomada-kiro.md) registra estado, autorizações, ambiente e próxima ação. Ticket 04 principal continua parcial, com ordinal, livro decimal, snapshot e autorização completa de início/contexto planejados. Registro efetivo na seção 7.

**Base do diagnóstico:** 29/10/2026, `sprint04`, commit `2c3d19dd6b92a44967c950d5bc03b5cb19f42e02`.  
**Único repositório autorizado para escrita:** `embertoni/Athen-Teste`. Por instrução explícita de 31/10/2026, `VitorSoaresGoncalves/Athen` permanece **somente leitura**, em qualquer etapa. Isso substitui referências históricas deste guia à integração posterior no original; respostas e propostas literais continuam preservadas.  
**Fonte das decisões:** [arquivo de respostas](respostas-guia-desenvolvimento-missoes-ligas-e-pac.md), com **dez rodadas, 143 IDs, 132 respostas literais e 11 registros derivados**, sem campo de resposta pendente.  
**Escopo da consolidação anterior:** somente este guia. Na execução iniciada em 30/10/2026, o usuário autorizou artefatos locais, código/testes e Supabase isolado com dados fictícios após identificação do destino. Respostas e propostas continuam preservadas. Posteriormente autorizou qualquer commit necessário em embertoni/Athen-Teste; pushes, merges, publicação de PRs e implantação continuam sujeitos a nova autorização.

**Autorização vigente e pausa:** issue real **42**, responsável **solicitante**, sprint **sprint04**, estado **Em andamento** confirmado anteriormente pelo usuário, sem declarar a história completa. Branch documental local **`issue/42-retomada-kiro`**, criada da sprint04 atualizada em `dbeae27016f09a4bbffc4852e770214ad3c248b8`, inicialmente limpa e sem commits próprios. [Spec](../../.scratch/gamificacao/spec.md), [contratos](../../.scratch/gamificacao/contratos.md) e tickets mantidos; 01–03 e 04.1–04.3 integrados, ticket 04 parcial e 05 pendente. Nesta pausa foram preparados somente documentos locais, sem commit/push/PR novo. Commits, push e PR no fork continuam autorizados para a retomada; merges futuros exigem autorização própria. Dispensa de revisão adicional conforme [Convenções](../convencoes.md); testes e revisão técnica permanecem no ciclo. Somente `embertoni/Athen-Teste` pode receber escrita; o original continua somente leitura. Registros anteriores preservam os estados e autorizações da época.

**Contexto de continuação:** começar por [retomada-kiro.md](retomada-kiro.md), o registro mais recente da seção 7 e os critérios abertos do ticket 04; seguir 3.1/3.6 e consultar respostas somente por ID quando necessário. A seção 8 distingue entregas de trabalho futuro. A preparação desta passagem não inicia nova implementação durante a pausa.

## 1. Origem, finalidade e leitura do plano

Este guia compara a [proposta de missões](proposta-sistema-de-missoes.md) e a [proposta de ligas, rankings e PAC](proposta-ligas-ranking-e-pac.md), incorpora as decisões do questionário e organiza o trabalho futuro por sessões. Cada sessão informa páginas/áreas, arquivos previstos, mudanças, branch sugerida, dependências e validação de saída. Tudo permanece **planejado** até existir registro de execução.

O modelo de `docs/relatorio-trabalho-local.md` foi recuperado anteriormente por leitura de `backup/sprint04-20261029`, commit `59bfd13`, sem restaurá-lo. Sua organização por página, arquivos e branches foi reaproveitada. Branches históricas `issue/39-*` não são bases deste plano.

As duas propostas registram o diagnóstico e alternativas iniciais. Suas recomendações rejeitadas não voltam a ser requisitos por aparecerem em tabelas ou diagramas antigos. **O arquivo de respostas prevalece para intenção e decisões; este guia reúne o plano consolidado; código/configuração versionados descrevem o comportamento implementado.** Não sobrescrever as respostas literais ao revisar uma decisão.

O cabeçalho e alguns trechos do arquivo de respostas ainda dizem que o guia está congelado e que sua consolidação está pendente: registram a revisão anterior. A solicitação atual autoriza atualizar somente o guia; por isso esses trechos foram preservados. O questionário completo deixa de ser duplicado aqui; sua fonte e rastreabilidade ficam na seção 10.

As regras de [fluxo de trabalho](../fluxo-de-trabalho-ia.md), [convenções](../convencoes.md), [banco](../banco-de-dados/documentacao-bd.md), [estilo](../estilo-padrao.md) e [testes](../testes.md) continuam aplicáveis. O [glossário atual](../../GLOSSARY.md) descreve o produto existente e ainda precisará refletir as decisões futuras sobre sala obrigatoriamente vinculada, XP vitalício e competição por temporada. Nenhuma dessas referências foi alterada nesta entrega.

### 1.1 Comportamento implementado e lacunas confirmadas por leitura

| Área atual | O que existe | O que falta para este plano |
| --- | --- | --- |
| Missões | `missions` obrigatoriamente de sala, `mission_progress` manual, repositórios e três cartões no TopDown | Motor de objetivos, recorrência, atribuições/contribuições, crédito automático, escopos global/curso e editor; fechar escrita direta de progresso |
| Ligas | `Ligas.tsx` consulta até mil linhas globais e agrupa no cliente pelo nível vitalício | Temporadas, inscrições/grupos, pontuação elegível, movimentos, fechamento/abertura e consultas do próprio grupo |
| PAC de curso/sala | Agrega tentativas finalizadas; sala ordenada por XP interno; Catálogo também compõe dados localmente | Última execução completa por aula/versão/contexto, amostra/eficiência/cobertura e leitura acadêmica única |
| Integridade | `finalize_attempt` evita reaplicar efeitos da mesma tentativa, mas recalcula resultados; anti-regrind atravessa contextos | Resultado imutável, ordinal persistente e unicidade por questão/contexto também entre tentativas concorrentes |
| Conclusões | `completions` distingue `course`/`room` sem identificar cada sala na chave | Conclusão concreta independente por sala; primeira conclusão sem questões também autorizada em sala |
| Privacidade | `educator_only` oculta texto, mas ainda pode retornar PAC e revelar emblema; políticas de escrita são amplas | Projeções autorizadas e privilégios/RLS que protejam também derivados, progresso e ordenação |
| Conta | Configurações chama `desativarConta` → `deactivate_account` e sai da sessão | Distinguir desativação temporária, exclusão definitiva e suspensão; implementar política de dados e conferir Auth/Storage/backups |

Fontes do diagnóstico: [missões/salas em 0005](../../codigo-base/supabase/migrations/0005_rooms_members_announcements_missions.sql), [aprendizagem em 0018](../../codigo-base/supabase/migrations/0018_no_xp_for_already_correct.sql), [conclusão sem questões em 0022](../../codigo-base/supabase/migrations/0022_complete_empty_lesson.sql), [rankings em 0015](../../codigo-base/supabase/migrations/0015_rankings.sql), [RLS em 0011](../../codigo-base/supabase/migrations/0011_rls_policies.sql) e [revisão de membros em 0020](../../codigo-base/supabase/migrations/0020_fix_room_members_rls_recursion.sql). Os detalhes e limites da inspeção permanecem nas propostas. Nenhum banco remoto foi inspecionado; privilégios e migrações efetivamente aplicados precisam ser verificados no ambiente isolado.

**Ingresso em sala atualmente:** [Salas](../../codigo-base/src/pages/Salas.tsx) chama [`salaRepository.entrarPorCodigo`](../../codigo-base/src/data/repositories.ts), que executa [`join_room` em 0010](../../codigo-base/supabase/migrations/0010_domain_functions.sql). A função valida sessão/código ativo e insere ou reativa **somente `room_members`**, sem escrever em `enrollments`. Criar sala grava referência `rooms.course_id`, sem copiar/converter curso nem incluir automaticamente o responsável como aluno. A finalização de sala mantém XP/métricas internos; matrícula automática é comportamento do ramo individual de curso, não do ingresso em sala.

A lacuna é o acesso ao conteúdo privado: as políticas consultadas de curso/módulo/aula/questão autorizam público publicado, criador ou administrador, sem completar a leitura contextual pelo membro da sala. A solução prevista é autorização de estudo **naquela sala**, sem publicar o curso, criar matrícula individual ou conceder edição do original. Os links de Dashboard/Salas devem conservar o contexto concreto até a finalização.

### 1.2 Substituições de decisões que devem orientar a implementação

| Histórico ou recomendação anterior | Regra consolidada que prevalece |
| --- | --- |
| Liga como faixa de XP vitalício; primeira avaliação congelada para PAC | Q003/Q004/Q101–Q103: liga semanal separada do nível; desenho delegado Q111/Q112: última execução completa para PAC corrente |
| Sala não avança globais; somente atividade inédita conta para missões | Q017/Q120–Q128: curso e sala avançam globais; revisão integral conta conforme objetivo, sem renovar base já creditada |
| Região física e seleção de alguns cursos para diárias | Q123–Q125: proximidade por amizades, sem localização; diária para **cada** curso individual elegível |
| Q131/Q132: primeiro crédito inscreve; zero sem grupo | Q137–Q139: abertura automática por estudo recente e entrada tardia por primeira atividade oficial, sem exigir XP positivo |
| Proteção de grupo pequeno/inteiro empatado para todos; ressalva de Q140 | Q143: todo inscrito válido com zero cai uma categoria até Bronze, inclusive sozinho, tardio ou grupo todo zerado. Proteções de XP positivo permanecem |
| Q132: desativado antes do fechamento não recebe movimento | Q070: desativação após inscrição preserva linha sem identidade, pontuação e movimento; conta já desativada na abertura não entra |
| Q057: segunda família de faixas/emblemas para PAC | Q062: emblemas Bronze–Lendário somente nas ligas; curso/sala apresentam indicadores acadêmicos e posição |
| Pseudônimo opcional no ranking; `public` de sala indefinido | Q069: foto/display name/banner padrão, sem preferência de pseudônimo. Q068: somente `members`/`educator_only`; legado `public` → `members` auditado |
| Adoção de versão e nomes operacionais ainda a perguntar | Q142 fecha versões. Q087/Q088 adiam designações/atendimento/SLAs humanos para antes de implantação/liberação, sem inventar nomes ou reabrir a prioridade agora |

Q010 não fixou limite de prazo/capacidade/custo do planejamento; isso não elimina as cotas funcionais nem fornece responsáveis. Novos fatos podem reabrir uma decisão específica, preservando seu histórico.

### 1.3 Escolhas feitas por delegação

| Origem | Escolha registrada pelo agente | Situação |
| --- | --- | --- |
| Q016 | 3 diárias globais, 2 semanais, 1 diária por curso elegível e referência de 5 missões de sala | Metas/cotas posteriormente confirmadas em Q125/Q135/Q136 |
| Q111/Q112 | Última execução completa, eficiência histórica, cobertura, mínimo de amostra e ordenação acadêmica | Desenho delegado, separado das respostas literais; cenários e regras de avaliação confirmados nas rodadas seguintes |
| Q123/Q124 | Afinidade até dois graus, pesos 2/1, semente persistida e grupos alvo 20 | Heurística delegada, sem promessa de reunir todos os amigos; abertura/entrada posteriores consolidadas em Q138/Q139/Q141 |
| Q105 | Sete categorias, cortes nominais de 20% e proteções de grupos pequenos/empates | Política inicial delegada; Q143 substitui somente as proteções de zero |
| Q045 | Bônus 2/8/1; sala 1–10, sugestão 4 | Valores iniciais delegados; orçamento/cotas/metas confirmados em Q135/Q136 |
| Q085 | Retenção, exclusão e suspensão descritas na seção 5.3 | Política de produto escolhida por delegação, não comportamento já entregue nem prazo legal atribuído ao usuário |
| Q099 | Cinco roteiros T01–T05 | Planejados na seção 6.3, sem execução ou exemplos falsamente atribuídos ao usuário |

### 1.4 Como ler arquivos e branches

- Caminhos das tabelas são relativos à raiz. Nomes agrupados sem diretório pertencem ao último diretório informado na célula. **Novo** significa proposto; **alterar** significa existente a conferir; **gerar** identifica artefato de ferramenta.
- `<N>` é a próxima migração disponível ao implementar; nenhum número foi reservado. Criar migrações incrementais, sem reescrever SQL histórico.
- `issue/<ID>-descricao` é sugestão a substituir pela história real do YouTrack. Todas as sessões têm **branch real e commits não iniciados**; nenhuma mudança funcional foi realizada em qualquer branch.
- Antes de iniciar código, conferir sprint vigente, issue/atribuição/estado e base atualizada, preservando alterações locais. As branches saem da sprint; dependências são integradas nela antes da sessão dependente.
- A mesma página aparece em sessões diferentes por escopos cumulativos. Não copiar versões antigas sobre trabalho integrado. Banco, tipos gerados e frontend precisam de compatibilidade e ordem de aplicação verificadas.

## 2. Comparação, arquitetura escolhida e contratos de produto

### 2.1 Comparação das propostas e opção conjunta

| Assunto | Contribuição das propostas | Escolha consolidada |
| --- | --- | --- |
| Missões | Definição/ocorrência/atribuição/contribuição/concessão e eventos internos | Módulo reutilizável para global, curso e sala, com catálogo compartilhado e progresso individual |
| Aprendizagem | Resultado imutável, versão e contexto concreto | Origem autorizada única para métricas, crédito e missões; revisão preserva histórico |
| XP | Livro de lançamentos e concessão única | Um mecanismo compartilhado de créditos, com destino e origem explícitos e projeções reconciliáveis |
| Rankings | Interface comum, audiência, posição e paginação no servidor | Liga por XP elegível semanal; curso/amigos e sala/alunos por PAC/eficiência/cobertura |
| Tecnologia | Aprofundar módulos na aplicação existente | React + Supabase/Postgres, sem backend/broker/biblioteca de estado obrigatórios |
| Consistência | Processamento síncrono ou posterior como alternativas | Q007 escolheu transação conjunta; entrega de notificações é separada e atribuição de grupo pode aguardar apuração conforme Q141 |

Usar módulos profundos com interface pequena, conforme [codebase-design](../../.agents/skills/codebase-design/SKILL.md): o chamador informa a ação/contexto, enquanto autorização, calendário, concorrência e política ficam concentrados. Evitar duplicar avaliadores ou criar adapters para persistências hipotéticas. Não há obrigação de instalar uma skill ou dependência nova.

| Módulo | Localização proposta | Responsabilidade e interface |
| --- | --- | --- |
| Aprendizagem | Funções SQL e `codigo-base/src/components/lesson/` | Iniciar/retomar execução, preservar primeiro envio, confirmar resultado e conclusão |
| Créditos internos | Relações/funções SQL compartilhadas | Registrar base/bônus/abertura/ajuste com chave semântica única; projetar e reconciliar saldos |
| Missões | SQL e `codigo-base/src/features/missoes/` | Listar/obter minhas missões e histórico; comandos editoriais da sala; avaliação interna por referência ao fato |
| Classificação | SQL e `codigo-base/src/features/classificacao/` | Listar leitura autorizada, obter meu resumo/regras/histórico, com contexto e período explícitos |
| Apresentação | Páginas existentes e nova `Missoes.tsx` | Ações permitidas, navegação, formatação e estados; não decidir XP, PAC ou posição |

`index.ts` será a entrada pública dos módulos React; composição e adapter Supabase ficam internos. Tipos de retorno devem identificar contexto, versão/regra, unidade, instante de referência, elegibilidade/visibilidade e cursor. A sessão 00 detalha contratos/DDL sem transformar cada nome conceitual em tabela obrigatória.

### 2.2 Origem segura, transação e modelo conceitual

O fluxo é: **atividade autorizada → resultado imutável/conclusão → crédito base e métricas → evento interno → contribuições de missão → concessão única no mesmo livro → leituras autorizadas**.

| Registro conceitual | Invariantes a implementar |
| --- | --- |
| Execução/snapshot e primeiros envios | Identidade estável da tentativa, usuário, aula/versão e curso ou sala concreta; primeiro envio preservado antes do feedback |
| `learning_results` / `context_completions` | Uma finalização oficial por execução; conclusão distingue salas; resultado não é regravado ao reenviar |
| `xp_credits` | Crédito base único por usuário/questão semântica/contexto; bônus único por atribuição; abertura/ajuste identificados separadamente |
| `learning_events` | Origem confirmada e instante/contexto derivados do servidor; deduplicação semântica, sem receber “acertou/concluiu” do cliente |
| Definições e ocorrências de missão | Regra/versão e janela canônica congeladas; uma ocorrência por definição/período |
| Atribuições e contribuições | Uma atribuição por usuário/ocorrência, meta/variante fixadas antes; contribuição única pela unidade do objetivo |
| Concessões de missão | Uma por atribuição, referenciando exatamente um crédito no destino correto |
| Métricas por contexto/versão | Projeções reconstruíveis das amostras completas autorizadas; ausência e ocultação não são zero |
| Temporadas, grupos, inscrições e resultados | Inscrição única, grupo/categoria estáveis, pontuação por créditos elegíveis e fechamento/movimento únicos |

Finalização, base, métricas indispensáveis, progresso, conquista e crédito de missão confirmam **juntos** ou revertem juntos. Reenvio recupera o resultado persistido; bloqueios em ordem estável, restrições únicas e incrementos atômicos precisam impedir corrida entre tentativas diferentes, não apenas na mesma tentativa. Filtros opcionais e `NULL` não podem enfraquecer a unicidade.

A intenção deduplicada de notificação é gravada de forma durável na transação; sua entrega ocorre depois. **Q141 permite esperar a atribuição competitiva definitiva**, registrando normalmente os fatos/créditos da nova janela. Isso não torna missões assíncronas nem autoriza bloquear aprendizagem só por atraso de grupo. Evoluir o processamento principal para outbox/broker exigiria nova decisão.

Cliente não escreve XP/nível/contadores, resultados, progresso, concessões ou movimentos. Revisar juntos `GRANT`, RLS e funções: rejeição explícita sem sessão, acesso ao conteúdo/contexto, papéis e estado da conta; funções internas sem execução pelo cliente, funções privilegiadas com `search_path` seguro e referências qualificadas. Preservar edição legítima de nome/avatar e demais campos permitidos. Bônus não emite evento de aprendizagem, evitando ciclos.

### 2.3 Calendário, elegibilidade e história

Usar `America/Sao_Paulo`, dia local e semana de **segunda-feira 00h até a segunda seguinte 00h**, intervalo `[início, fim)`. Calcular limites no servidor com instantes identificados; não usar relógio do navegador ou presumir duração fixa de cada dia. Vale a confirmação oficial, não o começo da aula.

Atividade iniciada antes e confirmada após o prazo pertence à nova janela, quando elegível. Se a confirmação ocorreu antes e só o retorno se perdeu, recuperar aquele resultado/instante. Exigir conexão para conquista oficial; não prometer sincronização offline retroativa.

Missões são automáticas. Materializar ocorrência/atribuição na leitura e obrigatoriamente antes de processar atividade elegível, sem exigir abrir Missões, aceitar ou resgatar. Cadastro, matrícula, ingresso, publicação e início efetivo delimitam elegibilidade; nenhum evento anterior conta. Leitura tardia não altera o início real para reduzir meta.

Matrícula abandonada não recebe novas diárias; concluída pode receber revisão viável. Remoção/saída/perda de autorização bloqueia novas contribuições; reingresso na mesma ocorrência reutiliza atribuição e não renova bônus. Créditos confirmados são preservados. História contém atribuições materializadas, sem inventar todas as missões perdidas de dias sem visita/atividade. Expiração encerra contribuição, mantém progresso/conquista e não transfere contagem.

### 2.4 Crédito, nível e métricas acadêmicas

**Crédito base delegado em Q111/Q112 e confirmado em Q126:** contar o ordinal `n` do primeiro acerto entre os primeiros envios oficiais da questão em tentativas distintas do mesmo contexto. Erro enviado persiste após abandono, nova aba ou recomeço; editar localmente antes do envio não conta. A primeira execução integral que confirma acerto elegível concede `base/n` uma vez. Se houve acerto em execução abandonada, preservar seu ordinal e aguardar confirmação numa execução completa. Questão errada não recebe base; novo acerto do já creditado não paga novamente.

Manter os valores base configurados; usar crédito/saldos com **quatro casas decimais**, arredondando uma vez por lançamento. Base 4 e primeiro acerto em `n=1/2/3` produz `4/2/1,3333`. A mesma questão pode ter um crédito no curso individual e um em cada sala autorizada; não repetir no mesmo contexto nem por edição cosmética.

Preservar fronteiras inferiores de nível: **0, 100, 250, 500, 1.000, 2.000 e depois +2.000 XP**. Adaptar a função inteira atual ao decimal; `99,9999` é nível 1 e `100` é nível 2. Arredondamento de tela não altera nível. Nível não atribui categoria de liga.

| Medida | Regra corrente do plano |
| --- | --- |
| PAC | `100 × C/N`, com uma unidade binária por questão: totalmente correta 1, errada/parcial 0, inclusive associação/soma; sem peso de XP ou média simples de percentuais |
| Amostra corrente | Última execução **completa** de cada aula/versão/contexto. Revisão pode melhorar ou piorar PAC; resultados anteriores permanecem |
| Eficiência delegada | `E = 100 × soma(w)/N`; `w=1/n` se a resposta corrente está correta, senão 0; ordinal histórico não se renova |
| Cobertura delegada | `100 × N/Q`, onde `Q` é o conjunto avaliável da versão corrente |
| Mínimo delegado | `T = min(Q, max(5, teto(0,20 × Q)))`. Sem questões/amostra ou com `N<T`: sem classificação ou provisório, sem posição fictícia |
| Ordem acadêmica | PAC bruto decrescente → eficiência → cobertura. Empate na tupla compartilha posição; ID só estabiliza apresentação |
| Progresso | Aulas validamente concluídas no contexto; não é PAC. Aula sem questões pode concluir sem criar acertos, denominador ou XP base |

Exemplo: duas questões de base 4. Ana acerta ambas de primeira: PAC 100%, eficiência 100%, base 8. Bruno acerta uma de primeira e a outra na segunda execução completa: PAC 100%, eficiência 75%, base total 6. Só há posição se a amostra mínima do contexto for satisfeita. O limiar delegado não promete equivalência estatística entre conteúdos diferentes.

Tentativa incompleta não altera amostra e pode ser retomada na mesma versão, **sem expiração automática por tempo**, enquanto autorizada. Conclusão com questões exige todas respondidas, não todos os acertos. Estados `sem amostra`, `provisório`, `oculto`, `carregando` e `erro` são distintos de PAC válido com zero acertos. PAC nunca bloqueia automaticamente curso, sala, aula seguinte ou missão já elegível.

**Q062 encerrou Q057:** mostrar PAC, eficiência, cobertura e posição nos contextos acadêmicos, **sem faixas ou emblemas de PAC no MVP**. Bronze–Lendário pertence somente às ligas. Não implementar os cinco cortes antigos nem inventar sete limiares acadêmicos; arredondar percentuais apenas para apresentação.

### 2.5 Missões, metas, bônus e orçamento

Catálogo da plataforma compartilhado e determinístico, com progresso individual e variantes aprovadas, sem sorteio por pessoa ou adaptação por perfil. Uma atividade integral pode contribuir a todas as missões compatíveis; cada uma tem concessão única e não multiplica a base.

| Missão | Meta inicial | Bônus e destino | Variante/limite |
| --- | --- | --- | --- |
| Diária global 1 | Concluir 1 aula | 2 XP vitalícios | Nova ou revisão integral; sem questões só primeira conclusão |
| Diária global 2 | Acertar 3 questões distintas | 2 XP vitalícios | Se não há 3 elegíveis, meta 1; nenhuma questão: indisponível |
| Diária global 3 | Concluir 3 execuções completas | 2 XP vitalícios | Mesma aula com questões pode repetir; somente aulas vazias: reduzir à quantidade de primeiras conclusões possível, mínima 1 |
| Semanal global 1 | Concluir 10 execuções completas | 8 XP vitalícios | Mesma regra de revisão e redução quando só há primeiras conclusões vazias |
| Semanal global 2 | Estudar em 3 dias distintos | 8 XP vitalícios | Até 3 datas disponíveis desde início real da elegibilidade, mínima 1; visita tardia não reduz meta |
| Diária de **cada** curso individual elegível | Concluir 1 aula naquele curso | 1 XP vitalício | Gerada pelo sistema sem ação do autor; revisão viável em concluído; estudo só em sala não cria diária individual |
| Avulsa da sala | Objetivo/meta/conteúdo aprovados pelo educador | 1–10 XP internos; sugestão 4 | Sala inteira; viabilidade validada antes de publicar/atribuir |

Globais aceitam curso e sala. Nova execução integral, inclusive da mesma aula com questões, conta nos objetivos de execução; reenvio da mesma tentativa não conta. Clique repetido em aula vazia não prova revisão. Questão já acertada pode contar em **nova ocorrência**, uma vez por questão semântica/ocorrência; acertá-la em curso e sala não a transforma em duas questões distintas da mesma missão global.

Variante fica fixa antes da atribuição, conserva o bônus e não cria recompensa extra. Sem atividade viável, mostrar indisponibilidade sem penalidade da missão. Objetivos de tempo de tela, tarefas externas, sequências/expressões arbitrárias e critérios compostos não entram por inferência.

Valores vieram da delegação Q045 e foram confirmados com metas/cotas Q135/Q136. Orçamento global decorrente do catálogo, **sem teto oculto de pagamento**: `6 + C_d + 8 × W_d` por dia, com `W_d=0..2` semanais concluídas naquele dia; na semana, `58 + soma(C_d)`. Para `C` constante, `58 + 7C`. As duas semanais podem pagar no mesmo dia; muitos cursos aumentam ganho vitalício, sem bônus competitivo.

Simulação de bônus apenas, saldo inicial zero, todos os objetivos viáveis/concluídos, sem base ou ajustes:

| Cursos elegíveis constantes | 7 dias | 28 dias / 4 semanas | Nível após 28 dias |
| --- | --- | --- | --- |
| 1 | 65 XP | 260 XP | 3 |
| 5 | 93 XP | 372 XP | 3 |
| 20 | 198 XP | 792 XP | 4 |

Dez questões novas de base 4 por dia, acertadas de primeira, dariam 280 de base/semana; com 65 de bônus no cenário de um curso, 345 vitalícios e somente os 280 elegíveis competitivos. Se já creditadas, a revisão gera zero base/competitivo. São simulações, não prova de balanceamento.

**Sala:** até **5 novas publicações por semana local e 5 vigências sobrepostas**; agendada consome cota ao publicar, rascunho não. Cancelar/arquivar não devolve cota; nova regra/publicação consome nova oportunidade. O conjunto publicado na semana oferece até 50 XP por aluno, mas isso **não limita os pagamentos daquela semana**: missão antiga pode concluir depois.

### 2.6 Sala, editor, conteúdo versionado e audiência

Nova sala nasce com curso vinculado e **não troca `course_id` depois**, mesmo sem missão ativa. Principal cenário: privado próprio publicado/pronto; público publicado de outro autor também permitido, sem edição/cópia/conversão. Rascunhos servem à preparação. Participação por código não cria matrícula individual, diária individual ou amostra individual de curso.

Responsável único ou administrador autorizado gerencia missões da sala inteira: título, descrição, objetivo permitido, conteúdo, meta, janela e XP dentro da política. Sem coeducadores, moderadores, subgrupos ou atribuição individual. Rascunho é privado aos editores, sem contribuição, atribuição ou notificação; publicação exige validação e prévia.

Missão de sala é avulsa, com duração de **1 hora a 90 dias**, fim obrigatório, imediata ou agendada, sem antecedência mínima. Objetivo, meta, conteúdo, recompensa e janela publicados são imutáveis; só corrigir texto sem mudar regra. Nova regra exige publicação futura. Cancelamento com motivo interrompe contribuição, preserva história/créditos; 90% não concede prêmio automático. Arquivo conserva história. Educador acompanha alunos/missões de sua sala com paginação, pendentes/concluídos, progresso/concessão, sem CSV/relatório externo ou detalhamento adicional de respostas.

**Versões — Q059/Q142:** snapshot do conjunto/configuração ao iniciar. Novas execuções individuais usam a última versão publicada/autorizada; educador adota explicitamente atualização do **mesmo curso** na sala. Bloquear adoção que altere conteúdo necessário a missão publicada ainda ativa até término ou cancelamento explícito. Tentativa iniciada pode concluir snapshot enquanto autorizada; resultado antigo fica histórico e não substitui amostra da versão nova. Aula inalterada conserva amostra; modificada precisa de execução completa e fica sem amostra/provisória até lá. Manter identidade semântica, ordinais e créditos dos itens inalterados, sem repagamento; cobertura é da versão corrente, sem mistura não identificada ou acesso perpétuo a conteúdo revogado.

| Contexto/audiência | Quem recebe indicadores e ordem |
| --- | --- |
| Curso | Próprio usuário e amigos aceitos, com matrícula ativa/concluída, acesso autorizado e amostra individual elegível. Abandonado/estudo só em sala fora da ordenação; amizade não abre curso privado |
| Sala `members` | Alunos participantes ativos com indicadores autorizados; responsável sempre fora do ranking, mesmo inscrito como membro |
| Sala `educator_only` | Responsável/administrador autorizado recebe acompanhamento permitido; aluno somente seus indicadores, sem PAC/eficiência/cobertura/**progresso**, posição, ordem ou contagem de empates dos colegas |
| Liga | Próprio grupo, resumo pessoal e histórico autorizado; regras/categorias podem ser explicadas sem listar competidores de outros grupos/ligas |

Retirar `public` da criação/edição de sala; mapear legado para `members` com registro, sem ampliar audiência. Curso público não torna sala pública. Ocultação vale na rede, consultas diretas e derivados, não só na tela; não substituir ranking restrito por XP. Ex-membro perde métricas correntes dos colegas/conteúdo da sala; mantém somente história própria e acompanhamento autorizado conforme retenção.

Prévia/teste de autor/admin não concede XP base, bônus ou amostra oficial. Educador/admin pode estudar legitimamente conteúdo alheio autorizado e competir; não excluir apenas pelo papel. Conteúdo de autoria própria não gera XP competitivo; responsável nunca concorre com os alunos da própria sala.

### 2.7 Ligas semanais, formação e movimentos

Preservar XP/nível vitalício sem ranking global desse saldo. A liga tem XP temporário de **novos créditos elegíveis de aprendizagem individual confirmados na janela**. Excluir abertura, ajustes históricos, XP interno, **todos os bônus de missão**, autoria própria e repetição já creditada. Q129 aceita que quem esgotou primeiros acertos pode revisar/ganhar bônus vitalício e continuar com zero competitivo; não criar pontos compensatórios.

Reutilizar sete emblemas/categorias: **Bronze, Prata, Ouro, Platina, Diamante, Mestre e Lendário**. Primeira participação no mecanismo começa em Bronze; posteriores usam a categoria do último resultado fechado. Nível vitalício não determina categoria inicial.

**Inscrição automática — Q137–Q141:**

1. Na abertura `S`, fotografar contas ativas com pelo menos uma conclusão oficial de aula em curso ou sala em `[S−7 dias, S)`. Revisão integral e primeira conclusão sem questões contam, mesmo com zero competitivo; login/visita/abrir aula/rascunho/bônus não contam. Papel não exclui estudo legítimo.
2. Fechar/apurar semana anterior, persistir categorias e formar/publicar novo lote, sem depender de visita ou primeiro crédito. Elegibilidade é a fotografia de `S`, não do instante atrasado do job.
3. Durante a espera, confirmar aprendizagem/XP/missões normalmente e registrar fatos/créditos da nova janela para associação única ao grupo definitivo. Sem categoria/posição provisória, perda de atividade ou bloqueio do estudo só por atraso de formação.
4. Quem ficou fora do lote entra automaticamente na primeira atividade oficial válida da semana, **sem exigir XP positivo**, com categoria persistida ou Bronze. Buscar afinidade entre grupos da mesma categoria com vaga até 30; sem vaga, criar grupo tardio. Não mover inscritos, estender janela ou criar segunda inscrição.
5. Não há aceite ou abandono de temporada. Sair de sala/curso ou não voltar à plataforma não retira inscrição. Conta desativada antes da abertura não entra; após inscrita segue seção 5.3.

**Agrupamento delegado — Q123/Q124/Q105:** usar amizades aceitas fotografadas na formação: diretos peso 2, amigos de amigos até dois graus peso 1, demais por desempate pseudoaleatório com semente persistida. Separar categorias antes de afinidade. Sem campo geográfico/IP e sem expor caminhos/amizades de terceiros. Mesma fotografia/regras/semente reproduz o ensaio; afinidade não garante reunir todos.

Alvo 20, mínimo operacional de referência 10 e teto 30, admitindo população realmente pequena. Para `P>0` elegíveis da categoria, `G=max(1,teto(P/20))`; `P=0` não cria grupo vazio. Balancear antes de publicar: 45 podem formar 3 grupos de 15. Depois, atribuição única e estável; mudança de amizades só influencia formação futura. Total cadastrado orienta capacidade, sem preencher grupos com contas inativas.

**Cortes nominais delegados — Q105, com exceção obrigatória Q143:** `n` inclui todo inscrito válido, inclusive zero. Calcular zonas sobre o grupo inteiro antes da paginação.

| Tamanho | Promoção nominal, exigindo XP positivo | Zona inferior nominal para pontuação positiva |
| --- | --- | --- |
| `n=0/1` | Nenhuma | Nenhuma |
| `2≤n<10` | `max(1,piso(0,20×n))` do topo | Nenhuma; proteção de grupo pequeno para positivos |
| `10≤n≤30` | `piso(0,20×n)` do topo | `piso(0,20×n)` da base, incluindo zeros ao calcular o corte |

Mesma pontuação compartilha posição (ex.: 1, 1, 3). Expandir todo bloco empatado no corte; ID/nome/data só estabilizam exibição, nunca vencem empate. Se um bloco **positivo** alcançar as duas zonas, permanece; grupo inteiro com mesma pontuação **positiva** não muda. Movimento é de uma categoria, com Bronze como piso e Lendário sem promoção.

**Zero tem prioridade sobre essas proteções:** todo inscrito válido com zero cai uma categoria até Bronze, inclusive grupo totalmente zerado, menor que dez, pessoa sozinha, entrada tardia ou estudo só em sala/revisão. Zero nunca promove. União da zona inferior normal com queda obrigatória, sem descer duas vezes. Exemplos: todos zerados em Prata → Bronze; pessoa sozinha zerada em Mestre → Diamante; zero em Bronze permanece. Grupo de oito com XP positivo mantém proteção inferior; grupo de vinte tem quatro vagas nominais por zona antes de empates. Incidente não reconciliado fica **Em apuração**, nunca zero presumido.

Backend varre a cada **5 minutos**, alvo de fechamento/publicação e nova formação em até **5 minutos após a virada**, alerta em **30 minutos** sem consistência. Retentativa idempotente, resultado integral e movimentos persistidos uma vez; atraso não amplia janela. Definir/provisionar executor no ambiente existente durante implementação. **Sem prêmio de colocação**: não há XP, moeda, item, medalha nova, benefício externo ou desbloqueio; incentivo é promoção possível e histórico.

### 2.8 Telas, identidade, atualização e notificações

`/missoes` terá lista/detalhe/histórico e filtros; entrada junto de Ligas, preservando ordem dos demais itens. `/ligas` mostra próprio grupo/resumo/histórico. Curso/sala usam páginas existentes e abertura do conteúdo no contexto correto. Navegação móvel recolhível acessível; português brasileiro, tokens/componentes atuais, sem redesenho geral.

TopDown mostra **até 3 pendentes** dos escopos autorizados, rotuladas, por prazo mais próximo e ID estável, com link para lista completa; concluídas/vencidas em áreas próprias. Globais aparecem sem curso ativo. Detalhe informa critério/meta/conteúdo elegível, contexto/versão, progresso, prazo/fuso, recompensa e ação autorizada; abrir detalhe não é requisito para progresso.

Resumos de ranking têm **até 5 entradas reais**, posição compartilhada e quantidade adicional de empatados com acesso paginado completo; cálculo de cortes usa grupo inteiro. Resumo pessoal independe de Top N/primeira página. `educator_only` não devolve contagem/ordem de colegas. Usar **foto, display name e banner padrão**, sem e-mail/pseudônimo/identidade alternativa opcional. Foto/nome em linhas compactas; banner em cartão/pódio ou detalhe acessível. Ocultar identidade por estado de conta não é preferência do ranking.

Após confirmação, resumo da aula separa base, bônus e conquistas; feedback discreto acessível, sem resgate, som, confete ou modal extra obrigatório. Reenvio não repete prêmio/celebração. Distinguir rejeição, operação ainda desconhecida e confirmação com retorno perdido; recuperar resultado antes de repetir. Sem sucesso fictício ou falha convertida em zero.

Revalidar após atividade própria, mudança de contexto, reabertura e foco. Enquanto Ligas estiver visível, consultar a cada **60 segundos**; demais listas ao reabrir/focar, com instante de referência e ação Atualizar. Meta de defasagem de até 60 segundos com serviço disponível; apuração/formação segue alvo próprio de cinco minutos. Falha sinaliza dado desatualizado, sem exigir push/tempo real.

| Notificação interna | Regra de entrega/utilidade |
| --- | --- |
| Publicação de missão de sala | Deduplicada por publicação/destinatário, respeitando participação; útil até o menor entre 24h e fim/cancelamento |
| Conquista de missão | Intenção durável; aviso útil por 7 dias para recuperação operacional, depois somente histórico |
| Resultado definitivo da temporada | Após apuração, com posição/categoria/movimento próprios, inclusive zero; útil por 7 dias, depois histórico |
| Retentativa | A cada 5 minutos por até 24h; depois registrar falha para reconciliação. Recuperação dos avisos de conquista/resultado limitada à utilidade de 7 dias |

Sem aviso por inscrição semanal, incremento, renovação diária ou mudança de posição; sem e-mail/push/SMS. Falha de entrega não desfaz atividade/XP e não provoca nova concessão. Clique respeita autorização atual e pode abrir história própria, sem reabrir conteúdo/colegas cujo acesso se perdeu.

Acessibilidade: teclado/foco/retorno de modal, rótulos e anúncios, contraste, estados, redução de movimento. Homologar desktop Chrome/Edge/Firefox, móvel Chrome Android/Safari iOS, larguras **360/768/1440 px**, versões estáveis no momento do ensaio. Registrar evidência/limitações, sem alegar certificação formal.

### 2.9 Exclusões e extensões que exigem nova decisão

Ficam fora: ranking global vitalício; temporadas acadêmicas de curso/sala; segunda família de emblemas PAC; grupos geográficos/navegação por competidores alheios; abandono de temporada; XP compensatório de revisão; sorteio/adaptação individual de missões; seleção limitada de cursos para diárias; recorrência de sala, coeducação, subgrupos e tarefas individuais; scripts/anexos/tarefas externas; painel administrativo completo; CSV/relatório externo adicional; moedas/itens/novos prêmios; pseudônimo opcional; canais externos de notificação; confirmação offline retroativa; novo backend/broker/gerenciador de estado obrigatório e redesenho geral.

Preservar medalhas existentes sem redesenhá-las. Ajuste administrativo exige motivo/referência, mantém origem, evita saldo negativo e explica eventual redução de nível; não é movimento de liga. Termos/ADR/specs/tickets e documentação responsável só serão alterados em etapa autorizada, dentro do escopo da sessão correspondente.

## 3. Fluxo de desenvolvimento, skills e dependências

| Sessão | Entrega principal | Depende de | Branch sugerida |
| --- | --- | --- | --- |
| 00 | Confirmar consolidação e detalhar contratos/tickets | Confirmação explícita deste entendimento | `issue/<ID>-define-gamificacao` |
| 01 | Ambiente SQL isolado e testes dos contratos | 00 | `issue/<ID>-testes-banco-gamificacao` |
| 02 | Origem segura, resultados, créditos e compatibilidade | 01 | `issue/<ID>-nucleo-aprendizagem-xp` |
| 03 | PAC, conclusão por contexto e privacidade | 02 | `issue/<ID>-metricas-contexto-pac` |
| 04A | Núcleo das temporadas globais por XP | 02, 03 | `issue/<ID>-temporadas-globais` |
| 04 | Interfaces de ligas e leituras por contexto | 03, 04A | `issue/<ID>-classificacao-ligas` |
| 05 | Mecanismo de missões e recompensa compartilhada | 02, 03 | `issue/<ID>-nucleo-missoes` |
| 06 | Área central e missões globais no dashboard | 04, 05 | `issue/<ID>-missoes-globais` |
| 07 | Integração completa dos cursos | 06 | `issue/<ID>-missoes-ranking-cursos` |
| 08 | Missões personalizadas e classificação nas salas | 07 | `issue/<ID>-missoes-ranking-salas` |
| 09 | Notificações, atualização e ciclo de conta | 08 | `issue/<ID>-integra-gamificacao` |
| 10 | Corte ensaiado, homologação e preparação operacional | 09 | `issue/<ID>-valida-gamificacao` |

Todas as sessões abaixo estão planejadas; a branch sugerida em seu cabeçalho se aplica a cada linha da respectiva tabela. Nenhum arquivo funcional foi alterado em nenhuma dessas branches. A ordem sugerida é sequencial para reduzir conflitos em `repositories.ts`, `database.ts`, Dashboard e Salas. O mecanismo de missão depende da origem segura, não da existência de uma página de ranking; as dependências técnicas mínimas estão explicitadas para permitir replanejamento.

### 3.1 Fluxo de trabalho escolhido para o agente

**Uma entrega verificável por vez:** confirmar o entendimento deste guia e os pontos de teste da seção 3.4 → preparar spec/tickets na sessão 00 → validar ambiente na 01 → executar um ticket pronto em uma branch de issue → testar/revisar/registrar → integrar pela sprint quando autorizado → avançar ao próximo desbloqueado. As sessões 00–10/04A são marcos de coordenação; uma sessão pode conter vários tickets pequenos. A prioridade continua a ordem já aceita na tabela acima.

A leitura de skills nesta preparação **não executa seus fluxos**. Criar specs/tickets, alterar glossário/ADR, instalar ferramentas, aplicar SQL e implementar continuam fora desta solicitação, limitada ao guia. Na execução futura, autorização e escopo expressos pelo usuário prevalecem sobre automações das skills.

| Passo | Ação do agente | Condição para concluir |
| --- | --- | --- |
| 1. Retomar | Ler AGENTS, fluxo do projeto, este roteiro e a sessão/ticket corrente; conferir status local e base, preservando mudanças existentes | Objetivo, autorização vigente, issue/sprint, dependências e arquivos próprios identificados |
| 2. Fixar a entrega | Ligar o comportamento aos IDs Q e critérios da seção 6; registrar o que o ticket demonstra e os pontos de teste acordados | Escopo pequeno, critério observável e bloqueadores satisfeitos; nenhuma decisão de produto inventada |
| 3. Preparar a branch e a referência | Conferir issue real/atribuição/Em andamento; partir da sprint atualizada e anotar SHA inicial, estado local e versão de esquema | Branch por issue válida e comparação reproduzível, sem incluir trabalho anterior no diff da entrega |
| 4. Conferir o ambiente | Validar ferramentas/configuração e acesso ao banco isolado; executar somente o baseline pertinente antes das mudanças | Separação clara entre falha já existente, dependência ausente e regressão; ambiente identificado sem expor credenciais |
| 5. Implementar um comportamento | TDD em contrato público: teste falha pelo comportamento esperado → mudança mínima → teste passa. Atualizar SQL, adapter/tipos e consumidor necessários para o mesmo comportamento | Um percurso completo funciona; resultado esperado vem da especificação/exemplo independente, não da repetição do algoritmo |
| 6. Ampliar gradualmente | Próximo comportamento/caso de erro, mantendo interfaces pequenas, compatibilidade e unicidade; tipagem/testes focados durante os ciclos | Critérios do ticket cobertos sem deixar suíte geral antecipadamente quebrada para funcionalidades futuras |
| 7. Revisar | Conferir padrões do repo e aderência à spec em análises separadas; corrigir achados demonstráveis e refatorar quando necessário | Diff completo revisado, incluindo novos arquivos e consumidores; sem falhas materiais não tratadas |
| 8. Validar a entrega | Executar as verificações aplicáveis de Testes após as alterações finais; SQL real para persistência/permissões e E2E/evidências para UI | Resultado e ambiente registrados; limitações explícitas. Teste simulado não é aprovação de RLS/concorrência |
| 9. Registrar e encaminhar | Atualizar sessão/ticket e referência responsável; preparar resumo/diff e, somente dentro da autorização vigente, commit/PR para sprint | Arquivos/páginas/branch e evidências reais registrados; revisão humana/integração distintas de conclusão local |
| 10. Escolher a continuação | Próximo ticket cujos bloqueadores foram integrados; persistir estado antes de encerrar/trocar contexto | Próxima ação e comando de validação claros; nenhuma dependência tratada como integrada apenas por estar pronta localmente |

Concentrar a implementação no menor comportamento completo. Por exemplo, “finalizar e reenviar uma aula de curso sem duplicar crédito” atravessa banco, contrato e consumidor necessário; “criar todas as tabelas para depois ligar às telas” não é uma entrega funcional. Infraestrutura de teste da sessão 01 é exceção preparatória: entrega um harness reproduzível com teste de sanidade, não todos os testes futuros de uma vez.

### 3.2 Varredura de skills e seleção para este projeto

**Levantamento local de 29/10/2026:** frontmatters de **78 arquivos SKILL.md**, sendo **38 canônicos no repositório e 40 em instalações globais/caches**. Foram inspecionados `.agents/skills/`, a instalação global de `find-skills`, as skills de sistema e os caches dos plugins presentes. Arquivo encontrado no cache não significa skill ativa na sessão; confirmar disponibilidade ao usá-la. As candidatas de engenharia abaixo tiveram o SKILL.md lido integralmente para esta seleção.

Este quadro registra **quando consultar**, não uma sequência para carregar todas as skills em cada ticket. Redescobrir descrições locais ao iniciar a tarefa, como manda AGENTS; abrir por inteiro apenas a skill aplicável e seus apoios exigidos. O [roteador ask-matt](../../.agents/skills/ask-matt/SKILL.md) auxilia quando houver dúvida de fluxo.

| Skill canônica | Uso escolhido | Entrega/limite |
| --- | --- | --- |
| [writing-for-agents](../../.agents/skills/writing-for-agents/SKILL.md) | Preparação, spec, tickets e retomada | Passos curtos com conclusão verificável e referências por necessidade; aplicada à organização deste guia |
| [codebase-design](../../.agents/skills/codebase-design/SKILL.md) | Contratos de aprendizagem, missões e classificação | Módulos profundos/interfaces pequenas; concentrar regras e testar a interface usada pelo chamador |
| [domain-modeling](../../.agents/skills/domain-modeling/SKILL.md) | Sessão 00 e significado novo que surgir | Glossário só com conceitos; ADR apenas para decisão difícil de reverter com alternativa/trade-off real |
| [to-spec](../../.agents/skills/to-spec/SKILL.md) | Depois da confirmação final, sessão 00 | Sintetizar decisões existentes, contratos e testes em `.scratch/gamificacao/spec.md`; não reiniciar entrevista ou copiar o questionário inteiro |
| [to-tickets](../../.agents/skills/to-tickets/SKILL.md) | Decompor a spec por comportamentos completos | Um arquivo por ticket, dependências explícitas e tamanho de uma sessão de trabalho; validar granularidade no plano apresentado |
| [tdd](../../.agents/skills/tdd/SKILL.md) | Cada comportamento funcional dos tickets | Um teste relevante falhando e implementação mínima por ciclo, nos pontos acordados; consultar também seus [exemplos](../../.agents/skills/tdd/tests.md) e [mocks](../../.agents/skills/tdd/mocking.md) |
| [implement](../../.agents/skills/implement/SKILL.md) | Procedimento de execução de **um ticket** | Usar TDD, tipagem e revisão, com a adaptação de commits da seção 3.3; nenhuma invocação de implementação nesta revisão |
| [code-review](../../.agents/skills/code-review/SKILL.md) | Revisão de diff contra referência real e spec identificada | Padrões e Spec separados; comparação correta para commits ou alterações ainda não commitadas conforme seção 3.3; complementa revisão humana |
| [pr](../../.agents/skills/pr/SKILL.md) | Quando houver preparação de PR autorizada | Problema/comportamento, evidências e risco/recuperação; incluir o registro de IA exigido pelo projeto |
| [diagnosing-bugs](../../.agents/skills/diagnosing-bugs/SKILL.md) | Falha difícil, concorrência intermitente ou regressão de desempenho | Primeiro obter reprodução/teste capaz de detectar o sintoma; hipóteses e correção vêm depois |
| [research](../../.agents/skills/research/SKILL.md) | Questão técnica externa que bloqueie o ticket, como suporte real de Auth/Storage/agendamento | Fontes primárias e nota focada; sua delegação/arquivo exigem escopo permitido. Consulta local simples fica com o agente principal |
| [prototype](../../.agents/skills/prototype/SKILL.md) | Só se uma dúvida concreta de interação/estado não puder ser resolvida pela spec | Protótipo descartável para responder uma pergunta; não substitui testes SQL nem cria fase obrigatória de redesign |
| [handoff](../../.agents/skills/handoff/SKILL.md) | Transferir para outra ferramenta, diretório ou pessoa | Resumo portátil com referências, em temporário do sistema conforme a skill; retomada comum usa o registro da seção 7 |
| [retro](../../.agents/skills/retro/SKILL.md) | Após falha recorrente ou sessão que revelou custo evitável | Sugerir melhoria específica de ambiente/verificação; alteração de tooling segue escopo próprio, sem ampliar a feature automaticamente |
| [wizard](../../.agents/skills/wizard/SKILL.md) | Apenas etapa que exija ação humana inacessível ao agente | Procedimento concreto para provisionamento/credencial; não transferir ao usuário trabalho que o agente consegue executar |
| `computer-use:computer-use` (plugin) | QA manual de interface Windows quando a automação de UI for necessária | Complementar Playwright/checagens reais; ler a documentação do plugin antes de controlar apps. Não comprova Safari iOS/Android ou substitui SQL; nenhum app foi operado nesta preparação |

**Opções examinadas que não compõem o fluxo padrão:**

- [implement-spec](../../.agents/skills/implement-spec/SKILL.md) e [chief-of-staff](../../.agents/skills/chief-of-staff/SKILL.md) coordenam vários agentes; a primeira propõe integração própria/worktrees e a segunda acrescenta wiki/agendamentos. Aqui, SQL, tipos e telas compartilham muitos arquivos e regras. Começar por um ticket de cada vez; considerar delegação restrita somente conforme a seção 3.3, sem substituir branches por issue/sprint.
- [grill-with-docs](../../.agents/skills/grill-with-docs/SKILL.md), [grilling](../../.agents/skills/grilling/SKILL.md) e [wayfinder](../../.agents/skills/wayfinder/SKILL.md) ajudam a resolver decisões. O escopo já passou por dez rodadas; voltar a esses fluxos somente para contradição nova identificada, não por rotina a cada ticket. [triage](../../.agents/skills/triage/SKILL.md) é para entrada ainda não especificada; os tickets preparados pela spec não precisam de nova triagem.
- [setup-matt-pocock-skills](../../.agents/skills/setup-matt-pocock-skills/SKILL.md) já tem suas referências de tracker/labels/domínio presentes. [setup-pre-commit](../../.agents/skills/setup-pre-commit/SKILL.md) não deve reconstruir hooks existentes nem sobrescrever o `prepare` que também configura links de skills. [setup-ts-deep-modules](../../.agents/skills/setup-ts-deep-modules/SKILL.md) acrescentaria dependência/configuração e outra estrutura de pastas; manter os módulos em `src/features` e avaliar automação de imports só se houver necessidade demonstrada.
- [migrate-to-shoehorn](../../.agents/skills/migrate-to-shoehorn/SKILL.md) implica biblioteca nova de dados parciais de teste; fixtures tipadas simples atendem o início. [git-guardrails-claude-code](../../.agents/skills/git-guardrails-claude-code/SKILL.md) é configuração específica do Claude, sem função de proteção automática do Codex. [claude-handoff](../../.agents/skills/claude-handoff/SKILL.md) lança outro runtime; não é o mecanismo de continuidade deste plano.
- `find-skills` e `skill-installer` são recursos de descoberta/instalação, não etapas de cada feature. A candidata Supabase citada nas propostas, `supabase-postgres-best-practices`, **não foi encontrada instalada** nesta varredura e não é pré-requisito. Não houve busca externa, instalação ou atualização de skills.
- `review-agent` foi encontrado na instalação global e aceita revisão somente de leitura de alterações sem commit, mas não consta no catálogo ativo recebido nesta sessão. Pode ser alternativa futura se estiver disponível e houver delegação aplicável; a revisão local não depende dele. Demais skills de documentos de escritório, mídia, sites hospedados, planilhas e pets ficaram fora da seleção pelo escopo descrito em seus frontmatters.

### 3.3 Adaptações ao fluxo do repositório e às autorizações

| Ponto encontrado nas skills | Regra de execução neste projeto |
| --- | --- |
| `implement` termina com “Commit your work to the current branch” | Manter mudanças revisáveis na branch correta; executar commit apenas quando a autorização vigente permitir. A restrição atual a código/migração/commit continua integral nesta preparação |
| `implement-spec` cria integração própria, usa vários worktrees e prevê merges/limpeza | Padrão é branch de issue a partir da sprint. Paralelismo de implementação só quando pedido ou exigido pela skill aplicável e compatível com o projeto, com isolamento explícito e sem sobrescrever trabalho local |
| `to-spec` e `to-tickets` publicam artefatos | Neste repo, o destino das skills é [tracker local](../agents/issue-tracker.md), com [labels locais](../agents/triage-labels.md); YouTrack continua o rastreamento da equipe. IDs locais não são IDs reais de YouTrack; não criar issues externas por suposição |
| `to-spec`/`tdd` pedem acordo sobre pontos de teste; `to-tickets` valida granularidade/dependências | Apresentar seções 3.4–3.5 junto da confirmação final do guia, antes de testes/código. Aproveitar aceites já registrados; uma confirmação explícita que cubra este plano evita repetir perguntas em cada microetapa |
| `code-review` descreve diff `<base>...HEAD` | Esse diff cobre commits. Sem commits, revisar também working tree/index e novos arquivos, usando referência inicial/escopo preservados; não apresentar diff vazio como aprovação |
| Algumas skills prescrevem gravações/commits/publicação mesmo em tarefas exploratórias | Aplicar o limite da solicitação. Aqui, somente o guia; no futuro, adaptar destino/ação às autorizações vigentes e registrar a adaptação, sem editar o SKILL.md |
| `tdd` separa implementação e refatoração | Ciclos de comportamento usam teste falhando → implementação mínima passando; refatoração entra na revisão, mantendo testes verdes e revalidando o que afetar |

**Revisão antes de commit:** anotar o SHA de início do ticket e alterações preexistentes. Inspecionar o conjunto real da entrega: commits próprios se houver, diferenças de arquivos rastreados no index/working tree e conteúdo de novos arquivos. Comparações de working tree com a base e diferenças staged devem ser interpretadas sem duplicar achados ou atribuir mudanças do usuário ao ticket. Como `git diff` não inclui arquivos untracked, listá-los com `git status --short --untracked-files=all` e ler os que pertencem à entrega.

A revisão deve produzir duas conclusões: **Padrões** e **Spec**, com evidências concretas e lacunas. Quando houver commits e referência válida, a skill `code-review` pode seguir seu fluxo canônico. Em trabalho sem commit, usar os mesmos dois eixos com o diff efetivo; registrar a adaptação e não afirmar que a receita `<base>...HEAD` examinou arquivos que não alcança. Correção de achados usa a reprodução/teste pertinente; achado de estilo já coberto por lint não exige outra camada de verificação manual.

**Delegação:** manter o agente principal responsável pelo ticket. Usar subagentes somente quando solicitados pelo usuário ou pelas instruções da skill efetivamente aplicável. Bons recortes são revisão somente de leitura e investigação factual independente. Informar objetivo, referências, base/diff, arquivos permitidos e resultado esperado. Evitar escritores simultâneos em migrações, `repositories.ts`, tipos gerados, Dashboard ou Salas; isolamento em worktree não elimina conflito semântico. Integração e validação continuam sequenciais. Nesta preparação não foi criado subagente, worktree ou branch.

### 3.4 Interfaces propostas para os testes de comportamento

Estes são os **pontos de teste a confirmar com o guia**; nomes finais dos comandos e tipos serão detalhados na sessão 00 sem mudar suas responsabilidades. Cada teste chama a interface usada pelo chamador autorizado e confere resultado observável. Helpers privados, quantidade de chamadas internas e estrutura de tabelas não são substitutos desse contrato.

| Ponto de teste / interface | O que comprova | Limite da evidência |
| --- | --- | --- |
| Aprendizagem: comandos de início/envio/finalização/retomada e leitura autorizada do resultado/resumo | Snapshot, primeiro envio/ordinal, conclusão, crédito/reenvio, erro/rollback e isolamento de contexto | Mock React não comprova transação; usar Postgres real com sessões/papéis e conexões concorrentes |
| Missões: leitura individual/histórico e comandos editoriais; progresso desencadeado por aprendizagem real | Atribuição automática, metas/janelas, contribuição distinta, recompensa única, rascunho/cota/cancelamento | Não invocar avaliador interno isolado nem preencher progresso manual para “provar” a conquista |
| Classificação/ligas: leitura de lista/meu resumo/regras e comandos autorizados do processamento semanal | PAC/eficiência/cobertura, audiência/paginação, fotografia, grupo, zero/empates e movimentos | Ordenação simulada no cliente ou relógio do navegador não prova regras SQL/virada |
| Segurança, reconciliação e migração: acessos reais aos comandos/projeções, tentativas de escrita proibida e entrada administrativa de auditoria/ensaio | Negação por papel/contexto, saldo reconciliável, reaplicação, corte/recuperação e retenção | Permissão de conexão privilegiada não prova autorização de aluno; consultas de auditoria ficam explícitas, não são atalho para testar helpers privados |
| React e navegação: módulos públicos consumidos pelas páginas e rotas reais | Estados, ação/contexto correto, identidade, teclado/foco e atualização após confirmação | Testes com HTTP controlado validam apresentação; separar E2E funcional contra ambiente isolado e M01–M09 |

Verificações de privilégios, DDL e reconciliação podem inspecionar persistência no harness administrativo isolado, pois esse é o contrato sob teste; não criar endpoints públicos só para observar detalhes internos.

Usar as saídas independentes já definidas: `4+2+1=7` vitalícios/`4` competitivos, `base 4/n=3 → 1,3333`, zero cai até Bronze e exemplos de PAC/cobertura. Fixar dados, semente e calendário no ambiente de teste, sem expor comando de “definir horário/pontuação” ao cliente de produção. Teste vermelho deve falhar pela regra que falta, e não por import quebrado, credencial ausente ou banco errado.

### 3.5 Como decompor as sessões em tickets executáveis

A tabela abaixo prepara a ordem **dentro** dos marcos, sem criar tickets ou reservar números de issue. Depois da confirmação, `to-tickets` transforma cada comportamento suficientemente pequeno em arquivo próprio com bloqueadores reais. Não confundir uma linha desta tabela com obrigação de caber inteira em uma única janela de contexto.

| Sessão | Primeira entrega verificável e evolução dentro do marco | Dependência/condição adicional |
| --- | --- | --- |
| 00 | Spec derivada do guia, contratos/pontos de teste e critérios; decomposição do primeiro marco e dos seguintes por comportamento, com rastreabilidade Q | Confirmar plano/escopo e conferir issues reais; manter designações operacionais adiadas |
| 01 | Bootstrap isolado + harness capaz de executar um caso de sanidade com papel de aluno e propagar falha; depois fixtures, concorrência e integração na CI | Ambiente de teste identificado; não gerar toda a suíte futura antes de implementar comportamentos |
| 02 | Finalizar/reconsultar uma aula individual sem crédito duplicado; ampliar ordinal/decimais/abandono, sala concreta/vazia, snapshot/publicação e escritas protegidas | Cada fatia liga SQL/contrato/tipos/consumidor necessário; abertura/compatibilidade ensaiadas antes de ativar créditos |
| 03 | Produzir e exibir o mesmo PAC oficial em um consumidor; atualizar demais consumidores e privacidade dos dados retornados no mesmo marco | Tipos/autoridade da 02 e última execução completa; nenhuma alternativa ativa expõe dados restritos |
| 04A | Abrir um grupo controlado, registrar score e fechar uma vez; ampliar afinidade, entrada tardia, zeros/empates, espera de categoria e incidentes | Usar desde a primeira fatia a inscrição automática/zero aceita, sem introduzir regra temporária de primeiro crédito |
| 04 | Próprio grupo e resumo pessoal em Ligas com dados oficiais; depois paginação/empates/histórico/estados e atualização | Núcleo 04A e audiência 03; sem consulta global de mil linhas para filtrar no navegador |
| 05 | Um objetivo completo automático avança e bonifica uma vez por atividade real; ampliar objetivos, períodos/variantes, escopos e cotas | Mesmo livro da 02, transação principal preservada; não ligar dois mecanismos de pagamento |
| 06 | Lista/detalhe de Missões e uma conquista confirmada; integrar navegação/TopDown/histórico e globais sem curso | 04/05; não exigir visita ou resgate para progresso |
| 07 | Uma diária automática e ranking de amigos no curso correto; ampliar matrículas/versões/estados e todos os consumidores | 06 e contratos oficiais, sem repetir soma local de tentativas |
| 08 | Educador vincula privado próprio, publica missão e aluno estuda pela sala sem matrícula individual; ampliar público alheio/versão/editor/privacidade/cotas | Integrações anteriores; isolamento/autorizações exercitados com mais de uma sala |
| 09 | Conquista gera intenção e entrega interna deduplicada; integrar expiração/cache e ciclo de conta em tickets separados | Retenção/estado devem preservar regras de crédito/grupo já implementadas |
| 10 | Executar T01–T05 e M01–M09 no piloto, ensaio de corte/recuperação/carga e evidências; corrigir achados por comportamento | Integração completa; responsáveis/atendimento/SLAs e configuração real resolvidos antes de implantação/liberação |

Modelo de ticket futuro: título com comportamento; origem na spec/IDs Q; “o que entregar”; critérios observáveis; “bloqueado por”; ponto de teste; restrições de migração/compatibilidade; evidência para fechar. Caminhos técnicos ficam no mapeamento deste guia/registro, evitando duplicar catálogos em cada ticket. Se um ticket se torna grande demais, dividi-lo antes de ampliar a alteração.

Para mudança transversal incompatível, usar **expandir → migrar consumidores → retirar compatibilidade** em entregas pequenas verificáveis. A compatibilidade de leitura/assinatura não autoriza duas autoridades de crédito: comandos antigos devem alcançar o mesmo controle de unicidade. A entrega dependente só parte da sprint após integração/revisão da anterior, conforme convenções.

### 3.6 Contexto, retomada e economia de execução

Carregar as fontes por necessidade. O agente precisa do cabeçalho/estado deste guia, da seção 3, da sessão corrente, do registro efetivo e dos critérios daquele ticket; detalhes de produto vêm dos trechos indicados abaixo. Consultar o arquivo de respostas por ID apenas para rastrear uma decisão/ressalva, sem reler seus 143 blocos a cada ciclo.

| Trabalho corrente | Contexto mínimo adicional |
| --- | --- |
| 00 | Seções 1.2–1.3, 2 e 10; glossário/ADRs pertinentes e docs do tracker |
| 01–02 | Seções 2.2–2.4 e 5.1–5.2; referências de banco/testes; últimas definições SQL e chamadores, não apenas migração histórica |
| 03, 04 e 07 | Seções 2.4, 2.6 e 2.8; consumidores de PAC/lista/resumo e critérios T01/M03/M05 |
| 04A | Seção 2.7, estados da conta em 5.3 e T03/M06; calendário, agrupamento e concorrência reais |
| 05, 06 e 08 | Seções 2.3, 2.5–2.6 e 2.8; T01/T02/T04, publicação/vínculo/versão e acesso privado |
| 09–10 | Seção 5 e critérios aplicáveis da 6, incluindo T05/M08/M09; configuração efetiva de Auth/Storage/jobs/backups |

Fazer buscas com `rg` e leituras independentes em lote; seguir dependências sequencialmente. Reutilizar fixtures/ambiente por suíte quando seguro, mantendo isolamento de dados/conexões. Rodar teste focal/tipagem no ciclo e o pipeline exigido no fechamento da entrega após mudanças finais. Repetir/ampliar verificações quando alterações, falhas ou risco ainda não resolvido justificarem; não repetir a mesma suíte aprovada sem mudança relevante.

Antes de encerrar ou reduzir contexto, atualizar o registro da seção 7: ticket/branch/base, fatos concluídos, teste/comando e resultado, diff próprio ainda sem commit, esquema/ambiente, bloqueio se existir e **próxima ação concreta**. Na retomada, conferir isso com arquivos/status reais. O guia é a referência de processo; spec e ticket aprovados serão o contexto compacto de execução, sem substituir as respostas literais. Mudança de contexto não deve ocorrer no meio de transação/migração ou comando cuja conclusão ainda não foi conhecida.

### 3.7 Preparação factual e instrução para começar depois

Conferência somente por leitura nesta preparação, sem instalar, inicializar serviços, conectar a banco ou executar testes:

| Item | Estado observado / próxima ação |
| --- | --- |
| Planejamento e tracker | Quatro documentos de gamificação continuam untracked; referências de tracker/labels/domínio existem. Spec/tickets de `.scratch/gamificacao` e pasta ADR ainda não existem; sua criação pertence à sessão 00 autorizada |
| Ferramentas locais | Git, Node e npm localizados no PATH. `node_modules` e binários locais de Supabase/Playwright/tsx presentes; existência não comprova versão compatível, navegador instalado ou serviço operacional |
| Banco isolado | Sem `supabase/config.toml`; bootstrap completo ainda não validado. Docker/psql/Supabase global não localizados no PATH nesta sessão; isso não comprova ausência de instalação fora dele ou de alternativa de ensaio |
| Validações | Scripts/pipeline/CI existentes lidos; harness SQL novo ainda não existe. Hooks atuais usam lint-staged; não reconstruí-los por skill genérica |
| Setup | README da aplicação ainda contém o template React/Vite e não resolve o bootstrap SQL. Sessão 01 deve documentar o procedimento realmente validado |
| Provisionamento e operações | Ambiente isolado, versão/esquema/roles e executor de jobs precisam ser demonstrados na implementação. Nomes/contatos/atendimento/SLAs continuam tarefas pré-liberação já adiadas |

**Preparação documental pronta não significa ambiente executável pronto.** Após autorização, iniciar pela sessão 00: conferir issue/sprint e fontes, produzir a especificação/tickets que este guia já delimita e validar o primeiro marco. O plano funcional permanece o das dez rodadas; não é necessário reiniciar a descoberta de produto.

Pedido sugerido para iniciar futuramente, caso corresponda à decisão do usuário:

```text
Confirmo o guia, inclusive o fluxo, a divisão por entregas e os pontos de teste.
Inicie pela sessão 00 e depois prepare a sessão 01 conforme as dependências.
Confira a sprint e a issue reais, preserve alterações locais e registre o trabalho no guia.
Pode criar os artefatos locais previstos e preparar código/testes do escopo autorizado.
Para aplicar SQL de ensaio, identifique primeiro um ambiente descartável e isolado.
Mantenha migrações compartilhadas, commits, push e implantação fora do escopo.
Se faltar um dado indispensável que não possa ser verificado, apresente o ponto concreto.
```

Esse texto é **modelo para uma instrução futura**, não autorização presumida por estar escrito aqui. A restrição atual permanece: somente editar este guia. Depois, a própria instrução de início pode ajustar os limites; autorização já dada deve ser aproveitada sem repetir perguntas rotineiras, respeitando as condições do projeto.


## 4. Sessões de desenvolvimento previstas

### Sessão 00 — consolidar regras e escopo

**Estado:** parcialmente realizada em 30/10/2026: aprovação recebida, spec/contratos/tickets iniciais, glossário e ADR preparados; vínculo operacional e decomposição dos marcos seguintes ainda pendentes. **Branch real:** `issue/42-define-gamificacao`. **Commits:** não realizados.  
**Páginas alteradas:** nenhuma; decisões e documentação apenas.

| Área | Arquivos previstos | Operação | Mudança prevista |
| --- | --- | --- | --- |
| Plano | `docs/planejamento-gamificacao/guia-desenvolvimento-missoes-ligas-e-pac.md` | Alterar | Registrar confirmação e ressalvas, mantendo respostas literais na fonte; preencher IDs reais e escopo executivo |
| Requisitos | `.scratch/gamificacao/spec.md` e `.scratch/gamificacao/issues/<NN>-<slug>.md` | Novos | Registrar contratos e critérios; um ticket por arquivo, respeitando o tracker local |
| Vocabulário | `GLOSSARY.md` | Alterar após aprovação | Definir missão/ocorrência/atribuição/concessão, execução completa, PAC, liga e crédito; atualizar Sala/XP global conforme decisões futuras, sem misturar implementação ao glossário |
| Decisões | `docs/adr/<NNNN>-gamificacao-transacional.md` | Novo se a decisão for confirmada | Registrar alternativas reais e motivo da escolha transacional e da política de contexto |

**Saída verificável:** entendimento consolidado confirmado explicitamente, ressalvas resolvidas e critérios rastreáveis aos 143 IDs. Não reabrir perguntas encerradas para cobrar nomes adiados; manter pendências operacionais da seção 8 antes de implantação/liberação. Detalhar contratos/DDL, spec/tickets locais vinculados às histórias reais, sem inventar números. Confirmar sprint pertinente, que pode não ser `sprint04`. Esta revisão não cria esses arquivos nem encerra a sessão como implementação.

### Sessão 01 — preparar validação de banco isolado

**Estado:** tickets locais 01–03 implementados e validados localmente; job SQL configurado, execução remota/revisão humana/integração pendentes. **Branch real:** `issue/42-testes-banco-gamificacao`. **Commits:** não realizados.  
**Páginas alteradas:** nenhuma; infraestrutura de teste da aprendizagem, missões e classificação.

| Área | Arquivos previstos | Operação | Mudança prevista |
| --- | --- | --- | --- |
| Runner | `codigo-base/scripts/run-db-tests.ts` | Novo | Usar `pg`/`tsx` existentes; ambiente de teste explícito, falha com código de saída e transações/conexões independentes |
| Casos SQL | `codigo-base/tests/db/fixtures.sql`, `permissions.sql`, `learning.sql`, `missions.sql`, `rankings.sql`, `concurrency.ts` | Novos, incrementais | Contas/estados, versões, cursos público/privado e duas salas do mesmo curso; papéis, dados retornados, idempotência e concorrência real. Ampliar com seasons/social-groups/notifications/account-lifecycle/legacy/reconciliation por sessão |
| Comandos | `codigo-base/package.json` | Alterar | Adicionar comando não interativo específico para o novo harness, sem apresentar o runner legado como validação atual |
| Setup | `codigo-base/README.md`, `docs/testes.md` | Alterar | Documentar bootstrap isolado do esquema numerado, Auth de teste, parâmetros, limpeza e limitações |
| Automação | `.github/workflows/ci.yml` | Alterar quando o bootstrap estiver reproduzível | Acrescentar job isolado de banco, sem conexão com produção nem dependência de segredo de desenvolvedor |

**Saída verificável:** o esquema atual é instalado de maneira reproduzível, excluindo `v1_schema.sql`/`v2_schema.sql`; casos distinguem comportamento atual de requisitos futuros ainda não satisfeitos. O harness não assume que existe `supabase/config.toml`; se for necessário criá-lo, registrar isso nesta sessão antes de adotá-lo. Nenhum teste modifica um banco não identificado como ambiente isolado.

### Sessão 02 — estabilizar aprendizagem e criar o livro único de créditos

**Estado:** parcial: 04.1–04.3 integradas, desenvolvimento pausado, sem declarar o núcleo completo. **Branch prevista:** `issue/<ID>-nucleo-aprendizagem-xp`. **Última branch funcional:** `issue/42-primeiro-envio`; preparação documental em `issue/42-retomada-kiro`, registro efetivo na seção 7.
**Páginas afetadas:** Dashboard/Salas na aula e Criar Curso nos contratos de publicação/versionamento; Perfil e Configurações devem continuar editando apenas dados permitidos. Sem redesenho visual nesta sessão.

| Página/área | Arquivos previstos | Operação | Mudança prevista |
| --- | --- | --- | --- |
| Versão avaliável | Nova migração de versões/snapshots em `codigo-base/supabase/migrations/`, associada aos resultados | Novo | Congelar questões/configuração e versões publicadas completas; preservar identidade semântica/ordinal/crédito, sem repagar edição textual; uso individual/adotado na sala conforme Q142 |
| Banco compartilhado | `codigo-base/supabase/migrations/<N>_learning_results_and_xp_credits.sql` | Novo | Contexto concreto, primeiros envios, ordinal histórico, resultado imutável, conclusão por sala e crédito único proporcional com quatro casas; adaptar nível aos limiares inferiores preservados; ajustes administrativos auditados, sem apagar origem ou tornar saldo negativo |
| Autorização | `codigo-base/supabase/migrations/<N>_learning_write_permissions.sql` | Novo | Proteger XP/nível/contadores; validar sessão e contexto/participação; impedir escrita no resultado final; validar estado ativo, autoria e prévia/teste sem base/bônus/amostra; estudo legítimo de conteúdo alheio permitido |
| Execução em Dashboard/Salas | `codigo-base/src/components/lesson/LessonModal.tsx` | Alterar | Início/envio/finalização autorizados; retomada na mesma versão sem apagar primeiros envios, sem expiração automática por tempo; incompleta não altera PAC; reenvio recupera resultado e feedback não concede crédito |
| Publicação/autoria | `codigo-base/src/pages/criar-curso/CriarCurso.tsx`, `codigo-base/src/data/repositories.ts`; comandos SQL de publicação | Alterar/novo SQL | Adaptar criação/publicação hoje feita em várias escritas para registrar versão completa e estável, preservando autoria/publicação; alterações autorizadas não modificam snapshots iniciados nem renovam identidade por texto |
| Acesso compartilhado | `codigo-base/src/data/repositories.ts`; `codigo-base/src/pages/CrudConsole.tsx` se consumir comandos substituídos | Alterar conforme consumidores | Trocar inserts amplos por comandos/colunas permitidas, sem contadores oficiais do cliente ou atalho legado de pagamento; preservar operações legítimas |
| Tipos | `codigo-base/src/types/database.ts` | Gerar | Regenerar do esquema de teste aplicado, registrando alvo e comando |
| Regressão de edição | `codigo-base/tests/db/permissions.sql`, `learning.sql`, `concurrency.ts`; testes de Perfil/Configurações | Criar/alterar testes | Confirmar que fechamento de privilégios não quebra edição legítima de nome/avatar/preferências |

**Saída verificável:** duas finalizações da mesma tentativa devolvem os mesmos resultados; tentativas concorrentes não duplicam crédito; resultados e saldo são reconciliáveis. A mesma questão permite um crédito individual e um em cada sala autorizada, sem repetições no mesmo contexto. Primeiro envio persiste antes do feedback; erro abandonado não reinicia ordinal e prévia/teste não pontua. Conclusão sem questões tem zero XP base também na sala, sem matrícula individual. Rejeitar sessão ausente/estado bloqueado/contexto inventado. Validar fronteiras decimais de nível, como 99,9999/100 e 249,9999/250. Ajuste com motivo preserva o crédito original, informa correção relevante e eventual redução de nível; não é movimento de temporada. Só administrador autorizado ajusta.

**Compatibilidade e legado:** preparar uma abertura auditada para os saldos existentes e executar ensaio em banco de teste. Manter chamadas antigas que a aplicação ainda utiliza por adaptadores compatíveis quando necessário; mudança de contrato e fechamento de privilégios entram juntos. Não reaplicar saldo legado ao reenviar conclusão. Migrações antigas `0010`, `0018` e `0022` são referências, não arquivos a reescrever.

### Sessão 03 — unificar métricas, conclusões e privacidade do PAC

**Estado:** planejada. **Branch prevista:** `issue/<ID>-metricas-contexto-pac`. **Branch real/commits:** não iniciados.  
**Páginas afetadas:** Salas, Dashboard, detalhe do Catálogo e painel TopDown.

| Página/área | Arquivos previstos | Operação | Mudança prevista |
| --- | --- | --- | --- |
| Métricas SQL | `codigo-base/supabase/migrations/<N>_context_metrics_and_pac.sql` | Novo | Última amostra completa por aula/versão/contexto; PAC binário C/N, cobertura, mínimo competitivo e eficiência separada; retomada/incompleta não altera amostra; histórico e adoção de versão conforme Q142 |
| Privacidade SQL | `codigo-base/supabase/migrations/<N>_room_metrics_visibility.sql` | Novo | Leituras autorizadas que protegem PAC/eficiência/cobertura, acertos/total, progresso, posição/ordem/empates de colegas em educator_only; retirar acesso direto incompatível, eliminar public e mapear legado para members auditado |
| Interface de métricas | `codigo-base/src/features/classificacao/index.ts`, `types.ts`, `supabase-adapter.ts` | Novos | Contexto, audiência, métrica, versão e visibilidade; estados sem amostra/provisório/oculto/carregando/erro; sem faixa/emblema acadêmico conforme Q062 e sem cálculo oficial nas páginas |
| Salas | `codigo-base/src/pages/Salas.tsx` | Alterar | Consumir projeção autorizada; remover faixas/emblemas de PAC em todos os modos e indicadores/derivados de colegas quando restritos; usar conclusão da sala correta |
| Dashboard | `codigo-base/src/pages/Dashboard.tsx` | Alterar | Deixar de inferir conclusão de sala pela última referência genérica em `completions`; usar conclusão por contexto |
| Catálogo/detalhe | `codigo-base/src/pages/Catalogo.tsx` | Alterar | Substituir soma local de todas as tentativas pelo resumo acadêmico oficial; mostrar amostra/cobertura e política |
| TopDown | `codigo-base/src/components/sidebar/top-down-dados.ts`, `SidebarRight.tsx` | Alterar | Consistência de PAC por curso, ausência de avaliação e falhas; não converter tudo em zero |
| Acesso e tipos | `codigo-base/src/data/repositories.ts`, `codigo-base/src/types/database.ts` | Alterar/gerar | Redirecionar consumidores e regenerar contratos do esquema |
| Testes | `codigo-base/tests/db/rankings.sql`, `permissions.sql`, `learning.sql`; `codigo-base/tests/e2e/dashboard.spec.ts` | Alterar | Limites decimais, duas salas com mesma aula, rede sem PAC oculto e progresso coerente |

**Saída verificável:** mesmo contexto/versão produz PAC/progresso coerentes; todas as questões têm peso igual e parcial não vira fração de acerto. Retomada não zera ordinal nem muda PAC antes da conclusão. Sem amostra/erro/ocultação não viram zero; PAC não bloqueia a trilha. `educator_only` não expõe derivados por rede/emblema/ordem. Sem faixas/emblemas de PAC: Q062 encerrou a ressalva. Em educator_only, nem progresso/ordem/contagem de empates dos colegas chega ao aluno; members não concede acesso externo. Histórico legado tem rótulo quando faltar versão confiável. Adaptar todos os consumidores afetados nesta sessão.

### Sessão 04A — implementar temporadas globais por XP

**Estado:** planejada. **Branch prevista:** `issue/<ID>-temporadas-globais`. **Branch real/commits:** não iniciados.  
**Páginas afetadas:** preparar dados para Ligas/Perfil; UI na sessão 04. Regras: Q105/Q138–Q143 e Q070/Q085.

| Página/área | Arquivos previstos | Operação | Mudança prevista |
| --- | --- | --- | --- |
| Modelo | `codigo-base/supabase/migrations/<N>_global_league_seasons.sql` | Novo | Semana São Paulo, sete categorias/Bronze inicial, inscrições/grupos/resultados únicos, fotografia de recência e regras versionadas; score por créditos individuais elegíveis |
| Abertura/fechamento | Nova migração de funções; `codigo-base/supabase/functions/close-league-season/index.ts` se esse executor for adotado | Novo; verificar/provisionar executor/agendamento no ambiente existente | Varredura 5 minutos; fechar anterior/persistir categorias/formar lote sem visita ou XP; alvo 5 minutos, alerta 30; idempotência e resultado integral/apuração. Elegibilidade fixada na virada, créditos da nova janela associados uma vez após grupo definitivo |
| Formação | Funções SQL dedicadas; `codigo-base/tests/db/social-groups.sql` | Novos | Conclusão nos sete dias anteriores, inclusive sala/revisão/vazia primeira vez; afinidade até dois graus/pesos 2–1/seed, alvo 20/teto 30; balancear antes de publicar, depois estável. Entrada tardia por primeira atividade oficial sem XP mínimo |
| Cortes/movimentos | Funções SQL de resultado na migração de temporadas | Novo | Cortes/empates dos positivos e queda obrigatória de todo zero até Bronze, incluindo pequeno/solo/tardio/totalmente zerado; uma queda no máximo. Sem abandono, prêmio ou categoria provisória |
| Leitura/tipos | `codigo-base/src/features/classificacao/types.ts`, `supabase-adapter.ts`; `codigo-base/src/types/database.ts` | Alterar/gerar | Separar nível vitalício, XP/posição semanal e estados não elegível/formação/em disputa/apuração; reativação preserva atribuição/categoria |
| Verificações | `codigo-base/tests/db/seasons.sql`, `social-groups.sql`, `concurrency.ts` | Novo/alterar | Fotografias/viradas, entrada tardia zero, abertura/fechamento concorrentes, nova atividade em espera; grupos 0/1/8/10/20/30, população 45, empates positivos e zeros; extremos, desativação/suspensão/linha sem identidade e ausência de prêmio |

**Saída verificável:** recentes inscritos sem visita/primeiro crédito; retornos entram pela atividade oficial sem escolher grupo. Sem abandono/troca por amizade. Base interna, bônus, abertura/ajuste histórico, autoria própria e repetição creditada não pontuam. Todo zero válido cai uma vez até Bronze; positivos conservam proteções/empates. Incidente mantém apuração, sem presumir zero. Atividade nova não se perde nem bloqueia só por espera de categoria; resultado/movimento não duplica.

Designações/atendimento continuam adiados, mas executor, permissões, monitoramento e recuperação precisam ser comprovados antes de implantação/liberação. Exclusão definitiva não restaura identidade/dados pessoais ao reprocessar a linha técnica.

### Sessão 04 — concluir interfaces de ligas e classificação por contexto

**Estado:** planejada. **Branch prevista:** `issue/<ID>-classificacao-ligas`. **Branch real/commits:** não iniciados.  
**Páginas afetadas:** Ligas e resumo de ranking no TopDown; preparar consultas usadas depois em curso e sala.

| Página/área | Arquivos previstos | Operação | Mudança prevista |
| --- | --- | --- | --- |
| Consultas SQL | `codigo-base/supabase/migrations/<N>_ranking_queries_and_league_rules.sql` | Novo | Global por XP da temporada; curso usuário/amigos por PAC; sala alunos por PAC; elegibilidade, empates, paginação e resumo pessoal independente |
| Módulo de leitura | `codigo-base/src/features/classificacao/index.ts`, `types.ts`, `supabase-adapter.ts`, `use-classificacao.ts` | Alterar/criar | Expor lista, regras e meu resumo; permitir apenas contexto/métrica/audiência válidos |
| Ligas | `codigo-base/src/pages/Ligas.tsx`, `Ligas.css` | Alterar | Remover ranking vitalício/agrupamento por nível; grupo automático, zero XP legítimo, promoção/queda/histórico do próprio grupo, estados de elegibilidade/formação/apuração e queda de zero até Bronze. Sem navegar por competidores alheios, abandono ou prêmio; foto/display name/banner padrão |
| Pódio | `codigo-base/src/components/ranking/RankingPodium.tsx` | Alterar | Posições compartilhadas, até cinco entradas e quantidade adicional empatada com lista autorizada completa; foto/nome e banner em cartão/detalhe. Emblema somente de liga, nenhum selo PAC |
| TopDown | `codigo-base/src/components/sidebar/top-down-dados.ts`, `SidebarRight.tsx` | Alterar | Consumir ranking de amigos por curso pela mesma política de audiência e ordenar pelo resultado oficial |
| Compatibilidade | `codigo-base/src/data/repositories.ts`, `codigo-base/src/types/database.ts` | Alterar/gerar | Adaptar ou retirar consultas substituídas, após verificar consumidores |
| Testes | `codigo-base/tests/db/rankings.sql`; `codigo-base/tests/e2e/ligas.spec.ts` | Alterar/novo | Mais de mil usuários, filtros, limites de XP, empate, ausência de amostra e usuário fora da primeira página |

**Saída verificável:** resumo pessoal independente do Top N, posição/grupo/categoria reais e lista paginada autorizada mesmo em base com mais de mil contas. Sem competidores de outros grupos/ligas; regras estáticas podem ser exibidas. Pódio, lista e resumo concordam. A rota `/ligas` usa temporada explicitamente, revalida a cada 60 segundos enquanto visível e distingue espera/falha/obsolescência de zero; progressão vitalícia separada.

### Sessão 05 — implementar o mecanismo compartilhado de missões

**Estado:** planejada. **Branch prevista:** `issue/<ID>-nucleo-missoes`. **Branch real/commits:** não iniciados.  
**Páginas alteradas diretamente:** nenhuma nova; preservar a leitura do TopDown por compatibilidade até a sessão 06. Aprendizagem em Dashboard/Salas passa a emitir fatos para o mecanismo.

| Página/área | Arquivos previstos | Operação | Mudança prevista |
| --- | --- | --- | --- |
| Estrutura SQL | `codigo-base/supabase/migrations/<N>_mission_definitions_and_occurrences.sql` | Novo | Definições/versionamento, ocorrências, atribuições, objetivos, contribuições e concessões |
| Avaliação SQL | `codigo-base/supabase/migrations/<N>_mission_processing_and_rewards.sql` | Novo | Elegibilidade/janelas, deduplicação, conclusão e crédito único; tabela Q045 e política de oportunidades Q135; nenhuma barreira oculta ao pagar missão já prometida |
| Integração da origem | Nova migração de integração às funções de aprendizagem | Novo | Consumir resultados imutáveis por evento interno; completar missões somente com fatos autorizados, na mesma transação |
| Módulo React | `codigo-base/src/features/missoes/index.ts`, `types.ts`, `supabase-adapter.ts` | Novos | Leituras e comandos de publicação restritos; cliente não escreve progresso ou recompensa |
| Acesso legado | `codigo-base/src/data/repositories.ts` | Alterar | Desativar escrita manual de progresso antigo quando houver transição; manter leitura legada explicitamente identificada |
| Tipos | `codigo-base/src/types/database.ts` | Gerar | Consumir o novo esquema sem edição manual |
| Casos de banco | `codigo-base/tests/db/missions.sql`, `concurrency.ts`, `permissions.sql` | Alterar | Reenvio, metas/variantes aceitas, dias desde a elegibilidade, cotas concorrentes de publicação, cancelamento sem devolver cota, pagamento posterior à semana de publicação e concessão única |

**Saída verificável:** sem abrir Missões, atividade materializa atribuições elegíveis, avança metas Q136 e concede uma recompensa por atribuição. Curso/sala avançam globais e revisão completa conta conforme objetivo; reenvio não contribui novamente. Variantes são fixadas antes da atribuição, não por atraso de visita, e indisponibilidade não gera penalidade. Contextos preservados e bônus não realimenta missão; cotas Q135 validadas antes de prometer prêmio.

**Regras essenciais:** servidor calcula período e fixa meta/variante antes de atribuir. Q135 limita sala a cinco publicações/semana, inclusive agendadas, e cinco vigências simultâneas; rascunho não consome, cancelamento/arquivo não devolvem cota. Q136 já define metas/alternativas, sem tarefa impossível silenciosa. Ingresso tardio não recebe contribuição passada; reingresso não recria bônus. Publicação fixa objetivo, meta, conteúdo, janela e recompensa; nova regra exige publicação futura. Cancelamento tem motivo, interrompe contribuições e preserva concessões; arquivo mantém histórico. Pagamento prometido não é bloqueado por cota futura e legado manual não vira bônus retroativo. Validar publicação/atribuição atomicamente, inclusive em concorrência.

### Sessão 06 — apresentar missões globais e área central

**Estado:** planejada. **Branch prevista:** `issue/<ID>-missoes-globais`. **Branch real/commits:** não iniciados.  
**Páginas afetadas:** nova Missões, Dashboard e navegação compartilhada.

| Página/área | Arquivos previstos | Operação | Mudança prevista |
| --- | --- | --- | --- |
| Missões | `codigo-base/src/pages/Missoes.tsx`, `Missoes.css` | Novos | Diárias/semanais globais, filtros de contexto, detalhe, estado de recompensa e histórico paginado |
| Apresentação compartilhada | `codigo-base/src/features/missoes/MissaoCard.tsx`, `ListaMissoes.tsx`, `use-missoes.ts` | Novos | Cartão e leitura reutilizáveis, unidade/meta, contexto, prazo, estados de erro/vazio/concluída |
| Rotas | `codigo-base/src/Hub.tsx` | Alterar | Rota protegida `/missoes` e detalhe por identificador autorizado |
| Navegação | `codigo-base/src/components/sidebar/SidebarLeft.tsx` | Alterar | Entrada de Missões junto de Ligas, preservando ordem dos demais itens e navegação móvel recolhível acessível |
| Dashboard/TopDown | `codigo-base/src/pages/Dashboard.tsx`; `codigo-base/src/components/sidebar/SidebarRight.tsx`, `top-down-dados.ts` | Alterar | Globais sem curso ativo; até três pendentes autorizadas por prazo/ID estável, contexto rotulado e link completo; concluídas/vencidas em áreas próprias |
| Catálogo operacional | Nova migração/semente de catálogo versionado, com nome definido na execução | Novo | Publicar catálogo Q136/valores Q045/cotas Q135 versionados: diárias 1 aula/3 acertos/3 execuções, semanais 10 execuções/3 dias e 1 diária por curso; variantes antes da atribuição, sem sorteio/painel completo/seed de demo |
| Testes | `codigo-base/tests/e2e/missoes.spec.ts`, `dashboard.spec.ts`; testes de componentes de missão | Novos/alterar | Sem curso, lista preenchida, janela diária/semanal, detalhe, conclusão e anúncio acessível de estado |

**Saída verificável:** usuário sem curso selecionado consulta globais; missões concluídas não escondem pendentes no resumo. Catálogo e histórico não se limitam aos três cartões. Detalhe com critério/meta, versão/conteúdo, progresso, prazo/fuso, bônus e ação autorizada; feedback discreto/base/bônus após confirmação, sem resgate/modal extra ou celebração duplicada.

### Sessão 07 — integrar missões, PAC e classificação dos cursos

**Estado:** planejada. **Branch prevista:** `issue/<ID>-missoes-ranking-cursos`. **Branch real/commits:** não iniciados.  
**Páginas afetadas:** Dashboard, Catálogo/detalhe do curso e Missões.

| Página/área | Arquivos previstos | Operação | Mudança prevista |
| --- | --- | --- | --- |
| Dashboard | `codigo-base/src/pages/Dashboard.tsx`, `Dashboard.css` | Alterar | Seção de diárias do curso e acesso à classificação; manter trilha, seleção de contexto e atualização após aula |
| Catálogo/detalhe | `codigo-base/src/pages/Catalogo.tsx`, `Catalogo.css` | Alterar | Mostrar PAC oficial, cobertura, progresso e acesso às missões/classificação do curso elegível |
| Classificação do curso | `codigo-base/src/features/classificacao/ClassificacaoCurso.tsx`, `ClassificacaoLista.tsx` | Novos | Lista do próprio usuário e amigos por PAC no mesmo curso, resumo pessoal e identificação de amostra/contexto; sem ranking geral de matriculados |
| Missões | `codigo-base/src/pages/Missoes.tsx`; `codigo-base/src/features/missoes/use-missoes.ts` | Alterar | Filtro de curso, matrícula e estado de conteúdo indisponível, sem confundir matrícula com participação em sala |
| Contratos e elegibilidade | Módulos `codigo-base/src/features/missoes/` e `codigo-base/src/features/classificacao/`; nova migração específica se necessária | Alterar | Sistema gera diária de concluir uma aula/1 XP por curso individual elegível, sem ação do criador nem subconjunto; revisão em concluído, sem nova diária no abandonado e sem atividade de sala como matrícula; última versão publicada/autorizada e PAC Q142; ranking com matrícula ativa/concluída, acesso/amostra individual e amizade Q063, sem abandonado/atividade só em sala |
| Testes | `codigo-base/tests/e2e/cursos-gamificacao.spec.ts`; `codigo-base/tests/db/missions.sql`, `rankings.sql` | Novo/alterar | Curso correto, privacidade, bônus separado da classificação acadêmica e transição de matrícula |

**Saída verificável:** estudar no curso A não altera PAC ou ranking do curso B; a mesma atividade pode avançar global e curso com concessões distintas e únicas. Entrada por uma sala não cria matrícula individual nem inclui o aluno em ranking privado do curso silenciosamente. Nenhuma tela mantém a antiga soma local de tentativas como fonte do mesmo PAC oficial.

### Sessão 08 — concluir missões personalizadas e classificação nas salas

**Estado:** planejada. **Branch prevista:** `issue/<ID>-missoes-ranking-salas`. **Branch real/commits:** não iniciados.  
**Páginas afetadas:** Salas e Missões; Dashboard quando executa contexto de sala.

| Página/área | Arquivos previstos | Operação | Mudança prevista |
| --- | --- | --- | --- |
| Sala/detalhe | `codigo-base/src/pages/Salas.tsx`, `Salas.css` | Alterar | Curso obrigatório/imutável, somente members/educator_only, sem public. Adoção explícita de versão do mesmo curso bloqueada por missão ativa dependente; missões/lista paginada/aluno-missão sem CSV/relatório extra |
| Editor de missão | `codigo-base/src/features/missoes/EditorMissaoSala.tsx` | Novo | Só responsável/admin: rascunho/prévia e avulsa para sala inteira, janela de 1 hora a 90 dias e XP 1–10; cinco publicações/semana e cinco vigências sobrepostas, agendada consome ao publicar; cancelamento/arquivo com motivo/histórico, sem devolver cota |
| Classificação da sala | `codigo-base/src/features/classificacao/ClassificacaoSala.tsx`; `ClassificacaoLista.tsx` | Novo/alterar | Alunos participantes por PAC, sempre excluindo responsável, mesmo que tenha vínculo de membro; em educator_only aluno só recebe próprios indicadores, sem PAC/eficiência/cobertura/progresso/posição/ordem/empates de colegas; responsável recebe acompanhamento autorizado |
| Comandos SQL | `codigo-base/supabase/migrations/<N>_room_missions_and_visibility.sql` e migração de autorização de conteúdo privado por sala | Novos conforme desenho aprovado | Acesso contextual ao privado sem matrícula/publicação; curso sem troca por chamada direta; papéis editoriais, versão da missão imutável, cotas/valores/duração e leitura autorizada; adoção explícita Q142 e mapear public legado para members sem ampliar audiência |
| Lista central | `codigo-base/src/pages/Missoes.tsx` | Alterar | Contexto de sala e detalhe da publicação/atribuição; diferenciar rascunho e missão disponível |
| Aula em sala | `codigo-base/src/pages/Dashboard.tsx`, `codigo-base/src/pages/Salas.tsx`, `codigo-base/src/components/lesson/LessonModal.tsx` | Alterar somente integração | Confirmar que o contexto concreto segue até a finalização e atualizar missões/métricas após retorno |
| Testes | `codigo-base/tests/e2e/salas-gamificacao.spec.ts`; `codigo-base/tests/db/permissions.sql`, `missions.sql`, `rankings.sql` | Novo/alterar | Outra sala, membro removido, educador fora do ranking, curso imutável mesmo sem missão ativa, rascunho, publicação concorrente, cotas/valores/vigência, cancelamento, privacidade e duas salas com mesmo curso |

**Saída verificável:** educador cria sala com curso privado próprio pronto/publicado ou público de outro autor, sem permissão extra de editar o original; o vínculo não pode ser trocado depois. Publica missão avulsa aprovada; aluno entra por código e estuda no contexto da sala sem matrícula individual. XP base/bônus da sala ficam internos; missão global pode gerar bônus vitalício, excluído da temporada. Responsável nunca concorre com participantes; em PAC restrito só ele recebe a ordenação. Remoção revoga acesso da sala sem destruir matrícula individual preexistente. Cancelamento/arquivo preservam histórico e créditos; recorrência, coeducação, subgrupos, scripts e tarefas externas ficam fora desta entrega.

### Sessão 09 — integrar notificações, atualização e ciclo de conta

**Estado:** planejada. **Branch prevista:** `issue/<ID>-integra-gamificacao`. **Branch real/commits:** não iniciados.  
**Páginas afetadas:** Notificações, Perfil, Configurações, Ligas, Dashboard, Salas, Missões e sidebars. Não criar preferência de pseudônimo.

| Página/área | Arquivos previstos | Operação | Mudança prevista |
| --- | --- | --- | --- |
| Notificações SQL | `codigo-base/supabase/migrations/<N>_gamification_notifications.sql`; executor no backend existente | Novo/provisionar conforme ambiente | Intenções duráveis de publicação/conquista/resultado definitivo; entrega 5 minutos/24h, publicação até min(24h,fim/cancelamento), recuperação conquista/resultado até 7 dias e falha para reconciliação |
| Caixa de entrada | `codigo-base/src/pages/Notificacoes.tsx`; `codigo-base/src/data/repositories.ts` | Alterar | Missão/atribuição/resultado específico; histórico próprio, acesso perdido e referência legada sem dar novo acesso |
| Conta/autorização | `codigo-base/src/pages/ConfigPage.tsx`; `codigo-base/src/data/repositories.ts`; `codigo-base/supabase/migrations/<N>_account_lifecycle_and_retention.sql` e operação privilegiada de Auth/Storage no backend se necessária | Alterar/novo | Distinguir desativação/exclusão/suspensão; validar estado no servidor, retirar identidade, preservar participação válida, eliminar/expurgar/retomar conforme seção 5.3; nenhum segredo no cliente |
| Perfil | `codigo-base/src/pages/profile/Profile.tsx` | Alterar | Saldo/nível vitalício separado da temporada; identidade padrão, sem campos calculados editáveis |
| Cache/perfil | `codigo-base/src/components/sidebar/SidebarLeft.tsx` | Alterar | Invalidar após crédito/estado de conta, manter assinantes e evitar consultas repetidas |
| Listas/resumos | `codigo-base/src/features/missoes/use-missoes.ts`, `codigo-base/src/features/classificacao/use-classificacao.ts`; consumidores Dashboard/Ligas/Salas/Missões | Alterar | Revalidar atividade/contexto/reabertura/foco, Ligas visível a cada 60s, referência/Atualizar e estado obsoleto; erro/espera não são zero |
| Testes | `codigo-base/tests/db/notifications.sql`, `account-lifecycle.sql`; `codigo-base/tests/e2e/gamificacao-integrada.spec.ts` | Novos | Entrega/reconciliação/expiração, retorno perdido/cache, tokens anteriores, desativação/reativação/exclusão/suspensão e expurgo sem repagar/restaurar dados eliminados |

**Saída verificável:** saldos/missões/temporada coerentes; falha de entrega não desfaz conquista, repete crédito ou reabre autorização perdida. Sem aviso por incremento/inscrição/renovação/colocação ou canal externo. Estados de conta explícitos, sem saída competitiva disfarçada ou reversão de exclusão definitiva.

Verificar Auth, Storage, autoria e retenção real do provedor no ensaio; soft-delete atual não atende sozinho à política. Entrega/exclusão/expurgo usam processamento autorizado/monitorado no backend existente, sem broker ou novo painel obrigatório. Nomes/SLAs humanos permanecem pendências pré-liberação.

### Sessão 10 — ensaiar migração, homologar e fechar o registro

**Estado:** planejada. **Branch prevista:** `issue/<ID>-valida-gamificacao`. **Branch real/commits:** não iniciados.  
**Páginas homologadas:** Missões, Ligas, Dashboard, Catálogo/detalhe, Salas, Criar Curso, Perfil, Configurações, Notificações e sidebars. Alterar arquivos funcionais nesta sessão somente para correções identificadas e registradas.

| Página/área | Arquivos previstos | Operação | Mudança prevista |
| --- | --- | --- | --- |
| Migração de dados | Migrações incrementais de abertura/mapeamento em `codigo-base/supabase/migrations/` | Novos/ajustes por nova migração | Abertura única preserva saldos/limiares; arquivar missões manuais sem prêmio, avaliações/ordinais incertos identificados e base bloqueada até revisão; arquivar salas sem curso, mapear public para members e retirar compatibilidade após ensaio |
| Ensaio e teste | `codigo-base/tests/db/legacy-migration.sql`, `reconciliation.sql`; suítes E2E anteriores | Novos/alterar | Ensaiar corte até 30 minutos/falha parcial/recuperação, saldos/conclusões/reaplicação; automatizar Q086/T01–T05 e verificar M01–M09 separadamente; restauração reaplica eliminações antes do acesso |
| Tipos | `codigo-base/src/types/database.ts` | Gerar se houver esquema adicional | Confirmar consistência final com o banco-alvo |
| Referências | `docs/banco-de-dados/documentacao-bd.md`, `docs/arquitetura.md`, `docs/testes.md`, `docs/README.md`, `codigo-base/README.md` | Alterar | Descrever o comportamento realmente entregue e a operação do esquema novo; corrigir caminhos antigos de Ranking |
| Demo | `docs/roteiro-demo-sprint04.md` ou novo roteiro da sprint vigente | Alterar/criar conforme sprint | Trocar progresso manual por percurso real; preservar histórico de roteiros antigos quando aplicável |
| Operação | Runbook de implantação/recuperação e checklist no tracker/documentação responsável; caminho definido na execução | Novo/alterar | Registrar responsáveis/contatos/atendimento/SLAs adiados; executor, monitoramento, Auth/Storage/backups, ordem frontend/SQL, interrupção/retomada |
| Registro | `docs/planejamento-gamificacao/guia-desenvolvimento-missoes-ligas-e-pac.md` | Alterar | Sessões efetivas, páginas/arquivos, branches/commits/PRs reais, validações/evidências/pendências |

**Saída verificável:** pipeline, SQL real isolado/carga Q086 e percursos integrados aprovados; M01–M09 com evidências/limitações, piloto isolado com ao menos um educador/três alunos e cursos público/privado. Reconciliação sem diferenças inexplicadas, recuperação demonstrada e papéis/contatos/atendimento/SLAs designados antes de implantação/liberação. Não fabricar precisão retroativa de PAC/créditos onde faltar evidência. Abertura de saldo não dispara missões nem soma XP novo de aprendizagem. PRs seguem a sprint pertinente e revisão humana das convenções.

**Aplicação em ambiente compartilhado:** o guia não executa nem autoriza implantação. Quando o desenvolvimento chegar a essa etapa, registrar ambiente, versão de esquema, ordem de aplicação, compatibilidade entre frontend/SQL e procedimento de recuperação. Voltar o frontend não pode apagar concessões nem refazer pagamento.


## 5. Legado, corte, recuperação e operação

### 5.1 Preservação e compatibilidade

Testar migrações/frontend desde cada sessão em banco isolado; sessão 10 reúne a homologação completa, não é a primeira execução de SQL. Inventariar esquema aplicado, privilégios, fontes legadas, propriedade de conteúdo, Auth/Storage e jobs antes de preparar o corte. Nunca usar banco não identificado como ensaio.

| Dado existente | Tratamento aceito Q081/Q082 | Evidência exigida |
| --- | --- | --- |
| XP global/interno e nível | Abertura auditada única por usuário/contexto/data de corte; preservar saldos e limiares | Reaplicação não duplica; abertura não emite atividade, missão ou XP competitivo; diferença explicada só por ajuste auditado |
| Resultados/tentativas antigos | Preservar como legado, reconstruindo somente o demonstrável | Não inventar primeira resposta, ordinal, snapshot ou eficiência a partir de resultado mutável |
| Questões legadas | Evidência confiável impede repagar base; item sem evidência suficiente não ganha nova base até revisão auditada | Estudo/missões elegíveis continuam permitidos; medição nova de esforço começa no corte, identificada sem presumir esforço passado |
| Missões/progresso manuais | Arquivar em leitura, preservar mapeamentos/referências | Sem bônus retroativo nem mistura de percentual manual com contagem automática |
| Conclusões de sala | Mapear por tentativa/contexto concreto quando comprovável; registrar ambiguidades | Sala A não perde/concede conclusão por atividade em B, mesmo com mesma aula |
| Sala antiga sem curso | Arquivar com histórico; eventual substituição é nova sala vinculada criada explicitamente | Não escolher curso, trocar vínculo, matricular ou transferir participantes automaticamente |
| Visibilidade antiga `public` | Mapear para `members` e registrar | Sem ampliar audiência; curso público não abre métricas de sala |
| Notificações antigas | Resolver por mapeamento ou indicar indisponibilidade | Sem abrir referência errada, conteúdo privado ou colegas após perda de acesso |
| Conteúdo alterado | Versões/snapshots e identidade semântica preservados | Aula modificada exige nova amostra corrente; crédito de item inalterado não renova |

Fechar escrita antiga na mesma etapa em que novos comandos assumem autoridade. Adaptadores temporários devem convergir à mesma unicidade, sem dois mecanismos independentes de crédito. Confirmar todos os consumidores, inclusive console técnico e chamadas diretas. Não reescrever migrações antigas; regenerar `codigo-base/src/types/database.ts` do esquema aplicado, registrando ambiente/comando.

### 5.2 Corte e recuperação aceitos Q083/Q084

Ensaiar cópia isolada e janela de **até 30 minutos com restrição de escrita**, mantendo leitura quando tecnicamente segura. Congelar conjunto de corte, registrar versões/IDs e comparar saldos, conclusões e permissões antes/depois. Retomar somente após reconciliação.

Interromper por diferença inexplicada de saldo/conclusão, crédito duplicado, violação de acesso, falha de integridade ou estouro da janela. Manter escrita suspensa; preservar concessões/evidências e restaurar/reconciliar em ambiente controlado, reaplicando somente fatos confirmados por identidades únicas. Retomada exige nenhuma diferença inexplicada e revisão humana. Voltar apenas o frontend enquanto comandos antigos continuam pagando é incompatível com o plano.

A implantação precisa de runbook revisável: esquema antes/depois, ordem SQL/frontend, compatibilidade, responsáveis/contatos, comando autorizado, monitoramento, critérios de interrupção, restauração e reconciliação. Reaplicar eliminações antes de devolver acesso após restauração. O guia não aplica nem autoriza uma migração compartilhada.

### 5.3 Estados da conta e política de dados

Desativação voluntária **depois da inscrição** oculta identidade corrente, preserva a linha competitiva/pontos e aplica movimentos normais, inclusive queda de zero. Reativação recupera a mesma atribuição ou categoria já fechada, sem reiniciar. Conta já desativada na fotografia de abertura não entra. Sair de sala/curso não remove inscrição da liga.

Desativação temporária não equivale a exclusão definitiva. A rotina atual limpa campos do perfil e não oferece por si só todo esse ciclo; a implementação deve distinguir os comandos/efeitos, conferir retomada e preservar apenas dados cuja retenção esteja autorizada. Exclusão definitiva não promete recuperar dados pessoais eliminados.

#### Política inicial escolhida por delegação Q085

Parâmetros de produto configuráveis escolhidos pelo agente conforme a delegação literal. Aplicam-se aos dados desta implementação e à integração de sua exclusão; não são prazos já existentes no ambiente. O comportamento real do provedor e as dependências de autoria devem ser conferidos no ensaio, sem assumir que limpar o perfil apaga todos os dados.

| Classe/situação | Política escolhida | Efeito verificável |
| --- | --- | --- |
| Histórico, resultados, contribuições, créditos e movimentos de conta existente, sem pedido de exclusão | Manter enquanto a conta existir, com acesso por finalidade/contexto. Desativação temporária não zera histórico nem concede crédito de novo | Retomada autorizada conserva saldo, atribuição e categoria; nenhuma retenção cria leitura de colegas após sair da sala |
| Solicitação confirmada de exclusão definitiva | Retirar identidade das projeções e bloquear novas contribuições imediatamente; concluir eliminação de dados pessoais nos sistemas ativos sob controle da aplicação em até 30 dias, incluindo conteúdo livre e arquivos pessoais | Não tratar exclusão como pausa reversível. Inscrição da semana conserva linha técnica sem identidade para fechar uma vez; não restaurar perfil, respostas pessoais ou matrícula ao reprocessar |
| Auditoria técnica após exclusão | Até 12 meses somente se os registros puderem ser conservados sem identificar a pessoa; retirar identificadores diretos, vínculos reversíveis e conteúdo livre. Se isso não puder ser demonstrado, eliminar os dados pessoais no prazo de 30 dias, mantendo apenas os agregados não identificáveis necessários | ID aleatório sozinho não comprova anonimização. A expiração de dados não pode ser usada para repetir pagamentos; separar a política de eliminação de um estorno que exige trilha auditada |
| Logs operacionais da aplicação | 30 dias, acesso restrito, sem respostas de aluno, tokens ou dados pessoais desnecessários | Expurgo periódico comprovado, sem converter logs em histórico pedagógico paralelo |
| Cópias de ensaio e backups controlados pela equipe | Cópias de ensaio eliminadas até sete dias após seu uso e no máximo 30 dias após criação; backups rotativos com máximo de 30 dias | Restauração reaplica eliminações antes de devolver acesso. Retenção gerenciada pelo provedor deve ser conferida no plano/configuração reais; não prometer apagar individualmente uma linha em backup imutável |
| Suspensão administrativa | Administrador autorizado registra motivo/referência, bloqueia novas contribuições e oculta a identidade exposta; mantém fatos válidos e participação já registrada. Invalidação de crédito comprovadamente incorreto usa ajuste/reconciliação auditados de Q049 | Sem exclusão silenciosa de concessões, reinício de categoria ou alteração automática de movimentos já fechados; resultado fechado que precise de correção exige registro de retificação e revisão humana, preservando grupos em disputa |

**Integração com o que existe:** a tela [ConfigPage](../../codigo-base/src/pages/ConfigPage.tsx) chama `desativarConta`; o [repositório](../../codigo-base/src/data/repositories.ts) usa `deactivate_account`. A [migração 0016](../../codigo-base/supabase/migrations/0016_notifications_social_account.sql) limpa campos do perfil e remove vínculos ativos de sala, preservando IDs/histórico; não implementa sozinha a política acima nem elimina o usuário de Auth/objetos de Storage. Distinguir na interface e nos comandos desativação, suspensão e exclusão definitiva; nenhuma reativação de Q070 recupera dados eliminados por pedido definitivo. Não publicar curso privado, apagar conteúdo de terceiros ou transferir propriedade como efeito automático da limpeza.

A documentação informa que apagar o usuário de Auth não invalida retroativamente todo JWT já emitido e que objetos de Storage pertencentes ao usuário podem impedir sua exclusão. A implementação precisa verificar o estado/autorização no servidor e planejar a limpeza por operação privilegiada, sem segredo administrativo no cliente. [Supabase — gestão de usuários](https://supabase.com/docs/guides/auth/managing-user-data).

Backups do banco não contêm os arquivos de Storage; os dois recursos precisam de inventário/recuperação próprios. Disponibilidade e retenção dos backups dependem do plano real; os 30 dias acima são a escolha para cópias controladas pela equipe. [Supabase — backups](https://supabase.com/docs/guides/platform/backups).

### 5.4 Desempenho, observabilidade e liberação

Metas de ensaio Q086: **10.000 contas, 1.000 ativos por semana, 50 finalizações concorrentes, 50 cursos por usuário no conjunto de teste e salas de 200 membros**; p95 até **2 segundos para consulta de ranking e 5 segundos para finalizar atividade**, no ambiente declarado. Não são limites de produto, seleção de cursos com diária ou desempenho já demonstrado. Medir dados/infraestrutura/índices/planos e otimizar conforme evidência.

Acompanhar erros de finalização, saldo divergente, missão sem processamento, formação/fechamento atrasados e entrega pendente, com correlação sem respostas/tokens/dados pessoais desnecessários. Agendamentos de liga/notificação seguem os intervalos aceitos; alertas técnicos em 30 minutos não preenchem horário de atendimento ou SLA humano.

**Responsáveis foram adiados em Q088:** registrar produto/homologação, revisão de banco, operação/contatos e implantação/decisão de interromper, além de atendimento, reconhecimento de alerta e prazo-alvo de reconciliação, **antes de implantar/liberar**. Não atribuir nomes pelo autor do fork, plantão ao agente ou prazo humano por silêncio. Essas pendências não reabrem a rodada de produto nem significam aprovação operacional.

Piloto em homologação isolada com **ao menos 1 educador e 3 alunos**, cursos público/privado e contextos independentes; ensaiar viradas, revisão/zero, versões, saída/retorno, falha/legado e ciclo de conta. Usar o mesmo mecanismo final de crédito; fixtures artificiais nunca preenchem grupos reais. Liberação geral exige matriz aprovada, permissões/recuperação comprovadas, reconciliação sem diferenças inexplicadas e designações operacionais concluídas. Desenvolvimento no fork por issues/PRs para sprint vigente, revisão humana independente conforme convenções e futura integração upstream por PR; não há commits/push autorizados nesta revisão.

## 6. Validação planejada e critérios de conclusão

**Tudo nesta seção está planejado e não executado nesta consolidação.** A revisão documental confere decisões, caminhos e estrutura; não comprova RLS, aplicação de migração, desempenho ou usabilidade. Os testes de frontend existentes com dados simulados não substituem Postgres real isolado.

### 6.1 Matriz de contratos e automação necessária

| Cenário/contrato | Evidência esperada | Sessões |
| --- | --- | --- |
| Reenvio e duas abas na mesma execução | Mesmo resultado/instante, sem regravar amostra ou duplicar base/contribuição/concessão | 01–02, 05, 10 |
| Duas tentativas concorrentes da mesma questão/contexto | Crédito semanticamente único e incrementos válidos preservados; falha no meio reverte conjunto | 02, 05, 10 |
| Erro, abandono e primeiro acerto | Ordinal não reinicia; base 4 em n=1/2/3 → 4/2/1,3333 uma vez; acerto abandonado só remunera após confirmação integral | 02–03, 10 |
| Decimais e nível | Fronteiras 0, 99/99,9999/100, 249/249,9999/250, 499/499,9999/500, 999/999,9999/1.000, 1.999/1.999,9999/2.000 e 3.999/3.999,9999/4.000; níveis posteriores | 02, 09–10 |
| PAC/revisão/parcial | Última execução completa por aula/versão, acerto binário de peso igual; incompleta não altera amostra e retomada não expira por tempo | 02–03, 07–08 |
| Cobertura/eficiência/qualificação | Q=0/1/10/100 e mínimo T; ordem pela tupla bruta e empate compartilhado; ausência/provisório/oculto/erro distintos de zero | 03–04 |
| PAC sem emblemas/bloqueio | Não implementar cortes acadêmicos antigos; percentual só arredonda na apresentação e não impede estudo/missão elegível | 03–04, 07–08 |
| Curso A/B e duas salas do mesmo curso | XP/base/PAC/conclusão isolados, crédito permitido por contexto e questão distinta global contada uma vez | 02–03, 05, 07–08 |
| Escrita/autorização | Papéis reais negados ao escrever XP/nível/resultado/progresso/movimento; sem sessão, estado bloqueado, questão/aula/contexto inventados ou membro removido rejeitados | 01–05, 08–10 |
| Privado próprio/público alheio | Educador vincula curso autorizado; aluno entra/estuda pela sala sem matrícula/publicação/edição indevida; responsável fora de lista/pódio/posição | 02–04, 08 |
| educator_only e members | Conferir respostas de rede e consultas diretas: sem indicadores/progresso/ordem/empates de colegas para aluno restrito; public legado reduzido a members | 03–04, 08, 10 |
| Curso/amigos e autoria | Matrícula ativa/concluída, acesso/amostra individual e amizade; exclui abandonado/sala-only; prévia autor/admin sem prêmio/amostra, estudo alheio legítimo permitido | 02–04, 07–08 |
| Snapshot/adoção de versão | Publicação estável, tentativa antiga histórica, aula inalterada mantém amostra e modificada precisa refazer; missão ativa bloqueia adoção dependente e item igual não repaga | 02–03, 05, 07–08 |
| Catálogo/viabilidade | 3 globais/dia, 2/semana, 1 por curso; metas/variantes fixas Q136; atraso de visita não reduz meta; indisponibilidade sem penalidade da missão | 05–08 |
| Sem visita/curso ativo | Atividade materializa missões sem abrir painel; globais visíveis sem curso; resumo de três não limita lista/histórico ou recompensa | 05–07 |
| Revisão/vazia/distinção | Novas execuções integrais podem repetir aula; reenvio e clique repetido vazio não contam; questão creditada conta uma vez por nova ocorrência | 02, 05–08 |
| Calendário/vínculos | Instante no limite pertence à nova janela; retorno perdido mantém original; sem atividade pré-vínculo/publicação ou retroatividade offline | 02, 05–08, 04A |
| Missão/base/temporada | Base única e bônus separados: exemplo controlado 4+2+1=7 vitalícios/4 competitivos; sala base/bônus internos e global vitalício; nenhum bônus compete | 02, 04A, 05–09 |
| Editor/cotas concorrentes | Rascunho privado, 1h–90d, regra/janela imutáveis, até 5 publicações/semana e 5 vigências; agendada consome ao publicar, cancelar não devolve | 05, 08 |
| Cancelar aos 90% e pagamento posterior | Motivo/histórico, sem prêmio parcial; preservar créditos e pagar direito confirmado sem teto oculto, mesmo missão publicada noutra semana | 05, 08–10 |
| Matrícula/saída/reingresso | Sem nova diária no abandonado; concluído com revisão; vínculo retomado reutiliza atribuição sem bônus novo nem leitura perdida | 05, 07–09 |
| Inscrição automática/tardia | Fotografia nos sete dias, abertura sem visita/XP e retorno pela primeira atividade oficial até fim, inclusive sala/revisão com zero; inscrição única/sem abandono | 04A–04, 10 |
| Afinidade/grupos | Mesma categoria, pesos 2/1/seed, alvo 20/teto 30, casos P=0/8/45; sem geografia, contas artificiais ou troca após publicar | 04A, 10 |
| Movimentos positivos/empates | n=1/8/10/20/30, extremos, expansão de bloco e sobreposição sem destinos opostos; resumo/paginação não muda corte | 04A–04, 10 |
| Zero obrigatório | Mistos, grupo inteiro zero, solo, n<10, tardio, sala/revisão: uma queda até Bronze; zero não promove, não inventar compensação | 04A–04, 10 |
| Apuração e nova semana | Fechamento/abertura concorrentes e repetidos, resultado integral, fotografia na virada, atividade nova registrada na espera e associada uma vez; sem categoria provisória/prêmio/extensão | 04A–04, 09–10 |
| Desativação/exclusão/suspensão | Após inscrição preserva linha válida sem identidade/movimento normal; antes da abertura não entra; dados eliminados não voltam no retry/restore, antigos tokens sem contribuição | 04A, 09–10 |
| Listas/identidade/erro | Resumo pessoal além do milésimo e da primeira página; próprio grupo, até 5 entradas/empates autorizados, foto/nome/banner, sem pseudônimo/e-mail; falha não vira zero | 04, 06–09 |
| Notificações/atualização | Intenção/destino únicos e prazos Q078; falha não desfaz XP; 60s em Ligas visível e revalidação de contexto/foco, sem celebrar retry | 06–10 |
| Legado/corte/expurgo/carga | Abertura reaplicável, item incerto sem base nova, missões manuais arquivadas, corte ≤30min e recuperação; eliminação/restauração e p95/volumes Q086 medidos | 01–02, 09–10 |

Executar o pipeline vigente de [Testes](../testes.md) quando houver código: `npm run lint`, `npm run typecheck`, `npm run test:run`, `npm run test:check`, `npm run build` e E2E para UI/navegação. Harness SQL novo será não interativo, isolado, com RLS/papéis/conexões concorrentes, falha propagada e reaplicação/recuperação; o runner legado `test:db` não serve de aprovação do esquema atual. Medir p95 por ensaio reproduzível, não por percepção visual.

### 6.2 Verificações manuais separadas — M01–M09, pedido Q087

**Nenhum teste desta lista foi executado nesta revisão documental.** Usar homologação isolada e registrar versão, ambiente, papel/conta, passos, resultado e evidência. As verificações abaixo complementam o pipeline e os testes SQL/E2E de [Testes](../testes.md); não substituem concorrência real no Postgres por cliques ou mocks.

| ID | Verificação manual | Resultado/evidência esperados |
| --- | --- | --- |
| M01 | Navegar em desktop/móvel e 360/768/1440 px; teclado, foco/retorno de modal, leitor de tela, contraste e redução de movimento | Conteúdo/ações utilizáveis nos navegadores de Q079, estados de erro/vazio/espera compreensíveis e capturas/registro de acessibilidade |
| M02 | Educador cria sala com privado próprio e com público de outro autor; aluno entra por código e estuda pela sala | Conteúdo acessível naquele contexto, sem matrícula individual, publicação indevida ou permissão de editar o curso alheio; curso da sala não pode ser trocado |
| M03 | Aluno estuda, erra/revisa, conclui aula sem questões, troca curso/sala e usa mais de uma aba | Resumos coerentes de base/bônus/PAC e histórico; identidade real e banner nos locais aceitos; ausência/erro não viram zero e resultado confirmado é recuperado sem duplicar prêmio |
| M04 | Educador usa rascunho/prévia/publicação, vigências/cotas, cancelamento e adoção de versão | Papéis e mensagens corretos, regra publicada preservada, cota não devolvida, nova versão bloqueada quando prejudicaria missão ativa; snapshot e histórico mantidos |
| M05 | Aluno/educador consultam members/educator_only, curso de amigos e próprio grupo da liga; inspecionar respostas de rede | Sem PAC/progresso/ordem indevidos, dados de outro grupo ou e-mail; responsável fora do ranking da sala, sem pseudônimo opcional; public legado tratado conforme Q068 |
| M06 | Acompanhar virada/apuração/formação e resultado em ensaio controlado, zero XP e desativação | Fotografia/posição e movimentos consistentes; estados de espera sem bloquear estudo, nenhuma saída de temporada; zero cai uma vez com Bronze como piso. Não usar relógio do navegador como prova do calendário oficial |
| M07 | Publicação/conquista/resultado geram notificação; ensaiar atraso/falha/expiração e clique com acesso perdido | Deduplicação e prazos Q078, histórico próprio acessível sem novo acesso à sala; falha de entrega não desfaz aprendizagem e não dispara novo prêmio |
| M08 | Ensaio de corte/retomada, conferência de Auth/RLS/jobs/Storage/backups e compatibilidade frontend/SQL | Ambiente e versões identificados, saldos reconciliados, comandos antigos sem pagamento paralelo, recuperação demonstrada e evidências de configuração real |
| M09 | Ensaiar desativação, exclusão/suspensão autorizadas, token anterior, expurgo e restauração de cópia | Identidade/acesso/participação seguem a política; sem recuperar dados eliminados, segredos no cliente ou perda de conteúdo alheio. Conferir dependências de autoria antes de remover Auth/Storage |

**Automação continua obrigatória:** fórmulas/limiares, crédito e concessão únicos, concorrência, permissões com papéis reais, limites de período, movimentos/empates/zeros, reaplicação/recuperação e expurgo devem ter testes apropriados. Desempenho é medido por ensaio reproduzível de Q086; percepção visual não comprova percentil 95. Identificar responsáveis, contatos, janela de atendimento e resposta operacional antes da implantação/liberação, conforme o adiamento aceito; não reabrir o questionário de produto apenas para repetir esses nomes.

### 6.3 Roteiros escolhidos por delegação Q099 — T01–T05, não executados

Cinco percursos agrupam contratos para reduzir repetição de preparação. Usar contas/fixtures controladas, com pré-condições registradas por roteiro; não reiniciar contadores de usuários reais. Os percursos orientam automação e as verificações humanas M01–M09 já separadas acima.

| Roteiro | Pré-condições, percurso e resultado esperado | Cobertura / evidência |
| --- | --- | --- |
| T01 — aluno em curso individual | Aluno novo elegível desde o início da semana, curso público alheio com pelo menos cinco questões; primeira aula com uma questão de base 4 e sem outras conquistas no evento. Matricular, concluir e conferir 7 vitalícios/4 competitivos e PAC provisório. Avaliar mais aulas para qualificar amostra, errar/revisar, reenviar e concluir aula sem questões. Base não se renova; PAC usa a última execução completa | Q091–Q094/Q098; M01/M03. Conferir UI contra resultado oficial/livro de créditos; unicidade e concorrência também no SQL |
| T02 — educador e alunos em sala | Educador com privado próprio publicado, público de outro autor, três alunos e duas salas do mesmo curso. Prévia não pontua; criar sala/rascunho/missão, publicar e entrar por código sem matrícula individual. Aluno só de sala fecha global com bônus vitalício, sem XP competitivo daquela atividade. Conferir members/educator_only, responsável fora do ranking e curso sem troca | Q063/Q067–Q068 e isolamento; M02/M04/M05. Inspecionar chamadas diretas/rede e cada contexto, sem depender de esconder campos |
| T03 — semana competitiva | Fixtures com categoria anterior persistida e estudo recente, grupos de 20, grupo pequeno, pessoa sozinha e Bronze. Abrir automaticamente, entrar tarde, pontuar por fonte elegível e fechar com positivos empatados, zeros mistos e grupo inteiro zerado. Zero cai uma vez até Bronze; positivos mantêm proteções/empates, sem prêmio, abandono ou troca por amizade | Q105/Q138–Q143, Q094/Q097; M06. Viradas controladas no ambiente isolado, resultado persistido e teste automatizado dos cortes do grupo inteiro |
| T04 — mudanças e falhas indesejadas | Aluno com missão a 90% e tentativa em andamento. Tentar mudar regra, cancelar, exceder cota, publicar/adotar versão; remover/reingressar aluno e interromper retorno de rede/notificação. Preservar snapshot/histórico e regra publicada, vedar leitura perdida e recuperar confirmação sem segunda concessão; aplicar prazos de entrega | Q095–Q096/Q098, Q135/Q142; M04/M05/M07. Separar reversão de retorno perdido; restabelecer vínculo não renova atribuição |
| T05 — legado, operação e ciclo de conta | Cópia isolada com saldos/progresso legados e item incerto. Ensaiar abertura/reaplicação, corte/recuperação, carga Q086, desativação/exclusão/suspensão, token anterior e expurgo/restauração. Preservar créditos válidos, sem repagar legado ou recuperar dados pessoais eliminados; conferir Auth/Storage/backups | Q081–Q090 e Q070/Q085; M08/M09. Testes SQL/permissões/carga automatizados e conferência manual de configuração; não preencher grupos reais com dados de ensaio |

**Casos indesejados escolhidos:** repagamento por reenvio/abandono ou edição cosmética; matrícula ao entrar em sala; PAC privado inferido pela rede/ordem; perda de atividade por formação atrasada; alteração de meta a 90%; reaparecimento de dados eliminados após restauração. São verificações de regras existentes, sem requisitos novos atribuídos ao usuário.

## 7. Como este guia vira registro de execução

As seções anteriores descrevem intenção e sequência, exceto estados explicitamente atualizados. O registro efetivo abaixo informa o trabalho realizado; não marcar sessão concluída só por existir no planejamento.

### Sessão 00 — preparação executiva inicial da issue 42

**Data/ferramenta:** 30/10/2026, Codex. **Responsável pela issue:** solicitante, conforme informado. **Estado:** parcialmente concluída; artefatos documentais iniciais preparados, implementação não iniciada.

**Autorização:** guia/fluxo/interfaces de teste aprovados pelo usuário; permitidos código, testes, documentação e ambiente SQL exclusivamente isolado, após identificação do destino. Sem commits/push/merge/PR/deploy autorizados. Responsáveis e SLAs operacionais continuam adiados até pré-liberação.

**Base e preservação:** `sprint04`, `2c3d19dd6b92a44967c950d5bc03b5cb19f42e02`. Estado inicial: somente os quatro documentos desta pasta untracked. Branch criada `issue/42-define-gamificacao` em `embertoni/Athen-Teste`, preservando todos. `git ls-remote` confirmou upstream/sprint04 no mesmo SHA; origin/sprint04 em `59bfd13`, referência distinta preservada. Nenhum pull/merge foi executado. Commits/PRs: não realizados.

**Skills:** frontmatters canônicos redescobertos; aplicadas `to-spec`, `to-tickets`, `codebase-design`, `domain-modeling` e `writing-for-agents`, com SKILL.md e formatos de glossário/ADR lidos. Aceite do guia satisfaz a confirmação de interfaces/granularidade da preparação inicial; não repetir entrevista. TDD/implement/code-review serão aplicadas no ticket funcional, com apoios e adaptação sem commit da seção 3.3. Nenhum subagente utilizado. Leituras futuras seguem a seção 3.6, sem recarregar o questionário completo.

| Área / arquivo efetivo | Operação | Mudança realizada | Branch |
| --- | --- | --- | --- |
| `.scratch/gamificacao/spec.md` | Criado | Especificação inicial, histórias, decisões, testes/exclusões e ponte para rastreabilidade dos 143 IDs | `issue/42-define-gamificacao` |
| `.scratch/gamificacao/contratos.md` | Criado | Entradas públicas, invariantes/chaves de DDL futuro, compatibilidade, destino de ensaio proposto e evidências locais | mesma |
| `.scratch/gamificacao/issues/01-bootstrap-sql-isolado.md` | Criado | Primeira entrega de código: bootstrap, sanidade sob aluno e falha propagada | mesma |
| `.scratch/gamificacao/issues/02-node-ci-compativel.md` | Criado | Correção verificável da incompatibilidade de Node/ESLint na CI | mesma |
| `.scratch/gamificacao/issues/03-concorrencia-e-ci-sql.md` | Criado | Ampliação incremental do harness e job SQL isolado, bloqueada por 01/02 | mesma |
| `.scratch/gamificacao/issues/04-finalizacao-imutavel.md` | Criado | Primeiro percurso da sessão 02, dependente de infraestrutura integrada | mesma |
| `GLOSSARY.md` | Alterado | Conceitos aprovados de contexto, execução, crédito, missão e liga; aviso de implementação pendente | mesma |
| `docs/adr/0001-gamificacao-transacional.md` | Criado | Decisão Q006/Q007, alternativa assíncrona e exceção competitiva Q141 | mesma |
| `docs/README.md` | Alterado | Links para plano/registro, spec e ADR | mesma |
| Este guia | Alterado | Aprovação/issue/branch reais, estado da sessão e registro de execução | mesma |

**Comportamento conferido nas fontes:** início de tentativa por insert e resposta por upsert em `repositories.ts`; `finalize_attempt` de 0018 recalcula resultado e bloqueia apenas tentativa, com anti-regrind entre contextos. `completions` não distingue salas; 0022 atende apenas curso. `join_room` não cria matrícula. Ligas consulta mil globais; Salas ordena XP interno e deriva emblema de PAC mesmo quando restrito. TopDown depende de curso ativo. Esses fatos não foram corrigidos nesta entrega documental.

**Ambiente verificado:** Node `24.19.0`, npm `12.0.2`, Supabase CLI `2.121.0`; Docker cliente/servidor `29.9.2`, Linux, sem containers na listagem. CLI/Docker exigiram execução fora da sandbox para telemetria/API local; sem criação de containers ou conexão SQL. A consulta de versão alterou incidentalmente `supabase/.temp/cli-latest`; somente essa alteração própria foi revertida ao conteúdo inicial, confirmado pelo Git. Nenhum `.env` foi lido.

**CI:** ambos os jobs fixam Node `22.12.x`; ESLint instalado `10.11.0` declara `^20.19.0 || ^22.13.0 || >=24`. Incompatibilidade confirmada por manifesto instalado, registrada no ticket 02; workflow ainda não alterado.

**Banco:** ausência de `supabase/config.toml` confirmada. SQL numerado 0001–0022 e os legados v1/v2 inventariados; 0013 e seed.sql inspecionados. Contrato de bootstrap propõe projeto/diretório exclusivo, seleção explícita do numerado e nenhum seed de demonstração automático. Destino concreto ainda não provisionado/confirmado; nenhuma migração aplicada, tipo regenerado ou teste SQL executado.

**Validação documental executada:** SHA-256 confirmou respostas e duas propostas idênticas byte a byte ao início (3/3). Conferidos oito artefatos iniciais, nove links locais e cercas Markdown equilibradas; novos links do guia/índice também resolvem. Contagem estrutural confirmou Q001–Q143 únicos na fonte. Tickets 01–04 têm status, bloqueadores e critérios ainda desmarcados. `git diff --check` passou nos rastreados; novos arquivos próprios foram lidos, pois não aparecem nesse diff. Uma primeira expressão do verificador temporário falhou pela codificação de símbolo no pipe PowerShell/Python; a verificação foi corrigida para padrão ASCII e passou. Nenhum script de validação foi adicionado ao produto.

**Revisão local:** eixo Padrões — nomes novos, formato do tracker, glossário sem implementação e ADR conforme referências; eixo Spec — regras posteriores, escopos, interfaces aprovadas e pendências pré-liberação preservados, sessão 00 explicitamente parcial. Revisão feita pelo agente principal, incluindo novos arquivos; não substitui revisão humana ou integração. Pipeline da aplicação e T01–T05/M01–M09 não executados nesta etapa documental.

**Pendências:** confirmar estado Em andamento da issue 42; detalhar tickets seguintes por comportamento conforme 3.5 antes de executá-los; integrar dependências apenas com autorização. Os tickets locais 01–04 são identificadores locais, não novas issues YouTrack. Sessão 00 não está encerrada como implementação completa.

**Próxima ação:** após confirmar o estado, preparar a branch da issue para o ticket 01 respeitando a dependência documental, identificar projeto/container/portas locais, aplicar apenas o esquema selecionado e demonstrar sanidade/falha pelo harness. Consultar spec, contratos e ticket 01, docs de banco/testes, skills `implement`/`tdd` e seus apoios. Nenhuma necessidade de nova rodada de produto.

### Sessão 01 — ticket 01: bootstrap e sanidade SQL isolados

**Data/ferramenta:** 30/10/2026, Codex; issue 42 Em andamento confirmada pelo usuário, responsável solicitante. **Estado:** ticket 01 implementado e validado localmente; sessão 01 parcial. **Ponto de parada solicitado pelo usuário:** desenvolvimento pausado após esta entrega; nenhum ticket seguinte iniciado.

**Branch/base:** `issue/42-testes-banco-gamificacao`, criada diretamente de `sprint04` em `2c3d19dd6b92a44967c950d5bc03b5cb19f42e02`. Preparação documental da sessão 00 carregada como alterações locais preservadas; nenhuma dependência foi declarada integrada. Sem commits, pushes, merges, PRs ou publicação. Nenhuma página de produto alterada.

**Skills e revisão:** `implement`/`tdd`, com exemplos e mocks lidos; infraestrutura preparatória conforme exceção da seção 3.1. Sanidade pela RPC existente, sem antecipar regras futuras. `code-review` aplicada com dois subagentes somente de leitura: Padrões e Spec. Referência inicial + diff de working tree e arquivos novos, sem usar diff de commits vazio como aprovação. Padrões encontrou uma exportação sem uso, removida; Spec não encontrou defeito funcional no incremento e pediu fechamento das evidências/registro, concluído aqui. Revisão humana continua pendente; adaptação da skill: nenhum commit autorizado.

| Arquivo efetivo | Operação | Entrega |
| --- | --- | --- |
| `codigo-base/scripts/db-test-env.ts` | Criado | Guardas de URL/configuração/container/label/porta e marcador do projeto |
| `codigo-base/scripts/prepare-db-tests.ts` | Criado | Copia só a configuração exclusiva para diretório ignorado |
| `codigo-base/scripts/bootstrap-db-tests.ts` | Criado | Aplica apenas SQL numerado em transação; registra manifesto SHA-256 e recusa esquema preexistente sem marcador |
| `codigo-base/scripts/run-db-tests.ts` | Criado | Runner não interativo, falha propagada e rollback/encerramento de conexão |
| `codigo-base/tests/db/sanity.sql` | Criado | Fixtures fictícias transacionais; aluno authenticated/RLS, RPC de aula vazia, idempotência, progresso e isolamento de conclusão alheia |
| `codigo-base/tests/db/supabase/config.toml` | Criado | Projeto athen-gamificacao-test; banco 55432, API 55431 e shadow 55430; seed automático desativado |
| `codigo-base/tsconfig.db.json` | Criado | Checagem própria de tipos dos scripts do harness |
| `codigo-base/package.json`, `package-lock.json` | Alterados | Comandos prepare/bootstrap/run/check; @types/pg de desenvolvimento, necessário porque pg existente não traz declarações |
| `codigo-base/.gitignore` | Alterado | Ignora estado local .supabase-test/ |
| `codigo-base/README.md`, `docs/testes.md`, `docs/banco-de-dados/documentacao-bd.md` | Alterados | Setup, execução, descarte restrito ao projeto, cobertura e limites reais |
| `.scratch/gamificacao/` e este guia | Alterados | Estado da issue, ticket validado e retomada/pausa |

**Destino confirmado antes do SQL:** Docker 29.9.2 Linux, Supabase CLI 2.121.0; imagem Postgres 17.11.0.004, projeto/container `athen-gamificacao-test` / `supabase_db_athen-gamificacao-test`, host `127.0.0.1:55432`, banco postgres. Primeiro container `134a67905802`; segunda instalação do zero em `d2ad8c15d355`. Não foram usados .env da aplicação, credenciais compartilhadas ou bancos remotos. Claims de aluno são definidos numa sessão SQL real; login HTTP não foi testado.

**Migrações:** somente 0001–0022, todas aplicadas nas duas instalações; v1_schema.sql/v2_schema.sql e seed.sql não executados. 0013 instala medalhas e não criou demo sem perfis. Migrações históricas e tipos gerados preservados. Marcador administrativo `athen_test.environment` guarda projeto/manifesto; reaplicação reconheceu hashes iguais e não repetiu SQL.

**Validações e resultados:**

- `npm run test:db:prepare`, `test:db:bootstrap` e `test:db:run`: sucesso; sanidade 0 sob aluno com RLS ativa, conclusão única ao reenviar, 100% de progresso e zero XP; conclusão alheia não retornada.
- `test:db:run -- --prove-failure`: erro intencional e saída 1; em seguida sanidade normal 0. Variável ausente e URL remota rejeitadas com saída 1 antes de conexão. Configuração alterada rejeitada com saída 1; configuração restaurada e sanidade 0.
- Repetição de bootstrap no mesmo banco: saída 0, sem reaplicar migrações. Descarte restrito ao projeto confirmado por label e recriação completa: segunda instalação e sanidade aprovadas.
- Pipeline final: `npm run lint`, `typecheck`, `test:run` (2/2), `test:check`, `build` e `test:db:check`, todos aprovados. Aviso de bundle maior que 500 kB já existia. Sem E2E novo, pois não houve alteração de UI/navegação; T01–T05/M01–M09 continuam planejados.
- Restrição da sandbox impediu inicialmente tsx de consultar usuário Windows e acesso à API Docker; execução autorizada fora da sandbox resolveu. Não é falha de negócio. Tentativa inicial de descarte com template Docker encontrou erro de aspas e recusou a ação; conferência por JSON permitiu executar o descarte correto.

**Limitações/pendências:** CI SQL e conexões concorrentes ainda não implementadas (ticket 03); incompatibilidade Node 22.12.x/ESLint 10 na CI permanece no ticket 02. CLI avisa que a seção inbucket está obsoleta; configuração funciona na versão declarada, atualizar antes de CLI v3. `npm install` reportou cinco vulnerabilidades no conjunto de dependências; não foi executado audit fix nem ampliado o escopo para atualizações. Não alegar validação do novo motor de XP/missões/PAC/ligas, Auth HTTP ou desempenho.

**Pausa e retomada:** containers deste projeto parados com `supabase stop --workdir .supabase-test`, **preservando o banco local**; comando concluído com sucesso. Código/documentação permanecem sem commit na branch atual. Na retomada autorizada, ler este registro, spec, contratos e tickets 02/03; conferir Git e base/dependências antes de abrir outro escopo. Para reutilizar o ensaio: seguir o comando start do README, definir somente a variável local, executar bootstrap (deve reconhecer manifesto) e sanidade. Revisão/integração/commits exigem autorização própria; não iniciar sessão 02 sem respeitar suas dependências.

### Sessão 01 — tickets 02/03: compatibilidade da CI e concorrência SQL

**Data/ferramenta:** 30/10/2026, Codex. Retomada expressamente solicitada pelo usuário. **Issue:** 42, solicitante responsável, sprint04, Em andamento confirmado. **Estado:** implementado e validado localmente; sem integração/liberação. Nenhuma página de produto alterada.

**Base/branch:** upstream/sprint04 remoto reconferido em `2c3d19dd6b92a44967c950d5bc03b5cb19f42e02`, igual à base local. Mantida `issue/42-testes-banco-gamificacao` para o mesmo escopo de infraestrutura da issue 42/sessão 01. Alterações locais do ticket 01 e preparação documental preservadas. Não houve commit, push, merge ou PR; entregas locais não foram declaradas integradas na sprint.

**Skills:** descrições canônicas redescobertas, `implement` e referências de TDD aplicadas conforme o guia; mudança de versão da CI validada por engines/comandos reais, sem teste permanente que apenas compare strings de YAML. Infraestrutura de concorrência segue a exceção preparatória da sessão 01 e as interfaces já aprovadas. `code-review`: dois subagentes somente de leitura, Padrões e Spec, com working tree/arquivos novos e base inicial; nenhum achado material restante. Ajustes de lint e revisão da extração da limpeza concluídos. Commit prescrito pela skill continua fora da autorização.

| Arquivo efetivo | Operação | Mudança |
| --- | --- | --- |
| `.github/workflows/ci.yml` | Alterado | Node 24.19.0 em quality/e2e e novo job database; preparação, bootstrap, tipos, sanidade, concorrência, parada always; sem secrets remotos |
| `codigo-base/tests/db/concurrency.ts` | Criado | Dois alunos/claims/PIDs, duas salas do mesmo curso, curso privado, barreira real em pg_locks, ingresso novo sem matrícula, falha SQL e rollback/limpeza |
| `codigo-base/scripts/run-db-tests.ts` | Alterado | Opção --concurrency pela mesma entrada pública do harness, com falha propagada e verificação de destino |
| `codigo-base/package.json`, `tsconfig.db.json` | Alterados | Comando test:db:concurrency e inclusão explícita na tipagem de banco; dependências/lockfile/hooks não alterados nesta retomada |
| `codigo-base/README.md`, `docs/testes.md` | Alterados | Node consultado na CI, execução/limpeza das fixtures concorrentes, cobertura e limites da automação remota |
| `.scratch/gamificacao/issues/02-node-ci-compativel.md`, `03-concorrencia-e-ci-sql.md` | Alterados | Critérios e resultados locais, revisões e limites registrados |
| `.scratch/gamificacao/issues/05-reingresso-sala-updated-at.md` | Criado | Evidência de defeito preexistente no reingresso, ainda sem correção |
| Spec e este guia | Alterados | Estado atual, retomada, pendências e próxima ação |

**Compatibilidade:** auditoria com semver sobre 278 declarações engines.node do lockfile encontrou 18 incompatíveis com Node 22.12.0, incluindo ESLint, jsdom e lint-staged. Node local 24.19.0 satisfaz todas as declarações verificadas e foi fixado nos jobs. Nenhuma dependência foi atualizada para obter esse resultado.

**SQL/ambiente:** reutilizado o projeto local exclusivo athen-gamificacao-test, container `7cbbc78349dd`, banco em `127.0.0.1:55432`. Retomada do volume preservado e bootstrap reconheceram o manifesto 0001–0022 sem reaplicar SQL. Nenhuma migração nova, banco remoto, .env da aplicação ou tipo gerado alterado. Cada execução concorrente cria UUIDs próprios, confirma fixtures administrativas para visibilidade entre conexões, executa comandos como aluno/RLS e aguarda os workers antes de remover só seus dados. Interrupção abrupta exige conferir/recriar o projeto descartável; não prometer rollback global de fixtures confirmadas.

**Validações executadas:**

- Pipeline local com Node 24.19.0: lint, typecheck, test:run (2/2), test:check, build e test:db:check aprovados. Lint/test:check/test:db:check repetidos após a última alteração do teste de concorrência, aprovados.
- E2E inicial: 12 casos Chromium reportaram sucesso, mas processo travou no encerramento da sandbox e foi interrompido; essa execução não foi considerada aprovação completa. Repetição autorizada fora da sandbox, `npm run test:e2e -- --workers=2`: **12 passed (40.5s), saída 0**, com novo build/preview. São os testes existentes com HTTP controlado; não representam login real nem homologação T01–T05/M01–M09.
- `npm run test:db:run`: saída 0. `test:db:concurrency`: saída 0, dois PIDs distintos e ambos observados esperando a mesma barreira antes da liberação; privado e salas isolados, ingresso sem matrícula e rollback verificados.
- `test:db:concurrency -- --prove-failure`: saída 1 intencional; nova execução normal em seguida retornou 0, confirmando limpeza/repetibilidade.
- Preparação inicial da fixture revelou parâmetro reutilizado como UUID/texto; casts explícitos corrigidos. Lint intermediário encontrou atribuição inútil e throw no finally; remoção/extração de limpeza corrigidas e rechecadas. Não são falhas atribuídas ao produto.

**Defeito de baseline observado:** reingresso via join_room com membro existente falhou com `record "new" has no field "updated_at"`. 0005 omite a coluna em room_members e 0012 instala touch_updated_at nessa tabela. O teste atual cobre ingresso novo; o caminho de reingresso e demais updates de membros precisam da correção incremental/teste do ticket 05 antes de serem declarados funcionais. SQL histórico preservado; não ocultar essa pendência ao homologar salas.

**Pendências e próxima ação:** execução Linux/GitHub do novo job ainda não realizada; configuração versionada e validação local não são execução remota. Sessão 02/ticket 04 requer dependências integradas conforme 1.4/3.5 e o próprio ticket; revisão humana e integração na sprint continuam pendentes de autorização para versionamento/publicação. O próximo passo de núcleo não deve tratar working tree sem commit como sprint integrada. Conferir também o ticket 05 ao planejar as fatias de sala. Nenhum novo requisito de produto aberto.

**Estado final do ambiente:** containers exclusivos parados com sucesso após os testes, usando stop sem --no-backup; banco preservado para retomada. Mudanças de cache do CLI produzidas pelo ensaio removidas, preservando o valor inicial versionado. Conferência final: YAML válido nos três jobs, Node compatível, diff sem erros de whitespace, links dos artefatos existentes e respostas/propostas preservadas por SHA-256.

**Encaminhamento preparado após nova solicitação de continuar:** estado/branch/base reconferidos, alterações locais preservadas e [rascunho de PR/escopo de commits](../../.scratch/gamificacao/pr-infraestrutura.md) preparado com a skill `pr`. Trajeto: versionar a entrega revisável na branch da issue → publicar PR para sprint04 no fork → obter CI/revisão humana independente → integrar quando autorizado → iniciar a branch dependente da sessão 02 a partir da sprint atualizada. **Commits necessários foram posteriormente autorizados e criados conforme o registro abaixo. Push e publicação de PR ainda aguardam autorização.** Merge não será presumido pela autorização de publicar.

### Versionamento local autorizado — issue 42

**Autorização recebida:** realizar qualquer commit necessário em embertoni/Athen-Teste. Branch preservada `issue/42-testes-banco-gamificacao`, base `2c3d19dd6b92a44967c950d5bc03b5cb19f42e02`; nenhum commit direto em sprint04/develop/main. A autorização não foi estendida por suposição a push, publicação de PR, merge ou implantação.

| Commit efetivo | Escopo | Validação no fechamento |
| --- | --- | --- |
| `a5e199befeb263a95d65c0aa225f618b185a9ec9` | Planejamento aprovado, fontes literais, spec/contratos/tickets, glossário, ADR, índice e proposta de PR | Fontes conferidas por SHA-256 no disco; conteúdo do index equivalente considerando normalização Git CRLF/LF; hook executado sem arquivos JS/TS aplicáveis |
| `5b7a210eac7093f0ba701d954ea08b1be75d51b2` | Harness SQL/testes/configuração local, tipos pg/comandos, Node/CI e documentação de execução | Index com 15 arquivos explícitos, sem .env/estado local/artefatos; diff --check aprovado; hook lint-staged executou eslint --fix nos cinco TS e passou |

**Registro final:** commit documental `docs: registra commits da infraestrutura de gamificacao` contém este registro e os hashes acima. Os dois commits da entrega estão na mesma branch, sem integração na sprint. A comparação com o index salvo pelo hook confirmou que o segundo commit não introduziu alteração de código durante a execução do ESLint; por isso as validações funcionais registradas na sessão anterior continuam aplicáveis, sem repetição desnecessária da suíte.

**Preservação:** o primeiro diff completo sinalizou espaços finais de quebras de linha Markdown em documentos novos do planejamento. Essas quebras e as fontes literais foram preservadas. Nenhuma alteração em bancos, credenciais ou tipos gerados durante o versionamento. A árvore ficou limpa após os dois commits principais; somente este fechamento documental foi alterado em seguida.

**Próxima ação, dependente de input:** autorizar push da branch para origin (embertoni/Athen-Teste) e abertura do PR para sprint04, para executar CI remota e obter revisão humana independente. Aguardar a resposta antes dessas ações. Ainda não iniciar a sessão 02 como se a infraestrutura estivesse integrada.

### Encaminhamento remoto — conferência de base em 31/10/2026

**Autorização recebida:** usuário autorizou push e abertura do PR após a conclusão dos commits. Estado inicial reconferido: árvore limpa, branch issue/42-testes-banco-gamificacao, HEAD `c017d3f9b14288adb11d881d842f16d1acf55328`; nenhum PR aberto dessa branch no fork.

**Bloqueio antes da publicação:** git ls-remote confirmou origin/sprint04 em `59bfd138bc79fb3ce6513e04a645de2fa64c4c1a` e upstream/sprint04 em `2c3d19dd6b92a44967c950d5bc03b5cb19f42e02`, base já usada nas sessões locais. A divergência havia sido registrada na preparação, mas sua consequência para o PR agora foi quantificada: o diff origin/sprint04...HEAD inclui **219 arquivos**, com trabalho histórico além da infraestrutura. Não apresentar esse conjunto como a entrega revisada dos tickets 01–03.

**Trajeto proposto e input necessário:** alinhar sprint04 do fork com upstream por PR separado, preservando as duas histórias e exigindo revisão/integração humana, depois abrir o PR de infraestrutura contra a base sincronizada. A alternativa é aguardar sincronização feita pelo usuário. Não realizar reset/force-push, merge ou atualização automática da base. Push/PR de infraestrutura ainda não executados; aguardar decisão sobre a base antes de avançar. Código, testes e fontes literais preservados; somente este registro e a proposta foram atualizados nesta conferência.

**Restrição de destino esclarecida pelo usuário:** upstream é o remote de leitura para VitorSoaresGoncalves/Athen, que nunca poderá receber alterações desta tarefa. Toda escrita, inclusive commits, branches, PRs, comentários e configurações por conectores, fica contida em embertoni/Athen-Teste. A proposta de sincronização tem exclusivamente o fork como destino e não foi criada. Nenhuma escrita foi realizada no original até aqui; somente consultas de referências Git. Para evitar push acidental pelo Git neste checkout, configurado localmente `remote.upstream.pushurl = disabled://upstream-read-only`, preservando a URL de leitura. Isso modifica apenas .git/config local; a proibição vale também para ferramentas que não usam esse remote.

### PR de sincronização publicado exclusivamente no fork — 31/10/2026

**Autorização:** usuário confirmou a criação do PR em Athen-Teste após esclarecer a proibição de qualquer escrita no original. **PR criado:** [embertoni/Athen-Teste #2](https://github.com/embertoni/Athen-Teste/pull/2), título `chore: prepara sincronizacao da base sprint04 no Athen-Teste`, estado **open/draft**, sem merge.

**Referências remotas:** branch criada somente em embertoni/Athen-Teste, `issue/42-sincroniza-sprint04`, no snapshot já disponível `2c3d19dd6b92a44967c950d5bc03b5cb19f42e02`; base do PR `sprint04`, `59bfd138bc79fb3ce6513e04a645de2fa64c4c1a`. As duas pontas pertencem ao fork. Nenhuma atualização da branch sprint04, reset, force-push, merge ou escrita no original foi executada. Branch local de infraestrutura continua issue/42-testes-banco-gamificacao.

**Escopo confirmado pelo GitHub:** 64 commits no lado head, 195 arquivos, 14.884 adições e 3.268 remoções. Descrição preparada com a skill pr e publicada com chamadas estruturadas do conector GitHub, sempre com repository_full_name embertoni/Athen-Teste. É uma proposta de atualização histórica, separada dos commits de infraestrutura; não afirmar que contém o novo núcleo de missões/PAC/ligas.

**Conflitos e validação:** GitHub retornou mergeable=false. Inventário local por `git merge-tree --write-tree --name-only --no-messages` confirmou 25 arquivos em conflito, sem alterar branch/index/working tree: 19 arquivos de aplicação (rotas, aula, sidebars, Amigos, Catálogo, Dashboard, Ligas, Notebook, Salas, Criar Curso e CSS de Perfil), cinco documentos (índice, arquitetura, banco, estilo, testes) e scripts/link-skills.sh. A árvore hipotética gerada não foi aplicada. Consulta de workflow_runs do commit no fork retornou lista vazia; nenhuma CI remota aprovada foi presumida.

**Pendência real:** resolver conflitos preservando a intenção das duas histórias e validar a árvore resultante antes de pedir revisão humana independente/merge. A descrição do PR registra o risco amplo e a configuração antiga Node22.12.x do snapshot, cuja correção está no PR de infraestrutura ainda separado. Não usar testes do checkout de infraestrutura como aprovação do resultado da sincronização. Atualizações de registros locais são commitadas somente na branch de infraestrutura autorizada; não alteram a branch do snapshot nem a base remota.

### Conciliação do PR #2 e autorização de integração — 31/10/2026

**Estado efetivo:** conciliação implementada, validada localmente, commitada e enviada; **não integrada nem liberada**. O usuário autorizou a resolução dos conflitos e, depois, a integração do PR em `sprint04` exclusivamente em `embertoni/Athen-Teste`. A aprovação humana exigida pelas convenções continua pendente; autorização de merge e revisão são registros distintos.

**Branch e referências:** `issue/42-sincroniza-sprint04`, primeiro pai `2c3d19dd6b92a44967c950d5bc03b5cb19f42e02`, incorporando o histórico de `origin/sprint04` em `59bfd138bc79fb3ce6513e04a645de2fa64c4c1a`. Commit de conciliação **`d29bc2d2fc1bdff6b5a798651413316caafc5631`**, seguido do registro **`c3d5131e6899f985fabde68c42fbcea8d298e3c8`**, ambos enviados somente à branch do PR no fork, sem force-push. Nenhuma alteração foi feita em `sprint04`, `develop`, `main` ou no repositório original.

**Skills e contexto:** frontmatters canônicos redescobertos; `implement`/`tdd` e apoios para testes nos pontos públicos aprovados, `code-review` com dois agentes somente de leitura nos eixos Padrões/Spec, `pr` para a descrição e `writing-for-agents` para este registro. A revisão considerou a árvore de trabalho, arquivos novos e diferenças contra ambos os pais; não usou diff vazio de HEAD como aprovação. Leituras por seções preservaram questionário e decisões; nenhuma rodada de produto foi reaberta.

| Página/área e arquivos efetivos | Mudança realizada na branch de sincronização |
| --- | --- |
| Rotas: `codigo-base/src/Hub.tsx` | `/ranking` redireciona para `/ligas`, exigindo sessão; preservada tela de Ligas, removida cópia antiga Ranking |
| Amigos: `src/pages/Amigos.tsx`, `Amigos.css` | Mantidos perfil, medalhas, busca, pedidos e lembrete; incorporados cabeçalho, CSS e tokens do fork |
| Cadernos: `src/pages/Notebook.tsx` | Tema/estante do fork combinados com busca sem acentos |
| Salas: `src/pages/Salas.tsx`; `src/data/repositories.ts` | Preservadas aulas/contexto/ranking/código/mural; reincorporada leitura de missões publicadas com falha independente; mantido alias de conclusão legado conciliado automaticamente |
| Editor e perfil: `src/pages/criar-curso/CriarCurso.tsx`, `CriarCurso.css`, `questionConfig.ts`, `EditorConfigQuestao.tsx`; `src/pages/profile/Profile.css` | Preservados ajustes do fork e renomeação de `EditarConfigQuestao` para `EditorConfigQuestao`; imports e links corrigidos |
| CI/setup: `.github/workflows/ci.yml`, `codigo-base/README.md`, `codigo-base/playwright.config.ts`, `scripts/link-skills.sh` | Node 24.19.0 nos dois jobs existentes, README da aplicação, preview exclusivo, builds sequenciais e script de links executável |
| Testes: `codigo-base/tests/e2e/sprint04-reconciliation.spec.ts` | Sete casos novos com sessão/HTTP fictícios: rota, busca em três larguras, perfil/medalhas, missões/aula e falha de leitura |
| Documentação: `docs/README.md`, `arquitetura.md`, `estilo-padrao.md`, `testes.md`, `roteiro-demo-sprint04.md`, `tipos-de-questao.md`, `diagramas/athen-arch-diagram-v1.mmd`, `athen-arch-diagram-v2.mmd`, `relatorio-trabalho-local.md`, `relatorio-sincronizacao-sprint04.md`, `evidencias/sincronizacao-sprint04/` | Caminhos atuais e histórico preservados, limite de escrita explícito, registro por conflito, evidências e limitações |

Os caminhos `src/` da tabela partem de `codigo-base/`. Aula, sidebars, Catálogo, Dashboard e Ligas preservaram seus fluxos completos na resolução. A tabela distingue a conciliação do histórico trazido pelo PR; detalhes dos 25 conflitos e quatro capturas estão no [relatório versionado da sincronização](https://github.com/embertoni/Athen-Teste/blob/c3d5131e6899f985fabde68c42fbcea8d298e3c8/docs/relatorio-sincronizacao-sprint04.md). Nenhuma migração, lockfile ou tipo gerado alterado pela resolução; nenhum SQL executado nesta etapa. O núcleo novo de gamificação permanece planejado, fora deste PR.

**Validação local própria da conciliação:** lint e typecheck aprovados; Vitest 2/2; tipagem dos testes e build aprovados, com aviso de chunk maior que 500 kB; **19 E2E Chromium aprovados**, incluindo sete novos, com rodada final em 20,8s e saída 0. Engines: 278 verificadas, nenhuma incompatível com Node 24.19.0 e 18 incompatíveis com 22.12.0. Hook pre-commit aprovado, sem mudar o código testado. Padrões e Spec: nenhum achado material, inclusive na conferência incremental final; revisão por agentes não substitui aprovação humana.

**Falhas e limites registrados:** primeira rodada E2E invalidada por build geral concorrente que sobrescreveu o build fictício (3 passaram/16 falharam); repetição isolada e rodada final passaram nos 19. Preview passou a exigir servidor exclusivo, com builds sequenciais documentados. Em 360px, a sidebar fixa preexistente deixa a estante estreita; registro visual não homologa responsividade móvel. HTTP controlado não comprova autenticação real, RLS, migrações ou o futuro motor. A tentativa posterior de consultar Actions pelo Edge foi interrompida pela ferramenta por não confirmar a URL com segurança; nenhuma ação de navegador foi aplicada.

**GitHub e autorização reconferidos:** PR #2 em `embertoni/Athen-Teste`, head `c3d5131`, base `59bfd13`, **mergeable=true**. A comparação após conciliação passou de 195 para 60 arquivos, antes do complemento documental; os dois commits não atualizaram a base. Após autorização de integração, o PR foi marcado **pronto para revisão** (`draft=false`), continuando aberto e não integrado. A API retornou **reviews vazias e nenhuma execução de workflow associada ao head**; motivo da ausência de CI ainda não confirmado. A autorização de merge está recebida e preservada, sem alegar cumprimento desses requisitos.

**Retorno ao guia:** árvore da sincronização limpa antes de retornar a `issue/42-testes-banco-gamificacao`, também limpa antes deste registro. Respostas e propostas sem diferenças contra o commit anterior; arquivos-fonte não foram editados. Este fechamento altera somente guia e proposta de encaminhamento, sem repetir testes da aplicação para mudança exclusivamente documental.

**Próxima ação:** obter aprovação de outra pessoa no PR #2 e esclarecer/executar a CI no fork; integrar em `sprint04` usando a autorização já recebida, após os requisitos atendidos. Depois conferir o SHA integrado, conciliar a infraestrutura separada contra essa sprint, validar/publicar seu PR e cumprir suas dependências antes do ticket 04. A autorização atual identifica o PR #2 e não concede automaticamente merge de futuros PRs. Responsáveis/SLAs de pré-publicação continuam adiados.

### Sessão 01 — infraestrutura conciliada após integração do PR #2

**Data/issue/responsável:** 31/10/2026, Codex, issue 42 Em andamento, responsável solicitante. **Estado:** base de sincronização integrada; infraestrutura revalidada localmente, ainda não integrada. O usuário realizou o merge do PR #2 pela página do GitHub e dispensou revisão adicional no Athen-Teste. Essa instrução supera a exigência anterior de aprovação externa neste fork; não altera bancos remotos, o repositório original ou as autorizações de merges futuros.

**Referências e preservação:** API confirmou PR #2 fechado/merged, merge `2d55fd3e6999ccbbd09655e1939f66eabcc00624`; fetch exclusivo de origin confirmou esse SHA em `origin/sprint04`. Branch de infraestrutura em `a51028d98552da4bd1191ae43683d8a18bc9f2e3` estava limpa antes de incorporar a sprint por merge sem commit automático. Único conflito: `codigo-base/README.md`, resolvido preservando setup da aplicação e a seção de banco isolado. Comparação final de `src/`, Playwright e testes E2E com a sprint integrada ficou vazia: nenhuma página foi redesenvolvida nesta entrega. Respostas/propostas continuam preservadas.

| Arquivo/área final | Mudança efetiva nesta retomada |
| --- | --- |
| `codigo-base/README.md` | Conciliação do setup da aplicação com o harness SQL existente, removendo restos do template |
| `.github/workflows/ci.yml` | Preservado job database da infraestrutura, junto de quality/e2e; adicionados push em `sprint*` e `workflow_dispatch`, mantendo Node 24.19.0 e permissions contents:read |
| `docs/convencoes.md` | Exceção explícita de dispensa de revisão adicional somente no Athen-Teste, conforme nova instrução do usuário |
| `docs/testes.md` | Eventos de CI, requisito de branch padrão para dispatch e distinção entre arquivo versionado e execução real |
| Este guia, proposta de PR e tickets 01–03 | Registro da integração da base, nova validação, autorizações e pendências atuais |

**Ambiente e SQL:** Node 24.19.0/npm 12.0.2; Docker 29.9.2 Linux. Projeto exclusivo `athen-gamificacao-test`, container `0a25183e82e6`, label de projeto e porta 55432 conferidas antes do SQL. Banco `postgres` em `127.0.0.1:55432`; variável exclusiva do harness, sem carregar `.env`. Bootstrap reconheceu o manifesto 0001–0022 e não repetiu migrações. Sanidade sob aluno/RLS e concorrência entre dois alunos/salas com privado, ingresso sem matrícula e rollback retornaram 0. Containers parados ao final com volume preservado; nenhum SQL remoto, migração nova ou tipo gerado alterado.

**Testes executados após conciliação:** lint, typecheck, Vitest (dois arquivos/dois testes), test:check, build e test:db:check aprovados. E2E executado depois do build geral, com preview fictício exclusivo e dois workers: **19 passed (28,2s), saída 0**. YAML lido/verificado nos três jobs, gatilhos e versão de Node alinhados. Aviso de bundle maior que 500 kB permanece. Os testes comprovam infraestrutura e fluxos existentes; T01–T05/M01–M09 do novo núcleo continuam planejados.

**Actions observado e configuração:** API pública `/actions/workflows` retornou `total_count=0`, coerente com a página relatada pelo usuário. `ci.yml` está em sprint04, enquanto main, branch padrão, não tem `.github/`. A configuração anterior não disparava por push/merge em sprint, só PRs e pushes em develop/main. A mudança passa a cobrir a sprint, sem mudar main, a branch padrão ou permissões. A [documentação oficial](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows) informa que forks podem precisar habilitar Actions e que dispatch depende do arquivo na branch padrão; essas condições não confirmam sozinhas a causa da listagem vazia. Verificar o resultado real após publicar o PR de infraestrutura; não declarar CI aprovada pela validação local.

**Revisão e preservação:** skill code-review aplicada contra a sprint integrada e árvore efetiva do merge. Padrões sem achados materiais; Spec sem defeito funcional, com dois estados documentais antigos em spec/proposta de PR corrigidos antes da publicação. Nenhuma nova aprovação humana foi exigida. Seis referências documentais tiveram links/cercas conferidos; respostas e propostas mantiveram os três hashes SHA-256 desta retomada, sem diferenças contra o commit anterior. Scripts de produto, migrações e tipos gerados não foram alterados nesta conciliação.

**Encaminhamento:** fechamento técnico concluído; publicação do PR de infraestrutura em execução, com push/PR já autorizados. Aprovação humana adicional dispensada pelo usuário. Merge deste próximo PR ainda requer autorização própria; a autorização anterior identificava o PR #2, agora integrado. Não iniciar o ticket 04 como se os tickets 01/03 já estivessem integrados. Bug legado de `room_members.updated_at` permanece no ticket 05.

**Publicação e CI efetivamente concluídas:** conciliação commitada em **`45d6385a01fb471159f49cefef4d3064fab13c47`**, pais `a51028d` e `2d55fd3`, com hook aprovado e árvore limpa; enviada apenas a `origin/issue/42-testes-banco-gamificacao`. [PR #3](https://github.com/embertoni/Athen-Teste/pull/3) aberto para sprint04 no fork, pronto, sem conflitos; 32 arquivos, 3.907 adições e cinco remoções antes deste fechamento documental, incluindo os quatro documentos aprovados. Nenhum arquivo de página difere da sprint integrada.

Após abrir o PR, `/actions/workflows` passou de zero para um: **CI ativo**, ID `402505603`, caminho `.github/workflows/ci.yml`. Nenhuma configuração remota de Actions, branch padrão ou main foi alterada. A primeira [execução CI `41173674697`](https://github.com/embertoni/Athen-Teste/actions/runs/41173674697), para o commit `45d6385`, terminou com **quality, database e e2e aprovados**. O SQL foi executado no projeto descartável do runner Linux, container `9092a189a3a8` e endpoint local 127.0.0.1:55432, confirmados pelo harness; sanidade, concorrência e parada sempre executada passaram. Isso comprova a execução remota desta infraestrutura, sem alterar bancos compartilhados ou homologar o futuro núcleo.

**Próxima ação concreta:** este fechamento documental registra os resultados da CI do commit de código acima e será enviado ao mesmo PR. Depois, integrar o PR #3 somente quando autorizado, buscar a sprint resultante e iniciar o ticket 04 em branch derivada dela. A dispensa de revisão adicional já está vigente, sem nova solicitação de revisor. Containers locais permanecem parados com volume preservado; nenhuma pendência operacional de pré-liberação foi antecipada.

### Fechamento autorizado do PR #3 e pausa — 31/10/2026

**Instrução recebida:** realizar o merge do PR #3 em sprint04, finalizar as pendências desta entrega e pausar o desenvolvimento. Este registro é incluído no próprio PR antes do merge; sua incorporação na sprint deve ser confirmada pelo estado `merged` no [GitHub](https://github.com/embertoni/Athen-Teste/pull/3) e pelo histórico local atualizado, sem antecipar um SHA de merge ainda não criado. Após essa integração, a infraestrutura dos tickets 01–03 está disponível na base; ticket 04 permanece sem implementação e não será iniciado durante a pausa.

**Evidência já concluída:** commit de código `45d6385a01fb471159f49cefef4d3064fab13c47`, com quality/database/e2e aprovados na CI Linux `41173674697`. Fechamento documental `39f5c34628c2464f19b4d53895b9110dcd858395` também aprovado nos três jobs na [CI `41173981306`](https://github.com/embertoni/Athen-Teste/actions/runs/41173981306). E2E Linux: 19 testes aprovados em 16,6s na primeira execução. O resultado de qualquer execução disparada por este último registro será conferido no PR antes da integração; nenhum código executável está sendo alterado.

**Correção da descrição do PR:** identificada saída CP1252 do Python durante o envio anterior, com 103 caracteres de substituição `�` no corpo remoto. Fonte local UTF-8 preservada; republicação por JSON ASCII com escapes Unicode e argumento estruturado ao conector. Título e corpo foram relidos do GitHub e comparados integralmente com o esperado, sem caracteres de substituição; mantidos links da CI, head e base. Para novos envios, usar esse transporte ou UTF-8 explícito, sem depender da codificação padrão do console Windows. Este registro relata a falha; o caractere citado aqui não indica corrupção do arquivo.

**Escopo deste fechamento:** somente guia, estado da spec, proposta de PR e observação de retomada do ticket 04. Não alterar código, SQL numerado, tipos gerados, lockfile, respostas ou propostas literais. Nenhum commit direto em sprint04/develop/main, reset, force-push ou exclusão de branches. Atualizar a sprint local apenas por fast-forward após o merge; preservar as branches da entrega. A descrição do PR será atualizada em Unicode com o resultado efetivo do merge, sem criar outro PR de desenvolvimento.

**Ambiente para a pausa:** projeto descartável `athen-gamificacao-test`, configuração `codigo-base/tests/db/supabase/config.toml`, runtime ignorado em `.supabase-test/`, banco em 127.0.0.1:55432. Containers locais estavam parados com volume preservado no fechamento anterior; reconferir antes de encerrar. Não descartar volumes ou dados locais nesta pausa. Runners da CI são descartáveis; nenhuma ação em banco remoto, credenciais compartilhadas ou produção é autorizada.

**Pendências preservadas para depois:** implementação do ticket 04 (confirmação imutável, livro de créditos e concorrência de finalização); ticket 05 para o trigger legado `room_members.updated_at`; navegação móvel/estante limitada pela sidebar fixa em 360px; demais etapas e T01–T05/M01–M09 do núcleo; designações/SLAs operacionais adiados para pré-publicação. Nenhuma dessas pendências foi resolvida ou declarada homologada neste fechamento. Implantação continua fora do escopo.

**Checklist de retomada, somente após nova solicitação:**

1. Ler cabeçalho deste guia, este fechamento, 3.1/3.6 e ticket 04; consultar respostas apenas por ID quando necessário, sem repetir o questionário.
2. Conferir git status/branch e remotos. Buscar exclusivamente origin; confirmar que PR #3 está merged em sprint04 e preservar qualquer alteração local nova. O push URL de upstream continua `disabled://upstream-read-only`.
3. Criar a próxima branch de issue a partir da sprint04 atualizada, por exemplo `issue/42-finalizacao-imutavel`; ainda não criada neste fechamento.
4. Antes de SQL, retomar o projeto de teste pelo README, conferir projeto/container/label/porta e manifesto; nunca apontar o harness a banco remoto.
5. Executar a primeira fatia do ticket 04 pela entrada pública aprovada, com teste vermelho/verde e registro de escopo. A integração das dependências não declara o novo motor implementado.

**Estado de parada:** pausa solicitada e instrução de fechamento recebida; encerramento após merge autorizado, conferência da CI/refs e árvore local limpa. A próxima ação de desenvolvimento depende de o usuário pedir a retomada, não de uma nova pergunta de produto ou de revisão humana adicional.

### Sessão 02 — fatia 04.1: confirmação persistida da tentativa

**Retomada/issue/base:** usuário solicitou continuar após a pausa; issue 42, solicitante responsável, Em andamento, sprint04. PR #3 confirmado merged em `1ab3f9f42056e99aea7a52f21ccc406c3c2bcf0f`; fetch de origin confirmou a mesma base. Árvore inicialmente limpa. Branch criada `issue/42-finalizacao-imutavel`, sem implementação direta na sprint. A divisão do ticket 04 foi registrada em 04.1 para manter uma entrega executável; o ticket principal segue aberto nos critérios de livro decimal/ordinal/snapshot.

**Skills/interfaces:** descrições canônicas redescobertas; implement, TDD com apoios e codebase-design aplicados às interfaces públicas já aprovadas: RPC de aprendizagem em Postgres real e percurso React/HTTP. Code-review em Padrões/Spec por agentes somente de leitura; nenhuma aprovação humana adicional exigida. Questionário não recarregado e respostas não editadas. Documentos do assunto e chamadores atuais conferidos antes do código.

| Área/arquivo efetivo | Mudança nesta branch |
| --- | --- |
| `codigo-base/supabase/migrations/0023_persist_attempt_confirmations.sql` | learning_results com RLS; finalizador antigo movido para athen_private; wrapper público preserva assinatura, recusa incompletas e persiste confirmação junto dos efeitos; leitura própria get_attempt_confirmation e escrita save_attempt_answer com ordem de locks consistente |
| `codigo-base/src/data/repositories.ts` | Campos de entrada limitados às colunas permitidas; salvar encaminha à RPC; finalização tenta reconsulta após erro e só devolve sucesso com confirmação oficial |
| `codigo-base/src/pages/CrudConsole.tsx` | Rejeita config JSON nula, compatibilizando o consumidor com o esquema realmente gerado |
| `codigo-base/src/types/database.ts` | Regenerado pelo CLI do schema local public 0001–0023; saída UTF-8 sem BOM, arquivo anterior UTF-16LE |
| `codigo-base/tests/db/learning.sql` | Reenvio estável após edição, instante persistido, permissões, incompletude, legado e falha de persistência com rollback e repetição válida |
| `codigo-base/tests/db/learning-concurrency.ts` | Dois PIDs em locks antes de liberar: finalização/finalização e resposta/finalização, uma confirmação e 4 XP; fixtures próprias removidas após os workers |
| `codigo-base/scripts/run-db-tests.ts`, `package.json`, `.github/workflows/ci.yml` | Comandos learning e learning:concurrency, incluídos no job database |
| `codigo-base/tests/e2e/dashboard.spec.ts` | Retorno de finalização perdido com reconsulta oficial e ausência de confirmação mantendo erro; HTTP/sessão fictícios, captura do resultado |
| `codigo-base/README.md`, `docs/arquitetura.md`, `docs/banco-de-dados/documentacao-bd.md`, `docs/testes.md` | Comandos, entradas, proteção, geração dos tipos e limites reais |
| Spec, contratos, tickets 04/04.1, [proposta de PR](../../.scratch/gamificacao/pr-confirmacao.md) e este guia | Retomada, recorte incremental e evidências, sem marcar a sessão ou ticket principal completos |
| `docs/evidencias/finalizacao-imutavel/confirmacao-recuperada.png` | Captura do resultado recuperado no E2E com dados fictícios |

**Baseline e TDD reais:** Docker Desktop estava parado; inicializado e servidor 29.9.2 Linux confirmado. Projeto exclusivo athen-gamificacao-test em 127.0.0.1:55432, label/workdir/porta conferidos; sem .env ou bancos remotos. Baseline 0001–0022 e sanidade passaram no container `317432586d3b`. Teste vermelho pela RPC existente: após 1/1 e 4 XP, editar questão e reenviar devolvia 0/1 e 0 XP. A migração 0023 fez esse mesmo caso passar, sem recorreção ou duplicação do saldo.

**Instalação isolada e tipos:** manifesto alterado exigiu recriar somente esse projeto fictício, com nome/label e caminho absoluto previamente verificados. 0001–0023 aplicadas do zero; legados v1/v2 e seed.sql não executados. Último container `d264e2ac1f34`, mesma porta/projeto. Geração: Supabase CLI 2.121.0, `gen types typescript --db-url postgresql://postgres:postgres@127.0.0.1:55432/postgres?sslmode=disable --schema public`; TLS inicial recusado pelo servidor local, opção limitada a esse comando. Tipos não editados manualmente; saída normalizada automaticamente removendo espaços finais de quatro linhas. Mudança de formato/encoding vem da regeneração, e JSON não nulo exigiu o guard no CrudConsole.

**SQL validado:** learning passou sob aluno/RLS; incompleta não fecha nem paga, campos oficiais/implementação privada/resultado alheio recusados, conta inativa sem confirmação, edição legítima do perfil preservada. Falha injetada na gravação reverte saldo/tentativa/confirmação; removida a falha, execução confirma uma vez. Legado é rotulado e não repago. Corrida entre duas finalizações e corrida resposta/finalização passaram com conexões reais e observação dos waiters em pg_locks. Não são prova de unicidade entre tentativas distintas.

**E2E vermelho/verde:** antes do adapter, recuperação de retorno perdido falhou e ausência de confirmação passou; após reconsulta oficial, ambos passaram (2/2, 17,3s). A primeira tentativa de iniciar o E2E foi barrada por tipos gerados não nulos; guard do consumidor corrigiu, sem tratar erro de build como vermelho de negócio. HTTP controlado não comprova RLS, que foi testada no SQL.

**Revisão e ajustes:** Padrões identificou inversão de locks entre UPDATE direto de answers e finalização; corrigida com RPC de escrita que bloqueia a tentativa primeiro e retirada do UPDATE direto. Nova corrida real passou; conferência incremental sem achado material. Spec não encontrou desvio no subticket e pediu retirar o cache incidental cli-latest do diff; ele será restaurado ao valor inicial após as últimas chamadas do CLI. Lint intermediário apontou throw no finally da limpeza do teste, corrigido por extração do cleanup; nenhuma regra de lint foi desativada.

**Fechamento local concluído:** após o ajuste final de locks e regeneração, lint, typecheck, Vitest (2/2), test:check, build e test:db:check aprovados. E2E geral em sequência após o build: **21 passed (29,6s), saída 0**. Sanidade, concorrência anterior, learning e learning:concurrency finais retornaram 0 no schema 0001–0023. Aviso preexistente de bundle maior que 500 kB permanece. [Captura de confirmação recuperada](../evidencias/finalizacao-imutavel/confirmacao-recuperada.png) conferida, com dados fictícios. Projeto local parado com banco preservado; somente o cache cli-latest produzido por nossas chamadas foi restaurado ao valor inicial. Publicação/CI desta branch ainda não realizadas; validação local não foi declarada remota.

**Limites e próxima fatia:** cálculo inteiro/anti-regrind legado preservado por uma entrada pública, sem uma segunda autoridade nova de pagamento. Ainda pendentes no ticket 04: snapshot no início, primeiros envios/ordinal, versão editorial, abertura auditada/livro decimal, unicidade entre tentativas diferentes e fechamento dos demais contadores. Ticket 05 e demais sessões/pendências operacionais preservados. Só encaminhar 04.1 quando os checks finais passarem; não aplicar migração remota, fazer deploy ou integrar novo PR sem autorização própria.

**Versionamento e publicação efetivos — 31/10/2026:** commit `3d4457b5910decb4c937ff2c9e6a6641be16a383`, `fix: preserva confirmacao de tentativa finalizada`, 21 arquivos na branch da issue. Hook lint-staged/ESLint aprovado; comparação com o index salvo pelo hook confirmou ausência de mudanças adicionais. Diff sem erros de whitespace, links/fences conferidos e três fontes literais preservadas por SHA-256. Push sem força somente para origin, URL de escrita conferida como embertoni/Athen-Teste. [PR #4](https://github.com/embertoni/Athen-Teste/pull/4) aberto, base sprint04 `1ab3f9f`, sem conflitos e sem merge. Leitura remota confirmou descrição idêntica à proposta, acentos íntegros e ausência de U+FFFD.

**CI remota efetiva:** [execução 41221816477](https://github.com/embertoni/Athen-Teste/actions/runs/41221816477), commit `3d4457b`, com **quality, database e e2e aprovados**. Logs conferidos: schema 0001–0023 instalado no container descartável `d6239a9b0e4b`, projeto athen-gamificacao-test em 127.0.0.1:55432; sanidade, concorrência anterior, confirmação/rollback e ambas as corridas de aprendizagem passaram. Chromium **21 passed (18,5s)**. Job database parou o projeto ao encerrar. Este fechamento documental não altera código e terá o head remoto novamente conferido após o push.

**Ponto de dependência:** 04.1 entregue em PR, ainda não integrada. Aguardar autorização específica para integrar o PR #4 antes de abrir a próxima branch dependente a partir da sprint atualizada. Dispensa de revisão humana adicional mantida; a pendência é de autorização de merge. Nenhum banco remoto, deploy ou escrita no original foi realizado.

### Sessão 02 — fatia 04.2: campos oficiais do perfil

**Retomada/branch/base:** usuário confirmou o merge do PR #4 e solicitou continuar. GitHub confirmou merged=true em 31/10/2026, commit `da2386732b96581e3d6e4f2bdfe1739dbbc2a00b`; fetch/pull --ff-only de origin atualizou a sprint04 local para esse SHA. Árvore inicialmente limpa. Nova branch `issue/42-protege-campos-perfil`, issue real 42, solicitante responsável, Em andamento. PR #4 integrado encerra a dependência anterior; não autoriza merge do próximo PR. Upstream continua com pushurl disabled://upstream-read-only.

**Entrega e skills:** impedir escrita de XP/nível/streak e demais campos oficiais por edição de perfil, preservando fluxos legítimos. Frontmatters canônicos redescobertos; implement/TDD, apoios de testes/mocking, codebase-design e pr aplicados. Revisão code-review com dois agentes somente de leitura nos eixos Padrões/Spec, adaptada ao diff WIP + arquivos novos contra a base real, conforme 3.3. Interfaces de segurança/projeções e React/HTTP já aprovadas; nenhuma decisão de produto reaberta ou questionário recarregado.

| Página/área e arquivos efetivos | Mudança realizada nesta branch |
| --- | --- |
| `codigo-base/supabase/migrations/0024_protect_profile_fields.sql` | Grants de perfil limitados a SELECT e UPDATE pessoal; sem INSERT/DELETE/TRUNCATE ou campos oficiais pelo browser. Helpers de streak/medalha internos. Cadastro não concede admin por metadata; papel de serviço confiável pode provisionar cargo |
| `codigo-base/src/data/repositories.ts` | Entrada de edição limitada às seis colunas pessoais; removidos criar/deletar perfil diretamente, sem chamador legítimo de criação |
| `codigo-base/src/pages/CrudConsole.tsx` | Apenas edição na lista de perfis; criação continua pelo Auth e outros CRUDs conservam suas ações. Desativação própria segue Configurações/RPC |
| `codigo-base/supabase/seed.sql` | Seed fictício inspecionado; provisiona cargos da lista fixa por escrita privilegiada, sem depender de metadata administrativa. Orientação de ensaio local com rollback |
| `codigo-base/tests/db/permissions.sql`, `tests/db/seed.sql` | Negação por papéis reais, mistura de campos, reset por exclusão/recriação, metadata, provisionamento confiável, edição/estudo/desativação; seed real executado duas vezes com rollback |
| `codigo-base/tests/e2e/profile-permissions.spec.ts` | Edição de Perfil, Configurações e lista de perfis do CRUD; payload pessoal e feedback com HTTP/sessão fictícios |
| `codigo-base/scripts/run-db-tests.ts`, `package.json`, `.github/workflows/ci.yml`, README | Novos comandos test:db:permissions e test:db:seed, ambos no job database; guards de destino preservados |
| Docs de banco/arquitetura/testes, spec/contratos/tickets e este guia | Estado de 04.1 integrada, 04.2 incremental, limites, caminhos e evidências |
| `docs/evidencias/campos-oficiais-perfil/`, [proposta de PR](../../.scratch/gamificacao/pr-perfil.md) | Capturas fictícias de perfil editado e tabela do CRUD; descrição preparada com a skill pr |

**TDD observado:** baseline 0001–0023 recriada no projeto fictício após o marcador recusar manifesto normalizado de LF para CRLF no checkout (0023 antes 3773863ffe06, bytes atuais 3c9c287370bc; sem editar SQL histórico). SQL vermelho de aluno alterou XP para 900; grants por coluna fizeram passar. Próximo vermelho demonstrou fabricação de atividade por touch_streak; retirada de EXECUTE público fez passar. Cadastro com metadata admin produziu administrador no vermelho; nova função preserva student/educator e neutraliza admin/inválido. Candidatas iniciais ensaiadas em transação totalmente revertida, sem mudar a baseline marcada; script de apoio permanece ignorado em .supabase-test.

**Revisão e correções reais:** Spec encontrou reset de campos oficiais por DELETE + INSERT de administrador autenticado; teste vermelho reproduziu a exclusão, e grants finais retiram ambas as operações. Adapter e botão Apagar de perfis foram retirados juntos. Padrões encontrou incompatibilidade no seed que criava admin via metadata; teste vermelho executou o seed real e is_admin retornou falso. Escrita privilegiada da lista fixa corrigiu; reaplicação passou. Revisões incrementais dos dois eixos sem novo achado material. O ciclo completo de exclusão de conta não foi implementado por esse ajuste.

**Instalação e SQL finais:** projeto exclusivo athen-gamificacao-test, configuração/label/workdir/porta confirmados; Postgres 127.0.0.1:55432, último container `28f3a7f55c6c`. Reinstalação numerada 0001–0024 do zero; 0024 hash 4fb1f4fda8c2. Legados v1/v2 não aplicados; seed.sql excluído do bootstrap e executado separadamente só no ensaio transacional inspecionado. Permissions, seed duas vezes, sanidade, learning, concorrência anterior e ambas as corridas de aprendizagem retornaram 0. Conexão confiável de teste não foi confundida com autorização de aluno/admin autenticado.

**Pipeline e consumidores:** lint, typecheck, Vitest 2/2, test:check, build e test:db:check aprovados; suíte Chromium completa **24 passed (29,4s)**. Primeiro E2E de Configurações falhou por seletor exato ignorar o texto de ajuda no nome acessível; seletor corrigido, sem alterar a página, e três focais passaram (19,7s). Isso é correção do teste, não vermelho de negócio. Aviso preexistente de bundle maior que 500 kB permanece. Sem mudança de colunas/assinaturas públicas em 0024: database.ts gerado em 04.1 preservado, sem edição manual ou regeneração desnecessária.

**Fechamento do ambiente:** Supabase local parado com saída 0 e volume preservado. Cache CLI sem diff e estado local/fixtures/credenciais fora do versionamento. [Perfil editado](../evidencias/campos-oficiais-perfil/perfil-editado.png) e [tabela de perfis sem exclusão](../evidencias/campos-oficiais-perfil/crud-perfis.png) registrados com dados fictícios. Após a suíte completa, os três focais passaram novamente (15,6s) para capturas; a captura de CRUD foi enquadrada na própria tabela, pois a primeira imagem da página não mostrava a área alterada.

**Versionamento e PR efetivos:** commit `a89d1ebb40ad457c1d9cc8752afd7d7ced0639f6`, `fix: protege campos oficiais do perfil`, 23 arquivos. Hook lint-staged/ESLint aprovado sem mudanças adicionais, confirmado contra o index salvo. Fontes literais preservadas por SHA-256, links/fences e diff --check aprovados. Push sem força somente para origin, URL de escrita embertoni/Athen-Teste conferida. [PR #5](https://github.com/embertoni/Athen-Teste/pull/5) aberto contra sprint04 `da23867`, sem conflitos e sem merge; leitura remota confirmou corpo idêntico, acentos íntegros e ausência de U+FFFD.

**CI remota efetiva:** [execução 41233522556](https://github.com/embertoni/Athen-Teste/actions/runs/41233522556), commit `a89d1eb`, aprovou **quality, database e e2e**. Logs conferidos: migração 0024 hash 4fb1f4fda8c2 no container descartável `92f016212e73`, athen-gamificacao-test em 127.0.0.1:55432; permissions, seed real duas vezes com rollback e regressões/concorrências passaram. Chromium **24 passed (21,6s)**; parada do projeto pelo job concluída. Fechamento documental será enviado à mesma branch e o head final terá a CI novamente conferida.

**Limites e próxima ação:** 04.2 entregue no PR #5, ainda não integrada. Aguardar autorização própria para integrar antes da próxima branch dependente, sem exigir outra revisão humana. Livro decimal/abertura auditada, snapshot/publicação, primeiro envio/ordinal, unicidade entre tentativas distintas, matrícula/progresso e correção de sala seguem pendentes. Nenhum banco remoto, produção, credencial compartilhada ou original recebeu alteração.

### Sessão 02 — fatia 04.3: preservar o primeiro envio gravado

**Retomada/issue/base:** usuário informou o merge manual do PR #5 e solicitou continuar. GitHub confirmou merged=true em `40016e73139ee06b4abdaeab08983e1b624256ee`; fetch/pull --ff-only atualizou sprint04 para a mesma base, árvore inicialmente limpa. Branch criada `issue/42-primeiro-envio`, issue real 42, solicitante responsável, Em andamento. Commits/push/PR continuam autorizados somente no fork; integração do próximo PR exige autorização própria.

**Entrega e skills:** preservar o primeiro conteúdo recebido por tentativa/questão, sem substituí-lo no reenvio, e usar essa resposta no feedback do modal. Frontmatters canônicos redescobertos; implement/TDD com apoios, codebase-design e revisão code-review nos dois eixos somente de leitura aplicados. Interfaces Postgres e React/HTTP já aprovadas; leituras por seção sem recarregar questionário ou reabrir produto. A marca de recebimento não ativa ordinal ou crédito novo.

| Página/área e arquivos efetivos | Mudança nesta branch |
| --- | --- |
| `codigo-base/supabase/migrations/0025_preserve_first_submission.sql` | first_submitted_at novo com NULL para legado e default apenas para inserts novos; RPC retorna linha existente sob lock da tentativa; trigger impede alteração de conteúdo/instante/identidade e nega INSERT por conta inativa |
| `codigo-base/src/components/lesson/LessonModal.tsx` | Feedback usa salva.submitted; após envio mostra a resposta registrada, em vez de manter uma escolha local divergente. Resumo legível para os quatro formatos; soma mostra o valor recebido sem reconstruir seleção |
| `codigo-base/src/data/repositories.ts`, `src/types/database.ts` | Contrato de reenvio documentado; tipos regenerados do schema local 0001–0025, sem edição manual |
| `codigo-base/tests/db/first-submissions.sql` | B → reenvio A preserva B e finaliza 0/1, zero XP; identidade/instante, nova tentativa, legado desconhecido, escrita proibida e conta inativa |
| `codigo-base/tests/db/learning-concurrency.ts`, `scripts/run-db-tests.ts` | Terceira corrida, dois envios diferentes sob locks reais: ambos recebem uma resposta/instante, sem XP ou conclusão apenas por enviar |
| `codigo-base/tests/db/learning.sql` | Fixture do teste de rollback já começa com a resposta correta; não depende de substituir o primeiro envio. Erro → reenvio diferente fica coberto pelo novo teste específico |
| `codigo-base/tests/e2e/dashboard.spec.ts` | Retorno perdido com reenvio diferente e feedback da resposta preservada; texto, soma e associação também exercitados por HTTP fictício |
| package.json, CI e README | Novo test:db:first-submissions no job database; concorrência inclui os três percursos |
| Docs de banco/arquitetura/testes, spec/contratos/tickets e este guia | Merge de 04.2 registrado; 04.3 incremental, rastreabilidade e limites |
| `docs/evidencias/primeiro-envio/primeiro-envio-preservado.png`, [proposta de PR](../../.scratch/gamificacao/pr-primeiro-envio.md) | Captura fictícia conferida do feedback da resposta preservada; encaminhamento preparado pela skill pr |

**TDD e ambiente reais:** baseline restaurada recusou manifesto após o checkout normalizar 0024 para CRLF (agora 329603200763), sem alterar SQL histórico. Projeto fictício recriado após conferir caminho absoluto .supabase-test, label e porta; baseline 0001–0024 no container `bfaeae3b03cf`. Teste vermelho pela RPC real: reenvio substituiu a primeira resposta. Candidata 0025 ensaiada em transação revertida e fez passar, incluindo legado desconhecido, nova tentativa e compatibilidade da correção. Não executar as candidatas no banco remoto; script auxiliar permanece ignorado.

**E2E vermelho/verde:** primeiro ensaio parou em seletor que ignorava o indicador de seleção no nome acessível; corrigido o seletor, vermelho de negócio mostrou feedback da nova escolha local A em vez de B preservado. Ajuste para salva.submitted fez passar (1/1, 17,4s), com resumo “Resposta registrada: Resposta B”. Casos de texto/soma passaram; associação exigiu ajustar seletor ao nome acessível e passou isoladamente (15,5s). Esses ajustes de seletor não foram tratados como vermelhos de produto.

**SQL e tipos:** última instalação do zero 0001–0025 no container `c44595dd01c1`, athen-gamificacao-test em 127.0.0.1:55432; hash 0025 ec529931e07e. Primeiro envio, learning/rollback, três corridas, sanidade, permissões, seed revertido e concorrência anterior passaram. Tipos gerados via Supabase CLI 2.121.0 e comando local documentado com sslmode=disable. Saída UTF-16 do terminal normalizada automaticamente para UTF-8 sem BOM/espaços finais; diff somente da coluna nullable na tabela/retorno da RPC. Lint inicial encontrou o artefato temporário UTF-16 com extensão .ts; preservado como .raw.txt fora das fontes, sem mudar regra de lint.

**Fechamento local concluído:** lint, typecheck, Vitest 2/2, test:check, build e test:db:check aprovados; E2E completo em sequência, **28 passed (31,6s), saída 0**. SQL focal adicional recusou timestamp forjado pelo cliente. [Captura de primeiro envio preservado](../evidencias/primeiro-envio/primeiro-envio-preservado.png) conferida em 1280×720, com dados fictícios: resposta B registrada, feedback de erro e resposta esperada A. Supabase parado com saída 0, preservando volume; cache CLI sem diff e runtime/artefatos não selecionados para versionamento. Aviso preexistente de bundle maior que 500 kB permanece.

**Revisão e limites:** Padrões sem achado material; Spec sem desvio no recorte, conferidos diff WIP e arquivos novos contra a base real. Ordinal entre tentativas/contextos, snapshot/publicação, autorização completa de início/contexto, retomada entre sessões, livro decimal/abertura auditada, unicidade entre tentativas diferentes e demais contadores continuam pendentes. Linhas antigas preservam apenas o valor conhecido no corte; não foi reconstruído primeiro envio perdido. Nenhum novo mecanismo de pagamento ou SQL remoto. Publicação/CI desta branch ainda pendentes; integração exigirá autorização própria, sem nova revisão humana adicional no fork.

**Versionamento e publicação efetivos:** commit `cbb88922fdf8ef7a77aee890ada61210650cb5a0`, `fix: preserva o primeiro envio da resposta`, 23 arquivos. Hook lint-staged/ESLint aprovado sem mudança adicional, comparado ao index salvo. Respostas/propostas literais preservadas por SHA-256; links/fences/diff --check aprovados. Push sem força somente para origin, URL de escrita embertoni/Athen-Teste conferida. [PR #6](https://github.com/embertoni/Athen-Teste/pull/6) aberto, base sprint04 `40016e7`, sem conflitos e sem merge. Descrição lida remotamente: idêntica ao corpo preparado, acentos íntegros, sem U+FFFD.

**CI remota efetiva:** [execução 41237327029](https://github.com/embertoni/Athen-Teste/actions/runs/41237327029), commit `cbb8892`, aprovou **quality, database e e2e**. Logs conferidos: schema 0001–0025, hash 0025 ec529931e07e, container descartável `0956cb3d38fe`, projeto athen-gamificacao-test em 127.0.0.1:55432. Primeiro envio, regressões e três corridas passaram; Chromium **28 passed (22,5s)**. Projeto parado pelo job. Fechamento documental será enviado à mesma branch e a CI do head final conferida novamente.

**Próxima ação dependente:** aguardar autorização própria para integrar o PR #6 antes da próxima branch dependente. Não exigir nova revisão humana neste fork nem aplicar migrações remotas. A entrega não encerra o ticket 04, a sessão 02 ou o sistema de missões/ligas/PAC.

### Pausa e passagem para o Kiro — 31/10/2026

**Pedido e integração:** usuário confirmou o merge manual do PR #6 e solicitou pausar por proximidade do limite semanal de créditos, preparando uma nova sessão na CLI do Kiro. GitHub confirmou merged=true às 20:18:14 UTC, commit `dbeae27016f09a4bbffc4852e770214ad3c248b8`. Fetch de origin e pull --ff-only atualizaram sprint04 para esse SHA; árvore do merge idêntica à do head final validado `829f25f` (tree fbf404caff1924168af2cbc94f957f96b5375934). A pendência anterior de integração de 04.3 foi atendida, sem iniciar próximo subticket.

**Estado local de passagem:** branch `issue/42-retomada-kiro`, criada dessa sprint e sem commits próprios. Árvore inicialmente limpa; somente cinco documentos foram preparados: [prompt completo](retomada-kiro.md), cabeçalho/registro deste guia, estado de spec/contratos e integração do ticket 04.3. Alterações documentais locais intencionalmente sem commit/push/PR novo, para preservação e continuidade na próxima sessão. Nenhuma alteração em código, configuração executável, skills canônicas ou KIRO.md/steering.

**Conteúdo entregue:** prompt com leitura inicial, issue/sprint/autorização persistentes, proibição de escrita no original, confirmação dos PRs integrados, limites de 04.3, fontes por seção, skills e adaptação às capacidades reais do Kiro. Recomenda avaliar um próximo recorte de início autorizado, sem criar o ticket 04.4 ou fixar novo escopo antecipadamente. Registra ambiente local parado, migrações 0001–0025, testes anteriores, cuidados de manifesto CRLF/LF, encoding e critérios de validação/publicação/merge.

**Validação documental:** caminhos/links/fences, estado Git, referências de merge/CI e afirmações contra fontes existentes; sem nova execução da aplicação ou SQL. Última CI conferida do head do PR #6: [41237787369](https://github.com/embertoni/Athen-Teste/actions/runs/41237787369), três jobs aprovados e 28 E2E (20,9s). CI do commit de merge não consultada nesta preparação. Respostas/propostas literais preservadas. Supabase não foi iniciado; nenhuma alteração remota, além de leituras Git/API, ou nova publicação foi realizada.

**Retomada:** iniciar nova sessão do Kiro no mesmo checkout e executar o prompt indicado, preservando estas alterações documentais. Conferir novamente base/estado, redescobrir skills e selecionar uma entrega pequena conforme os critérios abertos do ticket 04. Falta de ferramenta específica deve ser distinguida de bloqueio de produto; somente contradição ou dado indispensável novo exige input. Desenvolvimento permanece pausado até a nova solicitação de retomada.

### Sessão 02 — fatia 04.4: início autorizado da tentativa

Data/responsável: 01/11/2026, Kiro CLI; solicitante responsável pela issue. Estado: implementado e validado localmente; publicação/PR/CI ainda pendentes.

Issue real 42, sprint04, Em andamento. Ticket local [04.4](../../.scratch/gamificacao/issues/04-4-inicio-autorizado-tentativa.md), primeiro item pendente do ticket 04 (retomada seção 5). Critério: o início da tentativa deixa de ser INSERT direto do cliente e passa a derivar o usuário de `auth.uid()` e validar coerência e acesso ao contexto no servidor, espelhando a autoridade de `finalize_attempt`. Ponto de teste acordado: função SQL `start_attempt` pelo harness em transação revertida (seam principal) e migração do consumidor `tentativaRepository.iniciar`. Skills: `implement`, `tdd` e `code-review` (dois eixos, por subagentes de leitura). Base: sprint04 em `dbeae27`; branch de preparação `issue/42-retomada-kiro` renomeada para `issue/42-inicio-autorizado`, sem commits próprios antes desta fatia, preservando os cinco documentos da passagem.

#### Início de tentativa — banco e cliente
| Arquivo final | Operação | O que mudou de fato | Branch/commit de origem |
| --- | --- | --- | --- |
| `codigo-base/supabase/migrations/0026_authorized_attempt_start.sql` | criado | `start_attempt(p_lesson_id,p_course_id,p_room_id)` SECURITY DEFINER: deriva usuário/curso, valida conta ativa, coerência e acesso (mesma autoridade de 0023), cria a tentativa com campos oficiais zerados; `revoke insert on public.attempts from authenticated` | `issue/42-inicio-autorizado` `75bb67b` |
| `codigo-base/src/data/repositories.ts` | alterado | `iniciar` chama a RPC `start_attempt` sem enviar `user_id`; método `criar` (INSERT direto) removido, tipo `CreateTentativaInput` retirado | mesma |
| `codigo-base/src/types/database.ts` | gerado | acrescenta somente `start_attempt` (retorno da linha de `attempts`); schema local 0001–0026, sem edição manual | mesma |
| `codigo-base/tests/db/start-attempt.sql`, `scripts/run-db-tests.ts`, `package.json` | criado/alterado | teste SQL do início autorizado e flag/comando `test:db:start-attempt` | mesma |
| `codigo-base/tests/db/learning.sql` | alterado | asserção do contrato antigo (INSERT direto autorizado) substituída pela recusa do INSERT direto e início via `start_attempt`; fixture da injeção de falha semeada como superusuário | mesma |
| `codigo-base/tests/e2e/dashboard.spec.ts` | alterado | mock da RPC `start_attempt` no fluxo de aprendizagem | mesma |
| `docs/banco-de-dados/documentacao-bd.md`, `docs/testes.md` | alterado | fatia 04.4, linha de regra de início, faixa 0001–0026 e comando de teste | mesma |

Validações executadas: TDD real em Postgres local `athen-gamificacao-test` (0001–0026). Vermelho: `function public.start_attempt(...) does not exist`. Verde após 0026; `test:db:start-attempt` aprovado com recusas de código específico (42501) e tentativa iniciada pelo servidor finalizando 1/1 e 4 XP. Pipeline da aplicação aprovado: lint, typecheck, test:run (2/2), test:check, test:db:check, build. E2E **28 passed (~22s)**. SQL: start-attempt, learning, first-submissions, permissions, sanity, concurrency, learning-concurrency, seed — todos aprovados. Tipos regenerados (diff = somente `start_attempt`).

Evidências e limitações: revisão em dois eixos por subagentes de leitura, sem achado de alta severidade; divergência de código de erro apontada foi corrigida (coerência de curso agora 42501, igual a `finalize_attempt`) e os testes negativos passaram a fixar o código. Migrações aplicadas: 0026 (expand); attempts existentes e o caminho de finalização permanecem válidos. Estado: validado localmente. Pendências: publicação/PR/CI desta branch; snapshot/versão no início, ordinal, livro decimal, segunda autoridade de pagamento e demais contadores continuam pendentes no ticket 04; defeito legado `room_members.updated_at` segue no ticket 05. Próxima ação: abrir PR no fork contra sprint04 e conferir a CI real; integração exigirá autorização própria. Comando de validação: pipeline de [Testes](../testes.md) mais `npm run test:db:start-attempt`.

### Sessão 02 — fatias 04.5 (versões) e 04.6 (ordinal + livro decimal)

Data/responsável: 01/11/2026, Kiro CLI; solicitante responsável pela issue 42, sprint04, Em andamento.

**Integradas antes desta retomada.** A fatia 04.4 (início autorizado) foi integrada pelo **PR #7** e a 04.5/F1 (versões avaliáveis da aula, migração 0027) pelo **PR #8**, ambos verdes na CI, deixando `origin/sprint04` em `c1c4840`. Isso encerra a pendência de publicação registrada no bloco anterior; não refazer 04.4/04.5.

**Fatia 04.6 — ordinal do primeiro envio e livro de créditos decimal (F2 da Sessão 02).** Ticket local [04.6](../../.scratch/gamificacao/issues/04-6-ordinal-e-livro-decimal.md). A pedido do usuário, o recorte foi ampliado para fechar o núcleo da Sessão 02 num só PR, em vez de fatiar mais. Decisão de escopo confirmada: ordinal do **primeiro envio** (opção A), não do primeiro acerto; contexto = (curso, sala). Skills: `implement`, `tdd`, `code-review` (dois eixos por subagentes de leitura), `pr`. Base: sprint04 `c1c4840`; branch `issue/42-ordinal-primeiro-envio`, preservando os documentos de passagem.

| Arquivo final | Operação | O que mudou de fato |
| --- | --- | --- |
| `codigo-base/supabase/migrations/0028_first_submission_ordinal_and_credit_book.sql` | criado | `answers.first_submission_ordinal`; `save_attempt_answer` atribui o ordinal por usuário/questão/contexto sob o lock da tentativa (legado nulo); `learning_credits numeric(12,4)` com índices parciais únicos por contexto; `profiles.xp_credits` e `room_members.credits_internal`; `level_for_credits`; `grant_learning_credits` chamado pelo `finalize_attempt` público na mesma transação; `guard_answer_write` congela o ordinal; **corrige o trigger `room_members.updated_at` do ticket 05** |
| `codigo-base/tests/db/ordinal-credits.sql`, `scripts/run-db-tests.ts`, `package.json` | criado/alterado | teste SQL focal e flag/comando `test:db:ordinal-credits` |
| `codigo-base/src/types/database.ts` | gerado | schema local 0001–0028; diff acrescenta `learning_credits`, as colunas novas e `level_for_credits` |
| `codigo-base/src/data/repositories.ts` | alterado | `creditoRepository` (leitura do livro); tipo `Credito` |
| `docs/banco-de-dados/documentacao-bd.md`, `docs/testes.md`, ticket 05 | alterado | seção 04.6, comando de teste e registro da correção do defeito 05 |

Validações executadas: TDD real em Postgres local `athen-gamificacao-test` (0001–0028). Vermelho: `record "r1" has no field "first_submission_ordinal"`; depois `record "new" has no field "updated_at"` (defeito 05) tratado na própria migração; verde após 0028. `test:db:ordinal-credits` cobre ordinal 1/2/3 por contexto, isolamento curso/sala, reenvio sem renovar, legado nulo, crédito 1,3333 (curso) e 4,0000 (sala), unicidade por contexto, saldo decimal, `level_for_credits` 99,9999→1/100→2, replay e regrind entre tentativas sem recrédito, xp_global inteiro inalterado, e a regressão de reingresso por `join_room`. Sem regressão: run, learning, first-submissions, start-attempt, lesson-versions, permissions, seed, concurrency, learning:concurrency — todos aprovados; `--prove-failure` encerra com código 1. Pipeline da aplicação: lint, typecheck, test:run (2/2), test:check, test:db:check, build — aprovados. E2E Chromium: **28 passed**. Revisão em dois eixos por subagentes de leitura: sem achado de alta severidade; aplicadas as correções de declaração/escopo (cabeçalho da 0028 e docs do ticket 05) e de completude de teste (anti-regrind entre tentativas e invariante dos inteiros legados).

Evidências e limitações: o cálculo inteiro legado em `athen_private` permanece byte a byte; o livro decimal é escrito só pelo finalizador público, em paralelo aos inteiros. Bônus (concessão/afinidade), PAC/eficiência (Sessão 03), temporadas (04A), missões (05 — restante) e abertura auditada de legado em massa continuam fora. Concorrência real do ordinal fica para ticket posterior (a serialização é provada por construção, pelo `for update`). Estado: validado localmente e **publicado no PR [#9](https://github.com/embertoni/Athen-Teste/pull/9) contra sprint04, CI verde** ([run 41313860815](https://github.com/embertoni/Athen-Teste/actions/runs/41313860815): quality/database/e2e SUCCESS). Próxima ação: **integração exige autorização própria do usuário**; não há merge/deploy/SQL remoto nesta entrega.

### Sessão 02 — fatia 04.7: origem tipada, trava de escrita decimal e abertura de legado

Data/responsável: 01/11/2026, Kiro CLI; solicitante responsável pela issue 42, sprint04, Em andamento.

PR #9 (fatia 04.6) foi **integrado** pelo usuário (merge `acfb9ea`), encerrando a pendência anterior. Ticket local [04.7](../../.scratch/gamificacao/issues/04-7-origem-tipada-e-abertura.md) (F3 do ticket 04.5). Recorte ajustado após investigação: F3 propriamente dita — **sem** a graduação-contra-snapshot, que exigiria reescrever o finalizador legado por um ganho só na borda admin (a RLS `questions_update` já congela questões publicadas). Skills: `implement`, `tdd`, `code-review` (dois eixos por subagentes de leitura), `pr`. Base: sprint04 `acfb9ea`; branch `issue/42-origem-tipada-abertura`.

| Arquivo final | Operação | O que mudou de fato |
| --- | --- | --- |
| `codigo-base/supabase/migrations/0029_typed_credit_origin_and_legacy_opening.sql` | criado | `learning_credits.origin` tipada + `note`; `question_id`/`attempt_id` nullable com check de forma; índices únicos de base reescopados por `origin='base'` + índices de abertura por contexto; trava de escrita de `room_members` (grant de coluna); `open_legacy_credit` admin-only, auditada, única por contexto, conservadora |
| `codigo-base/tests/db/typed-credits.sql`, `scripts/run-db-tests.ts`, `package.json` | criado/alterado | teste SQL focal e flag/comando `test:db:typed-credits` |
| `codigo-base/src/types/database.ts` | gerado | schema local 0001–0029; diff acrescenta `origin`/`note`, torna `question_id`/`attempt_id` nullable e inclui `open_legacy_credit` |
| `codigo-base/src/data/repositories.ts` | alterado | `creditoRepository.listarPorOrigem`; tipo `OrigemCredito` |
| `docs/banco-de-dados/documentacao-bd.md`, `docs/testes.md` | alterado | seção 04.7, faixa 0001–0029 e comando de teste |

Validações executadas: TDD real em Postgres local `athen-gamificacao-test` (0001–0029). Vermelho: `column "origin" does not exist`; verde após 0029. `test:db:typed-credits` cobre base tagueada pelo finalizador, segunda base recusada, abertura coexistindo, recusa de escrita de coluna decimal/legada pelo cliente, gestão de membro preservada pelo educador (status/removed_at/delete), admin-only, abertura auditada com nota, unicidade por contexto, recusa de saldo negativo e ausência de ordinal/base fabricados. Sem regressão: ordinal-credits, run, learning, first-submissions, start-attempt, lesson-versions, permissions, seed, concurrency, learning:concurrency — todos aprovados; `--prove-failure` encerra com código 1. Pipeline da aplicação: lint, typecheck, test:run (2/2), test:check, test:db:check, build — aprovados. E2E Chromium: **28 passed**. Revisão em dois eixos por subagentes de leitura: sem achado de alta severidade de correção; aplicadas as correções apontadas (grant de `room_members` preservando insert/delete do educador; comentários de dois escritores; nota de auditoria persistida; guarda de vínculo inexistente na abertura de sala; teste do caminho positivo do educador e catch estrito do check).

Evidências e limitações: o cálculo inteiro legado em `athen_private` permanece byte a byte; a base continua escrita só pelo finalizador, e agora `open_legacy_credit` é a segunda autoridade (admin) da conta decimal, sem varrer legado. Graduação-contra-snapshot, bônus de concessão/afinidade, PAC/eficiência (Sessão 03), temporadas (04A) e missões (05) continuam fora. Estado: validado localmente e **publicado no PR [#10](https://github.com/embertoni/Athen-Teste/pull/10) contra sprint04, CI verde** ([run 41319302262](https://github.com/embertoni/Athen-Teste/actions/runs/41319302262): quality/database/e2e SUCCESS). Próxima ação: **integração exige autorização própria do usuário**; não há merge/deploy/SQL remoto nesta entrega.



Usar o modelo abaixo por sessão e repetir a subseção para cada página/área, incluindo banco, acesso compartilhado, testes e operação. Em renomeação/exclusão, registrar destino e consumidores. Integração no fork usa mudanças cumulativas e sequência de migrações, sem tratar cópia de componente como instalação da funcionalidade.

```markdown
### Sessão NN — título efetivo
Data/responsável:
Estado: em execução | concluída | parcialmente concluída
Issue real, ticket local/IDs Q e critério de conclusão:
Ponto de teste acordado e skills utilizadas/adaptações:
Base: sprint e commit inicial; alterações locais já existentes
Branches reais: nome e repositório
Referência e abrangência da revisão: commits, index, working tree e novos arquivos próprios
Commits/PRs: referências reais, ou “não realizados”

#### Página ou área efetivamente alterada
| Arquivo final | Operação | O que mudou de fato | Branch/commit de origem |
| --- | --- | --- | --- |
| caminho | criado/alterado/removido/gerado | comportamento observado | referência |

Validações executadas: comando, ambiente/esquema, resultado e data:
Evidências e limitações:
Migrações aplicadas e compatibilidade:
Estado: implementado localmente | validado | integrado | liberado (só o comprovado)
Pendências e bloqueadores:
Próxima ação concreta, arquivos/contexto a reler e comando de validação:
```

## 8. Estado desta consolidação e próximos passos

**Dez rodadas consolidadas; nenhuma nova rodada de produto aberta.** Os 143 IDs representam 132 respostas literais preservadas no arquivo próprio e 11 registros derivados identificados. Este guia incorpora as rodadas 7–10 e os registros anteriores em regras, sessões, critérios e diagramas. Propostas continuam históricas. Código e comportamento vigente continuam inalterados.

| Etapa | Situação / condição |
| --- | --- |
| Questionário e consolidação documental | Concluídos nesta revisão, sem alegar ausência absoluta de dúvidas futuras |
| Fluxo e skills | Aplicados nos tickets 01–03: implementação/TDD na infraestrutura, revisão Padrões/Spec e registros efetivos na seção 7 |
| Confirmação do entendimento | **Recebida explicitamente em 30/10/2026**, cobrindo guia, fluxo e interfaces de teste |
| Detalhamento executivo | Spec, contratos e tickets locais mantidos; issue 42, solicitante responsável, sprint04, Em andamento confirmado. Tickets 01–03 validados localmente, 04/05 pendentes; detalhamento da sessão 00 continua incremental |
| Ambiente e testes | Bootstrap/sanidade/concorrência SQL e pipeline/E2E aprovados localmente e na primeira CI Linux do PR #3; quality/database/e2e aprovados. Containers locais parados com banco preservado; M01–M09/T01–T05 do núcleo não executados |
| Sincronização da base no fork | PR #2 integrado em `2d55fd3`; infraestrutura do PR #3 validada localmente/Linux e merge expressamente autorizado para este fechamento. Confirmar incorporação pelo estado merged do PR #3; revisão adicional dispensada neste fork |
| Pausa e retomada | 04.1–04.3 integradas pelos PRs #4–#6; desenvolvimento pausado, prompt de retomada no Kiro preparado em issue/42-retomada-kiro. Ticket principal parcial; registros anteriores preservados como histórico |
| Designações e atendimento | Adiados pelo usuário; antes de implantação/liberação registrar produto/homologação, revisão de banco, operação/contato, implantação/interrupção, dias/horas/fuso, reconhecimento e prazo-alvo de reconciliação |
| Implantação/liberação | Não autorizada nesta entrega; depende de implementação/homologação, evidências, recuperação/reconciliação, configuração real e pendências operacionais resolvidas |

Não repetir perguntas encerradas ou solicitar novamente nomes agora. Se a revisão final ou a implementação revelar contradição/fato novo, registrar evidência e reabrir somente a decisão afetada antes de mudar comportamento. Aceites anteriores e escolhas delegadas não serão substituídos silenciosamente.

**Verificação da execução atual:** ver registro da seção 7. A preparação documental não comprova execução da aplicação, SQL ou homologação operacional.

## 9. Visão visual do processo e do objetivo final

Diagramas do **plano futuro**, sem indicar trabalho funcional entregue. Mermaid pode ser visualizado em leitor compatível, como GitHub. A ordem principal é sequencial para integração; dependências técnicas mínimas estão na seção 3.

### 9.1 Processo de desenvolvimento e condições de liberação

```mermaid
flowchart TB
  DOC["Dez rodadas consolidadas neste guia<br/>143 IDs e respostas preservadas"]
  CONF{"Usuário confirma<br/>o entendimento consolidado?"}
  AJUSTE["Revisar somente decisões afetadas<br/>e apresentar nova consolidação"]

  subgraph BASE["Base confiável"]
    S00["00 · Contratos, spec e issues reais<br/>sprint, vocabulário e decisões"]
    S01["01 · Postgres isolado e harness<br/>papéis, concorrência e recuperação"]
    S02["02 · Aprendizagem e livro de créditos<br/>snapshot, ordinal e crédito único"]
    S03["03 · PAC e privacidade<br/>última completa, eficiência e cobertura"]
    S00 --> S01 --> S02 --> S03
  end

  subgraph NUCLEO["Mecanismos compartilhados"]
    S04A["04A · Ligas semanais<br/>inscrição automática e queda de zero até Bronze"]
    S04["04 · Consultas e Ligas<br/>próprio grupo, posição e paginação"]
    S05["05 · Motor de missões<br/>catálogo, atribuição e bônus único"]
    S04A --> S04 --> S05
  end

  subgraph FLUXOS["Fluxos nas páginas"]
    S06["06 · Missões e TopDown<br/>globais também sem curso ativo"]
    S07["07 · Cursos<br/>diária por curso e ranking de amigos por PAC"]
    S08["08 · Salas<br/>curso fixo, versão adotada e missões avulsas"]
    S09["09 · Integração<br/>conta, notificações e atualização"]
    S06 --> S07 --> S08 --> S09
  end

  S10["10 · Piloto e ensaio de corte<br/>T01–T05, M01–M09, carga e reconciliação"]
  OPER["Antes de implantar/liberar<br/>designações, atendimento, configuração real<br/>recuperação e revisão humana comprovadas"]
  FINAL["Objetivo final após validação e liberação autorizada<br/>aprendizagem, missões e competição coerentes<br/>em global, cursos e salas"]

  DOC --> CONF
  CONF -->|"Ressalvas"| AJUSTE --> DOC
  CONF -->|"Confirmação explícita"| S00
  S03 --> S04A
  S05 --> S06
  S09 --> S10 --> OPER --> FINAL
```

Cada sessão usa o ciclo por ticket da seção 3.1: comportamento → teste → implementação mínima → revisão → validação → registro/integração autorizada. Registra página, arquivo, mudança e branch efetivos. A seleção de skills da seção 3.2 acompanha esse ciclo; o diagrama não cria branches, aplica SQL ou concede autorização de implantação.

### 9.2 Objetivo final: atividade, avaliação, missão e competição

```mermaid
flowchart TB
  ACAO["Estudo em curso individual<br/>ou sala concreta autorizada"]

  subgraph TX["Postgres / Supabase · mesma transação principal"]
    VALIDAR["Validar conta, acesso, versão e contexto<br/>preservar primeiro envio e ordinal"]
    RESULTADO["Resultado imutável e conclusão oficial<br/>reenvio recupera a mesma confirmação"]
    PAC["Última execução completa por aula e versão<br/>PAC, eficiência e cobertura"]
    BASE["Primeiro acerto elegível<br/>base dividida pelo ordinal, uma vez por contexto"]
    EVENTO["Evento interno confirmado<br/>revisão integral é nova execução; reenvio não"]
    MISSAO["Missões elegíveis da janela<br/>global, curso individual e sala"]
    CONCESSAO["Ao atingir meta: concessão única<br/>bônus no destino definido"]
    LIVRO["Livro compartilhado<br/>base, bônus, abertura e ajustes separados"]
    INTENCAO["Intenção durável e deduplicada de conquista<br/>gravada junto da concessão"]

    VALIDAR --> RESULTADO
    RESULTADO --> PAC
    RESULTADO --> BASE --> LIVRO
    RESULTADO --> EVENTO --> MISSAO
    MISSAO --> CONCESSAO --> LIVRO
    CONCESSAO --> INTENCAO
  end

  ABRE["Backend na virada<br/>fotografar estudo oficial dos sete dias anteriores<br/>fechar anterior, persistir categoria e formar grupos"]
  TARDE["Primeiro estudo oficial na semana<br/>entrada tardia automática, sem exigir XP positivo"]
  GRUPO["Inscrição única e grupo estável<br/>mesma categoria, afinidade social, teto 30<br/>sem abandono ou navegação por grupos alheios"]
  COMP["XP semanal: apenas base individual nova elegível<br/>sem bônus, sala, abertura, autoria própria ou repetição creditada"]
  FECHA["Apuração e movimento únicos<br/>positivos: cortes e empates aceitos<br/>todo zero cai uma categoria até Bronze"]
  NIVEL["Saldo vitalício e nível preservados<br/>sem ranking global vitalício"]
  CURSO["Curso: próprio usuário e amigos elegíveis<br/>matrícula individual, PAC e amostra autorizados<br/>sem emblema acadêmico"]
  SALA["Sala: alunos por PAC, responsável fora<br/>members ou educator_only<br/>curso fixo, sem matrícula individual automática"]
  TELAS["Missões, Ligas, Dashboard, Catálogo,<br/>Salas, Perfil e resumos coerentes"]
  PUBLICA["Publicação de sala confirmada<br/>intenção durável na transação editorial"]
  INTRESULT["Resultado fechado<br/>intenção durável na transação de fechamento"]
  NOTIF["Entrega separada e recuperável<br/>falha não desfaz estudo ou recompensa"]

  ACAO --> VALIDAR
  ABRE --> GRUPO
  TARDE --> GRUPO
  LIVRO -->|"destino global vitalício"| NIVEL
  LIVRO -->|"filtrar origem e instante"| COMP
  GRUPO --> COMP --> FECHA
  PAC --> CURSO
  PAC --> SALA
  GRUPO --> TELAS
  FECHA --> TELAS
  CURSO --> TELAS
  SALA --> TELAS
  NIVEL --> TELAS
  MISSAO --> TELAS
  INTENCAO -.-> NOTIF
  PUBLICA -.-> NOTIF
  FECHA --> INTRESULT -.-> NOTIF
```

Durante espera da categoria/grupo, confirmar normalmente estudo/créditos/missões e associar os créditos da nova janela uma vez ao grupo definitivo. Atraso de apuração não amplia prazo nem permite categoria provisória. O fechamento produz intenção de resultado somente após conclusão definitiva; publicação/conquista seguem suas próprias origens. Identidade e acesso em todas as leituras seguem o estado da conta e a política de retenção.

As setas de crédito não distribuem todo XP a todos os contextos. Base de sala e bônus de missão própria da sala ficam internos; global concluída em sala pode conceder bônus **vitalício**, excluído da competição. PAC ordena somente contextos acadêmicos autorizados e não bloqueia estudo. **Estudar/revisar pode gerar missão e inscrição com zero competitivo; Q143 mantém a queda de zero aceita.**

## 10. Fonte do questionário e rastreabilidade final

O questionário completo permanece somente em [respostas-guia-desenvolvimento-missoes-ligas-e-pac.md](respostas-guia-desenvolvimento-missoes-ligas-e-pac.md), preservado literalmente nesta atualização. Seu registro acumulado orientou a consolidação. Não copiar recomendações históricas de volta como regras vigentes nem preencher novos “Sim” para registros derivados.

O método [grill-with-docs](../../.agents/skills/grill-with-docs/SKILL.md), com [grilling](../../.agents/skills/grilling/SKILL.md) e [domain-modeling](../../.agents/skills/domain-modeling/SKILL.md), foi mantido: árvore de decisões, pré-requisitos, cenários e substituições explícitas. Não é necessária outra rodada só para repetir aceites. Glossário/ADR e tickets continuam trabalho futuro autorizado por sessão, não arquivos desta entrega.

### 10.1 Rodadas e preservação das respostas

| Rodada respondida | IDs das respostas literais | Quantidade |
| --- | --- | --- |
| 1 | Q001–Q010 | 10 |
| 2 | Q011–Q020 | 10 |
| 3 | Q101–Q103, Q111–Q125 | 18 |
| 4 | Q021–Q030, Q104–Q109, Q126–Q129 | 20 |
| 5 | Q031–Q040, Q045–Q050, Q130–Q134 | 21 |
| 6 | Q053–Q055, Q057, Q059–Q060, Q135–Q137 | 9 |
| 7 | Q062–Q063, Q065–Q070, Q138–Q142 | 13 |
| 8 | Q071–Q080, Q143 | 11 |
| 9 | Q081–Q090 | 10 |
| 10 | Q091–Q100 | 10 |
| **Total literal** | Preservado no arquivo de respostas, sem transcrição duplicada neste guia | **132** |

**11 registros derivados:** Q041–Q044, Q051, Q052, Q056, Q058, Q061, Q064 e Q110. São direções/replanejamento identificados, não novas falas do usuário. Juntos com as 132 respostas, cobrem Q001–Q143 sem campo de resposta pendente.

### 10.2 Decisão → sessão → validação

| Perguntas | Decisão vigente / ressalva | Sessões e páginas/áreas | Evidência planejada / estado |
| --- | --- | --- | --- |
| Q001–Q010 | Aprendizagem/constância, adultos/educadores, três contextos, monólito/transação e gestão por contexto; Q010 não fixa prazo/custo/nome | 00 e todas | Fluxos completos, integridade e permissões; produto decidido, liberação condicionada |
| Q011–Q020 | Vocabulário, catálogo, revisão integral e ativação automática; Q017 ampliado por Q119/Q120/Q123–Q125 | 05–08, Missões/Dashboard/curso/sala | Sem visita, meta inviável ou crédito duplicado; T01/T02/T04 |
| Q021–Q030 | Calendário, instante oficial, vínculo, retomada/saída e histórico materializado | 02, 04A, 05–08 | Limites, offline/retorno perdido, reingresso e expiração; T01/T03/T04 |
| Q031–Q040 | Editor restrito, sala inteira, rascunho, regra imutável/avulsa, curso sem troca, acompanhamento e catálogo versionado sem painel completo | 05–08, Salas/Missões | SQL de papéis/cotas e M02/M04; decidido |
| Q041–Q050 | Base/bônus/contextos separados e automático; valores delegados, ajustes, autoria/responsável e níveis | 02, 04A–05, 07–09 | Unicidade, orçamento e nível decimal; Q041–Q044 derivados, Q045 delegado, restante decidido |
| Q051–Q060 | Última completa/PAC binário, ordinal, eficiência/cobertura/mínimo delegados, retomada/snapshot e sem bloqueio; visual Q057 encerrado por Q062 | 02–04, 07–08 | Amostras/estados/versões e rede; Q051/Q052/Q056/Q058 derivados, cenários confirmados |
| Q061–Q070 | Emblema só liga, matrícula/audiência, resumo, progresso privado, sem public/pseudônimo, desativação sem saída | 03–04A, 04, 07–10 | SQL de acesso e M03/M05/M06/M09; Q061/Q064 derivados, demais decididos |
| Q071–Q080 | Navegação, três pendentes, detalhe, feedback, revalidação 60s, notificações 5min/24h/7d e acessibilidade/identidade | 04, 06–10 | E2E e M01/M03/M07; decidido, não homologado |
| Q081–Q090 | Legado/corte/recuperação, retenção delegada, carga, observabilidade, responsáveis adiados, fork/PRs e piloto | 00–02, 09–10 | T05/M08/M09, SQL/carga; Q085 escolhido por delegação, designações/SLAs pendentes pré-liberação |
| Q091–Q100 | Cenários compatíveis, rotas delegadas e consolidar/apresentar/confirmar antes de código | Todas | T01–T05/M01–M09 planejados; Q099 delegado e Q100 aceitou sequência, confirmação desta versão pendente |
| Q101–Q110 | Semana competitiva, XP elegível, grupos/cortes/empates, fechamento e replanejamento | 04A–04, 09–10 | T03/M06; Q105 delegado e Q110 derivado, parâmetros posteriores prevalecem |
| Q111–Q118 | PAC A com complemento delegado, vínculo/versionamento do curso privado/pronto ou público, privacidade e PAC sem reset semanal | 02–04, 07–08 | T01/T02, M02/M05; decidido com desenho delegado explícito |
| Q119–Q125 | Catálogo comum, bônus global em sala, revisão, proximidade por amizades e diária em todo curso individual elegível | 04A, 05–08 | T01/T02/T03; heurística/quantidades delegadas e confirmadas nos complementos |
| Q126–Q129 | Erro abandonado persiste, quatro casas, vazia não remunera repetição, distinção por ocorrência e revisão creditada sem competitivo | 02–03, 04A, 05–08 | T01/T03/T04 e SQL concorrente; decidido |
| Q130–Q134 | 1h–90d, sem prêmio de temporada e processamento 5/5/30; entrada Q131/Q132 e desativação substituídas posteriormente | 04A–05, 08–10 | Janela/entrega/virada; aplicar Q070/Q137–Q143, não o gatilho antigo |
| Q135–Q137 | Orçamento/cotas/metas aceitos; inscrição automática de recentes substitui entrada por crédito | 04A–04, 05–08 | Catálogo/cotas/abertura; parâmetros concluídos Q138–Q143 |
| Q138–Q142 | Sete dias de estudo oficial, entrada tardia sem XP, fotografia/espera segura e adoção explícita de versão; ressalva Q140 encerrada | 02–04A, 04, 05, 07–10 | T02–T04/M04–M06; zeros seguem Q143 |
| Q143 | Zero obrigatório cai uma categoria até Bronze, inclusive solo/pequeno/tardio/grupo zerado, sem duplicar queda | 04A–04, 10 | T03/M06 e cortes reais do grupo inteiro; decidido |

**Critério de fechamento desta especificação:** ramos de produto têm decisão verificável; exclusões/delegações estão explícitas; cenários não se contradizem; pendências operacionais adiadas estão identificadas, sem fingir preenchimento. O entendimento consolidado foi aprovado em 30/10/2026. Essa conferência documental não equivale a aprovação de operação nem a testes executados; acompanhar execução e bloqueios na seção 7.
