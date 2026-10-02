/* Unit tests for PATCHED 14 parser and reader. All responses are SIMULATED. */
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
  assert.deepEqual(c.keys, { public_email: 'absent', business_email: 'valid' });
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
  const lockQueue = [];
  let locked = false;
  return {
    store, calls, get maxActive() { return maxActive; }, advance(ms) { clock += ms; },
    d: {
      contacts: P,
      storage: {
        get: async (keys) => { const out = {}; [].concat(keys).forEach((k) => { if (k in store) out[k] = JSON.parse(JSON.stringify(store[k])); }); return out; },
        set: async (obj) => { Object.assign(store, JSON.parse(JSON.stringify(obj))); },
      },
      locks: { request: async (name, fn) => {
        while (locked) await new Promise((r) => lockQueue.push(r));
        locked = true;
        try { return await fn(); } finally { locked = false; const next = lockQueue.shift(); if (next) next(); }
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
  assert.deepEqual(ev.keys, { public_email: 'absent', business_email: 'valid' });
  assert.equal(ev.flags.business_contact_method, 'UNKNOWN');
  assert.ok(ev.userKeys.includes('business_email'));
  assert.ok(!JSON.stringify(x.store).includes('vendas@loja.com'));
});
test('reader: pessoais sem campo não bloqueiam; 3 profissionais omitidos bloqueiam', async () => {
  const x = deps([
    ok({ id: '1', username: 'p1', is_professional_account: false }), ok({ id: '2', username: 'p2', is_professional_account: false }),
    ok({ id: '3', username: 'p3', is_professional_account: false }), ok({ id: '4', username: 'p4', is_professional_account: false }),
    ok(biz({ id: '5', username: 'b1' })), ok(biz({ id: '6', username: 'b2' })),
    ok({ id: '7', username: 'c1', is_professional_account: true, is_business_account: false }),
  ]);
  const read = R.create(x.d);
  for (const [id, u] of [['1', 'p1'], ['2', 'p2'], ['3', 'p3'], ['4', 'p4']]) {
    const r = await read(id, u, null);
    assert.equal(r.contactOutcome, 'not_professional'); assert.equal(r.commercialSchemaUnsupported, false);
  }
  assert.equal((await read('5', 'b1', null)).commercialSchemaUnsupported, false);
  assert.equal((await read('6', 'b2', null)).commercialSchemaUnsupported, false);
  const third = await read('7', 'c1', null);
  assert.equal(third.contactOutcome, 'omitted'); assert.equal(third.commercialSchemaUnsupported, true);
  await assert.rejects(read('8', 'b3', null), (e) => e.stopCode === 'unsupported');
  assert.equal(x.calls.length, 7);
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
test('reader: verificação manual reavalia a decisão com evidência real', async () => {
  const blocked = { endpoint: 'instagram_web_profile_info', keysPresent: 0, keysPresentUsers: [], omittedProfessional: ['a', 'b', 'c'], omittedOther: 0 };
  const x = deps([ok(biz({ username: 'controle', business_email: 'c@x.com' }))], { store: { [K.schemaKey]: blocked } });
  const read = R.create(x.d);
  await assert.rejects(read('9', 'fila', null), (e) => e.stopCode === 'unsupported');
  const r = await read('', 'controle', null, { probe: true });
  assert.equal(r.contactOutcome, 'found'); assert.equal(r.commercialSchemaUnsupported, false);
  assert.equal(R.unsupported(x.store[K.schemaKey]), false);
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
