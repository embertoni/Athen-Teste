import { Client } from 'pg';
import { fileURLToPath } from 'node:url';
import { readFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';

export const projectId = 'athen-gamificacao-test';
export const workdir = fileURLToPath(new URL('../.supabase-test/', import.meta.url));

// No application .env, production URL, or legacy runner variable is loaded.
export function testClient() {
  const value = process.env.ATHEN_TEST_DB_URL;
  if (!value) throw new Error('Defina ATHEN_TEST_DB_URL para o projeto local de teste.');
  let url: URL;
  try { url = new URL(value); } catch { throw new Error('ATHEN_TEST_DB_URL invalida.'); }
  if (url.protocol !== 'postgresql:' || url.hostname !== '127.0.0.1'
    || url.port !== '55432' || url.pathname !== '/postgres'
    || url.username !== 'postgres' || url.search || url.hash) {
    throw new Error('Destino rejeitado: use somente postgres em 127.0.0.1:55432/postgres, sem parametros.');
  }
  return new Client({ connectionString: value, connectionTimeoutMillis: 5000,
    query_timeout: 30000, application_name: projectId });
}

export async function verifyContainer() {
  const config = await readFile(`${workdir}supabase/config.toml`, 'utf8');
  const expected = await readFile(new URL('../tests/db/supabase/config.toml', import.meta.url), 'utf8');
  if (config !== expected) throw new Error('Configuracao local difere do projeto de ensaio. Execute test:db:prepare.');
  const containers = JSON.parse(execFileSync(process.env.ATHEN_TEST_DOCKER || 'docker',
    ['inspect', `supabase_db_${projectId}`], { encoding: 'utf8' }));
  const container = containers[0];
  const ports = container?.NetworkSettings?.Ports?.['5432/tcp'] || [];
  if (!container?.State?.Running || container?.Config?.Labels?.['com.supabase.cli.project'] !== projectId
    || !ports.some((port: { HostPort: string }) => port.HostPort === '55432')) {
    throw new Error('Container/projeto/porta nao corresponde ao destino de ensaio.');
  }
  console.warn(`Destino confirmado: ${projectId}, container ${container.Id.slice(0, 12)}, 127.0.0.1:55432/postgres.`);
}

export async function verifyMarker(client: Client) {
  const { rows } = await client.query('select project_id from athen_test.environment');
  if (rows.length !== 1 || rows[0].project_id !== projectId) {
    throw new Error('Marcador de banco isolado ausente ou invalido.');
  }
}
