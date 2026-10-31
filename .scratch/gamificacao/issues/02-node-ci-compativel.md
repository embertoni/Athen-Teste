# 02: Executar a CI com Node compatível com as dependências atuais

Status: resolved

**Issue de equipe:** 42; sprint04; Em andamento confirmado pelo usuário. Execução na branch de infraestrutura `issue/42-testes-banco-gamificacao`, com as alterações locais do ticket 01 preservadas.

**What to build:** a equipe consegue executar lint, tipos, testes e build em uma versão de Node suportada pelas dependências instaladas, inclusive nos dois jobs da CI.

**Blocked by:** nenhum bloqueio restante; independente do bootstrap SQL.

**Origem:** inspeção factual da sessão 00, Q087–Q088. CI usa 22.12.x e ESLint 10.11.0 exige pelo menos 22.13 na série 22.

- [x] Escolher versão suportada por todas as engines do lockfile e alinhar os jobs quality/e2e.
- [x] Preservar dependências e hooks existentes, evitando regenerar lockfile sem necessidade.
- [x] Executar pipeline local e registrar versão/limites; execução local não é execução remota da CI.

**Resultado local:** Node 24.19.0 satisfaz as 278 engines declaradas no lockfile; Node 22.12.0 viola 18 delas. Jobs quality/e2e alinhados e job database do ticket 03 usa a mesma versão. Pipeline aprovado; E2E Chromium 12/12 com saída 0 fora da sandbox e dois workers. A primeira execução na sandbox completou os casos, mas precisou ser interrompida no encerramento; não foi tratada como aprovação completa. Revisões Padrões/Spec sem achados. Sem alteração de dependências/hooks neste ticket, sem publicação ou execução remota da CI. Branch issue/42-testes-banco-gamificacao; resolução local, não encerramento da issue 42.

**Ponto de teste:** comandos reais de validação; não criar teste que apenas compara a string da versão no YAML.

**Evidência para fechar:** engines conferidas, pipeline/ambiente e diff. Mudança remota de workflow só ocorrerá após autorização de publicação.
