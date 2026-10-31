import { expect, test, type Page } from '@playwright/test'

const userId = '42200000-0000-4000-a000-000000000001'

// HTTP/sessão fictícios: verifica os consumidores e seus payloads pessoais.
// A autorização efetiva é exercitada em permissions.sql, sem mocks de banco.
async function prepareProfile(page: Page) {
  const user = { id: userId, aud: 'authenticated', role: 'authenticated', email: 'aluno@example.test', user_metadata: {}, app_metadata: {} }
  let profile = { id: userId, username: 'aluno', display_name: 'Aluno', role: 'student', bio: 'Bio inicial',
    avatar_url: null, banner_url: null, xp_global: 4, level: 1, streak_count: 1,
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
