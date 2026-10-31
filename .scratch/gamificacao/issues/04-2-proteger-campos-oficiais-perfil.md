# 04.2: Impedir a alteração de campos oficiais pelo cliente do perfil

Status: resolved

**Issue de equipe:** 42, solicitante responsável, Em andamento, sprint04. Dependência 04.1 integrada pelo PR #4 em `da2386732b96581e3d6e4f2bdfe1739dbbc2a00b`, conferida no GitHub e no fetch de origin. Árvore inicialmente limpa; branch `issue/42-protege-campos-perfil` criada dessa sprint.

**Parte de:** ticket 04, sessão 02 — escritas protegidas. Origem: guia 3.4/3.5, autorização da sessão 02 e cenário de escrita T01. Sem nova política de pagamento.

**Entrega executável:** o cliente autenticado pode editar dados pessoais autorizados do perfil, mas não XP, nível, streak, data de estudo, cargo, estado da conta ou timestamps oficiais. Comandos legítimos de estudo continuam atualizando projeções; desativação continua pelo comando próprio. Metadados de cadastro não concedem cargo administrativo. Administração de campos oficiais é exclusiva do backend confiável, sem credencial privilegiada no browser.

- [x] SQL vermelho pela escrita pública comprova que aluno consegue alterar o próprio XP antes da correção.
- [x] Grants por coluna negam campos oficiais e comandos internos, inclusive a sessão autenticada de administrador; RLS mantém isolamento de edição pessoal.
- [x] Nome, username, bio, URLs de avatar/banner e preferências continuam editáveis; atualização misturada com XP falha integralmente.
- [x] Cadastro legítimo de aluno/educador funciona; metadata admin não eleva; concessão de cargo pelo papel de serviço confiável continua possível.
- [x] Finalização real, reenvio, streak/medalhas e desativação continuam funcionando; cliente não forja essas projeções por helpers internos.
- [x] Adapter limita o payload de edição; regressão do consumidor nas rotas de Perfil/Configurações e pipeline/SQL/CI passam.

**Ponto de teste:** interfaces já aprovadas de segurança/projeções em Postgres real (papéis authenticated, anon e service_role no harness fictício) e HTTP/React para edição legítima. SQL verifica autorização; HTTP controlado verifica payload/feedback, sem alegar RLS real.

**Compatibilidade e limites:** migração nova, sem editar SQL histórico. Conservar leitura e administração já autorizadas por RLS onde compatíveis; não criar ajuste de XP via browser. Não implementar aqui livro decimal, primeiro envio/ordinal, snapshot/publicação, matrícula/progresso, sala ou ciclo completo de exclusão. Não rever produto nem aplicar SQL remoto. Preparar e validar somente no projeto athen-gamificacao-test em 127.0.0.1:55432.

**Validação local concluída:** SQL vermelho/verde para XP, helper, metadata administrativa, exclusão de perfil e seed sem administrador. Migração final instalada do zero com 0001–0024 no container 28f3a7f55c6c; permissões, seed real duas vezes com rollback, sanidade, aprendizagem e ambas as concorrências passaram. Pipeline de seis comandos aprovado e Chromium 24/24 (29,4s); três focais passaram após ajustar seletor ao nome acessível real. Revisões Padrões/Spec tiveram seus achados corrigidos, sem novo achado material incremental. INSERT/DELETE de perfis, métodos diretos e botão Apagar foram retirados juntos; criação Auth e desativação por RPC preservadas. Supabase parado preservando banco. Publicação e CI ainda pendentes; não declarar integração ou conclusão do ticket principal.

**Publicação e CI concluídas:** commit `a89d1ebb40ad457c1d9cc8752afd7d7ced0639f6`, [PR #5](https://github.com/embertoni/Athen-Teste/pull/5) aberto para sprint04 somente no fork, sem conflitos. [CI 41233522556](https://github.com/embertoni/Athen-Teste/actions/runs/41233522556) aprovou quality/database/e2e; logs conferidos para 0024, permissions, seed revertido, concorrências e 24 E2E (21,6s). Descrição remota íntegra, sem U+FFFD. Resolved significa implementado e validado, não integrado: merge de #5 exige autorização própria e ticket 04 permanece parcial.
