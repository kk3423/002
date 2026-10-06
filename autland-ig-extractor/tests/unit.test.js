/* Unit tests for the PATCHED 14-15.4 parser and reader. All responses are SIMULATED (anonymised real shapes). */
const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');
const EXT = process.env.EXT_DIR;
const P = require(path.join(EXT, 'public-contact-parser.js'));
const R = require(path.join(EXT, 'commercial-profile-reader.js'));
const P13 = require(path.join(process.env.ORIG_DIR, 'public-contact-parser.js'));
const fixture = (name) => JSON.parse(require('fs').readFileSync(path.join(__dirname, 'fixtures', name), 'utf8'));

const biz = (extra) => Object.assign({ id: '1', username: 'loja', is_business_account: true, is_professional_account: true }, extra);

test('parser: business_email válido = found', () => {
  const c = P.classifyEmail(biz({ business_email: 'Vendas@Loja.com.br', should_show_public_contacts: true }));
  assert.equal(c.status, 'found'); assert.equal(c.email, 'Vendas@Loja.com.br'); assert.equal(c.source, 'business_email');
  assert.deepEqual(c.keys, { public_email: 'absent', business_email: 'valid', business_phone_number: 'absent' });
});
test('parser: public_email tem prioridade sobre business_email', () => {
  const c = P.classifyEmail(biz({ public_email: 'a@x.com', business_email: 'b@x.com' }));
  assert.equal(c.email, 'a@x.com'); assert.equal(c.source, 'public_email');
});
test('parser: conta pessoal nunca vira contato (com ou sem campo)', () => {
  assert.equal(P.classifyEmail({ is_professional_account: false, is_business_account: false }).status, 'not_professional');
  const c = P.classifyEmail({ is_professional_account: false, business_email: 'x@y.com' });
  assert.equal(c.status, 'not_professional'); assert.equal(c.email, '');
  assert.equal(P.classifyEmail({ account_type: 1, public_email: 'x@y.com' }).status, 'not_professional');
});
test('parser: vazio, nulo e false = empty (campo retornado)', () => {
  for (const v of ['', '   ', null, false]) {
    const c = P.classifyEmail(biz({ business_email: v }));
    assert.equal(c.status, 'empty', String(v)); assert.equal(c.fieldReturned, true);
  }
});
test('parser: e-mail nulo é "vazio" mesmo com botão CALL/TEXT (sem inferência de retenção)', () => {
  for (const v of [null, '']) {
    for (const method of ['CALL', 'TEXT', 'UNKNOWN', undefined]) {
      const c = P.classifyEmail(biz({ business_email: v, business_phone_number: null, business_contact_method: method, should_show_public_contacts: true }));
      assert.equal(c.status, 'empty', String(v) + '/' + method); assert.equal(c.email, '');
    }
  }
  // API móvel (public_email) vazia também é "empty".
  assert.equal(P.classifyEmail(biz({ public_email: '', should_show_public_contacts: true })).status, 'empty');
});
test('parser: nenhuma combinação de flags marca contato retido', () => {
  const combos = [
    biz({ business_email: null, business_phone_number: null, business_contact_method: 'CALL', should_show_public_contacts: true }),
    biz({ business_email: null, business_phone_number: '+551199999', business_contact_method: 'TEXT', should_show_public_contacts: true }),
    { is_professional_account: false, business_email: null, business_phone_number: null, business_contact_method: 'CALL', should_show_public_contacts: true },
    biz({ business_email: null, business_phone_number: null, business_contact_method: 'CALL', should_show_public_contacts: false }),
  ];
  for (const u of combos) {
    assert.ok(!('withheld' in P.classifyEmail(u)), JSON.stringify(u));
    assert.ok(!('contactWithheld' in P.extract(u)));
    assert.notEqual(P.classifyEmail(u).status, 'not_delivered');
  }
});
test('parser: oculto (should_show_public_contacts=false) não coleta mesmo com valor', () => {
  const c = P.classifyEmail(biz({ business_email: 'oculto@x.com', should_show_public_contacts: false }));
  assert.equal(c.status, 'hidden'); assert.equal(c.email, '');
  assert.equal(P.classifyEmail(biz({ should_show_public_contacts: false })).status, 'hidden');
});
test('parser: campo ausente em profissional = omitted; tipo desconhecido também', () => {
  const c = P.classifyEmail(biz({}));
  assert.equal(c.status, 'omitted'); assert.equal(c.fieldReturned, false); assert.equal(c.profileType, 'business');
  const u = P.classifyEmail({ id: '2', username: 'x' });
  assert.equal(u.status, 'omitted'); assert.equal(u.profileType, 'unknown');
});
test('parser: formato inválido = invalid', () => {
  assert.equal(P.classifyEmail(biz({ business_email: 'nao-e-email' })).status, 'invalid');
  assert.equal(P.classifyEmail(biz({ business_email: { a: 1 } })).status, 'invalid');
});
test('parser: tipos de perfil', () => {
  assert.equal(P.profileType({ account_type: 2 }), 'business');
  assert.equal(P.profileType({ account_type: 3 }), 'creator');
  assert.equal(P.profileType({ is_professional_account: true, is_business_account: false }), 'creator');
  assert.equal(P.profileType({ is_professional_account: true }), 'professional');
  assert.equal(P.profileType({ is_business: true }), 'business');
  assert.equal(P.profileType({ is_business_account: false }), 'unknown');
  assert.equal(P.profileType({}), 'unknown');
});
test('parser: e-mail da bio, links e mailto nunca preenchem o e-mail', () => {
  const r = P.extract(biz({ biography: 'contato: bio@empresa.com mailto:outro@x.com', external_url: 'mailto:site@x.com',
    bio_links: [{ url: 'mailto:link@x.com' }] }));
  assert.equal(r.email, ''); assert.equal(r.emailStatus, 'omitted');
});
test('parser: blocos especulativos (PATCHED 10-13) não são mais fonte de e-mail', () => {
  const r = P.extract(biz({ public_contact_info: { email: 'bloco@x.com' }, professional_contact_info: { public_email: 'p@x.com' } }));
  assert.equal(r.email, ''); assert.equal(r.emailStatus, 'omitted');
});
test('parser: telefone idêntico ao PATCHED 13 (sem regressão)', () => {
  const fixtures = [
    biz({ biography: 'WhatsApp: (11) 91234-5678' }), biz({ contact_phone_number: '11912345678', public_phone_country_code: '55' }),
    biz({ external_url: 'https://wa.me/5511912345678' }), { biography: 'CNPJ 12.345.678/0001-90' },
    biz({ should_show_public_contacts: false, public_phone_number: '11912345678', biography: 'tel +55 11 3333-4444' }),
    biz({ public_contact_info: { phone_number: '+5511999990000' } }),
  ];
  for (const f of fixtures) {
    const a = P.extract(f), b = P13.extract(f);
    assert.equal(a.phone, b.phone, JSON.stringify(f)); assert.equal(a.phoneSource, b.phoneSource);
  }
});
test('parser: textos pedidos para cada estado e para cada falha de acesso', () => {
  const t = (row) => P.emailStatusText(Object.assign({ loaded: true, detailLoaded: true }, row));
  assert.equal(t({ email: 'a@b.com', emailSource: 'public_email', contactParserVersion: 15 }), 'E-mail comercial encontrado');
  for (const s of ['empty', 'hidden', 'omitted', 'not_professional', 'invalid']) assert.match(t({ emailStatus: s }), /^Perfil não disponibiliza e-mail público/, s);
  assert.equal(new Set(['empty', 'hidden', 'omitted', 'not_professional', 'invalid'].map((s) => t({ emailStatus: s }))).size, 5, 'o detalhe distingue cada caso');
  assert.equal(P.emailStatusText({ loaded: true, detailLoaded: false }), 'Aguardando consulta');
  assert.equal(P.emailStatusText({ loaded: false }), 'Aguardando consulta');
  const fail = (code, status) => P.emailStatusText({ loaded: true, detailLoaded: false, contactFailure: { code, status } });
  assert.equal(fail('rate_limit', 429), 'Consulta pausada pelo Instagram · HTTP 429');
  assert.equal(fail('login_required', 200), 'Sessão precisa ser verificada · HTTP 200');
  assert.equal(fail('login_required', 0), 'Sessão precisa ser verificada');
  assert.equal(fail('access_denied', 403), 'Acesso negado pelo Instagram · HTTP 403');
  assert.equal(fail('network', 0), 'Falha temporária na consulta');
  assert.equal(fail('temporary', 503), 'Falha temporária na consulta · HTTP 503');
  assert.equal(t({ emailStatus: 'profile_unavailable' }), 'Perfil indisponível');
  assert.ok(!Object.values(P.statusText).concat(Object.values(P.stateText)).some((v) => /retid|não entregue/i.test(v)));
  // Linhas salvas pela 14-15.2 como "não entregue" mostram o que a resposta trouxe: campo vazio.
  assert.equal(t({ emailStatus: 'not_delivered' }), t({ emailStatus: 'empty' }));
});
test('parser: cada linha termina em um só estado (e falha nunca vira "sem e-mail")', () => {
  const found = { loaded: true, detailLoaded: true, email: 'a@b.com', emailSource: 'public_email', contactParserVersion: 15 };
  assert.equal(P.contactState(found), 'email_found');
  assert.equal(P.contactState({ loaded: true, detailLoaded: true, emailStatus: 'empty' }), 'no_public_email');
  for (const s of ['hidden', 'omitted', 'not_professional', 'invalid', 'not_published', 'not_returned']) assert.equal(P.contactState({ loaded: true, detailLoaded: true, emailStatus: s }), 'no_public_email', s);
  assert.equal(P.contactState({ loaded: true, detailLoaded: false }), 'pending');
  assert.equal(P.contactState({ loaded: false }), 'pending');
  const byFailure = (code, status) => P.contactState({ loaded: true, detailLoaded: false, emailStatus: 'empty', contactFailure: { code, status } });
  assert.equal(byFailure('rate_limit', 429), 'rate_limited');
  assert.equal(byFailure('cooldown', null), 'rate_limited');
  assert.equal(byFailure('login_required', 200), 'login_required');
  assert.equal(byFailure('access', 401), 'login_required');
  assert.equal(byFailure('access_denied', 403), 'access_denied');
  assert.equal(byFailure('access', 403), 'access_denied');
  for (const c of ['network', 'temporary', 'unexpected_response', 'request']) assert.equal(byFailure(c, 0), 'temporary_error', c);
  assert.equal(P.contactState({ loaded: true, detailLoaded: true, emailStatus: 'profile_unavailable' }), 'profile_unavailable');
  assert.equal(P.contactState({ loaded: true, detailLoaded: true, emailStatus: 'identity_mismatch' }), 'profile_unavailable');
  // um e-mail que não veio do campo comercial não cria estado "encontrado"
  assert.equal(P.contactState({ loaded: true, detailLoaded: true, email: 'bio@x.com', emailSource: 'biography' }), 'no_public_email');
});
test('parser: só os envelopes comprovados (user, data.user, items[0].user) e a identidade pelo id', () => {
  const u = { pk: 77, username: 'x', public_email: 'a@b.com' };
  for (const [wrapped, path] of [[{ user: u }, 'data.user'], [{ data: { user: u } }, 'data.data.user'], [{ items: [{ user: u }] }, 'data.items.0.user']]) {
    const r = P.locateProfile({ data: wrapped }, '77', '');
    assert.equal(r.known, true); assert.equal(r.path, path); assert.equal(r.user, u); assert.equal(r.mismatch, false);
    assert.equal(P.profileFromResponse({ data: wrapped }, '77', ''), u);
  }
  // direto no corpo (sem o invólucro do axios)
  assert.equal(P.locateProfile({ user: u }, '77', '').path, 'user');
  assert.equal(P.locateProfile({ items: [{ user: u }] }, '77', '').path, 'items.0.user');
  // outro id = divergência, nunca aplicado
  const other = P.locateProfile({ data: { user: u } }, '78', '');
  assert.equal(other.mismatch, true); assert.equal(P.profileFromResponse({ data: { user: u } }, '78', ''), null);
  // user nulo = perfil ausente; formatos que a extensão não recebe = desconhecido
  assert.deepEqual(P.locateProfile({ data: { user: null } }, '77', ''), { known: true, path: 'data.user', user: null, mismatch: false, id: '' });
  for (const bad of [{ data: { viewer: { user: u } } }, { data: { graphql: { user: u } } }, { data: { users: [u] } }, { data: { suggested: [{ user: u }] } }, { data: 'html' }, {}]) {
    assert.equal(P.locateProfile(bad, '77', '').known, false, JSON.stringify(bad).slice(0, 40));
    assert.equal(P.profileFromResponse(bad, '77', ''), null);
  }
});
test('parser: formas reais anonimizadas — /users/{id}/info/ traz public_email; a rota web traz business_email nulo', () => {
  const biz = P.locateProfile({ data: fixture('info-business.json') }, '1000000001', '');
  const bizC = P.extract(biz.user);
  assert.equal(bizC.emailStatus, 'found'); assert.equal(bizC.email, 'contato@exemplo.com.br'); assert.equal(bizC.emailSource, 'public_email');
  assert.equal(bizC.profileType, 'business');
  const cre = P.extract(P.locateProfile({ data: fixture('info-creator.json') }, '1000000001', '').user);
  assert.equal(cre.emailStatus, 'found'); assert.equal(cre.profileType, 'creator');
  const empty = P.extract(P.locateProfile({ data: fixture('info-business-empty.json') }, '1000000001', '').user);
  assert.equal(empty.emailStatus, 'empty'); assert.equal(empty.email, '');
  const web = P.extract(P.locateProfile({ data: fixture('web-business-null.json') }, '1000000001', '').user);
  assert.equal(web.emailStatus, 'empty'); assert.equal(web.email, '', 'a rota web da 15.3 não entrega o e-mail');
});
test('parser: histórico — linhas antigas da bio são saneadas; linhas v13 válidas preservadas', () => {
  const bio = P.commercialRow({ email: 'bio@x.com', emailSource: 'biography' });
  assert.equal(bio.email, ''); assert.equal(bio.emailStatus, 'source_not_verified');
  const v13 = P.commercialRow({ email: 'c@x.com', emailSource: 'business_email', contactParserVersion: 13, emailKind: 'commercial_contact' });
  assert.equal(v13.email, 'c@x.com');
});

/* ---------- reader with simulated deps: the shared profile-detail request is a stub ---------- */
function deps(responses, opts = {}) {
  const store = Object.assign({}, opts.store || {});
  let clock = opts.now || 1_800_000_000_000;
  const calls = [];
  let active = 0, maxActive = 0;
  const lockState = {};
  return {
    store, calls, get maxActive() { return maxActive; }, advance(ms) { clock += ms; },
    d: {
      contacts: P,
      storage: {
        get: async (keys) => { const out = {}; [].concat(keys).forEach((k) => { if (k in store) out[k] = JSON.parse(JSON.stringify(store[k])); }); return out; },
        set: async (obj) => { Object.assign(store, JSON.parse(JSON.stringify(obj))); },
      },
      // Like navigator.locks: one queue per lock name (different names never block each other).
      locks: { request: async (name, fn) => {
        const l = lockState[name] || (lockState[name] = { locked: false, queue: [] });
        while (l.locked) await new Promise((r) => l.queue.push(r));
        l.locked = true;
        try { return await fn(); } finally { l.locked = false; const next = l.queue.shift(); if (next) next(); }
      } },
      // The extension's own profile-detail request, normalised to { status, headers, data }.
      request: async (userId) => {
        active++; maxActive = Math.max(maxActive, active);
        calls.push({ userId, at: clock });
        try {
          await new Promise((r) => setTimeout(r, 5));
          const next = responses.shift();
          if (!next) throw new Error('no response scripted');
          if (next.throw) throw next.throw;
          return { status: next.status || 200, headers: next.headers || {}, data: next.body, url: next.url };
        } finally { active--; }
      },
      now: () => clock,
      wait: async (ms) => { clock += ms; opts.waits && opts.waits.push(ms); },
    },
  };
}
const person = (id, extra) => Object.assign({ pk: Number(id), pk_id: String(id), username: 'u' + id, full_name: 'U' + id, account_type: 2, is_business: true,
  should_show_public_contacts: true, business_contact_method: 'CALL', business_email: null }, extra);
const ok = (user, wrap) => ({ status: 200, body: wrap ? wrap(user) : { user, status: 'ok' } });
const K = R;
const DAY = 864e5;

test('leitor: não monta requisição própria — só pede a função compartilhada e não conhece web_profile_info', async () => {
  const x = deps([ok(person('1', { public_email: 'v@loja.com' }))]);
  assert.equal(x.d.fetch, undefined);
  const r = await R.create(x.d)('1', 'loja', () => true);
  assert.deepEqual(x.calls.map((c) => c.userId), ['1']);
  assert.equal(r.contactOutcome, 'found'); assert.equal(r.data.user.public_email, 'v@loja.com');
  const src = require('fs').readFileSync(path.join(EXT, 'commercial-profile-reader.js'), 'utf8');
  assert.ok(!/\bfetch\s*\(/.test(src), 'o leitor não chama fetch');
  assert.ok(!/web_profile_info/.test(src), 'o leitor não conhece a rota web');
  const dash = require('fs').readFileSync(path.join(EXT, 'dashboard.js'), 'utf8');
  assert.ok(!/loadUserInfoDetailWebProfile/.test(dash), 'o Comment não tem mais um caminho próprio para o perfil');
  assert.equal((dash.match(/users\/web_profile_info/g) || []).length, 3, 'a rota web só resta nas buscas por nome (alvo do perfil e lista de @perfis)');
});
test('leitor: HTTP 200 com public_email preenchido (resposta real anonimizada) = e-mail encontrado, 1 consulta', async () => {
  const x = deps([{ status: 200, body: fixture('info-business.json') }]);
  const r = await R.create(x.d)('1000000001', 'perfil_exemplo', () => true);
  assert.equal(r.contactOutcome, 'found'); assert.equal(r.publicContactResult.email, 'contato@exemplo.com.br');
  assert.equal(r.publicContactResult.emailSource, 'public_email'); assert.equal(r.contactRoute, 'users_info');
  assert.equal(x.calls.length, 1); assert.equal(x.calls[0].userId, '1000000001');
  const ev = x.store[K.evidenceKey][0];
  assert.equal(ev.http, 200); assert.equal(ev.endpoint, 'instagram_users_info'); assert.equal(ev.sentRoute, undefined, 'sem endereço informado pela requisição, nenhuma rota é presumida'); assert.ok(!('route' in ev), 'o campo "route" presumido da 15.4 não existe mais');
  assert.equal(ev.state, 'email_found'); assert.equal(ev.decision, 'email_found (public_email)'); assert.equal(ev.emailField, 'user.public_email');
  assert.equal(ev.path, 'user'); assert.equal(ev.email, 'c***@exemplo.com.br');
  // a resposta real desta rota traz public_email e não traz business_email
  assert.deepEqual(ev.keys, { public_email: 'valid', business_email: 'absent', business_phone_number: 'absent' });
  assert.ok(ev.emailPaths.includes('user.public_email=texto'));
  assert.ok(!JSON.stringify(x.store[K.evidenceKey]).includes('contato@exemplo.com.br'), 'nenhum e-mail completo no registro técnico');
  assert.equal(x.store[K.schemaKey].firstFound.email, 'c***@exemplo.com.br');
  const creator = deps([{ status: 200, body: fixture('info-creator.json') }]);
  assert.equal((await R.create(creator.d)('1000000001', 'perfil_exemplo', null)).contactOutcome, 'found');
});
test('leitor: HTTP 200 com public_email vazio = perfil não disponibiliza e-mail público (sem parar a fila)', async () => {
  const x = deps([{ status: 200, body: fixture('info-business-empty.json') }, ok(person('2', { public_email: 'v@loja.com' }))]);
  const read = R.create(x.d);
  const r = await read('1000000001', 'perfil_exemplo', null);
  assert.equal(r.contactOutcome, 'empty'); assert.equal(r.publicContactResult.email, '');
  assert.equal(P.contactState({ loaded: true, detailLoaded: true, emailStatus: r.contactOutcome }), 'no_public_email');
  assert.equal((await read('2', 'u2', null)).contactOutcome, 'found', 'a fila segue');
  assert.equal(x.store[K.evidenceKey][1].decision, 'no_public_email (empty)');
});
test('leitor: o usuário é achado em cada envelope suportado (user, data.user, items[0].user)', async () => {
  const wraps = [[(u) => ({ user: u, status: 'ok' }), 'user'], [(u) => ({ data: { user: u }, status: 'ok' }), 'data.user'], [(u) => ({ items: [{ user: u }], status: 'ok' }), 'items[0].user']];
  for (const [wrap, shown] of wraps) {
    const x = deps([ok(person('7', { public_email: 'e@loja.com' }), wrap)]);
    const r = await R.create(x.d)('7', 'u7', null);
    assert.equal(r.contactOutcome, 'found', shown);
    assert.equal(x.store[K.evidenceKey][0].path, shown); assert.equal(x.store[K.evidenceKey][0].emailField, shown + '.public_email');
  }
});
test('leitor: envelope que a extensão não recebe = falha temporária, nunca "sem e-mail"', async () => {
  const u = person('7', { public_email: 'e@loja.com' });
  for (const body of [{ graphql: { user: u } }, { viewer: { user: u } }, { users: [u] }, { suggested: [{ user: u }] }, { status: 'ok' }]) {
    const x = deps([{ status: 200, body }]);
    await assert.rejects(R.create(x.d)('7', 'u7', null), (e) => e.stopCode === 'unexpected_response', JSON.stringify(body).slice(0, 30));
    assert.equal(x.store[K.profileCacheKey], undefined);
    assert.equal(x.store[K.evidenceKey][0].outcome, 'temporary_error');
  }
});
test('leitor: prioridade do e-mail, contato oculto, CALL/TEXT e bio', async () => {
  const run = async (extra) => { const x = deps([ok(person('1', extra))]); return R.create(x.d)('1', 'u1', null); };
  let r = await run({ public_email: 'a@x.com', business_email: 'b@x.com' });
  assert.equal(r.publicContactResult.email, 'a@x.com'); assert.equal(r.publicContactResult.emailSource, 'public_email');
  r = await run({ public_email: '', business_email: 'b@x.com' });
  assert.equal(r.publicContactResult.email, 'b@x.com'); assert.equal(r.publicContactResult.emailSource, 'business_email');
  r = await run({ public_email: 'o@x.com', should_show_public_contacts: false });
  assert.equal(r.contactOutcome, 'hidden'); assert.equal(r.publicContactResult.email, '');
  for (const method of ['CALL', 'TEXT']) {
    r = await run({ public_email: '', business_contact_method: method, biography: 'contato: bio@x.com | https://x.com/mailto:link@x.com', external_url: 'mailto:site@x.com' });
    assert.equal(r.contactOutcome, 'empty', method); assert.equal(r.publicContactResult.email, '', 'a bio e o site nunca viram e-mail');
  }
  r = await run({ account_type: 1, is_business: false, public_email: 'p@x.com' });
  assert.equal(r.contactOutcome, 'not_professional'); assert.equal(r.publicContactResult.email, '');
});
test('leitor: 429 com Retry-After numérico salva a pausa, registra e pára com 1 consulta', async () => {
  const x = deps([{ status: 429, headers: { 'retry-after': '120' }, body: { status: 'fail' } }]);
  await assert.rejects(R.create(x.d)('1', 'loja', () => true), (e) => e.stopCode === 'rate_limit' && e.response.status === 429 && e.cooldownUntil === x.d.now() + 120000);
  assert.equal(x.store[K.cooldownKey], x.d.now() + 120000);
  const ev = x.store[K.evidenceKey][0];
  assert.equal(ev.http, 429); assert.equal(ev.retryAfter, '120'); assert.equal(ev.outcome, 'rate_limited'); assert.equal(ev.cooldownSaved, true);
  assert.equal(x.calls.length, 1);
});
test('leitor: 429 sem Retry-After = 60 min; data HTTP e cabeçalho em maiúsculas respeitados', async () => {
  let x = deps([{ status: 429, body: {} }]);
  await assert.rejects(R.create(x.d)('1', 'loja', null), (e) => e.stopCode === 'rate_limit');
  assert.equal(x.store[K.cooldownKey], x.d.now() + 3600000); assert.equal(x.store[K.evidenceKey][0].retryAfter, null);
  const when = new Date(1_800_000_000_000 + 7200000).toUTCString();
  x = deps([{ status: 429, headers: { 'Retry-After': when }, body: {} }]);
  await assert.rejects(R.create(x.d)('1', 'loja', null));
  assert.equal(x.store[K.cooldownKey], Date.parse(when));
  x = deps([{ status: 429, headers: { 'retry-after': '3' }, body: {} }]);
  await assert.rejects(R.create(x.d)('1', 'loja', null));
  assert.equal(x.store[K.cooldownKey], x.d.now() + 10000, 'mínimo de 10 s');
});
test('leitor: depois do 429, ZERO consultas adicionais (outro perfil, nova aba, validação manual)', async () => {
  const x = deps([{ status: 429, headers: { 'retry-after': '600' }, body: {} }, ok(person('2')), ok(person('3')), ok(person('4'))]);
  await assert.rejects(R.create(x.d)('1', 'a', null), (e) => e.stopCode === 'rate_limit');
  const second = R.create(x.d);   // another dashboard, same browser storage
  for (const [id, opts] of [['2', undefined], ['3', undefined], ['1', { probe: true }], ['4', { probe: true }]]) {
    await assert.rejects(second(id, 'u' + id, null, opts), (e) => e.stopCode === 'cooldown' && e.cooldownUntil === x.store[K.cooldownKey], id);
  }
  assert.equal(x.calls.length, 1, 'só a consulta que recebeu o 429');
  x.advance(601000);
  assert.equal((await second('2', 'u2', null)).contactOutcome, 'empty', 'liberado só depois do horário');
  assert.equal(x.calls.length, 2);
});
test('leitor: falhas de acesso viram estados próprios e param sem nova tentativa', async () => {
  const cases = [
    [{ status: 403, body: { message: 'login_required', status: 'fail' } }, 'login_required', 'login_required'],
    [{ status: 401, body: { status: 'fail' } }, 'login_required', 'login_required'],
    [{ status: 400, body: { message: 'checkpoint_required', status: 'fail' } }, 'login_required', 'login_required'],
    [{ status: 200, body: '<!DOCTYPE html><html>Login</html>' }, 'login_required', 'login_required'],
    [{ status: 200, body: { status: 'fail', message: 'checkpoint_required' } }, 'login_required', 'login_required'],
    [{ status: 200, body: { require_login: true, status: 'ok' } }, 'login_required', 'login_required'],
    [{ status: 403, body: { message: 'Forbidden', status: 'fail' } }, 'access_denied', 'access_denied'],
    [{ status: 400, body: { message: 'feedback_required', status: 'fail' } }, 'access_denied', 'access_denied'],
    [{ status: 200, body: { status: 'fail', message: 'algo' } }, 'access_denied', 'access_denied'],
    [{ status: 500, body: '' }, 'temporary', 'temporary_error'],
    [{ status: 503, body: { message: 'x' } }, 'temporary', 'temporary_error'],
    [{ throw: new TypeError('Network Error') }, 'network', 'temporary_error'],
    [{ status: 200, body: 'texto que não é JSON de perfil' }, 'unexpected_response', 'temporary_error'],
    [{ status: 200, body: null }, 'unexpected_response', 'temporary_error'],
    [{ status: 200, body: [] }, 'unexpected_response', 'temporary_error'],
  ];
  for (const [res, code, state] of cases) {
    const x = deps([res, ok(person('1', { public_email: 'v@loja.com' }))]);
    const read = R.create(x.d);
    await assert.rejects(read('1', 'loja', null), (e) => e.stopCode === code && P.failureState({ code: e.stopCode, status: e.response && e.response.status }) === state, JSON.stringify(res).slice(0, 60));
    assert.equal(x.calls.length, 1);
    assert.equal(x.store[K.evidenceKey][0].outcome, state);
    assert.equal(x.store[K.cooldownKey], undefined, 'só o 429 cria pausa');
    assert.equal(x.store[K.profileCacheKey], undefined, 'falha não é guardada como resultado');
    assert.equal(x.store[K.schemaKey] && x.store[K.schemaKey].found || 0, 0);
    // a falha não virou "sem e-mail": a mesma conta, consultada de novo, ainda entrega o e-mail
    const again = await read('1', 'loja', null);
    assert.equal(again.contactOutcome, 'found', code);
  }
});
test('leitor: só HTTP 200 com o objeto do perfil pode terminar em "sem e-mail"', async () => {
  for (const res of [{ status: 429, body: {} }, { status: 403, body: {} }, { status: 500, body: {} }, { throw: new Error('x') }, { status: 200, body: 'x' }, { status: 200, body: {} }]) {
    const x = deps([res]);
    let result = null;
    try { result = await R.create(x.d)('1', 'a', null); } catch (e) { /* expected */ }
    assert.equal(result, null, JSON.stringify(res).slice(0, 50) + ' não pode devolver um resultado de perfil');
  }
});
test('leitor: cache por user id — o mesmo perfil não é consultado de novo, nem em outra aba', async () => {
  const x = deps([ok(person('1', { public_email: 'v@loja.com' }))]);
  assert.equal((await R.create(x.d)('1', 'loja', null)).contactOutcome, 'found');
  assert.ok(x.store[K.profileCacheKey]['1']);
  x.advance(60000);
  const again = await R.create(x.d)('1', '@Loja', null);   // outra aba: leitor novo, mesmo armazenamento
  assert.equal(again.fromCache, true); assert.equal(again.contactOutcome, 'found'); assert.equal(again.data.user.public_email, 'v@loja.com');
  assert.equal(x.calls.length, 1, 'nenhuma nova consulta');
  // renomeado depois: o id é a chave, o resultado continua valendo
  assert.equal((await R.create(x.d)('1', 'nome_novo', null)).fromCache, true);
  assert.equal(x.calls.length, 1);
});
test('leitor: validade do cache (14 dias com e-mail, 7 sem e-mail, 3 indisponível) e validação manual sempre consulta', async () => {
  const x = deps([ok(person('1', { public_email: 'a@x.com' })), ok(person('2', { public_email: '' })), { status: 404, body: { message: 'User not found', status: 'fail' } },
    ok(person('1', { public_email: 'a@x.com' })), ok(person('2', { public_email: '' })), { status: 404, body: {} }, ok(person('1', { public_email: 'a@x.com' }))]);
  const read = (id, o) => R.create(x.d)(id, 'u' + id, null, o);
  await read('1'); await read('2'); const gone = await read('3');
  assert.equal(gone.contactSkip, true); assert.equal(gone.contactOutcome, 'profile_unavailable');
  assert.equal(x.calls.length, 3);
  x.advance(2.5 * DAY);
  for (const id of ['1', '2', '3']) assert.equal((await read(id)).fromCache, true, id + ' em 2,5 dias');
  x.advance(1 * DAY);   // 3,5 dias: o indisponível venceu
  assert.equal((await read('3')).fromCache, undefined); assert.equal(x.calls.length, 4 - 1 + 1);
});
test('leitor: validade do cache — sem e-mail vence em 7 dias, com e-mail em 14', async () => {
  const x = deps([ok(person('1', { public_email: 'a@x.com' })), ok(person('2', { public_email: '' })), ok(person('2', { public_email: 'novo@x.com' })), ok(person('1', { public_email: 'b@x.com' }))]);
  const read = (id, o) => R.create(x.d)(id, 'u' + id, null, o);
  await read('1'); await read('2');
  x.advance(6 * DAY);
  assert.equal((await read('2')).fromCache, true); assert.equal((await read('1')).fromCache, true);
  x.advance(2 * DAY);   // 8 dias
  const renewed = await read('2');
  assert.equal(renewed.fromCache, undefined); assert.equal(renewed.publicContactResult.email, 'novo@x.com');
  assert.equal((await read('1')).fromCache, true, 'com e-mail ainda vale');
  x.advance(7 * DAY);   // 15 dias
  assert.equal((await read('1')).data.user.public_email, 'b@x.com');
  // validação manual: sempre faz a consulta real
  const y = deps([ok(person('1', { public_email: 'a@x.com' })), ok(person('1', { public_email: 'a@x.com' }))]);
  await R.create(y.d)('1', 'u1', null);
  const probe = await R.create(y.d)('1', 'u1', null, { probe: true });
  assert.equal(probe.fromCache, undefined); assert.equal(y.calls.length, 2); assert.equal(y.store[K.evidenceKey][0].probe, true);
});
test('leitor: duas leituras simultâneas do mesmo id = 1 consulta; uma de cada vez entre perfis', async () => {
  const x = deps([ok(person('1', { public_email: 'a@x.com' })), ok(person('2'))]);
  const read = R.create(x.d);
  const [a, b, c] = await Promise.all([read('1', 'u1', null), read('1', 'u1', null), read('2', 'u2', null)]);
  assert.equal(a.contactOutcome, 'found'); assert.equal(b.fromCache, true); assert.equal(c.contactOutcome, 'empty');
  assert.equal(x.calls.length, 2); assert.equal(x.maxActive, 1);
  assert.ok(x.calls[1].at - x.calls[0].at >= 10000, 'mínimo de 10 s entre consultas');
});
test('leitor: comentário sem id — resolve pelo cache de respostas anteriores; sem cache, não consulta nada', async () => {
  const x = deps([ok(person('555', { username: 'maria', public_email: 'm@loja.com' }))]);
  await R.create(x.d)('555', 'maria', null);
  const known = await R.create(x.d)('', 'Maria', null);
  assert.equal(known.fromCache, true); assert.equal(known.contactUserId, '555');
  for (const bad of ['u:ninguem', '', 'abc']) {
    const none = await R.create(x.d)(bad, 'ninguem', null);
    assert.equal(none.contactSkip, true); assert.equal(none.contactOutcome, 'no_user_id');
  }
  assert.equal(x.calls.length, 1, 'nenhuma outra rota é tentada para resolver o id');
});
test('leitor: id divergente não é aplicado nem guardado; perfil ausente (404 ou user nulo) é resultado da linha', async () => {
  const x = deps([ok(person('999', { public_email: 'dono@x.com' })), { status: 404, body: { message: 'User not found', status: 'fail' } }, { status: 200, body: { user: null, status: 'ok' } },
    ok({ username: 'sem_id', public_email: 'a@b.com' })]);
  const read = R.create(x.d);
  const m = await read('1', 'u1', null);
  assert.equal(m.contactSkip, true); assert.equal(m.contactOutcome, 'identity_mismatch');
  assert.equal(x.store[K.profileCacheKey] && x.store[K.profileCacheKey]['1'], undefined);
  assert.equal(x.store[K.evidenceKey][0].returnedId, '999');
  assert.equal((await read('2', 'u2', null)).contactOutcome, 'profile_unavailable');
  assert.equal((await read('3', 'u3', null)).contactOutcome, 'profile_unavailable');
  await assert.rejects(read('4', 'u4', null), (e) => e.stopCode === 'unexpected_response', 'resposta sem id do perfil não é aplicada');
});
test('leitor: cancelamento após a resposta guarda o resultado (retomada não repete consulta)', async () => {
  const x = deps([ok(person('1', { public_email: 'v@loja.com' }))]);
  const read = R.create(x.d);
  let current = true;
  const p = read('1', 'loja', () => current);
  setTimeout(() => { current = false; }, 1);
  await assert.rejects(p, (e) => e.stopCode === 'cancelled');
  const r = await R.create(x.d)('1', 'loja', () => true);
  assert.equal(r.fromCache, true); assert.equal(r.contactOutcome, 'found'); assert.equal(x.calls.length, 1);
});
test('leitor: evidência sanitizada — nenhum cookie, cabeçalho ou e-mail completo; limitada a 20', async () => {
  const x = deps(Array.from({ length: 25 }, (_, i) => ok(person(String(i + 1), { public_email: 'p' + i + '@loja.com', message: 'x' }))));
  const read = R.create(x.d);
  for (let i = 1; i <= 25; i++) await read(String(i), 'u' + i, null);
  assert.equal(x.store[K.evidenceKey].length, 20); assert.equal(x.store[K.evidenceKey][0].username, 'u25');
  const dump = JSON.stringify([x.store[K.evidenceKey], x.store[K.schemaKey]]);
  assert.ok(!/@loja\.com/.test(dump.replace(/\w\*\*\*@loja\.com/g, '')), 'só e-mail mascarado');
  assert.ok(!/cookie|csrf|sessionid|authorization|token|x-ig/i.test(dump));
});
test('leitor: mensagem do Instagram nunca chega como HTML às notificações', async () => {
  const x = deps([{ status: 403, body: { status: 'fail', message: "<div>Sessão <a href='https://x.y'>aqui</a> & \"z\"</div>" } }]);
  await assert.rejects(R.create(x.d)('1', 'a', null), (e) => !/[<>&]/.test(e.message) && /Sessão/.test(e.message));
  assert.ok(!/[<>&]/.test(x.store[K.evidenceKey][0].message));
});
test('ritmo adaptativo: 429 e 400 dobram o intervalo (até 2 min); 5 respostas seguidas reduzem 20%', async () => {
  const x = deps([{ status: 429, body: {} }]);
  await assert.rejects(R.create(x.d)('1', 'a', null), (e) => e.stopCode === 'rate_limit');
  assert.equal(x.store[K.pacingKey].spacing, 20000);
  const w = deps([{ status: 400, body: { message: 'feedback_required' } }]);
  await assert.rejects(R.create(w.d)('1', 'a', null), (e) => e.stopCode === 'access_denied');
  assert.equal(w.store[K.pacingKey].spacing, 20000);
  const y = deps([{ status: 429, body: {} }], { store: { [K.pacingKey]: { spacing: 90000, okStreak: 3 } } });
  await assert.rejects(R.create(y.d)('1', 'a', null));
  assert.deepEqual(y.store[K.pacingKey], { spacing: R.maxSpacing, okStreak: 0 });
  const ids = [1, 2, 3, 4, 5, 6];
  const z = deps(ids.map((i) => ok(person(String(i)))), { store: { [K.pacingKey]: { spacing: 40000, okStreak: 0 } } });
  const read = R.create(z.d);
  for (const i of ids.slice(0, 5)) await read(String(i), 'u' + i, null);
  assert.deepEqual(z.store[K.pacingKey], { spacing: 32000, okStreak: 0 });
  for (let i = 1; i < 5; i++) assert.ok(z.calls[i].at - z.calls[i - 1].at >= 40000, 'intervalo de 40 s respeitado');
  await read('6', 'u6', null);
  assert.ok(z.calls[5].at - z.calls[4].at >= 32000 && z.calls[5].at - z.calls[4].at < 40000);
  const base = deps([ok(person('1'))], { store: { [K.pacingKey]: { spacing: 1, okStreak: 0 } } });
  await R.create(base.d)('1', 'a', null);
  assert.ok(base.store[K.pacingKey].spacing >= R.baseSpacing, 'nunca abaixo de 10 s');
});
test('ritmo adaptativo: intervalo salvo maior vale para todas as abas; a pausa 429 vale depois do intervalo', async () => {
  const waits = [];
  const x = deps([ok(person('1'))], { store: { [K.pacingKey]: { spacing: 80000, okStreak: 0 }, [K.lastStartKey]: 1_800_000_000_000 - 1000 }, waits });
  await R.create(x.d)('1', 'a', null);
  assert.deepEqual(waits, [79000]); assert.equal(x.calls[0].at, 1_800_000_000_000 + 79000);
  const y = deps([], { store: { [K.pacingKey]: { spacing: 30000, okStreak: 0 }, [K.lastStartKey]: 1_800_000_000_000 } });
  y.d.wait = async (ms) => { y.advance(ms); y.store[K.cooldownKey] = y.d.now() + 3600000; };
  await assert.rejects(R.create(y.d)('1', 'a', null), (e) => e.stopCode === 'cooldown');
  assert.equal(y.calls.length, 0);
});
test('emailPaths: caminhos e tipos dos campos de e-mail, sem valores', () => {
  const paths = R.emailPaths(fixture('info-business.json'));
  for (const p of ['user.public_email=texto', 'user.business_contact_method=texto', 'user.should_show_public_contacts=boolean']) assert.ok(paths.includes(p), p + ' em ' + JSON.stringify(paths));
  assert.ok(!paths.some((p) => /business_email/.test(p)), 'a rota /info/ não traz business_email');
  assert.ok(R.emailPaths(fixture('web-business-null.json')).includes('data.user.business_email=null'), 'a rota web traz business_email nulo');
  assert.ok(!JSON.stringify(paths).includes('@'), 'nenhum valor de e-mail');
  assert.deepEqual(R.emailPaths(null), []); assert.deepEqual(R.emailPaths('<html>'), []);
});
test('pausa: o 429 não depende do armazenamento — com o armazenamento quebrado continua 429 e registra "pausa NÃO salva"', async () => {
  const storage = {
    data: { ig_commercial_web_last_start: 0 },
    get: async (keys) => { const out = {}; [].concat(keys).forEach((k) => { if (k in storage.data) out[k] = storage.data[k]; }); return out; },
    set: async (o) => { if ('ig_contact_cooldown_until' in o) throw new Error('quota'); Object.assign(storage.data, o); },
  };
  const read = R.create({ contacts: P, storage, locks: realLock(), now: () => 1000000, wait: async () => {},
    request: async () => ({ status: 429, headers: {}, data: {} }) });
  await assert.rejects(read('7', 'loja_x', null), (e) => e.stopCode === 'rate_limit' && e.cooldownUntil === 1000000 + 3600000);
  const ev = storage.data.ig_commercial_contact_evidence_v14[0];
  assert.equal(ev.http, 429); assert.equal(ev.retryAfter, null); assert.equal(ev.cooldownSaved, false);
});

/* PATCHED 15.2: the shared pause is merged under a lock, never shortened, and a failed save is visible. */
function slowStore(initial) {
  // Storage whose get/set yield, so two tabs can interleave between read and write.
  const data = Object.assign({}, initial);
  const tick = () => new Promise((r) => setTimeout(r, 5));
  return { data, get: async (k) => { await tick(); return { [k]: data[k] }; }, set: async (o) => { await tick(); Object.assign(data, o); } };
}
function realLock() {
  const queues = {};
  return { request: (name, fn) => { const prev = queues[name] || Promise.resolve(); const run = prev.then(() => fn()); queues[name] = run.catch(() => {}); return run; } };
}
test('pausa: duas abas gravando ao mesmo tempo nunca encurtam a pausa (com a trava)', async () => {
  const store = slowStore({ ig_contact_cooldown_until: 0 });
  const locks = realLock();
  await Promise.all([R.saveCooldown(store, locks, 5000), R.saveCooldown(store, locks, 9000), R.saveCooldown(store, locks, 7000)]);
  assert.equal(store.data.ig_contact_cooldown_until, 9000);
});
test('pausa: uma pausa salva maior nunca é reduzida por um Retry-After menor', async () => {
  const store = slowStore({ ig_contact_cooldown_until: 50000 });
  const value = await R.saveCooldown(store, realLock(), 20000);
  assert.equal(value, 50000); assert.equal(store.data.ig_contact_cooldown_until, 50000);
});
test('pausa: falha passageira do armazenamento é repetida 1 vez; falha persistente é reportada', async () => {
  let fails = 1;
  const flaky = { data: {}, get: async () => ({}), set: async (o) => { if (fails-- > 0) throw new Error('quota'); Object.assign(flaky.data, o); } };
  assert.equal(await R.saveCooldown(flaky, realLock(), 1234, async () => {}), 1234);
  assert.equal(flaky.data.ig_contact_cooldown_until, 1234);
  const broken = { get: async () => { throw new Error('Extension context invalidated'); }, set: async () => {} };
  await assert.rejects(R.saveCooldown(broken, realLock(), 1234, async () => {}));
});

/* ---------- PATCHED 15.5: ids above 2^53, phone decision, request route ---------- */
test('parser 15.5: a identidade do perfil resiste a ids acima de 2^53 (pk numérico arredondado pelo JSON.parse)', () => {
  const body = JSON.parse('{"user":{"pk":73987654321098765,"pk_id":"73987654321098765","id":"73987654321098765","username":"x","public_email":"a@b.com","account_type":2}}');
  assert.notEqual(String(body.user.pk), '73987654321098765', 'a premissa: o pk numérico já vem arredondado');
  const ok1 = P.locateProfile({ data: body }, '73987654321098765', '');
  assert.equal(ok1.mismatch, false); assert.equal(ok1.id, '73987654321098765', 'o id exato vem do texto (pk_id)');
  // só o pk numérico: compara como número (o id esperado arredondaria para o mesmo valor)
  const onlyNum = JSON.parse('{"user":{"pk":73987654321098765,"username":"x"}}');
  assert.equal(P.locateProfile({ data: onlyNum }, '73987654321098765', '').mismatch, false);
  assert.equal(P.locateProfile({ data: onlyNum }, '73987654321090000', '').mismatch, true, 'outro perfil continua divergente');
  // ids comuns: comparação exata, sem tolerância
  const small = { user: { pk: 12345678901, pk_id: '12345678901', username: 'y' } };
  assert.equal(P.locateProfile({ data: small }, '12345678901', '').mismatch, false);
  assert.equal(P.locateProfile({ data: small }, '12345678902', '').mismatch, true);
  // a resposta de outro perfil nunca passa, mesmo com id grande
  assert.equal(P.locateProfile({ data: body }, '73987654321098764', '').mismatch, true);
  // sem nenhum campo de id: nada a comparar aqui (o leitor recusa essa resposta à parte)
  const none = P.locateProfile({ data: { user: { username: 'z' } } }, '5', '');
  assert.equal(none.mismatch, false); assert.equal(none.id, '');
});
test('parser 15.5: máscara do telefone mostra só o prefixo e os 2 últimos dígitos; texto livre não vira telefone', () => {
  assert.equal(P.maskPhone('+5511987654321'), '+55*********21');
  assert.equal(P.maskPhone('(11) 98765-4321'), '*********21', 'sem "+": só os 2 últimos dígitos');
  assert.equal(P.maskPhone('3456-7890'), '******90'); assert.equal(P.maskPhone('+12345678'), '+12****78');
  assert.equal(P.maskPhone('12345'), '', 'curto demais para ser telefone: não há o que mascarar');
  assert.equal(P.maskPhone(''), ''); assert.equal(P.maskPhone(null), ''); assert.equal(P.maskPhone('abc'), '');
  for (const v of ['+5511987654321', '11987654321']) {
    const m = P.maskPhone(v);
    assert.ok(!m.includes(P.validPhone(v)) && m.replace(/\D/g, '').length <= 4, v + ' não aparece inteiro (no máx. 4 dígitos visíveis): ' + m);
  }
  // todo telefone válido tem 8 dígitos ou mais: no máximo metade aparece
  for (const v of ['12345678', '3456-7890', '+12345678', '+5511987654321', '11987654321', '0012125551234']) {
    const m = P.maskPhone(v), shown = m.replace(/\D/g, '').length, total = P.validPhone(v).replace(/\D/g, '').length;
    assert.ok(shown * 2 <= total, v + ' mostra ' + shown + ' de ' + total + ': ' + m);
  }
});
test('parser 15.5: telefone público (campo do Instagram) × telefone lido da bio/link, com o estado de cada campo', () => {
  const field = P.extract({ account_type: 2, should_show_public_contacts: true, public_email: 'a@loja.com', contact_phone_number: '11987654321', public_phone_country_code: '55', public_phone_number: '' });
  assert.equal(field.phone, '+5511987654321'); assert.equal(field.phoneSource, 'contact_phone_number'); assert.equal(field.phonePublished, true);
  assert.deepEqual(field.phoneKeys, { contact_phone_number: 'present', public_phone_number: 'empty', business_phone_number: 'absent', public_phone_country_code: 'present' });
  const bio = P.extract({ account_type: 2, should_show_public_contacts: true, public_email: '', contact_phone_number: '', biography: 'WhatsApp: (11) 98765-4321' });
  assert.equal(bio.phone, '11987654321'); assert.equal(bio.phoneSource, 'biography'); assert.equal(bio.phonePublished, false, 'o telefone da bio não é o contato público');
  assert.equal(bio.phoneKeys.contact_phone_number, 'empty');
  const link = P.extract({ account_type: 2, external_url: 'https://wa.me/5511987654321' });
  assert.equal(link.phoneSource, 'profile_link'); assert.equal(link.phonePublished, false);
  const hidden = P.extract({ account_type: 2, should_show_public_contacts: false, contact_phone_number: '11987654321', public_phone_country_code: '55' });
  assert.equal(hidden.phone, '', 'contato oculto pelo perfil: o campo público não é lido'); assert.equal(hidden.phonePublished, false); assert.equal(hidden.phoneStatus, 'not_published');
  const none = P.extract({ account_type: 2, should_show_public_contacts: true, public_email: '' });
  assert.equal(none.phone, ''); assert.equal(none.phoneStatus, 'not_returned'); assert.equal(none.phoneKeys.contact_phone_number, 'absent');
});
test('parser 15.5: linha salva sem a chave do telefone exporta célula vazia, nunca "undefined"', () => {
  assert.equal(P.commercialRow({ userName: 'a' }).phone, '');
  assert.equal(P.commercialRow({ userName: 'a', phone: null }).phone, '');
  assert.equal(P.commercialRow({ userName: 'a', phone: '+5511987654321' }).phone, '+5511987654321');
  assert.equal(P.commercialRow({ userName: 'a', phone: 5511987654321 }).phone, '5511987654321');
});
test('leitor 15.5: o telefone entra no registro (campo, estado de cada campo, número mascarado) e nada completo vaza', async () => {
  const body = fixture('info-creator.json');
  const x = deps([{ status: 200, body, url: 'https://www.instagram.com/api/v1/users/1000000001/info/?foo=bar' }]);
  const r = await R.create(x.d)('1000000001', 'perfil_exemplo', null);
  assert.equal(r.contactOutcome, 'found');
  assert.equal(r.publicContactResult.phone, '+8411900000000'); assert.equal(r.publicContactResult.phoneSource, 'contact_phone_number');
  const ev = x.store[K.evidenceKey][0];
  assert.equal(ev.sentRoute, 'GET https://www.instagram.com/api/v1/users/{id}/info/', 'a rota enviada de fato, sem id e sem query');
  assert.equal(ev.phone, '+84*********00'); assert.equal(ev.phoneField, 'contact_phone_number'); assert.equal(ev.phonePublished, true); assert.equal(ev.phoneStatus, 'found');
  assert.deepEqual(ev.phoneKeys, { contact_phone_number: 'present', public_phone_number: 'present', business_phone_number: 'absent', public_phone_country_code: 'present' });
  const logged = JSON.stringify([x.store[K.evidenceKey], x.store[K.schemaKey]]);
  assert.ok(!logged.includes('11900000000') && !logged.includes('contato@exemplo.com.br') && !/csrf|cookie|sessionid|authorization/i.test(logged), 'nenhum contato completo, cookie ou token no registro técnico');
  const schema = K.readSchema(x.store[K.schemaKey]);
  assert.equal(schema.phoneFound, 1); assert.deepEqual(schema.phoneFoundUsers, ['perfil_exemplo']);
  assert.deepEqual(schema.firstPhone, { at: schema.firstPhone.at, username: 'perfil_exemplo', phone: '+84*********00', field: 'contact_phone_number', probe: false });
});
test('leitor 15.5: telefone lido da bio não vira "telefone público" no registro nem na prova', async () => {
  const x = deps([ok(person('7', { public_email: '', biography: 'Fale conosco no WhatsApp: (11) 98765-4321' }))]);
  const r = await R.create(x.d)('7', 'u7', null);
  assert.equal(r.publicContactResult.phoneSource, 'biography');
  const ev = x.store[K.evidenceKey][0];
  assert.equal(ev.phoneField, 'biography'); assert.equal(ev.phonePublished, false);
  const schema = K.readSchema(x.store[K.schemaKey]);
  assert.equal(schema.phoneFound, 0); assert.equal(schema.firstPhone, null);
});
test('leitor 15.5: id acima de 2^53 — a resposta certa é aplicada e o id da linha continua sendo o id pedido', async () => {
  const wanted = '73987654321098765';
  const body = JSON.parse('{"status":"ok","user":{"pk":73987654321098765,"pk_id":"73987654321098765","id":"73987654321098765","username":"grande","account_type":2,"is_business":true,"should_show_public_contacts":true,"public_email":"grande@loja.com"}}');
  const x = deps([{ status: 200, body }]);
  const r = await R.create(x.d)(wanted, 'grande', null);
  assert.equal(r.contactOutcome, 'found'); assert.equal(r.publicContactResult.email, 'grande@loja.com');
  assert.equal(r.contactUserId, wanted, 'a linha mantém o id exato pedido, nunca o número arredondado');
  const other = deps([{ status: 200, body }]);
  const bad = await R.create(other.d)('73987654321098000', 'grande', null);
  assert.equal(bad.contactOutcome, 'identity_mismatch', 'a resposta de outro perfil continua recusada');
  // resposta só com o pk numérico (já arredondado): a linha ainda recebe o id exato que foi pedido
  const rounded = JSON.parse('{"status":"ok","user":{"pk":73987654321098765,"username":"grande2","account_type":2,"is_business":true,"should_show_public_contacts":true,"public_email":"g2@loja.com"}}');
  const y = deps([{ status: 200, body: rounded }]);
  const r2 = await R.create(y.d)(wanted, 'grande2', null);
  assert.equal(r2.contactOutcome, 'found'); assert.equal(r2.contactUserId, wanted, 'nunca o número arredondado (73987654321098770)');
});
test('leitor 15.5: a rota do registro só existe quando a requisição informa o endereço enviado', async () => {
  const withUrl = deps([{ status: 200, body: fixture('info-business.json'), url: 'https://www.instagram.com/api/v1/users/1000000001/info/' }]);
  await R.create(withUrl.d)('1000000001', 'a', null);
  assert.equal(withUrl.store[K.evidenceKey][0].sentRoute, 'GET https://www.instagram.com/api/v1/users/{id}/info/');
  for (const bad of ['', 'not a url', 'javascript:alert(1)']) {
    const x = deps([{ status: 200, body: fixture('info-business.json'), url: bad }]);
    await R.create(x.d)('1000000001', 'a', null);
    assert.equal(x.store[K.evidenceKey][0].sentRoute, undefined, JSON.stringify(bad));
  }
  assert.equal(K.requestRoute('https://www.instagram.com/api/v1/users/42/info/?a=1#b', '42'), 'GET https://www.instagram.com/api/v1/users/{id}/info/');
});

/* ---------- PATCHED 15.5, after the second-agent review ---------- */
test('parser 15.5: ids contraditórios na mesma resposta seguem a ordem de sempre (pk, pk_id, id): um id exato que não bate é divergência', () => {
  const body = (u) => ({ data: { user: Object.assign({ username: 'x' }, u) } });
  assert.equal(P.locateProfile(body({ pk: 999, pk_id: '998', id: '123' }), '123', '').mismatch, true, 'pk exato decide, como na 15.4');
  assert.equal(P.locateProfile(body({ pk: 123, pk_id: '998', id: '997' }), '123', '').mismatch, false);
  assert.equal(P.locateProfile(body({ pk: '', pk_id: '123' }), '123', '').mismatch, false, 'id vazio não esconde os outros');
  assert.equal(P.locateProfile(body({ pk: '', pk_id: '124' }), '123', '').mismatch, true);
  // pk arredondado cede a um id exato da mesma resposta, mesmo que o exato seja de OUTRO perfil
  const big = JSON.parse('{"user":{"pk":73987654321098765,"pk_id":"73987654321090000","username":"x"}}');
  assert.equal(P.locateProfile({ data: big }, '73987654321098765', '').mismatch, true);
  const ok = JSON.parse('{"user":{"pk":73987654321098765,"pk_id":"73987654321098765","username":"x"}}');
  assert.equal(P.locateProfile({ data: ok }, '73987654321098765', '').mismatch, false);
  // só o número arredondado: a resolução do double (16 neste porte) é o limite; o que está fora dela continua divergente
  const only = JSON.parse('{"user":{"pk":73987654321098765,"username":"x"}}');
  assert.equal(P.locateProfile({ data: only }, '73987654321098765', '').mismatch, false);
  assert.equal(P.locateProfile({ data: only }, '73987654321090000', '').mismatch, true);
});
test('parser 15.5: campo de telefone com texto que não é telefone é "invalid", não "vazio ou oculto"', () => {
  for (const text of ['ligue-nos', '12', '11 3333-4444 ramal 22', '+55']) {
    const r = P.extract({ account_type: 2, should_show_public_contacts: true, contact_phone_number: text, public_phone_country_code: '55' });
    assert.equal(r.phoneKeys.contact_phone_number, 'invalid', text); assert.equal(r.phone, ''); assert.equal(r.phoneStatus, 'invalid', text);
  }
  const mixed = P.extract({ account_type: 2, should_show_public_contacts: true, contact_phone_number: '11987654321', public_phone_number: 'ligue-nos', public_phone_country_code: '55' });
  assert.equal(mixed.phone, '+5511987654321'); assert.equal(mixed.phoneStatus, 'found'); assert.equal(mixed.phoneKeys.public_phone_number, 'invalid');
  const empty = P.extract({ account_type: 2, should_show_public_contacts: true, contact_phone_number: '', public_phone_country_code: '55' });
  assert.equal(empty.phoneKeys.contact_phone_number, 'empty'); assert.equal(empty.phoneStatus, 'not_published');
  const hidden = P.extract({ account_type: 2, should_show_public_contacts: false, contact_phone_number: 'ligue-nos' });
  assert.equal(hidden.phoneStatus, 'not_published', 'contato oculto pelo perfil continua sendo "oculto"');
});
