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
  check(scn, 'nenhuma chamada a /users/{id}/info/', !log.some((e) => e.kind === 'FORBIDDEN_users_info'));
  check(scn, 'nenhum host externo não simulado', !log.some((e) => e.kind === 'blocked'), log.filter((e) => e.kind === 'blocked').map((e) => e.url).slice(0, 5));
  check(scn, 'intervalo >= 10 s entre consultas de perfil', spacingOk(log), profileReqs(log).map((e) => e.t));
  check(scn, 'X-IG-App-ID web padrão, sem troca de host', profileReqs(log).every((e) => e.headers['x-ig-app-id'] === '936619743392459'));
}

async function open(extDir, label, scenario) {
  const log = [];
  const { ctx, id } = await H.launch(extDir, label);
  await H.install(ctx, scenario, log);
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
    await o.ctx.close();
    return { scn, s, log: o.log, csvEmail, csvAll, errors: o.consoleErrors };
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
    const toasts = await o.page.locator('.toast').allInnerTexts().catch(() => []);
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
  async verificacao_429(extDir, label) {
    const scn = label + ':verificacao_429';
    const comments = [{ pk: 61, username: 'fila_a' }];
    const profiles = { controle: F.rate429(300), fila_a: F.businessFound('fila_a', 61, 'a@fila.com') };
    const o = await open(extDir, 'p429', { comments, profiles });
    await o.page.locator('input[placeholder*="perfil"]').first().fill('controle');
    await H.clickButton(o.page, 'Verificar 1 perfil');
    let s = await H.waitFor(o.page, (x) => profileReqs(o.log).length >= 1 && !/Consultando/.test(x.bodyText) && x.retryAfterUntil, { timeout: 40000 });
    const probeDisabled = await o.page.locator('button', { hasText: 'Verificar 1 perfil' }).first().isDisabled();
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
    check(scn, 'textos distintos: vazio/oculto/omitido/pessoal', new Set(s.rows.map((x) => x.text)).size >= 5, s.rows.map((x) => x.text));
    check(scn, 'perfil apagado preserva nome do comentário', byUser.conta_apagada && byUser.conta_apagada.user === 'conta_apagada');
    const emailCol = (csv) => { const rows = parseCsv(csv); const i = rows[0].indexOf('E-mail comercial'); return rows.slice(1).map((x) => x[i]).filter((v) => v !== undefined); };
    check(scn, 'CSV de e-mails: coluna "E-mail comercial" só com o contato comercial', JSON.stringify(emailCol(r.csvEmail)) === JSON.stringify(['contato@lojaexemplo.com.br']), emailCol(r.csvEmail));
    check(scn, 'CSV completo: coluna de e-mail sem bio/oculto/pessoal', emailCol(r.csvAll).filter(Boolean).join() === 'contato@lojaexemplo.com.br', emailCol(r.csvAll));
    check(scn, 'CSV completo tem 7 linhas e coluna de status', r.csvAll.trim().split('\n').length === 8 && /Status do e-mail/.test(r.csvAll) && /Contato oculto/.test(r.csvAll) && /Campo comercial vazio/.test(r.csvAll), r.csvAll.split('\n').slice(0, 3));
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
  }
  if (/omitidos_profissionais/.test(scn)) {
    console.log('--- diagnóstico copiado (simulado) ---\n' + r.diag + '\n---');
    check(scn, 'pessoal não conta; para no 3º profissional omitido', profileReqs(log).filter((e) => e.username !== 'controle_loja').length === 4 && !profileReqs(log).some((e) => e.username === 'loja_om4'), profileReqs(log).map((e) => e.username));
    check(scn, 'status: pessoal / omitido x3', byUser.pessoal_x.status === 'not_professional' && ['loja_om1', 'loja_om2', 'criador_om'].every((u) => byUser[u].status === 'omitted'));
    check(scn, 'e-mail da bio não usado', !s.rows.some((x) => x.email));
    check(scn, 'decisão persistida após recarga', r.afterReload.commercialContactUnavailable === true && r.startEnabledAfterReload === false);
    check(scn, 'Continue bloqueado explica o motivo e não consulta', r.continueClicked && r.toasts.some((t) => /Fila bloqueada/.test(t)) && r.reqsAfterContinue === r.reqsBefore, { toasts: r.toasts, before: r.reqsBefore, after: r.reqsAfterContinue });
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
