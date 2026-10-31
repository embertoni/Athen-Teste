# Conciliação da sprint04 no Athen-Teste

Registro de execução de 31/10/2026, issue YouTrack **42**, atribuída ao solicitante e confirmada por ele como **Em andamento**. Escopo autorizado: conciliar os históricos divergentes, testar, commitar e atualizar o [PR de rascunho #2](https://github.com/embertoni/Athen-Teste/pull/2), exclusivamente no fork. A integração na `sprint04` continua pendente de revisão humana independente e autorização.

## Históricos e limite de escrita

- Branch de trabalho: `issue/42-sincroniza-sprint04`.
- Primeiro pai: `2c3d19dd6b92a44967c950d5bc03b5cb19f42e02`, base validada anteriormente.
- Histórico incorporado: `origin/sprint04`, `59bfd138bc79fb3ce6513e04a645de2fa64c4c1a`.
- Ancestral comum: `c4dcdfab418ac11949b6d5fcf3b062be3c228838`.
- Escrita remota permitida somente em `embertoni/Athen-Teste`. `VitorSoaresGoncalves/Athen` permanece somente leitura; seu remote `upstream` tem push URL local `disabled://upstream-read-only`.

O PR reúne históricos amplos (64 commits na origem da comparação inicial), necessários para evitar incluir a divergência inteira no PR posterior de infraestrutura. Esta conciliação não implementa o núcleo novo de missões/ligas/PAC. Os tickets 01–03 e os quatro documentos de planejamento permanecem na branch `issue/42-testes-banco-gamificacao`, fora desta entrega.

## Decisões nos 25 conflitos

As duas intenções foram comparadas com as respectivas fontes. A tabela agrupa todos os arquivos em conflito; arquivos sem diferença comportamental mantêm o conteúdo mais completo.

| Arquivos | Resolução |
| --- | --- |
| `src/Hub.tsx` | Preservada `/ligas`; `/ranking` redireciona com sessão exigida, mantendo URLs antigas |
| `components/lesson/LessonModal.tsx`, `.css` | Preservadas falhas explícitas de leitura/RPC, conclusão sem questões restrita ao contexto correto e aparência por módulo |
| `components/sidebar/SidebarLeft.tsx`, `SidebarRight.tsx` | Preservadas navegação para Ligas e consultas reais de ranking/missões; descartado o placeholder desconectado |
| `pages/Amigos.tsx` | Preservados perfil, medalhas, busca, pedidos e lembrete; incorporados cabeçalho/CSS e tokens do fork |
| `pages/Catalogo.tsx`, `.css` | Preservados filtro Meus cursos e estados de matrícula ativa/concluída |
| `pages/Dashboard.tsx`, `.css` | Preservados contexto de sala, erros/conclusão, aviso sem matrícula, carrossel e geometria já testados |
| `pages/Ligas.tsx`, `.css` | Mantida a tela de Ligas; removida a cópia antiga Ranking, com redirecionamento de rota |
| `pages/Notebook.tsx` | Tema/estante do fork combinados com busca sem acentos da outra linha |
| `pages/Salas.tsx`, `.css` | Preservados aulas, contexto, ranking, código e mural; reincorporada leitura de missões publicadas com estados de erro/vazio |
| `pages/criar-curso/CriarCurso.tsx`, `.css`, `questionConfig.ts` | Preservada renomeação para `EditorConfigQuestao`, com imports e links atualizados |
| `pages/profile/Profile.css` | Preservado conteúdo equivalente do fork |
| `docs/README.md`, `arquitetura.md`, `banco-de-dados/documentacao-bd.md`, `estilo-padrao.md`, `testes.md` | Preservadas referências funcionais mais completas, atualizados caminhos de Ligas/editor e incorporado relatório histórico com status explícito |
| `scripts/link-skills.sh` | Conteúdo equivalente, preservado modo executável do fork |

Os caminhos de código na tabela partem de `codigo-base/src/`. A conciliação automática também preservou o alias legado `concluiRepository.concluirAulaSemQuestoes`, o README de setup da aplicação e o relatório histórico do fork. O lockfile e as migrações não foram alterados por esta resolução. Nenhum SQL foi executado.

Os dois jobs existentes da CI passam a usar Node **24.19.0**: o lockfile exige versões incompatíveis com o antigo 22.12.x, incluindo ESLint 10. Nenhuma dependência nova foi adicionada. A versão operacional é consultada no workflow, evitando repetir a versão no README.

## Validação desta resolução

Executado localmente com Node 24.19.0:

| Verificação | Resultado |
| --- | --- |
| `npm run lint` | Aprovado, sem avisos |
| `npm run typecheck` | Aprovado |
| `npm run test:run` | Dois arquivos e dois testes aprovados |
| `npm run test:check` | Aprovado |
| `npm run build` | Aprovado; aviso de chunk maior que 500 kB |
| `npm run test:e2e -- --workers=2` | 19 testes Chromium aprovados, incluindo sete novos |
| Engines do lockfile | 278 verificadas; nenhuma incompatível com Node local/CI novo, 18 incompatíveis com Node 22.12.0 |
| Revisão `code-review`, eixo Padrões | Nenhum achado material, somente leitura contra ambos os pais |
| Revisão `code-review`, eixo Spec | Nenhum desvio material; solicitada atualização do registro de validação |

A revisão por agentes não substitui a aprovação humana independente do PR. A primeira execução de lint identificou atualização síncrona desnecessária em um effect novo; removida, pois o modal já remonta pela chave da sala.

A primeira rodada E2E foi invalidada: um build geral concorrente sobrescreveu `dist/` preparado com variáveis fictícias; três testes passaram e 16 falharam, com redirecionamentos para a página pública. Não é evidência da aplicação reconciliada. Após encerrar o build geral, a repetição isolada passou nos 19 testes. O Playwright passou a exigir preview exclusivo, sem reutilizar servidor existente; a documentação exige builds em sequência. Nenhum banco remoto foi alterado.

Cobertura nova em `codigo-base/tests/e2e/sprint04-reconciliation.spec.ts`: rota antiga de ranking, estante com busca sem acentos em 360/768/1440px, perfil/medalhas de amigos, missões publicadas sem rascunhos e acesso às aulas da sala, falha das missões sem ocultar os módulos. O mock HTTP não comprova autenticação real, RLS, migrações ou o futuro mecanismo de gamificação.

Conferência visual das capturas: estante desktop, Amigos e modal de sala mantêm conteúdo legível e as intenções preservadas. Em **360px**, a sidebar fixa e seu deslocamento de 230px deixam a estante excessivamente estreita; essa estrutura é idêntica nos dois pais, em `PageLayout.tsx`. A captura registra a limitação preexistente, sem homologar responsividade móvel. A navegação móvel recolhível continua sendo trabalho futuro do guia; não foi redesenhada nesta conciliação.

As capturas reproduzíveis ficam em `codigo-base/test-results/`; evidências selecionadas versionadas: [estante desktop](evidencias/sincronizacao-sprint04/estante-desktop.png), [perfil do amigo](evidencias/sincronizacao-sprint04/amigo-perfil.png), [missões da sala](evidencias/sincronizacao-sprint04/sala-missoes.png) e [limitação móvel preexistente](evidencias/sincronizacao-sprint04/estante-mobile-limitacao.png). A rodada final, após completar a fixture de PAC e ajustar a rolagem da captura, também passou nos 19 testes (20,8s); lint e tipagem de testes foram repetidos e aprovados.

CI remota ainda pendente de envio do commit; não confundir os resultados locais com aprovação remota.

## Pendências para integração e retomada

1. Obter uma aprovação de outra pessoa no PR, conforme convenções; autor não se autoaprova.
2. Integrar o PR na `sprint04` somente quando autorizado, sem tocar no repositório original.
3. Rebasear/conciliar a infraestrutura separada contra a sprint integrada, validar seu job SQL isolado e registrar a sessão efetiva no guia dessa branch.
4. Só então avançar ao próximo ticket desbloqueado do guia. O bug legado do trigger `room_members.updated_at` continua registrado na infraestrutura, sem correção nesta conciliação.
