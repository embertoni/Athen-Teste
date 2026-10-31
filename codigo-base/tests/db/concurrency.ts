import assert from 'node:assert/strict';
import { randomInt, randomUUID } from 'node:crypto';
import type { Client } from 'pg';
import { testClient, verifyMarker } from '../../scripts/db-test-env.ts';

async function cleanFixtures(admin: Client, ids: { rooms: string[]; courses: string[]; users: string[] }) {
  await admin.query('begin');
  try {
    await admin.query('delete from public.rooms where id = any($1::uuid[])', [ids.rooms]);
    await admin.query('delete from public.courses where id = any($1::uuid[])', [ids.courses]);
    await admin.query('delete from auth.users where id = any($1::uuid[])', [ids.users]);
    await admin.query('commit');
  } catch (error) {
    await admin.query('rollback');
    throw error;
  }
}

// Administrative setup/audit is separate from the authenticated commands.
export async function testConcurrentSessions(admin: Client) {
  const educator = randomUUID();
  const students = [randomUUID(), randomUUID()];
  const course = randomUUID();
  const privateCourse = randomUUID();
  const rooms = [randomUUID(), randomUUID()];
  const codes = [randomUUID(), randomUUID()];
  const barrier = randomInt(1, 2147483647);
  const clients = students.map(() => testClient());
  let settingUp = false;
  let barrierHeld = false;
  let running: Promise<PromiseSettledResult<void>[]> | undefined;
  try {
    await admin.query('begin');
    settingUp = true;
    for (const id of [educator, ...students]) {
      await admin.query('insert into auth.users (id, email, raw_user_meta_data) values ($1,$2,$3)',
        [id, `${id}@example.invalid`, { username: id, display_name: 'Ensaio concorrente' }]);
    }
    await admin.query("update public.profiles set role = 'educator' where id = $1", [educator]);
    for (const [id, visibility] of [[course, 'public'], [privateCourse, 'private']]) {
      await admin.query(`insert into public.courses (id, creator_id, title, slug, status, visibility)
        values ($1::uuid,$2,'Ensaio concorrente',$1::text,'published',$3)`, [id, educator, visibility]);
    }
    for (let index = 0; index < rooms.length; index++) {
      await admin.query(`insert into public.rooms (id, educator_id, course_id, name, access_code)
        values ($1,$2,$3,'Sala de ensaio',$4)`, [rooms[index], educator, course, codes[index]]);
      await admin.query(`insert into public.room_members (room_id,user_id,status,removed_at)
        values ($1,$2,'active',null)`, [rooms[index], educator]);
    }
    await admin.query('commit');
    settingUp = false;
    await Promise.all(clients.map(async client => {
      await client.connect();
      await verifyMarker(client);
    }));
    const pids = await Promise.all(clients.map(async client =>
      (await client.query<{ pid: number }>('select pg_backend_pid() as pid')).rows[0].pid));
    assert.notEqual(pids[0], pids[1], 'Alunos precisam de conexoes independentes');
    await admin.query('select pg_advisory_lock(42003,$1)', [barrier]);
    barrierHeld = true;
    running = Promise.allSettled(clients.map(async (client, index) => {
      try {
        await client.query('begin');
        await client.query('set local role authenticated');
        await client.query("select set_config('request.jwt.claim.sub',$1,true)", [students[index]]);
        await client.query("select set_config('request.jwt.claims',$1,true)",
          [JSON.stringify({ sub: students[index], role: 'authenticated' })]);
        await client.query("set local statement_timeout = '10s'");
        const identity = await client.query(`select current_user as role, auth.uid() as id,
          row_security_active('public.room_members'::regclass) as rls`);
        assert.deepEqual(identity.rows[0], { role: 'authenticated', id: students[index], rls: true });
        await client.query('select pg_advisory_xact_lock_shared(42003,$1)', [barrier]);
        const joined = await client.query('select public.join_room($1) as id', [codes[index]]);
        assert.equal(joined.rowCount, 1);
        const visible = await client.query(`select user_id,room_id,status from public.room_members
          where room_id = any($1::uuid[])`, [rooms]);
        assert.equal(visible.rowCount, 2);
        assert.ok(visible.rows.every(row => row.room_id === rooms[index] && row.status === 'active'));
        assert.deepEqual(visible.rows.map(row => row.user_id).sort(), [students[index], educator].sort());
        const privateRows = await client.query('select id from public.courses where id = $1', [privateCourse]);
        assert.equal(privateRows.rowCount, 0, 'Curso privado alheio permanece restrito');
        const enrollment = await client.query('select id from public.enrollments where course_id = $1', [course]);
        assert.equal(enrollment.rowCount, 0, 'Ingresso em sala nao cria matricula individual');
        await assert.rejects(client.query('select 1/0'), { code: '22012' });
      } finally {
        await client.query('rollback');
      }
    }));
    // Observe both actual waiters before releasing the barrier: no timing sleep.
    const deadline = Date.now() + 8000;
    let waiting = 0;
    while (waiting !== 2 && Date.now() < deadline) {
      const locks = await admin.query<{ count: number }>(`select count(*)::int as count from pg_locks
        where pid = any($1::int[]) and locktype = 'advisory' and not granted
          and classid = 42003 and objid = $2::oid`, [pids, barrier]);
      waiting = locks.rows[0].count;
    }
    assert.equal(waiting, 2, 'Duas sessoes precisam estar simultaneamente na barreira');
    await admin.query('select pg_advisory_unlock(42003,$1)', [barrier]);
    barrierHeld = false;
    const workers = await running;
    for (const worker of workers) if (worker.status === 'rejected') throw worker.reason;
    const reverted = await admin.query(`select user_id from public.room_members
      where room_id = any($1::uuid[]) and user_id = any($2::uuid[])`, [rooms, students]);
    assert.equal(reverted.rowCount, 0, 'Falhas precisam reverter os ingressos');
    console.warn('Concorrencia aprovada: dois alunos/RLS, duas salas, curso privado e rollback apos falha SQL.');
  } finally {
    if (settingUp) await admin.query('rollback');
    if (barrierHeld) await admin.query('select pg_advisory_unlock(42003,$1)', [barrier]);
    if (running) await running;
    await Promise.all(clients.map(client => client.end()));
    // Only UUIDs generated by this run are removed, after all workers finish.
    await cleanFixtures(admin, { rooms, courses: [course, privateCourse], users: [educator, ...students] });
  }
}
