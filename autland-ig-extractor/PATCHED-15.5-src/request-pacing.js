/* Serial Instagram request spacing; no network operations. PATCHED 15.5. */
(function (root, factory) {
  var api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.IGRequestPacing = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";
  function intervals(value, type) {
    // PATCHED 15.4-15.5: every mode, Comment included, uses the same /users/{id}/info/ request, so it
    // keeps the same conservative 15-30 s default (the user's saved range still wins). 10 s is the floor.
    var range = Array.isArray(value) ? value.slice(0, 2) : [15, 30];
    var low = Math.max(10, Number(range[0]) || 10);
    return [low, Math.max(low, Number(range[1]) || 15)];
  }
  return { intervals: intervals };
});
