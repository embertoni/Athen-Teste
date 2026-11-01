import { expect, test, type Page } from '@playwright/test'

const userId = '42200000-0000-4000-a000-000000000001'

// HTTP/sessão fictícios: verifica os consumidores e seus payloads pessoais.
// A autorização efetiva é exercitada em permissions.sql, sem mocks de banco.
async function prepareProfile(page: Page) {
  const user = { id: userId, aud: 'authenticated', role: 'authenticated', email: 'aluno@example.test', user_metadata: {}, app_metadata: {} }
  let profile = { id: userId, username: 'aluno', display_name: 'Aluno', role: 'student', bio: 'Bio inicial',
    avatar_url: null, banner_url: null, xp_global: 4, level: 1, xp_credits: '1.3333', streak_count: 1,
    last_study_date: '2026-10-31', account_status: 'active', notification_preferences: {} }
  const writes: unknown[] = []
  await page.addInitScript(({ user }) => {
    localStorage.setItem('sb-example-auth-token', JSON.stringify({
      access_token: 'test-token', refresh_token: 'test-refresh', token_type: 'bearer',
      expires_at: Math.floor(Date.now() / 1000) + 3600, user,
    }))
  }, { user })
  await page.route('https://example.supabase.co/**', async route => {
    const request = route.request()
    const path = new URL(request.url()).pathname.split('/').at(-1)
    if (path === 'profiles' && request.method() === 'PATCH') {
      const payload: unknown = request.postDataJSON()
      writes.push(payload)
      if (payload && typeof payload === 'object') profile = { ...profile, ...payload }
    }
    const profileResponse = request.headers()['accept']?.includes('object') ? profile : [profile]
    await route.fulfill({ contentType: 'application/json',
      body: JSON.stringify(path === 'user' ? user : path === 'profiles' ? profileResponse : []) })
  })
  return writes
}

test('perfil salva dados pessoais sem reenviar campos oficiais', async ({ page }, testInfo) => {
  const writes = await prepareProfile(page)
  await page.goto('/profile')
  await page.getByRole('button', { name: 'Editar perfil', exact: true }).click()
  await page.getByLabel('Nome de exibição', { exact: true }).fill('Nome editado')
  await page.getByLabel('Nome de usuário', { exact: true }).fill('aluno-editado')
  await page.getByLabel(/Bio/).fill('Bio editada')
  await page.getByRole('button', { name: 'Salvar', exact: true }).click()
  await expect(page.getByRole('button', { name: 'Editar perfil', exact: true })).toBeVisible()
  await expect(page.getByText('Nome editado', { exact: true }).first()).toBeVisible()
  expect(writes).toEqual([{ display_name: 'Nome editado', username: 'aluno-editado', bio: 'Bio editada' }])
  await page.screenshot({ path: testInfo.outputPath('perfil-editado.png'), animations: 'disabled' })
})

test('perfil mostra o saldo decimal de créditos como leitura, sem escrevê-lo', async ({ page }) => {
  const writes = await prepareProfile(page)
  await page.goto('/profile')
  // O saldo decimal (livro novo) aparece em leitura, ao lado do XP inteiro legado.
  await expect(page.getByText('1,3333 créditos', { exact: true })).toBeVisible()
  // Editar o perfil não inclui o saldo decimal nem qualquer campo oficial na carga.
  await page.getByRole('button', { name: 'Editar perfil', exact: true }).click()
  await page.getByLabel(/Bio/).fill('Bio nova')
  await page.getByRole('button', { name: 'Salvar', exact: true }).click()
  await expect(page.getByRole('button', { name: 'Editar perfil', exact: true })).toBeVisible()
  expect(writes).toEqual([{ display_name: 'Aluno', username: 'aluno', bio: 'Bio nova' }])
  for (const payload of writes) {
    expect(Object.keys(payload as object)).not.toContain('xp_credits')
    expect(Object.keys(payload as object)).not.toContain('xp_global')
    expect(Object.keys(payload as object)).not.toContain('level')
  }
})

test('configurações salvam identidade e preferências sem campos oficiais', async ({ page }) => {
  const writes = await prepareProfile(page)
  await page.goto('/configuracoes')
  await expect(page.getByLabel('Nome display')).toHaveValue('Aluno')
  await page.getByLabel('Nome display').fill('Nome configurado')
  await page.getByRole('textbox', { name: /^Nome de usuário/ }).fill('aluno-configurado')
  await page.getByRole('switch', { name: 'Pedido de amizade: ativada', exact: true }).click()
  await page.getByRole('button', { name: 'Salvar alterações', exact: true }).click()
  await expect(page.getByRole('status')).toContainText('salv')
  expect(writes).toEqual([
    { display_name: 'Nome configurado', username: 'aluno-configurado' },
    { notification_preferences: { atualizacao_curso: true, pedido_amizade: false, lembrete_estudo: true } },
  ])
})

test('CRUD mantém edição de perfil sem oferecer exclusão direta', async ({ page }, testInfo) => {
  await prepareProfile(page)
  await page.goto('/crud')
  const row = page.getByRole('row').filter({ hasText: userId })
  await expect(row).toBeVisible()
  await expect(row.getByRole('button', { name: 'Alterar', exact: true })).toBeVisible()
  await expect(row.getByRole('button', { name: 'Apagar', exact: true })).toHaveCount(0)
  await page.getByRole('table').screenshot({ path: testInfo.outputPath('crud-perfis.png'), animations: 'disabled' })
})

test('CRUD republica a versão de uma aula pela ação por linha', async ({ page }) => {
  const lessonId = '42200000-0000-4000-a000-000000000050'
  const moduleId = '42200000-0000-4000-a000-000000000040'
  const rpcCalls: unknown[] = []
  const user = { id: userId, aud: 'authenticated', role: 'authenticated', email: 'educador@example.test', user_metadata: {}, app_metadata: {} }
  await page.addInitScript(({ user }) => {
    localStorage.setItem('sb-example-auth-token', JSON.stringify({
      access_token: 'test-token', refresh_token: 'test-refresh', token_type: 'bearer',
      expires_at: Math.floor(Date.now() / 1000) + 3600, user,
    }))
  }, { user })
  await page.route('https://example.supabase.co/**', async route => {
    const request = route.request()
    const url = new URL(request.url())
    const path = url.pathname.split('/').at(-1)
    let data: unknown = []
    if (path === 'user') data = user
    if (path === 'modules') data = [{ id: moduleId, course_id: 'curso-x', title: 'Módulo', description: null, color: null, position: 0 }]
    if (path === 'lessons') data = [{ id: lessonId, module_id: moduleId, title: 'Aula com questões', content: null, position: 0, status: 'published' }]
    if (path === 'lesson_versions') data = [{ id: 'v1', lesson_id: lessonId, version_number: 1, snapshot: {}, published_by: userId, published_at: '2026-10-31T12:00:00Z' }]
    if (path === 'publish_lesson_version') {
      rpcCalls.push(request.postDataJSON())
      data = { id: 'versao-nova', lesson_id: lessonId, version_number: 2, snapshot: {}, published_by: userId, published_at: '2026-11-01T12:00:00Z' }
    }
    // Respeita a distinção objeto vs array que o cliente usa em .single().
    const body = request.headers()['accept']?.includes('object') && Array.isArray(data) ? data[0] ?? {} : data
    await route.fulfill({ contentType: 'application/json', body: JSON.stringify(body) })
  })
  await page.goto('/crud')
  await page.getByRole('button', { name: 'Aulas', exact: true }).click()
  const row = page.getByRole('row').filter({ hasText: 'Aula com questões' })
  await expect(row).toBeVisible()
  // A versão corrente da aula aparece na lista (lida por listarVersoes).
  await expect(row.getByText('v1', { exact: true })).toBeVisible()
  await row.getByRole('button', { name: 'Republicar versão', exact: true }).click()
  await expect(page.getByRole('status')).toContainText('Versão 2 publicada')
  // A ação chamou publish_lesson_version para a aula correta, uma vez.
  expect(rpcCalls).toEqual([{ p_lesson_id: lessonId }])
})
