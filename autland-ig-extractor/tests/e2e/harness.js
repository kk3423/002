/* E2E harness: loads the unpacked extension in Chromium and drives the real
 * dashboard in Comment mode. EVERY network request is intercepted:
 *   - Parse backend (igemailextractor.echobot.dev) -> canned responses
 *   - Instagram comment list (test-only URL from the mocked remote config)
 *   - Instagram web_profile_info -> scenario fixtures (simulated, not real)
 *   - anything else -> aborted and logged as "blocked"
 * No request ever leaves the machine. */
const { chromium } = require('playwright');
const fs = require('fs'), os = require('os'), path = require('path');

const PIXEL = 'data:image/gif;base64,R0lGODlhAQABAAAAACw=';
const COMMENTS_URL = 'https://www.instagram.com/__test__/comments/${postId}/?cursor=${cursor}';

function findVmSource() {
  return `(() => {
    for (const el of document.querySelectorAll('*')) {
      let vm = el.__vue__;
      while (vm) { if (vm.$data && Object.prototype.hasOwnProperty.call(vm.$data, 'followList')) return vm; vm = vm.$parent; }
    }
    return null;
  })()`;
}

function parseResult(name, state, params, scenario) {
  switch (name) {
    case 'getConfigs':
      return {
        status: 'ok', objectId: 'cfgTest', trialCount: 1000, ClaimSessionStorageKey: 'claimTest',
        apiUserForComment: {
          url: COMMENTS_URL,
          noExistCheckKey: 'data.status', noExistCheckValue: 'ok',
          checkKey: 'data.status', checkValue: 'ok',
          dataKeys: 'data.comments|data.next_cursor|data.has_more|data.comment_count',
          itemsDataKeys: 'user.pk|user.username|user.profile_pic_url',
        },
        // Test-only list endpoints (served by the harness) for the other modes.
        apiUserForLike: {
          url: 'https://www.instagram.com/__test__/likers/${postId}/?cursor=${cursor}',
          noExistCheckKey: 'data.status', noExistCheckValue: 'ok', checkKey: 'data.status', checkValue: 'ok',
          dataKeys: 'data.users|data.next_cursor|data.has_more|data.user_count',
          itemsDataKeys: 'pk|username|full_name|profile_pic_url',
        },
        apiUserForHashTag: {
          url: 'https://www.instagram.com/__test__/tag/${tagName}/?cursor=${cursor}',
          noExistCheckKey: 'data.status', noExistCheckValue: 'ok', checkKey: 'data.status', checkValue: 'ok',
          dataKeys: 'data.items|data.next_cursor|data.has_more|data.pic|data.name|data.count',
          itemsDataKeys: 'user.pk|user.username',
        },
        apiUserForLocation: {
          url: 'https://www.instagram.com/__test__/loc/${locationId}/?cursor=${cursor}',
          noExistCheckKey: 'data.status', noExistCheckValue: 'ok', checkKey: 'data.status', checkValue: 'ok',
          dataKeys: 'data.items|data.next_cursor|data.has_more|data.name|data.count',
          itemsDataKeys: 'user.pk|user.username',
        },
      };
    case 'u': return { isPro: true };
    case 'getUseCount': return 0;
    case 'getHistoryItem':
      // Resume test: hand back the history as the server stored it from the last updates.
      if (scenario && scenario.resumeHistory && state.lastHistory) {
        const h = state.lastHistory;
        return { __type: 'Object', className: 'History', objectId: 'histTest', token: 'tok', updateTimes: state.historyUpdates,
          scrapedCount: h.scrapedCount || 0, cursorScrapedCount: h.cursorScrapedCount || 0, count: h.count || 0,
          lastCursor: h.lastCursor || '', customUserList: state.customUserList || '' };
      }
      return null;
    case 'addHistoryItem':
    case 'updateHistory':
      state.historyUpdates++;
      if (name === 'addHistoryItem' && params && typeof params.customUserList === 'string') state.customUserList = params.customUserList;
      if (name === 'updateHistory' && params) { state.lastHistory = Object.assign({}, state.lastHistory || {}, params); (state.historyLog = state.historyLog || []).push(params); }
      return { __type: 'Object', className: 'History', objectId: 'histTest', token: 'tok',
        updateTimes: state.historyUpdates, scrapedCount: 0, cursorScrapedCount: 0, count: 0, customUserList: state.customUserList || '' };
    default: return null;
  }
}

async function launch(extDir, label) {
  const udd = fs.mkdtempSync(path.join(os.tmpdir(), 'pw-' + label + '-'));
  const ctx = await chromium.launchPersistentContext(udd, {
    channel: 'chromium', headless: true, acceptDownloads: true,
    args: [`--disable-extensions-except=${extDir}`, `--load-extension=${extDir}`],
  });
  await ctx.addCookies([
    { name: 'ds_user_id', value: '999000111', domain: '.instagram.com', path: '/', secure: true },
    { name: 'csrftoken', value: 'csrfTEST', domain: '.instagram.com', path: '/', secure: true },
  ]);
  await ctx.addInitScript(() => {
    if (location.protocol === 'chrome-extension:') {
      // Record every toast/notification text: they auto-dismiss before a poll can see them.
      window.__toasts = [];
      const startToastRecorder = () => {
        const root = document.body || document.documentElement;
        if (!root) { setTimeout(startToastRecorder, 50); return; }
        const seen = new WeakSet();
        new MutationObserver(() => {
          document.querySelectorAll('.toast, .notification').forEach((el) => {
            if (seen.has(el)) return;
            seen.add(el);
            const text = (el.innerText || '').trim();
            if (text) window.__toasts.push(text);
          });
        }).observe(root, { childList: true, subtree: true });
      };
      if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', startToastRecorder, { once: true });
      else startToastRecorder();
      localStorage.setItem('Parse/echobot-igemailextractor/currentUser', JSON.stringify({
        objectId: 'userTest', username: 'tester', sessionToken: 'r:test',
        createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z' }));
    }
  });
  // Extension ID is derived from the manifest key, so the test never depends on
  // catching the (idle-terminated) MV3 service worker.
  const key = JSON.parse(fs.readFileSync(path.join(extDir, 'manifest.json'), 'utf8')).key;
  const hex = require('crypto').createHash('sha256').update(Buffer.from(key, 'base64')).digest('hex').slice(0, 32);
  const id = hex.split('').map((c) => String.fromCharCode(97 + parseInt(c, 16))).join('');
  return { ctx, id, udd };
}

/* scenario: { comments: [{pk, username}], profiles: {username: (n, req) => response}, ... } */
async function install(ctx, scenario, log) {
  const state = { historyUpdates: 0, profileCalls: {} };
  await ctx.route('**/*', async (route) => {
    const req = route.request(), url = req.url(), t = Date.now();
    if (url.startsWith('chrome-extension://') || url.startsWith('data:')) return route.continue();
    const u = new URL(url);
    if (u.host === 'igemailextractor.echobot.dev' && u.pathname.startsWith('/parse/functions/')) {
      const name = u.pathname.split('/').pop();
      let params = null;
      try { params = JSON.parse(req.postData() || '{}'); } catch (e) { params = null; }
      log.push({ t, kind: 'parse', name });
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ result: parseResult(name, state, params, scenario) }) });
    }
    const testList = u.host === 'www.instagram.com' && u.pathname.match(/^\/__test__\/(likers|tag|loc)\//);
    if (testList) {
      log.push({ t, kind: 'list', list: testList[1], url });
      const users = scenario.listUsers || [];
      const body = testList[1] === 'likers'
        ? { status: 'ok', users: users.map((x) => ({ pk: String(x.pk), username: x.username, full_name: 'Nome ' + x.username, profile_pic_url: PIXEL })), next_cursor: '', has_more: false, user_count: users.length }
        : { status: 'ok', items: users.map((x) => ({ user: { pk: String(x.pk), username: x.username } })), next_cursor: '', has_more: false, pic: PIXEL, name: 'teste', count: users.length };
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(body) });
    }
    if (u.host === 'www.instagram.com' && u.pathname.startsWith('/__test__/comments/')) {
      log.push({ t, kind: 'comments', url });
      if (scenario.commentsStatus) return route.fulfill({ status: scenario.commentsStatus, contentType: 'application/json', body: JSON.stringify({ status: 'fail', message: 'login_required' }) });
      const comments = scenario.comments.map((c) => ({ user: { pk: String(c.pk), username: c.username, full_name: c.full_name || c.username, profile_pic_url: PIXEL } }));
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ status: 'ok', comments, next_cursor: '', has_more: false, comment_count: comments.length }) });
    }
    if (u.host === 'www.instagram.com' && u.pathname === '/api/v1/users/web_profile_info/') {
      const username = u.searchParams.get('username');
      const n = (state.profileCalls[username] = (state.profileCalls[username] || 0) + 1);
      const headers = req.headers();
      log.push({ t, kind: 'profile', username, n, headers: { 'x-ig-app-id': headers['x-ig-app-id'], 'user-agent': headers['user-agent'] ? 'present' : 'absent' } });
      const fixture = scenario.profiles[username];
      const res = fixture ? fixture(n, req) : { status: 500, body: { status: 'fail', message: 'no fixture' } };
      const body = typeof res.body === 'string' ? res.body : JSON.stringify(res.body);
      return route.fulfill({ status: res.status || 200, headers: Object.assign({ 'content-type': res.contentType || 'application/json' }, res.headers || {}), body });
    }
    if (u.host.endsWith('instagram.com') && /\/api\/v1\/users\/\d+\/info\/?$/.test(u.pathname)) {
      // Allowed only in the non-Comment modes, where the extension has always used it.
      if (!scenario.info) {
        log.push({ t, kind: 'FORBIDDEN_users_info', url });
        return route.fulfill({ status: 500, body: '{}' });
      }
      const pk = u.pathname.split('/')[4];
      const n = (state.profileCalls['info:' + pk] = (state.profileCalls['info:' + pk] || 0) + 1);
      log.push({ t, kind: 'info', pk, n, headers: req.headers() });
      const res = scenario.info[pk] ? scenario.info[pk](n, req) : { status: 404, body: { status: 'fail', message: 'User not found' } };
      const body = typeof res.body === 'string' ? res.body : JSON.stringify(res.body);
      return route.fulfill({ status: res.status || 200, headers: Object.assign({ 'content-type': 'application/json' }, res.headers || {}), body });
    }
    const friendship = u.host.endsWith('instagram.com') && u.pathname.match(/^\/api\/v1\/friendships\/(\d+)\/(followers|following)\/?$/);
    if (friendship && scenario.friendships) {
      const kind = friendship[2], n = (state.profileCalls['list:' + kind] = (state.profileCalls['list:' + kind] || 0) + 1);
      log.push({ t, kind: 'friendships', list: kind, target: friendship[1], n, maxId: u.searchParams.get('max_id') });
      const res = scenario.friendships(kind, n, u);
      return route.fulfill({ status: res.status || 200, headers: Object.assign({ 'content-type': 'application/json' }, res.headers || {}), body: JSON.stringify(res.body) });
    }
    if (/(^|\.)autland\.com$/.test(u.host) && req.resourceType() === 'image') {
      log.push({ t, kind: 'ui-image', url });
      return route.fulfill({ status: 200, contentType: 'image/gif', body: Buffer.from('R0lGODlhAQABAAAAACw=', 'base64') });
    }
    if (u.host.endsWith('instagram.com')) {
      log.push({ t, kind: 'instagram-other', url });
      return route.fulfill({ status: 200, contentType: 'text/html', body: '<html><body>test</body></html>' });
    }
    log.push({ t, kind: 'blocked', url });
    return route.abort();
  });
  return state;
}

async function snapshot(page) {
  return page.evaluate(`(async () => {
    const vm = ${findVmSource()};
    const P = window.IGPublicContacts;
    const storage = await chrome.storage.local.get(null);
    const pick = {};
    Object.keys(storage).filter(k => /^ig_/.test(k) || /^extract_list_/.test(k)).forEach(k => pick[k] = storage[k]);
    return {
      isPaused: vm.isPaused, isComplete: vm.isComplete, manualPause: vm.manualPause,
      retryAfterUntil: vm.retryAfterUntil, commercialStartRequired: vm.commercialStartRequired,
      commercialContactUnavailable: vm.commercialContactUnavailable,
      detailCycle: !!vm.detailCycle, loadUserIndex: vm.loadUserIndex,
      rows: vm.followList.map(r => ({ user: r.userName, id: r.userId, email: r.email, status: r.emailStatus, text: P.emailStatusText(r),
        detailLoaded: r.detailLoaded, failure: r.contactFailure || null, profileType: r.contactProfileType || null,
        followers: r.followers, bio: r.bio, fullName: r.fullName })),
      emailList: vm.emailList.map(r => r.email),
      notifications: Array.from(document.querySelectorAll('.notification')).map(n => n.innerText.trim()).filter(Boolean),
      toasts: Array.isArray(window.__toasts) ? window.__toasts.slice() : [],
      bodyText: document.body.innerText,
      storage: pick,
    };
  })()`);
}

async function exportCsv(page, which) {
  const [dl] = await Promise.all([
    page.waitForEvent('download', { timeout: 15000 }),
    page.evaluate(`(() => { const vm = ${findVmSource()}; return vm.handleDownload(${JSON.stringify(which)}, ${which === 'email' ? 'vm.emailList' : 'vm.userList'}, 'csv'); })()`),
  ]);
  const p = await dl.path();
  return fs.readFileSync(p, 'utf8').replace(/^﻿/, '');
}

async function clickButton(page, text) {
  const btn = page.locator('button', { hasText: text }).first();
  await btn.waitFor({ timeout: 10000 });
  if (await btn.isDisabled()) return false;
  await btn.click();
  return true;
}

async function waitFor(page, predicate, { timeout = 120000, every = 1000 } = {}) {
  const end = Date.now() + timeout;
  let snap;
  while (Date.now() < end) {
    snap = await snapshot(page);
    if (predicate(snap)) return snap;
    await page.waitForTimeout(every);
  }
  return snap;
}

async function exportXlsxSheets(page, which) {
  const [dl] = await Promise.all([
    page.waitForEvent('download', { timeout: 15000 }),
    page.evaluate(`(() => { const vm = ${findVmSource()}; return vm.handleDownload(${JSON.stringify(which)}, ${which === 'email' ? 'vm.emailList' : 'vm.userList'}, 'xlsx'); })()`),
  ]);
  const p = path.join(os.tmpdir(), 'export-' + process.pid + '-' + Date.now() + '.xlsx');
  await dl.saveAs(p);
  const py = "import json,sys,openpyxl\nwb=openpyxl.load_workbook(sys.argv[1])\nprint(json.dumps({ws.title:[[('' if c is None else str(c)) for c in r] for r in ws.iter_rows(values_only=True)] for ws in wb.worksheets}))";
  const out = require('child_process').execFileSync('python3', ['-c', py, p], { encoding: 'utf8' });
  return JSON.parse(out);
}

module.exports = { exportXlsxSheets, launch, install, snapshot, exportCsv, clickButton, waitFor, findVmSource, PIXEL };
