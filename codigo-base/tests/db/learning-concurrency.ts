import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import type { Client } from 'pg';
import { testClient, verifyMarker } from '../../scripts/db-test-env.ts';

async function cleanFixtures(admin: Client, course: string, users: string[]) {
  await admin.query('begin');
  try {
    await admin.query('delete from public.courses where id=$1', [course]);
    await admin.query('delete from auth.users where id=any($1::uuid[])', [users]);
    await admin.query('commit');
  } catch (error) {
    await admin.query('rollback');
    throw error;
  }
}

export async function testConcurrentLearning(admin: Client, mode: 'finalize' | 'answer' | 'first-submission' = 'finalize') {
  const answerRace = mode === 'answer';
  const firstSubmissionRace = mode === 'first-submission';
  const student = randomUUID();
  const author = randomUUID();
  const course = randomUUID();
  const module = randomUUID();
  const lesson = randomUUID();
  const question = randomUUID();
  const attempt = randomUUID();
  const clients = [testClient(), testClient()];
  let running: Promise<PromiseSettledResult<unknown>[]> | undefined;
  let transaction = false;
  try {
    await admin.query('begin');
    transaction = true;
    for (const id of [student, author]) {
      await admin.query('insert into auth.users (id,email,raw_user_meta_data) values ($1,$2,$3)',
        [id, `${id}@example.invalid`, { username: id, display_name: 'Ensaio de confirmacao' }]);
    }
    await admin.query(`insert into public.courses(id,creator_id,title,slug,status,visibility)
      values($1::uuid,$2,'Ensaio',$1::text,'published','public')`, [course, author]);
    await admin.query('insert into public.modules(id,course_id,title) values($1,$2,\'Modulo\')', [module, course]);
    await admin.query(`insert into public.lessons(id,module_id,title,status) values($1,$2,'Aula','published')`, [lesson, module]);
    await admin.query(`insert into public.questions(id,lesson_id,type,prompt,config,xp_value)
      values($1,$2,'multiple_choice','Escolha A',$3,4)`, [question, lesson, { options: [{ id: 'a', correct: true }, { id: 'b', correct: false }] }]);
    await admin.query('insert into public.attempts(id,user_id,lesson_id,course_id) values($1,$2,$3,$4)',
      [attempt, student, lesson, course]);
    if (!firstSubmissionRace) {
      await admin.query('insert into public.answers(attempt_id,question_id,submitted) values($1,$2,$3)',
        [attempt, question, { selected: ['a'] }]);
    }
    await admin.query('commit');
    transaction = false;
    await Promise.all(clients.map(async client => { await client.connect(); await verifyMarker(client); }));
    const pids = await Promise.all(clients.map(async client =>
      (await client.query<{ pid: number }>('select pg_backend_pid() as pid')).rows[0].pid));
    assert.notEqual(pids[0], pids[1]);
    await admin.query('begin');
    transaction = true;
    await admin.query('select id from public.attempts where id=$1 for update', [attempt]);
    running = Promise.allSettled(clients.map(async (client, index) => {
      await client.query('begin');
      try {
        await client.query('set local role authenticated');
        await client.query("select set_config('request.jwt.claim.sub',$1,true)", [student]);
        await client.query("select set_config('request.jwt.claims',$1,true)", [JSON.stringify({ sub: student, role: 'authenticated' })]);
        await client.query("set local statement_timeout='10s'");
        if (firstSubmissionRace) {
          const receipt = (await client.query('select * from public.save_attempt_answer($1,$2,$3)',
            [attempt, question, { selected: [index === 0 ? 'a' : 'b'] }])).rows[0];
          await client.query('commit');
          return receipt;
        }
        if (answerRace && index === 1) {
          try {
            await client.query('select * from public.save_attempt_answer($1,$2,$3)', [attempt, question, { selected: ['a'] }]);
          } catch (error) {
            if (!(error instanceof Error && 'code' in error && error.code === '42501')) throw error;
            await client.query('rollback');
            return { answerRejectedAfterFinalization: true };
          }
          await client.query('commit');
          return { answerSavedBeforeFinalization: true };
        }
        const result = (await client.query('select * from public.finalize_attempt($1)', [attempt])).rows[0];
        assert.deepEqual(result, { correct_count: 1, total_count: 1, xp_earned: 4 });
        const receipt = (await client.query('select * from public.get_attempt_confirmation($1)', [attempt])).rows[0];
        await client.query('commit');
        return receipt;
      } catch (error) {
        await client.query('rollback');
        throw error;
      }
    }));
    let waiting = 0;
    const deadline = Date.now() + 8000;
    while (waiting !== 2 && Date.now() < deadline) {
      waiting = (await admin.query<{ n: number }>(`select count(distinct pid)::int as n from pg_locks
        where pid=any($1::int[]) and not granted`, [pids])).rows[0].n;
    }
    assert.equal(waiting, 2, 'Dois comandos de aprendizagem precisam estar bloqueados simultaneamente');
    await admin.query('commit');
    transaction = false;
    const receipts: unknown[] = [];
    for (const worker of await running) {
      if (worker.status === 'rejected') throw worker.reason;
      receipts.push(worker.value);
    }
    if (!answerRace) assert.deepEqual(receipts[0], receipts[1], 'Ambas precisam receber o mesmo instante e resultado');
    if (firstSubmissionRace) {
      const answers = await admin.query('select first_submitted_at from public.answers where attempt_id=$1', [attempt]);
      assert.equal(answers.rows.length, 1);
      assert.ok(answers.rows[0].first_submitted_at instanceof Date);
      assert.equal((await admin.query('select xp_global from public.profiles where id=$1', [student])).rows[0].xp_global, 0);
      assert.equal((await admin.query('select count(*)::int as n from public.learning_results where attempt_id=$1', [attempt])).rows[0].n, 0);
      console.warn('Primeiros envios concorrentes aprovados: dois PIDs em locks, uma resposta e mesmo instante, sem XP ou resultado de conclusao.');
      return;
    }
    assert.equal((await admin.query('select xp_global from public.profiles where id=$1', [student])).rows[0].xp_global, 4);
    assert.equal((await admin.query('select count(*)::int as n from public.learning_results where attempt_id=$1', [attempt])).rows[0].n, 1);
    console.warn(answerRace ? 'Resposta/finalizacao concorrentes aprovadas: ordem de locks consistente, uma confirmacao e 4 XP.'
      : 'Finalizacao concorrente aprovada: dois PIDs aguardaram locks, uma confirmacao e 4 XP.');
  } finally {
    if (transaction) await admin.query('rollback');
    if (running) await running;
    await Promise.allSettled(clients.map(client => client.end()));
    await cleanFixtures(admin, course, [student, author]);
  }
}
