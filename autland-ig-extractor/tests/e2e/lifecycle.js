/* Lifecycle, error and pause scenarios of the final suite (see final.js). Chromium, the real dashboard and
 * popup, SIMULATED Instagram answers. The pause must hold after: a failure, closing and reopening the
 * dashboard, the extension's Reload button, and an update of the installed folder (15.3 / 15.4 -> this build). */
const L = require('./lib');
const { H, PIXEL, check, mobileUser, roster, ROSTER, gotoRetry, uiExport, openPopupHistory, popupExport, reloadExtension, profileReqs, vmEval, assertPauseHolds } = L;
const F = require('./final');
const { launchOn, openDash, rowsView, compareRows } = F.helpers;
const fs = require('fs'), os = require('os'), path = require('path');

const POST = 'POSTTEST', Q = 'ins=' + POST + '&type=4', QH = Q + '&history=histTest';
const storageOf = (page) => page.evaluate(() => chrome.storage.local.get(null));
const cooldownOf = async (page) => Number((await storageOf(page)).ig_contact_cooldown_until) || 0;
const copyExt = (src) => { const d = fs.mkdtempSync(path.join(os.tmpdir(), 'ext-live-')); fs.cpSync(src, d, { recursive: true }); return d; };
const baseWeb = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'fixtures', 'web-business-null.json'), 'utf8'));
// What the 15.3 build asked for (web_profile_info), in the shape of the anonymised real capture.
const webProfile = (pk, username, extra) => () => {
  const b = JSON.parse(JSON.stringify(baseWeb));
  Object.assign(b.data.user, { id: String(pk), username, full_name: 'Nome ' + username, profile_pic_url: PIXEL, profile_pic_url_hd: PIXEL }, extra || {});
  return { status: 200, body: b };
};
const rate429 = (retryAfter) => () => ({ status: 429, headers: { 'retry-after': String(retryAfter) }, body: { message: 'Please wait a few minutes before you try again.', status: 'fail' } });
const commentsOf = (users) => users.map((u) => ({ pk: u.pk, username: u.username }));
const waitUntil = async (page, ms) => { const left = ms - Date.now(); if (left > 0) await page.waitForTimeout(left + 700); };
// The tab a popup button really opens (chrome.tabs.create): the new page whose address is a dashboard page.
// Any other new tab (an instagram.com tab means the popup thought the user was logged out) is reported too.
async function dashboardTabFrom(ctx, action) {
  const before = new Set(ctx.pages());
  await action();
  const end = Date.now() + 20000;
  while (Date.now() < end) {
    const fresh = ctx.pages().filter((x) => !before.has(x));
    const hit = fresh.find((x) => /dashboard\.html/.test(x.url()));
    if (hit) return { tab: hit, others: fresh.filter((x) => x !== hit).map((x) => x.url()) };
    await new Promise((r) => setTimeout(r, 300));
  }
  return { tab: null, others: ctx.pages().filter((x) => !before.has(x)).map((x) => x.url()) };
}
// Polls the component itself: usable on builds that predate the 15.4 helpers (the harness snapshot needs them).
async function waitVm(page, predicate, { timeout = 120000, every = 1000 } = {}) {
  const end = Date.now() + timeout;
  while (Date.now() < end) {
    if (await predicate()) return true;
    await page.waitForTimeout(every);
  }
  return false;
}
const FAIL_TEXT = { login_required: 'Sessão precisa ser verificada', access_denied: 'Acesso negado pelo Instagram', temporary_error: 'Falha temporária na consulta' };

/* ------------------------------------------------------------------------------------------------
 * Errors: 403, network failure, invalid answers... never "no public email"; nothing saved as a result.
 * ---------------------------------------------------------------------------------------------- */
async function erros_http(extDir, label) {
  const scn = `${label}:erros_http`;
  const cases = [
    { key: 'http403_login', state: 'login_required', first: () => ({ status: 403, body: { message: 'login_required', status: 'fail' } }) },
    { key: 'http403_negado', state: 'access_denied', first: () => ({ status: 403, body: { message: 'Forbidden', status: 'fail' } }) },
    { key: 'rede', state: 'temporary_error', first: () => ({ abort: true }) },
    { key: 'json_invalido', state: 'temporary_error', first: () => ({ status: 200, contentType: 'application/json', body: 'not-json {' }) },
    { key: 'json_vazio', state: 'temporary_error', first: () => ({ status: 200, body: {} }) },
    { key: 'envelope_desconhecido', state: 'temporary_error', first: () => ({ status: 200, body: { status: 'ok', data: { foo: 1 } } }) },
    { key: 'html_login', state: 'login_required', first: () => ({ status: 200, contentType: 'text/html', body: '<!DOCTYPE html><html><body>Login • Instagram</body></html>' }) },
    { key: 'http503', state: 'temporary_error', first: () => ({ status: 503, body: { message: 'service unavailable', status: 'fail' } }) },
    { key: 'http400_espere', state: 'access_denied', first: () => ({ status: 400, body: { message: 'Please wait a few minutes before you try again.', status: 'fail' } }) },
  ];
  const users = cases.map((c, i) => ({ pk: 7300 + i, username: 'err_' + c.key }));
  const ok = (u, c) => mobileUser(u.pk, u.username, { account_type: 2, is_business: true, should_show_public_contacts: true, public_email: c.key + '@loja.com' });
  const profiles = Object.fromEntries(users.map((u, i) => [u.username, (n) => (n === 1 ? cases[i].first() : ok(u, cases[i]))]));
  const o = await launchOn(extDir, 'err', { comments: commentsOf(users), profiles });
  const { page, errors } = await openDash(o, Q);
  await H.clickButton(page, 'Iniciar');
  for (let i = 0; i < cases.length; i++) {
    const c = cases[i], tag = `${c.key}`;
    const want = i * 2 + 1; // requests so far: every earlier profile took 2 (failure + retry), this one has had 1
    await H.waitFor(page, (x) => profileReqs(o.log).length >= want && x.isPaused && !x.detailCycle, { timeout: 120000, every: 1000 });
    await page.waitForTimeout(1500);
    const rows = await rowsView(page), row = rows[i], saved = await storageOf(page);
    const stored = (saved.extract_list_histTest || []).find((r) => r.userName === users[i].username) || {};
    const cache = saved.ig_contact_profile_cache_v154 || {};
    check(scn, `${tag}: a falha NÃO vira "sem e-mail" (estado ${c.state}, linha continua pendente)`,
      row.state === c.state && row.detailLoaded === false && !/^Perfil não disponibiliza/.test(row.text) && row.text.startsWith(FAIL_TEXT[c.state]), row);
    check(scn, `${tag}: nada foi salvo como resultado (linha salva pendente, perfil fora do cache)`, stored.detailLoaded === false && !stored.email && !cache[String(users[i].pk)], { stored: stored.detailLoaded, cached: !!cache[String(users[i].pk)] });
    const reqsPaused = profileReqs(o.log).length;
    await page.waitForTimeout(12000);
    check(scn, `${tag}: pausou e não repetiu sozinho (12 s)`, profileReqs(o.log).length === reqsPaused && (await vmEval(page, 'vm.isPaused')) === true, { before: reqsPaused, after: profileReqs(o.log).length });
    const csv = await uiExport(page, 'all', 'csv');
    const line = csv.rows.find((r) => r['User Name'] === users[i].username) || {};
    check(scn, `${tag}: a exportação mostra a falha, não "sem e-mail"`, line['E-mail comercial'] === '' && line['Status do e-mail'].startsWith(FAIL_TEXT[c.state]) && !/^Perfil não disponibiliza/.test(line['Status do e-mail']), line['Status do e-mail']);
    await H.clickButton(page, 'Continue');
  }
  const done = await H.waitFor(page, (x) => x.isComplete && x.rows.length === cases.length && x.rows.every((r) => r.detailLoaded), { timeout: 180000, every: 2000 });
  const finalRows = await rowsView(page);
  check(scn, 'depois de continuar, cada perfil que falhou é consultado de novo e entrega o e-mail (2 consultas por perfil, 18 no total)',
    done.isComplete && profileReqs(o.log).length === cases.length * 2 && finalRows.every((r, i) => r.email === cases[i].key + '@loja.com' && r.state === 'email_found'), { reqs: profileReqs(o.log).length, rows: finalRows.map((r) => [r.user, r.state]) });
  const evidence = (await storageOf(page)).ig_commercial_contact_evidence_v14 || [];
  check(scn, 'o registro técnico guardou cada falha com HTTP e estado, sem cookie nem token', evidence.some((e) => e.http === 403) && evidence.some((e) => e.http === 503) && !/csrf|cookie|sessionid/i.test(JSON.stringify(evidence)), evidence.slice(0, 2));
  check(scn, 'nenhum erro de script', errors.length === 0, errors.slice(0, 3));
  await o.ctx.close();
}

/* ------------------------------------------------------------------------------------------------
 * 429 on every query: the collection goes on without validation; Retry-After is honoured; nothing is circumvented.
 * ---------------------------------------------------------------------------------------------- */
async function todos_429(extDir, label) {
  const scn = `${label}:todos_429`;
  const users = [0, 1, 2, 3].map((i) => ({ pk: 7400 + i, username: 'q429_' + i }));
  const o = await launchOn(extDir, 'q429', { comments: commentsOf(users), profiles: Object.fromEntries(users.map((u) => [u.username, rate429(12)])) });
  const { page, errors } = await openDash(o, Q);
  await H.clickButton(page, 'Iniciar');
  await H.waitFor(page, (x) => profileReqs(o.log).length >= 1 && x.isPaused && !x.detailCycle, { timeout: 90000, every: 500 });
  await page.waitForTimeout(1500);
  const first = profileReqs(o.log)[0];
  let until = await cooldownOf(page);
  check(scn, '1º 429: pausa salva respeitando o Retry-After de 12 s (não 60 min)', until - first.t >= 11000 && until - first.t <= 17000, { retryAfter: 12, saved: until - first.t });
  check(scn, '1º 429: o intervalo adaptativo já dobrou (10 s -> 20 s) para quando a pausa acabar', ((await storageOf(page)).ig_contact_pacing || {}).spacing === 20000, (await storageOf(page)).ig_contact_pacing);
  // The 429 notice is the original bottom-right overlay (kept as it was): in a small window it can sit over Continue/Export.
  // What must hold: it has a close button, and closing it leaves no control covered.
  const covered429 = await H.coveredControls(page);
  await page.locator('.notification button.delete').first().click();
  await page.waitForTimeout(600);
  const coveredAfterClose = await H.coveredControls(page);
  check(scn, 'o aviso do 429 (sobreposição original; em janela pequena pode ficar sobre Continue/Exportar) fecha pelo × e depois nenhum botão fica coberto',
    (await page.locator('.notification').count()) === 0 && coveredAfterClose.length === 0, { coveredBefore: covered429.map((c) => c.control), coveredAfterClose });
  await assertPauseHolds(scn, 'durante o Retry-After', page, o.log, 3000);
  await page.waitForTimeout(12000);
  check(scn, 'sem repetição automática: 1 consulta só, mesmo depois do fim da pausa', profileReqs(o.log).length === 1, profileReqs(o.log).length);
  const rows1 = await rowsView(page);
  check(scn, 'as linhas continuam pendentes e nenhuma vira "sem e-mail"', rows1.every((r) => !r.detailLoaded && r.state !== 'no_public_email'), rows1.map((r) => [r.user, r.state]));
  // pause over: the user presses Continue; Instagram still refuses
  await waitUntil(page, until);
  await H.clickButton(page, 'Continue');
  await H.waitFor(page, (x) => profileReqs(o.log).length >= 2 && x.isPaused && !x.detailCycle, { timeout: 90000, every: 500 });
  await page.waitForTimeout(2500);
  until = await cooldownOf(page);
  const s = await H.snapshot(page);
  const pacing = (await storageOf(page)).ig_contact_pacing || {};
  check(scn, '2ª tentativa (1 clique): exatamente 1 consulta, 429 de novo, nova pausa salva', profileReqs(o.log).length === 2 && until > Date.now() - 5000, { reqs: profileReqs(o.log).length, until: until - Date.now() });
  check(scn, 'o intervalo adaptativo dobrou de novo (20 s -> 40 s) e o aviso de 2 recusas seguidas apareceu', pacing.spacing === 40000 && s.notifications.concat(s.toasts).some((t) => /Diagnóstico automático: 2 recusas seguidas/.test(t)), { pacing, notes: s.notifications.length });
  check(scn, 'sem validação real: o painel diz que ainda não há resposta real e o diagnóstico diz "NÃO comprovado"',
    /Ainda não há resposta real com contato comercial público/.test(s.bodyText) && /Ainda não há resposta real com telefone público/.test(s.bodyText)
    && /Contato comercial público em resposta real: NÃO comprovado/.test(await vmEval(page, 'vm.contactDiagnosticText')), null);
  const csv = await uiExport(page, 'all', 'csv');
  check(scn, 'exportação: linhas com 429/aguardando — nenhuma como "sem e-mail"', csv.rows.length === 4 && csv.rows.every((r) => r['E-mail comercial'] === '' && !/^Perfil não disponibiliza/.test(r['Status do e-mail'])), csv.rows.map((r) => r['Status do e-mail']));
  await assertPauseHolds(scn, 'depois do 2º 429', page, o.log, 3000);
  const after = profileReqs(o.log).length;
  await page.waitForTimeout(20000);
  check(scn, 'nada sai sozinho depois do 2º 429 (20 s)', profileReqs(o.log).length === after, { after, now: profileReqs(o.log).length });
  const ev = (await storageOf(page)).ig_commercial_contact_evidence_v14 || [];
  check(scn, 'registro técnico: 2 respostas HTTP 429 com Retry-After=12 e pausa salva', ev.filter((e) => e.http === 429 && e.retryAfter === '12' && e.cooldownSaved === true).length === 2, ev.map((e) => [e.http, e.retryAfter]));
  check(scn, 'nenhum erro de script', errors.length === 0, errors.slice(0, 3));
  await o.ctx.close();
}

/* ------------------------------------------------------------------------------------------------
 * De-duplication: the same commenter on several pages, and again in a second extraction.
 * ---------------------------------------------------------------------------------------------- */
async function dedup(extDir, label) {
  const scn = `${label}:dedup`;
  const R = roster(7700, 'dd'), U = R.users.slice(0, 5);
  const by = (i) => ({ pk: U[i].pk, username: U[i].username });
  const comments = [0, 1, 0, 2, 1, 0, 3, 4, 0].map(by); // A B A C B A D E A, 4 per page
  const o = await launchOn(extDir, 'dd', { comments, commentPageSize: 4, profiles: Object.fromEntries(U.map((u) => [u.username, () => R.info[u.pk]()])) });
  const { page, errors } = await openDash(o, Q);
  await H.clickButton(page, 'Iniciar');
  const s1 = await H.waitFor(page, (x) => x.isComplete && x.rows.length === 5 && x.rows.every((r) => r.detailLoaded), { timeout: 200000, every: 2000 });
  const pages1 = o.log.filter((e) => e.kind === 'comments').length;
  check(scn, '9 comentários de 5 pessoas em 3 páginas: 5 linhas e 1 consulta por pessoa', s1.rows.length === 5 && profileReqs(o.log).length === 5 && new Set(profileReqs(o.log).map((e) => e.pk)).size === 5 && pages1 >= 3, { rows: s1.rows.length, reqs: profileReqs(o.log).length, pages: pages1 });
  compareRows(scn, '1ª extração', await rowsView(page), Object.fromEntries(U.map((u, i) => [u.username, R.expected[u.username]])));
  // a second extraction of the same post in the same browser: answers come from the saved cache
  await page.evaluate(() => chrome.storage.local.remove(['extract_list_histTest', 'extract_queue_histTest']));
  await gotoRetry(page, `chrome-extension://${o.id}/popup.html`);
  await gotoRetry(page, `chrome-extension://${o.id}/dashboard.html#/?${Q}`);
  await page.reload();
  await page.waitForTimeout(3000);
  await page.evaluate(() => chrome.storage.local.set({ intervals: [10, 10] }));
  const t0 = Date.now();
  await H.clickButton(page, 'Iniciar');
  const s2 = await H.waitFor(page, (x) => x.isComplete && x.rows.length === 5 && x.rows.every((r) => r.detailLoaded), { timeout: 120000, every: 1000 });
  check(scn, '2ª extração do mesmo post: a lista é relida, mas as 5 respostas vêm do cache (zero consultas novas)', s2.isComplete && profileReqs(o.log).length === 5 && o.log.filter((e) => e.kind === 'comments').length > pages1, { reqs: profileReqs(o.log).length });
  // The list itself is read page by page (15 s apart); only the profile checks are skipped, so 5 x 10 s of spacing never appears.
  check(scn, '2ª extração sem esperar o intervalo por perfil (respostas do cache): só a leitura da lista toma tempo', Date.now() - t0 < 75000, Date.now() - t0);
  compareRows(scn, '2ª extração (do cache)', await rowsView(page), Object.fromEntries(U.map((u) => [u.username, R.expected[u.username]])));
  check(scn, 'nenhum erro de script', errors.length === 0, errors.slice(0, 3));
  await o.ctx.close();
}

/* ------------------------------------------------------------------------------------------------
 * Close the dashboard, come back through the popup history: queue, cursor and answers are kept.
 * ---------------------------------------------------------------------------------------------- */
async function fechar_reabrir(extDir, label) {
  const scn = `${label}:fechar_reabrir`;
  const R = roster(7500, 'fr'), U = R.users.slice(0, 6), want = Object.fromEntries(U.map((u) => [u.username, R.expected[u.username]]));
  const scenario = { comments: commentsOf(U), profiles: Object.fromEntries(U.map((u) => [u.username, () => R.info[u.pk]()])) };
  const o = await launchOn(extDir, 'fr', scenario);
  const first = await openDash(o, Q);
  await H.clickButton(first.page, 'Iniciar');
  await H.waitFor(first.page, (x) => x.rows.filter((r) => r.detailLoaded).length >= 3, { timeout: 150000, every: 1000 });
  await H.clickButton(first.page, 'Pause');
  await H.waitFor(first.page, (x) => x.isPaused && !x.detailCycle, { timeout: 60000, every: 500 });
  await first.page.waitForTimeout(1500);
  const answered = (await rowsView(first.page)).filter((r) => r.detailLoaded).map((r) => r.user);
  const reqs1 = profileReqs(o.log).map((e) => String(e.pk)), pages1 = o.log.filter((e) => e.kind === 'comments').length;
  await first.page.close(); // the dashboard is closed in the middle of the queue
  scenario.historyList = [{ id: 'histTest', extractionType: 'comment', extractionData: POST, count: 1, scrapedCount: 6, itemsCount: 6, updatedAt: '2026-10-06T12:00:00.000Z', cursor: '' }];
  scenario.resumeHistory = true;
  const popup = await openPopupHistory(o.ctx, o.id);
  const part = await popupExport(popup, 'all', 'csv');
  check(scn, `popup com o dashboard fechado: a lista mostra a extração e exporta os ${answered.length} perfis já consultados e os 6 comentaristas salvos`,
    part.rows.length === 6 && part.rows.filter((r) => r['E-mail comercial'] || /^Perfil não disponibiliza/.test(r['Status do e-mail'])).length === answered.length
    && part.rows.filter((r) => r['Status do e-mail'] === 'Aguardando consulta').length === 6 - answered.length, { rows: part.rows.length, answered: answered.length });
  const got = await dashboardTabFrom(o.ctx, () => popup.locator('.history-list .i-continue').first().click());
  const second = got.tab;
  check(scn, 'o botão Continue do popup abre uma única aba, no dashboard do mesmo histórico (history=histTest, type=4)', !!second && got.others.length === 0 && /dashboard\.html#\/\?history=histTest&ins=POSTTEST&type=4$/.test(second.url()), { tab: second && second.url(), others: got.others });
  if (!second) throw new Error('o botão Continue não abriu o dashboard');
  const errors = [];
  second.on('pageerror', (e) => errors.push(String(e)));
  await second.waitForTimeout(3500);
  await second.evaluate(() => chrome.storage.local.set({ intervals: [10, 10] }));
  const url = second.url();
  const idle = await H.snapshot(second);
  check(scn, 'reaberto: nada é consultado antes do clique em Iniciar', idle.isPaused && profileReqs(o.log).length === reqs1.length && (await vmEval(second, 'vm.commercialStartRequired')) === true, { reqs: profileReqs(o.log).length });
  await H.clickButton(second, 'Iniciar');
  const done = await H.waitFor(second, (x) => x.isComplete && x.rows.length === 6 && x.rows.every((r) => r.detailLoaded), { timeout: 240000, every: 2000 });
  const all = profileReqs(o.log).map((e) => String(e.pk));
  check(scn, 'retomada: cada um dos 6 perfis foi consultado exatamente 1 vez no total (os já respondidos não voltam)', done.isComplete && all.length === 6 && new Set(all).size === 6, { before: reqs1.length, total: all.length });
  check(scn, 'retomada sem reler a lista de comentários (cursor da fila salvo)', o.log.filter((e) => e.kind === 'comments').length === pages1, { pagesBefore: pages1, pagesNow: o.log.filter((e) => e.kind === 'comments').length });
  const sessionWant = Object.fromEntries(U.filter((u) => !answered.includes(u.username)).map((u) => [u.username, want[u.username]]));
  compareRows(scn, 'tabela do dashboard reaberto: as linhas consultadas nesta sessão (' + Object.keys(sessionWant).length + ')', await rowsView(second), sessionWant);
  const csv = await uiExport(second, 'all', 'csv');
  check(scn, 'o botão "export all" mostra o total acumulado (6), não só as da sessão', csv.count === 6, csv.count);
  compareRows(scn, 'exportação do dashboard reaberto: as 6 linhas da tarefa (as de antes + as desta sessão)', csv.rows, want);
  const store = await storageOf(second);
  check(scn, 'fila e histórico salvos: 6 linhas, cursor da fila gravado', (store.extract_list_histTest || []).length === 6 && store.extract_queue_histTest && store.extract_queue_histTest.v === 154, { rows: (store.extract_list_histTest || []).length, queue: store.extract_queue_histTest });
  const popup2 = await openPopupHistory(o.ctx, o.id);
  compareRows(scn, 'popup depois de concluir', (await popupExport(popup2, 'all', 'csv')).rows, want);
  check(scn, 'nenhum erro de script', errors.length === 0, errors.slice(0, 3));
  await o.ctx.close();
}

/* ------------------------------------------------------------------------------------------------
 * A 429 pause, then: close the dashboard and reopen; the Reload button; copying new files over the
 * installed folder (15.3 or 15.4 -> this build). The pause must still gate every path to Instagram.
 * ---------------------------------------------------------------------------------------------- */
async function recarregar_extensao(extDir, label) {
  const scn = `${label}:recarregar_extensao`;
  const R = roster(7600, 'rl'), U = R.users.slice(0, 6), want = Object.fromEntries(U.map((u) => [u.username, R.expected[u.username]]));
  const profiles = Object.fromEntries(U.map((u, i) => [u.username, (n) => (i === 2 && n === 1 ? rate429(40)() : R.info[u.pk]())]));
  const scenario = { comments: commentsOf(U), profiles };
  const live = copyExt(extDir), udd = fs.mkdtempSync(path.join(os.tmpdir(), 'pw-rl-'));
  const o = await launchOn(live, 'rl', scenario, { userDataDir: udd });
  const s1 = await openDash(o, Q);
  await H.clickButton(s1.page, 'Iniciar');
  await H.waitFor(s1.page, (x) => profileReqs(o.log).length >= 3 && x.isPaused && !x.detailCycle, { timeout: 150000, every: 1000 });
  await s1.page.waitForTimeout(1500);
  const until = await cooldownOf(s1.page), reqsBefore = profileReqs(o.log).length;
  check(scn, '429 no 3º perfil: pausa salva com o Retry-After de 40 s', reqsBefore === 3 && until > Date.now() + 5000, { reqs: reqsBefore, left: until - Date.now() });
  await assertPauseHolds(scn, 'mesma página, logo após o 429', s1.page, o.log, 2500);
  await s1.page.close();
  scenario.resumeHistory = true;
  // 1) reopen the dashboard
  const s2 = await openDash(o, QH);
  check(scn, 'dashboard reaberto: pausa salva idêntica e Iniciar desabilitado', (await cooldownOf(s2.page)) === until && (await L.H.snapshot(s2.page)).retryAfterUntil === until, { until });
  await assertPauseHolds(scn, 'dashboard fechado e reaberto', s2.page, o.log, 2500);
  await s2.page.close();
  // 2) the extension's Reload button
  const reloaded = await reloadExtension(o.ctx, o.id);
  const s3 = await openDash(o, QH);
  check(scn, 'botão Recarregar: pausa salva idêntica (' + reloaded + ')', (await cooldownOf(s3.page)) === until && until > Date.now(), { reloaded, until });
  await assertPauseHolds(scn, 'depois de Recarregar a extensão', s3.page, o.log, 2500);
  check(scn, 'a pausa ainda estava ativa durante as verificações', until > Date.now(), until - Date.now());
  // 3) the pause ends: Iniciar continues exactly where it stopped
  await waitUntil(s3.page, until);
  await H.clickButton(s3.page, 'Iniciar');
  const done = await H.waitFor(s3.page, (x) => x.isComplete && x.rows.length === 6 && x.rows.every((r) => r.detailLoaded), { timeout: 240000, every: 2000 });
  const pks = profileReqs(o.log).map((e) => String(e.pk));
  check(scn, 'depois da pausa: 7 consultas no total (os 2 respondidos não voltam; o perfil do 429 é refeito 1 vez)', done.isComplete && pks.length === 7 && pks.filter((p) => p === String(U[2].pk)).length === 2 && new Set(pks).size === 6, pks);
  compareRows(scn, 'tabela da sessão retomada (u2..u5)', await rowsView(s3.page), Object.fromEntries(U.slice(2).map((u) => [u.username, want[u.username]])));
  const csvAll = await uiExport(s3.page, 'all', 'csv');
  compareRows(scn, 'exportação depois de retomar: as 6 linhas da tarefa', csvAll.rows, want);
  check(scn, 'nenhum erro de script', s1.errors.concat(s2.errors, s3.errors).length === 0, s1.errors.concat(s2.errors, s3.errors).slice(0, 3));
  await o.ctx.close();
}

async function atualizacao(extDir, label, from) {
  const scn = `${label}:atualizacao_${from}`, old = from === '153' ? process.env.OLD153_DIR : process.env.OLD154_DIR;
  if (!old) throw new Error('defina OLD153_DIR / OLD154_DIR (a versão instalada antes da atualização)');
  const R = roster(7800, 'up'), U = R.users.slice(0, 6), want = Object.fromEntries(U.map((u) => [u.username, R.expected[u.username]]));
  const live = copyExt(old), udd = fs.mkdtempSync(path.join(os.tmpdir(), 'pw-up-' + from + '-'));
  const legacy = from === '153';
  // u0 answers with an email, u1 without, u2 is refused (429, 75 s), u3..u5 are still waiting
  const profiles153 = {
    [U[0].username]: webProfile(U[0].pk, U[0].username, { business_email: 'antigo0@loja.com', is_business_account: true }),
    [U[1].username]: webProfile(U[1].pk, U[1].username),
    [U[2].username]: (n) => (n === 1 ? rate429(75)() : webProfile(U[2].pk, U[2].username)()),
  };
  const profiles154 = {
    [U[0].username]: () => mobileUser(U[0].pk, U[0].username, { account_type: 2, is_business: true, should_show_public_contacts: true, public_email: 'antigo0@loja.com' }),
    [U[1].username]: () => mobileUser(U[1].pk, U[1].username, { account_type: 2, is_business: true, should_show_public_contacts: true, public_email: '' }),
    [U[2].username]: (n) => (n === 1 ? rate429(75)() : R.info[U[2].pk]()),
  };
  const scenario = { comments: commentsOf(U), legacyWeb: legacy, profiles: Object.assign({}, legacy ? profiles153 : profiles154) };
  for (const u of U.slice(3)) scenario.profiles[u.username] = legacy ? (() => ({ status: 500, body: { status: 'fail' } })) : (() => R.info[u.pk]());
  let o = await launchOn(live, 'up' + from, scenario, { userDataDir: udd });
  const s1 = await openDash(o, Q);
  const v1 = await vmEval(s1.page, 'vm.version');
  check(scn, `versão instalada antes da atualização: ${from === '153' ? 'PATCHED 15.3' : 'PATCHED 15.4'}`, v1.indexOf(from === '153' ? 'PATCHED 15.3' : 'PATCHED 15.4') >= 0, v1);
  await H.clickButton(s1.page, 'Iniciar');
  await waitVm(s1.page, async () => profileReqs(o.log).length >= 3 && (await vmEval(s1.page, 'vm.isPaused && !vm.detailCycle')), { timeout: 200000 });
  await s1.page.waitForTimeout(2000);
  const until = await cooldownOf(s1.page), store1 = await storageOf(s1.page);
  const oldRows = (store1.extract_list_histTest || []).map((r) => [r.userName, !!r.email, !!r.detailLoaded]);
  const oldReqs = profileReqs(o.log).length, oldPages = o.log.filter((e) => e.kind === 'comments').length;
  check(scn, `estado criado pela ${from === '153' ? '15.3' : '15.4'}: 3 consultas, 429 no 3º, pausa salva, histórico local com ${oldRows.length} linhas`, oldReqs === 3 && until > Date.now() + 30000 && oldRows.length >= 3, { reqs: oldReqs, left: until - Date.now(), rows: oldRows });
  check(scn, 'a versão antiga usava a rota ' + (legacy ? 'web_profile_info (por @nome)' : '/users/{id}/info/ (por id)'), profileReqs(o.log).every((e) => (legacy ? !e.pk : !!e.pk)), profileReqs(o.log).map((e) => [e.username, e.pk]));
  await s1.page.close();
  scenario.carry = { lastHistory: o.state.lastHistory, historyUpdates: o.state.historyUpdates };
  // The update the way the user does it: copy the new files over the installed folder.
  fs.cpSync(extDir, live, { recursive: true, force: true });
  let reloaded = 'relançado';
  if (legacy) reloaded = await reloadExtension(o.ctx, o.id); // 15.3 -> 15.5: the Reload button
  else { await o.ctx.close(); o = await launchOn(live, 'up' + from + 'b', scenario, { userDataDir: udd }); } // 15.4 -> 15.5: Chrome closed and opened again
  scenario.legacyWeb = false; scenario.resumeHistory = true;
  scenario.profiles = Object.fromEntries(U.map((u) => [u.username, () => R.info[u.pk]()]));
  const s2 = await openDash(o, QH);
  const v2 = await vmEval(s2.page, 'vm.version');
  check(scn, `depois da atualização (${reloaded}): a extensão mostra PATCHED 15.5 e mantém o mesmo ID`, /PATCHED 15\.5/.test(v2) && o.id === 'icceojeancmncflpknhmfbfaleindgmi', { v2, id: o.id });
  check(scn, 'pausa salva pela versão antiga preservada, ainda ativa', (await cooldownOf(s2.page)) === until && until > Date.now(), { left: until - Date.now() });
  await assertPauseHolds(scn, `depois de atualizar ${from === '153' ? '15.3' : '15.4'} -> 15.5`, s2.page, o.log, 3000);
  check(scn, 'a pausa ainda estava ativa durante as verificações', until > Date.now(), until - Date.now());
  scenario.historyList = [{ id: 'histTest', extractionType: 'comment', extractionData: POST, count: 1, scrapedCount: 6, itemsCount: 6, updatedAt: '2026-10-06T12:00:00.000Z', cursor: '' }];
  const popup = await openPopupHistory(o.ctx, o.id);
  const part = await popupExport(popup, 'all', 'csv');
  check(scn, 'o histórico criado pela versão antiga continua no popup e exporta; o e-mail da linha antiga é mantido', part.rows.length >= 3 && part.rows.some((r) => r['E-mail comercial'] === 'antigo0@loja.com'), part.rows.map((r) => [r['User Name'], r['E-mail comercial']]));
  const infoBefore = profileReqs(o.log).length;
  await waitUntil(s2.page, until);
  await H.clickButton(s2.page, 'Iniciar');
  const done = await H.waitFor(s2.page, (x) => x.isComplete && x.rows.length === 6 && x.rows.every((r) => r.detailLoaded), { timeout: 300000, every: 2000 });
  const after = profileReqs(o.log).slice(infoBefore).map((e) => String(e.pk));
  // 15.3 left no email for u1 from the web route (needs the /info/ answer once); 15.4 had already answered u0 and u1 by id
  const expectedAfter = (legacy ? U.slice(1) : U.slice(2)).map((u) => String(u.pk));
  check(scn, `depois da pausa: ${expectedAfter.length} consultas /users/{id}/info/, cada uma 1 vez; ${legacy ? 'só o perfil com e-mail é mantido' : 'os 2 já respondidos por id não voltam'}`,
    done.isComplete && JSON.stringify(after.slice().sort()) === JSON.stringify(expectedAfter.slice().sort()), { after, expectedAfter });
  check(scn, 'nenhuma consulta a web_profile_info depois da atualização', !o.log.some((e) => e.kind === 'FORBIDDEN_web_profile_info'), null);
  const rows = await rowsView(s2.page);
  // u0 keeps the email the old version found; u1 is re-asked by the 15.3 route change but kept as answered by 15.4
  const final = Object.assign({}, want, { [U[0].username]: { email: 'antigo0@loja.com', phone: '', status: 'E-mail comercial encontrado' } });
  if (!legacy) final[U[1].username] = { email: '', phone: '', status: L.NO_EMAIL + ' · campo vazio' };
  const sessionUsers = legacy ? U.slice(1) : U.slice(2);
  compareRows(scn, 'tabela da sessão retomada (' + sessionUsers.length + ' perfis consultados pela rota nova)', rows, Object.fromEntries(sessionUsers.map((u) => [u.username, final[u.username]])));
  const csvAll = await uiExport(s2.page, 'all', 'csv'), xAll = await uiExport(s2.page, 'all', 'xlsx');
  compareRows(scn, 'CSV depois da atualização: as 6 linhas (a que a versão antiga respondeu com e-mail é mantida; o resto, pela rota nova)', csvAll.rows, final);
  compareRows(scn, 'XLSX depois da atualização: as 6 linhas', xAll.rows, final);
  if (!legacy) check(scn, 'sem reler a lista de comentários (cursor da fila da 15.4 reaproveitado)', o.log.filter((e) => e.kind === 'comments').length === 0, o.log.filter((e) => e.kind === 'comments').length);
  check(scn, 'nenhum erro de script', s2.errors.length === 0, s2.errors.slice(0, 3));
  await o.ctx.close();
}

/* ------------------------------------------------------------------------------------------------
 * Starting the same extraction again without the history link: "Last time this task was extracted to N,
 * continue?" -> Continue keeps the progress, Restart begins a new one. Neither repeats an answered profile.
 * ---------------------------------------------------------------------------------------------- */
async function dialogo_continuar_recomecar(extDir, label) {
  const scn = `${label}:dialogo_continuar_recomecar`;
  const R = roster(7900, 'dl'), U = R.users.slice(0, 6), want = Object.fromEntries(U.map((u) => [u.username, R.expected[u.username]]));
  const scenario = { comments: commentsOf(U), profiles: Object.fromEntries(U.map((u) => [u.username, () => R.info[u.pk]()])) };
  const o = await launchOn(extDir, 'dlg', scenario);
  const s1 = await openDash(o, Q);
  await H.clickButton(s1.page, 'Iniciar');
  await H.waitFor(s1.page, (x) => x.rows.filter((r) => r.detailLoaded).length >= 3, { timeout: 150000, every: 1000 });
  await H.clickButton(s1.page, 'Pause');
  await H.waitFor(s1.page, (x) => x.isPaused && !x.detailCycle, { timeout: 60000, every: 500 });
  await s1.page.waitForTimeout(1500);
  const done1 = (await rowsView(s1.page)).filter((r) => r.detailLoaded).length, reqs1 = profileReqs(o.log).length;
  await s1.page.close();
  // the task is opened again from the popup form (no history in the link): the server knows an earlier run
  scenario.resumeHistory = true;
  const s2 = await openDash(o, Q);
  await H.clickButton(s2.page, 'Iniciar');
  await s2.page.waitForSelector('.modal-card-foot, .dialog', { timeout: 30000 });
  const text = await s2.page.evaluate(() => (document.querySelector('.modal-card, .dialog') || {}).innerText || '');
  check(scn, 'a pergunta aparece com o total já extraído e os botões Continue e Restart', new RegExp('Last time this task was extract to\\s*' + done1 + '\\s*,\\s*continue\\?').test(text.replace(/\n/g, ' ')) && /Continue/.test(text) && /Restart/.test(text), text.slice(0, 160));
  await s2.page.locator('.modal-card-foot button', { hasText: 'Continue' }).first().click();
  const done2 = await H.waitFor(s2.page, (x) => x.isComplete && x.rows.length === 6 && x.rows.every((r) => r.detailLoaded), { timeout: 240000, every: 2000 });
  const pks = profileReqs(o.log).map((e) => String(e.pk));
  check(scn, 'Continue: termina sem repetir nenhum perfil já respondido (6 consultas no total)', done2.isComplete && pks.length === 6 && new Set(pks).size === 6, { reqs1, total: pks.length });
  compareRows(scn, 'tabela depois de Continue: as linhas consultadas nesta sessão (' + (6 - done1) + ')', await rowsView(s2.page), Object.fromEntries(U.slice(done1).map((u) => [u.username, want[u.username]])));
  compareRows(scn, 'exportação depois de Continue: as 6 linhas da tarefa', (await uiExport(s2.page, 'all', 'csv')).rows, want);
  await s2.page.close();
  // run it a third time and choose Restart: everything is listed again, but the saved answers are reused
  const pagesBefore = o.log.filter((e) => e.kind === 'comments').length;
  const s3 = await openDash(o, Q);
  await H.clickButton(s3.page, 'Iniciar');
  await s3.page.waitForSelector('.modal-card-foot, .dialog', { timeout: 30000 });
  await s3.page.locator('.modal-card-foot button', { hasText: 'Restart' }).first().click();
  const done3 = await H.waitFor(s3.page, (x) => x.isComplete && x.rows.length === 6 && x.rows.every((r) => r.detailLoaded), { timeout: 240000, every: 2000 });
  check(scn, 'Restart: a lista é lida de novo, mas nenhum perfil é consultado outra vez (respostas do cache)', done3.isComplete && profileReqs(o.log).length === 6 && o.log.filter((e) => e.kind === 'comments').length > pagesBefore, { reqs: profileReqs(o.log).length });
  compareRows(scn, 'resultado depois de Restart', await rowsView(s3.page), want);
  check(scn, 'nenhum erro de script', s1.errors.concat(s2.errors, s3.errors).length === 0, s1.errors.concat(s2.errors, s3.errors).slice(0, 3));
  await o.ctx.close();
}

/* ------------------------------------------------------------------------------------------------
 * The popup's START EXTRACTING button, tab by tab: input checks and the dashboard link it opens.
 * ---------------------------------------------------------------------------------------------- */
async function popup_iniciar(extDir, label) {
  const scn = `${label}:popup_iniciar`;
  const o = await launchOn(extDir, 'pst', { comments: [], profiles: {} });
  const page = await o.ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  await gotoRetry(page, `chrome-extension://${o.id}/popup.html`);
  await page.waitForTimeout(2000);
  const tabs = [
    { name: 'Followers', type: 0, value: '@alvo_loja', ins: 'alvo_loja', bad: null },
    { name: 'Following', type: 1, value: 'alvo_loja', ins: 'alvo_loja', bad: null },
    { name: 'Hashtag', type: 2, value: '#modatestebr', ins: 'modatestebr', bad: null },
    { name: 'Likes', type: 3, value: 'https://www.instagram.com/p/CURT123abc/', ins: 'CURT123abc', bad: 'https://exemplo.com/nada' },
    { name: 'Comment', type: 4, value: 'https://www.instagram.com/p/COMM456def/', ins: 'COMM456def', bad: 'https://exemplo.com/nada' },
    { name: 'Location', type: 5, value: 'https://www.instagram.com/explore/locations/213385402/campinas/', ins: '213385402', bad: 'https://exemplo.com/nada' },
    { name: 'User List', type: 6, value: 'loja_a loja_b\nloja_a', ins: null, bad: null },
  ];
  for (const t of tabs) {
    await page.locator('.tabs a, .tabs li', { hasText: new RegExp('^\\s*' + t.name + '\\s*$') }).first().click();
    // The tab transition: until it ends the previous panel's input is still visible. Wait for the one input of this tab.
    const ph = { Followers: 'e.g. shopify', Following: 'e.g. shopify', Hashtag: 'e.g. realtor', Likes: 'e.g. https://www.instagram.com/p/', Comment: 'e.g. https://www.instagram.com/p/',
      Location: 'e.g. https://www.instagram.com/explore/locations/', 'User List': 'Please type or paste here' }[t.name];
    await page.waitForFunction((want) => { const v = Array.from(document.querySelectorAll('input, textarea')).filter((e) => e.offsetParent !== null); return v.length === 1 && v[0].placeholder.indexOf(want) === 0; }, ph, { timeout: 15000 });
    const input = page.locator('input:visible, textarea:visible').first();
    if (t.bad) {
      await input.fill(t.bad);
      await page.locator('button', { hasText: /start extracting/i }).first().click();
      await page.waitForTimeout(700);
      const snack = await page.evaluate(() => Array.from(document.querySelectorAll('.snackbar, .notices .toast, .snackbar-content, .text')).map((n) => n.innerText).join(' | '));
      check(scn, `${t.name}: link inválido não abre o dashboard e mostra o aviso`, /Invalid .* URL/i.test(snack), snack.slice(0, 120));
    }
    await input.fill(t.value);
    const got = await dashboardTabFrom(o.ctx, () => page.locator('button', { hasText: /start extracting/i }).first().click());
    const tab = got.tab;
    const why = tab ? null : await page.evaluate(() => ({ snack: Array.from(document.querySelectorAll('.snackbar, .notices *')).map((n) => n.innerText).filter(Boolean).slice(0, 3),
      state: (() => { for (const el of document.querySelectorAll('*')) { let vm = el.__vue__; while (vm) { if (vm.$data && 'insHashtag' in vm.$data) return { type: vm.extractionType, id: vm.insId, tag: vm.insHashtag, post: vm.insPostUrl, logged: vm.insLogged }; vm = vm.$parent; } } return null; })() }));
    check(scn, `${t.name}: START EXTRACTING abre uma única aba (nenhuma aba do instagram.com: o popup reconhece a sessão)`, !!tab && got.others.length === 0, { tab: tab && tab.url(), others: got.others, why });
    if (!tab) throw new Error('START EXTRACTING não abriu o dashboard em ' + t.name);
    const url = tab.url();
    await tab.waitForTimeout(1500);
    const route = await vmEval(tab, '({ type: vm.$route.query.type, ins: vm.$route.query.ins })');
    check(scn, `${t.name}: o dashboard abriu no modo ${t.type} com o alvo certo`, Number(route.type) === t.type && (t.ins ? route.ins === t.ins : /^userlist-2-\d{14}$/.test(route.ins)), route);
    const ok = t.ins ? new RegExp('dashboard\\.html#/\\?ins=' + t.ins + '&type=' + t.type + '$').test(url) : new RegExp('dashboard\\.html#/\\?ins=userlist-2-\\d{14}&type=6$').test(url);
    check(scn, `${t.name}: START EXTRACTING abre o dashboard do modo certo (type=${t.type})`, ok, url);
    if (t.type === 6) {
      // The popup saves the cleaned list under the key in the link; the dashboard takes it and hands it to the history item.
      await tab.waitForTimeout(3000);
      check(scn, 'User List: a lista de @perfis chega limpa e sem repetidos ao dashboard (histórico da tarefa) e a chave temporária é consumida',
        o.state.customUserList === 'loja_a,loja_b' && !(await page.evaluate((k) => chrome.storage.local.get(k), decodeURIComponent((url.match(/ins=([^&]+)/) || [])[1] || '')))[decodeURIComponent((url.match(/ins=([^&]+)/) || [])[1] || '')], o.state.customUserList);
    }
    await tab.close();
  }
  const blank = await page.evaluate(() => 1);
  check(scn, 'nenhum erro de script no popup', errors.length === 0, errors.slice(0, 3));
  await o.ctx.close();
}

/* ------------------------------------------------------------------------------------------------
 * The package itself: the folder extracted from the ZIP is loaded in Chromium like "Load unpacked".
 * Chrome's own extension record: identity, state, manifest and runtime errors, permissions.
 * ---------------------------------------------------------------------------------------------- */
async function pacote_carga(extDir, label) {
  const scn = `${label}:pacote_carga`;
  const man = JSON.parse(fs.readFileSync(path.join(extDir, 'manifest.json'), 'utf8'));
  const o = await launchOn(extDir, 'pkg', { comments: [], profiles: {} });
  const pop = await o.ctx.newPage(), dash = await o.ctx.newPage();
  const errors = [];
  for (const p of [pop, dash]) p.on('pageerror', (e) => errors.push(String(e)));
  await gotoRetry(pop, `chrome-extension://${o.id}/popup.html`);
  await gotoRetry(dash, `chrome-extension://${o.id}/dashboard.html#/?ins=POSTTEST&type=4`);
  await dash.waitForTimeout(3000);
  const ext = await o.ctx.newPage();
  await L.withTimeout(ext.goto('chrome://extensions/'), 10000);
  await L.withTimeout(ext.evaluate(() => chrome.developerPrivate.updateProfileConfiguration({ inDeveloperMode: true })), 5000);
  const all = await L.withTimeout(ext.evaluate(() => chrome.developerPrivate.getExtensionsInfo({ includeDisabled: true, includeTerminated: true })), 8000);
  const me = (Array.isArray(all) ? all : []).find((e) => e.id === o.id) || {};
  check(scn, 'a pasta extraída é carregada e fica ativa, com o ID esperado (derivado da chave do manifesto)', me.id === 'icceojeancmncflpknhmfbfaleindgmi' && me.state === 'ENABLED', { id: me.id, state: me.state });
  check(scn, 'Chrome lê o manifesto sem erros e a extensão não registra erros de execução ao abrir popup e dashboard', (me.manifestErrors || []).length === 0 && (me.runtimeErrors || []).length === 0 && errors.length === 0,
    { manifestErrors: me.manifestErrors, runtimeErrors: (me.runtimeErrors || []).map((e) => e.message).slice(0, 2), pageErrors: errors.slice(0, 2) });
  // Chrome reports version_name (when present) as the version it shows.
  check(scn, 'versão e nome do manifesto (' + man.version + ' / ' + man.version_name + ')', (me.version === man.version_name || me.version === man.version) && /PATCHED 15\.5/.test(man.version_name) && man.version === '2.5.1', { version: me.version, name: me.name });
  const perms = ((me.permissions || {}).simplePermissions || []).map((p) => p.message).join(' | ');
  check(scn, 'permissões do manifesto inalteradas (cookies, storage, identity, unlimitedStorage + hosts instagram.com e echobot.dev)',
    JSON.stringify(man.permissions) === JSON.stringify(['cookies', 'storage', 'identity', 'unlimitedStorage']) && JSON.stringify(man.host_permissions) === JSON.stringify(['https://*.instagram.com/*', '*://*.echobot.dev/*']), { permissions: man.permissions, hosts: man.host_permissions });
  const loaded = await pop.evaluate(() => ({ v: chrome.runtime.getManifest().version, n: chrome.runtime.getManifest().version_name }));
  check(scn, 'o popup em execução vê o mesmo manifesto que o arquivo', loaded.v === man.version && loaded.n === man.version_name, loaded);
  await o.ctx.close();
}

module.exports = { SCENARIOS: { erros_http, todos_429, dedup, fechar_reabrir, recarregar_extensao, dialogo_continuar_recomecar, popup_iniciar, pacote_carga,
  atualizacao_153: (e, l) => atualizacao(e, l, '153'), atualizacao_154: (e, l) => atualizacao(e, l, '154') } };
