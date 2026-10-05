/* What happens to the extension's saved pause and counter across the ways a user
 * can update or reinstall it. Chromium with developer mode on (as in the user's
 * Chrome). No network: every non-extension request is aborted. */
const { chromium } = require('playwright');
const fs = require('fs'), os = require('os'), path = require('path');
const ID = 'icceojeancmncflpknhmfbfaleindgmi';
const withTimeout = (p, ms) => Promise.race([p, new Promise((r) => setTimeout(() => r('TIMEOUT'), ms))]);
const STATE = { ig_contact_cooldown_until: Date.UTC(2026, 9, 5, 16, 59, 23), ig_commercial_contact_schema_v14: { endpoint: 'instagram_web_profile_info', refusals: 1, lastRefusalAt: Date.UTC(2026, 9, 5, 15, 59, 23) } };
async function launch(udd, extDir) {
  const ctx = await chromium.launchPersistentContext(udd, { channel: 'chromium', headless: true,
    args: [`--disable-extensions-except=${extDir}`, `--load-extension=${extDir}`] });
  await ctx.route('**/*', (r) => { const u = r.request().url(); if (/^(chrome-extension|data|chrome):/.test(u)) return r.continue(); return r.abort(); });
  const ext = await ctx.newPage();
  await withTimeout(ext.goto('chrome://extensions/'), 10000);
  await withTimeout(ext.evaluate(() => chrome.developerPrivate.updateProfileConfiguration({ inDeveloperMode: true })), 5000);
  return { ctx, ext };
}
async function read(ctx) {
  const p = await ctx.newPage();
  for (let i = 0; ; i++) { try { await p.goto(`chrome-extension://${ID}/popup.html`); break; } catch (e) { if (i > 10) { await p.close(); return 'EXTENSION PAGE UNAVAILABLE'; } await p.waitForTimeout(1000); } }
  const v = await p.evaluate(() => chrome.storage.local.get(['ig_contact_cooldown_until', 'ig_commercial_contact_schema_v14']));
  await p.close();
  return { pause: v.ig_contact_cooldown_until ? new Date(v.ig_contact_cooldown_until).toISOString() : 'AUSENTE', refusals: v.ig_commercial_contact_schema_v14 ? v.ig_commercial_contact_schema_v14.refusals : 'AUSENTE' };
}
async function write(ctx) {
  const p = await ctx.newPage();
  for (let i = 0; ; i++) { try { await p.goto(`chrome-extension://${ID}/popup.html`); break; } catch (e) { if (i > 10) throw e; await p.waitForTimeout(1000); } }
  await p.evaluate((s) => chrome.storage.local.set(s), STATE);
  await p.close();
}
const reload = (ext) => withTimeout(ext.evaluate((id) => chrome.developerPrivate.reload(id, { failQuietly: true }).then(() => 'ok', (e) => 'ERR ' + e.message), ID), 8000);
(async () => {
  const src = path.resolve(process.argv[2]), alt = path.resolve(process.argv[3]);
  const A = fs.mkdtempSync(path.join(os.tmpdir(), 'extA-')); fs.cpSync(src, A, { recursive: true });
  const B = fs.mkdtempSync(path.join(os.tmpdir(), 'extB-')); fs.cpSync(alt, B, { recursive: true });
  const udd = fs.mkdtempSync(path.join(os.tmpdir(), 'pw-life-'));
  const out = [];
  let { ctx, ext } = await launch(udd, A);
  await write(ctx);
  out.push(['0. estado gravado (pausa até 13:59:23 BRT, recusas=1)', await read(ctx)]);
  await reload(ext); await ext.waitForTimeout(1500);
  out.push(['1. botão Recarregar', await read(ctx)]);
  fs.cpSync(alt, A, { recursive: true, force: true }); // copy the newer files over the installed folder
  await reload(ext); await ext.waitForTimeout(1500);
  out.push(['2. arquivos novos copiados sobre a pasta + Recarregar', await read(ctx)]);
  await ctx.close();
  ({ ctx, ext } = await launch(udd, A));
  out.push(['3. Chrome fechado e aberto de novo', await read(ctx)]);
  await ctx.close();
  ({ ctx, ext } = await launch(udd, B));
  out.push(['4. mesma extensão (mesma chave/ID) carregada de OUTRA pasta', await read(ctx)]);
  // management.uninstall needs a user gesture: wire it to a button and click it.
  await ext.evaluate((id) => {
    const b = document.createElement('button'); b.id = 'pw-remove'; b.textContent = 'remove';
    b.onclick = () => {
      window.__un = 'pending';
      const done = () => { window.__un = 'ok'; }, fail = (e) => { window.__un = 'ERR ' + (e && e.message); };
      if (chrome.developerPrivate.removeMultipleExtensions) chrome.developerPrivate.removeMultipleExtensions([id]).then(done, fail);
      else chrome.management.uninstall(id, { showConfirmDialog: false }).then(done, fail);
    };
    document.body.appendChild(b);
  }, ID);
  await ext.click('#pw-remove');
  await ext.waitForTimeout(3000);
  const un = await ext.evaluate(() => window.__un).catch((e) => 'page gone: ' + e.message.slice(0, 60));
  out.push(['5a. Remover (uninstall): ' + un, await read(ctx)]);
  await ctx.close();
  ({ ctx, ext } = await launch(udd, B));
  out.push(['5b. depois de remover, carregada de novo', await read(ctx)]);
  await ctx.close();
  for (const [k, v] of out) console.log(k.padEnd(62), JSON.stringify(v));
})().catch((e) => { console.error('FATAL', e); process.exit(1); });
