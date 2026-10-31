import { readFile } from 'node:fs/promises';
import { testClient, verifyContainer, verifyMarker } from './db-test-env.ts';
import { testConcurrentSessions } from '../tests/db/concurrency.ts';
import { testConcurrentFinalization } from '../tests/db/learning-concurrency.ts';

const client = testClient();
let connected = false;
try {
  await verifyContainer();
  await client.connect();
  connected = true;
  await verifyMarker(client);
  const concurrent = process.argv.includes('--concurrency') || process.argv.includes('--learning-concurrency');
  if (process.argv.includes('--learning-concurrency')) {
    await testConcurrentFinalization(client);
    await testConcurrentFinalization(client, true);
  } else if (process.argv.includes('--concurrency')) {
    await testConcurrentSessions(client);
  } else {
    await client.query('begin');
    const file = process.argv.includes('--learning') ? 'learning.sql' : 'sanity.sql';
    await client.query(await readFile(new URL(`../tests/db/${file}`, import.meta.url), 'utf8'));
  }
  if (process.argv.includes('--prove-failure')) {
    await client.query("do $$ begin raise exception 'Falha intencional do harness'; end $$");
  }
  if (!concurrent) {
    console.warn(process.argv.includes('--learning') ? 'Aprendizagem aprovada: confirmacao persistida sob aluno/RLS.'
      : 'Sanidade aprovada: aluno autenticado, RLS e conclusao de aula vazia com zero XP.');
  }
} catch (error) {
  console.error(error instanceof Error ? error.message : 'Falha no teste SQL.');
  process.exitCode = 1;
} finally {
  if (connected) await client.query('rollback').catch(() => undefined);
  await client.end();
}
