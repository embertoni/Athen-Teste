import { readFile } from 'node:fs/promises';
import { testClient, verifyContainer, verifyMarker } from './db-test-env.ts';
import { testConcurrentSessions } from '../tests/db/concurrency.ts';

const client = testClient();
let connected = false;
try {
  await verifyContainer();
  await client.connect();
  connected = true;
  await verifyMarker(client);
  if (process.argv.includes('--concurrency')) {
    await testConcurrentSessions(client);
  } else {
    await client.query('begin');
    await client.query(await readFile(new URL('../tests/db/sanity.sql', import.meta.url), 'utf8'));
  }
  if (process.argv.includes('--prove-failure')) {
    await client.query("do $$ begin raise exception 'Falha intencional do harness'; end $$");
  }
  if (!process.argv.includes('--concurrency')) {
    console.warn('Sanidade aprovada: aluno autenticado, RLS e conclusao de aula vazia com zero XP.');
  }
} catch (error) {
  console.error(error instanceof Error ? error.message : 'Falha no teste SQL.');
  process.exitCode = 1;
} finally {
  if (connected) await client.query('rollback').catch(() => undefined);
  await client.end();
}
