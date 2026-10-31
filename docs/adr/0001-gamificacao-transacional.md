# Gamificação transacional com créditos por contexto

Status: accepted — desenho aprovado, implementação pendente.

Aprendizagem, resultado, métricas indispensáveis, contribuições de missão e créditos serão confirmados na mesma transação Postgres, com um livro compartilhado e unicidade por origem e contexto concreto. A decisão aprovada em Q006–Q007 evita pagamento parcial e duas autoridades de XP, ao custo de uma falha interna de missão também reverter a atividade; processamento assíncrono por fila foi considerado e exigiria estados pendentes e operação adicional.

Entrega de notificações fica posterior à intenção durável. Q141 permite aguardar categoria/grupo competitivo mantendo aprendizagem, XP e missões confirmados normalmente; essa exceção não torna a conquista de missão assíncrona. Curso individual e cada sala preservam crédito e métricas independentes, sem matrícula automática pela sala.

Fonte: [guia aprovado](../planejamento-gamificacao/guia-desenvolvimento-missoes-ligas-e-pac.md), seções 2.1–2.4, e [respostas](../planejamento-gamificacao/respostas-guia-desenvolvimento-missoes-ligas-e-pac.md). Novas migrações substituirão o comentário histórico de ausência de temporadas/cron; o SQL antigo será preservado.
