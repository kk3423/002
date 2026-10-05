/* Data, history and export tests: the real dashboard and popup components run in Node with
 * stubbed browser APIs, a virtual clock and SIMULATED Instagram responses (nothing leaves the
 * process). Run: EXT_DIR=/path/to/extension node --test tests/node/data.test.js */
const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');
const { createEnv } = require('./dash');
const { loadPopup } = require('./popup_loader');
const { loadChunks, makeRequire } = require('./loader');

const EXT = path.resolve(process.env.EXT_DIR || process.env.EXT || '.');
// Values built inside the sandbox realm compare by content, not by prototype.
const plain = (v) => JSON.parse(JSON.stringify(v));

const commentCfg = {
  url: 'https://www.instagram.com/api/v1/media/${postId}/comments/?min_id=${cursor}',
  noExistCheckKey: 'data.status', noExistCheckValue: 'ok', checkKey: 'data.status', checkValue: 'ok',
  dataKeys: 'data.comments|data.next_min_id|data.has_more|data.comment_count', itemsDataKeys: 'user.pk|user.username|user.profile_pic_url',
};
const followersCfg = { url: 'https://x/followers/${userid}?max_id=${cursor}', checkKey: 'data.status', checkValue: 'ok', dataKeys: 'data.users|data.next_max_id|data.has_more', itemsDataKeys: 'id|username|full_name|profile_pic_url' };
const detailCfg = { url: 'https://x/users/${@}$/info/', checkKey: 'data.status', checkValue: 'ok',
  dataKeys: 'data.user.profile_pic_url|data.user.username|data.user.full_name|data.user.follower_count|data.user.following_count|data.user.public_email|data.user.media_count|data.user.public_phone_country_code|data.user.public_phone_number|data.user.contact_phone_number|data.user.city_name|data.user.address_street|data.user.is_private|data.user.is_verified|data.user.is_business|data.user.external_url|data.user.biography' };

function commenters(n) {
  return Array.from({ length: n }, (_, i) => ({ pk: String(1000 + i), username: 'user' + i, profile_pic_url: 'p' + i }));
}
function commentPages(users, pageSize) {
  return function axiosGet(url) {
    const cursor = decodeURIComponent(url.split('min_id=')[1] || '');
    const page = cursor ? Number(cursor.replace('c', '')) : 0;
    const more = (page + 1) * pageSize < users.length;
    return Promise.resolve({ data: { status: 'ok', comments: users.slice(page * pageSize, (page + 1) * pageSize).map((u) => ({ user: u })),
      next_min_id: more ? 'c' + (page + 1) : '', has_more: more, comment_count: users.length } });
  };
}
function webProfile(users, extra) {
  return function (username) {
    const u = users.find((x) => x.username === username);
    const body = { data: { user: Object.assign({ id: u.pk, username, full_name: 'F', is_business_account: true, is_professional_account: true,
      business_email: null, business_phone_number: null, business_contact_method: 'UNKNOWN', should_show_public_contacts: true, edge_followed_by: { count: 5 } }, extra ? extra(u) : {}) }, status: 'ok' };
    return { status: 200, ok: true, type: 'basic', headers: { get: () => null }, text: async () => JSON.stringify(body) };
  };
}
const rate429 = () => ({ status: 429, ok: false, type: 'basic', headers: { get: () => null }, text: async () => '{}' });
function commentSetup(vm) {
  vm.type = 4; vm.ins = 'POST'; vm.extractionType = 'comment';
  vm.configs = { apiUserForComment: commentCfg, CustomHeaders: {}, objectId: 'cfg', ClaimSessionStorageKey: 'k' };
  vm.subscription = { isPro: true };
  vm.getInsClaim = async () => {}; vm.getUserInfo = async () => ({ id: 'me' });
  vm.getInsUserStatus = async () => { vm.insLogged = true; }; vm.getInsCsrfToken = async () => {};
}
const nameOf = (url) => decodeURIComponent(url.split('username=')[1]);

async function commentResume({ total, pageSize, failAt }) {
  const users = commenters(total);
  const profile = webProfile(users);
  // Session 1: profiles 1..failAt-1 answer, profile failAt gets HTTP 429, the dashboard is closed.
  const env1 = createEnv(EXT, { quiet: true, axiosGet: commentPages(users, pageSize) });
  const calls1 = [];
  env1.setFetch(async (url) => { calls1.push(nameOf(url)); return calls1.length >= failAt ? rate429() : profile(nameOf(url)); });
  const vm1 = env1.instance({ type: '4', ins: 'POST' });
  commentSetup(vm1);
  vm1.lastHistoryItem = { id: 'H1', token: 't', updateTimes: 0, scrapedCount: 0, cursorScrapedCount: 0, count: 0 };
  vm1.isPaused = false;
  vm1.startLoadAllData();
  await env1.run(400, () => vm1.isPaused);
  await env1.flush(50);
  const last = env1.historyCalls[env1.historyCalls.length - 1];
  // Session 2: the same history is resumed (?history=H1) with what the server stored.
  const env2 = createEnv(EXT, { quiet: true, axiosGet: commentPages(users, pageSize), store: env1.store, now: env1.now() + 2 * 3600e3 });
  const calls2 = [];
  env2.setFetch(async (url) => { calls2.push(nameOf(url)); return profile(nameOf(url)); });
  const w = { id: 'H1', get: (k) => ({ token: 't', updateTimes: 1, scrapedCount: last.scrapedCount, cursorScrapedCount: last.cursorScrapedCount,
    count: last.count, lastCursor: last.lastCursor, customUserList: '' }[k]) };
  env2.fa20.d = async () => w;
  const vm2 = env2.instance({ type: '4', ins: 'POST', history: 'H1' });
  commentSetup(vm2);
  vm2.isPaused = false;
  vm2.startWorking();
  await env2.run(5000, () => vm2.isComplete);
  await env2.flush(50);
  const stored = env2.store.extract_list_H1 || [];
  return { users, calls1, calls2, last, vm2, stored };
}

test('Comment: retomar um histórico consulta só os comentaristas pendentes (2 consultados, 429 no 3º)', async () => {
  const r = await commentResume({ total: 150, pageSize: 50, failAt: 3 });
  assert.equal(r.calls1.length, 3);
  assert.equal(r.last.scrapedCount, 2, 'o histórico conta só os perfis consultados');
  assert.equal(r.vm2.isComplete, true);
  assert.equal(r.calls2.length, 148, 'sessão 2 não repete os 2 já consultados');
  assert.ok(!r.calls2.includes('user0') && !r.calls2.includes('user1'));
  assert.equal(r.stored.length, 150);
  assert.equal(new Set(r.stored.map((x) => x.userName)).size, 150, 'sem linhas duplicadas');
  assert.ok(r.stored.every((x) => x.detailLoaded), 'nenhum comentarista fica "Aguardando consulta"');
});

test('Comment: 429 já na 1ª consulta não faz a retomada pular comentaristas', async () => {
  const r = await commentResume({ total: 150, pageSize: 50, failAt: 1 });
  assert.equal(r.last.scrapedCount, 0);
  assert.equal(r.calls2.length, 150);
  assert.equal(r.stored.length, 150);
  assert.ok(r.stored.every((x) => x.detailLoaded));
});

async function commentResumeFromServer(w, total) {
  const users = commenters(total);
  const env = createEnv(EXT, { quiet: true, axiosGet: commentPages(users, 50) });
  const calls = [];
  env.setFetch(async (url) => { calls.push(nameOf(url)); return webProfile(users)(nameOf(url)); });
  env.fa20.d = async () => ({ id: 'HX', get: (k) => w[k] });
  const vm = env.instance({ type: '4', ins: 'POST', history: 'HX' });
  commentSetup(vm);
  vm.isPaused = false;
  vm.startWorking();
  await env.run(3000, () => vm.isComplete);
  await env.flush(30);
  return { calls, vm, stored: env.store.extract_list_HX || [] };
}

test('Comment: histórico de versão antiga sem linhas locais não pula comentaristas (contagem antiga não é usada)', async () => {
  // Server state left by PATCHED 13/14 after a 429 on the very first check: 50 "extracted", none stored.
  const r = await commentResumeFromServer({ token: 't', updateTimes: 2, scrapedCount: 50, cursorScrapedCount: 0, count: 0, lastCursor: '', customUserList: '' }, 50);
  assert.equal(r.calls.length, 50);
  assert.equal(r.stored.length, 50);
  assert.equal(r.vm.isComplete, true);
});

test('Comment: histórico PATCHED 15 retomado em outro computador usa a contagem do servidor', async () => {
  const r = await commentResumeFromServer({ token: 't', updateTimes: 2, scrapedCount: 2, cursorScrapedCount: 0, count: 0, lastCursor: '', customUserList: '',
    version: 'v2.5.1 · PATCHED 15 · Contato comercial com diagnóstico' }, 50);
  assert.equal(r.calls.length, 48);
  assert.ok(!r.calls.includes('user0') && !r.calls.includes('user1'));
});

test('Comment: o fim da lista de comentários não marca o histórico como concluído', async () => {
  const users = commenters(4);
  const env = createEnv(EXT, { quiet: true, axiosGet: commentPages(users, 50) });
  const calls = [];
  env.setFetch(async (url) => { calls.push(nameOf(url)); return calls.length >= 2 ? rate429() : webProfile(users)(nameOf(url)); });
  const vm = env.instance({ type: '4', ins: 'POST' });
  commentSetup(vm);
  vm.lastHistoryItem = { id: 'H9', token: 't', updateTimes: 0, scrapedCount: 0, cursorScrapedCount: 0, count: 0 };
  vm.isPaused = false;
  vm.startLoadAllData();
  await env.run(400, () => vm.isPaused);
  await env.flush(50);
  assert.ok(env.historyCalls.length > 0);
  assert.ok(env.historyCalls.every((p) => !p.isFromComplete), 'nenhuma atualização de histórico diz "concluído" antes das consultas');
});

test('Comment: aba de sessão (claim) abre 1 vez a cada 100 perfis processados, não a cada perfil', async () => {
  const users = commenters(100);
  const env = createEnv(EXT, { quiet: true, axiosGet: commentPages(users, 50) });
  env.setFetch(async (url) => webProfile(users, () => ({ is_professional_account: false, is_business_account: false }))(nameOf(url)));
  const vm = env.instance({});
  commentSetup(vm);
  vm.lastHistoryItem = { id: 'H6', token: 't', updateTimes: 0, scrapedCount: 0, cursorScrapedCount: 0, count: 0 };
  vm.isPaused = false;
  vm.startLoadAllData();
  await env.run(5000, () => vm.isComplete);
  await env.flush(30);
  assert.equal(vm.followList.filter((r) => r.detailLoaded).length, 100);
  assert.equal(env.tabsCreated.length, 1);
});

function followersVm(env, opts) {
  const vm = env.instance(opts.query || {});
  vm.type = 0; vm.ins = 'target'; vm.extractionType = 'followers';
  vm.configs = { objectId: 'cfg', apiUserForFollowers: followersCfg, apiUserForFollowing: followersCfg, ApiUserInfoDetail: detailCfg, CustomHeaders: {}, ClaimSessionStorageKey: 'k' };
  vm.insUser = { id: 'T', count: opts.count || 1, is_private: false };
  vm.subscription = { isPro: true };
  vm.getInsClaim = async () => {}; vm.getUserInfo = async () => ({ id: 'me' });
  vm.getInsUserStatus = async () => { vm.insLogged = true; }; vm.getInsCsrfToken = async () => {};
  vm.loadProfileInfo = async () => { vm.insUser = { id: 'T', count: opts.count || 1, is_private: false }; };
  return vm;
}

test('Filtro DJ ligado no meio da extração: salva tudo, conclui e conta todos no histórico', async () => {
  const N = 20;
  const users = Array.from({ length: N }, (_, i) => ({ id: String(500 + i), username: 'f' + i, full_name: 'F' + i, profile_pic_url: 'p' }));
  const env = createEnv(EXT, { quiet: true, axiosGet: (url) => {
    if (url.indexOf('/followers/') >= 0) return Promise.resolve({ data: { status: 'ok', users, next_max_id: '', has_more: false } });
    const id = url.split('/users/')[1].split('/')[0], i = users.findIndex((u) => u.id === id), dj = i % 2 === 0;
    return Promise.resolve({ data: { status: 'ok', user: { pk: id, username: users[i].username, full_name: 'F', follower_count: 100, following_count: 10, media_count: 3,
      account_type: 2, is_business: true, public_email: 'biz' + i + '@shop.com', biography: dj ? 'DJ / music producer, techno label, bookings' : 'shoes store', external_url: dj ? 'https://soundcloud.com/x' : '' } } });
  } });
  const vm = followersVm(env, { count: N });
  vm.lastHistoryItem = { id: 'H2', token: 't', updateTimes: 0, scrapedCount: 0, cursorScrapedCount: 0, count: 0 };
  vm.isPaused = false;
  vm.startLoadAllData();
  await env.run(2000, () => vm.followList.filter((r) => r.loaded).length >= 6);
  vm.djFilterEnabled = true; vm.djMinScore = 60;
  await env.run(5000, () => vm.isComplete);
  await env.flush(50);
  const last = env.historyCalls[env.historyCalls.length - 1] || {};
  assert.equal(vm.userList.length, 10, 'o filtro continua valendo para a tabela e a exportação');
  assert.equal((env.store.extract_list_H2 || []).length, N, 'o histórico local guarda todos os perfis');
  assert.equal(vm.isComplete, true);
  assert.equal(last.isFromComplete, true);
  assert.equal(last.scrapedCount, N);
  assert.equal(last.count, N);
});

test('Histórico antigo com e-mail da bio: retomada limpa as linhas e o popup não exporta esse e-mail', async () => {
  const legacy = [
    { id: 1, userId: '901', userName: 'legacy_a', fullName: 'A', avatar: '', followers: 10, following: 1, post: 1, email: 'joao.bio@gmail.com', phone: '', bio: 'Contato: joao.bio@gmail.com', loaded: true },
    { id: 2, userId: '902', userName: 'legacy_b', fullName: 'B', avatar: '', followers: 10, following: 1, post: 1, email: 'site@from-link.com', emailSource: 'biography', contactParserVersion: 12, phone: '', bio: '', loaded: true },
    { id: 3, userId: '904', userName: 'kept_d', fullName: 'D', avatar: '', followers: 10, following: 1, post: 1, email: 'contato@loja-d.com', emailSource: 'public_email', emailKind: 'commercial_contact', contactParserVersion: 14, emailStatus: 'found', phone: '', bio: '', loaded: true, detailLoaded: true },
  ];
  const users = [{ id: '903', username: 'new_c', full_name: 'C', profile_pic_url: '' }];
  const env = createEnv(EXT, { quiet: true, store: { extract_list_H3: legacy, localStorageExtractKeys: [{ key: 'extract_list_H3', date: Date.UTC(2026, 3, 1) }] }, axiosGet: (url) => {
    if (url.indexOf('/followers/') >= 0) return Promise.resolve({ data: { status: 'ok', users: users.concat([{ id: '901', username: 'legacy_a', full_name: 'A', profile_pic_url: '' }]), next_max_id: '', has_more: false } });
    return Promise.resolve({ data: { status: 'ok', user: { pk: '903', username: 'new_c', account_type: 1, public_email: '', biography: 'me: c.personal@gmail.com' } } });
  } });
  const w = { id: 'H3', get: (k) => ({ token: 't', updateTimes: 1, scrapedCount: 3, cursorScrapedCount: 3, count: 3, lastCursor: '', customUserList: '' }[k]) };
  env.fa20.d = async () => w;
  const vm = followersVm(env, { query: { type: '0', ins: 'target', history: 'H3' }, count: 4 });
  vm.isPaused = false;
  vm.startWorking();
  await env.run(2000, () => vm.isComplete);
  await env.flush(50);
  const stored = env.store.extract_list_H3;
  assert.deepEqual(stored.map((r) => [r.userName, r.email]), [['legacy_a', ''], ['legacy_b', ''], ['kept_d', 'contato@loja-d.com'], ['new_c', '']]);
  assert.ok(!env.axiosCalls.some((u) => /\/users\/901\//.test(u)), 'perfil já salvo não é consultado de novo');
  const last = env.historyCalls[env.historyCalls.length - 1];
  assert.equal(last.count, 1, 'contagem de e-mails = só o contato comercial guardado');
  const popup = loadPopup(EXT);
  popup.options.methods.cleanHistoryRows = popup.options.methods.cleanHistoryRows || ((rows) => rows);
  const ctx = Object.assign({}, popup.options.methods);
  ctx.handleDownload('email', legacy, 'csv');
  ctx.handleDownload('all', legacy, 'xlsx');
  const csv = popup.exportsOut[0], xl = popup.exportsOut[1];
  assert.deepEqual(csv.rows.map((r) => [r['User Name'], r['E-mail comercial']]), [['kept_d', 'contato@loja-d.com']]);
  const labels = xl.sheets[0].columns.map((c) => c.label);
  assert.ok(labels.includes('E-mail comercial') && labels.includes('Status do e-mail'));
});

test('Perfil renomeado entre a lista e o detalhe (mesmo id) mantém o e-mail comercial', async () => {
  const env = createEnv(EXT, { quiet: true, axiosGet: (url) => {
    if (url.indexOf('/followers/') >= 0) return Promise.resolve({ data: { status: 'ok', users: [{ id: '77', username: 'old_name', full_name: 'Loja', profile_pic_url: '' }], next_max_id: '', has_more: false } });
    return Promise.resolve({ data: { status: 'ok', user: { pk: 77, username: 'new_name', full_name: 'Loja', account_type: 2, is_business: true, public_email: 'vendas@loja.com.br', follower_count: 900 } } });
  } });
  const vm = followersVm(env, { count: 1 });
  vm.lastHistoryItem = { id: 'H5', token: 't', updateTimes: 0, scrapedCount: 0, cursorScrapedCount: 0, count: 0 };
  vm.isPaused = false;
  vm.startLoadAllData();
  await env.run(500, () => vm.isComplete);
  await env.flush(30);
  const r = vm.userList[0];
  assert.equal(r.userName, 'new_name');
  assert.equal(r.email, 'vendas@loja.com.br');
  assert.equal(r.emailStatus, 'found');
});

test('Perfil 404 e erro persistente fora do Comment: registrados, sem travar a fila', async () => {
  const users = [{ id: '61', username: 'a', full_name: 'A', profile_pic_url: '' }, { id: '62', username: 'b', full_name: 'B', profile_pic_url: '' },
    { id: '63', username: 'c', full_name: 'C', profile_pic_url: '' }];
  const hits = {};
  const env = createEnv(EXT, { quiet: true, axiosGet: (url) => {
    if (url.indexOf('/followers/') >= 0) return Promise.resolve({ data: { status: 'ok', users, next_max_id: '', has_more: false } });
    const id = url.split('/users/')[1].split('/')[0];
    hits[id] = (hits[id] || 0) + 1;
    if (id === '61') return Promise.reject(Object.assign(new Error('Request failed with status code 404'), { response: { status: 404, data: { status: 'fail' } } }));
    if (id === '62') return Promise.reject(Object.assign(new Error('Request failed with status code 500'), { response: { status: 500, data: {} } }));
    return Promise.resolve({ data: { status: 'ok', user: { pk: id, username: 'c', account_type: 2, is_business: true, public_email: 'c@loja.com' } } });
  } });
  const vm = followersVm(env, { count: 3 });
  vm.lastHistoryItem = { id: 'H8', token: 't', updateTimes: 0, scrapedCount: 0, cursorScrapedCount: 0, count: 0 };
  vm.isPaused = false;
  vm.startLoadAllData();
  await env.run(3000, () => vm.isComplete);
  await env.flush(30);
  assert.equal(vm.isComplete, true);
  assert.equal(hits['61'], 1, '404 não é repetido');
  assert.equal(hits['62'], 2, 'erro persistente: 1 nova tentativa');
  const byId = Object.fromEntries(vm.followList.map((r) => [r.userId, r]));
  assert.equal(byId['61'].emailStatus, 'profile_unavailable');
  assert.equal(byId['62'].contactFailure.code, 'request');
  assert.equal(byId['63'].email, 'c@loja.com');
  assert.equal((env.store.extract_list_H8 || []).length, 3);
});

test('Índice do histórico com 2 dashboards abertos: nenhum apaga a data mais nova do outro', async () => {
  const day = 864e5, now = Date.UTC(2026, 9, 5, 12);
  const store = { localStorageExtractKeys: [{ key: 'extract_list_OLD', date: now - 185 * day }], extract_list_OLD: [{ userName: 'kept', loaded: true }] };
  const env = createEnv(EXT, { quiet: true, store, now });
  const A = env.instance({}), B = env.instance({});
  for (const vm of [A, B]) vm.localStorageExtractKeys = JSON.parse(JSON.stringify(store.localStorageExtractKeys));
  A.lastHistoryItem = Object.assign({}, A.lastHistoryItem, { id: 'OLD' });
  B.lastHistoryItem = Object.assign({}, B.lastHistoryItem, { id: 'NEWB' });
  A.followList = [{ id: 1, userName: 'a1', email: '', phone: '', loaded: true }];
  B.followList = [{ id: 1, userName: 'b1', email: '', phone: '', loaded: true }];
  await A.saveExtractRows(); await env.flush();
  await B.saveExtractRows(); await env.flush();
  const index = Object.fromEntries(env.store.localStorageExtractKeys.map((k) => [k.key, Math.round((now - k.date) / day)]));
  assert.deepEqual(index, { extract_list_OLD: 0, extract_list_NEWB: 0 });
});

test('Exportações: mesmas colunas em todos os modos; abas de diagnóstico só no Comment', async () => {
  const { modules } = loadChunks(EXT);
  const req = makeRequire(modules);
  const jsonAsXlsx = req('5e85'), XLSX = req('5169');
  const env = createEnv(EXT, { quiet: true });
  const rows = [
    { id: 1, userId: '1', userName: 'found', email: 'v@loja.com', emailSource: 'business_email', emailKind: 'commercial_contact', contactParserVersion: 14, emailStatus: 'found', phone: '+5511912345678', loaded: true, detailLoaded: true },
    { id: 2, userId: '2', userName: 'pending', email: '', phone: '', loaded: true, detailLoaded: false, contactFailure: { code: 'rate_limit', status: 429 } },
  ];
  for (const type of [0, 1, 2, 3, 4, 5, 6]) {
    const vm = env.instance({});
    vm.type = type; vm.followList = rows.map((r) => Object.assign({}, r));
    env.exports.length = 0;
    vm.handleDownload('all', vm.userList, 'xlsx');
    const wb = XLSX.read(jsonAsXlsx(env.exports[0].sheets, { fileName: 'x', writeOptions: { type: 'buffer' } }), { type: 'binary' });
    assert.deepEqual(plain(wb.SheetNames), type === 4 ? ['all', 'Diagnostico contato', 'Respostas reais'] : ['all']);
    const first = XLSX.utils.sheet_to_json(wb.Sheets.all, { header: 1 });
    assert.equal(first[0][6], 'E-mail comercial');
    assert.deepEqual(plain(first.slice(1).map((r) => r[7])), ['Contato público do Instagram', 'Falha de acesso: limite do Instagram (HTTP 429)']);
  }
});
