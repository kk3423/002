import re, shutil, subprocess, os, sys, tempfile
# Usage (from the repository folder): python3 tests/mutate155.py <extracted extension> <PATCHED 13 folder> [e2e]
# Injects one defect at a time into a copy of the extension and runs the suites; every defect must break at
# least one test. Without "e2e": unit + data suites (fast). With "e2e": the Chromium scenario named for each
# defect is also run (slow) -- see MUT_E2E.
S = os.getcwd()
SRC = os.path.abspath(sys.argv[1])
ORIG = os.path.abspath(sys.argv[2])
E2E = len(sys.argv) > 3 and sys.argv[3] == 'e2e'
MUT = [
 ('A: pausa 429 ignorada (assertOpen não lança)', 'commercial-profile-reader.js',
  'throw cooldown;', '/* mutated */'),
 ('B: erro 5xx vira "perfil indisponível" (falha lida como resultado)', 'commercial-profile-reader.js',
  'if (status >= 500) throw failure(entry, "temporary_error", "temporary",', 'if (status >= 500) return skip("profile_unavailable", entry, userId); throw failure(entry, "temporary_error", "temporary",'),
 ('C: cache por user id desligado', 'commercial-profile-reader.js',
  'var stored = probe ? null : cachedProfile(saved, userId);', 'var stored = null;'),
 ('D: fila persistente ignorada na retomada', 'dashboard.js',
  'var saved = comment && queue && 154 === queue.v && "string" === typeof queue.cursor ? queue : null;', 'var saved = null;'),
 ('E: business_email com prioridade sobre public_email', 'public-contact-parser.js',
  'var emailFields = ["public_email", "business_email"];', 'var emailFields = ["business_email", "public_email"];'),
 ('F: 3 indisponíveis seguidos voltam a pausar a fila', 'dashboard.js',
  'if (t.consecutiveUnavailableProfiles >= 10) {', 'if (t.consecutiveUnavailableProfiles >= 3) {'),
 ('G: HTML de login lido como "sem e-mail" (resposta inválida)', 'commercial-profile-reader.js',
  'if (/^\\s*</.test(body)) throw refused(entry, status, "login_required");', 'if (/^\\s*</.test(body)) return skip("profile_unavailable", entry, userId);'),
 ('H: o Comment volta a consultar a rota web', 'dashboard.js',
  'return m.a.get(this.configs.ApiUserInfoDetail.url.replace("${@}$", userId), {', 'return m.a.get("https://www.instagram.com/api/v1/users/web_profile_info/?username=" + userId, {'),
 # PATCHED 15.5
 ('I: identidade comparada só como texto (id acima de 2^53 volta a divergir)', 'public-contact-parser.js',
  'return found.exact ? found.id === want : Number(want) === Number(found.id);',
  'return found.id === want;'),
 ('J: a linha recebe o id devolvido (arredondado) em vez do id pedido', 'commercial-profile-reader.js',
  'detail.contactUserId = userId;', 'detail.contactUserId = returnedId;'),
 ('K: telefone da bio/link contado como telefone público', 'public-contact-parser.js',
  'result.phonePublished = !!result.phone && result.phoneSource !== "biography" && result.phoneSource !== "profile_link";', 'result.phonePublished = !!result.phone;'),
 ('L: rota presumida gravada como se tivesse sido enviada', 'commercial-profile-reader.js',
  'var entry = { at: deps.now(), endpoint: endpoint, username: username,', 'var entry = { at: deps.now(), endpoint: endpoint, sentRoute: "GET /api/v1/users/{id}/info/", username: username,'),
 ('M: linha sem a chave do telefone exporta "undefined"', 'public-contact-parser.js',
  'copy.phone = text(row && row.phone);', ''),
 ('N: telefone da bio conta na prova de telefone público', 'commercial-profile-reader.js',
  'if (contact.phonePublished) {', 'if (contact.phone) {'),
 ('O: a máscara devolve o telefone inteiro', 'public-contact-parser.js',
  'return plus + head + new Array(digits.length - head.length - tail.length + 1).join("*") + tail;', 'return s;'),
 ('P: e-mail da bio usado como substituto do campo público', 'public-contact-parser.js',
  'if (result.email) result.emailKind = "commercial_contact";',
  'if (!result.email) { var fromBio = emailInText(bio); if (fromBio) { result.email = fromBio; result.emailStatus = "found"; result.emailSource = "public_email"; } }\n    if (result.email) result.emailKind = "commercial_contact";'),
 ('Q: contato oculto pelo perfil ainda entrega o telefone', 'public-contact-parser.js',
  'var visible = !hidden(user.should_show_public_contacts);', 'var visible = true;'),
 ('R: o Comment volta a ler a resposta com as chaves do servidor', 'dashboard.js',
  'return 4 === this.type ? {', 'return false ? {'),
 ('S: exportação do dashboard ignora as linhas das sessões anteriores', 'dashboard.js',
  'return this.lastExtractData && this.lastExtractData.length\n              ? this.mergeExtractRows(this.lastExtractData, rows)\n              : rows.map(window.IGPublicContacts.commercialRow);',
  'return rows.map(window.IGPublicContacts.commercialRow);'),
 ('T: ids exatos contraditórios na mesma resposta passam se UM bater', 'public-contact-parser.js',
  'return found.exact ? found.id === want : Number(want) === Number(found.id);',
  'return ids.some(function (f) { return f.exact ? f.id === want : Number(want) === Number(f.id); });'),
 ('U: rota presumida pela 15.4 volta a ser mostrada como enviada', 'dashboard.js',
  'return item && item.sentRoute; })[0];', 'return item && (item.sentRoute || item.route); })[0];'),
 ('V: id numérico arredondado da lista de comentários não é trocado pelo exato', 'dashboard.js',
  'var rounded = "number" === typeof current && !Number.isSafeInteger(current);', 'var rounded = false;'),
 ('W: texto que não é telefone volta a ser "campo vazio ou oculto"', 'public-contact-parser.js',
  'result.phoneKeys[field] = state === "present" && !validPhone(user[field], user.public_phone_country_code) ? "invalid" : state;', 'result.phoneKeys[field] = state;'),
 ('X: a máscara mostra 3 dígitos do início sem o "+"', 'public-contact-parser.js',
  'var head = plus ? digits.slice(0, 2) : "", tail = digits.slice(-2);', 'var head = digits.slice(0, plus ? 2 : 3), tail = digits.slice(-2);'),
 ('Y: o quadro de validação deixa de ser mostrado no painel (showValidationCard vazio)', 'dashboard.js',
  'this.validationCard = { type: type, html: html, at: Date.now() };', '/* mutated */'),
 ('Z: o quadro volta a flutuar sobre os botões (posição fixa no canto inferior direito)', 'dashboard.js',
  'staticStyle: { "text-align": "left", "font-size": "13px",', 'staticStyle: { position: "fixed", bottom: "32px", right: "32px", width: "600px", "z-index": 1000, "text-align": "left", "font-size": "13px",'),
]
# Chromium scenario that must also notice each defect (run with "e2e")
MUT_E2E = {'X': ['matriz:comment'], 'A': ['recarregar_extensao'], 'B': ['erros_http'], 'C': ['dedup'], 'D': ['fechar_reabrir'], 'K': ['matriz:comment'], 'P': ['matriz:comment'],
           'Q': ['matriz:comment'], 'S': ['recarregar_extensao'], 'Y': ['botoes_comment'], 'Z': ['quadro_janelas']}
results = []
pending = []   # (index in results, mutated dir, scenarios) for the Chromium phase
for name, f, a, b in MUT:
    d = tempfile.mkdtemp(prefix='mut-')
    shutil.rmtree(d, ignore_errors=True); shutil.copytree(SRC, d)
    p = d + '/' + f
    s = open(p, encoding='utf-8').read()
    if s.count(a) != 1:
        results.append([name, 'ANCORA NAO ENCONTRADA (%d)' % s.count(a), []]); shutil.rmtree(d, ignore_errors=True); continue
    open(p, 'w', encoding='utf-8').write(s.replace(a, b))
    env = dict(os.environ, EXT_DIR=d, ORIG_DIR=ORIG)
    def run(cmd):
        r = subprocess.run(['node', '--test', '--test-reporter=spec'] + cmd, cwd=S, env=env, capture_output=True, text=True)
        out = r.stdout + r.stderr
        fail = re.search(r'ℹ fail (\d+)', out); tests = re.search(r'ℹ tests (\d+)', out)
        return int(fail.group(1)) if fail else -1, int(tests.group(1)) if tests else -1, [l for l in out.split('\n') if l.startswith('✖')][:3]
    uf, ut, un = run(['tests/unit.test.js'])
    df, dt, dn = run(['tests/node/data.test.js'])
    results.append([name, 'unit %d/%d falham, dados %d/%d falham' % (uf, ut, df, dt), (un + dn)[:2]])
    key = name.split(':')[0]
    if E2E and key in MUT_E2E: pending.append((len(results) - 1, d, MUT_E2E[key]))
    else: shutil.rmtree(d, ignore_errors=True)
if pending:
    from concurrent.futures import ThreadPoolExecutor
    def chromium(item):
        idx, d, scenarios = item
        r = subprocess.run(['node', 'tests/e2e/final.js', d, 'mut'] + scenarios, cwd=S, env=dict(os.environ), capture_output=True, text=True, timeout=2400)
        fails = [l for l in (r.stdout + r.stderr).split('\n') if l.startswith('FAIL')]
        shutil.rmtree(d, ignore_errors=True)
        return idx, scenarios, fails
    with ThreadPoolExecutor(max_workers=int(os.environ.get('MUT_PAR', '3'))) as pool:
        for idx, scenarios, fails in pool.map(chromium, pending):
            results[idx][1] += ' | Chromium %s: %d verificações falham' % (','.join(scenarios), len(fails))
            results[idx][2] = list(results[idx][2]) + [x[:140] for x in fails[:2]]
caught = 0
for r in results:
    print(r[0]); print('   ->', r[1]); [print('      ', x[:150]) for x in r[2]]
    if re.search(r'(unit [1-9]\d*/|dados [1-9]\d*/|Chromium [^:]+: [1-9]\d* verifica)', r[1]): caught += 1
print('\n%d de %d defeitos detectados' % (caught, len(MUT)))
