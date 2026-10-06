import re, shutil, subprocess, os, sys
# Usage (from the repository folder): python3 tests/mutate154.py <extracted extension> <PATCHED 13 folder>
import tempfile
S = os.getcwd()
SRC = os.path.abspath(sys.argv[1])
ORIG = os.path.abspath(sys.argv[2])
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
]
results = []
for name, f, a, b in MUT:
    d = tempfile.mkdtemp(prefix='mut-')
    shutil.rmtree(d, ignore_errors=True); shutil.copytree(SRC, d)
    p = d + '/' + f
    s = open(p, encoding='utf-8').read()
    if s.count(a) != 1:
        results.append((name, 'ANCORA NAO ENCONTRADA (%d)' % s.count(a))); continue
    open(p, 'w', encoding='utf-8').write(s.replace(a, b))
    env = dict(os.environ, EXT_DIR=d, ORIG_DIR=ORIG)
    def run(cmd):
        r = subprocess.run(['node', '--test', '--test-reporter=spec'] + cmd, cwd=S, env=env, capture_output=True, text=True)
        out = r.stdout + r.stderr
        fail = re.search(r'ℹ fail (\d+)', out); tests = re.search(r'ℹ tests (\d+)', out)
        return int(fail.group(1)) if fail else -1, int(tests.group(1)) if tests else -1, [l for l in out.split('\n') if l.startswith('✖')][:3]
    uf, ut, un = run(['tests/unit.test.js'])
    df, dt, dn = run(['tests/node/data.test.js'])
    results.append((name, 'unit %d/%d falham, dados %d/%d falham' % (uf, ut, df, dt), (un + dn)[:2]))
    shutil.rmtree(d, ignore_errors=True)
for r in results:
    print(r[0]); print('   ->', r[1]); [print('      ', x[:120]) for x in (r[2] if len(r) > 2 else [])]
