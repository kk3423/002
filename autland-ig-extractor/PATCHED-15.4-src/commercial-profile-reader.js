/* PATCHED 15.4: one /api/v1/users/{id}/info/ answer per profile id, serial and fail closed.
 * This module never builds a request. It asks for the extension's own shared profile-detail
 * request (deps.request, the same function every mode uses) and decides what the answer means:
 * an email found in the Instagram response, "no public email" (HTTP 200 with the real profile
 * object only), or an access failure that is never read as "no email". It also keeps the shared
 * 429 pause, the adaptive spacing and a persistent cache by user id, and records a sanitised log
 * (field paths and value types, masked email; never cookies, tokens or headers).
 * A live public commercial email has not yet been confirmed by a real response.
 */
(function (root, factory) {
  var api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.IGCommercialProfileReader = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";
  var endpoint = "instagram_users_info";
  var cooldownKey = "ig_contact_cooldown_until";
  var schemaKey = "ig_commercial_contact_schema_v14";
  var evidenceKey = "ig_commercial_contact_evidence_v14";
  var lastStartKey = "ig_commercial_web_last_start";
  // Adaptive spacing between profile requests, shared by every dashboard.
  var pacingKey = "ig_contact_pacing";
  var baseSpacing = 10000, maxSpacing = 120000;
  // Answered profiles by user id, kept across extractions so no profile is asked twice.
  var profileCacheKey = "ig_contact_profile_cache_v154";
  var ttlFound = 14 * 864e5, ttlNone = 7 * 864e5, ttlUnavailable = 3 * 864e5, cacheLimit = 3000;
  var lockName = "ig-commercial-profile-read";
  // Every read-modify-write of the shared pause goes through this lock, in the reader
  // and in the dashboard, so two tabs can never shorten each other's pause.
  var cooldownLock = "ig-contact-cooldown";
  var own = Object.prototype.hasOwnProperty;
  var refusedLimit = 2, evidenceLimit = 20, listLimit = 10;
  var flagFields = ["account_type", "is_business_account", "is_professional_account", "is_business",
    "should_show_public_contacts", "business_contact_method", "is_private"];
  var loginPattern = /login_required|checkpoint_required|challenge_required|consent_required|please log ?in|sessionid/i;

  function retryUntil(value, now) {
    var raw = String(value == null ? "" : value).trim();
    if (/^\d+(?:\.\d+)?$/.test(raw)) return now + Math.max(10, Number(raw)) * 1000;
    var date = Date.parse(raw);
    return Number.isFinite(date) && date > now ? date : now + 3600000;
  }
  // Merge a new pause into the saved one (never shorter), under the shared lock, with one retry.
  function saveCooldown(storage, locks, until, wait) {
    var write = function () {
      return Promise.resolve(storage.get(cooldownKey)).then(function (latest) {
        var value = Math.max(Number(latest && latest[cooldownKey]) || 0, Number(until) || 0);
        return Promise.resolve(storage.set({ [cooldownKey]: value })).then(function () { return value; });
      });
    };
    var attempt = function () { return locks && typeof locks.request === "function" ? locks.request(cooldownLock, write) : write(); };
    return attempt().catch(function () {
      return Promise.resolve(wait ? wait(1000) : null).then(attempt);
    });
  }
  function stopped(message, code, response) {
    var error = new Error(message);
    error.commercialRequestStopped = true;
    error.stopCode = code;
    if (response) error.response = response;
    return error;
  }
  function maskEmail(value) {
    var s = String(value || ""), at = s.indexOf("@");
    return at > 0 ? s.charAt(0) + "***" + s.slice(at) : "";
  }
  function readSchema(value) {
    var schema = { endpoint: endpoint, keysPresent: 0, keysPresentUsers: [], omittedOther: 0,
      found: 0, foundUsers: [], responses: 0, profiles: 0, refusals: 0, lastRefusalAt: 0, firstFound: null, updatedAt: 0 };
    if (!value || typeof value !== "object" || value.endpoint !== endpoint) return schema;
    schema.keysPresent = Number(value.keysPresent) || 0;
    schema.omittedOther = Number(value.omittedOther) || 0;
    schema.found = Number(value.found) || 0;
    schema.responses = Number(value.responses) || 0;
    schema.profiles = Number(value.profiles) || 0;
    schema.refusals = Number(value.refusals) || 0;
    schema.lastRefusalAt = Number(value.lastRefusalAt) || 0;
    if (value.firstFound && typeof value.firstFound === "object") {
      schema.firstFound = { at: Number(value.firstFound.at) || 0, username: String(value.firstFound.username || ""),
        email: String(value.firstFound.email || ""), probe: !!value.firstFound.probe };
    }
    schema.updatedAt = Number(value.updatedAt) || 0;
    ["keysPresentUsers", "foundUsers"].forEach(function (key) {
      schema[key] = Array.isArray(value[key]) ? value[key].slice(-listLimit) : [];
    });
    return schema;
  }
  // Diagnostic only: repeated refusals with no profile answer at all.
  function routeRefusing(value) {
    var schema = readSchema(value);
    return schema.responses === 0 && schema.refusals >= refusedLimit;
  }
  function valueType(value) {
    if (value === null || value === undefined) return "null";
    if (typeof value === "string") return value.trim() ? "texto" : "vazio";
    if (Array.isArray(value)) return "lista";
    return typeof value === "object" ? "objeto" : typeof value;
  }
  // Email-related paths anywhere in a response: names and value types only, never values.
  function emailPaths(body) {
    var out = [], seen = 0;
    (function walk(node, path, depth) {
      if (!node || typeof node !== "object" || depth > 8 || seen > 4000) return;
      Object.keys(node).forEach(function (key) {
        seen++;
        var child = node[key], here = path ? path + "." + key : key;
        if (/e-?mail|contact_method|should_show_public_contacts/i.test(key) && out.length < 40) out.push(here + "=" + valueType(child));
        if (child && typeof child === "object") walk(Array.isArray(child) ? child[0] : child, Array.isArray(child) ? here + "[]" : here, depth + 1);
      });
    })(body, "", 0);
    return out;
  }
  function header(headers, name) {
    if (!headers) return null;
    if (typeof headers.get === "function") return headers.get(name);
    var found = null;
    Object.keys(headers).forEach(function (key) { if (key.toLowerCase() === name) found = headers[key]; });
    return found;
  }
  function validId(value) { return /^\d{1,20}$/.test(String(value || "")); }
  function remember(list, username) {
    return list.indexOf(username) >= 0 ? list : list.concat(username).slice(-listLimit);
  }
  // Envelope paths as the answer is shown in the diagnostics (relative to the JSON body).
  function displayPath(path) {
    return { "data.user": "user", "data.data.user": "data.user", "data.items.0.user": "items[0].user" }[path] || path;
  }
  function create(deps) {
    var memory = new Map();
    function readPacing(saved) {
      var p = saved && saved[pacingKey] && typeof saved[pacingKey] === "object" ? saved[pacingKey] : {};
      var spacing = Math.min(maxSpacing, Math.max(baseSpacing, Number(p.spacing) || baseSpacing));
      return { spacing: spacing, okStreak: Math.max(0, Number(p.okStreak) || 0) };
    }
    // Refusal: double the spacing (up to 2 min) for when the pause ends. Five answered
    // profiles in a row bring it 20% closer to the 10 s base.
    function updatePacing(ok) {
      return Promise.resolve(deps.storage.get(pacingKey)).then(function (saved) {
        var p = readPacing(saved);
        if (ok) {
          p.okStreak += 1;
          if (p.okStreak >= 5) { p.spacing = Math.max(baseSpacing, Math.round(p.spacing * 0.8)); p.okStreak = 0; }
        } else { p.spacing = Math.min(maxSpacing, p.spacing * 2); p.okStreak = 0; }
        return deps.storage.set({ [pacingKey]: p });
      }).catch(function () {});
    }
    function cacheOf(saved) {
      return saved && saved[profileCacheKey] && typeof saved[profileCacheKey] === "object" ? saved[profileCacheKey] : {};
    }
    function cachedProfile(saved, userId) {
      var hit = cacheOf(saved)[userId];
      if (!hit || !hit.result || typeof hit.result !== "object") return null;
      var ttl = hit.kind === "unavailable" ? ttlUnavailable : hit.kind === "none" ? ttlNone : ttlFound;
      return Number(hit.at) > deps.now() - ttl ? hit.result : null;
    }
    // A comment without a usable id: the id may already be known from an earlier answer.
    // Never a request: that profile is not asked again by any other route.
    function idFromCache(saved, username) {
      if (!username) return "";
      var all = cacheOf(saved), best = null;
      Object.keys(all).forEach(function (id) {
        var hit = all[id];
        if (hit && hit.username === username && validId(id) && (!best || Number(hit.at) > best.at)) best = { id: id, at: Number(hit.at) };
      });
      return best ? best.id : "";
    }
    function storeProfile(userId, username, result) {
      if (!result || result.contactOutcome === "identity_mismatch") return Promise.resolve();
      return Promise.resolve(deps.storage.get(profileCacheKey)).then(function (saved) {
        var all = cacheOf(saved);
        all[userId] = { at: deps.now(), username: username, kind: result.contactSkip ? "unavailable" : (result.contactOutcome === "found" ? "found" : "none"), result: result };
        var keys = Object.keys(all);
        if (keys.length > cacheLimit) keys.sort(function (a, b) { return (all[a].at || 0) - (all[b].at || 0); })
          .slice(0, keys.length - cacheLimit).forEach(function (k) { delete all[k]; });
        return deps.storage.set({ [profileCacheKey]: all });
      }).catch(function () { /* the cache must never change the collection result */ });
    }
    // Only the saved 429 pause closes the queue; a profile without an email never does.
    function assertOpen(saved) {
      if (Number(saved[cooldownKey]) > deps.now()) {
        var cooldown = stopped("Consulta pausada pelo Instagram. Aguarde o horário indicado.", "cooldown");
        cooldown.cooldownUntil = Number(saved[cooldownKey]);
        throw cooldown;
      }
    }
    function record(entry) {
      return Promise.resolve().then(function () { return deps.storage.get(evidenceKey); }).then(function (saved) {
        var list = saved && Array.isArray(saved[evidenceKey]) ? saved[evidenceKey] : [];
        return deps.storage.set({ [evidenceKey]: [entry].concat(list).slice(0, evidenceLimit) });
      }).catch(function () { /* diagnostics must never change the collection result */ });
    }
    function updateSchema(username, contact, probe) {
      return deps.storage.get(schemaKey).then(function (saved) {
        var schema = readSchema(saved[schemaKey]);
        if (contact.emailStatus === "found") {
          schema.found += 1;
          schema.foundUsers = remember(schema.foundUsers, username);
          if (!schema.firstFound) schema.firstFound = { at: deps.now(), username: username, email: maskEmail(contact.email), probe: !!probe };
        }
        if (contact.emailFieldReturned) {
          schema.keysPresent += 1;
          schema.keysPresentUsers = remember(schema.keysPresentUsers, username);
        } else schema.omittedOther += 1;
        schema.updatedAt = deps.now();
        return deps.storage.set({ [schemaKey]: schema }).then(function () { return schema; });
      });
    }
    // Route-level bookkeeping of real HTTP outcomes, independent of the profile.
    function noteOutcome(kind) {
      return deps.storage.get(schemaKey).then(function (saved) {
        var schema = readSchema(saved[schemaKey]);
        if (kind === "response" || kind === "profile") {
          schema.responses += 1;
          if (kind === "profile") schema.profiles += 1;
          schema.refusals = 0;
        } else { schema.refusals += 1; schema.lastRefusalAt = deps.now(); }
        schema.updatedAt = deps.now();
        return deps.storage.set({ [schemaKey]: schema }).then(function () { return schema; });
      });
    }
    function skip(outcome, entry, userId) {
      entry.outcome = outcome;
      return { contactSkip: true, contactOutcome: outcome, contactEndpoint: endpoint, contactRoute: "users_info", contactUserId: userId || "" };
    }
    function failure(entry, state, code, message, status) {
      entry.outcome = state;
      return stopped(message, code, status ? { status: status } : null);
    }
    // Why the answer was refused: a login/challenge page or message is a session problem;
    // any other refusal is access denied. Neither is ever "no email".
    function refused(entry, status, message) {
      if (status === 401 || loginPattern.test(message || "")) {
        return failure(entry, "login_required", "login_required", "Sessão precisa ser verificada: o Instagram pediu login ou verificação" + (message ? " (" + message + ")" : "") + ". Abra o instagram.com, confirme a sessão e clique em Continue. Nada é repetido automaticamente.", status);
      }
      return failure(entry, "access_denied", "access_denied", "O Instagram negou o acesso a esta consulta (HTTP " + status + (message ? ": " + message : "") + "). Coleta pausada, sem nova tentativa automática.", status);
    }
    async function fetchProfile(userId, username, entry) {
      var response, timer;
      try {
        response = await new Promise(function (resolve, reject) {
          timer = setTimeout(function () { reject(new Error("timeout")); }, 30000);
          Promise.resolve().then(function () { return deps.request(userId); }).then(resolve, reject);
        });
      } catch (err) {
        throw failure(entry, "temporary_error", "network", "Falha temporária de rede ou tempo esgotado na consulta do perfil. Coleta pausada; clique em Continue para tentar de novo.", 0);
      } finally { clearTimeout(timer); }
      var status = Number(response && response.status) || 0, body = response ? response.data : null;
      entry.http = status;
      if (status === 429) {
        entry.retryAfter = header(response.headers, "retry-after");
        var until = retryUntil(entry.retryAfter, deps.now());
        // Storage may fail (invalidated context); the pause must still be reported.
        try {
          until = await saveCooldown(deps.storage, deps.locks, until, deps.wait);
          entry.cooldownSaved = true;
        } catch (storageError) { entry.cooldownSaved = false; }
        entry.outcome = "rate_limited";
        entry.cooldownUntil = until;
        var limited = stopped("Consulta pausada pelo Instagram (HTTP 429). Coleta pausada até o horário indicado, sem nova tentativa automática.", "rate_limit", {
          status: 429, headers: { "retry-after": new Date(until).toUTCString() }
        });
        limited.cooldownUntil = until;
        throw limited;
      }
      // Instagram's text ends up in HTML notifications: keep it inert and short.
      var message = body && typeof body === "object" && typeof body.message === "string"
        ? body.message.replace(/[<>&"']/g, " ").replace(/\s+/g, " ").trim().slice(0, 120) : "";
      if (message) entry.message = message;
      if (status === 404) {
        entry.envelope = true;
        return skip("profile_unavailable", entry, userId);
      }
      if (status < 200 || status >= 300) {
        if (status >= 500) throw failure(entry, "temporary_error", "temporary", "O Instagram respondeu com erro temporário (HTTP " + status + "). Coleta pausada; clique em Continue para tentar de novo.", status);
        throw refused(entry, status, message);
      }
      if (typeof body === "string") {
        // A page instead of data: the session was sent to login or a verification page.
        if (/^\s*</.test(body)) throw refused(entry, status, "login_required");
        throw failure(entry, "temporary_error", "unexpected_response", "A resposta do Instagram não é um JSON de perfil. Coleta pausada; nenhum perfil foi marcado como sem e-mail.", status);
      }
      if (!body || typeof body !== "object" || Array.isArray(body)) {
        throw failure(entry, "temporary_error", "unexpected_response", "A resposta do Instagram veio vazia ou inválida. Coleta pausada; nenhum perfil foi marcado como sem e-mail.", status);
      }
      entry.emailPaths = emailPaths(body);
      if (body.status === "fail" || body.require_login || (Array.isArray(body.errors) && body.errors.length)) {
        throw refused(entry, status, body.require_login ? "login_required" : message);
      }
      // Only the envelopes the extension really receives: user, data.user, items[0].user.
      var located = deps.contacts.locateProfile({ data: body }, userId, "");
      entry.envelope = located.known;
      entry.profilePayload = !!located.user;
      if (!located.known) {
        throw failure(entry, "temporary_error", "unexpected_response", "A resposta do Instagram veio num formato desconhecido (user, data.user ou items[0].user não encontrados). Coleta pausada; nenhum perfil foi marcado como sem e-mail.", status);
      }
      // A deleted or renamed-away profile is a per-row result, not a session failure.
      if (!located.user) return skip("profile_unavailable", entry, userId);
      var user = located.user;
      var returnedId = String(user.pk != null ? user.pk : (user.pk_id != null ? user.pk_id : (user.id != null ? user.id : "")));
      if (located.mismatch || !returnedId) {
        entry.returnedId = returnedId.slice(0, 20);
        if (!returnedId) throw failure(entry, "temporary_error", "unexpected_response", "A resposta do Instagram não traz o id do perfil; ela não foi aplicada.", status);
        var mismatch = skip("identity_mismatch", entry, userId);
        mismatch.contactUserId = returnedId;
        return mismatch;
      }
      var detail = deps.contacts.toDetailResponse(user, username), contact = detail.publicContactResult, flags = {};
      flagFields.forEach(function (key) { if (own.call(user, key)) flags[key] = user[key]; });
      var shown = displayPath(located.path);
      entry.outcome = contact.emailStatus;
      entry.state = contact.emailStatus === "found" ? "email_found" : "no_public_email";
      entry.profileType = contact.profileType;
      entry.keys = contact.emailKeys;
      entry.flags = flags;
      entry.path = shown;
      entry.emailField = contact.emailStatus === "found" ? shown + "." + contact.emailSource : shown + ".public_email";
      entry.decision = contact.emailStatus === "found" ? "email_found (" + contact.emailSource + ")" : "no_public_email (" + contact.emailStatus + ")";
      entry.userKeys = Object.keys(user).sort().slice(0, 300);
      entry.email = maskEmail(contact.email);
      detail.contactEndpoint = endpoint;
      detail.contactRoute = "users_info";
      detail.contactUserId = returnedId;
      detail.contactOutcome = contact.emailStatus;
      detail.commercialContactFieldReturned = contact.emailFieldReturned;
      // Per-row diagnostics: field states and visibility flags, never values.
      detail.contactKeys = contact.emailKeys;
      detail.contactFlags = flags;
      return detail;
    }
    function decided(result, fromCache) {
      var copy = Object.assign({}, result);
      if (fromCache) copy.fromCache = true;
      return copy;
    }
    return async function read(userId, username, isCurrent, options) {
      var probe = !!(options && options.probe);
      userId = String(userId == null ? "" : userId).trim();
      username = String(username || "").trim().replace(/^@/, "").toLowerCase();
      if (!deps.locks || typeof deps.locks.request !== "function") {
        throw stopped("Não foi possível controlar a fila de consultas. Coleta pausada.", "lock");
      }
      var active = function () { return !isCurrent || isCurrent(); };
      return deps.locks.request(lockName, async function () {
        try {
          if (!active()) throw stopped("Consulta cancelada.", "cancelled");
          var saved = await deps.storage.get([cooldownKey, schemaKey, lastStartKey, pacingKey, profileCacheKey]);
          assertOpen(saved);
          if (!validId(userId)) {
            var known = idFromCache(saved, username);
            // No id, none known: the row says so and no other route is tried.
            if (!known) return decided(skip("no_user_id", { }, ""), false);
            userId = known;
          }
          if (!probe && memory.has(userId)) return decided(memory.get(userId), true);
          // Answered before (this or another extraction): no new request for the same profile.
          var stored = probe ? null : cachedProfile(saved, userId);
          if (stored) { memory.set(userId, stored); return decided(stored, true); }
          var delay = Math.max(0, Number(saved[lastStartKey]) + readPacing(saved).spacing - deps.now());
          if (delay) await deps.wait(delay);
          // Another dashboard can save a cooldown while this reader waits.
          saved = await deps.storage.get([cooldownKey, schemaKey]);
          assertOpen(saved);
          if (!active()) throw stopped("Consulta cancelada.", "cancelled");
          await deps.storage.set({ [lastStartKey]: deps.now() });
          if (!active()) throw stopped("Consulta cancelada.", "cancelled");
          var entry = { at: deps.now(), endpoint: endpoint, route: "GET /api/v1/users/{id}/info/", username: username, userId: userId, probe: probe, http: null, outcome: "" };
          var result;
          try { result = await fetchProfile(userId, username, entry); }
          catch (failed) {
            var refusal = failed && (failed.stopCode === "rate_limit" || (failed.stopCode === "access_denied" && failed.response && failed.response.status === 400));
            if (refusal) {
              await updatePacing(false);
              var after = await noteOutcome("refusal");
              // Diagnostic signal only: the pause and the manual restart are unchanged.
              if (routeRefusing(after)) {
                failed.routeRefusing = true;
                failed.refusalCount = after.refusals;
              }
            }
            throw failed;
          }
          finally { await record(entry); }
          // 404 proves the route answers; only a parsed user object is a profile.
          if (entry.envelope) { await noteOutcome(entry.profilePayload ? "profile" : "response"); await updatePacing(true); }
          if (!result.contactSkip) await updateSchema(username, result.publicContactResult, probe);
          // Cache before the cancellation check so a resume never repeats this request.
          memory.set(userId, result);
          await storeProfile(userId, username, result);
          if (!active()) throw stopped("Consulta cancelada.", "cancelled");
          return decided(result, false);
        } catch (error) {
          if (error && error.commercialRequestStopped) throw error;
          throw stopped("Não foi possível concluir a consulta do perfil. Coleta pausada, sem nova tentativa automática.", "request");
        }
      });
    };
  }
  return { create: create, retryUntil: retryUntil, readSchema: readSchema, maskEmail: maskEmail,
    saveCooldown: saveCooldown, cooldownLock: cooldownLock, stateSinceKey: "ig_contact_state_since",
    pacingKey: pacingKey, profileCacheKey: profileCacheKey, emailPaths: emailPaths, baseSpacing: baseSpacing, maxSpacing: maxSpacing,
    routeRefusing: routeRefusing, endpoint: endpoint, cooldownKey: cooldownKey, schemaKey: schemaKey, evidenceKey: evidenceKey,
    refusedLimit: refusedLimit, lastStartKey: lastStartKey };
});
