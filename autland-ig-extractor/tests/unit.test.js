/* Unit tests for the PATCHED 14-15.3 parser and reader. All responses are SIMULATED. */
const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');
const EXT = process.env.EXT_DIR;
const P = require(path.join(EXT, 'public-contact-parser.js'));
const R = require(path.join(EXT, 'commercial-profile-reader.js'));
const P13 = require(path.join(process.env.ORIG_DIR, 'public-contact-parser.js'));

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
      assert.equal(c.status, 'empty', String(v) + '/' + method); assert.equal(c.email, ''); assert.equal(c.withheld, false);
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
    assert.equal(P.classifyEmail(u).withheld, false, JSON.stringify(u));
    assert.equal(P.extract(u).contactWithheld, false);
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
test('parser: textos de status distintos e falhas de acesso', () => {
  const t = (row) => P.emailStatusText(Object.assign({ loaded: true, detailLoaded: true }, row));
  const texts = ['empty', 'hidden', 'omitted', 'not_professional', 'profile_unavailable', 'identity_mismatch', 'invalid'].map((s) => t({ emailStatus: s }));
  assert.equal(new Set(texts).size, texts.length);
  // Linhas salvas pela 14-15.2 como "não entregue" passam a mostrar o que a resposta trouxe: campo vazio.
  assert.equal(t({ emailStatus: 'not_delivered' }), t({ emailStatus: 'empty' }));
  assert.ok(!Object.values(P.statusText).some((v) => /não entregue|retid/i.test(v)));
  assert.equal(t({ email: 'a@b.com', emailSource: 'business_email', contactParserVersion: 14 }), 'Contato público do Instagram');
  assert.match(P.emailStatusText({ loaded: true, detailLoaded: false, contactFailure: { code: 'rate_limit', status: 429 } }), /429/);
  assert.match(P.emailStatusText({ loaded: true, detailLoaded: false, contactFailure: { code: 'access', status: 403 } }), /403/);
  assert.equal(P.emailStatusText({ loaded: true, detailLoaded: false }), 'Aguardando consulta');
  assert.equal(t({ emailStatus: 'not_published' }), 'Sem e-mail comercial publicado');
});
test('parser: histórico — linhas antigas da bio são saneadas; linhas v13 válidas preservadas', () => {
  const bio = P.commercialRow({ email: 'bio@x.com', emailSource: 'biography' });
  assert.equal(bio.email, ''); assert.equal(bio.emailStatus, 'source_not_verified');
  const v13 = P.commercialRow({ email: 'c@x.com', emailSource: 'business_email', contactParserVersion: 13, emailKind: 'commercial_contact' });
  assert.equal(v13.email, 'c@x.com');
});

/* ---------- reader with simulated deps ---------- */
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
      fetch: async (url, init) => {
        active++; maxActive = Math.max(maxActive, active);
        calls.push({ url, init, at: clock });
        try {
          await new Promise((r) => setTimeout(r, 5));
          const next = responses.shift();
          if (!next) throw new Error('no response scripted');
          if (next.throw) throw next.throw;
          return {
            status: next.status || 200, ok: (next.status || 200) >= 200 && (next.status || 200) < 300, type: next.type || 'basic',
            headers: { get: (h) => (next.headers || {})[h.toLowerCase()] || null },
            text: async () => (typeof next.body === 'string' ? next.body : JSON.stringify(next.body)),
          };
        } finally { active--; }
      },
      now: () => clock,
      wait: async (ms) => { clock += ms; opts.waits && opts.waits.push(ms); },
    },
  };
}
const ok = (user) => ({ status: 200, body: { data: { user }, status: 'ok' } });
const K = R;

test('reader: requisição web normal (host, cabeçalhos, credenciais, sem seguir redirect)', async () => {
  const x = deps([ok(biz({ username: 'loja', business_email: 'v@loja.com' }))]);
  const read = R.create(x.d);
  const r = await read('1', '@Loja', () => true);
  assert.equal(x.calls.length, 1);
  assert.equal(x.calls[0].url, 'https://www.instagram.com/api/v1/users/web_profile_info/?username=loja');
  assert.equal(x.calls[0].init.headers['X-IG-App-ID'], '936619743392459');
  assert.equal(x.calls[0].init.credentials, 'include');
  assert.equal(x.calls[0].init.redirect, 'manual');
  assert.ok(!/\/users\/\d+\/info\//.test(x.calls[0].url));
  assert.equal(r.contactOutcome, 'found'); assert.equal(r.data.user.public_email, 'v@loja.com');
});
test('reader: 429 com Retry-After numérico salva pausa e registra evidência', async () => {
  const x = deps([{ status: 429, headers: { 'retry-after': '120' }, body: { status: 'fail' } }]);
  const read = R.create(x.d);
  await assert.rejects(read('1', 'loja', () => true), (e) => e.stopCode === 'rate_limit' && e.response.status === 429);
  assert.equal(x.store[K.cooldownKey], x.d.now() + 120000);
  const ev = x.store[K.evidenceKey][0];
  assert.equal(ev.http, 429); assert.equal(ev.retryAfter, '120'); assert.equal(ev.outcome, 'rate_limit');
});
test('reader: 429 sem Retry-After = 60 min; data HTTP respeitada', async () => {
  let x = deps([{ status: 429, body: {} }]);
  await assert.rejects(R.create(x.d)('1', 'loja', null), (e) => e.stopCode === 'rate_limit');
  assert.equal(x.store[K.cooldownKey], x.d.now() + 3600000);
  const when = new Date(1_800_000_000_000 + 7200000).toUTCString();
  x = deps([{ status: 429, headers: { 'retry-after': when }, body: {} }]);
  await assert.rejects(R.create(x.d)('1', 'loja', null));
  assert.equal(x.store[K.cooldownKey], Date.parse(when));
});
test('reader: pausa ativa impede qualquer consulta (inclusive verificação manual)', async () => {
  const x = deps([], { store: { ig_contact_cooldown_until: 1_800_000_000_000 + 1000 } });
  const read = R.create(x.d);
  await assert.rejects(read('1', 'loja', null), (e) => e.stopCode === 'cooldown');
  await assert.rejects(read('', 'loja', null, { probe: true }), (e) => e.stopCode === 'cooldown');
  assert.equal(x.calls.length, 0);
});
test('reader: intervalo mínimo de 10 s entre consultas, serializadas', async () => {
  const waits = [];
  const x = deps([ok(biz({ id: '1', username: 'a' })), ok(biz({ id: '2', username: 'b' }))], { waits });
  const read = R.create(x.d);
  await Promise.all([read('1', 'a', null), read('2', 'b', null)]);
  assert.equal(x.calls.length, 2); assert.equal(x.maxActive, 1);
  assert.ok(x.calls[1].at - x.calls[0].at >= 10000, String(x.calls[1].at - x.calls[0].at));
});
test('reader: evidência sanitizada (campos, flags, e-mail mascarado)', async () => {
  const x = deps([ok(biz({ username: 'loja', business_email: 'vendas@loja.com', should_show_public_contacts: true, business_contact_method: 'UNKNOWN' }))]);
  await R.create(x.d)('1', 'loja', null);
  const ev = x.store[K.evidenceKey][0];
  assert.equal(ev.outcome, 'found'); assert.equal(ev.email, 'v***@loja.com'); assert.equal(ev.http, 200);
  assert.deepEqual(ev.keys, { public_email: 'absent', business_email: 'valid', business_phone_number: 'absent' });
  assert.equal(ev.flags.business_contact_method, 'UNKNOWN');
  assert.ok(ev.userKeys.includes('business_email'));
  // Diagnóstico nunca guarda o e-mail completo (o cache de perfis guarda o resultado, como o histórico).
  assert.ok(!JSON.stringify([x.store[K.evidenceKey], x.store[K.schemaKey]]).includes('vendas@loja.com'));
});
test('reader: perfis sem e-mail (pessoais, omitidos, vazios, ocultos) nunca param a fila', async () => {
  const users = [
    { id: '1', username: 'p1', is_professional_account: false }, { id: '2', username: 'p2', is_professional_account: false },
    biz({ id: '3', username: 'b1' }), biz({ id: '4', username: 'b2' }), biz({ id: '5', username: 'b3' }),
    { id: '6', username: 'c1', is_professional_account: true, is_business_account: false },
    biz({ id: '7', username: 'v1', business_email: null }), biz({ id: '8', username: 'v2', business_email: null, business_contact_method: 'CALL' }),
    biz({ id: '9', username: 'h1', should_show_public_contacts: false }), biz({ id: '10', username: 'f1', business_email: 'f1@loja.com' }),
  ];
  const x = deps(users.map(ok));
  const read = R.create(x.d);
  const outcomes = [];
  for (const u of users) {
    const r = await read(u.id, u.username, null);
    assert.equal(r.commercialSchemaUnsupported, false, u.username);
    outcomes.push(r.contactOutcome);
  }
  assert.deepEqual(outcomes, ['not_professional', 'not_professional', 'omitted', 'omitted', 'omitted', 'omitted', 'empty', 'empty', 'hidden', 'found']);
  assert.equal(x.calls.length, users.length);
  assert.equal(R.blockReason(x.store[K.schemaKey]), '');
  assert.equal(R.unsupported(x.store[K.schemaKey]), false);
});
test('reader: contato oculto/sem campo não conta como consulta incompatível', async () => {
  const x = deps([1, 2, 3, 4].map((i) => ok(biz({ id: String(i), username: 'h' + i, should_show_public_contacts: false }))));
  const read = R.create(x.d);
  for (const i of [1, 2, 3, 4]) assert.equal((await read(String(i), 'h' + i, null)).contactOutcome, 'hidden');
  assert.equal(R.unsupported(x.store[K.schemaKey]), false);
});
test('reader: um perfil com o campo impede a parada por omissão', async () => {
  const x = deps([ok(biz({ id: '1', username: 'b1', business_email: null })), ...[2, 3, 4, 5].map((i) => ok(biz({ id: String(i), username: 'b' + i })))]);
  const read = R.create(x.d);
  for (const i of [1, 2, 3, 4, 5]) assert.equal((await read(String(i), 'b' + i, null)).commercialSchemaUnsupported, false);
});
test('reader: parada por rota salva pela 14-15.2 não bloqueia mais a fila nem a verificação', async () => {
  const blocked = { endpoint: 'instagram_web_profile_info', keysPresent: 3, found: 0, foundUsers: [], withheldProfessional: ['a', 'b', 'c'], omittedProfessional: ['d', 'e', 'f'], omittedOther: 0 };
  const x = deps([ok(biz({ id: '9', username: 'fila', business_email: 'f@x.com' })), ok(biz({ username: 'controle', business_email: 'c@x.com' }))], { store: { [K.schemaKey]: blocked } });
  const read = R.create(x.d);
  assert.equal((await read('9', 'fila', null)).contactOutcome, 'found');
  const r = await read('', 'controle', null, { probe: true });
  assert.equal(r.contactOutcome, 'found'); assert.equal(r.commercialSchemaUnsupported, false);
  assert.equal(x.calls.length, 2);
  assert.equal(x.store[K.evidenceKey][0].probe, true);
});
test('reader: perfil inexistente/404/divergente = resultado por perfil (fila segue)', async () => {
  const x = deps([{ status: 200, body: { data: { user: null }, status: 'ok' } }, { status: 404, body: '' }, ok(biz({ id: '99', username: 'outro' }))]);
  const read = R.create(x.d);
  assert.equal((await read('1', 'apagado', null)).contactOutcome, 'profile_unavailable');
  assert.equal((await read('2', 'sumiu', null)).contactOutcome, 'profile_unavailable');
  const m = await read('3', 'renomeado', null);
  assert.equal(m.contactSkip, true); assert.equal(m.contactOutcome, 'identity_mismatch');
  assert.equal(x.store[K.evidenceKey][0].returnedUsername, 'outro');
});
test('reader: falhas de acesso distintas param sem nova tentativa', async () => {
  const cases = [
    [{ status: 403, body: { message: 'login_required', status: 'fail' } }, 'access'],
    [{ status: 0, type: 'opaqueredirect', body: '' }, 'redirect'],
    [{ status: 200, body: '<!DOCTYPE html><html>Login</html>' }, 'invalid_response'],
    [{ status: 200, body: { status: 'fail', message: 'checkpoint_required' } }, 'access'],
    [{ status: 200, body: { require_login: true, status: 'ok', data: { user: null } } }, 'access'],
    [{ status: 200, body: { graphql: { user: {} }, status: 'ok' } }, 'unexpected_response'],
    [{ status: 500, body: '' }, 'access'],
    [{ throw: new TypeError('Failed to fetch') }, 'network'],
  ];
  for (const [res, code] of cases) {
    const x = deps([res]);
    await assert.rejects(R.create(x.d)('1', 'loja', null), (e) => e.stopCode === code, code);
    assert.equal(x.calls.length, 1);
    assert.equal(x.store[K.evidenceKey][0].outcome, code);
    assert.equal(x.store[K.cooldownKey], undefined, 'falha que não é 429 não cria pausa');
  }
});
test('reader: cancelamento após a resposta guarda em cache (retomada não repete consulta)', async () => {
  const x = deps([ok(biz({ username: 'loja', business_email: 'v@loja.com' }))]);
  const read = R.create(x.d);
  let current = true;
  const p = read('1', 'loja', () => current);
  setTimeout(() => { current = false; }, 1);
  await assert.rejects(p, (e) => e.stopCode === 'cancelled');
  const r = await read('1', 'loja', () => true);
  assert.equal(r.fromCache, true); assert.equal(r.contactOutcome, 'found'); assert.equal(x.calls.length, 1);
});
test('reader: nome inválido não consulta; evidência limitada a 20', async () => {
  const x = deps([]);
  await assert.rejects(R.create(x.d)('1', 'nome inválido!', null), (e) => e.stopCode === 'identity');
  assert.equal(x.calls.length, 0);
  const y = deps(Array.from({ length: 25 }, (_, i) => ok({ id: String(i), username: 'u' + i, is_professional_account: false })));
  const read = R.create(y.d);
  for (let i = 0; i < 25; i++) await read(String(i), 'u' + i, null);
  assert.equal(y.store[K.evidenceKey].length, 20); assert.equal(y.store[K.evidenceKey][0].username, 'u24');
});

const callUser = (id, u) => ok(biz({ id, username: u, business_email: null, business_phone_number: null, business_contact_method: 'CALL', should_show_public_contacts: true }));
test('reader: comerciais com CALL/TEXT e e-mail nulo seguem a fila como "vazio"', async () => {
  const x = deps([ok({ id: '1', username: 'p1', is_professional_account: false }), callUser('2', 'w1'), callUser('3', 'w2'), callUser('4', 'w3'), callUser('5', 'w4'),
    ok(biz({ id: '6', username: 'f1', business_email: 'a@b.com' }))]);
  const read = R.create(x.d);
  assert.equal((await read('1', 'p1', null)).contactOutcome, 'not_professional');
  for (const [id, u] of [['2', 'w1'], ['3', 'w2'], ['4', 'w3'], ['5', 'w4']]) {
    const r = await read(id, u, null);
    assert.equal(r.contactOutcome, 'empty'); assert.equal(r.commercialSchemaUnsupported, false);
  }
  assert.equal((await read('6', 'f1', null)).contactOutcome, 'found');
  assert.equal(x.calls.length, 6);
  assert.ok(x.store[K.evidenceKey].every((e) => e.withheld === false));
  assert.equal(x.store[K.schemaKey].found, 1);
});
test('reader: 429 repetido sinaliza recusa da rota mas NUNCA bloqueia a fila', async () => {
  const x = deps([{ status: 429, headers: { 'retry-after': '60' }, body: {} }]);
  await assert.rejects(R.create(x.d)('1', 'a', null), (e) => e.stopCode === 'rate_limit' && !e.routeRefusing);
  const y = deps([{ status: 429, body: {} }], { store: { [K.schemaKey]: x.store[K.schemaKey] } });
  await assert.rejects(R.create(y.d)('2', 'b', null), (e) => e.routeRefusing === true && e.refusalCount === 2);
  assert.equal(R.routeRefusing(y.store[K.schemaKey]), true);
  // o bloqueio de rota continua reservado a campo omitido/retido
  assert.equal(R.blockReason(y.store[K.schemaKey]), '');
  const z = deps([ok(biz({ id: '3', username: 'c', business_email: 'c@x.com' }))], { store: { [K.schemaKey]: y.store[K.schemaKey] } });
  assert.equal((await R.create(z.d)('3', 'c', null)).contactOutcome, 'found');
  assert.equal(R.routeRefusing(z.store[K.schemaKey]), false);
});
test('reader: HTTP 400 conta como recusa; 403 não', async () => {
  const body = { message: 'feedback_required', status: 'fail' };
  const x = deps([{ status: 400, body: body }]);
  await assert.rejects(R.create(x.d)('1', 'a', null), (e) => e.stopCode === 'access');
  const y = deps([{ status: 400, body: body }], { store: { [K.schemaKey]: x.store[K.schemaKey] } });
  await assert.rejects(R.create(y.d)('2', 'b', null), (e) => e.routeRefusing === true);
  assert.equal(R.blockReason(y.store[K.schemaKey]), '');
  const w = deps([{ status: 403, body: { message: 'login_required' } }, { status: 403, body: { message: 'login_required' } }]);
  const readW = R.create(w.d);
  await assert.rejects(readW('1', 'a', null), (e) => e.stopCode === 'access');
  await assert.rejects(readW('2', 'b', null), (e) => e.stopCode === 'access' && !e.routeRefusing);
  assert.equal(R.routeRefusing(w.store[K.schemaKey]), false);
});
test('reader: uma resposta de perfil real zera as recusas', async () => {
  const x = deps([{ status: 429, body: {} }], {});
  await assert.rejects(R.create(x.d)('1', 'a', null), (e) => e.stopCode === 'rate_limit');
  const y = deps([ok(biz({ id: '2', username: 'b', business_email: 'b@x.com' })), { status: 429, body: {} }], { store: { [K.schemaKey]: x.store[K.schemaKey] } });
  const read = R.create(y.d);
  assert.equal((await read('2', 'b', null)).contactOutcome, 'found');
  assert.equal(y.store[K.schemaKey].refusals, 0);
  assert.equal(y.store[K.schemaKey].responses, 1);
  await assert.rejects(read('3', 'c', null), (e) => e.stopCode === 'rate_limit' && !e.routeRefusing);
});
test('reader: HTTP 404 é resposta de perfil e zera as recusas', async () => {
  const x = deps([{ status: 429, body: {} }]);
  await assert.rejects(R.create(x.d)('1', 'a', null), (e) => e.stopCode === 'rate_limit');
  const y = deps([{ status: 404, body: '' }, { status: 429, body: {} }], { store: { [K.schemaKey]: x.store[K.schemaKey] } });
  const read = R.create(y.d);
  assert.equal((await read('2', 'b', null)).contactOutcome, 'profile_unavailable');
  assert.equal(y.store[K.schemaKey].responses, 1);
  assert.equal(y.store[K.schemaKey].refusals, 0);
  delete y.store[K.cooldownKey];
  await assert.rejects(read('3', 'c', null), (e) => e.stopCode === 'rate_limit' && !e.routeRefusing);
  assert.equal(R.routeRefusing(y.store[K.schemaKey]), false);
});
test('reader: schema antigo (sem contador de respostas) não vira "nunca respondeu"', () => {
  const legacy = { endpoint: 'instagram_web_profile_info', keysPresent: 30, omittedOther: 4, omittedProfessional: ['a', 'b'] };
  const schema = R.readSchema(legacy);
  assert.equal(schema.responses, 36);
  assert.equal(R.routeRefusing(Object.assign({}, legacy, { refusals: 5 })), false);
});
test('reader: divergência de identidade em cache não é servida ao perfil retornado', async () => {
  const x = deps([
    { status: 200, body: { data: { user: { id: '222', username: 'x', is_business_account: true, is_professional_account: true, business_email: 'dono@x.com', should_show_public_contacts: true } }, status: 'ok' } },
    { status: 200, body: { data: { user: { id: '222', username: 'x', is_business_account: true, is_professional_account: true, business_email: 'dono@x.com', should_show_public_contacts: true } }, status: 'ok' } },
  ]);
  const read = R.create(x.d);
  assert.equal((await read('111', 'x', null)).contactOutcome, 'identity_mismatch');
  const owner = await read('222', 'x', null);
  assert.equal(owner.contactOutcome, 'found');
  assert.equal(owner.fromCache, undefined);
  assert.equal(x.calls.length, 2);
  // repetir a MESMA consulta reaproveita o cache (sem nova requisição)
  const again = await read('222', 'x', null);
  assert.equal(again.fromCache, true);
  assert.equal(again.contactOutcome, 'found');
  assert.equal(x.calls.length, 2);
});

test('reader: mensagem do Instagram nunca chega como HTML às notificações', async () => {
  const x = deps([{ status: 403, body: { status: 'fail', message: "<div>Sessão <a href='https://x.y'>aqui</a> & \"z\"</div>" } }]);
  await assert.rejects(R.create(x.d)('1', 'a', null), (e) => !/[<>&]/.test(e.message) && /Sessão/.test(e.message));
  assert.ok(!/[<>&]/.test(x.store[K.evidenceKey][0].message));
});
test('reader: 404 conta como resposta da consulta, mas não como perfil entregue', async () => {
  const x = deps([{ status: 404, body: '' }, ok(biz({ id: '2', username: 'b' }))]);
  const read = R.create(x.d);
  await read('1', 'a', null);
  assert.equal(x.store[K.schemaKey].responses, 1); assert.equal(x.store[K.schemaKey].profiles, 0);
  await read('2', 'b', null);
  assert.equal(x.store[K.schemaKey].responses, 2); assert.equal(x.store[K.schemaKey].profiles, 1);
});
test('reader: não existe mais parada por decisão de rota (blockReason sempre vazio)', () => {
  const old = [
    { endpoint: 'instagram_web_profile_info', keysPresent: 3, found: 0, withheldProfessional: ['a', 'b', 'c'] },
    { endpoint: 'instagram_web_profile_info', keysPresent: 0, omittedProfessional: ['a', 'b', 'c'] },
    undefined, null, {},
  ];
  for (const v of old) { assert.equal(R.blockReason(v), ''); assert.equal(R.unsupported(v), false); }
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
  if (!R.saveCooldown) return; // PATCHED 15.1 or older
  const store = slowStore({ ig_contact_cooldown_until: 0 });
  const locks = realLock();
  await Promise.all([R.saveCooldown(store, locks, 5000), R.saveCooldown(store, locks, 9000), R.saveCooldown(store, locks, 7000)]);
  assert.equal(store.data.ig_contact_cooldown_until, 9000);
});
test('pausa: sem a trava, a mesma corrida perde a pausa maior (defeito corrigido)', async () => {
  const store = slowStore({ ig_contact_cooldown_until: 0 });
  // The pre-15.2 dashboard merge: read, then write max(saved, own), with no lock.
  const unlocked = async (until) => { const saved = await store.get('ig_contact_cooldown_until'); await store.set({ ig_contact_cooldown_until: Math.max(saved.ig_contact_cooldown_until || 0, until) }); };
  await Promise.all([unlocked(9000), unlocked(5000)]);
  assert.equal(store.data.ig_contact_cooldown_until, 5000, 'a gravação mais lenta apagou a pausa maior');
});
test('pausa: uma pausa salva maior nunca é reduzida por um Retry-After menor', async () => {
  if (!R.saveCooldown) return;
  const store = slowStore({ ig_contact_cooldown_until: 50000 });
  const value = await R.saveCooldown(store, realLock(), 20000);
  assert.equal(value, 50000); assert.equal(store.data.ig_contact_cooldown_until, 50000);
});
test('pausa: falha passageira do armazenamento é repetida 1 vez; falha persistente é reportada', async () => {
  if (!R.saveCooldown) return;
  let fails = 1;
  const flaky = { data: {}, get: async () => ({}), set: async (o) => { if (fails-- > 0) throw new Error('quota'); Object.assign(flaky.data, o); } };
  assert.equal(await R.saveCooldown(flaky, realLock(), 1234, async () => {}), 1234);
  assert.equal(flaky.data.ig_contact_cooldown_until, 1234);
  const broken = { get: async () => { throw new Error('Extension context invalidated'); }, set: async () => {} };
  await assert.rejects(R.saveCooldown(broken, realLock(), 1234, async () => {}));
});
test('leitor: 429 com armazenamento quebrado continua sendo 429 e registra pausa NÃO salva', async () => {
  const storage = {
    data: { ig_commercial_web_last_start: 0 },
    get: async (keys) => { const out = {}; [].concat(keys).forEach((k) => { if (k in storage.data) out[k] = storage.data[k]; }); return out; },
    set: async (o) => { if ('ig_contact_cooldown_until' in o) throw new Error('quota'); Object.assign(storage.data, o); },
  };
  const read = R.create({ contacts: P, storage, locks: realLock(), now: () => 1000000, wait: async () => {},
    fetch: async () => ({ status: 429, ok: false, type: 'basic', headers: { get: () => null }, text: async () => '{}' }) });
  await assert.rejects(read('', 'loja_x', null), (e) => e.stopCode === 'rate_limit' && e.cooldownUntil === 1000000 + 3600000);
  const ev = storage.data.ig_commercial_contact_evidence_v14[0];
  assert.equal(ev.http, 429); assert.equal(ev.retryAfter, null);
  if (R.saveCooldown) assert.equal(ev.cooldownSaved, false);
});

/* ---------- PATCHED 15.3: field paths, persistent cache, adaptive spacing ---------- */
test('emailPaths: lista caminhos e tipos de todos os campos de e-mail, sem valores', () => {
  const body = { data: { user: {
    business_email: null, public_email: 'priv@loja.com', business_contact_method: 'CALL', should_show_public_contacts: true,
    nested: { contact_email: 'x@y.com', deep: { email_address: '' } }, links: [{ email: 'z@w.com' }], biography: 'bio@site.com',
  } }, status: 'ok' };
  const paths = R.emailPaths(body);
  for (const p of ['data.user.business_email=null', 'data.user.public_email=texto', 'data.user.business_contact_method=texto',
    'data.user.should_show_public_contacts=boolean', 'data.user.nested.contact_email=texto', 'data.user.nested.deep.email_address=vazio',
    'data.user.links[].email=texto']) assert.ok(paths.includes(p), p + ' em ' + JSON.stringify(paths));
  assert.ok(!JSON.stringify(paths).includes('@'), 'nenhum valor de e-mail');
  assert.ok(!paths.some((p) => p.startsWith('data.user.biography')), 'bio não é campo de e-mail');
  assert.deepEqual(R.emailPaths(null), []); assert.deepEqual(R.emailPaths('<html>'), []);
});
test('leitor: evidência registra os caminhos de e-mail recebidos, sem valores', async () => {
  const x = deps([ok(biz({ username: 'loja', business_email: 'vendas@loja.com', business_contact_method: 'CALL', should_show_public_contacts: true }))]);
  await R.create(x.d)('1', 'loja', null);
  const ev = x.store[K.evidenceKey][0];
  assert.ok(ev.emailPaths.includes('data.user.business_email=texto'));
  assert.ok(ev.emailPaths.includes('data.user.business_contact_method=texto'));
  assert.ok(!JSON.stringify(ev.emailPaths).includes('vendas'));
  const y = deps([{ status: 429, body: { message: 'Please wait a few minutes', status: 'fail' } }]);
  await assert.rejects(R.create(y.d)('1', 'loja', null), (e) => e.stopCode === 'rate_limit');
  assert.equal(y.store[K.evidenceKey][0].emailPaths, undefined, '429 não lê o corpo');
});
test('cache persistente: o mesmo perfil não é consultado de novo em outra extração', async () => {
  const x = deps([ok(biz({ id: '1', username: 'loja', business_email: 'v@loja.com' }))]);
  const first = await R.create(x.d)('1', 'loja', null);
  assert.equal(first.contactOutcome, 'found'); assert.equal(x.calls.length, 1);
  assert.ok(x.store[K.profileCacheKey]['instagram_web_profile_info:loja']);
  // Novo leitor = outra aba/extração, mesmo armazenamento.
  x.advance(60000);
  const again = await R.create(x.d)('1', '@Loja', null);
  assert.equal(again.fromCache, true); assert.equal(again.contactOutcome, 'found'); assert.equal(again.data.user.public_email, 'v@loja.com');
  assert.equal(x.calls.length, 1, 'nenhuma nova consulta');
});
test('cache persistente: id diferente, validade vencida e verificação manual consultam de novo', async () => {
  const x = deps([
    ok(biz({ id: '1', username: 'loja', business_email: 'v@loja.com' })),
    ok(biz({ id: '2', username: 'loja', business_email: 'novo@loja.com' })),
    ok(biz({ id: '2', username: 'loja', business_email: 'novo@loja.com' })),
    ok(biz({ id: '2', username: 'loja', business_email: 'novo@loja.com' })),
  ]);
  await R.create(x.d)('1', 'loja', null);
  // O nome passou para outra conta: o cache do id 1 não serve ao id 2.
  x.advance(20000);
  assert.equal((await R.create(x.d)('2', 'loja', null)).fromCache, undefined);
  assert.equal(x.calls.length, 2);
  // Validade de 14 dias para perfis respondidos.
  x.advance(15 * 864e5);
  assert.equal((await R.create(x.d)('2', 'loja', null)).fromCache, undefined);
  assert.equal(x.calls.length, 3);
  // A verificação manual sempre faz a consulta real.
  x.advance(20000);
  const probe = await R.create(x.d)('', 'loja', null, { probe: true });
  assert.equal(probe.fromCache, undefined); assert.equal(x.calls.length, 4);
});
test('cache persistente: indisponível vale 3 dias; divergência de identidade não é guardada', async () => {
  const x = deps([{ status: 404, body: '' }, { status: 404, body: '' }, ok(biz({ id: '99', username: 'outro' })), ok(biz({ id: '99', username: 'outro' }))]);
  await R.create(x.d)('1', 'sumiu', null);
  x.advance(2 * 864e5);
  assert.equal((await R.create(x.d)('1', 'sumiu', null)).fromCache, true);
  x.advance(2 * 864e5);
  assert.equal((await R.create(x.d)('1', 'sumiu', null)).fromCache, undefined);
  assert.equal(x.calls.length, 2);
  x.advance(20000);
  assert.equal((await R.create(x.d)('3', 'renomeado', null)).contactOutcome, 'identity_mismatch');
  assert.equal(x.store[K.profileCacheKey]['instagram_web_profile_info:renomeado'], undefined);
  x.advance(20000);
  await R.create(x.d)('3', 'renomeado', null);
  assert.equal(x.calls.length, 4);
});
test('cache persistente: limite de 3000 perfis descarta os mais antigos', async () => {
  const now = 1_800_000_000_000, big = {};
  for (let i = 0; i < 3000; i++) big['instagram_web_profile_info:u' + i] = { at: now - 864e5 + i, userId: String(i), result: { contactOutcome: 'empty' } };
  const x = deps([ok(biz({ id: 'n', username: 'novo' }))], { store: { [K.profileCacheKey]: big } });
  await R.create(x.d)('n', 'novo', null);
  const cache = x.store[K.profileCacheKey];
  assert.equal(Object.keys(cache).length, 3000);
  assert.ok(cache['instagram_web_profile_info:novo']); assert.equal(cache['instagram_web_profile_info:u0'], undefined);
});
test('cache persistente: falha do armazenamento do cache não muda o resultado', async () => {
  const x = deps([ok(biz({ id: '1', username: 'loja', business_email: 'v@loja.com' }))]);
  const set = x.d.storage.set;
  x.d.storage.set = async (o) => { if (K.profileCacheKey in o) throw new Error('quota'); return set(o); };
  const r = await R.create(x.d)('1', 'loja', null);
  assert.equal(r.contactOutcome, 'found');
});
test('ritmo adaptativo: 429 dobra o intervalo (até 2 min); 5 respostas seguidas reduzem 20%', async () => {
  const x = deps([{ status: 429, body: {} }]);
  await assert.rejects(R.create(x.d)('1', 'a', null), (e) => e.stopCode === 'rate_limit');
  assert.equal(x.store[K.pacingKey].spacing, 20000);
  const y = deps([{ status: 429, body: {} }], { store: { [K.pacingKey]: { spacing: 90000, okStreak: 3 } } });
  await assert.rejects(R.create(y.d)('1', 'a', null));
  assert.deepEqual(y.store[K.pacingKey], { spacing: R.maxSpacing, okStreak: 0 });
  const users = [1, 2, 3, 4, 5, 6].map((i) => biz({ id: String(i), username: 'u' + i }));
  const waits = [];
  const z = deps(users.map(ok), { store: { [K.pacingKey]: { spacing: 40000, okStreak: 0 } }, waits });
  const read = R.create(z.d);
  for (const u of users.slice(0, 5)) await read(u.id, u.username, null);
  assert.deepEqual(z.store[K.pacingKey], { spacing: 32000, okStreak: 0 });
  for (let i = 1; i < 5; i++) assert.ok(z.calls[i].at - z.calls[i - 1].at >= 40000, 'intervalo de 40 s respeitado');
  await read('6', 'u6', null);
  assert.ok(z.calls[5].at - z.calls[4].at >= 32000 && z.calls[5].at - z.calls[4].at < 40000);
  const base = deps([ok(biz({ id: '1', username: 'a' }))], { store: { [K.pacingKey]: { spacing: 1, okStreak: 0 } } });
  await R.create(base.d)('1', 'a', null);
  assert.ok(base.store[K.pacingKey].spacing >= R.baseSpacing, 'nunca abaixo de 10 s');
});
test('ritmo adaptativo: intervalo salvo maior vale para todas as abas, sem consulta durante a espera', async () => {
  const waits = [];
  const x = deps([ok(biz({ id: '1', username: 'a' }))], { store: { [K.pacingKey]: { spacing: 80000, okStreak: 0 }, ig_commercial_web_last_start: 1_800_000_000_000 - 1000 }, waits });
  await R.create(x.d)('1', 'a', null);
  assert.deepEqual(waits, [79000]);
  assert.equal(x.calls[0].at, 1_800_000_000_000 + 79000);
});
test('ritmo adaptativo: a pausa 429 continua valendo depois do intervalo', async () => {
  // Pausa salva por outra aba durante a espera do intervalo: nenhuma consulta sai.
  const x = deps([], { store: { [K.pacingKey]: { spacing: 30000, okStreak: 0 }, ig_commercial_web_last_start: 1_800_000_000_000 } });
  x.d.wait = async (ms) => { x.advance(ms); x.store[K.cooldownKey] = x.d.now() + 3600000; };
  await assert.rejects(R.create(x.d)('1', 'a', null), (e) => e.stopCode === 'cooldown');
  assert.equal(x.calls.length, 0);
});

