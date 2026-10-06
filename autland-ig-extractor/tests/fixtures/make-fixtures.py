#!/usr/bin/env python3
"""Builds the anonymised fixtures used by the 15.4 tests.

Input: real third-party public captures of Instagram answers (kept outside the repo).
Output: the same JSON structure (keys, nesting, types, booleans, enums) with every personal
value replaced. Nothing here is a live answer; nothing was fetched while building it.

  info-business.json      real shape of GET /api/v1/users/{id}/info/  (business, public_email filled)
  info-creator.json       same route shape, creator account (account_type 3), public_email filled
  info-business-empty.json  info-business with public_email = "" (profile publishes no email)
  web-business-null.json  real shape of GET /api/v1/users/web_profile_info/  (business_email null,
                          business_contact_method CALL, contacts displayed): the answer the 15.3 flow reads
"""
import json, re, sys, copy

SRC = sys.argv[1]            # directory with the captures
OUT = sys.argv[2]            # tests/fixtures
FAKE_PK = 1000000001

def anon(node, key=''):
    k = key.lower()
    if isinstance(node, dict):
        return {a: anon(b, a) for a, b in node.items()}
    if isinstance(node, list):
        return [anon(x, key) for x in node]
    if node is None or isinstance(node, bool):
        return node
    if isinstance(node, (int, float)):
        if k in ('pk', 'id', 'pk_id', 'fbid', 'eimu_id', 'strong_id__', 'profile_pic_id', 'interop_messaging_user_fbid'):
            return FAKE_PK
        if 'lat' in k or 'lng' in k or 'long' in k or 'zip' in k:
            return 0
        if k.endswith('_count') or k == 'count':
            return 1234 if node else 0
        return node
    s = node
    if k in ('pk', 'id', 'pk_id', 'fbid', 'eimu_id', 'strong_id__', 'profile_pic_id', 'interop_messaging_user_fbid'):
        return str(FAKE_PK) if re.fullmatch(r'[\d_]+', s) else 'id-exemplo'
    if 'email' in k:
        return 'contato@exemplo.com.br' if s.strip() else s
    if 'phone' in k:
        return '11900000000' if s.strip() and 'country' not in k else s
    if k == 'username':
        return 'perfil_exemplo'
    if k in ('full_name', 'name', 'title'):
        return 'Perfil Exemplo' if s.strip() else s
    if k in ('biography', 'raw_text', 'text'):
        return 'Bio de exemplo' if s.strip() else s
    if 'url' in k or k == 'src' or s.startswith('http'):
        return 'https://exemplo.com.br/recurso' if s.strip() else s
    if k in ('city_name', 'city'):
        return 'Cidade Exemplo'
    if k in ('address_street', 'street_address', 'address'):
        return 'Rua Exemplo, 100'
    if '@' in s:
        return 'contato@exemplo.com.br'
    return s

def load(name):
    return json.load(open(f'{SRC}/{name}'))

# real mobile-shape captures (public captures of the user-info answer): body = { user: {...}, status }
biz = load('pin_profile-usernameinfo-artem_pakhniuk.json')['body']
cre = load('junvu95.json')
info_business = anon(biz)
info_business['status'] = 'ok'
info_creator = {'user': anon(cre), 'status': 'ok'}
empty = copy.deepcopy(info_business)
empty['user']['public_email'] = ''
# real web-shape capture (business, contacts displayed, CALL): the body is { data: { user } , status }
web = load('garyvee.json')['response']['body']
web = anon(web)
web['data']['user']['business_email'] = None
web['status'] = 'ok'

for name, obj in [('info-business.json', info_business), ('info-creator.json', info_creator),
                  ('info-business-empty.json', empty), ('web-business-null.json', web)]:
    text = json.dumps(obj, ensure_ascii=False, indent=1, sort_keys=True)
    assert not re.search(r'[A-Za-z0-9._%+-]+@(?!exemplo\.com\.br)[A-Za-z0-9.-]+', text), name
    open(f'{OUT}/{name}', 'w', encoding='utf-8').write(text + '\n')
    print(name, len(text))
