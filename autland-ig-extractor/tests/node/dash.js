// Node harness: loads the real dashboard component with stubbed browser/network deps.
// All Instagram responses are SIMULATED; nothing leaves this process.
const fs = require('fs');
const vm = require('vm');
const path = require('path');
const { makeRequire } = require('./loader');

function createEnv(extDir, opts = {}) {
  // ---- virtual clock + timers ----
  let clock = opts.now || Date.UTC(2026, 9, 5, 12, 0, 0);
  const timers = []; let timerSeq = 0;
  const RealDate = Date;
  class VDate extends RealDate {
    constructor(...a) { if (a.length === 0) super(clock); else super(...a); }
    static now() { return clock; }
  }
  const sandbox = {
    console: opts.quiet ? { log() {}, warn() {}, error() {}, info() {} } : console,
    Promise, URL, TextEncoder, TextDecoder, Uint8Array, ArrayBuffer, Buffer, Map, Set, JSON, Math, Object, Array, String, Number, Boolean, Symbol, Error, TypeError, RegExp, parseInt, parseFloat, isFinite, isNaN, encodeURIComponent, decodeURIComponent, encodeURI, decodeURI, AbortController,
    Date: VDate,
    setTimeout: (fn, ms) => { const id = ++timerSeq; timers.push({ id, at: clock + (Number(ms) || 0), fn }); return id; },
    clearTimeout: (id) => { const i = timers.findIndex((t) => t.id === id); if (i >= 0) timers.splice(i, 1); },
    setInterval: () => 0, clearInterval: () => {},
    navigator: { userAgent: 'node', locks: null },
    document: { createEvent: () => ({ timeStamp: 0 }), createElement: () => ({ style: {}, setAttribute() {}, appendChild() {}, click() {} }),
      body: { scrollTop: 0 }, documentElement: { scrollTop: 0 }, querySelectorAll: () => [], getElementById: () => null, addEventListener() {} },
    addEventListener() {}, removeEventListener() {},
    location: { href: 'chrome-extension://x/dashboard.html' },
  };
  sandbox.window = sandbox; sandbox.self = sandbox; sandbox.globalThis = sandbox;
  // serial lock like navigator.locks
  let locked = false; const q = [];
  sandbox.navigator.locks = { request: async (name, fn) => { while (locked) await new Promise((r) => q.push(r)); locked = true; try { return await fn(); } finally { locked = false; const n = q.shift(); if (n) n(); } } };
  vm.createContext(sandbox);
  for (const f of ['chunk-vendors.js', 'chunk-common.js', 'dj-filter-engine.js', 'public-contact-parser.js', 'commercial-profile-reader.js', 'request-pacing.js']) {
    vm.runInContext(fs.readFileSync(path.join(extDir, f), 'utf8'), sandbox, { filename: f });
  }
  const modules = {};
  for (const chunk of sandbox.webpackJsonp) Object.assign(modules, chunk[1]);
  // dashboard modules without the bootstrap
  const src = fs.readFileSync(path.join(extDir, 'dashboard.js'), 'utf8');
  const cut = src.indexOf('})({\n  3: function');
  if (cut < 0) throw new Error('bootstrap boundary not found');
  vm.runInContext('(function(t){window.__dashModules=t;})' + src.slice(cut + 2), sandbox, { filename: 'dashboard.js' });
  Object.assign(modules, sandbox.__dashModules);

  // ---- stubs ----
  const store = Object.assign({}, opts.store || {});
  const clone = (v) => (v === undefined ? v : JSON.parse(JSON.stringify(v)));
  const storageLog = []; const tabsCreated = [];
  const browser = {
    storage: {
      local: {
        get: async (keys) => { const out = {}; if (keys == null) return clone(store); [].concat(keys).forEach((k) => { if (k in store) out[k] = clone(store[k]); }); return out; },
        set: async (obj) => { storageLog.push(Object.keys(obj)); Object.assign(store, clone(obj)); },
        remove: async (keys) => { [].concat(keys).forEach((k) => delete store[k]); },
      },
      onChanged: { addListener() {} },
    },
    runtime: { getManifest: () => ({ version: '2.5.1' }), id: 'x' },
    tabs: { create: async (o) => { tabsCreated.push(o.url); return {}; } },
  };
  const historyCalls = [];
  const fa20 = {
    k: (p) => { historyCalls.push(clone(p)); return Promise.resolve({ id: p.id, get: (k) => ({ token: p.token, updateTimes: 1 }[k]) }); },
    a: async () => ({ id: 'H1', get: (k) => ({ token: 't', updateTimes: 0, scrapedCount: 0, cursorScrapedCount: 0, count: 0 }[k]) }),
    d: async () => null, f: async () => ({}), g: async () => 0, i: async () => ({}),
  };
  const exports_ = [];
  const fa7d = { a: (rows, name) => exports_.push({ kind: 'csv', rows: clone(rows), name }), b: (lo) => lo, c: (sheets, name) => exports_.push({ kind: 'xlsx', sheets, name }) };
  const axiosCalls = [];
  const axios = {
    defaults: {},
    get: (url, cfg) => { axiosCalls.push(url); return opts.axiosGet ? opts.axiosGet(url, cfg) : Promise.reject(new Error('no axios stub')); },
    post: () => Promise.resolve({}),
  };
  let captured = null;
  const StubVue = function () {}; StubVue.component = () => {}; StubVue.use = () => {}; StubVue.prototype = {};
  const noop = {};
  const overrides = {
    '2b0e': { a: StubVue },
    '2877': { a: (o) => { captured = o; return { exports: o, options: o }; } },
    '8c4f': { a: function Router() {} },
    'ecee': { c: { add() {} } },
    'c074': new Proxy({}, { get: () => ({}) }),
    'ad3d': { a: {} }, '289d': { a: {} }, '01ea': { a: { ENCRYPT_KEY: '0123456789abcdef' } }, '42e0': noop, 'a4af': { a: {} },
    '9845': browser, 'fa20': fa20, 'fa7d': fa7d, 'bc3a': axios, 'cf05': 'img',
  };
  for (const id of ['e260', 'e6cf', 'cca6', 'a79d', 'b64b', 'd3b7', 'a15b', 'd81d', 'fb6a', '4de4', '25f0', 'ac1f', '5319', '1276', '4d63', 'c607', '2c3e', '466d', '99af', 'a434', 'e9c4', 'caad', '2532', 'c740', '159b', 'cc10', '3b7b']) overrides[id] = noop;
  const req = makeRequire(modules, overrides);
  req('7c3d');
  if (!captured) throw new Error('component not captured');
  // real Vue for the instance
  const realReq = makeRequire(modules, { 'e260': noop });
  const Vue = realReq('2b0e').a;
  Vue.config.silent = true;
  const notifications = [];
  const options = Object.assign({}, captured);
  delete options.created; delete options.render; delete options.staticRenderFns; delete options.components;
  function instance(query) {
    const vmi = new Vue(Object.assign({}, options, {
      beforeCreate() {
        this.$route = { query: query || {} };
        this.$buefy = { notification: { open: (o) => notifications.push(o) }, toast: { open: (o) => notifications.push(o) }, dialog: { confirm: (o) => notifications.push(o) }, snackbar: { open: (o) => notifications.push(o) } };
        this.$config = { ENCRYPT_KEY: '0123456789abcdef' };
        this.$el = { querySelector: () => null };
      },
    }));
    return vmi;
  }
  async function flush(n = 20) { for (let i = 0; i < n; i++) await new Promise((r) => setImmediate(r)); }
  async function run(maxSteps = 1000, untilFn) {
    for (let s = 0; s < maxSteps; s++) {
      await flush();
      if (untilFn && untilFn()) return true;
      if (!timers.length) return false;
      timers.sort((a, b) => a.at - b.at || a.id - b.id);
      const t = timers.shift();
      clock = Math.max(clock, t.at);
      t.fn();
    }
    return false;
  }
  return { tabsCreated, fa20, sandbox, Vue, instance, store, storageLog, historyCalls, exports: exports_, axiosCalls, notifications, run, flush, timers,
    advance: (ms) => { clock += ms; }, now: () => clock, setFetch: (f) => { sandbox.fetch = f; } };
}
module.exports = { createEnv };
