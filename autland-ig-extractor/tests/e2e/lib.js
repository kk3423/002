/* Helpers shared by the final end-to-end suite (final.js). Chromium loads the unpacked extension and
 * the real dashboard/popup are driven by clicks. Every Instagram answer is a SIMULATED fixture;
 * any other host is blocked by harness.js. */
const H = require('./harness');
const fs = require('fs'), os = require('os'), path = require('path');
const { execFileSync } = require('child_process');
const PIXEL = H.PIXEL;

const results = [];
// Printed as soon as it is known, so a killed or slow run still shows what it proved.
function check(scn, name, ok, detail) {
  results.push({ scn, name, ok: !!ok, detail });
  if (process.env.E2E_STREAM) console.error(`${ok ? 'ok  ' : 'FAIL'}  ${scn}  ${name}${ok ? '' : '  ' + JSON.stringify(detail).slice(0, 400)}`);
}

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
  return rows.filter((r) => r.length > 1 || (r.length === 1 && r[0] !== ''));
}
// [{header: value}] from a CSV text
function csvObjects(text) {
  const rows = parseCsv(text.replace(/^﻿/, '')), head = rows[0] || [];
  return rows.slice(1).map((r) => Object.fromEntries(head.map((h, i) => [h, r[i] === undefined ? '' : r[i]])));
}
function readXlsx(file) {
  const py = "import json,sys,openpyxl\nwb=openpyxl.load_workbook(sys.argv[1])\nprint(json.dumps({ws.title:[[('' if c is None else str(c)) for c in r] for r in ws.iter_rows(values_only=True)] for ws in wb.worksheets}))";
  return JSON.parse(execFileSync('python3', ['-c', py, file], { encoding: 'utf8' }));
}
function sheetObjects(rows) {
  const head = rows[0] || [];
  return rows.slice(1).map((r) => Object.fromEntries(head.map((h, i) => [h, r[i] === undefined ? '' : r[i]])));
}

/* The same user object the mobile/web /api/v1/users/{id}/info/ route answers with (shape of the anonymised real captures). */
const mobileUser = (pk, username, extra) => ({ status: 200, body: { status: 'ok', user: Object.assign({
  pk: Number(pk), pk_id: String(pk), id: String(pk), username, full_name: 'Nome ' + username, profile_pic_url: PIXEL, follower_count: 120, following_count: 80,
  media_count: 9, is_private: false, is_verified: false, external_url: '', biography: '', city_name: '', address_street: '',
  contact_phone_number: '', public_phone_number: '', public_phone_country_code: '' }, extra || {}) } });

/* Ground truth for every mode: what each profile PUBLISHES and what the extension must put in the
 * email / phone / status columns. Written by hand, independent of the parser. */
const NO_EMAIL = 'Perfil não disponibiliza e-mail público';
const ROSTER = [
  { key: 'ambos', api: { account_type: 2, is_business: true, should_show_public_contacts: true, public_email: 'ambos@loja.com', contact_phone_number: '11911110001', public_phone_country_code: '55' },
    email: 'ambos@loja.com', phone: '+5511911110001', status: 'E-mail comercial encontrado' },
  { key: 'so_email', api: { account_type: 2, is_business: true, should_show_public_contacts: true, public_email: 'so_email@loja.com' },
    email: 'so_email@loja.com', phone: '', status: 'E-mail comercial encontrado' },
  { key: 'so_fone', api: { account_type: 2, is_business: true, should_show_public_contacts: true, public_email: '', contact_phone_number: '11911110003', public_phone_country_code: '55' },
    email: '', phone: '+5511911110003', status: NO_EMAIL + ' · campo vazio' },
  { key: 'fone_publico', api: { account_type: 3, is_business: false, should_show_public_contacts: true, public_email: '', public_phone_number: '21933334444', public_phone_country_code: '55' },
    email: '', phone: '+5521933334444', status: NO_EMAIL + ' · campo vazio' },
  { key: 'nenhum', api: { account_type: 2, is_business: true, should_show_public_contacts: true, public_email: '' },
    email: '', phone: '', status: NO_EMAIL + ' · campo vazio' },
  { key: 'pessoal', api: { account_type: 1, is_business: false, biography: 'sem contato' },
    email: '', phone: '', status: NO_EMAIL + ' · conta pessoal' },
  { key: 'oculto', api: { account_type: 2, is_business: true, should_show_public_contacts: false, public_email: 'oculto@loja.com', contact_phone_number: '11955556666', public_phone_country_code: '55' },
    email: '', phone: '', status: NO_EMAIL + ' · contato oculto pelo perfil' },
  { key: 'email_na_bio', api: { account_type: 2, is_business: true, should_show_public_contacts: true, public_email: '', biography: 'contato: bio@loja.com' },
    email: '', phone: '', status: NO_EMAIL + ' · campo vazio' },
  { key: 'fone_na_bio', api: { account_type: 2, is_business: true, should_show_public_contacts: true, public_email: '', biography: 'WhatsApp: (11) 98888-7777' },
    email: '', phone: '11988887777', status: NO_EMAIL + ' · campo vazio' },
  { key: 'fone_no_link', api: { account_type: 2, is_business: true, should_show_public_contacts: true, public_email: '', external_url: 'https://wa.me/5511977776666' },
    email: '', phone: '+5511977776666', status: NO_EMAIL + ' · campo vazio' },
];
// pk = base + index, username = <prefix>_<key>
function roster(base, prefix) {
  const users = ROSTER.map((r, i) => ({ pk: base + i, username: prefix + '_' + r.key, key: r.key }));
  const info = {};
  users.forEach((u, i) => { info[u.pk] = () => mobileUser(u.pk, u.username, ROSTER[i].api); });
  const expected = {};
  users.forEach((u, i) => { expected[u.username] = { email: ROSTER[i].email, phone: ROSTER[i].phone, status: ROSTER[i].status }; });
  return { users, info, expected };
}

async function gotoRetry(page, url) {
  for (let i = 0; ; i++) {
    try { await page.goto(url); return; }
    catch (e) { if (i >= 20) throw e; await page.waitForTimeout(1000); }
  }
}
async function dashboardUrl(id, query) { return `chrome-extension://${id}/dashboard.html#/?${query}`; }

/* Click an export entry of the dashboard dropdown (hover the "export <group> (N)" button, click the item). */
async function uiExport(page, group, fmt, tag) {
  const trigger = page.locator('button', { hasText: `export ${group} (` }).first();
  await trigger.waitFor({ timeout: 10000 });
  const label = await trigger.innerText();
  if (await trigger.isDisabled()) return { disabled: true, label, count: Number((label.match(/\((\d+)\)/) || [])[1]) };
  await trigger.hover();
  const item = page.locator('.export-menu-item', { hasText: `export ${group} to ${fmt}` }).first();
  await item.waitFor({ state: 'visible', timeout: 10000 });
  const [dl] = await Promise.all([page.waitForEvent('download', { timeout: 20000 }), item.click()]);
  const out = { label, count: Number((label.match(/\((\d+)\)/) || [])[1]), name: dl.suggestedFilename() };
  const file = path.join(os.tmpdir(), 'uiexp-' + process.pid + '-' + Date.now() + '-' + Math.random().toString(36).slice(2) + '.' + fmt);
  await dl.saveAs(file);
  // Evidence: keep the real downloaded file (simulated profiles only) when asked.
  if (tag && process.env.E2E_SAVE_DIR) { fs.mkdirSync(process.env.E2E_SAVE_DIR, { recursive: true }); fs.copyFileSync(file, path.join(process.env.E2E_SAVE_DIR, `${tag}-${group}.${fmt}`)); }
  if (fmt === 'csv') out.rows = csvObjects(fs.readFileSync(file, 'utf8'));
  else { out.sheets = readXlsx(file); out.rows = sheetObjects(out.sheets[group] || out.sheets[Object.keys(out.sheets)[0]]); }
  fs.unlinkSync(file);
  return out;
}

/* The popup's history list: one row per extraction, with its own export dropdowns. */
async function openPopupHistory(ctx, id) {
  const page = await ctx.newPage();
  await gotoRetry(page, `chrome-extension://${id}/popup.html`);
  await page.waitForTimeout(1500);
  await page.locator('.aside-item-list a').first().click();
  await page.waitForTimeout(1500);
  return page;
}
// col: 0 = "Extracted" (all), 1 = "Email"; fmt: xlsx | csv
async function popupExport(page, which, fmt, rowIndex = 0) {
  const row = page.locator('.history-list tbody tr').nth(rowIndex);
  const trigger = row.locator('.download-link').nth(which === 'all' ? 0 : 1);
  await trigger.click();
  const item = row.locator('.dropdown-item', { hasText: `export ${which} to ${fmt}` }).first();
  await item.waitFor({ state: 'visible', timeout: 10000 });
  const [dl] = await Promise.all([page.waitForEvent('download', { timeout: 20000 }), item.click()]);
  const file = path.join(os.tmpdir(), 'popexp-' + process.pid + '-' + Date.now() + '.' + fmt);
  await dl.saveAs(file);
  const out = { name: dl.suggestedFilename() };
  if (fmt === 'csv') out.rows = csvObjects(fs.readFileSync(file, 'utf8'));
  else { out.sheets = readXlsx(file); out.rows = sheetObjects(out.sheets[which] || out.sheets[Object.keys(out.sheets)[0]]); }
  fs.unlinkSync(file);
  return out;
}

/* chrome://extensions: Reload button (developerPrivate.reload), the same as the user's Recarregar click. */
const withTimeout = (p, ms) => Promise.race([p, new Promise((r) => setTimeout(() => r('TIMEOUT'), ms))]);
async function reloadExtension(ctx, id) {
  const ext = await ctx.newPage();
  await withTimeout(ext.goto('chrome://extensions/'), 10000);
  await withTimeout(ext.evaluate(() => chrome.developerPrivate.updateProfileConfiguration({ inDeveloperMode: true })), 5000);
  const r = await withTimeout(ext.evaluate((x) => chrome.developerPrivate.reload(x, { failQuietly: true }).then(() => 'ok', (e) => 'ERR ' + e.message), id), 8000);
  await ext.waitForTimeout(2000);
  await ext.close();
  return r;
}

const profileReqs = (log) => log.filter((e) => e.kind === 'profile');
const infoPks = (log) => profileReqs(log).map((e) => String(e.pk));
async function vmEval(page, expr) {
  return page.evaluate(`(async () => { const vm = ${H.findVmSource()}; return (${expr}); })()`);
}
/* The pause gate, from every angle a user (or a stale page) has. Nothing may leave for Instagram:
 *  (a) on the page itself: the buttons' state, then forced clicks on each of them;
 *  (b) on a sacrificial copy of the dashboard that knows nothing of the pause (its in-memory pause is
 *      wiped, a pending row is injected): "Validar 1 perfil pendente", Continue and a direct resume
 *      must still stop at the shared saved pause, because the reader checks storage itself. */
async function assertPauseHolds(scn, tag, page, log, wait = 4000) {
  const before = profileReqs(log).length;
  const gate = await page.evaluate(`(() => {
    const out = {}, btn = (t) => Array.from(document.querySelectorAll('button')).find((b) => b.innerText.trim().toLowerCase().indexOf(t) >= 0);
    for (const t of ['iniciar', 'validar 1 perfil pendente', 'continue']) { const b = btn(t); out[t] = b ? (b.disabled ? 'desabilitado' : 'habilitado') : 'ausente'; }
    return out; })()`);
  await page.evaluate(`(() => { for (const b of document.querySelectorAll('button')) { const t = b.innerText.trim().toLowerCase();
    if (/iniciar|validar 1 perfil pendente|^continue/.test(t)) { b.disabled = false; b.removeAttribute('disabled'); b.click(); } } })()`);
  await page.waitForTimeout(Math.min(wait, 2500));
  const mid = profileReqs(log).length;
  const stale = await page.context().newPage();
  await stale.goto(page.url());
  await stale.waitForTimeout(2500);
  const staleInfo = await stale.evaluate(`(async () => {
    const vm = ${H.findVmSource()};
    // The copy shares chrome.storage with the real page: it must never save its invented row.
    vm.persistExtractRows = function () { return Promise.resolve(); }; vm.saveExtractRows = vm.persistExtractRows; vm.updateHistory = function () {};
    vm.retryAfterUntil = null; vm.commercialContactUnavailable = false; vm.storedCooldownUntil = 0;
    vm.followList = [{ id: 1, userId: '777001', userName: 'linha_injetada', loaded: true, detailLoaded: false, email: '', phone: '' }];
    vm.pageInfo = { end_cursor: '', has_next_page: false }; vm.queueReady = true; vm.isPaused = true;
    const errors = [];
    try { vm.handleContactProbe(); } catch (e) { errors.push('probe ' + e.message); }
    try { vm.handleToggleWorkStatus(); } catch (e) { errors.push('toggle ' + e.message); }
    try { vm.resumeAfterStateCheck(); } catch (e) { errors.push('resumeAfter ' + e.message); }
    try { vm.resumeExtraction(); } catch (e) { errors.push('resume ' + e.message); }
    return errors;
  })()`);
  await stale.waitForTimeout(Math.max(wait, 3000));
  const toasts = await stale.evaluate(() => (window.__toasts || []).slice(-4));
  await stale.close();
  const after = profileReqs(log).length;
  check(scn, `${tag}: pausa ativa — zero consultas com cliques forçados nos botões, e numa cópia sem memória da pausa ("Validar 1 perfil pendente", Continue e retomada direta)`,
    after === before && mid === before, { before, mid, after, gate, staleInfo, toasts });
  return gate;
}

module.exports = { H, PIXEL, check, results, parseCsv, csvObjects, readXlsx, sheetObjects, mobileUser, ROSTER, roster, NO_EMAIL,
  gotoRetry, dashboardUrl, uiExport, openPopupHistory, popupExport, reloadExtension, profileReqs, infoPks, vmEval, assertPauseHolds, withTimeout };
