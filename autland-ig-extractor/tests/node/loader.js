// Minimal webpack module loader for the extension bundles (read-only use).
const fs = require('fs');
const vm = require('vm');
const path = require('path');
function loadChunks(dir) {
  const sandbox = { console, setTimeout, clearTimeout, setInterval, clearInterval, Promise, URL, Blob: global.Blob, TextEncoder, TextDecoder, Uint8Array, ArrayBuffer, Buffer };
  sandbox.window = sandbox; sandbox.self = sandbox; sandbox.globalThis = sandbox;
  vm.createContext(sandbox);
  for (const f of ['chunk-vendors.js', 'chunk-common.js']) {
    vm.runInContext(fs.readFileSync(path.join(dir, f), 'utf8'), sandbox, { filename: f });
  }
  const modules = {};
  for (const chunk of sandbox.webpackJsonp) Object.assign(modules, chunk[1]);
  return { sandbox, modules };
}
function makeRequire(modules, overrides = {}) {
  const cache = {};
  function req(id) {
    if (Object.prototype.hasOwnProperty.call(overrides, id)) return overrides[id];
    if (cache[id]) return cache[id].exports;
    const mod = cache[id] = { i: id, l: false, exports: {} };
    if (!modules[id]) throw new Error('missing module ' + id);
    modules[id].call(mod.exports, mod, mod.exports, req);
    mod.l = true;
    return mod.exports;
  }
  req.m = modules; req.c = cache;
  req.d = (e, n, g) => { if (!Object.prototype.hasOwnProperty.call(e, n)) Object.defineProperty(e, n, { enumerable: true, get: g }); };
  req.r = (e) => { if (typeof Symbol !== 'undefined' && Symbol.toStringTag) Object.defineProperty(e, Symbol.toStringTag, { value: 'Module' }); Object.defineProperty(e, '__esModule', { value: true }); };
  req.n = (m) => { const g = m && m.__esModule ? () => m['default'] : () => m; req.d(g, 'a', g); return g; };
  req.o = (o, p) => Object.prototype.hasOwnProperty.call(o, p);
  req.t = (v) => v;
  req.p = '/';
  return req;
}
module.exports = { loadChunks, makeRequire };
