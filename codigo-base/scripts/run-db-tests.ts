import { readFile } from 'node:fs/promises';
import { testClient, verifyContainer, verifyMarker } from './db-test-env.ts';
import { testConcurrentSessions } from '../tests/db/concurrency.ts';
import { testConcurrentLearning } from '../tests/db/learning-concurrency.ts';

const client = testClient();
let connected = false;
try {
  await verifyContainer();
  await client.connect();
  connected = true;
  await verifyMarker(client);
  const concurrent = process.argv.includes('--concurrency') || process.argv.includes('--learning-concurrency');
  if (process.argv.includes('--learning-concurrency')) {
    await testConcurrentLearning(client);
    await testConcurrentLearning(client, 'answer');
    await testConcurrentLearning(client, 'first-submission');
  } else if (process.argv.includes('--concurrency')) {
    await testConcurrentSessions(client);
  } else {
    await client.query('begin');
    if (process.argv.includes('--seed')) {
      const seed = await readFile(new URL('../supabase/seed.sql', import.meta.url), 'utf8');
      await client.query(seed);
      await client.query(seed);
    }
    const file = process.argv.includes('--typed-credits') ? 'typed-credits.sql'
      : process.argv.includes('--ordinal-credits') ? 'ordinal-credits.sql'
      : process.argv.includes('--lesson-versions') ? 'lesson-versions.sql'
      : process.argv.includes('--start-attempt') ? 'start-attempt.sql'
      : process.argv.includes('--first-submissions') ? 'first-submissions.sql'
      : process.argv.includes('--seed') ? 'seed.sql'
      : process.argv.includes('--permissions') ? 'permissions.sql'
      : process.argv.includes('--learning') ? 'learning.sql' : 'sanity.sql';
    await client.query(await readFile(new URL(`../tests/db/${file}`, import.meta.url), 'utf8'));
  }
  if (process.argv.includes('--prove-failure')) {
    await client.query("do $$ begin raise exception 'Falha intencional do harness'; end $$");
  }
  if (!concurrent) {
    console.warn(process.argv.includes('--typed-credits') ? 'Origem tipada e abertura aprovadas: base unica por contexto, trava de escrita decimal e abertura de legado auditada.'
      : process.argv.includes('--ordinal-credits') ? 'Ordinal e livro decimal aprovados: ordem por usuario/questao/contexto, credito base/ordinal unico, saldo decimal e replay sem recredito.'
      : process.argv.includes('--lesson-versions') ? 'Versoes de aula aprovadas: snapshot congelado, edicao nao altera versao, tentativa registra versao.'
      : process.argv.includes('--start-attempt') ? 'Inicio autorizado aprovado: usuario e contexto validados no servidor.'
      : process.argv.includes('--first-submissions') ? 'Primeiro envio aprovado: resposta preservada no reenvio.'
      : process.argv.includes('--seed') ? 'Seed ficticio aprovado em transacao descartada: papeis e reaplicacao.'
      : process.argv.includes('--permissions') ? 'Permissoes aprovadas: campos oficiais e edicao legitima do perfil.'
      : process.argv.includes('--learning') ? 'Aprendizagem aprovada: confirmacao persistida sob aluno/RLS.'
      : 'Sanidade aprovada: aluno autenticado, RLS e conclusao de aula vazia com zero XP.');
  }
} catch (error) {
  console.error(error instanceof Error ? error.message : 'Falha no teste SQL.');
  process.exitCode = 1;
} finally {
  if (connected) await client.query('rollback').catch(() => undefined);
  await client.end();
}
