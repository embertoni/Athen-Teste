import { mkdir, copyFile } from 'node:fs/promises';
import { workdir } from './db-test-env.ts';

await mkdir(`${workdir}supabase`, { recursive: true });
await copyFile(new URL('../tests/db/supabase/config.toml', import.meta.url), `${workdir}supabase/config.toml`);
console.warn('Configuracao de ensaio preparada em .supabase-test/supabase; nenhuma migracao aplicada.');
