// Loads the real popup component options (popup.js) with stubbed deps, to call its history export.
const fs = require('fs');
const vm = require('vm');
const path = require('path');
const { makeRequire } = require('./loader');
function loadPopup(extDir) {
  const sandbox = { console: { log() {}, warn() {}, error() {} }, Promise, URL, Date, Map, Set, JSON, Math, Object, Array, String, Number, Symbol, Error, RegExp, setTimeout, clearTimeout };
  sandbox.window = sandbox; sandbox.self = sandbox; sandbox.globalThis = sandbox;
  vm.createContext(sandbox);
  for (const f of ['chunk-vendors.js', 'chunk-common.js']) vm.runInContext(fs.readFileSync(path.join(extDir, f), 'utf8'), sandbox, { filename: f });
  // popup.html loads the contact parser from PATCHED 15 on; load it the same way when the page does.
  if (/public-contact-parser\.js/.test(fs.readFileSync(path.join(extDir, 'popup.html'), 'utf8')))
    vm.runInContext(fs.readFileSync(path.join(extDir, 'public-contact-parser.js'), 'utf8'), sandbox, { filename: 'public-contact-parser.js' });
  const modules = {};
  for (const chunk of sandbox.webpackJsonp) Object.assign(modules, chunk[1]);
  const src = fs.readFileSync(path.join(extDir, 'popup.js'), 'utf8');
  const cut = src.indexOf('})({\n  "0224"');
  vm.runInContext('(function(t){window.__popupModules=t;})' + src.slice(cut + 2), sandbox, { filename: 'popup.js' });
  Object.assign(modules, sandbox.__popupModules);
  let captured = null; const exportsOut = [];
  const StubVue = function () {}; StubVue.component = () => {}; StubVue.use = () => {}; StubVue.prototype = {};
  const overrides = {
    '2b0e': { a: StubVue }, '2877': { a: (o) => { captured = o; return { exports: o }; } }, 'ecee': { c: { add() {} } },
    'c074': new Proxy({}, { get: () => ({}) }), 'ad3d': { a: {} }, '289d': { a: {} }, '01ea': { a: {} }, '42e0': {}, 'a4af': { a: {} }, '11aa': {},
    '9845': { storage: { local: { get: async () => ({}), set: async () => {} }, onChanged: { addListener() {} } }, runtime: { getManifest: () => ({ version: '2.5.1' }) }, tabs: { create() {} } },
    'fa20': {}, 'bc3a': { get() {}, post() {}, defaults: {} },
    'fa7d': { a: (rows, name) => exportsOut.push({ kind: 'csv', rows, name }), b: (lo) => lo, c: (sheets, name) => exportsOut.push({ kind: 'xlsx', sheets, name }) },
  };
  const req = makeRequire(modules, overrides);
  const origReq = req;
  // stub polyfills/images referenced by 0a3d
  const wrapped = new Proxy(origReq, { apply: (t, th, args) => { const id = args[0]; if (!(id in overrides) && !['5a0c', '3452', '1da1', '5530', 'ade3', '3835', '96cf', 'c832', '0a3d'].includes(id) && /^[0-9a-f]{4}$/.test(id) && modules[id] && modules[id].toString().length < 40000 && !/Vue|dayjs/.test(modules[id].toString().slice(0, 200))) { try { return origReq(id); } catch (e) { return {}; } } return origReq(id); } });
  modules['0a3d'].call({}, { exports: {} }, {}, Object.assign(function (id) { return wrapped(id); }, origReq));
  return { options: captured, exportsOut };
}
module.exports = { loadPopup };
