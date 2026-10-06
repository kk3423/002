/* PATCHED 14-15.5: email is exclusively the published Instagram commercial contact.
 * Each profile ends in one contact state (email_found, no_public_email, rate_limited,
 * login_required, access_denied, temporary_error, pending; profile_unavailable for a
 * deleted profile), kept apart from access failures. Only an HTTP 200 answer with the real
 * profile object can mean "no public email". No network calls, login/recovery fields,
 * viewer traversal, inferred contacts, or bio/link fallback for email.
 * 15.5: the profile identity check survives ids above 2^53, and the phone decision
 * (field, state of each phone field, masked number) is reported next to the email one.
 */
(function (root, factory) {
  var api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.IGPublicContacts = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";
  var own = Object.prototype.hasOwnProperty;
  // Top-level fields only: no live response has shown a nested contact block.
  var emailFields = ["public_email", "business_email"];
  // PATCHED 10-13 block names remain readable for phones and saved rows only.
  var contactBlocks = ["professional_contact_info", "professional_metadata", "public_contact_info", "business_contact_info"];
  var phoneFields = ["contact_phone_number", "public_phone_number", "business_phone_number"];
  var noEmail = "Perfil não disponibiliza e-mail público";
  // One text per detailed outcome. CALL/TEXT says nothing about an E-mail button, and an
  // empty field is just empty: the detail after the dot only says what the answer held.
  var statusText = {
    found: "E-mail comercial encontrado",
    empty: noEmail + " · campo vazio",
    not_delivered: noEmail + " · campo vazio",
    hidden: noEmail + " · contato oculto pelo perfil",
    omitted: noEmail + " · campo ausente na resposta",
    not_professional: noEmail + " · conta pessoal",
    invalid: noEmail + " · formato de e-mail inválido",
    profile_unavailable: "Perfil indisponível",
    identity_mismatch: "Perfil divergente (dados não aplicados)",
    no_user_id: "Sem ID do perfil (não consultado)",
    // Statuses saved by PATCHED 12-13 rows.
    not_published: noEmail + " · nenhum e-mail publicado",
    not_returned: noEmail + " · campo não retornado",
    source_not_verified: noEmail + " · e-mail de outra origem descartado"
  };
  var stateText = {
    email_found: statusText.found,
    no_public_email: noEmail,
    pending: "Aguardando consulta",
    rate_limited: "Consulta pausada pelo Instagram",
    login_required: "Sessão precisa ser verificada",
    access_denied: "Acesso negado pelo Instagram",
    temporary_error: "Falha temporária na consulta",
    profile_unavailable: "Perfil indisponível"
  };
  // Failure codes (reader errors and rows saved by older versions) -> contact state.
  var failureStates = {
    rate_limit: "rate_limited", cooldown: "rate_limited",
    login_required: "login_required", redirect: "login_required", invalid_response: "login_required",
    access_denied: "access_denied", access: "access_denied",
    network: "temporary_error", temporary: "temporary_error", unexpected_response: "temporary_error",
    request: "temporary_error", unsupported: "temporary_error"
  };

  function text(value) {
    return typeof value === "string" || typeof value === "number" ? String(value).trim() : "";
  }
  function at(value, path) {
    return path.split(".").reduce(function (obj, key) {
      return obj && typeof obj === "object" && own.call(obj, key) ? obj[key] : undefined;
    }, value);
  }
  function validEmail(value) {
    var s = text(value).replace(/^mailto:/i, "").split("?")[0];
    var local = s.split("@")[0];
    // Retain plus addressing; require a complete address rather than an @mention.
    var labels = (s.split("@")[1] || "").split(".");
    return s.length <= 254 && local.length <= 64 && labels.every(function (label) { return label.length <= 63; }) && !/^\.|\.$|\.\./.test(local) && /^[A-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Z0-9](?:[A-Z0-9-]*[A-Z0-9])?(?:\.[A-Z0-9](?:[A-Z0-9-]*[A-Z0-9])?)+$/i.test(s) ? s : "";
  }
  function hidden(value) { return value === false || value === 0 || value === "false" || value === "0"; }
  function published(value) { return value === true || value === 1 || value === "true" || value === "1"; }
  function profileType(user) {
    if (!user || typeof user !== "object") return "unknown";
    var accountType = Number(user.account_type);
    if (accountType === 2 || published(user.is_business_account) || published(user.is_business)) return "business";
    if (accountType === 3) return "creator";
    if (published(user.is_professional_account)) return hidden(user.is_business_account) ? "creator" : "professional";
    if (accountType === 1 || hidden(user.is_professional_account)) return "personal";
    return "unknown";
  }
  function valueState(user, field) {
    if (!own.call(user, field)) return "absent";
    var value = user[field];
    if (value === null || value === undefined) return "null";
    return text(value) ? "present" : "empty";
  }
  // absent = key not returned; null/empty = returned without a value.
  function fieldState(user, field) {
    if (!own.call(user, field)) return "absent";
    var value = user[field];
    if (value === null || value === undefined) return "null";
    if (value === false || (typeof value === "string" && !value.trim())) return "empty";
    if (typeof value !== "string" && typeof value !== "number") return "invalid";
    return validEmail(value) ? "valid" : "invalid";
  }
  function classifyEmail(user) {
    user = user && typeof user === "object" ? user : {};
    var keys = {}, returned = false, invalid = false, email = "", source = "";
    emailFields.forEach(function (field) {
      var state = keys[field] = fieldState(user, field);
      if (state !== "absent") returned = true;
      if (state === "invalid") invalid = true;
      if (state === "valid" && !email) { email = validEmail(user[field]); source = field; }
    });
    var type = profileType(user), status;
    keys.business_phone_number = valueState(user, "business_phone_number");
    // Personal accounts have no Contact button; a hidden flag wins over any value.
    // business_contact_method (CALL, TEXT...) says nothing about an E-mail button,
    // so it is never used to label a profile: an empty field is just empty.
    if (type === "personal") status = "not_professional";
    else if (hidden(user.should_show_public_contacts)) status = "hidden";
    else if (email) status = "found";
    else if (invalid) status = "invalid";
    else if (returned) status = "empty";
    else status = "omitted";
    return { status: status, email: status === "found" ? email : "", source: status === "found" ? source : "",
      profileType: type, fieldReturned: returned, keys: keys };
  }
  function commercialEmail(row) {
    if (!row || typeof row !== "object") return "";
    // Old bio/site results and unmarked legacy rows must not become button emails.
    var source = text(row.emailSource), trusted = emailFields.indexOf(source) >= 0;
    contactBlocks.forEach(function (key) {
      if (source === key || source === key + ".public_email" || source === key + ".business_email" || source === key + ".email") trusted = true;
    });
    return trusted && (row.emailKind === "commercial_contact" || Number(row.contactParserVersion) >= 10) ? validEmail(row.email) : "";
  }
  function failureState(failure) {
    if (!failure || typeof failure !== "object") return "pending";
    var status = Number(failure.status) || 0;
    if (status === 429) return "rate_limited";
    if (status === 401) return "login_required";
    return own.call(failureStates, failure.code) ? failureStates[failure.code] : "temporary_error";
  }
  function failureText(failure) {
    if (!failure || typeof failure !== "object") return "";
    var message = stateText[failureState(failure)], status = Number(failure.status) || 0;
    return status > 0 ? message + " · HTTP " + status : message;
  }
  // The one state of a row. A failure or a missing answer is never "no public email".
  function contactState(row) {
    if (!row || typeof row !== "object") return "pending";
    if (commercialEmail(row)) return "email_found";
    if (row.loaded === false || row.detailLoaded === false) return row.contactFailure ? failureState(row.contactFailure) : "pending";
    var status = row.emailStatus;
    if (status === "profile_unavailable" || status === "identity_mismatch" || status === "no_user_id") return "profile_unavailable";
    return "no_public_email";
  }
  function emailStatusText(row) {
    var state = contactState(row);
    if (state === "email_found") return stateText.email_found;
    if (state === "pending") return stateText.pending;
    if (state === "rate_limited" || state === "login_required" || state === "access_denied" || state === "temporary_error") return failureText(row.contactFailure) || stateText[state];
    var status = row && row.emailStatus;
    if (state === "profile_unavailable") return own.call(statusText, status) ? statusText[status] : stateText.profile_unavailable;
    if (row && (status === "source_not_verified" || (row.email && !commercialEmail(row)))) return statusText.source_not_verified;
    return status && status !== "found" && own.call(statusText, status) ? statusText[status] : stateText.no_public_email;
  }
  function commercialRow(row) {
    var copy = Object.assign({}, row), email = commercialEmail(row);
    if (copy.email && !email) copy.emailStatus = "source_not_verified";
    copy.email = email;
    // A row saved without the phone key must export an empty cell, never the word "undefined".
    copy.phone = text(row && row.phone);
    return copy;
  }
  function emailInText(value) {
    var matches = text(value).match(/[A-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Z0-9-]+(?:\.[A-Z0-9-]+)+/ig) || [];
    for (var i = 0; i < matches.length; i++) {
      var result = validEmail(matches[i].replace(/[.,;:!?]+$/, ""));
      if (result) return result;
    }
    return "";
  }
  function validPhone(value, countryCode) {
    var s = text(value).replace(/^tel:/i, "").split("?")[0].trim();
    if (!s || !/^\+?[\d\s().-]+$/.test(s)) return "";
    var digits = s.replace(/\D/g, "");
    if (digits.length < 8 || digits.length > 15 || /^(\d)\1+$/.test(digits)) return "";
    var international = s.charAt(0) === "+";
    if (!international && digits.indexOf("00") === 0 && digits.length >= 10) {
      digits = digits.slice(2);
      international = true;
    }
    var country = text(countryCode).replace(/^\+/, "");
    if (!international && /^[1-9]\d{0,2}$/.test(country)) {
      // Explicit full international numbers may already contain the country code.
      if (!(digits.indexOf(country) === 0 && digits.length >= country.length + 10)) digits = country + digits;
      international = true;
    }
    if (digits.length > 15 || (international && digits.charAt(0) === "0")) return "";
    return (international ? "+" : "") + digits;
  }
  function phoneInText(value) {
    var s = text(value), re = /\+?\d[\d \t().-]{6,}\d/g, match;
    while ((match = re.exec(s))) {
      var before = s.slice(Math.max(0, match.index - 40), match.index);
      var after = s.slice(match.index + match[0].length, match.index + match[0].length + 1);
      var previous = s.charAt(match.index - 1);
      // Reject IDs, years, dates, quantities, and digits inside handles/URLs.
      if (/[\w@/#]/.test(previous) || /[\w@/]/.test(after)) continue;
      if (/(?:\b(?:CRM|RQE|CNPJ|CPF|CEP|registro|licen[çc]a|nasc(?:imento)?|born|desde|since|posts?|followers?|seguidores?)\b)[^\n\d]{0,18}$/i.test(before)) continue;
      var digits = match[0].replace(/\D/g, "");
      var labeled = /(?:whats(?:app)?|wpp|telefone|fone|tel\.?|phone|contato|contact|booking|reservas?|☎|📞)[^\n\d]{0,18}$/i.test(before);
      var international = match[0].charAt(0) === "+";
      var areaCode = /^\d{2,3}\)\s*\d/.test(match[0]) && previous === "(";
      var formatted = /^\d{2,3}[ \t.-]+\d{4,5}[ \t.-]+\d{4}$/.test(match[0]);
      if (!(labeled || international || areaCode || formatted)) continue;
      var result = validPhone(match[0]);
      if (result) return result;
    }
    return "";
  }
  // Public phone shown for the diagnosis only: with "+", the 2 prefix digits and the last 2; without it, only the last 2.
  // A valid phone has at least 8 digits, so at most half of them show and the number is never printed.
  function maskPhone(value) {
    var s = validPhone(value);
    if (!s) return "";
    var plus = s.charAt(0) === "+" ? "+" : "", digits = s.replace(/\D/g, "");
    var head = plus ? digits.slice(0, 2) : "", tail = digits.slice(-2);
    return plus + head + new Array(digits.length - head.length - tail.length + 1).join("*") + tail;
  }
  // The ids the answer carries, in the order the check has always used (pk, pk_id, id). JSON.parse rounds a
  // numeric pk above 2^53, so such a number is not exact: it gives way to an exact id of the same answer (text,
  // or a number below 2^53) and is compared as a number only when it is all the answer carries.
  function profileIds(user) {
    var out = [];
    ["pk", "pk_id", "id"].forEach(function (key) {
      var value = user[key];
      if (typeof value === "string" && value.trim()) out.push({ id: value.trim(), exact: true });
      else if (typeof value === "number" && isFinite(value)) out.push({ id: String(value), exact: Number.isSafeInteger(value) });
    });
    return out;
  }
  // The one id that decides: the first exact one, else the first (rounded) one.
  function decisiveId(ids) {
    return ids.filter(function (found) { return found.exact; })[0] || ids[0] || null;
  }
  function sameId(ids, expectedId) {
    var want = text(expectedId), found = decisiveId(ids);
    if (!want || !found) return true;
    return found.exact ? found.id === want : Number(want) === Number(found.id);
  }
  function profileId(ids) {
    var found = decisiveId(ids);
    return found ? found.id : "";
  }
  // Envelopes of the profile detail answer, relative to an axios-style response
  // ({ data: body }): body.user, body.data.user and body.items[0].user, or the body itself.
  // Never data.viewer, suggested users or comment authors.
  var profilePaths = ["data.user", "data.data.user", "data.items.0.user", "user", "items.0.user"];
  function locateProfile(response, expectedId, expectedUsername) {
    for (var i = 0; i < profilePaths.length; i++) {
      var parts = profilePaths[i].split("."), parent = parts.length > 1 ? at(response, parts.slice(0, -1).join(".")) : response;
      if (!parent || typeof parent !== "object" || !own.call(parent, "user")) continue;
      var user = parent.user;
      // The envelope is known; an explicit null or non-object user means the profile is gone.
      if (!user || typeof user !== "object" || Array.isArray(user)) return { known: true, path: profilePaths[i], user: null, mismatch: false, id: "" };
      var ids = profileIds(user), username = text(user.username);
      var mismatch = !sameId(ids, expectedId) ||
        !!(expectedUsername && username && username.toLowerCase() !== text(expectedUsername).toLowerCase());
      return { known: true, path: profilePaths[i], user: user, mismatch: mismatch, id: profileId(ids) };
    }
    return { known: false, path: "", user: null, mismatch: false, id: "" };
  }
  function profileFromResponse(response, expectedId, expectedUsername) {
    var found = locateProfile(response, expectedId, expectedUsername);
    return found.user && !found.mismatch ? found.user : null;
  }
  function linkContacts(value) {
    var result = { email: "", phone: "" }, raw = text(value);
    if (!raw) return result;
    try {
      var url = new URL(raw);
      if (url.hostname === "l.instagram.com" && url.searchParams.has("u")) url = new URL(url.searchParams.get("u"));
      if (url.protocol === "mailto:") result.email = validEmail(decodeURIComponent(url.pathname));
      else if (url.protocol === "tel:") result.phone = validPhone(decodeURIComponent(url.pathname));
      else if (url.protocol === "https:" || url.protocol === "http:") {
        if (url.hostname === "wa.me") result.phone = validPhone("+" + url.pathname.replace(/^\//, ""));
        else if (url.hostname === "api.whatsapp.com" || url.hostname === "web.whatsapp.com") {
          if (url.pathname === "/send" || url.pathname === "/send/") result.phone = validPhone("+" + (url.searchParams.get("phone") || ""));
        }
      }
    } catch (err) { /* malformed profile link: no contact */ }
    return result;
  }
  function extract(user) {
    user = user && typeof user === "object" ? user : {};
    var bio = text(user.biography) || text(at(user, "biography_with_entities.raw_text"));
    var contact = classifyEmail(user);
    var visible = !hidden(user.should_show_public_contacts);
    var result = { email: contact.email, phone: "", emailSource: contact.source, phoneSource: "", biography: bio,
      emailStatus: contact.status, phoneStatus: visible ? "not_returned" : "not_published",
      profileType: contact.profileType, emailFieldReturned: contact.fieldReturned, emailKeys: contact.keys,
      // Names and value kinds only: whether each published phone field came back with a value.
      phoneKeys: {}, phonePublished: false };
    phoneFields.forEach(function (field) {
      var state = valueState(user, field);
      // Text that does not parse as a phone ("ligue-nos", "12") is reported as such, not as an empty field.
      result.phoneKeys[field] = state === "present" && !validPhone(user[field], user.public_phone_country_code) ? "invalid" : state;
    });
    result.phoneKeys.public_phone_country_code = valueState(user, "public_phone_country_code");
    if (visible) {
      phoneFields.forEach(function (field) {
        if (own.call(user, field)) result.phoneStatus = "not_published";
        var value = validPhone(user[field], user.public_phone_country_code);
        if (!result.phone && value) { result.phone = value; result.phoneSource = field; }
      });
      contactBlocks.forEach(function (key) {
        var info = user[key];
        if (!info || typeof info !== "object" || Array.isArray(info)) return;
        if (hidden(info.is_public) || hidden(info.should_show_public_contacts)) return;
        // Generic phone_number is accepted only with explicit publication.
        var markedPublic = key === "public_contact_info" || published(info.is_public) || published(info.should_show_public_contacts) || published(user.should_show_public_contacts);
        var phone = validPhone(info.contact_phone_number || info.public_phone_number || info.business_phone_number || (markedPublic ? info.phone_number : ""), info.country_code || user.public_phone_country_code);
        if (!result.phone && phone) { result.phone = phone; result.phoneSource = key; }
      });
    }
    // Keep the existing public phone parser; email never falls back to bio or links.
    if (!result.phone) { result.phone = phoneInText(bio); if (result.phone) result.phoneSource = "biography"; }
    var links = [user.external_url, user.external_lynx_url, user.external_url_linkshimmed];
    (Array.isArray(user.bio_links) ? user.bio_links : []).forEach(function (link) {
      if (link && typeof link === "object") links.push(link.url, link.lynx_url);
    });
    // Bio may contain a direct WhatsApp, mailto or tel link as plain text.
    links = links.concat(bio.match(/(?:https?:\/\/[^\s<>]+|mailto:[^\s<>]+|tel:\+?[\d().-]+)/ig) || []);
    links.forEach(function (link) {
      var contacts = linkContacts(link);
      if (!result.phone && contacts.phone) { result.phone = contacts.phone; result.phoneSource = "profile_link"; }
    });
    if (result.email) result.emailKind = "commercial_contact";
    if (!result.phone && visible && phoneFields.some(function (field) { return result.phoneKeys[field] === "invalid"; })) result.phoneStatus = "invalid";
    if (result.phone) result.phoneStatus = "found";
    // A phone from a published contact field is Instagram's own public contact; one read from the
    // biography or a profile link is public text, reported apart so the two are never confused.
    result.phonePublished = !!result.phone && result.phoneSource !== "biography" && result.phoneSource !== "profile_link";
    return result;
  }
  function number(user, field, alternate) {
    var value = user[field];
    if (value === undefined || value === null) value = at(user, alternate);
    if (typeof value === "string" && /^\d+$/.test(value)) value = Number(value);
    return typeof value === "number" && isFinite(value) && value >= 0 ? value : 0;
  }
  function toDetailResponse(user, username) {
    var contacts = extract(user), address = user.business_address_json || user.business_address || {};
    try { if (typeof address === "string") address = JSON.parse(address); } catch (err) { address = {}; }
    if (!address || typeof address !== "object") address = {};
    return { data: { status: "ok", user: {
      profile_pic_url: text(user.profile_pic_url_hd) || text(at(user, "hd_profile_pic_url_info.url")) || text(user.profile_pic_url),
      username: text(user.username) || text(username), full_name: text(user.full_name),
      follower_count: number(user, "follower_count", "edge_followed_by.count"),
      following_count: number(user, "following_count", "edge_follow.count"),
      media_count: number(user, "media_count", "edge_owner_to_timeline_media.count"),
      public_email: contacts.email, contact_phone_number: contacts.phone,
      public_phone_number: "", public_phone_country_code: "",
      city_name: text(user.city_name) || text(address.city_name || address.locality || address.city) || text(at(user, "professional_contact_info.city_name")),
      address_street: text(user.address_street) || text(address.street_address || address.address_street || address.address) || text(at(user, "professional_contact_info.address_street")),
      is_private: !!user.is_private, is_verified: !!user.is_verified,
      is_business: !!(user.is_business || user.is_business_account || user.is_professional_account),
      external_url: text(user.external_url) || text(user.external_url_linkshimmed), biography: contacts.biography
    } }, publicContactResult: contacts };
  }
  return { extract: extract, classifyEmail: classifyEmail, profileType: profileType, emailFields: emailFields.slice(),
    profileFromResponse: profileFromResponse, locateProfile: locateProfile, profilePaths: profilePaths.slice(), toDetailResponse: toDetailResponse,
    contactState: contactState, failureState: failureState, stateText: stateText,
    validEmail: validEmail, validPhone: validPhone, maskPhone: maskPhone, emailInText: emailInText, phoneInText: phoneInText, linkContacts: linkContacts,
    commercialEmail: commercialEmail, commercialRow: commercialRow, emailStatusText: emailStatusText,
    failureText: failureText, statusText: statusText };
});
