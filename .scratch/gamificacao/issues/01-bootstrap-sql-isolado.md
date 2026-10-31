# 01: Executar uma validação SQL como aluno em ambiente descartável

Status: resolved

**Issue de equipe:** 42; solicitante responsável; sprint04. Estado Em andamento confirmado pelo usuário.

**What to build:** um desenvolvedor prepara um Supabase local exclusivo, instala o esquema atual e executa uma verificação real sob identidade de aluno, recebendo resultado confiável do processo.

**Blocked by:** preparação documental inicial e confirmação do estado satisfeitas. Nenhuma dependência funcional futura.

**Origem:** spec; guia sessão 01/3.4; Q006/Q087–Q090. Exceção preparatória de infraestrutura aprovada no guia.

- [x] Identificar destino local, projeto/container/portas e marcador de ensaio antes de SQL; rejeitar remoto, configuração ausente ou destino inesperado.
- [x] Bootstrap reproduzível apenas do SQL numerado, com Auth/roles do Supabase; não misturar esquemas legados nem seed de demonstração automático.
- [x] Runner não interativo executa caso de sanidade pela entrada pública atual sob authenticated/aluno; registrar evidência de RLS/papel efetivo.
- [x] Asserção deliberadamente inválida faz processo sair com falha; teste permanente de sanidade passa; erros de conexão/SQL também propagam falha.
- [x] Registrar preparação, limpeza restrita ao projeto descartável, sequência SQL, versões e repetição do bootstrap.
- [x] Pipeline aplicável passa ou falhas preexistentes são explicitamente separadas; não alegar validação das regras futuras.

**Execução local:** implementado e validado em 30/10/2026 na branch `issue/42-testes-banco-gamificacao`; revisão Padrões/Spec concluída, um achado menor corrigido. Esquema 0001–0022 instalado duas vezes em projetos descartáveis recriados; reaplicação com mesmo manifesto não repetiu SQL. Sanidade retornou 0, falha intencional/URL ausente/remota/configuração alterada retornaram 1. Pipeline final completo passou, incluindo tipos do harness. Sem integração, commit ou publicação. Status resolved refere-se à entrega local, não ao encerramento da issue 42 no YouTrack. Desenvolvimento pausado a pedido do usuário; containers parados com banco preservado.

**Ponto de teste:** comando público do harness e acesso SQL com papel real. Não antecipar toda a suíte de missões/ligas/PAC.

**Retomada em 31/10/2026:** infraestrutura conciliada com a sprint04 integrada pelo PR #2 (`2d55fd3`). Bootstrap/sanidade/concorrência e pipeline reexecutados com sucesso; projeto local parado com volume preservado. Publicada no PR #3, commit `45d6385`, e aprovada também no job database da CI Linux `41173674697`. Integração própria ainda pendente; registro atual na seção 7 do guia.

**Compatibilidade:** SQL histórico preservado; nenhuma alteração em banco compartilhado. Nova configuração fica isolada da aplicação e de suas credenciais.

**Evidência para fechar:** comandos e saídas de sucesso/falha, alvo e esquema identificados, diff revisado e registro no guia. Pronto localmente não significa integrado.
