import { expect, test, type Page } from '@playwright/test'

const userId = '11111111-1111-4111-8111-111111111111'
const friendId = '22222222-2222-4222-8222-222222222222'
const courseId = '33333333-3333-4333-8333-333333333333'
const roomId = '44444444-4444-4444-8444-444444444444'
const friend = { id: friendId, display_name: 'Pessoa de teste', username: 'pessoa', level: 2, xp_global: 150, streak_count: 0, bio: 'Aprendendo em conjunto.', avatar_url: null }

// A fronteira HTTP é fictícia: estes testes verificam a interface reconciliada,
// sem acessar autenticação, políticas ou dados de um Supabase real.
async function preparePage(page: Page, options: { missionsFail?: boolean } = {}) {
  const user = { id: userId, aud: 'authenticated', role: 'authenticated', email: 'aluno@example.test', user_metadata: {}, app_metadata: {} }
  await page.addInitScript(({ user }) => {
    localStorage.setItem('sb-example-auth-token', JSON.stringify({
      access_token: 'test-token', refresh_token: 'test-refresh', token_type: 'bearer',
      expires_at: Math.floor(Date.now() / 1000) + 3600, user,
    }))
  }, { user })
  await page.route('https://example.supabase.co/**', async route => {
    const request = route.request()
    const url = new URL(request.url())
    const path = url.pathname.split('/').at(-1) ?? ''
    const profile = url.searchParams.get('id') === 'eq.' + friendId ? friend : { id: userId, display_name: 'Aluno', username: 'aluno', level: 1, xp_global: 0 }
    const responses: Record<string, unknown> = {
      user,
      profiles: request.headers()['accept']?.includes('object') ? profile : [friend],
      courses: [{ id: courseId, title: 'Prática', status: 'published', category: 'Tecnologia', visibility: 'public', creator_id: friendId }],
      notebooks: [
        { id: 'notebook-pratica', title: 'Prática', user_id: userId, created_at: '2026-10-01T12:00:00Z' },
        { id: 'notebook-historia', title: 'História', user_id: userId, created_at: '2026-10-01T12:00:00Z' },
      ],
      friendships: [{ id: 'friendship', requester_id: userId, addressee_id: friendId, status: 'accepted' }],
      medals: [{ code: 'first_lesson', name: 'Primeira aula', description: 'Concluiu uma aula.', icon: '🏅' }],
      user_medals: [{ user_id: friendId, medal_code: 'first_lesson', featured: true }],
      rooms: [{ id: roomId, course_id: courseId, name: 'Sala de teste', educator_id: friendId, access_code: 'ABC123', code_active: true, pac_visibility: 'members' }],
      room_members: [{ room_id: roomId, user_id: userId, status: 'active', xp_internal: 10, pac_internal: 50, progress: 0 }],
      modules: [{ id: 'module-test', course_id: courseId, title: 'Módulo inicial', position: 0 }],
      lessons: [{ id: 'lesson-test', module_id: 'module-test', title: 'Aula da sala', content: 'Conteúdo preservado.', position: 0 }],
      missions: [
        { id: 'mission-published', room_id: roomId, title: 'Missão publicada', description: 'Estude nesta sala.', status: 'published', reward_xp: 25 },
        { id: 'mission-draft', room_id: roomId, title: 'Missão em rascunho', status: 'draft', reward_xp: 99 },
      ],
    }
    const fail = path === 'missions' && options.missionsFail
    await route.fulfill({ status: fail ? 400 : 200, contentType: 'application/json', body: JSON.stringify(fail ? { message: 'Falha controlada' } : responses[path] ?? []) })
  })
}

test('endereço antigo de ranking abre Ligas', async ({ page }) => {
  await preparePage(page)
  await page.goto('/ranking')
  await expect(page).toHaveURL(/\/ligas$/)
  await expect(page.getByRole('heading', { name: 'Ligas', exact: true })).toBeVisible()
})

for (const width of [360, 768, 1440]) {
  test(`estante mantém busca sem acentos e tema do fork em ${width}px`, async ({ page }, testInfo) => {
    await preparePage(page)
    await page.setViewportSize({ width, height: 900 })
    await page.goto('/caderno')
    await expect(page.getByRole('heading', { name: 'Minha estante' })).toBeVisible()
    await page.getByRole('searchbox', { name: 'Pesquisar notebooks' }).fill('pratica')
    await expect(page.getByRole('button', { name: /Abrir.*Prática/ })).toBeVisible()
    await expect(page.getByRole('button', { name: /Abrir.*História/ })).toHaveCount(0)
    await page.screenshot({ path: testInfo.outputPath(`estante-${width}.png`), animations: 'disabled' })
  })
}

test('Amigos mantém perfil e medalhas com o cabeçalho do fork', async ({ page }, testInfo) => {
  await preparePage(page)
  await page.goto('/amigos')
  await expect(page.getByRole('heading', { name: 'Amigos', exact: true })).toBeVisible()
  await page.screenshot({ path: testInfo.outputPath('amigos.png'), animations: 'disabled' })
  await page.getByRole('button', { name: 'Ver perfil de Pessoa de teste', exact: true }).click()
  const profile = page.getByRole('dialog', { name: 'Pessoa de teste' })
  await expect(profile.getByText('Aprendendo em conjunto.')).toBeVisible()
  await profile.getByRole('img', { name: 'Primeira aula: Concluiu uma aula.' }).focus()
  await expect(profile.getByRole('tooltip')).toContainText('Concluiu uma aula.')
  await page.screenshot({ path: testInfo.outputPath('amigo-perfil.png'), animations: 'disabled' })
})

test('sala preserva missões publicadas e execução de aula', async ({ page }, testInfo) => {
  await preparePage(page)
  await page.goto('/salas')
  await page.getByRole('button', { name: /Sala de teste/ }).click()
  const room = page.getByRole('dialog', { name: 'Sala de teste' })
  const missions = room.getByRole('region', { name: 'Missões da sala' })
  await expect(missions.getByText('Missão publicada', { exact: true })).toBeVisible()
  await expect(missions).toContainText('Recompensa anunciada: 25 XP')
  await expect(missions.getByText('Missão em rascunho')).toHaveCount(0)
  await missions.scrollIntoViewIfNeeded()
  await page.screenshot({ path: testInfo.outputPath('sala-missoes.png'), animations: 'disabled' })
  const module = room.getByRole('button', { name: /Módulo inicial/ })
  if (await module.getAttribute('aria-expanded') === 'false') await module.click()
  await room.getByRole('button', { name: /Aula da sala/ }).click()
  await expect(page.getByRole('heading', { name: 'Aula da sala', exact: true })).toBeVisible()
  await expect(page.getByText('Conteúdo preservado.', { exact: true })).toBeVisible()
})

test('falha nas missões não oculta o conteúdo da sala', async ({ page }) => {
  await preparePage(page, { missionsFail: true })
  await page.goto('/salas')
  await page.getByRole('button', { name: /Sala de teste/ }).click()
  const room = page.getByRole('dialog', { name: 'Sala de teste' })
  await expect(room.getByRole('alert')).toHaveText('Não foi possível carregar as missões da sala.')
  await expect(room.getByRole('button', { name: /Módulo inicial/ })).toBeVisible()
})
