/* Final end-to-end suite (PATCHED 15.5). Usage: node final.js <extDir> <label> <scenario[:arg]...>
 * Chromium loads the unpacked extension; the real dashboard and popup are driven by clicks.
 * Every Instagram response is a SIMULATED fixture (the shapes come from anonymised real captures);
 * any other host is blocked. Nothing here proves what Instagram really returns. */
const L = require('./lib');
const { H, PIXEL, check, results, csvObjects, mobileUser, roster, ROSTER, NO_EMAIL, gotoRetry, uiExport, openPopupHistory, popupExport,
  profileReqs, vmEval, assertPauseHolds } = L;
const fs = require('fs'), os = require('os'), path = require('path');

const HEADERS = ['User Id', 'User Name', 'Full Name', 'Followers Count', 'Following Count', 'Post Count', 'E-mail comercial', 'Status do e-mail', 'Public Phone',
  'City', 'Address', 'Is Private', 'Is Verified', 'Is Business', 'External Url', 'Biography', 'DJ Score', 'DJ Type', 'Hot Lead', 'Avatar Url', 'Profile Url'];
const POPUP_HEADERS = HEADERS.filter((h) => !/^DJ |^Hot Lead$/.test(h));
const followersTarget = (pk) => () => ({ status: 200, body: { status: 'ok', data: { user: { pk: String(pk), id: String(pk), username: 'alvo_loja',
  full_name: 'Alvo', profile_pic_url: PIXEL, follower_count: 3, following_count: 2, is_private: false } } } });
const webUser = (pk, username) => () => ({ status: 200, body: { data: { user: { pk: String(pk), id: String(pk), username, full_name: 'Nome ' + username, profile_pic_url: PIXEL } }, status: 'ok' } });
const settled = (s) => s.isComplete || (s.isPaused && !s.detailCycle);

async function launchOn(extDir, label, scenario, options) {
  const log = [];
  const { ctx, id, udd } = await H.launch(extDir, label, options);
  const state = await H.install(ctx, scenario, log);
  return { ctx, id, udd, log, state };
}
async function openDash(o, query, opts = {}) {
  const page = await o.ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  if (opts.seed) {
    await gotoRetry(page, `chrome-extension://${o.id}/popup.html`);
    await page.evaluate((s) => chrome.storage.local.set(s), opts.seed);
  }
  await gotoRetry(page, `chrome-extension://${o.id}/dashboard.html#/?${query}`);
  await page.waitForTimeout(2500);
  if (!opts.defaultPacing) await page.evaluate(() => chrome.storage.local.set({ intervals: [10, 10] }));
  return { page, errors };
}
const rowsView = (page) => vmEval(page, `vm.followList.map(r => ({ user: r.userName, id: r.userId, email: r.email, phone: r.phone, phoneSource: r.phoneSource || '',
  text: window.IGPublicContacts.emailStatusText(r), state: window.IGPublicContacts.contactState(r), detailLoaded: !!r.detailLoaded, failure: r.contactFailure || null }))`);

function compareRows(scn, tag, rows, expected) {
  const bad = [];
  const by = Object.fromEntries(rows.map((r) => [r.user || r['User Name'], r]));
  for (const [user, want] of Object.entries(expected)) {
    const got = by[user];
    if (!got) { bad.push([user, 'ausente']); continue; }
    const email = got.email !== undefined ? got.email : got['E-mail comercial'];
    const phone = got.phone !== undefined ? got.phone : got['Public Phone'];
    const text = got.text !== undefined ? got.text : got['Status do e-mail'];
    if (email !== want.email || phone !== want.phone || text !== want.status) bad.push([user, { email, phone, text }, want]);
  }
  check(scn, `${tag}: ${Object.keys(expected).length} perfis com e-mail, telefone e status iguais à verdade-de-solo`, bad.length === 0 && rows.length === Object.keys(expected).length, { rows: rows.length, bad: bad.slice(0, 3) });
}

/* ------------------------------------------------------------------------------------------------
 * Matrix: every mode, same ten profiles with known published contacts, down to the exported files.
 * ---------------------------------------------------------------------------------------------- */
const MODE = {
  seguidores: { type: 0, ins: () => 'alvo_loja', hist: 'followers', base: 8100, prefix: 'seg' },
  seguindo: { type: 1, ins: () => 'alvo_loja', hist: 'following', base: 8200, prefix: 'sgd' },
  hashtag: { type: 2, ins: () => 'modatestebr', hist: 'hashtag', base: 8300, prefix: 'tag' },
  curtidas: { type: 3, ins: () => 'POSTCURTIDAS', hist: 'likes', base: 8400, prefix: 'cur' },
  comment: { type: 4, ins: () => 'POSTTEST', hist: 'comment', base: 8500, prefix: 'com' },
  local: { type: 5, ins: () => '213385402', hist: 'location', base: 8600, prefix: 'loc' },
  lista: { type: 6, ins: () => 'userlist-2-20261006000000', hist: 'userlist', base: 8700, prefix: 'lst' },
};
function modeScenario(mode, R) {
  const asUser = (x) => ({ pk: String(x.pk), username: x.username, full_name: 'Nome ' + x.username, profile_pic_url: PIXEL });
  const plain = R.users.map((x) => ({ pk: x.pk, username: x.username }));
  switch (mode) {
    case 'seguidores': return { profiles: { alvo_loja: followersTarget(9000) }, info: R.info,
      friendships: () => ({ status: 200, body: { status: 'ok', users: R.users.map(asUser), next_max_id: null, big_list: false } }) };
    case 'seguindo': return { profiles: { alvo_loja: followersTarget(9000) }, info: R.info,
      friendships: (kind) => ({ status: 200, body: { status: 'ok', users: kind === 'following' ? R.users.map(asUser) : [], next_max_id: null, big_list: false } }) };
    case 'hashtag': case 'curtidas': case 'local': return { listUsers: plain, info: R.info };
    case 'comment': return { comments: plain, profiles: Object.fromEntries(R.users.map((u) => [u.username, () => R.info[u.pk]()])) };
    case 'lista': return { profiles: Object.fromEntries(R.users.map((u) => [u.username, webUser(u.pk, u.username)])), info: R.info };
    default: throw new Error('modo ' + mode);
  }
}
async function matriz(extDir, label, mode) {
  const scn = `${label}:matriz_${mode}`, M = MODE[mode], R = roster(M.base, M.prefix);
  const scenario = modeScenario(mode, R);
  const seed = { intervals: [10, 10] };
  if (mode === 'lista') seed[M.ins()] = R.users.map((u) => u.username).join(',');
  const o = await launchOn(extDir, 'mx-' + mode, scenario);
  const { page, errors } = await openDash(o, `ins=${encodeURIComponent(M.ins())}&type=${M.type}`, { seed });
  if (mode === 'comment') await H.clickButton(page, 'Iniciar');
  const n = R.users.length;
  const s = await H.waitFor(page, (x) => x.rows.length === n && x.rows.every((r) => r.detailLoaded) && x.isComplete, { timeout: 420000, every: 2000 });
  check(scn, `fila concluída: ${n} perfis consultados`, s.isComplete && s.rows.length === n && s.rows.every((r) => r.detailLoaded), { rows: s.rows.length, complete: s.isComplete, paused: s.isPaused });
  // one /info/ request per profile, never twice
  const asked = mode === 'comment' ? profileReqs(o.log).map((e) => String(e.pk)) : o.log.filter((e) => e.kind === 'info').map((e) => String(e.pk));
  check(scn, 'uma consulta /users/{id}/info/ por perfil, nenhuma repetida', asked.length === n && new Set(asked).size === n, asked);
  // rows in the dashboard
  compareRows(scn, 'linhas do dashboard', await rowsView(page), R.expected);
  // exports through the real dropdown buttons
  const all = await uiExport(page, 'all', 'csv', 'matriz-' + mode), email = await uiExport(page, 'email', 'csv', 'matriz-' + mode), phone = await uiExport(page, 'phone', 'csv', 'matriz-' + mode);
  check(scn, 'botões mostram os totais: all=10, email=2, phone=5', all.count === n && email.count === 2 && phone.count === 5, [all.count, email.count, phone.count]);
  check(scn, 'CSV: cabeçalho com as 21 colunas esperadas', JSON.stringify(Object.keys(all.rows[0] || {})) === JSON.stringify(HEADERS), Object.keys(all.rows[0] || {}));
  compareRows(scn, 'CSV all', all.rows, R.expected);
  const wantEmail = Object.fromEntries(Object.entries(R.expected).filter(([, v]) => v.email));
  const wantPhone = Object.fromEntries(Object.entries(R.expected).filter(([, v]) => v.phone));
  compareRows(scn, 'CSV email (só quem tem e-mail)', email.rows, wantEmail);
  compareRows(scn, 'CSV phone (só quem tem telefone)', phone.rows, wantPhone);
  const xall = await uiExport(page, 'all', 'xlsx', 'matriz-' + mode), xemail = await uiExport(page, 'email', 'xlsx', 'matriz-' + mode), xphone = await uiExport(page, 'phone', 'xlsx', 'matriz-' + mode);
  compareRows(scn, 'XLSX all', xall.rows, R.expected);
  compareRows(scn, 'XLSX email', xemail.rows, wantEmail);
  compareRows(scn, 'XLSX phone', xphone.rows, wantPhone);
  check(scn, 'XLSX: abas ' + (mode === 'comment' ? 'all + Diagnostico contato + Respostas reais' : 'só all'),
    JSON.stringify(Object.keys(xall.sheets)) === JSON.stringify(mode === 'comment' ? ['all', 'Diagnostico contato', 'Respostas reais'] : ['all']), Object.keys(xall.sheets));
  check(scn, 'nomes de arquivo: IGEmailExtractor-<tipo>-<n>-<data>', /^IGEmailExtractor-all-10-\d{14}\.csv$/.test(all.name) && /^IGEmailExtractor-phone-5-\d{14}\.xlsx$/.test(xphone.name), [all.name, xphone.name]);
  // nothing from the biography leaks into the e-mail column; the phone from the bio is only the phone
  const every = [all, email, phone, xall, xemail, xphone];
  check(scn, 'e-mail escrito na bio nunca vai para a coluna de e-mail; e-mail de perfil oculto não aparece em lugar nenhum',
    every.every((x) => x.rows.every((r) => r['E-mail comercial'] !== 'bio@loja.com')) && !every.some((x) => JSON.stringify(x.rows).includes('oculto@loja.com')), null);
  if (mode === 'comment') {
    const diag = xall.sheets['Diagnostico contato'], real = xall.sheets['Respostas reais'].map((r) => r[0]).join('\n');
    const head = diag[0], byUser = Object.fromEntries(diag.slice(1).map((r) => [r[0], Object.fromEntries(head.map((h, i) => [h, r[i]]))]));
    check(scn, 'aba de diagnóstico traz origem e estado dos campos de telefone',
      byUser['@com_ambos'] && byUser['@com_ambos']['Origem do telefone'] === 'contact_phone_number (campo público)' && byUser['@com_ambos'].contact_phone_number === 'present'
      && byUser['@com_fone_na_bio']['Origem do telefone'] === 'biography (texto da bio/link)' && byUser['@com_fone_publico']['Origem do telefone'] === 'public_phone_number (campo público)'
      && byUser['@com_nenhum']['Origem do telefone'] === '-', byUser['@com_ambos']);
    const everyFull = ROSTER.flatMap((r) => [r.email, r.phone, r.api.contact_phone_number, r.api.public_phone_number].filter(Boolean));
    const leaked = everyFull.filter((v) => real.includes(v));
    check(scn, 'aba "Respostas reais": nenhum e-mail ou telefone completo, cookie ou token', leaked.length === 0 && !/csrf|cookie|sessionid|authorization/i.test(real), { leaked });
    check(scn, 'diagnóstico mostra o resumo por categoria com os perfis certos',
      /com e-mail público: 2 \(@com_ambos, @com_so_email\)/.test(real) && /com telefone público \(campo do Instagram\): 3 \(@com_ambos, @com_so_fone, @com_fone_publico\)/.test(real)
      && /só no texto da bio\/link \(não é o campo público\): 2 \(@com_fone_na_bio, @com_fone_no_link\)/.test(real), real.split('\n').filter((l) => /^  /.test(l)));
  }
  // saved history rows = what was exported
  const saved = await page.evaluate(async () => {
    const all = await chrome.storage.local.get(null), k = Object.keys(all).find((x) => /^extract_list_/.test(x));
    const P = window.IGPublicContacts;
    return (all[k] || []).map((r) => ({ user: r.userName, email: P.commercialRow(r).email, phone: r.phone, text: P.emailStatusText(r) }));
  });
  compareRows(scn, 'histórico salvo no navegador (extract_list_*)', saved, R.expected);
  // the popup history of the same browser: list + both exports
  scenario.historyList = [{ id: 'histTest', extractionType: M.hist, extractionData: M.ins(), count: 2, scrapedCount: n, itemsCount: n, updatedAt: '2026-10-06T12:00:00.000Z', cursor: '', version: 'v2.5.1 · PATCHED 15.5' }];
  const popup = await openPopupHistory(o.ctx, o.id);
  const shown = await popup.locator('.history-list tbody tr').count();
  const pAll = await popupExport(popup, 'all', 'csv'), pEmail = await popupExport(popup, 'email', 'csv'), pXall = await popupExport(popup, 'all', 'xlsx');
  check(scn, 'popup: o histórico lista a extração e exporta', shown === 1 && pAll.rows.length === n, { shown, rows: pAll.rows.length });
  check(scn, 'popup: cabeçalho das colunas', JSON.stringify(Object.keys(pAll.rows[0] || {})) === JSON.stringify(POPUP_HEADERS), Object.keys(pAll.rows[0] || {}));
  compareRows(scn, 'popup CSV all', pAll.rows, R.expected);
  compareRows(scn, 'popup CSV email', pEmail.rows, wantEmail);
  compareRows(scn, 'popup XLSX all', pXall.rows, R.expected);
  const hit = await popup.evaluate(() => document.querySelector('.history-list tbody tr td:nth-child(3) .download-link span').innerText);
  check(scn, 'popup: coluna Email do histórico = 2', hit === '2', hit);
  check(scn, 'nenhum erro de script', errors.length === 0, errors.slice(0, 3));
  await o.ctx.close();
}

/* ------------------------------------------------------------------------------------------------
 * Comment mode driven only by its buttons: Iniciar, Pause, Validar, Copiar diagnóstico, Continue, exports.
 * ---------------------------------------------------------------------------------------------- */
const btnState = (page) => page.evaluate(() => {
  const find = (t) => Array.from(document.querySelectorAll('button')).find((b) => b.innerText.trim().toLowerCase().indexOf(t) >= 0);
  const out = {};
  for (const t of ['iniciar', 'pause', 'continue', 'validar 1 perfil pendente', 'copiar diagnóstico', 'export all', 'export email', 'export phone']) {
    const b = find(t); out[t] = b ? (b.disabled ? 'desabilitado' : 'habilitado') : 'ausente';
  }
  return out;
});
async function botoes_comment(extDir, label) {
  const scn = `${label}:botoes_comment`, R = roster(7100, 'bt');
  const users = R.users.slice(0, 6), pick = Object.fromEntries(users.map((u) => [u.username, () => R.info[u.pk]()]));
  const scenario = { comments: users.map((u) => ({ pk: u.pk, username: u.username })), profiles: pick };
  const o = await launchOn(extDir, 'btn', scenario);
  const { page, errors } = await openDash(o, 'ins=POSTTEST&type=4');
  let b = await btnState(page);
  check(scn, 'antes de iniciar: Iniciar habilitado; Validar, Copiar, Pause e exportações desabilitados ou ausentes; nada consultado',
    b.iniciar === 'habilitado' && b['validar 1 perfil pendente'] === 'desabilitado' && b['copiar diagnóstico'] === 'desabilitado' && b.pause === 'ausente'
    && ['ausente', 'desabilitado'].includes(b['export all']) && profileReqs(o.log).length === 0 && (await vmEval(page, 'vm.isPaused')) === true, b);
  await H.clickButton(page, 'Iniciar');
  await H.waitFor(page, (x) => x.rows.length === 6 && profileReqs(o.log).length >= 1, { timeout: 90000, every: 500 });
  b = await btnState(page);
  check(scn, 'em andamento: Pause visível, Iniciar sumiu, Validar desabilitado (só com a fila parada)', b.pause === 'habilitado' && b.iniciar === 'ausente' && b['validar 1 perfil pendente'] === 'desabilitado', b);
  const card1 = await H.waitFor(page, (x) => x.notifications.concat(x.toasts).some((t) => /Validação de 1 consulta/.test(t)), { timeout: 60000, every: 500 });
  check(scn, 'a 1ª resposta real abre o quadro com versão, modo, endpoint enviado, HTTP, campos de e-mail e telefone, decisões e valores mascarados', (() => {
    const t = card1.notifications.concat(card1.toasts).find((x) => /Validação de 1 consulta/.test(x)) || '';
    return /@bt_ambos/.test(t) && /Versão testada: v2\.5\.1 · PATCHED 15\.5/.test(t) && /Modo: Comment/.test(t)
      && /Endpoint: GET https:\/\/www\.instagram\.com\/api\/v1\/users\/\{id\}\/info\/ \(enviado de fato\)/.test(t) && /HTTP 200/.test(t) && /public_email: texto/.test(t)
      && /contact_phone_number: texto/.test(t) && /Decisão do parser \(e-mail\): email_found \(public_email\)/.test(t) && /Decisão do parser \(telefone\): phone_found \(contact_phone_number, campo público do Instagram\)/.test(t)
      && /E-mail \(mascarado\): a\*\*\*@loja\.com/.test(t) && /Telefone \(mascarado\): \+55\*+01/.test(t) && !/ambos@loja\.com|11911110001|5511911110001|csrf|cookie|token/i.test(t);
  })(), card1.notifications.concat(card1.toasts).find((x) => /Validação de 1 consulta/.test(x)));
  const firstText = card1.notifications.find((x) => /Validação de 1 consulta/.test(x)) || '';
  check(scn, 'o quadro diz que é a 1ª resposta real da execução, e um aviso curto manda olhar o quadro no topo',
    /1ª resposta real desta execução/.test(firstText) && !/validação manual/.test(firstText) && card1.toasts.some((t) => /Primeira resposta de perfil recebida/.test(t)), { firstText: firstText.slice(0, 120), toasts: card1.toasts.slice(-3) });
  const board1 = await page.evaluate(() => { const c = document.querySelector('.contact-validation-card'); return c ? { inNotices: !!c.closest('.notices'), position: getComputedStyle(c).position, hasClose: !!c.querySelector('button.delete'), overlays: document.querySelectorAll('.notices .notification').length } : null; });
  check(scn, 'o quadro fica dentro do painel (não é sobreposição fixa), tem botão de fechar e não há notificação sobreposta', board1 && board1.inNotices === false && board1.position !== 'fixed' && board1.hasClose === true && board1.overlays === 0, board1);
  const covered1 = await H.coveredControls(page);
  check(scn, 'com o quadro da 1ª resposta aberto nenhum botão fica coberto', covered1.length === 0, covered1);
  await H.clickButton(page, 'Pause');
  await page.waitForTimeout(1500);
  const afterPause = profileReqs(o.log).length;
  await page.waitForTimeout(16000);
  check(scn, 'Pause: nenhuma consulta depois de pausar (16 s de espera), botão vira Continue', profileReqs(o.log).length === afterPause && (await btnState(page)).continue === 'habilitado', { before: afterPause, after: profileReqs(o.log).length });
  b = await btnState(page);
  check(scn, 'pausado com linhas pendentes: Validar e Copiar diagnóstico habilitados', b['validar 1 perfil pendente'] === 'habilitado' && b['copiar diagnóstico'] === 'habilitado', b);
  const pendingBefore = (await rowsView(page)).filter((r) => !r.detailLoaded).map((r) => r.user);
  const before = profileReqs(o.log).length;
  await H.clickButton(page, 'Validar 1 perfil pendente');
  const afterProbe = await H.waitFor(page, (x) => profileReqs(o.log).length > before && x.notifications.some((t) => /Validação de 1 consulta/.test(t) && /validação manual/.test(t)), { timeout: 90000, every: 500 });
  await page.waitForTimeout(1500);
  const probeText = afterProbe.notifications.find((t) => /Validação de 1 consulta/.test(t) && /validação manual/.test(t)) || '';
  const covered2 = await H.coveredControls(page);
  check(scn, 'o quadro da validação manual substitui o da 1ª resposta (um só no painel) e nenhum botão fica coberto (Continue, exportações, Copiar...)',
    afterProbe.notifications.filter((t) => /Validação de 1 consulta/.test(t)).length === 1 && covered2.length === 0, { cards: afterProbe.notifications.filter((t) => /Validação de 1 consulta/.test(t)).length, covered: covered2 });
  check(scn, 'Validar 1 perfil pendente: exatamente 1 consulta, do 1º pendente, e mostra o quadro', profileReqs(o.log).length === before + 1 && profileReqs(o.log).slice(-1)[0].username === pendingBefore[0],
    { before, after: profileReqs(o.log).length, first: pendingBefore[0] });
  // The headless clipboard cannot be read back; capture what the button hands to it instead.
  await page.evaluate(() => { window.__clip = null; Clipboard.prototype.writeText = function (t) { window.__clip = t; return Promise.resolve(); }; });
  const copyClick = await H.clickButton(page, 'Copiar diagnóstico');
  await page.waitForTimeout(1200);
  const toast = await H.snapshot(page);
  check(scn, 'Copiar diagnóstico: aviso "Diagnóstico copiado."', copyClick && toast.toasts.some((t) => /Diagnóstico copiado/.test(t)), toast.toasts.slice(-3));
  const clip = await page.evaluate(() => window.__clip);
  const diag = await vmEval(page, 'vm.contactDiagnosticText');
  if (process.env.E2E_SAVE_DIR) {
    // Evidence of what the user will see and copy (simulated profiles; masked values only).
    fs.mkdirSync(process.env.E2E_SAVE_DIR, { recursive: true });
    fs.writeFileSync(path.join(process.env.E2E_SAVE_DIR, 'diagnostico-copiado-exemplo.txt'), clip || '');
    fs.writeFileSync(path.join(process.env.E2E_SAVE_DIR, 'quadro-de-validacao-exemplo.txt'), [firstText, probeText].join('\n\n--------\n\n'));
  }
  check(scn, 'o texto copiado é o diagnóstico (versão, modo, rota, resumo por categoria) e não traz contato completo, cookie nem token',
    clip === diag && /Modo: Comment/.test(diag) && /PATCHED 15\.5/.test(diag) && /rota enviada de fato/.test(diag) && /Resumo desta execução/.test(diag)
    && !/ambos@loja\.com|11911110001|csrf|cookie|sessionid|authorization/i.test(diag), { copiado: clip === diag, head: diag.slice(0, 200) });
  await H.clickButton(page, 'Continue');
  const done = await H.waitFor(page, (x) => x.isComplete && x.rows.length === 6 && x.rows.every((r) => r.detailLoaded), { timeout: 240000, every: 2000 });
  check(scn, 'Continue: a fila termina; o perfil validado não foi consultado de novo (6 consultas no total)', done.isComplete && profileReqs(o.log).length === 6 && new Set(profileReqs(o.log).map((e) => e.pk)).size === 6, profileReqs(o.log).map((e) => e.username));
  // Continue closes the notices (as in the original: it clicks every close button); the resumed run shows ITS first answer's board.
  const afterContinue = await page.locator('.contact-validation-card').count();
  const resumedText = afterContinue ? await page.locator('.contact-validation-card').first().innerText() : '';
  await page.locator('.contact-validation-card button.delete').first().click();
  await page.waitForTimeout(400);
  check(scn, 'depois de Continue o quadro da validação manual saiu (Continue fecha os avisos) e o painel mostra o quadro da 1ª resposta da execução retomada; o × o remove',
    afterContinue === 1 && /1ª resposta real desta execução/.test(resumedText) && !/validação manual/.test(resumedText) && (await page.locator('.contact-validation-card').count()) === 0, { afterContinue, resumedText: resumedText.slice(0, 100) });
  b = await btnState(page);
  const body = (await H.snapshot(page)).bodyText;
  check(scn, 'concluída: texto "Completed." e Pause/Continue sumiram; exportações habilitadas', /Completed\./.test(body) && b.pause === 'ausente' && b.continue === 'ausente' && b['export all'] === 'habilitado', b);
  const csv = await uiExport(page, 'all', 'csv', 'botoes');
  const wantAll = Object.fromEntries(users.map((u, i) => [u.username, { email: ROSTER[i].email, phone: ROSTER[i].phone, status: ROSTER[i].status }]));
  compareRows(scn, 'exportação por clique depois dos botões', csv.rows, wantAll);
  check(scn, 'nenhum erro de script', errors.length === 0, errors.slice(0, 3));
  await o.ctx.close();
}

/* ------------------------------------------------------------------------------------------------
 * The validation board and the window size: whatever the window, the board (first answer, manual validation)
 * covers no button, fits the width, and Continue can be reached. (It used to be a 600x520 px floating notice.)
 * ---------------------------------------------------------------------------------------------- */
async function quadro_janelas(extDir, label) {
  const scn = `${label}:quadro_janelas`, R = roster(7600, 'jn');
  const users = R.users.slice(0, 4), pick = Object.fromEntries(users.map((u) => [u.username, () => R.info[u.pk]()]));
  const o = await launchOn(extDir, 'jan', { comments: users.map((u) => ({ pk: u.pk, username: u.username })), profiles: pick });
  const { page, errors } = await openDash(o, 'ins=POSTTEST&type=4');
  const sizes = [[800, 900], [1024, 600], [1280, 720], [1366, 768], [1920, 1080]];
  const probe = (w, h) => page.evaluate(() => {
    const board = document.querySelector('.contact-validation-card');
    const cont = Array.from(document.querySelectorAll('button')).find((x) => /^\s*Continue\s*$/.test(x.textContent));
    let hit = 'ausente';
    if (cont) { cont.scrollIntoView({ block: 'center' }); const r = cont.getBoundingClientRect(), top = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2); hit = top && (top === cont || cont.contains(top)) ? 'acessível' : 'coberto por ' + (top && (top.className || top.tagName)); window.scrollTo(0, 0); }
    const b = board ? board.getBoundingClientRect() : null;
    return { board: !!board, fits: !!b && b.left >= 0 && b.right <= innerWidth + 1, hit };
  });
  await H.clickButton(page, 'Iniciar');
  await H.waitFor(page, (x) => x.rows.length === 4 && x.notifications.some((t) => /1ª resposta real desta execução/.test(t)), { timeout: 90000, every: 500 });
  for (const [w, h] of sizes) {
    await page.setViewportSize({ width: w, height: h }); await page.waitForTimeout(400);
    const covered = await H.coveredControls(page), r = await probe(w, h);
    check(scn, `1ª resposta, janela ${w}x${h}: o quadro cabe na largura e nenhum botão visível fica coberto`, r.board && r.fits && covered.length === 0, { covered, r });
  }
  await H.clickButton(page, 'Pause');
  await H.waitFor(page, (x) => x.isPaused && !x.detailCycle, { timeout: 60000, every: 500 });
  await page.waitForTimeout(1500);
  await H.clickButton(page, 'Validar 1 perfil pendente');
  await H.waitFor(page, (x) => x.notifications.some((t) => /validação manual/.test(t)), { timeout: 90000, every: 500 });
  for (const [w, h] of sizes) {
    await page.setViewportSize({ width: w, height: h }); await page.waitForTimeout(400);
    const covered = await H.coveredControls(page), r = await probe(w, h);
    check(scn, `validação manual, janela ${w}x${h}: o quadro cabe na largura, nenhum botão visível fica coberto e Continue é acessível`, r.board && r.fits && covered.length === 0 && r.hit === 'acessível', { covered, r });
  }
  check(scn, 'nenhum erro de script', errors.length === 0, errors.slice(0, 3));
  await o.ctx.close();
}

/* ------------------------------------------------------------------------------------------------
 * The DJ display filter and the export buttons: "export all" follows the filter, e-mail and phone do not
 * (exactly as before the export lists took in the rows of earlier sessions).
 * ---------------------------------------------------------------------------------------------- */
async function dj_exportacao(extDir, label) {
  const scn = `${label}:dj_exportacao`;
  const users = [{ pk: 9901, username: 'dj_set_oficial' }, { pk: 9902, username: 'loja_roupas' }, { pk: 9903, username: 'padaria_bairro' }];
  const biz = { account_type: 2, is_business: true, should_show_public_contacts: true };
  const scenario = {
    profiles: { alvo_loja: followersTarget(9000) },
    friendships: () => ({ status: 200, body: { status: 'ok', users: users.map((u) => ({ pk: String(u.pk), username: u.username, full_name: 'Nome ' + u.username, profile_pic_url: PIXEL })), next_max_id: null, big_list: false } }),
    info: {
      9901: () => mobileUser(9901, 'dj_set_oficial', Object.assign({ public_email: 'booking@djset.com', follower_count: 12000, biography: 'DJ / producer — afro house, melodic techno. Bookings worldwide', external_url: 'https://soundcloud.com/djset', contact_phone_number: '11911110001', public_phone_country_code: '55' }, biz)),
      9902: () => mobileUser(9902, 'loja_roupas', Object.assign({ public_email: 'vendas@roupas.com', biography: 'fashion store' }, biz)),
      9903: () => mobileUser(9903, 'padaria_bairro', Object.assign({ public_email: 'pao@padaria.com', biography: 'food', contact_phone_number: '11922220002', public_phone_country_code: '55' }, biz)),
    },
  };
  const o = await launchOn(extDir, 'djx', scenario);
  const { page, errors } = await openDash(o, 'ins=alvo_loja&type=0', { seed: { intervals: [10, 10] } });
  await H.waitFor(page, (x) => x.rows.length === 3 && x.rows.every((r) => r.detailLoaded) && x.isComplete, { timeout: 240000, every: 2000 });
  const before = { all: await uiExport(page, 'all', 'csv'), email: await uiExport(page, 'email', 'csv'), phone: await uiExport(page, 'phone', 'csv') };
  check(scn, 'sem filtro: all=3, email=3, phone=2', before.all.count === 3 && before.email.count === 3 && before.phone.count === 2, [before.all.count, before.email.count, before.phone.count]);
  await page.evaluate(`(() => { const vm = ${H.findVmSource()}; vm.djFilterEnabled = true; vm.djMinScore = 60; })()`);
  await page.waitForTimeout(500);
  const table = await vmEval(page, 'vm.userList.map(r => r.userName)');
  const after = { all: await uiExport(page, 'all', 'csv'), email: await uiExport(page, 'email', 'csv'), phone: await uiExport(page, 'phone', 'csv') };
  check(scn, 'filtro DJ (nota mínima 60): a tabela e "export all" mostram só o DJ', JSON.stringify(table) === '["dj_set_oficial"]' && after.all.count === 1 && after.all.rows.length === 1 && after.all.rows[0]['User Name'] === 'dj_set_oficial', { table, all: after.all.count });
  check(scn, 'filtro DJ: "export email" e "export phone" não são filtrados (3 e 2), como antes', after.email.count === 3 && after.email.rows.length === 3 && after.phone.count === 2 && after.phone.rows.length === 2, [after.email.count, after.phone.count]);
  check(scn, 'o filtro é só de exibição: as 3 linhas continuam salvas no histórico', ((await page.evaluate(() => chrome.storage.local.get(null))).extract_list_histTest || []).length === 3, null);
  check(scn, 'nenhum erro de script', errors.length === 0, errors.slice(0, 3));
  await o.ctx.close();
}

module.exports = { SCENARIOS: { matriz, botoes_comment, quadro_janelas, dj_exportacao }, helpers: { launchOn, openDash, rowsView, compareRows, webUser, followersTarget, settled, btnState } };

if (require.main === module) {
  (async () => {
    const [extDir, label, ...names] = process.argv.slice(2);
    const all = Object.assign({}, module.exports.SCENARIOS, (() => { try { return require('./lifecycle').SCENARIOS; } catch (e) { if (e.code !== 'MODULE_NOT_FOUND') throw e; return {}; } })());
    const jobs = names.map((n) => {
      const [name, arg] = n.split(':');
      if (!all[name]) { check(label + ':' + n, 'cenário existe', false, 'desconhecido'); return Promise.resolve(); }
      return all[name](extDir, label, arg).catch((e) => check(label + ':' + n, 'cenário executado até o fim', false, String((e && e.stack) || e).slice(0, 600)));
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
}
