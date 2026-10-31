# Encaminhamento da fatia 04.2 — issue 42

Branch issue/42-protege-campos-perfil, base sprint04 da23867 (PR #4 integrado). Commit de implementação a89d1eb; [PR #5](https://github.com/embertoni/Athen-Teste/pull/5) publicado somente no Athen-Teste e CI aprovada. Merge futuro exige autorização própria. Ticket 04 principal continua parcial.

## Summary

O aluno podia escrever XP no próprio perfil; funções internas permitiam fabricar streak e o cadastro aceitava metadata admin. A migração 0024 limita UPDATE aos campos pessoais e mantém os valores oficiais sob autoridade do servidor.

```text
Browser → editar identidade/imagens/preferências → grants por coluna + RLS
Auth → cadastro student/educator → perfil; metadata admin → student
Estudo confirmado → funções internas → XP/nível/streak/medalhas
Backend confiável → provisionar cargo; browser não apaga/recria perfil
```

INSERT/DELETE de perfil e EXECUTE dos helpers internos deixam de ser permitidos ao cliente, inclusive administrador autenticado. A lista de perfis do CRUD mantém edição sem Apagar; criação por Auth e desativação própria por RPC continuam. O seed fictício provisiona cargos por escrita privilegiada de sua lista fixa, com ensaio separado e revertido.

## Evidence

- **Before:** SQL real sob aluno gravou 900 XP, executou touch_streak e cadastro por metadata concedeu admin.
  **After:** escritas oficiais/helpers recusados; aluno/educador continuam cadastrando, metadata admin resulta em student e service_role confiável provisiona cargo.
- Revisão Spec encontrou reset por exclusão/recriação; vermelho reproduzido, INSERT/DELETE retirados e consumidor ajustado. Padrões encontrou seed sem administrador; vermelho por is_admin=false, escrita confiável corrigida e seed real reaplicado duas vezes com rollback. Conferências incrementais sem novos achados materiais; revisão humana adicional dispensada no fork.
- SQL final 0001–0024: permissions, seed, sanidade, learning e concorrências aprovados. Edição pessoal, mistura de campos, identidade alheia, anon/admin, rollback, estudo e desativação exercitados no banco fictício verificado.
- Lint, typecheck, Vitest 2/2, test:check, build e test:db:check aprovados; **24 E2E Chromium passaram (29,4s)**. HTTP fictício verifica payload/feedback de Perfil, Configurações e CRUD; não substitui SQL/RLS.
- Evidências visuais em docs/evidencias/campos-oficiais-perfil. Projeto local athen-gamificacao-test, 127.0.0.1:55432, container 28f3a7f55c6c; parado preservando banco. Questionário/propostas literais preservados.
- Nenhuma coluna/assinatura pública de dados alterada: tipos gerados preservados, sem edição manual ou regeneração desnecessária.
- [CI 41233522556](https://github.com/embertoni/Athen-Teste/actions/runs/41233522556), commit a89d1eb: quality, database e e2e aprovados. Logs conferidos: migração 0024, permissions, seed real duas vezes com rollback e concorrências; **24 E2E (21,6s)**. Descrição remota conferida com acentos íntegros e sem U+FFFD.

## Merge Danger

**Door:** two-way

Alteração de privilégios e cadastro, sem reescrever resultados/saldos existentes. Reversão exige coordenar grants e consumidores; restaurar permissões antigas reabriria os caminhos corrigidos. Aplicada somente no banco local fictício; nenhum deploy ou SQL remoto.

**Blast Radius:** perfil

O browser administrativo deixa de excluir/recriar perfil ou alterar campos oficiais. Criação segue Auth; administração de cargos exige backend confiável. O seed contém somente fixtures e não deve ser usado em dados reais. Snapshot, ordinal, livro decimal/abertura, unicidade entre tentativas diferentes, matrícula/progresso e correção de sala continuam pendentes no ticket 04/05.

### Uso de IA

- Ferramenta(s): Codex e revisão técnica por agentes somente de leitura.
- Escopo gerado por IA: migração, adapter/CRUD, compatibilidade do seed, testes SQL/E2E, CI e registros.
- Revisado e validado localmente por: Codex com comandos reais e eixos Padrões/Spec; revisão humana adicional dispensada pelo responsável neste fork.
