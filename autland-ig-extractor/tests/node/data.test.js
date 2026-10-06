/* Data, history and export tests (PATCHED 15.4): the real dashboard and popup components run in Node with
 * stubbed browser APIs, a virtual clock and SIMULATED Instagram responses (nothing leaves the
 * process). Run: EXT_DIR=/path/to/extension [OLD_EXT_DIR=/path/to/15.3] node --test tests/node/data.test.js */
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

const fs = require('fs');
const fixture = (name) => JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'fixtures', name), 'utf8'));
const OLD_EXT = process.env.OLD_EXT_DIR ? path.resolve(process.env.OLD_EXT_DIR) : '';

// ---- Comment mode: every profile answer comes from /api/v1/users/{id}/info/ (axios, the shared request) ----
const idOf = (url) => (String(url).match(/\/users\/(\d+)\/info\//) || [])[1];
// The real (anonymised) user object of that route, made to belong to one commenter.
const infoUser = (u, extra) => {
  const user = fixture('info-business.json').user;
  return Object.assign(user, { pk: Number(u.pk), id: String(u.pk), pk_id: String(u.pk), username: u.username, public_email: '', business_contact_method: 'CALL' }, extra || {});
};
const infoOk = (u, extra) => Promise.resolve({ status: 200, headers: {}, data: { user: infoUser(u, extra), status: 'ok' } });
const httpError = (status, data, headers) => Promise.reject(Object.assign(new Error('Request failed with status code ' + status), { response: { status, data: data || {}, headers: headers || {} } }));
const http429 = (retryAfter) => httpError(429, {}, retryAfter ? { 'retry-after': String(retryAfter) } : {});
function commentEnv(users, o) {
  o = o || {};
  const pages = commentPages(users, o.pageSize || 50);
  const calls = o.calls || [];
  const env = createEnv(EXT, { quiet: true, store: o.store, now: o.now, axiosGet: (url, cfg) => {
    if (url.indexOf('/comments/') >= 0) return o.pageHook ? o.pageHook(url, cfg, pages) : pages(url, cfg);
    const id = idOf(url);
    if (!id) return Promise.reject(new Error('unexpected url ' + url));
    calls.push(id);
    (o.cfgs || []).push(cfg);
    const failed = o.fail && o.fail(id, calls.length);
    if (failed) return failed;
    const u = users.find((x) => x.pk === id) || { pk: id, username: 'x' + id };
    return infoOk(u, o.extra && o.extra(u));
  } });
  // The reader never calls fetch: any use is a defect.
  env.setFetch(async (url) => { throw new Error('fetch must not be used in Comment mode: ' + url); });
  env.calls = calls;
  return env;
}
function commentSetup(vm) {
  vm.type = 4; vm.ins = 'POST'; vm.extractionType = 'comment';
  vm.configs = { apiUserForComment: commentCfg, ApiUserInfoDetail: detailCfg, CustomHeaders: {}, objectId: 'cfg', ClaimSessionStorageKey: 'k' };
  vm.subscription = { isPro: true };
  vm.getInsClaim = async () => {}; vm.getUserInfo = async () => ({ id: 'me' });
  vm.getInsUserStatus = async () => { vm.insLogged = true; }; vm.getInsCsrfToken = async () => {};
}
function commentVm(env, id, query) {
  const vm = env.instance(query || { type: '4', ins: 'POST' });
  commentSetup(vm);
  vm.lastHistoryItem = { id, token: 't', updateTimes: 0, scrapedCount: 0, cursorScrapedCount: 0, count: 0 };
  vm.isPaused = false;
  return vm;
}
const pageUrls = (env) => env.axiosCalls.filter((u) => /\/comments\//.test(u));
const infoUrls = (env) => env.axiosCalls.filter((u) => /\/info\//.test(u));
// The history item as the server holds it after the last update of a session.
const savedHistory = (env, id) => {
  const last = env.historyCalls[env.historyCalls.length - 1] || {};
  return { id, get: (k) => ({ token: 't', updateTimes: 1, scrapedCount: last.scrapedCount || 0, cursorScrapedCount: last.cursorScrapedCount || 0,
    count: last.count || 0, lastCursor: last.lastCursor || '', customUserList: '', version: 'v2.5.1 · PATCHED 15.4' }[k]) };
};
async function reopen(env1, users, id, o) {
  const env2 = commentEnv(users, Object.assign({ store: env1.store, now: env1.now() + 2 * 3600e3 }, o || {}));
  env2.fa20.d = async () => savedHistory(env1, id);
  const vm2 = env2.instance({ type: '4', ins: 'POST', history: id });
  commentSetup(vm2);
  vm2.isPaused = false;
  vm2.startWorking();
  return { env2, vm2 };
}

/* ---------- PATCHED 15.4: Comment mode asks /users/{id}/info/, once per user id ---------- */
test('Comment 15.4: a rota é /users/{id}/info/ — 1 consulta por usuário, nenhuma web_profile_info, e-mail só do public_email', async () => {
  const users = commenters(6);
  const cfgs = [];
  const env = commentEnv(users, { pageSize: 50, cfgs, extra: (u) => (u.username === 'user2' ? { public_email: 'vendas2@loja.com' } : { biography: 'fale comigo: bio' + u.username + '@bio.com' }) });
  const vm = commentVm(env, 'H1');
  vm.startLoadAllData();
  await env.run(5000, () => vm.isComplete); await env.flush(30);
  assert.equal(vm.isComplete, true);
  const urls = infoUrls(env);
  assert.equal(urls.length, 6, 'uma consulta por comentarista');
  assert.deepEqual(urls.map(idOf).sort(), users.map((u) => u.pk).sort());
  assert.ok(!env.axiosCalls.some((u) => /web_profile_info/.test(u)), 'a rota web não é consultada no Comment');
  // a mesma chamada dos outros modos: cabeçalhos da sessão da extensão (o mesmo objeto) e credenciais
  assert.equal(cfgs.length, 6);
  assert.ok(cfgs.every((c) => c.withCredentials === true && c.headers === vm.configs.CustomHeaders), 'withCredentials e CustomHeaders da extensão');
  assert.equal(vm.emailList.length, 1); assert.equal(vm.emailList[0].email, 'vendas2@loja.com');
  const by = Object.fromEntries(vm.followList.map((r) => [r.userName, r]));
  assert.equal(by.user2.emailStatus, 'found'); assert.equal(P_state(by.user2), 'email_found');
  assert.ok(vm.followList.filter((r) => r.userName !== 'user2').every((r) => r.email === '' && P_state(r) === 'no_public_email'), 'e-mail da bio ignorado');
  assert.ok(vm.followList.every((r) => r.contactRoute === 'users_info' && r.contactParserVersion === 15));
  assert.equal(P_text(by.user2), 'E-mail comercial encontrado');
  assert.match(P_text(by.user0), /^Perfil não disponibiliza e-mail público/);
});
test('Comment 15.4: a 1ª resposta do dia mostra o quadro do parser (rota, HTTP, campo, decisão) sem expor o e-mail inteiro', async () => {
  const users = commenters(3);
  const env = commentEnv(users, { extra: (u) => (u.username === 'user0' ? { public_email: 'primeiro@loja.com' } : {}) });
  const vm = commentVm(env, 'HK');
  vm.startLoadAllData();
  await env.run(5000, () => vm.isComplete); await env.flush(30);
  const cards = env.notifications.filter((n) => /Validação de 1 consulta/.test(n.message || ''));
  assert.equal(cards.length, 1, 'um quadro só, na 1ª resposta real da execução');
  const card = cards[0].message;
  assert.match(card, /@user0/); assert.match(card, /GET \/api\/v1\/users\/\{id\}\/info\//); assert.match(card, /HTTP 200 · Retry-After: não se aplica/);
  assert.match(card, /public_email: texto · business_email: ausente/); assert.match(card, /Caminho do campo: user\.public_email/);
  assert.match(card, /Decisão do parser: email_found \(public_email\) — E-mail comercial encontrado/);
  assert.match(card, /E-mail \(mascarado\): p\*\*\*@loja\.com/);
  assert.ok(!/primeiro@loja\.com|cookie|csrf|token/i.test(card));
});
test('Comment 15.4: validar 1 perfil pendente faz 1 consulta, mostra o quadro e a fila depois reaproveita a resposta', async () => {
  const users = commenters(6);
  const env = commentEnv(users, { extra: (u) => (u.username === 'user0' ? { public_email: 'valida@loja.com' } : {}) });
  const vm = commentVm(env, 'HP');
  vm.startLoadAllData();
  await env.run(3000, () => vm.followList.length === 6 && !vm.pageInfo.has_next_page); await env.flush(20);
  vm.manualPause = true; vm.pauseExtraction(); await env.flush(20);
  const before = env.calls.length;
  assert.equal(vm.pendingContactCount, 6);
  vm.handleContactProbe(); await env.flush(60);
  assert.equal(env.calls.length - before, 1, 'uma única consulta');
  assert.equal(env.calls[before], '1000', 'o 1º perfil pendente');
  const card = env.notifications.filter((n) => /Validação de 1 consulta/.test(n.message || '')).pop().message;
  assert.match(card, /HTTP 200/); assert.match(card, /Decisão do parser: email_found/);
  assert.equal(vm.followList[0].detailLoaded, false, 'a linha só é preenchida quando a fila chega nela');
  vm.manualPause = false; vm.resumeExtraction();
  await env.run(6000, () => vm.isComplete); await env.flush(30);
  assert.deepEqual(env.calls.slice().sort(), users.map((u) => u.pk).sort(), 'o perfil validado não foi consultado de novo');
  assert.equal(vm.followList[0].email, 'valida@loja.com');
});
test('Comment 15.4: se a validação de 1 perfil recebe 429, nenhuma outra consulta acontece', async () => {
  const users = commenters(5);
  const env = commentEnv(users, { fail: () => http429(600) });
  const vm = commentVm(env, 'HV');
  vm.startLoadAllData();
  await env.run(3000, () => vm.followList.length === 5 && !vm.pageInfo.has_next_page); await env.flush(20);
  vm.manualPause = true; vm.pauseExtraction(); await env.flush(20);
  vm.handleContactProbe(); await env.flush(80);
  assert.equal(env.calls.length, 1);
  assert.ok(env.store.ig_contact_cooldown_until >= env.now() + 590000, 'Retry-After de 600 s salvo');
  vm.handleContactProbe(); vm.manualPause = false; vm.resumeExtraction(); await env.flush(80);
  await env.run(400, () => false); await env.flush(30);
  assert.equal(env.calls.length, 1, 'nem pelo botão, nem pela fila, nem sozinho');
  assert.ok(vm.followList.every((r) => !r.detailLoaded));
});

const P_of = () => require(path.join(EXT, 'public-contact-parser.js'));
const P_state = (row) => P_of().contactState(row);
const P_text = (row) => P_of().emailStatusText(row);

test('Comment 15.4: a lista inteira é lida e salva antes da 1ª consulta; 429 na 1ª pausa com ZERO consultas a mais e preserva os comentaristas', async () => {
  const users = commenters(150);
  const order = [];
  const env = commentEnv(users, { pageSize: 50, fail: (id, n) => (n === 1 ? http429() : null),
    pageHook: (url, cfg, pages) => { order.push('page'); return pages(url, cfg); } });
  const origGet = env.sandbox;
  let savedAtFirstCheck = -1;
  const vm = commentVm(env, 'HL');
  // note the saved rows at the moment the first profile request leaves
  const realCalls = env.calls;
  const push = realCalls.push.bind(realCalls);
  realCalls.push = (id) => { order.push('profile'); if (savedAtFirstCheck < 0) savedAtFirstCheck = (env.store.extract_list_HL || []).length; return push(id); };
  vm.startLoadAllData();
  await env.run(3000, () => vm.isPaused); await env.flush(50);
  assert.deepEqual(order, ['page', 'page', 'page', 'profile'], 'as 3 páginas vêm antes da 1ª consulta; o 429 encerra com 1 consulta');
  assert.equal(savedAtFirstCheck, 150, 'os comentaristas já estão salvos quando a 1ª consulta sai');
  assert.equal(env.calls.length, 1);
  assert.equal((env.store.extract_list_HL || []).length, 150);
  assert.equal(vm.userList.length, 150, 'tabela e exportação mantêm os 150 comentaristas');
  assert.equal(P_state(vm.followList[0]), 'rate_limited', 'a linha mostra pausa, não "sem e-mail"');
  assert.equal(P_text(vm.followList[0]), 'Consulta pausada pelo Instagram · HTTP 429');
  assert.ok(vm.followList.slice(1).every((r) => P_state(r) === 'pending'));
  assert.ok(env.store.ig_contact_cooldown_until > env.now(), 'pausa do 429 salva');
  await env.run(200, () => false); await env.flush(30);
  assert.equal(env.calls.length, 1, 'nada é repetido durante a pausa');
  // Continue durante a pausa não consulta nada; depois do horário a fila segue do perfil que recebeu o 429
  vm.resumeExtraction(); await env.run(50, () => false); await env.flush(30);
  assert.equal(env.calls.length, 1, 'Continue antes do horário não consulta');
  env.advance(3601 * 1000); vm.retryAfterUntil = null;
  vm.resumeExtraction();
  await env.run(40000, () => vm.isComplete); await env.flush(60);
  assert.equal(vm.isComplete, true);
  assert.equal(env.calls[1], '1000', 'a primeira consulta que falhou é a primeira refeita');
  assert.equal(env.calls.length, 151); assert.equal(new Set(env.calls).size, 150);
});
test('Comment 15.4: falha de acesso (403, login, HTML, rede) pausa, a linha mostra o estado certo e continuar tenta de novo o mesmo perfil', async () => {
  const cases = [
    [() => httpError(403, { message: 'login_required', status: 'fail' }), 'login_required', 'Sessão precisa ser verificada · HTTP 403'],
    [() => httpError(403, { message: 'Forbidden' }), 'access_denied', 'Acesso negado pelo Instagram · HTTP 403'],
    [() => Promise.resolve({ status: 200, headers: {}, data: '<!DOCTYPE html><html>Login</html>' }), 'login_required', 'Sessão precisa ser verificada · HTTP 200'],
    [() => Promise.reject(new Error('Network Error')), 'temporary_error', 'Falha temporária na consulta'],
    [() => httpError(503, {}), 'temporary_error', 'Falha temporária na consulta · HTTP 503'],
  ];
  for (const [failure, state, text] of cases) {
    const users = commenters(3);
    const env = commentEnv(users, { fail: (id, n) => (n === 2 ? failure() : null), extra: (u) => (u.username === 'user1' ? { public_email: 'quase@loja.com' } : {}) });
    const vm = commentVm(env, 'HF');
    vm.startLoadAllData();
    await env.run(3000, () => vm.isPaused); await env.flush(30);
    assert.equal(env.calls.length, 2, state + ': pára na falha, sem nova tentativa');
    const failed = vm.followList[1];
    assert.equal(failed.detailLoaded, false); assert.equal(P_state(failed), state); assert.equal(P_text(failed), text);
    assert.equal(vm.followList[0].detailLoaded, true, 'o resultado anterior fica');
    assert.equal(env.store.ig_contact_cooldown_until, undefined, 'só o 429 cria pausa salva');
    await env.run(300, () => false); await env.flush(20);
    assert.equal(env.calls.length, 2, 'nenhuma repetição automática');
    assert.ok(!vm.followList.some((r) => r.detailLoaded && P_state(r) === 'no_public_email' && r.userName === 'user1'), 'falha não vira "sem e-mail"');
    // o usuário resolve (sessão, rede) e clica em Continue: a consulta que falhou é refeita e a fila termina
    vm.resumeExtraction();
    await env.run(6000, () => vm.isComplete); await env.flush(30);
    assert.equal(vm.isComplete, true, state + ': conclui depois de continuar');
    assert.deepEqual(env.calls, ['1000', '1001', '1001', '1002'], state + ': só o perfil que falhou foi refeito');
    assert.equal(vm.followList[1].email, 'quase@loja.com');
  }
});
test('Comment 15.4: perfis sem e-mail, CALL/TEXT e respostas vazias seguidas não interrompem a fila', async () => {
  const users = commenters(12);
  const extra = (u) => ({ business_contact_method: Number(u.pk) % 2 ? 'CALL' : 'TEXT', public_email: '', business_email: null });
  const env = commentEnv(users, { extra });
  const vm = commentVm(env, 'HC');
  vm.startLoadAllData();
  await env.run(8000, () => vm.isComplete); await env.flush(30);
  assert.equal(vm.isComplete, true, 'a extração conclui');
  assert.equal(env.calls.length, 12, 'todos consultados, uma vez cada');
  assert.ok(vm.followList.every((r) => P_state(r) === 'no_public_email' && r.emailStatus === 'empty'));
  assert.equal(vm.emailList.length, 0);
});
test('Comment 15.4: comentário sem user.pk usa o id de outro campo; sem nenhum id não consulta (nem por outra rota)', async () => {
  const users = commenters(4);
  const env = commentEnv(users, { pageHook: (url, cfg, pages) => pages(url, cfg).then((res) => {
    const comments = res.data.comments.map((c, i) => (i === 1 ? { user: { pk: '', pk_id: c.user.pk, username: c.user.username, profile_pic_url: 'p' } }
      : i === 2 ? { user: { pk: '', username: 'sem_id_nenhum', profile_pic_url: 'p' } } : c));
    return { data: Object.assign({}, res.data, { comments }) };
  }) });
  const vm = commentVm(env, 'HI');
  vm.startLoadAllData();
  await env.run(5000, () => vm.isComplete); await env.flush(30);
  assert.equal(vm.isComplete, true);
  assert.deepEqual(env.calls.slice().sort(), ['1000', '1001', '1003'], 'o id do 2º veio de user.pk_id; o 3º não tem id e não foi consultado');
  const none = vm.followList.find((r) => r.userName === 'sem_id_nenhum');
  assert.equal(none.userId, 'u:sem_id_nenhum'); assert.equal(none.emailStatus, 'no_user_id'); assert.equal(none.detailLoaded, true);
  assert.equal(P_state(none), 'profile_unavailable'); assert.match(P_text(none), /Sem ID do perfil/);
  assert.ok(!env.axiosCalls.some((u) => /web_profile_info|usernameinfo/.test(u)));
});
test('Comment 15.4: perfil já consultado em outra extração não é consultado de novo (cache por user id) e não espera o intervalo', async () => {
  const all = commenters(6);
  const env1 = commentEnv(all.slice(0, 4), { extra: (u) => (u.username === 'user2' ? { public_email: 'vendas2@loja.com' } : {}) });
  const vm1 = commentVm(env1, 'HA');
  vm1.startLoadAllData();
  await env1.run(3000, () => vm1.isComplete); await env1.flush(30);
  assert.deepEqual(env1.calls, ['1000', '1001', '1002', '1003']);
  // Segundo post, outro dashboard, mesmo armazenamento: user2 e user3 comentaram nos dois.
  const env2 = commentEnv(all, { store: env1.store, now: env1.now() + 3600e3, extra: (u) => (u.username === 'user2' ? { public_email: 'vendas2@loja.com' } : {}),
    pageHook: (url, cfg, pages) => commentPages(all.slice(2), 50)(url, cfg) });
  const vm2 = commentVm(env2, 'HB');
  const t0 = env2.now();
  vm2.startLoadAllData();
  await env2.run(3000, () => vm2.isComplete); await env2.flush(30);
  assert.deepEqual(env2.calls, ['1004', '1005'], 'user2 e user3 vêm do cache, sem nova consulta');
  const by = Object.fromEntries(vm2.followList.map((r) => [r.userName, r]));
  assert.equal(by.user2.email, 'vendas2@loja.com'); assert.equal(by.user2.emailStatus, 'found');
  assert.ok(vm2.followList.every((r) => r.detailLoaded));
  assert.ok(env2.now() - t0 < 4 * 40000, 'as linhas do cache não esperam 15–30 s cada');
});
test('Comment 15.4: fechar e reabrir continua exatamente do ponto salvo (fila e cursor persistentes, nenhuma página relida)', async () => {
  const users = commenters(60);
  const env1 = commentEnv(users, { pageSize: 20, fail: (id, n) => (n === 5 ? http429() : null) });
  const vm1 = commentVm(env1, 'HQ');
  vm1.startLoadAllData();
  await env1.run(5000, () => vm1.isPaused); await env1.flush(50);
  assert.equal(env1.calls.length, 5, '4 respondidas + o 429');
  assert.equal(pageUrls(env1).length, 3);
  assert.equal(env1.store.extract_list_HQ.length, 60);
  const q = env1.store.extract_queue_HQ;
  assert.equal(q.v, 154); assert.equal(q.hasNext, false); assert.equal(q.count, 60);
  assert.deepEqual(env1.store.extract_list_HQ.filter((r) => r.detailLoaded).map((r) => r.userId), ['1000', '1001', '1002', '1003']);
  // Reabre depois da pausa (a extensão foi fechada/atualizada; só o armazenamento ficou).
  const { env2, vm2 } = await reopen(env1, users, 'HQ', { pageSize: 20 });
  await env2.run(9000, () => vm2.isComplete); await env2.flush(50);
  assert.equal(vm2.isComplete, true);
  assert.equal(pageUrls(env2).length, 0, 'a lista estava completa: nenhuma página é lida de novo');
  assert.deepEqual(env2.calls, users.slice(4).map((u) => u.pk), 'consulta só os 56 pendentes, a partir do que falhou');
  const stored = env2.store.extract_list_HQ;
  assert.equal(stored.length, 60); assert.equal(new Set(stored.map((r) => r.userId)).size, 60);
  assert.ok(stored.every((r) => r.detailLoaded), 'nenhum fica "Aguardando consulta"');
});
test('Comment 15.4: lista interrompida no meio continua da página salva, sem reler as anteriores e sem perder comentaristas', async () => {
  const users = commenters(160);
  const env1 = commentEnv(users, { pageSize: 20, pageHook: (url, cfg, pages) => (/min_id=c3/.test(decodeURIComponent(url)) ? httpError(403, { message: 'login_required' }) : pages(url, cfg)) });
  const vm1 = commentVm(env1, 'HM');
  vm1.startLoadAllData();
  await env1.run(5000, () => vm1.isPaused); await env1.flush(50);
  assert.equal(env1.calls.length, 0, 'lista incompleta: nenhuma consulta de e-mail');
  assert.equal(env1.store.extract_list_HM.length, 60, 'páginas 1 a 3 salvas');
  assert.equal(env1.store.extract_queue_HM.cursor, 'c3'); assert.equal(env1.store.extract_queue_HM.hasNext, true);
  const { env2, vm2 } = await reopen(env1, users, 'HM', { pageSize: 20 });
  await env2.run(20000, () => vm2.isComplete); await env2.flush(50);
  assert.equal(vm2.isComplete, true);
  const cursors = pageUrls(env2).map((u) => decodeURIComponent(u.split('min_id=')[1] || ''));
  assert.deepEqual(cursors, ['c3', 'c4', 'c5', 'c6', 'c7'], 'recomeça na página salva');
  assert.equal(env2.calls.length, 160); assert.equal(new Set(env2.calls).size, 160, 'uma consulta por usuário, nenhuma repetida');
  const stored = env2.store.extract_list_HM;
  assert.equal(stored.length, 160); assert.equal(new Set(stored.map((r) => r.userId)).size, 160); assert.ok(stored.every((r) => r.detailLoaded));
});
test('Comment 15.4: centenas de comentaristas — lista completa sem perder o cursor, 1 consulta por perfil, tudo salvo', async () => {
  const users = commenters(320);
  const env = commentEnv(users, { pageSize: 16, extra: (u) => (Number(u.pk) % 40 === 0 ? { public_email: 'v' + u.pk + '@loja.com' } : {}) });
  const vm = commentVm(env, 'H320');
  vm.startLoadAllData();
  await env.run(60000, () => vm.isComplete); await env.flush(60);
  assert.equal(vm.isComplete, true);
  const cursors = pageUrls(env).map((u) => decodeURIComponent(u.split('min_id=')[1] || ''));
  assert.deepEqual(cursors, ['', ...Array.from({ length: 19 }, (_, i) => 'c' + (i + 1))], '20 páginas, cada cursor uma vez, em ordem');
  assert.equal(env.calls.length, 320); assert.equal(new Set(env.calls).size, 320);
  const stored = env.store.extract_list_H320;
  assert.equal(stored.length, 320); assert.equal(new Set(stored.map((r) => r.userId)).size, 320); assert.ok(stored.every((r) => r.detailLoaded));
  assert.equal(stored.filter((r) => r.email).length, 8);
  assert.equal(env.store.extract_queue_H320.hasNext, false); assert.equal(env.store.extract_queue_H320.cursor, '');
});
test('Comment 15.4: comentaristas apagados (404) são resultado da linha: 3 seguidos não pausam; 10 seguidos pausam para conferir a sessão', async () => {
  const users = commenters(14);
  const gone = (id, n) => (n <= 3 || (n >= 5 && n <= 14) ? httpError(404, { message: 'User not found', status: 'fail' }) : null);
  const env = commentEnv(users, { fail: gone });
  const vm = commentVm(env, 'HG');
  vm.startLoadAllData();
  await env.run(8000, () => vm.isPaused); await env.flush(30);
  // calls 1-3 are 404 (no pause), call 4 answers, calls 5-14 are 404: the 10th in a row pauses
  assert.equal(env.calls.length, 14, 'as 3 primeiras não pausaram; a 10ª seguida pausou');
  assert.ok(vm.followList.slice(0, 3).every((r) => r.detailLoaded && P_state(r) === 'profile_unavailable' && P_text(r) === 'Perfil indisponível'));
  assert.equal(P_state(vm.followList[3]), 'no_public_email');
  assert.ok(env.notifications.some((n) => /Dez perfis seguidos/.test(n.message || '')), 'aviso explica a pausa');
  assert.equal(vm.followList.filter((r) => r.detailLoaded).length, 14);
});
test('Comment 15.4: retomar uma fila já concluída (sem pendentes nem páginas) conclui sem consultar nada', async () => {
  const users = commenters(3);
  const env1 = commentEnv(users, {});
  const vm1 = commentVm(env1, 'HD');
  vm1.startLoadAllData();
  await env1.run(3000, () => vm1.isComplete); await env1.flush(30);
  assert.equal(env1.calls.length, 3);
  const { env2, vm2 } = await reopen(env1, users, 'HD', {});
  await env2.run(500, () => vm2.isComplete); await env2.flush(30);
  assert.equal(vm2.isComplete, true);
  assert.equal(env2.calls.length, 0); assert.equal(pageUrls(env2).length, 0);
  assert.equal(env2.store.extract_list_HD.length, 3);
});
test('Comment 15.4: linhas de rotas antigas sem e-mail são consultadas de novo; as com e-mail ficam', async () => {
  const users = commenters(4);
  const legacy = [
    { id: 1, userId: '1000', userName: 'user0', loaded: true, detailLoaded: true, email: '', emailStatus: 'empty', contactParserVersion: 14, contactEndpoint: 'instagram_web_profile_info' },
    { id: 2, userId: '1001', userName: 'user1', loaded: true, detailLoaded: true, email: 'achado@loja.com', emailSource: 'business_email', emailKind: 'commercial_contact', emailStatus: 'found', contactParserVersion: 14, contactEndpoint: 'instagram_web_profile_info' },
    { id: 3, userId: '1002', userName: 'user2', loaded: true, detailLoaded: true, email: '', emailStatus: 'omitted', contactParserVersion: 13 },
  ];
  const env1 = createEnv(EXT, { quiet: true, store: { extract_list_HX: legacy, localStorageExtractKeys: [{ key: 'extract_list_HX', date: Date.UTC(2026, 9, 4) }] } });
  const env = commentEnv(users, { store: env1.store });
  env.fa20.d = async () => ({ id: 'HX', get: (k) => ({ token: 't', updateTimes: 1, scrapedCount: 3, cursorScrapedCount: 0, count: 1, lastCursor: '', customUserList: '', version: 'v2.5.1 · PATCHED 15.3' }[k]) });
  const vm = env.instance({ type: '4', ins: 'POST', history: 'HX' });
  commentSetup(vm); vm.isPaused = false; vm.startWorking();
  await env.run(5000, () => vm.isComplete); await env.flush(30);
  assert.equal(vm.isComplete, true);
  assert.deepEqual(env.calls.sort(), ['1000', '1002', '1003'], 'o e-mail achado (user1) não é consultado de novo; os "vazios" da rota antiga sim');
  const stored = Object.fromEntries(env.store.extract_list_HX.map((r) => [r.userName, r]));
  assert.equal(stored.user1.email, 'achado@loja.com');
  assert.ok(['user0', 'user2', 'user3'].every((n) => stored[n].contactRoute === 'users_info'));
});
test('Comment 15.4: histórico de versão antiga sem linhas locais não pula comentaristas (contagem antiga não é usada)', async () => {
  const users = commenters(50);
  const env = commentEnv(users);
  env.fa20.d = async () => ({ id: 'HY', get: (k) => ({ token: 't', updateTimes: 2, scrapedCount: 50, cursorScrapedCount: 0, count: 0, lastCursor: '', customUserList: '' }[k]) });
  const vm = env.instance({ type: '4', ins: 'POST', history: 'HY' });
  commentSetup(vm); vm.isPaused = false; vm.startWorking();
  await env.run(8000, () => vm.isComplete); await env.flush(30);
  assert.equal(env.calls.length, 50); assert.equal((env.store.extract_list_HY || []).length, 50); assert.equal(vm.isComplete, true);
});
test('Comment 15.4: histórico 15.x retomado em outro computador usa a contagem do servidor', async () => {
  const users = commenters(50);
  const env = commentEnv(users);
  env.fa20.d = async () => ({ id: 'HZ', get: (k) => ({ token: 't', updateTimes: 2, scrapedCount: 2, cursorScrapedCount: 0, count: 0, lastCursor: '', customUserList: '', version: 'v2.5.1 · PATCHED 15 · Contato comercial com diagnóstico' }[k]) });
  const vm = env.instance({ type: '4', ins: 'POST', history: 'HZ' });
  commentSetup(vm); vm.isPaused = false; vm.startWorking();
  await env.run(8000, () => vm.isComplete); await env.flush(30);
  assert.equal(env.calls.length, 48); assert.ok(!env.calls.includes('1000') && !env.calls.includes('1001'));
});
test('Comment 15.4: o fim da lista de comentários não marca o histórico como concluído antes das consultas', async () => {
  const users = commenters(4);
  const env = commentEnv(users, { fail: (id, n) => (n >= 2 ? http429() : null) });
  const vm = commentVm(env, 'H9');
  vm.startLoadAllData();
  await env.run(400, () => vm.isPaused); await env.flush(50);
  assert.ok(env.historyCalls.length > 0);
  assert.ok(env.historyCalls.every((p) => !p.isFromComplete), 'nenhuma atualização de histórico diz "concluído" antes das consultas');
});
test('Comment 15.4: aba de sessão (claim) abre 1 vez a cada 100 perfis processados, não a cada perfil', async () => {
  const users = commenters(100);
  const env = commentEnv(users, { pageSize: 50, extra: () => ({ account_type: 1, is_business: false }) });
  const vm = commentVm(env, 'H6');
  vm.startLoadAllData();
  await env.run(20000, () => vm.isComplete); await env.flush(30);
  assert.equal(vm.followList.filter((r) => r.detailLoaded).length, 100);
  assert.equal(env.tabsCreated.length, 1);
});
test('Comment 15.4: cursor repetido ou ausente encerra a lista e as consultas de e-mail começam', async () => {
  for (const stuck of ['repetido', 'ausente']) {
    const users = commenters(6);
    let pages = 0;
    const env = commentEnv(users, { pageHook: (url) => {
      pages++;
      const cursor = decodeURIComponent(url.split('min_id=')[1] || '');
      const slice = cursor ? users.slice(3) : users.slice(0, 3);
      return Promise.resolve({ data: { status: 'ok', comments: slice.map((u) => ({ user: u })), next_min_id: stuck === 'repetido' ? 'c1' : '', has_more: true, comment_count: 6 } });
    } });
    const vm = commentVm(env, 'HS' + stuck);
    vm.startLoadAllData();
    await env.run(5000, () => vm.isComplete); await env.flush(30);
    assert.equal(vm.isComplete, true, stuck + ': extração conclui');
    assert.ok(pages <= 2, stuck + ': a lista não fica em laço (' + pages + ' páginas)');
    assert.equal(env.calls.length, stuck === 'repetido' ? 6 : 3, stuck + ': todos os listados consultados');
  }
});
test('Comment 15.4: retomada cuja lista falha no meio não encolhe os comentaristas salvos', async () => {
  const users = commenters(150);
  const env1 = commentEnv(users, { pageSize: 50, fail: () => http429() });
  const vm1 = commentVm(env1, 'H7');
  vm1.startLoadAllData();
  await env1.run(3000, () => vm1.isPaused); await env1.flush(50);
  assert.equal((env1.store.extract_list_H7 || []).length, 150);
  // Sessão 2 sem a fila salva (como numa versão anterior): a lista falha na página 2 (403).
  delete env1.store.extract_queue_H7;
  const { env2, vm2 } = await reopen(env1, users, 'H7', { pageSize: 50, pageHook: (url, cfg, pages) => (/min_id=c1/.test(decodeURIComponent(url)) ? httpError(403, { message: 'login_required' }) : pages(url, cfg)) });
  await env2.run(3000, () => vm2.isPaused && !vm2.detailCycle); await env2.flush(50);
  assert.equal(env2.calls.length, 0, 'lista incompleta: nenhuma consulta de e-mail');
  const stored = env2.store.extract_list_H7 || [];
  assert.equal(stored.length, 150, 'os 150 comentaristas continuam salvos (' + stored.length + ')');
  assert.equal(new Set(stored.map((r) => r.userName)).size, 150, 'sem duplicar');
});
test('Comment 15.4: a 15.3 não obtém o public_email pelo fluxo atual; a 15.4 obtém (mesma resposta real anonimizada)', async () => {
  const users = commenters(3);
  const answers = (u) => ({ web: (() => { const b = fixture('web-business-null.json'); b.data.user.id = u.pk; b.data.user.username = u.username; return b; })(),
    info: (() => { const b = fixture('info-business.json'); Object.assign(b.user, { pk: Number(u.pk), id: u.pk, username: u.username, public_email: 'contato.' + u.pk + '@exemplo.com.br' }); return b; })() });
  const run = async (dir) => {
    const reqs = [];
    const pages = commentPages(users, 50);
    const env = createEnv(dir, { quiet: true, axiosGet: (url, cfg) => {
      if (url.indexOf('/comments/') >= 0) return pages(url, cfg);
      reqs.push(url);
      const id = idOf(url), u = users.find((x) => x.pk === id);
      if (!id || !u) return Promise.reject(new Error('unexpected ' + url));
      return Promise.resolve({ status: 200, headers: {}, data: answers(u).info });
    } });
    // the 15.3 flow asks the web route by username; the 15.4 flow never does
    env.setFetch(async (url) => {
      const username = decodeURIComponent(String(url).split('username=')[1] || '');
      reqs.push('WEB:' + username);
      const u = users.find((x) => x.username === username);
      return { status: 200, ok: true, type: 'basic', headers: { get: () => null }, text: async () => JSON.stringify(answers(u).web) };
    });
    const vm = env.instance({ type: '4', ins: 'POST' });
    commentSetup(vm);
    vm.lastHistoryItem = { id: 'HC', token: 't', updateTimes: 0, scrapedCount: 0, cursorScrapedCount: 0, count: 0 };
    vm.isPaused = false;
    vm.startLoadAllData();
    await env.run(5000, () => vm.isComplete); await env.flush(30);
    return { vm, reqs };
  };
  const now = await run(EXT);
  assert.deepEqual(now.vm.followList.map((r) => r.email), ['contato.1000@exemplo.com.br', 'contato.1001@exemplo.com.br', 'contato.1002@exemplo.com.br']);
  assert.ok(now.reqs.every((r) => /\/users\/\d+\/info\//.test(r)), '15.4: só /users/{id}/info/');
  assert.equal(now.reqs.length, 3);
  if (!OLD_EXT) return; // run with OLD_EXT_DIR=<15.3> to see the contrast
  const before = await run(OLD_EXT);
  assert.deepEqual(before.vm.followList.map((r) => r.email), ['', '', ''], '15.3: a rota web devolve business_email nulo e nenhum e-mail chega');
  assert.ok(before.reqs.every((r) => /^WEB:/.test(r)), '15.3 consulta só a rota web e nunca chega ao public_email');
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
    { id: 1, userId: '1', userName: 'found', email: 'v@loja.com', emailSource: 'public_email', emailKind: 'commercial_contact', contactParserVersion: 15, emailStatus: 'found', phone: '+5511912345678', loaded: true, detailLoaded: true },
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
    assert.deepEqual(plain(first.slice(1).map((r) => r[7])), ['E-mail comercial encontrado', 'Consulta pausada pelo Instagram · HTTP 429']);
  }
});

