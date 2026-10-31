import { readdir, readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { projectId, testClient, verifyContainer, verifyMarker } from './db-test-env.ts';

const client = testClient();
let connected = false;
try {
  await verifyContainer();
  await client.connect();
  connected = true;
  const dir = new URL('../supabase/migrations/', import.meta.url);
  const names = (await readdir(dir)).filter(name => /^\d{4}_[a-z0-9_]+\.sql$/.test(name)).sort();
  if (!names.length) throw new Error('Nenhuma migracao numerada encontrada.');
  const migrations = await Promise.all(names.map(async name => {
    const sql = await readFile(new URL(name, dir), 'utf8');
    return { name, sql, hash: createHash('sha256').update(sql).digest('hex') };
  }));
  const manifest = JSON.stringify(migrations.map(({ name, hash }) => ({ name, hash })));
  await client.query('begin');
  await client.query("select pg_advisory_xact_lock(42001)");
  const { rows } = await client.query("select to_regclass('athen_test.environment') as marker, to_regclass('public.profiles') as profiles");
  if (rows[0].marker) {
    await verifyMarker(client);
    const applied = await client.query('select manifest from athen_test.environment');
    if (applied.rows[0].manifest !== manifest) throw new Error('Esquema mudou: recrie somente o projeto descartavel antes do bootstrap.');
    console.warn('Bootstrap ja aplicado com o mesmo manifesto; nenhuma migracao repetida.');
  } else {
    if (rows[0].profiles) throw new Error('Banco ja possui esquema sem marcador de ensaio; bootstrap recusado.');
    for (const migration of migrations) {
      await client.query(migration.sql);
      console.warn(`Aplicada ${migration.name} (${migration.hash.slice(0, 12)}).`);
    }
    await client.query('create schema athen_test; revoke all on schema athen_test from public');
    await client.query('create table athen_test.environment (project_id text primary key, manifest text not null)');
    await client.query('insert into athen_test.environment values ($1, $2)', [projectId, manifest]);
  }
  await client.query('commit');
} catch (error) {
  if (connected) await client.query('rollback').catch(() => undefined);
  console.error(error instanceof Error ? error.message : 'Falha no bootstrap.');
  process.exitCode = 1;
} finally {
  await client.end();
}
