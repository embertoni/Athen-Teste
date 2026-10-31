# Athen

Vocabulário da plataforma de aprendizagem gamificada. Define os conceitos do produto; seu mapeamento técnico fica na documentação de arquitetura e banco. Os conceitos de gamificação abaixo incorporam o [guia aprovado](docs/planejamento-gamificacao/guia-desenvolvimento-missoes-ligas-e-pac.md); sua definição não declara a implementação concluída.

## Linguagem

**Curso**:
Jornada de aprendizagem organizada em módulos e aulas.
_Evitar_: Sala como sinônimo de Curso.

**Módulo**:
Agrupamento ordenado de aulas dentro de um curso.

**Aula**:
Etapa de aprendizagem pertencente a um módulo, que pode conter questões ou somente conteúdo de estudo.

**Questão**:
Atividade de uma aula que recebe uma resposta para correção.

**Tentativa**:
Execução de uma aula por um estudante em um contexto de curso ou de sala, reunindo suas respostas e seu resultado.
_Evitar_: Resposta como sinônimo de Tentativa.

**Resposta**:
Entrada fornecida pelo estudante para uma questão dentro de uma tentativa.

**Conclusão**:
Registro de que uma aula foi concluída em determinado contexto de aprendizagem.
_Evitar_: Acerto como sinônimo de Conclusão.

**Execução completa**:
Tentativa em que todas as questões previstas foram respondidas e a conclusão foi confirmada. Aula sem questões admite sua primeira conclusão válida sem criar avaliação ou XP base.

**Primeiro envio**:
Primeira resposta oficialmente submetida a uma questão em uma tentativa, preservada antes do feedback.

**Ordinal do primeiro acerto**:
Número do envio em que ocorreu o primeiro acerto, entre os primeiros envios de tentativas distintas da questão no mesmo contexto. Abandono não reinicia essa contagem.

**Contexto de aprendizagem**:
Âmbito concreto em que ocorre o estudo: curso individual ou uma sala específica. Duas salas do mesmo curso constituem contextos diferentes.

**Versão de conteúdo**:
Conjunto identificado de conteúdo e atividades disponível para estudo e avaliação. Uma tentativa mantém a versão com que foi iniciada enquanto o acesso continuar autorizado.

**Matrícula**:
Vínculo de um estudante com um curso, com situação e progresso próprios.
_Evitar_: Participação em sala como sinônimo de Matrícula.

**Sala**:
Espaço de aprendizagem administrado por um educador, com participantes, avisos, missões e pontuação interna, vinculado a um curso que permanece o mesmo durante sua existência.
_Evitar_: Curso como sinônimo de Sala.

**XP global**:
Pontuação de experiência vitalícia acumulada pelo estudante por aprendizagem individual e bônus globais ou de curso, usada para determinar seu nível. Bônus global conquistado por estudo em sala também compõe esse saldo.
_Evitar_: XP da sala como sinônimo de XP global.

**XP da sala**:
Pontuação de experiência interna de um participante em uma sala.
_Evitar_: XP global como sinônimo de XP da sala.

**PAC**:
Percentual de questões totalmente corretas na amostra formada pelas últimas execuções completas de cada aula e versão no contexto. Cada questão tem o mesmo peso e ausência de amostra é distinta de zero acertos.
_Evitar_: Progresso de conclusão como sinônimo de PAC.

**Eficiência**:
Indicador acadêmico que relaciona os acertos da amostra corrente ao esforço histórico até o primeiro acerto de cada questão.

**Cobertura**:
Proporção do conjunto avaliável da versão corrente representada na amostra acadêmica do contexto.

**Crédito de XP**:
Lançamento de experiência com origem, beneficiário e destino identificados, distinguindo aprendizagem, bônus, abertura de saldo e ajuste.

**Missão**:
Objetivo de aprendizagem com meta, conteúdo elegível, período e recompensa definidos, cujo progresso individual decorre de atividade confirmada.

**Definição de missão**:
Regra reutilizável e versionada de uma missão, com escopo, objetivo e recompensa.

**Ocorrência de missão**:
Realização de uma definição em uma janela específica, com regras congeladas.

**Atribuição de missão**:
Participação individual de uma pessoa em uma ocorrência, com elegibilidade, meta e progresso próprios.

**Contribuição de missão**:
Atividade confirmada que acrescenta progresso a uma atribuição segundo a unidade e a distinção exigidas pelo objetivo.

**Concessão de missão**:
Recompensa única confirmada quando a atribuição atinge a meta, creditada automaticamente no destino correspondente.

**Liga**:
Competição global semanal por novos créditos elegíveis de aprendizagem individual, organizada em categorias e grupos.
_Evitar_: Nível vitalício ou faixa de PAC como sinônimo de Liga.

**Temporada**:
Janela semanal da liga, com inscrições, grupos, pontuação e resultado próprios, separada do saldo vitalício e do PAC acadêmico.

**Categoria de liga**:
Patamar competitivo entre Bronze e Lendário, conservado ou alterado pelo resultado da temporada.

**Grupo de liga**:
Conjunto estável de participantes da mesma categoria que competem entre si durante uma temporada.

**XP competitivo**:
Pontuação temporária da temporada originada de novos créditos elegíveis de aprendizagem individual, excluindo bônus de missão, XP interno de sala, abertura e ajustes históricos.

**Caderno**:
Espaço de anotações de estudo organizado em páginas.
