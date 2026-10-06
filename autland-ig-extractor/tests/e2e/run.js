/* Usage: node run.js <extDir> <label> <scenario...>
 * All Instagram responses below are SIMULATED fixtures. */
const H = require('./harness');
const fs = require('fs'), os = require('os'), path = require('path');
const PIXEL = H.PIXEL;

// Comment mode asks /api/v1/users/{id}/info/: the answer is { user: {...}, status: 'ok' } (see mobileUser below).
const F = {
  personalOmitted: (u, pk) => () => mobileUser(pk, u, { account_type: 1, is_business: false, biography: 'contato: pessoal@gmail.com' }),
  personalNull: (u, pk) => () => mobileUser(pk, u, { account_type: 1, is_business: false, public_email: '', should_show_public_contacts: false }),
  businessFound: (u, pk, email) => () => mobileUser(pk, u, { account_type: 2, is_business: true, public_email: email, business_contact_method: 'UNKNOWN', should_show_public_contacts: true, biography: 'bio email: outro@bio.com', category: 'Loja' }),
  creatorNull: (u, pk) => () => mobileUser(pk, u, { account_type: 3, is_business: false, public_email: '', should_show_public_contacts: true }),
  businessHidden: (u, pk, email) => () => mobileUser(pk, u, { account_type: 2, is_business: true, public_email: email, should_show_public_contacts: false }),
  businessEmpty: (u, pk) => () => mobileUser(pk, u, { account_type: 2, is_business: true, public_email: '', should_show_public_contacts: true }),
  businessOmitted: (u, pk) => () => mobileUser(pk, u, { account_type: 2, is_business: true, biography: 'email na bio: bio@empresa.com' }),
  businessWithheld: (u, pk) => () => mobileUser(pk, u, { account_type: 2, is_business: true, should_show_public_contacts: true, business_contact_method: 'CALL', public_email: '', business_phone_number: null, business_address_json: '{"city_name": "Sao Paulo"}', biography: 'orçamentos: bio@loja.com' }),
  creatorOmitted: (u, pk) => () => mobileUser(pk, u, { account_type: 3, is_business: false }),
  userNull: () => () => ({ status: 404, body: { message: 'User not found', status: 'fail' } }),
  rate429: (retryAfter) => () => ({ status: 429, headers: retryAfter ? { 'retry-after': String(retryAfter) } : {}, body: { message: 'Please wait a few minutes before you try again.', status: 'fail' } }),
  forbidden: () => () => ({ status: 403, body: { message: 'login_required', status: 'fail' } }),
  forbiddenPlain: () => () => ({ status: 403, body: { message: 'Forbidden', status: 'fail' } }),
  serverError: () => () => ({ status: 503, body: { message: 'service unavailable', status: 'fail' } }),
  redirectLogin: () => () => ({ status: 302, headers: { location: 'https://www.instagram.com/accounts/login/?next=%2F' }, contentType: 'text/html', body: '' }),
  htmlLogin: () => () => ({ status: 200, contentType: 'text/html', body: '<!DOCTYPE html><html><body>Login • Instagram</body></html>' }),
  mismatch: (u, pk) => () => mobileUser(pk + 1000, u + '_novo', { account_type: 2, is_business: true, public_email: 'naoaplicar@empresa.com' }),
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
  check(scn, 'nenhuma chamada a web_profile_info (o Comment pergunta só /users/{id}/info/)', !log.some((e) => e.kind === 'FORBIDDEN_web_profile_info'), log.filter((e) => e.kind === 'FORBIDDEN_web_profile_info').map((e) => e.url).slice(0, 3));
  check(scn, 'nenhum host externo não simulado', !log.some((e) => e.kind === 'blocked'), log.filter((e) => e.kind === 'blocked').map((e) => e.url).slice(0, 5));
  check(scn, 'intervalo >= 10 s entre consultas de perfil', spacingOk(log), profileReqs(log).map((e) => e.t));
  check(scn, 'mesma rota e mesma sessão dos outros modos: /users/{id}/info/, X-IG-App-ID padrão, cabeçalhos csrf e claim da sessão, sem troca de host', profileReqs(log).every((e) => e.headers['x-ig-app-id'] === '936619743392459' && /^\/api\/v1\/users\/\d+\/info\/?$/.test(e.path || '') && e.credentials && e.credentials.csrfHeader && e.credentials.withClaimHeader), profileReqs(log).slice(0, 2).map((e) => [e.path, e.credentials]));
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
  // The product default is 15-30 s per profile (scenario ritmo_padrao); the others use the 10 s floor.
  if (!scenario.defaultPacing) await page.evaluate(() => chrome.storage.local.set({ intervals: [10, 10] }));
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
    };
    const o = await open(extDir, 'omit', { comments, profiles });
    await H.clickButton(o.page, 'Iniciar');
    const s = await H.waitFor(o.page, (x) => (x.rows.length === 5 && x.rows.every((r) => r.detailLoaded) && settled(x)) || (x.rows.length === 5 && x.isPaused && !x.detailCycle && profileReqs(o.log).length >= 1 && Date.now() - profileReqs(o.log).slice(-1)[0].t > 25000), { timeout: 200000, every: 2000 });
    const reqsBefore = profileReqs(o.log).length;
    const continueClicked = false, toasts = [], reqsAfterContinue = reqsBefore;
    await o.page.reload();
    await o.page.waitForTimeout(4000);
    const afterReload = await H.snapshot(o.page);
    const startEnabledAfterReload = await o.page.locator('button', { hasText: 'Iniciar' }).first().isEnabled().catch(() => null);
        const diag = await o.page.evaluate(`(() => { const vm = ${H.findVmSource()}; return vm.contactDiagnosticText; })()`);
    await o.ctx.close();
    return { scn, s, afterReload, startEnabledAfterReload, diag, continueClicked, toasts, reqsBefore, reqsAfterContinue, log: o.log, errors: o.consoleErrors };
  },
async falha_acesso(extDir, label, kind) {
    const scn = label + ':falha_' + kind;
    const comments = [{ pk: 51, username: 'perfil_falha' }, { pk: 52, username: 'perfil_seguinte' }];
    const fx = { http403: F.forbidden(), html: F.htmlLogin(), negado: F.forbiddenPlain(), http503: F.serverError() }[kind];  // a login redirect is followed by the browser and arrives as the login page (html)
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
    const s = await H.waitFor(o.page, (x) => (x.rows.length === 5 && x.rows.every((r) => r.detailLoaded) && settled(x)) || (x.rows.length === 5 && x.isPaused && !x.detailCycle && profileReqs(o.log).length >= 4 && Date.now() - profileReqs(o.log).slice(-1)[0].t > 25000), { timeout: 200000, every: 2000 });
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
    // "Validar 1 perfil pendente" gets a 429: exactly one request, the pause is saved, nothing else leaves.
    const scn = label + ':verificacao_429';
    const comments = [{ pk: 61, username: 'fila_a' }, { pk: 62, username: 'fila_b' }];
    const profiles = { fila_a: F.rate429(300), fila_b: F.businessFound('fila_b', 62, 'b@fila.com') };
    const o = await open(extDir, 'p429', { comments, profiles });
    await H.clickButton(o.page, 'Iniciar');
    await H.waitFor(o.page, (x) => x.rows.length === 2, { timeout: 90000, every: 500 });
    await H.clickButton(o.page, 'Pause').catch(() => false);
    await o.page.waitForTimeout(1500);
    const reqsBefore = profileReqs(o.log).length;
    await H.clickButton(o.page, 'Validar 1 perfil pendente');
    let s = await H.waitFor(o.page, (x) => profileReqs(o.log).length > reqsBefore && x.retryAfterUntil, { timeout: 60000 });
    await o.page.waitForTimeout(1500);
    const probeDisabled = await o.page.locator('button', { hasText: 'Validar 1 perfil pendente' }).first().isDisabled();
        const reqsAtPause = profileReqs(o.log).length;
    const continueClicked = await H.clickButton(o.page, 'Continue').catch(() => false);
    await o.page.waitForTimeout(15000);
    s = await H.snapshot(o.page);
    const startDisabled = profileReqs(o.log).length === reqsAtPause;
    const diag = await o.page.evaluate(`(() => { const vm = ${H.findVmSource()}; return vm.contactDiagnosticText; })()`);
    await o.ctx.close();
    return { scn, s, probeDisabled, startDisabled, diag, reqsBefore, log: o.log, errors: o.consoleErrors };
  },
  async tres_indisponiveis(extDir, label) {
    // Deleted commenters (404) are row results: three in a row do not stop the queue.
    const scn = label + ':tres_indisponiveis';
    const comments = [{ pk: 71, username: 'sumiu1' }, { pk: 72, username: 'sumiu2' }, { pk: 73, username: 'sumiu3' }, { pk: 74, username: 'loja_depois' }];
    const profiles = { sumiu1: F.userNull(), sumiu2: F.userNull(), sumiu3: F.userNull(), loja_depois: F.businessFound('loja_depois', 74, 'depois@loja.com') };
    const o = await open(extDir, 'tri', { comments, profiles });
    await H.clickButton(o.page, 'Iniciar');
    const s = await H.waitFor(o.page, (x) => x.rows.length === 4 && x.rows.every((r) => r.detailLoaded) && x.isComplete, { timeout: 120000, every: 2000 });
    await o.ctx.close();
    return { scn, s, log: o.log, errors: o.consoleErrors };
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
    const commentReqs1 = o.log.filter((e) => e.kind === 'comments').length;
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
        return { scn, s: s2, s1, resumed, reqs1, commentReqs1, stored, historyS1, startClicked, log: o.log, errors: o.consoleErrors };
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
  async pausa_1259_1313(extDir, label) {
    // Reproduces the real timeline: HTTP 429 at 12:59 (no Retry-After), pause until 13:59,
    // dashboard reopened at 13:13. Also: extension Reload, files copied over the installed
    // folder + Reload, several tabs at once, and the first allowed retry after 13:59.
    const scn = label + ':pausa_1259_1313';
    const live = fs.mkdtempSync(path.join(os.tmpdir(), 'ext-live-'));
    fs.cpSync(extDir, live, { recursive: true });
    const comments = [{ pk: 141, username: 'djrolandgonzales' }, { pk: 142, username: 'leticiakubiak' }, { pk: 143, username: 'gonza.sosa.dj' }];
    const profiles = {
      djrolandgonzales: () => ({ status: 429, body: { message: 'Please wait a few minutes before you try again.', status: 'fail' } }),
      leticiakubiak: F.businessFound('leticiakubiak', 142, 'l@loja.com'),
      'gonza.sosa.dj': F.businessFound('gonza.sosa.dj', 143, 'g@loja.com'),
    };
    const log = [];
    const { ctx, id } = await H.launch(live, 'p1259', { timezoneId: 'America/Sao_Paulo' });
    await H.install(ctx, { comments, profiles, friendships: () => ({ status: 200, body: { status: 'ok', users: [], next_max_id: null, big_list: false } }) }, log);
    await ctx.clock.install({ time: new Date('2026-10-05T12:59:00-03:00') });
    await ctx.clock.resume();
    const mgr = await ctx.newPage();
    await mgr.goto('chrome://extensions/');
    await mgr.evaluate(() => chrome.developerPrivate.updateProfileConfiguration({ inDeveloperMode: true }));
    const reloadExtension = async () => { await mgr.evaluate((x) => chrome.developerPrivate.reload(x, { failQuietly: true }), id); await mgr.waitForTimeout(2000); };
    const ig = () => log.filter((e) => ['comments', 'profile', 'info', 'friendships', 'list', 'instagram-other'].includes(e.kind));
    const errors = [];
    const openDash = async (hash) => {
      const p = await ctx.newPage();
      p.on('pageerror', (e) => errors.push(String(e)));
      for (let i = 0; ; i++) {
        try { await p.goto(`chrome-extension://${id}/dashboard.html#/${hash || '?ins=DdRmsyLOnoY&type=4'}`); break; }
        catch (e) { if (i >= 20) throw e; await p.waitForTimeout(1000); }
      }
      await p.waitForTimeout(3500);
      return p;
    };
    const pageNow = (p) => p.evaluate(() => Date.now());
    const blockedChecks = async (p) => {
      const snap = await H.snapshot(p);
      const start = p.locator('button', { hasText: 'Iniciar' }).first();
      const startDisabled = await start.isDisabled().catch(() => null);
      if (startDisabled === false) await start.click().catch(() => {});
      // The manual check, through the UI and through its handler directly.
            const probe = p.locator('button', { hasText: 'Validar 1 perfil pendente' }).first();
      const probeDisabled = await probe.isDisabled().catch(() => null);
      await p.evaluate(`(() => { const vm = ${H.findVmSource()}; return vm.handleContactProbe(); })()`).catch(() => {});
      await p.waitForTimeout(2500);
      return { paused: snap.isPaused, startDisabled, probeDisabled, stored: Number(snap.storage.ig_contact_cooldown_until) || 0, text: snap.bodyText };
    };
    const out = { steps: {} };
    // 12:59 — Iniciar: comment list, first profile, HTTP 429 without Retry-After.
    const p1 = await openDash();
    await H.clickButton(p1, 'Iniciar');
    const s1 = await H.waitFor(p1, (x) => profileReqs(log).length >= 1 && x.isPaused && !x.detailCycle, { timeout: 120000 });
    await p1.waitForTimeout(1500);
    const s1b = await H.snapshot(p1);
    const ev1 = (s1b.storage.ig_commercial_contact_evidence_v14 || [])[0] || {};
    out.first = { reqs: profileReqs(log).length, ev: ev1, stored: Number(s1b.storage.ig_contact_cooldown_until) || 0,
      refusals: (s1b.storage.ig_commercial_contact_schema_v14 || {}).refusals, since: s1b.storage.ig_contact_state_since,
      diag: await p1.evaluate(`(() => { const vm = ${H.findVmSource()}; return vm.contactDiagnosticText; })()`) };
    await p1.close();
    // 13:13:06 — the dashboard is opened again.
    await ctx.clock.setSystemTime(new Date('2026-10-05T13:13:06-03:00'));
    let mark = ig().length;
    const p2 = await openDash();
    out.steps.reaberto = Object.assign(await blockedChecks(p2), { now: await pageNow(p2), reqs: ig().length - mark });
    // Extension Reload (button in chrome://extensions).
    mark = ig().length;
    await reloadExtension();
    const p3 = await openDash();
    out.steps.recarregar = Object.assign(await blockedChecks(p3), { reqs: ig().length - mark });
    // Newer files copied over the installed folder, then Reload.
    mark = ig().length;
    fs.cpSync(extDir, live, { recursive: true, force: true });
    fs.appendFileSync(path.join(live, 'LEIA-ME.txt'), '\n');
    await reloadExtension();
    const p4 = await openDash();
    out.steps.atualizar_arquivos = Object.assign(await blockedChecks(p4), { reqs: ig().length - mark });
    // Several tabs at once: two Comment dashboards and one Followers dashboard.
    mark = ig().length;
    const tabs = [await openDash(), await openDash(), await openDash('?ins=alvo_loja&type=0')];
    await tabs[0].waitForTimeout(8000);
    const followers = await H.snapshot(tabs[2]);
    out.steps.varias_abas = { reqs: ig().length - mark, followersPaused: followers.isPaused,
      followersNotice: followers.notifications.some((n) => /cooldown is active/.test(n)) };
    await tabs[2].close();
    // 13:59:30 — after the pause: one click sends exactly one profile request; a new 429 stops it again.
    await ctx.clock.setSystemTime(new Date('2026-10-05T13:59:30-03:00'));
    await tabs[0].waitForTimeout(2500);
    mark = ig().length;
    const before = profileReqs(log).length;
    const clicked = await H.clickButton(tabs[0], 'Iniciar');
    const s5 = await H.waitFor(tabs[0], (x) => profileReqs(log).length > before && x.isPaused && !x.detailCycle, { timeout: 120000 });
    await tabs[0].waitForTimeout(8000);
    const s5b = await H.snapshot(tabs[0]);
    const ev5 = (s5b.storage.ig_commercial_contact_evidence_v14 || [])[0] || {};
    out.after = { clicked, profileReqs: profileReqs(log).length - before, igReqs: ig().length - mark, ev: ev5,
      stored: Number(s5b.storage.ig_contact_cooldown_until) || 0, refusals: (s5b.storage.ig_commercial_contact_schema_v14 || {}).refusals,
      otherTabPaused: (await H.snapshot(tabs[1])).isPaused };
    await ctx.close();
    return { scn, s: s5b, out, log, errors };
  },
  async armazenamento_vazio_1313(extDir, label) {
    // Stand-in for "the extension's saved state was emptied between 12:59 and 13:13" (removed and
    // added again, another Chrome profile...): reproduces the screens of the real test.
    const scn = label + ':armazenamento_vazio_1313';
    const comments = [{ pk: 141, username: 'djrolandgonzales' }, { pk: 142, username: 'leticiakubiak' }];
    const profiles = { djrolandgonzales: () => ({ status: 429, body: { message: 'Please wait a few minutes before you try again.', status: 'fail' } }) };
    const log = [];
    const { ctx, id } = await H.launch(extDir, 'p1313', { timezoneId: 'America/Sao_Paulo' });
    await H.install(ctx, { comments, profiles }, log);
    await ctx.clock.install({ time: new Date('2026-10-05T12:59:00-03:00') });
    await ctx.clock.resume();
    const errors = [];
    const openDash = async () => {
      const p = await ctx.newPage();
      p.on('pageerror', (e) => errors.push(String(e)));
      for (let i = 0; ; i++) { try { await p.goto(`chrome-extension://${id}/dashboard.html#/?ins=DdRmsyLOnoY&type=4`); break; } catch (e) { if (i >= 20) throw e; await p.waitForTimeout(1000); } }
      await p.waitForTimeout(3500);
      return p;
    };
    const diagOf = (p) => p.evaluate(`(() => { const vm = ${H.findVmSource()}; return vm.contactDiagnosticText; })()`);
    const p1 = await openDash();
    await H.clickButton(p1, 'Iniciar');
    await H.waitFor(p1, (x) => profileReqs(log).length >= 1 && x.isPaused && !x.detailCycle, { timeout: 120000 });
    await p1.waitForTimeout(1500);
    const first = await H.snapshot(p1);
    await p1.evaluate(() => chrome.storage.local.clear());
    await p1.close();
    await ctx.clock.setSystemTime(new Date('2026-10-05T13:13:00-03:00'));
    const p2 = await openDash();
    const reopened = await H.snapshot(p2);
    const startEnabled = await p2.locator('button', { hasText: 'Iniciar' }).first().isEnabled().catch(() => null);
    const before = profileReqs(log).length;
    await H.clickButton(p2, 'Iniciar');
    await H.waitFor(p2, (x) => profileReqs(log).length > before && x.isPaused && !x.detailCycle, { timeout: 120000 });
    await p2.waitForTimeout(1500);
    const after = await H.snapshot(p2);
    const diag = await diagOf(p2);
    await ctx.close();
    return { scn, s: after, first, reopened, startEnabled, reqsAfter: profileReqs(log).length - before, diag, log, errors };
  },
  async comentarios_primeiro(extDir, label) {
    // 7 comentaristas em 3 páginas; o 2º perfil recebe 429. A lista inteira vem antes de qualquer consulta.
    const scn = label + ':comentarios_primeiro';
    const comments = Array.from({ length: 7 }, (_, i) => ({ pk: 120 + i, username: 'pag_' + i }));
    const profiles = { pag_0: F.businessFound('pag_0', 120, 'p0@loja.com'), pag_1: F.rate429(300) };
    for (let i = 2; i < 7; i++) profiles['pag_' + i] = F.businessFound('pag_' + i, 120 + i, 'p' + i + '@loja.com');
    const o = await open(extDir, 'pag', { comments, profiles, commentPageSize: 3 });
    await H.clickButton(o.page, 'Iniciar');
    let s = await H.waitFor(o.page, (x) => profileReqs(o.log).length >= 2 && x.isPaused && !x.detailCycle, { timeout: 180000, every: 1000 });
    await o.page.waitForTimeout(20000); // nenhuma repetição automática
    s = await H.snapshot(o.page);
    const csvAll = await H.exportCsv(o.page, 'all');
    await o.ctx.close();
    return { scn, s, csvAll, log: o.log, errors: o.consoleErrors };
  },
  async cache_entre_extracoes(extDir, label) {
    // 2ª extração (outro post, outra aba) com os mesmos comentaristas: nenhuma consulta repetida.
    const scn = label + ':cache_entre_extracoes';
    const comments = [{ pk: 131, username: 'cache_loja' }, { pk: 132, username: 'cache_pessoa' }];
    const profiles = { cache_loja: F.businessFound('cache_loja', 131, 'cache@loja.com'), cache_pessoa: F.personalOmitted('cache_pessoa', 132) };
    const o = await open(extDir, 'cch', { comments, profiles });
    await H.clickButton(o.page, 'Iniciar');
    const s1 = await H.waitFor(o.page, (x) => x.rows.length === 2 && x.rows.every((r) => r.detailLoaded) && x.isComplete, { timeout: 120000, every: 2000 });
    const reqs1 = profileReqs(o.log).length;
    const p2 = await o.ctx.newPage();
    p2.on('pageerror', (e) => o.consoleErrors.push(String(e)));
    await p2.goto(`chrome-extension://${o.id}/dashboard.html#/?ins=POSTTEST2&type=4`);
    await p2.waitForTimeout(2500);
    const started = Date.now();
    await H.clickButton(p2, 'Iniciar');
    const s = await H.waitFor(p2, (x) => x.rows.length === 2 && x.rows.every((r) => r.detailLoaded) && x.isComplete, { timeout: 90000, every: 500 });
    const seconds = (Date.now() - started) / 1000;
    const reqs2 = profileReqs(o.log).length - reqs1;
    await o.ctx.close();
    return { scn, s, s1, reqs1, reqs2, seconds, log: o.log, errors: o.consoleErrors };
  },
    async validacao_inicial(extDir, label) {
    // The first answer of a run is shown as a card; "Validar 1 perfil pendente" asks ONE profile and the queue reuses it.
    const scn = label + ':validacao_inicial';
    const comments = [{ pk: 151, username: 'val_a' }, { pk: 152, username: 'val_b' }, { pk: 153, username: 'val_c' }];
    const profiles = { val_a: F.businessFound('val_a', 151, 'valida@loja.com.br'), val_b: F.businessEmpty('val_b', 152), val_c: F.personalOmitted('val_c', 153) };
    const o = await open(extDir, 'val', { comments, profiles });
    await H.clickButton(o.page, 'Iniciar');
    await H.waitFor(o.page, (x) => x.rows.length === 3, { timeout: 90000, every: 500 });
    await H.clickButton(o.page, 'Pause').catch(() => false);
    await o.page.waitForTimeout(1500);
    const before = profileReqs(o.log).length;
    const pendingBefore = (await H.snapshot(o.page)).rows.map((x) => x.state);
    const probeEnabled = await o.page.locator('button', { hasText: 'Validar 1 perfil pendente' }).first().isEnabled().catch(() => null);
    await H.clickButton(o.page, 'Validar 1 perfil pendente');
    const afterProbe = await H.waitFor(o.page, (x) => profileReqs(o.log).length > before && x.notifications.some((n) => /Validação de 1 consulta/.test(n)), { timeout: 60000 });
    await o.page.waitForTimeout(2500);
    const probeReqs = profileReqs(o.log).length - before;
    const card = afterProbe.notifications.find((n) => /Validação de 1 consulta/.test(n)) || '';
    const rowAfterProbe = (await H.snapshot(o.page)).rows[0];
    // The board is in the panel: no button may be hidden under it (it used to be a 600x520 overlay over Continue/Export).
    const covered = await H.coveredControls(o.page);
    const board = await o.page.evaluate(() => { const c = document.querySelector('.contact-validation-card'); return c ? { inNotices: !!c.closest('.notices'), position: getComputedStyle(c).position, hasClose: !!c.querySelector('button.delete') } : null; });
    await H.clickButton(o.page, 'Continue');
    const s = await H.waitFor(o.page, (x) => x.isComplete && x.rows.every((r) => r.detailLoaded), { timeout: 150000, every: 2000 });
    await o.ctx.close();
    return { scn, s, pendingBefore, probeEnabled, probeReqs, card, rowAfterProbe, covered, board, log: o.log, errors: o.consoleErrors };
  },
  async ritmo_padrao(extDir, label) {
    // No saved interval: the same 15-30 s default as the other modes (the other scenarios seed 10 s).
    const scn = label + ':ritmo_padrao';
    const comments = [{ pk: 161, username: 'rit_a' }, { pk: 162, username: 'rit_b' }, { pk: 163, username: 'rit_c' }];
    const profiles = { rit_a: F.businessEmpty('rit_a', 161), rit_b: F.businessEmpty('rit_b', 162), rit_c: F.businessEmpty('rit_c', 163) };
    const o = await open(extDir, 'rit', { comments, profiles, defaultPacing: true });
    await H.clickButton(o.page, 'Iniciar');
    const s = await H.waitFor(o.page, (x) => x.isComplete && x.rows.every((r) => r.detailLoaded), { timeout: 300000, every: 3000 });
    await o.ctx.close();
    return { scn, s, log: o.log, errors: o.consoleErrors };
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
    check(scn, 'estado de cada linha: email_found / no_public_email / profile_unavailable', byUser.loja_com_email.state === 'email_found' && ['pessoal_sem_campo', 'criador_nulo', 'loja_oculta', 'loja_vazia', 'pessoal_nulo'].every((u) => byUser[u].state === 'no_public_email') && byUser.conta_apagada.state === 'profile_unavailable', s.rows.map((x) => [x.user, x.state]));
    check(scn, 'textos: "E-mail comercial encontrado" e "Perfil não disponibiliza e-mail público" (nada de contato retido)', byUser.loja_com_email.text === 'E-mail comercial encontrado' && /^Perfil não disponibiliza e-mail público/.test(byUser.loja_vazia.text) && !s.rows.some((x) => /retid|não entregue/i.test(x.text)), s.rows.map((x) => x.text));
    check(scn, 'perfil apagado preserva nome do comentário', byUser.conta_apagada && byUser.conta_apagada.user === 'conta_apagada');
    const emailCol = (csv) => { const rows = parseCsv(csv); const i = rows[0].indexOf('E-mail comercial'); return rows.slice(1).map((x) => x[i]).filter((v) => v !== undefined); };
    check(scn, 'CSV de e-mails: coluna "E-mail comercial" só com o contato comercial', JSON.stringify(emailCol(r.csvEmail)) === JSON.stringify(['contato@lojaexemplo.com.br']), emailCol(r.csvEmail));
    check(scn, 'CSV completo: coluna de e-mail sem bio/oculto/pessoal', emailCol(r.csvAll).filter(Boolean).join() === 'contato@lojaexemplo.com.br', emailCol(r.csvAll));
    check(scn, 'CSV completo tem 7 linhas e coluna de status', r.csvAll.trim().split('\n').length === 8 && /Status do e-mail/.test(r.csvAll) && /contato oculto pelo perfil/.test(r.csvAll) && /campo vazio/.test(r.csvAll) && /E-mail comercial encontrado/.test(r.csvAll) && !/não entregue|retid/i.test(r.csvAll), r.csvAll.split('\n').slice(0, 3));
    const sheets = r.xlsx || {};
    const diag = sheets['Diagnostico contato'] || [];
    const hdr = diag[0] || [];
    const rowOf = (u) => diag.find((x) => x[0] === '@' + u) || [];
    const col = (name) => hdr.indexOf(name);
    check(scn, 'XLSX: aba de dados + 2 abas de diagnóstico automáticas', Object.keys(sheets).length === 3 && sheets['Respostas reais'] && diag.length === 8, Object.keys(sheets));
    check(scn, 'XLSX diagnóstico: public_email ausente x vazio x preenchido por perfil', rowOf('pessoal_sem_campo')[col('public_email')] === 'absent' && rowOf('criador_nulo')[col('public_email')] === 'empty' && rowOf('loja_vazia')[col('public_email')] === 'empty' && rowOf('loja_com_email')[col('public_email')] === 'valid', { hdr, sample: diag.slice(1, 4) });
    check(scn, 'XLSX diagnóstico: coluna "Estado do contato" com os estados', rowOf('loja_com_email')[col('Estado do contato')] === 'email_found' && rowOf('loja_vazia')[col('Estado do contato')] === 'no_public_email' && rowOf('conta_apagada')[col('Estado do contato')] === 'profile_unavailable', diag.slice(1, 3));
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
    check(scn, '4 profissionais sem campo + 1 pessoal: a fila NÃO para (5 consultas) e conclui', profileReqs(log).map((e) => e.username).join() === 'pessoal_x,loja_om1,loja_om2,criador_om,loja_om4' && s.isComplete === true, { reqs: profileReqs(log).map((e) => e.username), done: s.isComplete });
    check(scn, 'status: pessoal / omitido x4', byUser.pessoal_x.status === 'not_professional' && ['loja_om1', 'loja_om2', 'criador_om', 'loja_om4'].every((u) => byUser[u].status === 'omitted'));
    check(scn, 'e-mail da bio não usado', !s.rows.some((x) => x.email));
    check(scn, 'nenhuma parada salva: após recarregar, Iniciar habilitado', r.afterReload.commercialContactUnavailable === false && r.startEnabledAfterReload === true, { unavailable: r.afterReload.commercialContactUnavailable, start: r.startEnabledAfterReload });
    
    check(scn, 'diagnóstico mostra a rota, HTTP 200, o estado e a decisão do parser', /\/api\/v1\/users\/\{id\}\/info\//.test(r.diag) && /HTTP 200/.test(r.diag) && /estado=no_public_email/.test(r.diag) && /decisão=no_public_email \(omitted\)/.test(r.diag) && /public_email=absent/.test(r.diag), r.diag.slice(0, 500));
    check(scn, 'diagnóstico não fala em contato retido', !/retid|retém/i.test(r.diag));
    
  }
  if (/falha_/.test(scn)) {
    const code = { http403: 'login_required', html: 'login_required', negado: 'access_denied', http503: 'temporary' }[r.kind];
    const state = { http403: 'login_required', html: 'login_required', negado: 'access_denied', http503: 'temporary_error' }[r.kind];
    const text = { http403: 'Sessão precisa ser verificada', html: 'Sessão precisa ser verificada', negado: 'Acesso negado pelo Instagram', http503: 'Falha temporária na consulta' }[r.kind];
    check(scn, `estado ${state} e texto "${text}" (nunca "sem e-mail")`, s.rows[0] && s.rows[0].state === state && s.rows[0].text.indexOf(text) === 0 && !s.rows[0].detailLoaded, s.rows[0]);
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
    check(scn, 'fila salva: a retomada não relê nenhuma página de comentários', log.filter((e) => e.kind === 'comments').length === r.commentReqs1, { before: r.commentReqs1, total: log.filter((e) => e.kind === 'comments').length });
    check(scn, 'cada perfil consultado no máximo 2 vezes no total (só o que recebeu 429 repete)', log.filter((e) => e.kind === 'profile' && e.username === 'ret_um').length === 1 && log.filter((e) => e.kind === 'profile' && e.username === 'ret_dois').length === 2, profileReqs(log).map((e) => e.username));
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
  if (/armazenamento_vazio_1313/.test(scn)) {
    const hour = 3600000, brt = (ms) => new Date(ms - 3 * hour).toISOString().slice(11, 19);
    const ev = (s.storage.ig_commercial_contact_evidence_v14 || [])[0] || {};
    check(scn, 'com o armazenamento vazio às 13:13, a pausa de 12:59 não existe mais', !r.reopened.storage.ig_contact_cooldown_until && r.startEnabled === true, { stored: r.reopened.storage.ig_contact_cooldown_until, start: r.startEnabled });
    check(scn, 'Iniciar envia de novo 1 consulta e recebe 429 (como no teste real)', r.reqsAfter === 1 && ev.http === 429, { reqs: r.reqsAfter, http: ev.http });
    check(scn, 'mesma tela do teste real: "recusas seguidas: 1" e pausa até 14:13', (s.storage.ig_commercial_contact_schema_v14 || {}).refusals === 1 && brt(Number(s.storage.ig_contact_cooldown_until)).startsWith('14:13'), { refusals: (s.storage.ig_commercial_contact_schema_v14 || {}).refusals, until: brt(Number(s.storage.ig_contact_cooldown_until)) });
    check(scn, '15.2: o diagnóstico prova o reinício (estado salvo desde 13:13)', /Estado salvo neste navegador desde: .*1:13|Estado salvo neste navegador desde: .*13:13/.test(r.diag), (r.diag.match(/Estado salvo[^\n]*/) || [''])[0].slice(0, 90));
  }
  if (/pausa_1259_1313/.test(scn)) {
    const o = r.out, hour = 3600000, brt = (ms) => new Date(ms - 3 * hour).toISOString().slice(11, 19);
    check(scn, '12:59: 1 consulta, HTTP 429 sem Retry-After', o.first.reqs === 1 && o.first.ev.http === 429 && !o.first.ev.retryAfter, { reqs: o.first.reqs, http: o.first.ev.http, ra: o.first.ev.retryAfter, at: o.first.ev.at && brt(o.first.ev.at) });
    check(scn, '12:59: pausa de 60 min salva no navegador (até 13:59)', Math.abs(o.first.stored - (o.first.ev.at + hour)) < 3000 && o.first.ev.cooldownSaved === true, { stored: brt(o.first.stored), at: o.first.ev.at && brt(o.first.ev.at) });
    check(scn, '12:59: contador de recusas = 1 e marcador do estado criado', o.first.refusals === 1 && Number(o.first.since) > 0, { refusals: o.first.refusals, since: o.first.since });
    check(scn, 'diagnóstico mostra pausa salva no navegador e Retry-After ausente', /Pausa salva no navegador: até/.test(o.first.diag) && /Retry-After=ausente/.test(o.first.diag) && /Estado salvo neste navegador desde/.test(o.first.diag), o.first.diag.split('\n').slice(0, 4));
    check(scn, 'diagnóstico não expõe cookie, token nem cabeçalhos', !/csrf|sessionid|ds_user_id|cookie|token/i.test(o.first.diag), o.first.diag.match(/.{0,30}(csrf|sessionid|ds_user_id|cookie|token).{0,30}/i));
    for (const [k, v] of Object.entries(o.steps)) {
      check(scn, `${k}: ZERO consultas ao Instagram durante a pausa`, v.reqs === 0, v.reqs);
      if (k !== 'varias_abas') {
        check(scn, `${k}: pausa conservada (até 13:59) e coleta pausada`, v.paused === true && v.stored === o.first.stored, { paused: v.paused, stored: v.stored && brt(v.stored) });
        check(scn, `${k}: Iniciar e "Validar 1 perfil pendente" bloqueados`, v.startDisabled === true && v.probeDisabled === true, { start: v.startDisabled, probe: v.probeDisabled });
      }
    }
    check(scn, 'reaberto às 13:13:06 (relógio da página)', brt(o.steps.reaberto.now).startsWith('13:13'), brt(o.steps.reaberto.now));
    check(scn, 'várias abas: Seguidores também respeita a pausa salva', o.steps.varias_abas.followersPaused === true && o.steps.varias_abas.followersNotice === true, o.steps.varias_abas);
    check(scn, '13:59:30: Iniciar volta a funcionar e envia 1 única consulta de perfil', o.after.clicked === true && o.after.profileReqs === 1, o.after);
    check(scn, '13:59:30: novo 429 conta 2 recusas seguidas (contador persistiu)', o.after.refusals === 2 && o.after.ev.http === 429, { refusals: o.after.refusals });
    check(scn, '13:59:30: nova pausa de 60 min salva (até 14:59)', Math.abs(o.after.stored - (o.after.ev.at + hour)) < 3000, { stored: o.after.stored && brt(o.after.stored) });
    check(scn, 'a outra aba do Comment continuou pausada', o.after.otherTabPaused === true);
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
    check(scn, 'CALL com e-mail nulo não para a fila: 5 consultas e extração concluída', users.join() === 'pessoal_r,loja_r1,loja_r2,loja_r3,loja_r4' && s.isComplete === true, { users, done: s.isComplete });
    check(scn, 'status "Perfil não disponibiliza e-mail público · campo vazio" (sem rótulo de retenção)', ['loja_r1', 'loja_r2', 'loja_r3', 'loja_r4'].every((u) => byUser[u].status === 'empty' && byUser[u].text === 'Perfil não disponibiliza e-mail público · campo vazio' && byUser[u].state === 'no_public_email'), s.rows.map((x) => [x.user, x.status, x.text]));
    check(scn, 'e-mail da bio não usado', !s.rows.some((x) => x.email));
    check(scn, 'nenhum aviso ou texto de contato retido', !s.notifications.some((n) => /retém|retid/i.test(n)) && !/retém|retid/i.test(s.bodyText), s.notifications);
    const lines = JSON.stringify(r.xlsx || {});
    check(scn, 'XLSX sem conclusão de retenção', !/retid|retém|não entregue/i.test(lines) && /loja_r4/.test(lines), lines.slice(0, 300));
    check(scn, 'cada perfil consultado uma única vez', profileReqs(log).every((e) => e.n === 1));
  }
  if (/comentarios_primeiro/.test(scn)) {
    const pages = log.filter((e) => e.kind === 'comments'), first = profileReqs(log)[0];
    check(scn, 'as 3 páginas de comentários vêm antes da 1ª consulta de perfil', pages.length === 3 && first && pages.every((p) => p.t <= first.t), { pages: pages.map((p) => p.t), first: first && first.t });
    check(scn, '429 no 2º perfil: 2 consultas no total, nenhuma repetição automática', profileReqs(log).map((e) => e.username).join() === 'pag_0,pag_1' && s.isPaused, profileReqs(log).map((e) => e.username));
    const stored = Object.entries(s.storage).filter(([k]) => /^extract_list_/.test(k)).map(([, v]) => v)[0] || [];
    check(scn, 'os 7 comentaristas continuam na tabela e no histórico local depois do 429', s.rows.length === 7 && stored.length === 7, { rows: s.rows.length, stored: stored.length });
    check(scn, 'e-mail do 1º mantido; 2º marcado com 429; demais aguardando', byUser.pag_0 && byUser.pag_0.email === 'p0@loja.com' && byUser.pag_1.failure && byUser.pag_1.failure.code === 'rate_limit' && [2, 3, 4, 5, 6].every((i) => !byUser['pag_' + i].detailLoaded), s.rows.map((x) => [x.user, x.status, x.failure && x.failure.code]));
    const until = Number(s.storage.ig_contact_cooldown_until) || 0, second = profileReqs(log)[1];
    check(scn, 'pausa salva pelo Retry-After (300 s)', second && Math.abs(until - (second.t + 300000)) < 5000, { until });
    check(scn, 'CSV exporta os 7 comentaristas', r.csvAll.trim().split('\n').length === 8, r.csvAll.split('\n').length);
  }
  if (/cache_entre_extracoes/.test(scn)) {
    check(scn, '1ª extração: 2 consultas', r.reqs1 === 2, r.reqs1);
    check(scn, '2ª extração (outro post): 0 consultas, mesmos resultados do cache', r.reqs2 === 0 && byUser.cache_loja && byUser.cache_loja.email === 'cache@loja.com' && byUser.cache_loja.status === 'found' && byUser.cache_pessoa.status === 'not_professional', { reqs2: r.reqs2, rows: s.rows.map((x) => [x.user, x.status, x.email]) });
    check(scn, '2ª extração conclui sem esperar 10 s por perfil', r.seconds < 20, r.seconds);
        const cache = s.storage.ig_contact_profile_cache_v154 || {};
    check(scn, 'cache salvo no navegador por user id', cache['131'] && cache['132'] && cache['131'].result.contactOutcome === 'found', Object.keys(cache));
  }
    if (/validacao_inicial/.test(scn)) {
    check(scn, 'antes da validação todas as linhas estão "pending" e o botão está ativo', r.pendingBefore.length === 3 && r.pendingBefore.every((x) => x === 'pending') && r.probeEnabled === true, { states: r.pendingBefore, enabled: r.probeEnabled });
    check(scn, 'a validação fez UMA consulta, a do 1º pendente (val_a)', r.probeReqs === 1 && profileReqs(log)[0].username === 'val_a', { reqs: r.probeReqs, first: profileReqs(log)[0] && profileReqs(log)[0].username });
    check(scn, 'quadro: endpoint, HTTP 200, public_email, caminho e decisão do parser', /@val_a/.test(r.card) && /GET https:\/\/www\.instagram\.com\/api\/v1\/users\/\{id\}\/info\/ \(enviado de fato\)/.test(r.card) && /HTTP 200 · Retry-After: não se aplica/.test(r.card) && /public_email: texto/.test(r.card) && /Caminho do campo: user\.public_email/.test(r.card) && /Decisão do parser \(e-mail\): email_found \(public_email\) — E-mail comercial encontrado/.test(r.card) && /Horário:/.test(r.card), r.card.slice(0, 600));
    check(scn, 'quadro: e-mail só mascarado, sem cookie, token ou cabeçalho', /E-mail \(mascarado\): v\*\*\*@loja\.com\.br/.test(r.card) && !/valida@loja|cookie|csrf|token|x-ig/i.test(r.card), r.card.slice(0, 300));
    check(scn, 'o quadro fica dentro do painel (não é sobreposição) e tem botão de fechar', r.board && r.board.inNotices === false && r.board.position !== 'fixed' && r.board.hasClose === true, r.board);
    check(scn, 'com o quadro aberto nenhum botão fica coberto (Continue, exportações, Copiar diagnóstico...)', r.covered.length === 0, r.covered);
    check(scn, 'a linha validada só é preenchida quando a fila chega nela', r.rowAfterProbe && r.rowAfterProbe.state === 'pending' && !r.rowAfterProbe.detailLoaded);
    check(scn, 'depois de Continue: 3 consultas no total (o validado não foi repetido)', profileReqs(log).length === 3 && profileReqs(log).filter((e) => e.username === 'val_a').length === 1, profileReqs(log).map((e) => e.username));
    check(scn, 'e-mail do val_a na tabela; os outros sem e-mail público; fila concluída', byUser.val_a.email === 'valida@loja.com.br' && byUser.val_a.state === 'email_found' && byUser.val_b.state === 'no_public_email' && byUser.val_c.state === 'no_public_email' && s.isComplete === true, s.rows.map((x) => [x.user, x.state, x.email]));
  }
  if (/ritmo_padrao/.test(scn)) {
    const ts = profileReqs(log).map((e) => e.t), gaps = ts.slice(1).map((t, i) => t - ts[i]);
    check(scn, 'sem intervalo salvo: 15–30 s entre perfis (o mesmo padrão dos outros modos)', gaps.length === 2 && gaps.every((g) => g >= 14900 && g <= 45000), gaps);
    check(scn, '3 perfis, 3 consultas, fila concluída', profileReqs(log).length === 3 && s.isComplete === true);
  }
  if (/verificacao_429/.test(scn)) {
    const until = Number(s.storage.ig_contact_cooldown_until) || 0, reqAt = profileReqs(log)[0] ? profileReqs(log)[0].t : 0;
        check(scn, 'validação recebeu 429: 1 consulta (a do 1º pendente), pausa salva pelo Retry-After', profileReqs(log).length === 1 && profileReqs(log)[0].username === 'fila_a' && Math.abs(until - (reqAt + 300000)) < 5000, { reqs: profileReqs(log).map((e) => e.username), until });
    check(scn, 'durante a pausa: validação desabilitada e Continue não consulta nada', r.probeDisabled === true && r.startDisabled === true, { probeDisabled: r.probeDisabled, noNewRequests: r.startDisabled });
    check(scn, 'zero consultas depois do 429 (nem o outro perfil, nem sozinho)', profileReqs(log).length === 1 && !profileReqs(log).some((e) => e.username === 'fila_b'));
    check(scn, 'a linha continua pendente (não vira "sem e-mail")', s.rows.every((x) => !x.detailLoaded && x.state !== 'no_public_email'), s.rows.map((x) => [x.user, x.state]));
    check(scn, 'diagnóstico registra HTTP 429 e Retry-After', /HTTP 429/.test(r.diag) && /Retry-After=300/.test(r.diag), r.diag.slice(0, 300));
    check(scn, 'o quadro de validação mostrou o 429', s.notifications.some((n) => /Validação de 1 consulta/.test(n) && /HTTP 429 · Retry-After: 300/.test(n)) || s.toasts.some((n) => /Validação de 1 consulta/.test(n) && /HTTP 429/.test(n)), s.toasts.concat(s.notifications).slice(0, 3));
  }
  if (/tres_indisponiveis/.test(scn)) {
        check(scn, '3 indisponíveis seguidos NÃO pausam a fila: conclui com 4 consultas', s.isComplete === true && profileReqs(log).length === 4, { reqs: profileReqs(log).length, complete: s.isComplete });
    check(scn, 'o próximo perfil é consultado e entrega o e-mail', byUser.loja_depois && byUser.loja_depois.status === 'found' && byUser.loja_depois.email === 'depois@loja.com');
    check(scn, 'indisponíveis: estado profile_unavailable e texto "Perfil indisponível"', ['sumiu1', 'sumiu2', 'sumiu3'].every((u) => byUser[u].state === 'profile_unavailable' && byUser[u].text === 'Perfil indisponível'));
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
