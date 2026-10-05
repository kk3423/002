/* Usage: node run.js <extDir> <label> <scenario...>
 * All Instagram responses below are SIMULATED fixtures. */
const H = require('./harness');
const PIXEL = H.PIXEL;

function userBody(username, pk, extra) {
  const user = Object.assign({
    id: String(pk), username, full_name: 'Nome ' + username, biography: '', bio_links: [], external_url: null,
    edge_followed_by: { count: 1500 }, edge_follow: { count: 300 }, edge_owner_to_timeline_media: { count: 42 },
    is_private: false, is_verified: false, profile_pic_url: PIXEL, profile_pic_url_hd: PIXEL,
  }, extra || {});
  return { status: 200, body: { data: { user }, status: 'ok' } };
}
const F = {
  personalOmitted: (u, pk) => () => userBody(u, pk, { is_business_account: false, is_professional_account: false, biography: 'contato: pessoal@gmail.com' }),
  personalNull: (u, pk) => () => userBody(u, pk, { is_business_account: false, is_professional_account: false, business_email: null, business_phone_number: null, should_show_public_contacts: false }),
  businessFound: (u, pk, email) => () => userBody(u, pk, { is_business_account: true, is_professional_account: true, business_email: email, business_contact_method: 'UNKNOWN', should_show_public_contacts: true, biography: 'bio email: outro@bio.com', category_name: 'Loja' }),
  creatorNull: (u, pk) => () => userBody(u, pk, { is_business_account: false, is_professional_account: true, business_email: null, should_show_public_contacts: true }),
  businessHidden: (u, pk, email) => () => userBody(u, pk, { is_business_account: true, is_professional_account: true, business_email: email, should_show_public_contacts: false }),
  businessEmpty: (u, pk) => () => userBody(u, pk, { is_business_account: true, is_professional_account: true, business_email: '', should_show_public_contacts: true }),
  businessOmitted: (u, pk) => () => userBody(u, pk, { is_business_account: true, is_professional_account: true, biography: 'email na bio: bio@empresa.com' }),
  businessWithheld: (u, pk) => () => userBody(u, pk, { is_business_account: true, is_professional_account: true, should_show_public_contacts: true, business_contact_method: 'CALL', business_email: null, business_phone_number: null, business_address_json: '{"city_name": "Sao Paulo"}', biography: 'orçamentos: bio@loja.com' }),
  creatorOmitted: (u, pk) => () => userBody(u, pk, { is_business_account: false, is_professional_account: true }),
  userNull: () => () => ({ status: 200, body: { data: { user: null }, status: 'ok' } }),
  rate429: (retryAfter) => () => ({ status: 429, headers: retryAfter ? { 'retry-after': String(retryAfter) } : {}, body: { message: 'Please wait a few minutes before you try again.', status: 'fail' } }),
  forbidden: () => () => ({ status: 403, body: { message: 'login_required', status: 'fail' } }),
  redirectLogin: () => () => ({ status: 302, headers: { location: 'https://www.instagram.com/accounts/login/?next=%2F' }, contentType: 'text/html', body: '' }),
  htmlLogin: () => () => ({ status: 200, contentType: 'text/html', body: '<!DOCTYPE html><html><body>Login • Instagram</body></html>' }),
  mismatch: (u, pk) => () => userBody(u + '_novo', pk + 1000, { is_business_account: true, is_professional_account: true, business_email: 'naoaplicar@empresa.com' }),
};

const results = [];
function parseCsv(text) {
  const rows = []; let row = [], cell = '', q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) { if (c === '"' && text[i + 1] === '"') { cell += '"'; i++; } else if (c === '"') q = false; else cell += c; }
    else if (c === '"') q = true; else if (c === ',') { row.push(cell); cell = ''; }
    else if (c === '\n' || c === '\r') { if (c === '\r' && text[i + 1] === '\n') i++; row.push(cell); rows.push(row); row = []; cell = ''; }
    else cell += c;
  }
  if (cell || row.length) { row.push(cell); rows.push(row); }
  return rows;
}
function check(scn, name, ok, detail) { results.push({ scn, name, ok: !!ok, detail }); }
const profileReqs = (log) => log.filter((e) => e.kind === 'profile');
function spacingOk(log) {
  const ts = profileReqs(log).map((e) => e.t);
  for (let i = 1; i < ts.length; i++) if (ts[i] - ts[i - 1] < 9900) return false;
  return true;
}
function commonChecks(scn, log) {
  if (/seguidores|seguindo|curtidas|hashtag|local|lista|dj_filtro|pausa_salva|falhas/.test(scn)) {
    check(scn, 'nenhum host externo não simulado', !log.some((e) => e.kind === 'blocked'), log.filter((e) => e.kind === 'blocked').map((e) => e.url).slice(0, 5));
    const ts = infoReqs(log).map((e) => e.t);
    check(scn, 'intervalo >= 10 s entre consultas de detalhe', ts.every((t, i) => i === 0 || t - ts[i - 1] >= 9900), ts);
    check(scn, 'detalhe com app-id web e sem troca de User-Agent', infoReqs(log).every((e) => e.headers['x-ig-app-id'] === '936619743392459' && !/Instagram \d|Android/.test(e.headers['user-agent'] || '')));
    return;
  }
  check(scn, 'nenhuma chamada a /users/{id}/info/', !log.some((e) => e.kind === 'FORBIDDEN_users_info'));
  check(scn, 'nenhum host externo não simulado', !log.some((e) => e.kind === 'blocked'), log.filter((e) => e.kind === 'blocked').map((e) => e.url).slice(0, 5));
  check(scn, 'intervalo >= 10 s entre consultas de perfil', spacingOk(log), profileReqs(log).map((e) => e.t));
  check(scn, 'X-IG-App-ID web padrão, sem troca de host', profileReqs(log).every((e) => e.headers['x-ig-app-id'] === '936619743392459'));
}

async function open(extDir, label, scenario) {
  const log = [];
  const { ctx, id } = await H.launch(extDir, label);
  const state = await H.install(ctx, scenario, log);
  Object.defineProperty(log, 'historyState', { get: () => state.lastHistory || {} });
  const page = await ctx.newPage();
  const consoleErrors = [];
  page.on('pageerror', (e) => consoleErrors.push(String(e)));
  for (let i = 0; ; i++) {
    try { await page.goto(`chrome-extension://${id}/dashboard.html#/?ins=POSTTEST&type=4`); break; }
    catch (e) { if (i >= 20) throw e; await page.waitForTimeout(1000); }
  }
  await page.waitForTimeout(2500);
  return { ctx, id, page, log, consoleErrors };
}
const settled = (s) => s.isComplete || (s.isPaused && !s.detailCycle);
async function openMode(extDir, label, scenario, type, ins, seed) {
  const log = [];
  const { ctx, id } = await H.launch(extDir, label);
  const state = await H.install(ctx, scenario, log);
  const page = await ctx.newPage();
  const consoleErrors = [];
  page.on('pageerror', (e) => consoleErrors.push(String(e)));
  if (seed) {
    // Same storage write the popup does before opening a "user list" extraction.
    for (let i = 0; ; i++) {
      try { await page.goto(`chrome-extension://${id}/popup.html`); break; }
      catch (e) { if (i >= 20) throw e; await page.waitForTimeout(1000); }
    }
    await page.evaluate((s) => chrome.storage.local.set(s), seed);
    consoleErrors.length = 0;
  }
  for (let i = 0; ; i++) {
    try { await page.goto(`chrome-extension://${id}/dashboard.html#/?ins=${encodeURIComponent(ins)}&type=${type}`); break; }
    catch (e) { if (i >= 20) throw e; await page.waitForTimeout(1000); }
  }
  await page.waitForTimeout(2500);
  return { ctx, id, page, log, consoleErrors, state };
}
async function listMode(extDir, label, name, type, ins, scenario, rows, seed) {
  const o = await openMode(extDir, name, scenario, type, ins, seed);
  const s = await H.waitFor(o.page, (x) => x.rows.length === rows && x.rows.every((r) => r.detailLoaded) && x.isComplete, { timeout: 240000, every: 2000 });
  const csvEmail = s.emailList.length ? await H.exportCsv(o.page, 'email').catch((e) => 'ERRO ' + e) : '';
  const csvAll = s.rows.length ? await H.exportCsv(o.page, 'all').catch((e) => 'ERRO ' + e) : '';
  const xlsx = s.rows.length ? await H.exportXlsxSheets(o.page, 'all').catch(() => ({})) : {};
  const storageAfter = await o.page.evaluate(() => chrome.storage.local.get(null));
  await o.ctx.close();
  return { scn: label + ':' + name, s, csvEmail, csvAll, xlsx, storageAfter, log: o.log, errors: o.consoleErrors, state: o.state };
}
const infoReqs = (log) => log.filter((e) => e.kind === 'info');
const mobileUser = (pk, username, extra) => ({ status: 200, body: { status: 'ok', user: Object.assign({
  pk: String(pk), username, full_name: 'Nome ' + username, profile_pic_url: PIXEL, follower_count: 120, following_count: 80,
  media_count: 9, is_private: false, is_verified: false, external_url: '', biography: '', city_name: '', address_street: '',
  contact_phone_number: '', public_phone_number: '', public_phone_country_code: '' }, extra || {}) } });
const followersTarget = (pk) => () => ({ status: 200, body: { status: 'ok', data: { user: { pk: String(pk), id: String(pk), username: 'alvo_loja',
  full_name: 'Alvo', profile_pic_url: PIXEL, follower_count: 3, following_count: 2, is_private: false } } } });

const SCENARIOS = {
  async tipos_mistos(extDir, label) {
    const scn = label + ':tipos_mistos';
    const comments = [
      { pk: 11, username: 'pessoal_sem_campo' }, { pk: 12, username: 'loja_com_email' },
      { pk: 13, username: 'criador_nulo' }, { pk: 14, username: 'loja_oculta' },
      { pk: 15, username: 'loja_vazia' }, { pk: 16, username: 'conta_apagada' },
      { pk: 17, username: 'pessoal_nulo' },
    ];
    const profiles = {
      pessoal_sem_campo: F.personalOmitted('pessoal_sem_campo', 11),
      loja_com_email: F.businessFound('loja_com_email', 12, 'contato@lojaexemplo.com.br'),
      criador_nulo: F.creatorNull('criador_nulo', 13),
      loja_oculta: F.businessHidden('loja_oculta', 14, 'oculto@empresa.com'),
      loja_vazia: F.businessEmpty('loja_vazia', 15),
      conta_apagada: F.userNull(),
      pessoal_nulo: F.personalNull('pessoal_nulo', 17),
    };
    const o = await open(extDir, 'mix', { comments, profiles });
    check(scn, 'não inicia sozinho', (await H.snapshot(o.page)).isPaused && profileReqs(o.log).length === 0);
    await H.clickButton(o.page, 'Iniciar');
    const s = await H.waitFor(o.page, (x) => x.rows.length === 7 && settled(x) && x.rows.every((r) => r.detailLoaded) || (x.rows.length && x.isPaused && !x.detailCycle && profileReqs(o.log).length > 0 && Date.now() - profileReqs(o.log).slice(-1)[0].t > 25000), { timeout: 200000, every: 2000 });
    const csvEmail = s.emailList.length ? await H.exportCsv(o.page, 'email') : '';
    const csvAll = await H.exportCsv(o.page, 'all');
    const xlsx = await H.exportXlsxSheets(o.page, 'all');
    await o.ctx.close();
    return { scn, s, log: o.log, csvEmail, csvAll, xlsx, errors: o.consoleErrors };
  },
  async primeiro_429(extDir, label, retryAfter) {
    const scn = label + ':primeiro_429' + (retryAfter ? '' : '_sem_retry_after');
    const comments = [{ pk: 21, username: 'loja_a' }, { pk: 22, username: 'loja_b' }];
    const profiles = { loja_a: F.rate429(retryAfter), loja_b: F.businessFound('loja_b', 22, 'b@loja.com') };
    const o = await open(extDir, 'r429', { comments, profiles });
    await H.clickButton(o.page, 'Iniciar');
    const started = Date.now();
    let s = await H.waitFor(o.page, (x) => profileReqs(o.log).length >= 1 && x.isPaused && !x.detailCycle, { timeout: 90000 });
    await o.page.waitForTimeout(20000); // look for any automatic retry
    s = await H.snapshot(o.page);
    const before = profileReqs(o.log).length;
    await o.page.reload();
    await o.page.waitForTimeout(4000);
    const afterReload = await H.snapshot(o.page);
    const startEnabledAfterReload = await o.page.locator('button', { hasText: 'Iniciar' }).first().isEnabled().catch(() => null);
    await o.page.waitForTimeout(8000);
    const after = profileReqs(o.log).length;
    await o.ctx.close();
    return { scn, s, afterReload, startEnabledAfterReload, before, after, started, log: o.log, errors: o.consoleErrors, retryAfter };
  },
  async omitidos_profissionais(extDir, label) {
    const scn = label + ':omitidos_profissionais';
    const comments = [
      { pk: 31, username: 'pessoal_x' }, { pk: 32, username: 'loja_om1' }, { pk: 33, username: 'loja_om2' },
      { pk: 34, username: 'criador_om' }, { pk: 35, username: 'loja_om4' },
    ];
    const profiles = {
      pessoal_x: F.personalOmitted('pessoal_x', 31), loja_om1: F.businessOmitted('loja_om1', 32),
      loja_om2: F.businessOmitted('loja_om2', 33), criador_om: F.creatorOmitted('criador_om', 34),
      loja_om4: F.businessOmitted('loja_om4', 35),
      controle_loja: F.businessFound('controle_loja', 39, 'vendas@controle.com.br'),
    };
    const o = await open(extDir, 'omit', { comments, profiles });
    await H.clickButton(o.page, 'Iniciar');
    const s = await H.waitFor(o.page, (x) => x.rows.length === 5 && x.isPaused && !x.detailCycle && profileReqs(o.log).length >= 1 && Date.now() - profileReqs(o.log).slice(-1)[0].t > 25000, { timeout: 160000, every: 2000 });
    const reqsBefore = profileReqs(o.log).length;
    const continueClicked = await H.clickButton(o.page, 'Continue').catch(() => false);
    await o.page.waitForTimeout(4000);
    const toasts = (await H.snapshot(o.page)).toasts;
    const reqsAfterContinue = profileReqs(o.log).length;
    await o.page.reload();
    await o.page.waitForTimeout(4000);
    const afterReload = await H.snapshot(o.page);
    const startEnabledAfterReload = await o.page.locator('button', { hasText: 'Iniciar' }).first().isEnabled().catch(() => null);
    // Manual single-profile verification on a known commercial profile (simulated).
    let probe = null;
    const probeInput = o.page.locator('input[placeholder*="perfil"]').first();
    if (await probeInput.count()) {
      await probeInput.fill('@controle_loja');
      await H.clickButton(o.page, 'Verificar 1 perfil');
      probe = await H.waitFor(o.page, (x) => profileReqs(o.log).some((e) => e.username === 'controle_loja') && !/Consultando/.test(x.bodyText), { timeout: 40000 });
    }
    const startEnabledAfterProbe = await o.page.locator('button', { hasText: 'Iniciar' }).first().isEnabled().catch(() => null);
    const diag = await o.page.locator('textarea').first().inputValue().catch(() => '');
    await o.ctx.close();
    return { scn, s, afterReload, startEnabledAfterReload, probe, startEnabledAfterProbe, diag, continueClicked, toasts, reqsBefore, reqsAfterContinue, log: o.log, errors: o.consoleErrors };
  },
  async falha_acesso(extDir, label, kind) {
    const scn = label + ':falha_' + kind;
    const comments = [{ pk: 51, username: 'perfil_falha' }, { pk: 52, username: 'perfil_seguinte' }];
    const fx = { http403: F.forbidden(), redirect: F.redirectLogin(), html: F.htmlLogin() }[kind];
    const profiles = { perfil_falha: fx, perfil_seguinte: F.businessFound('perfil_seguinte', 52, 's@x.com') };
    const o = await open(extDir, 'acc', { comments, profiles });
    await H.clickButton(o.page, 'Iniciar');
    let s = await H.waitFor(o.page, (x) => profileReqs(o.log).length >= 1 && x.isPaused && !x.detailCycle, { timeout: 90000 });
    await o.page.waitForTimeout(20000);
    s = await H.snapshot(o.page);
    await o.ctx.close();
    return { scn, s, log: o.log, errors: o.consoleErrors, kind };
  },
  async retido_pela_web(extDir, label) {
    const scn = label + ':retido_pela_web';
    const comments = [{ pk: 81, username: 'pessoal_r' }, { pk: 82, username: 'loja_r1' }, { pk: 83, username: 'loja_r2' }, { pk: 84, username: 'loja_r3' }, { pk: 85, username: 'loja_r4' }];
    const profiles = { pessoal_r: F.personalOmitted('pessoal_r', 81), loja_r1: F.businessWithheld('loja_r1', 82), loja_r2: F.businessWithheld('loja_r2', 83), loja_r3: F.businessWithheld('loja_r3', 84), loja_r4: F.businessWithheld('loja_r4', 85) };
    const o = await open(extDir, 'ret', { comments, profiles });
    await H.clickButton(o.page, 'Iniciar');
    const s = await H.waitFor(o.page, (x) => x.rows.length === 5 && x.isPaused && !x.detailCycle && profileReqs(o.log).length >= 4 && Date.now() - profileReqs(o.log).slice(-1)[0].t > 25000, { timeout: 160000, every: 2000 });
    const xlsx = await H.exportXlsxSheets(o.page, 'all');
    await o.page.reload();
    await o.page.waitForTimeout(4000);
    const afterReload = await H.snapshot(o.page);
    const startEnabledAfterReload = await o.page.locator('button', { hasText: 'Iniciar' }).first().isEnabled().catch(() => null);
    await o.page.waitForTimeout(6000);
    await o.ctx.close();
    return { scn, s, xlsx, afterReload, startEnabledAfterReload, log: o.log, errors: o.consoleErrors };
  },
  async verificacao_429(extDir, label) {
    const scn = label + ':verificacao_429';
    const comments = [{ pk: 61, username: 'fila_a' }];
    const profiles = { controle: F.rate429(300), fila_a: F.businessFound('fila_a', 61, 'a@fila.com') };
    const o = await open(extDir, 'p429', { comments, profiles });
    await o.page.locator('input[placeholder*="perfil"]').first().fill('controle');
    await H.clickButton(o.page, 'Verificar 1 perfil');
    let s = await H.waitFor(o.page, (x) => profileReqs(o.log).length >= 1 && !/Consultando/.test(x.bodyText) && x.retryAfterUntil, { timeout: 40000 });
    const probeDisabled = await o.page.locator('button', { hasText: 'Verificar 1 perfil' }).first().isDisabled();
    void s;
    const startDisabled = await o.page.locator('button', { hasText: 'Iniciar' }).first().isDisabled();
    await o.page.waitForTimeout(15000);
    s = await H.snapshot(o.page);
    const diag = await o.page.locator('textarea').first().inputValue().catch(() => '');
    await o.ctx.close();
    return { scn, s, probeDisabled, startDisabled, diag, log: o.log, errors: o.consoleErrors };
  },
  async tres_indisponiveis(extDir, label) {
    const scn = label + ':tres_indisponiveis';
    const comments = [{ pk: 71, username: 'sumiu1' }, { pk: 72, username: 'sumiu2' }, { pk: 73, username: 'sumiu3' }, { pk: 74, username: 'loja_depois' }];
    const profiles = { sumiu1: F.userNull(), sumiu2: F.userNull(), sumiu3: F.userNull(), loja_depois: F.businessFound('loja_depois', 74, 'depois@loja.com') };
    const o = await open(extDir, 'tri', { comments, profiles });
    await H.clickButton(o.page, 'Iniciar');
    const paused = await H.waitFor(o.page, (x) => profileReqs(o.log).length >= 3 && x.isPaused && !x.detailCycle, { timeout: 90000 });
    await o.page.waitForTimeout(15000);
    const reqsWhilePaused = profileReqs(o.log).length;
    const resumed = await H.clickButton(o.page, 'Continue');
    const s = await H.waitFor(o.page, (x) => x.rows.length === 4 && x.rows.every((r) => r.detailLoaded), { timeout: 60000 });
    await o.ctx.close();
    return { scn, s, paused, reqsWhilePaused, resumed, log: o.log, errors: o.consoleErrors };
  },
  async pausa_compartilhada(extDir, label) {
    // Outro dashboard salva a pausa: Iniciar não pode disparar nenhuma consulta.
    const scn = label + ':pausa_compartilhada';
    const comments = [{ pk: 91, username: 'loja_p' }];
    const profiles = { loja_p: F.businessFound('loja_p', 91, 'p@loja.com') };
    const o = await open(extDir, 'shr', { comments, profiles });
    const until = Date.now() + 3600000;
    await o.page.evaluate((u) => chrome.storage.local.set({ ig_contact_cooldown_until: u }), until);
    const clicked = await H.clickButton(o.page, 'Iniciar');
    await o.page.waitForTimeout(12000);
    const s = await H.snapshot(o.page);
    await o.ctx.close();
    return { scn, s, clicked, toasts: s.toasts, until, log: o.log, errors: o.consoleErrors };
  },
  async lista_sem_retry(extDir, label) {
    // 403 na leitura dos comentários: pausa sem repetição automática.
    const scn = label + ':lista_sem_retry';
    const o = await open(extDir, 'lst', { comments: [], profiles: {}, commentsStatus: 403 });
    await H.clickButton(o.page, 'Iniciar');
    const s = await H.waitFor(o.page, (x) => x.isPaused && /recusou a leitura dos comentários/.test(x.bodyText), { timeout: 60000 });
    const firstCalls = o.log.filter((e) => e.kind === 'comments').length;
    await o.page.waitForTimeout(45000);
    const afterCalls = o.log.filter((e) => e.kind === 'comments').length;
    await o.ctx.close();
    return { scn, s, firstCalls, afterCalls, log: o.log, errors: o.consoleErrors };
  },
  async prova_persistente(extDir, label) {
    // A prova real sobrevive a 20 respostas posteriores e à recarga.
    const scn = label + ':prova_persistente';
    const comments = [{ pk: 101, username: 'loja_prova' }, { pk: 102, username: 'pessoal_a' }, { pk: 103, username: 'pessoal_b' }];
    const profiles = {
      loja_prova: F.businessFound('loja_prova', 101, 'prova@loja.com.br'),
      pessoal_a: F.personalOmitted('pessoal_a', 102), pessoal_b: F.personalOmitted('pessoal_b', 103),
    };
    const o = await open(extDir, 'prv', { comments, profiles });
    await H.clickButton(o.page, 'Iniciar');
    const s = await H.waitFor(o.page, (x) => x.rows.length === 3 && x.rows.every((r) => r.detailLoaded), { timeout: 120000, every: 2000 });
    // sobrescreve o log rolante com 20 entradas posteriores, mantendo o schema
    await o.page.evaluate(async (key) => {
      const now = Date.now();
      const list = Array.from({ length: 20 }, (_, i) => ({ at: now + i, endpoint: 'instagram_web_profile_info', username: 'posterior' + i, outcome: 'omitted', http: 200 }));
      await chrome.storage.local.set({ [key]: list });
    }, 'ig_commercial_contact_evidence_v14');
    await o.page.reload();
    await o.page.waitForTimeout(4000);
    const afterReload = await H.snapshot(o.page);
    const diag = await o.page.locator('textarea').first().inputValue().catch(() => '');
    await o.ctx.close();
    return { scn, s, afterReload, diag, log: o.log, errors: o.consoleErrors };
  },
  async export_vazio(extDir, label) {
    // Exportar antes de qualquer consulta: diagnóstico vazio não pode quebrar.
    const scn = label + ':export_vazio';
    const comments = [{ pk: 111, username: 'loja_e' }, { pk: 112, username: 'pessoa_e' }];
    const profiles = { loja_e: F.businessFound('loja_e', 111, 'e@loja.com'), pessoa_e: F.personalOmitted('pessoa_e', 112) };
    const o = await open(extDir, 'exp', { comments, profiles });
    await H.clickButton(o.page, 'Iniciar');
    // Linhas já carregadas, mas nenhuma consulta de perfil concluída ainda.
    const s = await H.waitFor(o.page, (x) => x.rows.length === 2, { timeout: 90000, every: 500 });
    await H.clickButton(o.page, 'Pause').catch(() => false);
    await o.page.waitForTimeout(1000);
    const xlsx = await H.exportXlsxSheets(o.page, 'all');
    const csv = await H.exportCsv(o.page, 'all');
    const after = await H.snapshot(o.page);
    await o.ctx.close();
    return { scn, s, xlsx, csv, after, log: o.log, errors: o.consoleErrors };
  },
  async seguidores(extDir, label) {
    const scn = label + ':seguidores';
    const users = [{ pk: '9101', username: 'seg_loja' }, { pk: '9102', username: 'seg_pessoa' }, { pk: '9103', username: 'seg_criador' }];
    const o = await openMode(extDir, 'fol', {
      profiles: { alvo_loja: followersTarget(9000) },
      friendships: (kind) => ({ status: 200, body: { status: 'ok', users: users.map((x) => Object.assign({ full_name: 'Nome ' + x.username, profile_pic_url: PIXEL }, x)), next_max_id: null, big_list: false } }),
      info: {
        9101: () => mobileUser(9101, 'seg_loja', { account_type: 2, is_business: true, public_email: 'vendas@segloja.com.br', should_show_public_contacts: true, biography: 'bio: outro@bio.com', contact_phone_number: '11987654321', public_phone_country_code: '55' }),
        9102: () => mobileUser(9102, 'seg_pessoa', { account_type: 1, is_business: false, public_email: '', biography: 'me chama: pessoa@gmail.com' }),
        9103: () => mobileUser(9103, 'seg_criador', { account_type: 3, is_business: false, public_email: 'criador@x.com', should_show_public_contacts: true }),
      },
    }, 0, 'alvo_loja');
    const s = await H.waitFor(o.page, (x) => x.rows.length === 3 && x.rows.every((r) => r.detailLoaded) && x.isComplete, { timeout: 200000, every: 2000 });
    const csv = s.rows.length ? await H.exportCsv(o.page, 'email').catch(() => '') : '';
    await o.ctx.close();
    return { scn, s, csv, log: o.log, errors: o.consoleErrors };
  },
  async seguidores_429(extDir, label) {
    const scn = label + ':seguidores_429';
    const users = [{ pk: '9201', username: 'loja_um' }, { pk: '9202', username: 'loja_dois' }];
    const o = await openMode(extDir, 'f429', {
      profiles: { alvo_loja: followersTarget(9000) },
      friendships: () => ({ status: 200, body: { status: 'ok', users: users.map((x) => Object.assign({ full_name: 'N', profile_pic_url: PIXEL }, x)), next_max_id: null, big_list: false } }),
      info: {
        9201: (n) => (n === 1 ? { status: 429, headers: { 'retry-after': '5' }, body: { status: 'fail', message: 'Please wait a few minutes before you try again.' } }
          : mobileUser(9201, 'loja_um', { account_type: 2, is_business: true, public_email: 'um@loja.com', should_show_public_contacts: true })),
        9202: () => mobileUser(9202, 'loja_dois', { account_type: 2, is_business: true, public_email: 'dois@loja.com', should_show_public_contacts: true }),
      },
    }, 0, 'alvo_loja');
    const s = await H.waitFor(o.page, (x) => x.rows.length === 2 && x.rows.every((r) => r.detailLoaded), { timeout: 260000, every: 3000 });
    await o.ctx.close();
    return { scn, s, log: o.log, errors: o.consoleErrors };
  },
  async seguindo(extDir, label) {
    const users = [{ pk: '9701', username: 'sgd_loja' }, { pk: '9702', username: 'sgd_pessoa' }];
    const r = await listMode(extDir, label, 'seguindo', 1, 'alvo_loja', {
      profiles: { alvo_loja: followersTarget(9000) },
      friendships: (kind) => ({ status: 200, body: { status: 'ok', users: kind === 'following' ? users.map((x) => Object.assign({ full_name: 'Nome ' + x.username, profile_pic_url: PIXEL }, x)) : [], next_max_id: null, big_list: false } }),
      info: {
        9701: () => mobileUser(9701, 'sgd_loja', { account_type: 2, is_business: true, public_email: 'sgd@loja.com', should_show_public_contacts: true }),
        9702: () => mobileUser(9702, 'sgd_pessoa', { account_type: 1, is_business: false, public_email: 'nao@coletar.com' }),
      },
    }, 2);
    return r;
  },
  async curtidas(extDir, label) {
    return listMode(extDir, label, 'curtidas', 3, 'POSTCURTIDAS', {
      listUsers: [{ pk: 9301, username: 'cur_loja' }, { pk: 9302, username: 'cur_pessoa' }, { pk: 9303, username: 'cur_oculto' }],
      info: {
        9301: () => mobileUser(9301, 'cur_loja', { account_type: 2, is_business: true, public_email: 'contato@curloja.com', should_show_public_contacts: true, biography: 'orçamento: bio@curloja.com', contact_phone_number: '11911112222', public_phone_country_code: '55' }),
        9302: () => mobileUser(9302, 'cur_pessoa', { account_type: 1, is_business: false, public_email: 'residual@pessoal.com', biography: 'pessoa@gmail.com' }),
        9303: () => mobileUser(9303, 'cur_oculto', { account_type: 3, is_business: false, public_email: 'oculto@criador.com', should_show_public_contacts: false }),
      },
    }, 3);
  },
  async hashtag(extDir, label) {
    // The same author twice in the tag feed must become a single row.
    return listMode(extDir, label, 'hashtag', 2, 'modatestebr', {
      listUsers: [{ pk: 9401, username: 'tag_loja' }, { pk: 9401, username: 'tag_loja' }, { pk: 9402, username: 'tag_vazia' }],
      info: {
        9401: () => mobileUser(9401, 'tag_loja', { account_type: 2, is_business: true, public_email: 'tag@loja.com', should_show_public_contacts: true }),
        9402: () => mobileUser(9402, 'tag_vazia', { account_type: 2, is_business: true, public_email: '', should_show_public_contacts: true }),
      },
    }, 2);
  },
  async local(extDir, label) {
    return listMode(extDir, label, 'local', 5, '213385402', {
      listUsers: [{ pk: 9501, username: 'loc_loja' }, { pk: 9502, username: 'loc_sumiu' }, { pk: 9503, username: 'loc_criador' }],
      info: {
        9501: () => mobileUser(9501, 'loc_loja', { account_type: 2, is_business: true, public_email: 'loc@loja.com', should_show_public_contacts: true, city_name: 'Campinas' }),
        // 9502 has no fixture: the harness answers 404 "User not found".
        9503: () => mobileUser(9503, 'loc_criador', { account_type: 3, is_business: false, public_email: 'criador@loc.com', should_show_public_contacts: true }),
      },
    }, 3);
  },
  async lista(extDir, label) {
    const key = 'userlist-2-20261005000000';
    const webUser = (pk, username) => () => ({ status: 200, body: { data: { user: { pk: String(pk), id: String(pk), username, full_name: 'Nome ' + username, profile_pic_url: PIXEL } }, status: 'ok' } });
    const r = await listMode(extDir, label, 'lista', 6, key, {
      profiles: { lista_loja: webUser(9601, 'lista_loja'), lista_pessoa: webUser(9602, 'lista_pessoa') },
      info: {
        9601: () => mobileUser(9601, 'lista_loja', { account_type: 2, is_business: true, public_email: 'lista@loja.com', should_show_public_contacts: true }),
        9602: () => mobileUser(9602, 'lista_pessoa', { account_type: 1, is_business: false, public_email: '', biography: 'contato: eu@gmail.com' }),
      },
    }, 2, { [key]: 'lista_loja,lista_pessoa' });
    r.key = key;
    return r;
  },
  async retomada_comment(extDir, label) {
    // Session 1 checks 1 profile, gets 429 on the 2nd; session 2 resumes the same history.
    const scn = label + ':retomada_comment';
    const comments = [{ pk: 131, username: 'ret_um' }, { pk: 132, username: 'ret_dois' }, { pk: 133, username: 'ret_tres' }];
    const profiles = {
      ret_um: F.businessFound('ret_um', 131, 'um@ret.com'),
      ret_dois: (n) => (n === 1 ? F.rate429(2)() : F.businessFound('ret_dois', 132, 'dois@ret.com')()),
      ret_tres: F.businessFound('ret_tres', 133, 'tres@ret.com'),
    };
    const scenario = { comments, profiles };
    const o = await open(extDir, 'ret', scenario);
    o.page.on('dialog', (d) => d.accept().catch(() => {}));
    await H.clickButton(o.page, 'Iniciar');
    const s1 = await H.waitFor(o.page, (x) => profileReqs(o.log).length >= 2 && x.isPaused && !x.detailCycle, { timeout: 120000 });
    await o.page.waitForTimeout(5000);
    const historyS1 = Object.assign({}, o.log.historyState);
    const reqs1 = profileReqs(o.log).map((e) => e.username);
    scenario.resumeHistory = true;
    await o.page.goto(`chrome-extension://${o.id}/dashboard.html#/?ins=POSTTEST&type=4&history=histTest`);
    await o.page.reload();
    await o.page.waitForTimeout(4000);
    // The reader keeps at least 10 s of pause after a 429: wait for it before starting again.
    const resumed = await H.waitFor(o.page, (x) => Date.now() > (Number(x.storage.ig_contact_cooldown_until) || 0) + 1500, { timeout: 60000, every: 1000 });
    await o.page.waitForTimeout(1500);
    const startClicked = await H.clickButton(o.page, 'Iniciar');
    const s2 = await H.waitFor(o.page, (x) => x.isComplete || (x.isPaused && !x.detailCycle && Date.now() - (profileReqs(o.log).slice(-1)[0] || { t: 0 }).t > 30000), { timeout: 150000, every: 2000 });
    const stored = Object.entries(s2.storage).filter(([k]) => /^extract_list_/.test(k)).map(([, v]) => v)[0] || [];
    await o.ctx.close();
    return { scn, s: s2, s1, resumed, reqs1, stored, historyS1, startClicked, log: o.log, errors: o.consoleErrors };
  },
  async lista_inexistente(extDir, label) {
    const key = 'userlist-2-20261005000001';
    const webUser = (pk, username) => () => ({ status: 200, body: { data: { user: { pk: String(pk), id: String(pk), username, full_name: 'Nome ' + username, profile_pic_url: PIXEL } }, status: 'ok' } });
    const r = await listMode(extDir, label, 'lista_inexistente', 6, key, {
      profiles: { nome_ok: webUser(9801, 'nome_ok'), nome_sumiu: () => ({ status: 404, body: { data: { user: null }, status: 'ok' } }) },
      info: { 9801: () => mobileUser(9801, 'nome_ok', { account_type: 2, is_business: true, public_email: 'ok@nome.com', should_show_public_contacts: true }) },
    }, 2, { [key]: 'nome_ok,nome_sumiu' });
    return r;
  },
  async dj_filtro(extDir, label) {
    // The DJ display filter is switched on mid-run: it must not decide what is saved or when the task ends.
    const users = [{ pk: '9901', username: 'dj_set_oficial' }, { pk: '9902', username: 'loja_roupas' }, { pk: '9903', username: 'padaria_bairro' }];
    const o = await openMode(extDir, 'djf', {
      profiles: { alvo_loja: followersTarget(9000) },
      friendships: () => ({ status: 200, body: { status: 'ok', users: users.map((x) => Object.assign({ full_name: 'Nome ' + x.username, profile_pic_url: PIXEL }, x)), next_max_id: null, big_list: false } }),
      info: {
        9901: () => mobileUser(9901, 'dj_set_oficial', { account_type: 2, is_business: true, public_email: 'booking@djset.com', should_show_public_contacts: true, follower_count: 12000, biography: 'DJ / producer — afro house, melodic techno. Bookings worldwide', external_url: 'https://soundcloud.com/djset' }),
        9902: () => mobileUser(9902, 'loja_roupas', { account_type: 2, is_business: true, public_email: 'vendas@roupas.com', should_show_public_contacts: true, biography: 'fashion store' }),
        9903: () => mobileUser(9903, 'padaria_bairro', { account_type: 2, is_business: true, public_email: 'pao@padaria.com', should_show_public_contacts: true, biography: 'food' }),
      },
    }, 0, 'alvo_loja');
    await o.page.evaluate(`(() => { const vm = ${H.findVmSource()}; vm.djFilterEnabled = true; vm.djMinScore = 60; })()`);
    const s = await H.waitFor(o.page, (x) => x.isComplete, { timeout: 200000, every: 2000 });
    const view = await o.page.evaluate(`(() => { const vm = ${H.findVmSource()}; return { userList: vm.userList.map(r => r.userName), processed: vm.processedList.length }; })()`);
    const storageAfter = await o.page.evaluate(() => chrome.storage.local.get(null));
    await o.ctx.close();
    return { scn: label + ':dj_filtro', s, view, storageAfter, state: o.state, log: o.log, errors: o.consoleErrors };
  },
  async seguidores_pausa_salva(extDir, label) {
    // A 429 cooldown saved by another dashboard: no request before it ends, then the run resumes by itself.
    const until = Date.now() + 40000;
    const users = [{ pk: '9111', username: 'ps_loja' }];
    const o = await openMode(extDir, 'fps', {
      profiles: { alvo_loja: followersTarget(9000) },
      friendships: () => ({ status: 200, body: { status: 'ok', users: users.map((x) => Object.assign({ full_name: 'Nome ' + x.username, profile_pic_url: PIXEL }, x)), next_max_id: null, big_list: false } }),
      info: { 9111: () => mobileUser(9111, 'ps_loja', { account_type: 2, is_business: true, public_email: 'ps@loja.com', should_show_public_contacts: true }) },
    }, 0, 'alvo_loja', { ig_contact_cooldown_until: until });
    const early = await H.snapshot(o.page);
    const s = await H.waitFor(o.page, (x) => x.isComplete, { timeout: 220000, every: 3000 });
    await o.ctx.close();
    return { scn: label + ':seguidores_pausa_salva', s, early, until, log: o.log, errors: o.consoleErrors };
  },
  async seguidores_falhas(extDir, label) {
    // HTTP 500 once (retried, then OK), HTTP 500 always (retried once, then recorded as failure), then OK.
    const users = [{ pk: '9121', username: 'falha_uma_vez' }, { pk: '9122', username: 'falha_sempre' }, { pk: '9123', username: 'sem_falha' }];
    const err = { status: 500, body: { status: 'fail', message: 'server error' } };
    const o = await openMode(extDir, 'ffl', {
      profiles: { alvo_loja: followersTarget(9000) },
      friendships: () => ({ status: 200, body: { status: 'ok', users: users.map((x) => Object.assign({ full_name: 'Nome ' + x.username, profile_pic_url: PIXEL }, x)), next_max_id: null, big_list: false } }),
      info: {
        9121: (n) => (n === 1 ? err : mobileUser(9121, 'falha_uma_vez', { account_type: 2, is_business: true, public_email: 'um@falha.com', should_show_public_contacts: true })),
        9122: () => err,
        9123: () => mobileUser(9123, 'sem_falha', { account_type: 2, is_business: true, public_email: 'ok@semfalha.com', should_show_public_contacts: true }),
      },
    }, 0, 'alvo_loja');
    const s = await H.waitFor(o.page, (x) => x.isComplete, { timeout: 260000, every: 3000 });
    await o.ctx.close();
    return { scn: label + ':seguidores_falhas', s, log: o.log, errors: o.consoleErrors };
  },
  async identidade(extDir, label) {
    const scn = label + ':identidade';
    const comments = [{ pk: 41, username: 'renomeado' }, { pk: 42, username: 'loja_ok' }];
    const profiles = { renomeado: F.mismatch('renomeado', 41), loja_ok: F.businessFound('loja_ok', 42, 'ok@loja.com') };
    const o = await open(extDir, 'idt', { comments, profiles });
    await H.clickButton(o.page, 'Iniciar');
    const s = await H.waitFor(o.page, (x) => (x.rows.length === 2 && x.rows.every((r) => r.detailLoaded)) || (x.isPaused && !x.detailCycle && profileReqs(o.log).length >= 1 && Date.now() - profileReqs(o.log).slice(-1)[0].t > 25000), { timeout: 90000, every: 2000 });
    await o.ctx.close();
    return { scn, s, log: o.log, errors: o.consoleErrors };
  },
};

function assess(label, r) {
  const scn = r.scn, s = r.s, log = r.log;
  commonChecks(scn, log);
  check(scn, 'sem erro JavaScript na página', !r.errors.length, r.errors.slice(0, 3));
  const byUser = Object.fromEntries((s.rows || []).map((x) => [x.user, x]));
  if (/tipos_mistos/.test(scn)) {
    if (label === 'v13') {
      check(scn, '[v13] parada global no 1º perfil pessoal sem campo (bug reproduzido)', profileReqs(log).length === 1 && s.commercialContactUnavailable && r.s.storage.ig_commercial_web_contact_unavailable_v13, { reqs: profileReqs(log).length });
      return;
    }
    const exp = { pessoal_sem_campo: 'not_professional', loja_com_email: 'found', criador_nulo: 'empty', loja_oculta: 'hidden', loja_vazia: 'empty', conta_apagada: 'profile_unavailable', pessoal_nulo: 'not_professional' };
    Object.keys(exp).forEach((u) => check(scn, `status ${u} = ${exp[u]}`, byUser[u] && byUser[u].status === exp[u] && byUser[u].detailLoaded, byUser[u] && { status: byUser[u].status, text: byUser[u].text }));
    check(scn, 'fila não parou por perfil pessoal/omitido', profileReqs(log).length === 7 && s.isComplete, { reqs: profileReqs(log).length, isComplete: s.isComplete });
    check(scn, 'cada perfil consultado uma única vez', profileReqs(log).every((e) => e.n === 1));
    check(scn, 'único e-mail = campo comercial (bio ignorada)', JSON.stringify(s.emailList) === JSON.stringify(['contato@lojaexemplo.com.br']), s.emailList);
    check(scn, 'e-mail oculto não coletado', !s.rows.some((x) => x.email === 'oculto@empresa.com'));
    check(scn, 'textos distintos: vazio/oculto/pessoal/indisponível/encontrado', new Set(s.rows.map((x) => x.text)).size >= 5, s.rows.map((x) => x.text));
    check(scn, 'sem método de contato anunciado, nada é rotulado como retido', !s.rows.some((x) => x.status === 'not_delivered'));
    check(scn, 'perfil apagado preserva nome do comentário', byUser.conta_apagada && byUser.conta_apagada.user === 'conta_apagada');
    const emailCol = (csv) => { const rows = parseCsv(csv); const i = rows[0].indexOf('E-mail comercial'); return rows.slice(1).map((x) => x[i]).filter((v) => v !== undefined); };
    check(scn, 'CSV de e-mails: coluna "E-mail comercial" só com o contato comercial', JSON.stringify(emailCol(r.csvEmail)) === JSON.stringify(['contato@lojaexemplo.com.br']), emailCol(r.csvEmail));
    check(scn, 'CSV completo: coluna de e-mail sem bio/oculto/pessoal', emailCol(r.csvAll).filter(Boolean).join() === 'contato@lojaexemplo.com.br', emailCol(r.csvAll));
    check(scn, 'CSV completo tem 7 linhas e coluna de status', r.csvAll.trim().split('\n').length === 8 && /Status do e-mail/.test(r.csvAll) && /Contato oculto/.test(r.csvAll) && /Campo comercial vazio/.test(r.csvAll) && !/não entregue pela consulta web/.test(r.csvAll), r.csvAll.split('\n').slice(0, 3));
    const sheets = r.xlsx || {};
    const diag = sheets['Diagnostico contato'] || [];
    const hdr = diag[0] || [];
    const rowOf = (u) => diag.find((x) => x[0] === '@' + u) || [];
    const col = (name) => hdr.indexOf(name);
    check(scn, 'XLSX: aba de dados + 2 abas de diagnóstico automáticas', Object.keys(sheets).length === 3 && sheets['Respostas reais'] && diag.length === 8, Object.keys(sheets));
    check(scn, 'XLSX diagnóstico: campo omitido x nulo x vazio por perfil', rowOf('pessoal_sem_campo')[col('business_email')] === 'absent' && rowOf('criador_nulo')[col('business_email')] === 'null' && rowOf('loja_vazia')[col('business_email')] === 'empty' && rowOf('loja_com_email')[col('business_email')] === 'valid', { hdr, sample: diag.slice(1, 4) });
    check(scn, 'XLSX diagnóstico: sinal de contato oculto registrado', rowOf('loja_oculta')[col('should_show_public_contacts')] === 'false' && /oculto/i.test(rowOf('loja_oculta')[col('Status do e-mail')]));
    check(scn, 'XLSX diagnóstico: sem e-mail completo nas abas de diagnóstico', !JSON.stringify([diag, sheets['Respostas reais']]).includes('contato@lojaexemplo.com.br'));
    check(scn, 'XLSX dados: coluna E-mail comercial só com o contato do campo', (() => { const d = sheets.all || []; const i = (d[0] || []).indexOf('E-mail comercial'); return d.slice(1).map((x) => x[i]).filter(Boolean).join() === 'contato@lojaexemplo.com.br'; })());
    check(scn, 'histórico local salvo (extract_list_*)', Object.keys(s.storage).some((k) => /^extract_list_/.test(k) && Array.isArray(s.storage[k]) && s.storage[k].length === 7));
    check(scn, 'evidência sanitizada registrada (sem e-mail completo)', Array.isArray(s.storage.ig_commercial_contact_evidence_v14) && s.storage.ig_commercial_contact_evidence_v14.length === 7 && !JSON.stringify(s.storage.ig_commercial_contact_evidence_v14).includes('contato@lojaexemplo.com.br'));
  }
  if (/primeiro_429/.test(scn)) {
    const until = Number(s.storage.ig_contact_cooldown_until) || 0;
    const expected = r.retryAfter ? r.retryAfter * 1000 : 3600000;
    check(scn, 'apenas 1 consulta e nenhuma repetição automática', r.before === 1 && r.after === 1, { before: r.before, after: r.after });
    const reqAt = profileReqs(log)[0] ? profileReqs(log)[0].t : r.started;
    check(scn, 'pausa persistida conforme Retry-After/60 min', Math.abs(until - (reqAt + expected)) < 5000, { until: new Date(until).toISOString(), expected: new Date(reqAt + expected).toISOString() });
    check(scn, 'após recarregar: pausa ativa e Iniciar desabilitado', r.afterReload.retryAfterUntil >= until - 1000 && r.startEnabledAfterReload === false, { retryAfterUntil: r.afterReload.retryAfterUntil, enabled: r.startEnabledAfterReload });
    check(scn, 'aviso de HTTP 429 exibido', s.notifications.some((n) => /429/.test(n)));
    if (label !== 'v13') check(scn, 'linha marcada com falha de acesso 429 (não como e-mail ausente)', s.rows[0] && s.rows[0].failure && s.rows[0].failure.code === 'rate_limit' && /429/.test(s.rows[0].text), s.rows[0]);
    if (label !== 'v13') check(scn, 'contador mostra encontrados x consultados (2 encontrados, 0 consultados)', /Pausado\.\s*2\s*perfis encontrados, 0 consultados/.test(s.bodyText), (s.bodyText.match(/Pausado\.[^\n]{0,60}/) || [''])[0]);
  }
  if (/omitidos_profissionais/.test(scn)) {
    console.log('--- diagnóstico copiado (simulado) ---\n' + r.diag + '\n---');
    check(scn, 'pessoal não conta; para no 3º profissional omitido', profileReqs(log).filter((e) => e.username !== 'controle_loja').length === 4 && !profileReqs(log).some((e) => e.username === 'loja_om4'), profileReqs(log).map((e) => e.username));
    check(scn, 'status: pessoal / omitido x3', byUser.pessoal_x.status === 'not_professional' && ['loja_om1', 'loja_om2', 'criador_om'].every((u) => byUser[u].status === 'omitted'));
    check(scn, 'e-mail da bio não usado', !s.rows.some((x) => x.email));
    check(scn, 'decisão persistida após recarga', r.afterReload.commercialContactUnavailable === true && r.startEnabledAfterReload === false);
    check(scn, 'Continue bloqueado explica o motivo e não consulta', r.continueClicked && r.toasts.some((t) => /Fila encerrada pelo diagnóstico automático/.test(t)) && r.reqsAfterContinue === r.reqsBefore, { toasts: r.toasts, before: r.reqsBefore, after: r.reqsAfterContinue });
    check(scn, 'verificação manual de 1 perfil executou 1 consulta', profileReqs(log).filter((e) => e.username === 'controle_loja').length === 1);
    check(scn, 'campo presente na verificação reabre a fila', r.probe && r.probe.commercialContactUnavailable === false && r.startEnabledAfterProbe === true);
    check(scn, 'diagnóstico mostra HTTP 200, campo e tipo', /HTTP 200/.test(r.diag) && /business_email=valid/.test(r.diag) && /business/.test(r.diag), r.diag.slice(0, 400));
    check(scn, 'verificação não adiciona linha à tabela', r.probe && r.probe.rows.length === r.afterReload.rows.length, { before: r.afterReload.rows.length, after: r.probe && r.probe.rows.length });
  }
  if (/falha_/.test(scn)) {
    const code = { http403: 'access', redirect: 'redirect', html: 'invalid_response' }[r.kind];
    check(scn, 'parou após 1 consulta, sem repetição automática', profileReqs(log).length === 1 && s.isPaused, profileReqs(log).length);
    check(scn, `linha marcada com falha (${code})`, s.rows[0] && s.rows[0].failure && s.rows[0].failure.code === code && !s.rows[0].detailLoaded, s.rows[0] && s.rows[0].failure);
    check(scn, 'próximo perfil não consultado', !profileReqs(log).some((e) => e.username === 'perfil_seguinte'));
  }
  if (/seguidores_falhas/.test(scn)) {
    const n = (pk) => infoReqs(log).filter((e) => e.pk === pk).length;
    check(scn, 'erro passageiro: 1 nova tentativa e sucesso', n('9121') === 2 && byUser.falha_uma_vez && byUser.falha_uma_vez.status === 'found', { reqs: n('9121') });
    const sempre = s.rows.find((x) => x.id === '9122');
    check(scn, 'erro persistente: 2 tentativas, linha marcada como falha', n('9122') === 2 && sempre && sempre.failure && sempre.failure.code === 'request' && /Falha/.test(sempre.text), { reqs: n('9122'), row: sempre });
    check(scn, 'fila segue e conclui', byUser.sem_falha && byUser.sem_falha.status === 'found' && s.isComplete === true);
    check(scn, 'e-mails só dos perfis respondidos', JSON.stringify(s.emailList.slice().sort()) === JSON.stringify(['ok@semfalha.com', 'um@falha.com']), s.emailList);
  }
  if (/seguidores_pausa_salva/.test(scn)) {
    const ig = log.filter((e) => ['profile', 'info', 'friendships', 'list'].includes(e.kind));
    check(scn, 'pausa salva respeitada: nenhuma consulta ao Instagram antes do fim', ig.length > 0 && ig.every((e) => e.t >= r.until), ig.map((e) => [e.kind, e.t - r.until]));
    check(scn, 'dashboard começa pausado com aviso da pausa', r.early.isPaused && r.early.notifications.some((n) => /cooldown is active/.test(n)), r.early.notifications);
    check(scn, 'retoma sozinho depois da pausa e conclui', s.isComplete === true && JSON.stringify(s.emailList) === JSON.stringify(['ps@loja.com']), s.emailList);
  }
  if (/seguidores_429/.test(scn)) {
    const um = infoReqs(log).filter((e) => e.pk === '9201');
    check(scn, '429 respeitado: 2ª tentativa só depois do Retry-After', um.length === 2 && um[1].t - um[0].t >= 5000, um.map((e) => e.t));
    check(scn, 'sem martelar: no máximo 2 consultas ao perfil limitado', um.length <= 2);
    check(scn, 'retoma sozinho fora do Comment e conclui', r.s.rows.every((x) => x.detailLoaded) && JSON.stringify(r.s.emailList.sort()) === JSON.stringify(['dois@loja.com', 'um@loja.com']), r.s.emailList);
    check(scn, 'pausa compartilhada gravada', Number(r.s.storage.ig_contact_cooldown_until) > 0);
  } else if (/:seguidores$/.test(scn)) {
    const by = Object.fromEntries(s.rows.map((x) => [x.user, x]));
    check(scn, 'lista de seguidores carregada (3 linhas)', s.rows.length === 3, s.rows.map((x) => x.user));
    check(scn, 'detalhe consultado 1 vez por seguidor', infoReqs(log).length === 3 && infoReqs(log).every((e) => e.n === 1), infoReqs(log).map((e) => e.pk));
    check(scn, 'e-mails só de public_email (bio ignorada)', JSON.stringify(s.emailList.slice().sort()) === JSON.stringify(['criador@x.com', 'vendas@segloja.com.br']), s.emailList);
    check(scn, 'status: encontrado / pessoal / encontrado', by.seg_loja && by.seg_loja.status === 'found' && by.seg_pessoa.status === 'not_professional' && by.seg_criador.status === 'found', s.rows.map((x) => x.status));
    check(scn, 'telefone público preservado', s.rows.some((x) => x.user === 'seg_loja'));
    check(scn, 'extração concluída', s.isComplete === true);
    check(scn, 'CSV de e-mails com a coluna certa', /vendas@segloja\.com\.br/.test(r.csv) && !/pessoa@gmail\.com|outro@bio\.com/.test((r.csv.split('\n')[1] || '').split(',').slice(0, 8).join(',')));
  }
  if (/:(seguindo|curtidas|hashtag|local|lista|lista_inexistente)$/.test(scn)) {
    const mode = scn.split(':')[1];
    const exp = {
      seguindo: { rows: ['sgd_loja', 'sgd_pessoa'], emails: ['sgd@loja.com'], status: { sgd_loja: 'found', sgd_pessoa: 'not_professional' } },
      curtidas: { rows: ['cur_loja', 'cur_pessoa', 'cur_oculto'], emails: ['contato@curloja.com'], status: { cur_loja: 'found', cur_pessoa: 'not_professional', cur_oculto: 'hidden' } },
      hashtag: { rows: ['tag_loja', 'tag_vazia'], emails: ['tag@loja.com'], status: { tag_loja: 'found', tag_vazia: 'empty' } },
      local: { rows: ['loc_loja', '', 'loc_criador'], emails: ['criador@loc.com', 'loc@loja.com'], status: { loc_loja: 'found', loc_criador: 'found' } },
      lista_inexistente: { rows: ['nome_ok', 'nome_sumiu'], emails: ['ok@nome.com'], status: { nome_ok: 'found', nome_sumiu: 'profile_unavailable' }, info: 1 },
      lista: { rows: ['lista_loja', 'lista_pessoa'], emails: ['lista@loja.com'], status: { lista_loja: 'found', lista_pessoa: 'not_professional' } },
    }[mode];
    check(scn, `lista carregada (${exp.rows.length} linhas, sem duplicar autor)`, JSON.stringify(s.rows.map((x) => x.user)) === JSON.stringify(exp.rows), s.rows.map((x) => x.user));
    const ids = infoReqs(log).map((e) => e.pk);
    check(scn, 'detalhe consultado 1 vez por perfil', ids.length === (exp.info || exp.rows.length) && new Set(ids).size === ids.length, ids);
    check(scn, 'e-mails só do contato público (bio, pessoal e oculto fora)', JSON.stringify(s.emailList.slice().sort()) === JSON.stringify(exp.emails), s.emailList);
    Object.keys(exp.status).forEach((u) => check(scn, `status ${u} = ${exp.status[u]}`, byUser[u] && byUser[u].status === exp.status[u], byUser[u] && { status: byUser[u].status, text: byUser[u].text }));
    check(scn, 'extração concluída', s.isComplete === true);
    check(scn, 'histórico no servidor atualizado', r.state && r.state.historyUpdates >= 2, r.state && r.state.historyUpdates);
    check(scn, 'histórico local salvo (extract_list_*)', Object.keys(r.storageAfter).some((k) => /^extract_list_/.test(k) && Array.isArray(r.storageAfter[k]) && r.storageAfter[k].length === exp.rows.length), Object.keys(r.storageAfter));
    const emailCol = (csv) => { const rows = parseCsv(csv); const i = (rows[0] || []).indexOf('E-mail comercial'); return rows.slice(1).map((x) => x[i]).filter(Boolean); };
    check(scn, 'CSV de e-mails: coluna "E-mail comercial" correta', JSON.stringify(emailCol(r.csvEmail).sort()) === JSON.stringify(exp.emails), r.csvEmail.slice(0, 300));
    check(scn, 'CSV completo: todas as linhas e status', parseCsv(r.csvAll.trim()).length === exp.rows.length + 1 && /Status do e-mail/.test(r.csvAll), r.csvAll.slice(0, 200));
    const sheets = r.xlsx || {};
    const data = sheets.all || [];
    const ei = (data[0] || []).indexOf('E-mail comercial');
    check(scn, 'XLSX: só a aba de dados (diagnóstico é exclusivo do Comment)', Object.keys(sheets).length === 1 && data.length === exp.rows.length + 1, Object.keys(sheets));
    check(scn, 'XLSX: coluna E-mail comercial correta', JSON.stringify(data.slice(1).map((x) => x[ei]).filter(Boolean).sort()) === JSON.stringify(exp.emails));
    if (mode === 'curtidas') check(scn, 'telefone público preservado', s.rows.some((x) => x.user === 'cur_loja'));
    if (mode === 'seguindo') check(scn, 'lista lida de following (não de followers)', log.some((e) => e.kind === 'friendships' && e.list === 'following') && !log.some((e) => e.kind === 'friendships' && e.list === 'followers'));
    if (mode === 'local') {
      const sumiu = s.rows.find((x) => x.id === '9502');
      check(scn, 'perfil 404 registrado como indisponível, sem e-mail, e a fila conclui', sumiu && sumiu.detailLoaded && sumiu.status === 'profile_unavailable' && !sumiu.email && s.isComplete, sumiu);
      check(scn, 'perfil 404 consultado 1 vez', infoReqs(log).filter((e) => e.pk === '9502').length === 1);
    }
    if (mode === 'lista_inexistente') {
      check(scn, 'nome inexistente não gera /users//info/ com id vazio', !log.some((e) => /\/users\/\/info/.test(e.url || '')), log.filter((e) => e.kind === 'instagram-other').map((e) => e.url));
      check(scn, 'nome inexistente consultado 1 vez', profileReqs(log).filter((e) => e.username === 'nome_sumiu').length === 1);
    }
    if (mode === 'lista') {
      const web = profileReqs(log).map((e) => e.username);
      check(scn, 'lista lida do storage e enviada ao histórico', r.state && r.state.customUserList === 'lista_loja,lista_pessoa', r.state && r.state.customUserList);
      check(scn, 'chave temporária da lista removida do storage', !(r.key in r.storageAfter));
      check(scn, 'nome -> id resolvido 1 vez por perfil', web.join() === 'lista_loja,lista_pessoa', web);
    }
  }
  if (/retomada_comment/.test(scn)) {
    const reqs2 = profileReqs(log).map((e) => e.username).slice(r.reqs1.length);
    check(scn, 'sessão 1: 1 perfil consultado, 429 no 2º, pausa', r.reqs1.join() === 'ret_um,ret_dois' && r.s1.isPaused, r.reqs1);
    check(scn, 'histórico da sessão 1 conta só o perfil consultado (1), não os 3 listados', r.historyS1.scrapedCount === 1 && !r.historyS1.isFromComplete, { scrapedCount: r.historyS1.scrapedCount, done: r.historyS1.isFromComplete });
    check(scn, 'Iniciar habilitado depois da pausa', r.startClicked === true);
    check(scn, 'sessão 2 consulta só os pendentes (sem repetir ret_um)', reqs2.join() === 'ret_dois,ret_tres', reqs2);
    check(scn, 'retomada conclui a tarefa', s.isComplete === true, { isComplete: s.isComplete, paused: s.isPaused });
    const names = r.stored.map((x) => x.userName).sort();
    check(scn, 'histórico local com os 3 perfis, sem duplicar', JSON.stringify(names) === JSON.stringify(['ret_dois', 'ret_tres', 'ret_um']) && r.stored.every((x) => x.detailLoaded), names);
    check(scn, 'e-mails dos 3 perfis preservados no histórico', r.stored.filter((x) => x.email).length === 3, r.stored.map((x) => x.email));
  }
  if (/dj_filtro/.test(scn)) {
    check(scn, 'tarefa conclui com o filtro DJ ligado', s.isComplete === true);
    check(scn, 'filtro só afeta a visão (1 lead na tabela, 3 processados)', r.view.userList.join() === 'dj_set_oficial' && r.view.processed === 3, r.view);
    const rows = Object.entries(r.storageAfter).filter(([k]) => /^extract_list_/.test(k)).map(([, v]) => v)[0] || [];
    check(scn, 'histórico local guarda os 3 perfis', rows.length === 3, rows.map((x) => x.userName));
    const last = r.state && r.state.lastHistory;
    check(scn, 'histórico no servidor: 3 extraídos, 3 e-mails, concluído', last && last.scrapedCount === 3 && last.count === 3 && last.isFromComplete === true, last && { scrapedCount: last.scrapedCount, count: last.count, done: last.isFromComplete });
  }
  if (/export_vazio/.test(scn)) {
    check(scn, 'linhas carregadas sem nenhuma consulta de perfil concluída', s.rows.length === 2 && s.rows.every((x) => !x.detailLoaded), s.rows.map((x) => x.detailLoaded));
    const sheets = Object.keys(r.xlsx || {});
    check(scn, 'XLSX com as 3 abas mesmo sem diagnóstico', sheets.length === 3 && sheets.includes('Diagnostico contato') && sheets.includes('Respostas reais'), sheets);
    const diag = r.xlsx['Diagnostico contato'] || [];
    check(scn, 'aba de diagnóstico lista os 2 perfis com "-" nos campos', diag.length === 3 && diag[1][0] === '@loja_e' && diag[1].filter((v) => v === '-').length >= 6, diag.slice(0, 2));
    check(scn, 'status mostra aguardando consulta', diag[1][1] === 'Aguardando consulta', diag[1]);
    check(scn, 'aba de respostas reais diz que não há prova', JSON.stringify(r.xlsx['Respostas reais']).includes('NÃO comprovado'));
    check(scn, 'CSV exporta as 2 linhas', r.csv.trim().split('\n').length === 3, r.csv.slice(0, 200));
    check(scn, 'sem erro de página após exportar', r.after && !r.errors.length, r.errors.slice(0, 2));
  }
  if (/pausa_compartilhada/.test(scn)) {
    check(scn, 'nenhuma consulta de perfil durante a pausa de outro dashboard', profileReqs(log).length === 0, profileReqs(log).length);
    check(scn, 'nenhuma leitura de comentários durante a pausa', log.filter((e) => e.kind === 'comments').length === 0);
    check(scn, 'aviso explica a pausa salva', r.toasts.some((t) => /pausada até|limite do Instagram/.test(t)), r.toasts);
    check(scn, 'pausa salva preservada e refletida na tela', Number(s.storage.ig_contact_cooldown_until) === r.until && s.isPaused);
  }
  if (/lista_sem_retry/.test(scn)) {
    check(scn, '403 na lista pausa sem repetição automática', r.firstCalls === 1 && r.afterCalls === 1, { first: r.firstCalls, after: r.afterCalls });
    check(scn, 'mensagem em português explica a pausa', /recusou a leitura dos comentários/.test(s.bodyText) && /sem nova tentativa automática/.test(s.bodyText));
    check(scn, 'nenhuma consulta de perfil disparada', profileReqs(log).length === 0);
  }
  if (/prova_persistente/.test(scn)) {
    check(scn, 'prova real registrada no schema', s.storage.ig_commercial_contact_schema_v14 && s.storage.ig_commercial_contact_schema_v14.firstFound && s.storage.ig_commercial_contact_schema_v14.firstFound.username === 'loja_prova');
    check(scn, 'e-mail da prova fica mascarado no schema', s.storage.ig_commercial_contact_schema_v14.firstFound.email === 'p***@loja.com.br');
    check(scn, 'prova sobrevive ao log rolante e à recarga', /Contato comercial público já recebido numa resposta real: @loja_prova/.test(r.afterReload.bodyText), r.afterReload.bodyText.slice(0, 400));
    check(scn, 'diagnóstico confirma a prova após recarga', /resposta real: SIM — @loja_prova/.test(r.diag), r.diag.slice(0, 300));
    check(scn, 'fila concluída (não ficou em laço)', s.isComplete === true);
  }
  if (/retido_pela_web/.test(scn)) {
    const users = profileReqs(log).map((e) => e.username);
    check(scn, 'encerra no 3º comercial com contato retido; pessoal não conta', users.join() === 'pessoal_r,loja_r1,loja_r2,loja_r3', users);
    check(scn, 'status "não entregue pela consulta web" nos retidos', ['loja_r1', 'loja_r2', 'loja_r3'].every((u) => byUser[u].status === 'not_delivered'));
    check(scn, 'e-mail da bio não usado', !s.rows.some((x) => x.email));
    check(scn, 'aviso automático explica a retenção', s.notifications.some((n) => /retém esse contato|retém o contato/.test(n)), s.notifications);
    check(scn, 'decisão persiste após recarga (Iniciar desabilitado)', r.afterReload.commercialContactUnavailable === true && r.startEnabledAfterReload === false && /retém o contato/.test(r.afterReload.bodyText));
    const lines = JSON.stringify(r.xlsx['Respostas reais'] || []);
    check(scn, 'XLSX traz decisão e retenção no diagnóstico', /contato retido pela consulta web/.test(lines) && /loja_r3/.test(lines), lines.slice(0, 300));
    check(scn, 'nenhuma consulta após o encerramento (inclusive após recarregar)', profileReqs(log).length === 4);
  }
  if (/verificacao_429/.test(scn)) {
    const until = Number(s.storage.ig_contact_cooldown_until) || 0, reqAt = profileReqs(log)[0] ? profileReqs(log)[0].t : 0;
    check(scn, 'verificação recebeu 429: 1 consulta, pausa salva pelo Retry-After', profileReqs(log).length === 1 && Math.abs(until - (reqAt + 300000)) < 5000, { reqs: profileReqs(log).length, until });
    check(scn, 'durante a pausa: verificação e Iniciar desabilitados', r.probeDisabled === true && r.startDisabled === true);
    check(scn, 'nenhuma consulta automática depois do 429', profileReqs(log).length === 1);
    check(scn, 'diagnóstico registra HTTP 429 e Retry-After', /HTTP 429/.test(r.diag) && /Retry-After=300/.test(r.diag), r.diag.slice(0, 300));
  }
  if (/tres_indisponiveis/.test(scn)) {
    check(scn, 'pausa após 3 indisponíveis seguidos', r.paused.isPaused && r.reqsWhilePaused === 3, { reqs: r.reqsWhilePaused });
    check(scn, 'Continue retoma e segue para o próximo perfil', r.resumed && byUser.loja_depois && byUser.loja_depois.status === 'found' && profileReqs(log).length === 4);
    check(scn, 'indisponíveis não são consultados de novo', ['sumiu1', 'sumiu2', 'sumiu3'].every((u) => profileReqs(log).filter((e) => e.username === u).length === 1));
  }
  if (/identidade/.test(scn)) {
    if (label === 'v13') {
      check(scn, '[v13] divergência de identidade para a fila inteira (comportamento anterior)', profileReqs(log).length === 1 && s.isPaused, profileReqs(log).length);
      return;
    }
    check(scn, 'perfil divergente marcado e não aplicado', byUser.renomeado.status === 'identity_mismatch' && !byUser.renomeado.email && byUser.renomeado.detailLoaded);
    check(scn, 'fila segue para o próximo perfil', byUser.loja_ok.status === 'found' && byUser.loja_ok.email === 'ok@loja.com');
  }
}

(async () => {
  const [extDir, label, ...names] = process.argv.slice(2);
  const jobs = names.map((n) => {
    const [name, arg] = n.split(':');
    return SCENARIOS[name](extDir, label, arg === undefined ? undefined : (isNaN(Number(arg)) ? arg : Number(arg)))
      .then((r) => assess(label, r))
      .catch((e) => check(label + ':' + n, 'cenário executado', false, String(e && e.stack || e)));
  });
  await Promise.all(jobs);
  let failed = 0;
  for (const r of results) {
    if (!r.ok) failed++;
    console.log(`${r.ok ? 'PASS' : 'FAIL'}  ${r.scn}  ${r.name}${r.ok ? '' : '  ' + JSON.stringify(r.detail)}`);
  }
  console.log(`\n${results.length - failed}/${results.length} verificações OK`);
  process.exit(failed ? 1 : 0);
})();
