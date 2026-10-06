(function (t) {
  function e(e) {
    for (
      var a, o, r = e[0], c = e[1], l = e[2], d = 0, p = [];
      d < r.length;
      d++
    )
      (o = r[d]),
        Object.prototype.hasOwnProperty.call(i, o) && i[o] && p.push(i[o][0]),
        (i[o] = 0);
    for (a in c) Object.prototype.hasOwnProperty.call(c, a) && (t[a] = c[a]);
    u && u(e);
    while (p.length) p.shift()();
    return n.push.apply(n, l || []), s();
  }
  function s() {
    for (var t, e = 0; e < n.length; e++) {
      for (var s = n[e], a = !0, r = 1; r < s.length; r++) {
        var c = s[r];
        0 !== i[c] && (a = !1);
      }
      a && (n.splice(e--, 1), (t = o((o.s = s[0]))));
    }
    return t;
  }
  var a = {},
    i = { dashboard: 0 },
    n = [];
  function o(e) {
    if (a[e]) return a[e].exports;
    var s = (a[e] = { i: e, l: !1, exports: {} });
    return t[e].call(s.exports, s, s.exports, o), (s.l = !0), s.exports;
  }
  (o.m = t),
    (o.c = a),
    (o.d = function (t, e, s) {
      o.o(t, e) || Object.defineProperty(t, e, { enumerable: !0, get: s });
    }),
    (o.r = function (t) {
      "undefined" !== typeof Symbol &&
        Symbol.toStringTag &&
        Object.defineProperty(t, Symbol.toStringTag, { value: "Module" }),
        Object.defineProperty(t, "__esModule", { value: !0 });
    }),
    (o.t = function (t, e) {
      if ((1 & e && (t = o(t)), 8 & e)) return t;
      if (4 & e && "object" === typeof t && t && t.__esModule) return t;
      var s = Object.create(null);
      if (
        (o.r(s),
        Object.defineProperty(s, "default", { enumerable: !0, value: t }),
        2 & e && "string" != typeof t)
      )
        for (var a in t)
          o.d(
            s,
            a,
            function (e) {
              return t[e];
            }.bind(null, a)
          );
      return s;
    }),
    (o.n = function (t) {
      var e =
        t && t.__esModule
          ? function () {
              return t["default"];
            }
          : function () {
              return t;
            };
      return o.d(e, "a", e), e;
    }),
    (o.o = function (t, e) {
      return Object.prototype.hasOwnProperty.call(t, e);
    }),
    (o.p = "/");
  var r = (window["webpackJsonp"] = window["webpackJsonp"] || []),
    c = r.push.bind(r);
  (r.push = e), (r = r.slice());
  for (var l = 0; l < r.length; l++) e(r[l]);
  var u = c;
  n.push([3, "chunk-vendors", "chunk-common"]), s();
})({
  3: function (t, e, s) {
    t.exports = s("7c3d");
  },
  "3b7b": function (t, e, s) {},
  "7c3d": function (t, e, s) {
    "use strict";
    s.r(e);
    s("e260"), s("e6cf"), s("cca6"), s("a79d");
    var a = s("2b0e"),
      i = function () {
        var t = this,
          e = t.$createElement,
          s = t._self._c || e;
        return s(
          "div",
          { staticClass: "app" },
          [
            s("div", { staticClass: "wrapper mx-4" }, [
              s(
                "header",
                { staticClass: "is-flex is-align-items-center p-3 pl-4" },
                [
                  t._m(0),
                  s(
                    "h1",
                    { staticClass: "is-size-5 has-text-weight-bold px-2" },
                    [t._v("Autland IG Extractor")]
                  ),
                  s(
                    "span",
                    { staticClass: "has-text-grey-light is-size-7 mt-1" },
                    [t._v(t._s(t.version))]
                  ),
                  void 1 !== t.subscription.isPro &&
                  (!t.subscription.isPro ||
                    (t.subscription.isPro && t.subscription.isCanceled)) &&
                  t.insLogged &&
                  t.user.id
                    ? s(
                        "a",
                        {
                          staticClass:
                            "btn-pro is-flex is-justify-content-center is-align-items-center px-5 is-size-6",
                          on: { click: t.handleShowProModal },
                        },
                        [
                          s(
                            "svg",
                            {
                              attrs: {
                                xmlns: "http://www.w3.org/2000/svg",
                                viewBox: "0 0 24 24",
                                width: "18",
                                height: "18",
                              },
                            },
                            [
                              s("path", {
                                attrs: { fill: "none", d: "M0 0h24v24H0z" },
                              }),
                              s("path", {
                                attrs: {
                                  d: "M2.8 5.2L7 8l4.186-5.86a1 1 0 0 1 1.628 0L17 8l4.2-2.8a1 1 0 0 1 1.547.95l-1.643 13.967a1 1 0 0 1-.993.883H3.889a1 1 0 0 1-.993-.883L1.253 6.149A1 1 0 0 1 2.8 5.2zM12 15a2 2 0 1 0 0-4 2 2 0 0 0 0 4z",
                                  fill: "currentColor",
                                },
                              }),
                            ]
                          ),
                          s(
                            "span",
                            { staticClass: "pl-2 has-text-weight-semibold" },
                            [t._v("Upgrade to Pro")]
                          ),
                        ]
                      )
                    : t._e(),
                ]
              ),
              s(
                "main",
                [
                  !t.subscription.isPro &&
                  (t.isComplete || t.loadUserIndex > 0) &&
                  t.followList.length > 0 &&
                  (t.extractEmailCount > t.extractEmailCount ||
                    t.localExtractEmailCount > t.localExtractEmailCount)
                    ? s(
                        "b-notification",
                        {
                          staticClass: "mx-3 mt-2",
                          attrs: {
                            type: "is-warning",
                            "aria-close-label": "Close notification",
                            role: "alert",
                            closable: !1,
                          },
                        },
                        [
                          t._v(" You trial has ended ("),
                          s("span", { staticClass: "has-text-weight-bold" }, [
                            t._v(t._s(t.trialCount)),
                          ]),
                          t._v(" emails). Upgrade the Pro to extract "),
                          s("span", { staticClass: "has-text-weight-bold" }, [
                            t._v("unlimited"),
                          ]),
                          t._v(" emails and unlock all features. "),
                          s(
                            "a",
                            {
                              staticClass:
                                "has-text-danger is-underlined has-text-weight-bold",
                              on: { click: t.handleShowProModal },
                            },
                            [t._v(" Upgrade Now")]
                          ),
                          s("b-icon", {
                            attrs: {
                              icon: "mouse-pointer",
                              type: "is-primary",
                            },
                          }),
                          t._v(" !! "),
                        ],
                        1
                      )
                    : t._e(),
                  4 === t.type
                    ? s("div", { staticClass: "main-box mb-3 p-4 has-text-centered" }, [
                        s("p", { staticClass: "mb-2" }, [t._v(t.commercialStatusMessage())]),
                        s("p", { staticClass: "mb-3 is-size-7" }, [t._v(
                          t.contactRealProof
                            ? "Contato comercial público já recebido numa resposta real: @" + t.contactRealProof.username + " em " + new Date(t.contactRealProof.at).toLocaleString() + " (" + (t.contactRealProof.email || "e-mail mascarado") + ")."
                            : "Ainda não há resposta real com contato comercial público nesta extensão."
                        )]),
                        s("p", { staticClass: "mb-3 is-size-7" }, [t._v(
                          t.phoneRealProof
                            ? "Telefone público (campo do Instagram) já recebido numa resposta real: @" + t.phoneRealProof.username + " em " + new Date(t.phoneRealProof.at).toLocaleString() + " (" + (t.phoneRealProof.phone || "telefone mascarado") + ", campo " + (t.phoneRealProof.field || "-") + ")."
                            : "Ainda não há resposta real com telefone público (campo do Instagram) nesta extensão."
                        )]),
                        t.commercialStartRequired
                          ? s("b-button", {
                              staticClass: "mb-3",
                              attrs: { type: "is-primary", disabled: t.commercialContactUnavailable || t.retryAfterUntil > t.contactStatusNow },
                              on: { click: t.handleToggleWorkStatus }
                            }, [t._v("Iniciar")])
                          : t._e(),
                        s("div", { staticClass: "is-flex is-justify-content-center is-align-items-center mb-2", staticStyle: { gap: "8px", "flex-wrap": "wrap" } }, [
                          s("b-button", {
        attrs: { size: "is-small", type: "is-info", disabled: t.contactProbeRunning || !t.pendingContactCount || (!t.isPaused && !t.isComplete) || t.retryAfterUntil > t.contactStatusNow },
        on: { click: t.handleContactProbe }
      }, [t._v(t.contactProbeRunning ? "Consultando..." : "Validar 1 perfil pendente")]),
                          s("b-button", {
                            attrs: { size: "is-small", disabled: !t.contactEvidence.length },
                            on: { click: t.handleCopyContactDiagnostic }
                          }, [t._v("Copiar diagnóstico")])
                        ]),
                        t.validationCard
                          ? s("div", {
                              staticClass: "notification contact-validation-card",
                              class: t.validationCard.type,
                              staticStyle: { "text-align": "left", "font-size": "13px", "line-height": "1.45", "max-width": "880px", margin: "0 auto 12px", padding: "12px 44px 12px 16px" },
                              attrs: { role: "status" }
                            }, [
                              s("button", { staticClass: "delete", attrs: { type: "button", "aria-label": "Fechar o quadro de validação", title: "Fechar" }, on: { click: t.closeValidationCard } }),
                              s("div", { domProps: { innerHTML: t.validationCard.html } })
                            ])
                          : t._e(),
                        t.contactEvidence.length
                          ? s("textarea", {
                              staticClass: "textarea is-small contact-diagnostic",
                              staticStyle: { "font-family": "monospace", "font-size": "11px" },
                              attrs: { readonly: true, rows: 8 },
                              domProps: { value: t.contactDiagnosticText }
                            })
                          : t._e()
                      ], 1)
                    : t._e(),
                  t.user.id
                    ? s(
                        "div",
                        { staticClass: "main-box mb-3 p-4 has-text-centered" },
                        [
                          0 === t.type || 1 === t.type
                            ? s("div", [
                                t.insUser.name
                                  ? s(
                                      "div",
                                      {
                                        staticClass:
                                          "source-text is-flex is-justify-content-center is-align-items-center pb-4",
                                      },
                                      [
                                        t.insUser.avatar
                                          ? s("b-image", {
                                              staticClass: "is-48x48",
                                              attrs: {
                                                src:
                                                  "https://www.autland.com/" +
                                                  t.insUser.avatar,
                                                "src-fallback":
                                                  "https://autland.com/avatar-d.png",
                                                alt: t.insUser.name,
                                                rounded: !0,
                                              },
                                            })
                                          : t._e(),
                                        s(
                                          "a",
                                          {
                                            staticClass:
                                              "has-text-black is-size-5 px-2",
                                            attrs: {
                                              href:
                                                "https://www.instagram.com/" +
                                                t.insUser.name +
                                                "/",
                                              target: "_blank",
                                              title:
                                                "https://www.instagram.com/" +
                                                t.insUser.name +
                                                "/",
                                            },
                                          },
                                          [t._v("@" + t._s(t.insUser.name))]
                                        ),
                                        s(
                                          "b-tag",
                                          {
                                            directives: [
                                              {
                                                name: "show",
                                                rawName: "v-show",
                                                value: t.insUser.count > 0,
                                                expression: "insUser.count > 0",
                                              },
                                            ],
                                            staticClass: "ml-2",
                                            attrs: {
                                              type: "is-danger is-light",
                                              rounded: "",
                                              size: "is-medium",
                                            },
                                          },
                                          [
                                            s(
                                              "em",
                                              {
                                                staticClass:
                                                  "has-text-weight-semibold",
                                              },
                                              [t._v(t._s(t.insUser.count))]
                                            ),
                                            t._v(
                                              " " +
                                                t._s(
                                                  0 === t.type
                                                    ? "followers"
                                                    : "following"
                                                ) +
                                                " "
                                            ),
                                          ]
                                        ),
                                      ],
                                      1
                                    )
                                  : t._e(),
                                t.isNoFollow
                                  ? s(
                                      "div",
                                      {
                                        staticClass:
                                          "is-size-6 is-flex is-justify-content-center is-align-items-center py-3",
                                      },
                                      [
                                        s("b-icon", {
                                          attrs: {
                                            icon: "dizzy",
                                            type: "is-warning",
                                            size: "is-medium",
                                          },
                                        }),
                                        t.insUser.is_private
                                          ? s("span", [
                                              t._v(
                                                "This is a private user, can't extract."
                                              ),
                                            ])
                                          : s("span", [
                                              t._v(
                                                "No " +
                                                  t._s(
                                                    0 === t.type
                                                      ? "followers"
                                                      : "following"
                                                  ) +
                                                  " on this user yet."
                                              ),
                                            ]),
                                      ],
                                      1
                                    )
                                  : s("div", [
                                      t.isComplete
                                        ? s(
                                            "div",
                                            {
                                              staticClass:
                                                "is-size-6 is-flex is-justify-content-center is-align-items-center py-3",
                                            },
                                            [
                                              s("b-icon", {
                                                attrs: {
                                                  icon: "check-circle",
                                                  type: "is-success",
                                                  size: "is-medium",
                                                },
                                              }),
                                              t._v(" Completed. "),
                                              s(
                                                "span",
                                                {
                                                  staticClass:
                                                    "has-text-primary has-text-weight-semibold mx-1",
                                                },
                                                [t._v(t._s(t.processedList.length))]
                                              ),
                                              t._v(
                                                " users have been extracted"
                                              ),
                                              t.lastScrapedCount > 0
                                                ? s("span", [
                                                    t._v(
                                                      " (The task has accumulated "
                                                    ),
                                                    s(
                                                      "span",
                                                      {
                                                        staticClass:
                                                          "has-text-primary has-text-weight-semibold mx-1",
                                                      },
                                                      [
                                                        t._v(
                                                          t._s(
                                                            t.lastScrapedCount +
                                                              t.processedList.length
                                                          )
                                                        ),
                                                      ]
                                                    ),
                                                    t._v(" users extracted)"),
                                                  ])
                                                : t._e(),
                                              t._v(". "),
                                            ],
                                            1
                                          )
                                        : s(
                                            "div",
                                            {
                                              staticClass:
                                                "is-size-6 is-flex is-justify-content-center is-align-items-center py-3",
                                            },
                                            [
                                              s("b-icon", {
                                                attrs: {
                                                  icon: t.isPaused
                                                    ? "pause-circle"
                                                    : "sync",
                                                  "custom-class": t.isPaused
                                                    ? ""
                                                    : "fa-spin1",
                                                  type: "is-primary",
                                                  size: "is-medium",
                                                },
                                              }),
                                              t.isPaused
                                                ? s("span", [
                                                    t._v(" Suspended. "),
                                                    s(
                                                      "span",
                                                      {
                                                        staticClass:
                                                          "has-text-primary has-text-weight-semibold mx-1",
                                                      },
                                                      [
                                                        t._v(
                                                          t._s(
                                                            t.processedList.length
                                                          )
                                                        ),
                                                      ]
                                                    ),
                                                    t._v(
                                                      " users have been extracted"
                                                    ),
                                                    t.lastScrapedCount > 0
                                                      ? s("span", [
                                                          t._v(
                                                            " (The task has accumulated "
                                                          ),
                                                          s(
                                                            "span",
                                                            {
                                                              staticClass:
                                                                "has-text-primary has-text-weight-semibold mx-1",
                                                            },
                                                            [
                                                              t._v(
                                                                t._s(
                                                                  t.lastScrapedCount +
                                                                    t.processedList
                                                                      .length
                                                                )
                                                              ),
                                                            ]
                                                          ),
                                                          t._v(
                                                            " users extracted)"
                                                          ),
                                                        ])
                                                      : t._e(),
                                                    t._v(". "),
                                                  ])
                                                : s("span", [
                                                    t._v(" Start extracting "),
                                                    s(
                                                      "span",
                                                      {
                                                        staticClass:
                                                          "has-text-primary has-text-weight-semibold mx-1",
                                                      },
                                                      [
                                                        t._v(
                                                          t._s(
                                                            t.processedList.length +
                                                              1
                                                          )
                                                        ),
                                                      ]
                                                    ),
                                                    t._v(" user"),
                                                    t.lastScrapedCount > 0
                                                      ? s("span", [
                                                          t._v(
                                                            " (The task has accumulated "
                                                          ),
                                                          s(
                                                            "span",
                                                            {
                                                              staticClass:
                                                                "has-text-primary has-text-weight-semibold mx-1",
                                                            },
                                                            [
                                                              t._v(
                                                                t._s(
                                                                  t.lastScrapedCount +
                                                                    t.processedList
                                                                      .length
                                                                )
                                                              ),
                                                            ]
                                                          ),
                                                          t._v(
                                                            " users extracted)"
                                                          ),
                                                        ])
                                                      : t._e(),
                                                    t._v(". "),
                                                  ]),
                                              !t.isLoading &&
                                              !t.isComplete &&
                                              ((t.lastHistoryItem && t.lastHistoryItem.id) ||
                                              (t.isPaused && t.resumeStartup))
                                                ? s(
                                                    "b-button",
                                                    {
                                                      staticClass:
                                                        "btn-pause ml-2 has-text-weight-semibold",
                                                      attrs: {
                                                        size: "is-small",
                                                        "icon-left": t.isPaused
                                                          ? "play-circle"
                                                          : "pause-circle",
                                                        type: "is-warning",
                                                      },
                                                      on: {
                                                        click:
                                                          t.handleToggleWorkStatus,
                                                      },
                                                    },
                                                    [
                                                      t._v(
                                                        " " +
                                                          t._s(
                                                            t.isPaused
                                                              ? "Continue"
                                                              : "Pause"
                                                          ) +
                                                          " "
                                                      ),
                                                    ]
                                                  )
                                                : t._e(),
                                            ],
                                            1
                                          ),
                                    ]),
                              ])
                            : 2 === t.type
                            ? s("div", [
                                t.insHashtag.name
                                  ? s(
                                      "div",
                                      {
                                        staticClass:
                                          "source-text is-flex is-justify-content-center is-align-items-center pb-4",
                                      },
                                      [
                                        t.insHashtag.profile_pic_url
                                          ? s("b-image", {
                                              staticClass: "is-48x48",
                                              attrs: {
                                                src:
                                                  "https://www.autland.com/" +
                                                  t.insHashtag.profile_pic_url,
                                                "src-fallback":
                                                  "https://autland.com/avatar-d.png",
                                                alt: t.insHashtag.name,
                                              },
                                            })
                                          : t._e(),
                                        s(
                                          "span",
                                          { staticClass: "is-size-6 ml-2" },
                                          [t._v("Hashtag: ")]
                                        ),
                                        s(
                                          "a",
                                          {
                                            staticClass:
                                              "has-text-black is-size-5 px-2",
                                            attrs: {
                                              href:
                                                "https://www.instagram.com/explore/tags/" +
                                                t.insHashtag.name +
                                                "/",
                                              target: "_blank",
                                              title:
                                                "https://www.instagram.com/explore/tags/" +
                                                t.insHashtag.name +
                                                "/",
                                            },
                                          },
                                          [t._v("#" + t._s(t.insHashtag.name))]
                                        ),
                                        s(
                                          "div",
                                          [
                                            s(
                                              "b-tag",
                                              {
                                                staticClass: "ml-2",
                                                attrs: {
                                                  type: "is-danger is-light",
                                                  rounded: "",
                                                  size: "is-medium",
                                                },
                                              },
                                              [
                                                s(
                                                  "em",
                                                  {
                                                    staticClass:
                                                      "has-text-weight-semibold",
                                                  },
                                                  [
                                                    t._v(
                                                      t._s(t.insHashtag.count)
                                                    ),
                                                  ]
                                                ),
                                                t._v(" posts "),
                                              ]
                                            ),
                                          ],
                                          1
                                        ),
                                      ],
                                      1
                                    )
                                  : t._e(),
                                t.isComplete
                                  ? s(
                                      "div",
                                      {
                                        staticClass:
                                          "is-size-6 is-flex is-justify-content-center is-align-items-center py-3",
                                      },
                                      [
                                        s("b-icon", {
                                          attrs: {
                                            icon: "check-circle",
                                            type: "is-success",
                                            size: "is-medium",
                                          },
                                        }),
                                        t._v(" Completed. "),
                                        s(
                                          "span",
                                          {
                                            staticClass:
                                              "has-text-primary has-text-weight-semibold mx-1",
                                          },
                                          [t._v(t._s(t.processedList.length))]
                                        ),
                                        t._v(" users have been extracted"),
                                        t.lastScrapedCount > 0
                                          ? s("span", [
                                              t._v(
                                                " (The task has accumulated "
                                              ),
                                              s(
                                                "span",
                                                {
                                                  staticClass:
                                                    "has-text-primary has-text-weight-semibold mx-1",
                                                },
                                                [
                                                  t._v(
                                                    t._s(
                                                      t.lastScrapedCount +
                                                        t.processedList.length
                                                    )
                                                  ),
                                                ]
                                              ),
                                              t._v(" users extracted)"),
                                            ])
                                          : t._e(),
                                        t._v(". "),
                                      ],
                                      1
                                    )
                                  : s(
                                      "div",
                                      {
                                        staticClass:
                                          "is-size-6 is-flex is-justify-content-center is-align-items-center py-3",
                                      },
                                      [
                                        s("b-icon", {
                                          attrs: {
                                            icon: t.isPaused
                                              ? "pause-circle"
                                              : "sync",
                                            "custom-class": t.isPaused
                                              ? ""
                                              : "fa-spin1",
                                            type: "is-primary",
                                            size: "is-medium",
                                          },
                                        }),
                                        t.isPaused
                                          ? s("span", [
                                              t._v(" Suspended. "),
                                              s(
                                                "span",
                                                {
                                                  staticClass:
                                                    "has-text-primary has-text-weight-semibold mx-1",
                                                },
                                                [t._v(t._s(t.processedList.length))]
                                              ),
                                              t._v(
                                                " users have been extracted"
                                              ),
                                              t.lastScrapedCount > 0
                                                ? s("span", [
                                                    t._v(
                                                      " (The task has accumulated "
                                                    ),
                                                    s(
                                                      "span",
                                                      {
                                                        staticClass:
                                                          "has-text-primary has-text-weight-semibold mx-1",
                                                      },
                                                      [
                                                        t._v(
                                                          t._s(
                                                            t.lastScrapedCount +
                                                              t.processedList.length
                                                          )
                                                        ),
                                                      ]
                                                    ),
                                                    t._v(" users extracted)"),
                                                  ])
                                                : t._e(),
                                              t._v(". "),
                                            ])
                                          : s("span", [
                                              t._v(" Start extracting "),
                                              s(
                                                "span",
                                                {
                                                  staticClass:
                                                    "has-text-primary has-text-weight-semibold mx-1",
                                                },
                                                [
                                                  t._v(
                                                    t._s(t.processedList.length + 1)
                                                  ),
                                                ]
                                              ),
                                              t._v(" user"),
                                              t.lastScrapedCount > 0
                                                ? s("span", [
                                                    t._v(
                                                      " (The task has accumulated "
                                                    ),
                                                    s(
                                                      "span",
                                                      {
                                                        staticClass:
                                                          "has-text-primary has-text-weight-semibold mx-1",
                                                      },
                                                      [
                                                        t._v(
                                                          t._s(
                                                            t.lastScrapedCount +
                                                              t.processedList.length
                                                          )
                                                        ),
                                                      ]
                                                    ),
                                                    t._v(" users extracted)"),
                                                  ])
                                                : t._e(),
                                              t._v(". "),
                                            ]),
                                        !t.isLoading &&
                                        !t.isComplete &&
                                        ((t.lastHistoryItem && t.lastHistoryItem.id) ||
                                        (t.isPaused && t.resumeStartup))
                                          ? s(
                                              "b-button",
                                              {
                                                staticClass:
                                                  "btn-pause ml-2 has-text-weight-semibold",
                                                attrs: {
                                                  size: "is-small",
                                                  "icon-left": t.isPaused
                                                    ? "play-circle"
                                                    : "pause-circle",
                                                  type: "is-warning",
                                                },
                                                on: {
                                                  click:
                                                    t.handleToggleWorkStatus,
                                                },
                                              },
                                              [
                                                t._v(
                                                  " " +
                                                    t._s(
                                                      t.isPaused
                                                        ? "Continue"
                                                        : "Pause"
                                                    ) +
                                                    " "
                                                ),
                                              ]
                                            )
                                          : t._e(),
                                      ],
                                      1
                                    ),
                              ])
                            : 3 === t.type
                            ? s("div", [
                                t.insLike.name
                                  ? s(
                                      "div",
                                      {
                                        staticClass:
                                          "source-text is-flex is-justify-content-center is-align-items-center pb-4",
                                      },
                                      [
                                        s(
                                          "span",
                                          { staticClass: "is-size-6" },
                                          [t._v("Like: ")]
                                        ),
                                        s(
                                          "a",
                                          {
                                            staticClass:
                                              "has-text-black is-size-6 px-2",
                                            attrs: {
                                              href:
                                                "https://www.instagram.com/p/" +
                                                t.insLike.name +
                                                "/",
                                              target: "_blank",
                                              title:
                                                "post link: https://www.instagram.com/p/" +
                                                t.insLike.name +
                                                "/",
                                            },
                                          },
                                          [
                                            t._v(
                                              "https://www.instagram.com/p/" +
                                                t._s(t.insLike.name)
                                            ),
                                          ]
                                        ),
                                        s(
                                          "div",
                                          [
                                            s(
                                              "b-tag",
                                              {
                                                staticClass: "ml-2",
                                                attrs: {
                                                  type: "is-danger is-light",
                                                  rounded: "",
                                                  size: "is-medium",
                                                },
                                              },
                                              [
                                                s(
                                                  "em",
                                                  {
                                                    staticClass:
                                                      "has-text-weight-semibold",
                                                  },
                                                  [t._v(t._s(t.insLike.count))]
                                                ),
                                                t._v(" likes "),
                                              ]
                                            ),
                                          ],
                                          1
                                        ),
                                      ]
                                    )
                                  : t._e(),
                                t.isComplete
                                  ? s(
                                      "div",
                                      {
                                        staticClass:
                                          "is-size-6 is-flex is-justify-content-center is-align-items-center py-3",
                                      },
                                      [
                                        s("b-icon", {
                                          attrs: {
                                            icon: "check-circle",
                                            type: "is-success",
                                            size: "is-medium",
                                          },
                                        }),
                                        t._v(" Completed. "),
                                        s(
                                          "span",
                                          {
                                            staticClass:
                                              "has-text-primary has-text-weight-semibold mx-1",
                                          },
                                          [t._v(t._s(t.processedList.length))]
                                        ),
                                        t._v(" users have been extracted"),
                                        t.lastScrapedCount > 0
                                          ? s("span", [
                                              t._v(
                                                " (The task has accumulated "
                                              ),
                                              s(
                                                "span",
                                                {
                                                  staticClass:
                                                    "has-text-primary has-text-weight-semibold mx-1",
                                                },
                                                [
                                                  t._v(
                                                    t._s(
                                                      t.lastScrapedCount +
                                                        t.processedList.length
                                                    )
                                                  ),
                                                ]
                                              ),
                                              t._v(" users extracted)"),
                                            ])
                                          : t._e(),
                                        t._v(". "),
                                      ],
                                      1
                                    )
                                  : s(
                                      "div",
                                      {
                                        staticClass:
                                          "is-size-6 is-flex is-justify-content-center is-align-items-center py-3",
                                      },
                                      [
                                        s("b-icon", {
                                          attrs: {
                                            icon: t.isPaused
                                              ? "pause-circle"
                                              : "sync",
                                            "custom-class": t.isPaused
                                              ? ""
                                              : "fa-spin1",
                                            type: "is-primary",
                                            size: "is-medium",
                                          },
                                        }),
                                        t.isPaused
                                          ? s("span", [
                                              t._v(" Suspended. "),
                                              s(
                                                "span",
                                                {
                                                  staticClass:
                                                    "has-text-primary has-text-weight-semibold mx-1",
                                                },
                                                [t._v(t._s(t.processedList.length))]
                                              ),
                                              t._v(
                                                " users have been extracted"
                                              ),
                                              t.lastScrapedCount > 0
                                                ? s("span", [
                                                    t._v(
                                                      " (The task has accumulated "
                                                    ),
                                                    s(
                                                      "span",
                                                      {
                                                        staticClass:
                                                          "has-text-primary has-text-weight-semibold mx-1",
                                                      },
                                                      [
                                                        t._v(
                                                          t._s(
                                                            t.lastScrapedCount +
                                                              t.processedList.length
                                                          )
                                                        ),
                                                      ]
                                                    ),
                                                    t._v(" users extracted)"),
                                                  ])
                                                : t._e(),
                                              t._v(". "),
                                            ])
                                          : s("span", [
                                              t._v(" Start extracting "),
                                              s(
                                                "span",
                                                {
                                                  staticClass:
                                                    "has-text-primary has-text-weight-semibold mx-1",
                                                },
                                                [
                                                  t._v(
                                                    t._s(t.processedList.length + 1)
                                                  ),
                                                ]
                                              ),
                                              t._v(" user"),
                                              t.lastScrapedCount > 0
                                                ? s("span", [
                                                    t._v(
                                                      " (The task has accumulated "
                                                    ),
                                                    s(
                                                      "span",
                                                      {
                                                        staticClass:
                                                          "has-text-primary has-text-weight-semibold mx-1",
                                                      },
                                                      [
                                                        t._v(
                                                          t._s(
                                                            t.lastScrapedCount +
                                                              t.processedList.length
                                                          )
                                                        ),
                                                      ]
                                                    ),
                                                    t._v(" users extracted)"),
                                                  ])
                                                : t._e(),
                                              t._v(". "),
                                            ]),
                                        !t.isLoading &&
                                        !t.isComplete &&
                                        ((t.lastHistoryItem && t.lastHistoryItem.id) ||
                                        (t.isPaused && t.resumeStartup))
                                          ? s(
                                              "b-button",
                                              {
                                                staticClass:
                                                  "btn-pause ml-2 has-text-weight-semibold",
                                                attrs: {
                                                  size: "is-small",
                                                  "icon-left": t.isPaused
                                                    ? "play-circle"
                                                    : "pause-circle",
                                                  type: "is-warning",
                                                },
                                                on: {
                                                  click:
                                                    t.handleToggleWorkStatus,
                                                },
                                              },
                                              [
                                                t._v(
                                                  " " +
                                                    t._s(
                                                      t.isPaused
                                                        ? "Continue"
                                                        : "Pause"
                                                    ) +
                                                    " "
                                                ),
                                              ]
                                            )
                                          : t._e(),
                                      ],
                                      1
                                    ),
                              ])
                            : 4 === t.type
                            ? s("div", [
                                t.insComment.name
                                  ? s(
                                      "div",
                                      {
                                        staticClass:
                                          "source-text is-flex is-justify-content-center is-align-items-center pb-4",
                                      },
                                      [
                                        s(
                                          "span",
                                          { staticClass: "is-size-6" },
                                          [t._v("Comment: ")]
                                        ),
                                        s(
                                          "a",
                                          {
                                            staticClass:
                                              "has-text-black is-size-6 px-2",
                                            attrs: {
                                              href:
                                                "https://www.instagram.com/p/" +
                                                t.insComment.name +
                                                "/",
                                              target: "_blank",
                                              title:
                                                "post link: https://www.instagram.com/p/" +
                                                t.insComment.name +
                                                "/",
                                            },
                                          },
                                          [
                                            t._v(
                                              "https://www.instagram.com/p/" +
                                                t._s(t.insComment.name)
                                            ),
                                          ]
                                        ),
                                        s(
                                          "div",
                                          [
                                            s(
                                              "b-tag",
                                              {
                                                staticClass: "ml-2",
                                                attrs: {
                                                  type: "is-danger is-light",
                                                  rounded: "",
                                                  size: "is-medium",
                                                },
                                              },
                                              [
                                                s(
                                                  "em",
                                                  {
                                                    staticClass:
                                                      "has-text-weight-semibold",
                                                  },
                                                  [
                                                    t._v(
                                                      t._s(t.insComment.count)
                                                    ),
                                                  ]
                                                ),
                                                t._v(" comments "),
                                              ]
                                            ),
                                          ],
                                          1
                                        ),
                                      ]
                                    )
                                  : t._e(),
                                t.isComplete
                                  ? s(
                                      "div",
                                      {
                                        staticClass:
                                          "is-size-6 is-flex is-justify-content-center is-align-items-center py-3",
                                      },
                                      [
                                        s("b-icon", {
                                          attrs: {
                                            icon: "check-circle",
                                            type: "is-success",
                                            size: "is-medium",
                                          },
                                        }),
                                        t._v(" Completed. "),
                                        s(
                                          "span",
                                          {
                                            staticClass:
                                              "has-text-primary has-text-weight-semibold mx-1",
                                          },
                                          [t._v(t._s(t.followList.length))]
                                        ),
                                        t._v(" perfis encontrados, " + t._s(t.processedList.length) + " consultados"),
                                        t.lastScrapedCount > 0
                                          ? s("span", [
                                              t._v(
                                                " (The task has accumulated "
                                              ),
                                              s(
                                                "span",
                                                {
                                                  staticClass:
                                                    "has-text-primary has-text-weight-semibold mx-1",
                                                },
                                                [
                                                  t._v(
                                                    t._s(
                                                      t.lastScrapedCount +
                                                        t.processedList.length
                                                    )
                                                  ),
                                                ]
                                              ),
                                              t._v(" users extracted)"),
                                            ])
                                          : t._e(),
                                        t._v(". "),
                                      ],
                                      1
                                    )
                                  : s(
                                      "div",
                                      {
                                        staticClass:
                                          "is-size-6 is-flex is-justify-content-center is-align-items-center py-3",
                                      },
                                      [
                                        s("b-icon", {
                                          attrs: {
                                            icon: t.isPaused
                                              ? "pause-circle"
                                              : "sync",
                                            "custom-class": t.isPaused
                                              ? ""
                                              : "fa-spin1",
                                            type: "is-primary",
                                            size: "is-medium",
                                          },
                                        }),
                                        t.isPaused
                                          ? s("span", [
                                              t._v(" Pausado. "),
                                              s(
                                                "span",
                                                {
                                                  staticClass:
                                                    "has-text-primary has-text-weight-semibold mx-1",
                                                },
                                                [t._v(t._s(t.followList.length))]
                                              ),
                                              t._v(
                                                " perfis encontrados, " + t._s(t.processedList.length) + " consultados"
                                              ),
                                              t.lastScrapedCount > 0
                                                ? s("span", [
                                                    t._v(
                                                      " (The task has accumulated "
                                                    ),
                                                    s(
                                                      "span",
                                                      {
                                                        staticClass:
                                                          "has-text-primary has-text-weight-semibold mx-1",
                                                      },
                                                      [
                                                        t._v(
                                                          t._s(
                                                            t.lastScrapedCount +
                                                              t.processedList.length
                                                          )
                                                        ),
                                                      ]
                                                    ),
                                                    t._v(" users extracted)"),
                                                  ])
                                                : t._e(),
                                              t._v(". "),
                                            ])
                                          : s("span", [
                                              t._v(t.pageInfo.has_next_page ? " Lendo comentários: " : " Consultando perfil "),
                                              s(
                                                "span",
                                                {
                                                  staticClass:
                                                    "has-text-primary has-text-weight-semibold mx-1",
                                                },
                                                [
                                                  t._v(
                                                    t._s(t.pageInfo.has_next_page ? t.followList.length : Math.min(t.loadUserIndex + 1, t.followList.length))
                                                  ),
                                                ]
                                              ),
                                              t._v(t.pageInfo.has_next_page ? " perfis encontrados (consultas de e-mail começam no fim da lista)" : " de " + t._s(t.followList.length)),
                                              t.lastScrapedCount > 0
                                                ? s("span", [
                                                    t._v(
                                                      " (The task has accumulated "
                                                    ),
                                                    s(
                                                      "span",
                                                      {
                                                        staticClass:
                                                          "has-text-primary has-text-weight-semibold mx-1",
                                                      },
                                                      [
                                                        t._v(
                                                          t._s(
                                                            t.lastScrapedCount +
                                                              t.processedList.length
                                                          )
                                                        ),
                                                      ]
                                                    ),
                                                    t._v(" users extracted)"),
                                                  ])
                                                : t._e(),
                                              t._v(". "),
                                            ]),
                                        !t.isLoading &&
                                        !t.isComplete &&
                                        ((t.lastHistoryItem && t.lastHistoryItem.id) ||
                                        (t.isPaused && t.resumeStartup))
                                          ? s(
                                              "b-button",
                                              {
                                                staticClass:
                                                  "btn-pause ml-2 has-text-weight-semibold",
                                                attrs: {
                                                  size: "is-small",
                                                  "icon-left": t.isPaused
                                                    ? "play-circle"
                                                    : "pause-circle",
                                                  type: "is-warning",
                                                },
                                                on: {
                                                  click:
                                                    t.handleToggleWorkStatus,
                                                },
                                              },
                                              [
                                                t._v(
                                                  " " +
                                                    t._s(
                                                      t.isPaused
                                                        ? "Continue"
                                                        : "Pause"
                                                    ) +
                                                    " "
                                                ),
                                              ]
                                            )
                                          : t._e(),
                                      ],
                                      1
                                    ),
                              ])
                            : 5 === t.type
                            ? s("div", [
                                t.insLocation.name
                                  ? s(
                                      "div",
                                      {
                                        staticClass:
                                          "source-text is-flex is-justify-content-center is-align-items-center pb-4",
                                      },
                                      [
                                        s(
                                          "span",
                                          { staticClass: "is-size-6" },
                                          [t._v("Location: ")]
                                        ),
                                        s(
                                          "a",
                                          {
                                            staticClass:
                                              "has-text-black is-size-6 px-2",
                                            attrs: {
                                              href:
                                                "https://www.instagram.com/explore/locations/" +
                                                t.ins +
                                                "/",
                                              target: "_blank",
                                              title:
                                                "locations link: https://www.instagram.com/explore/locations/" +
                                                t.ins +
                                                "/",
                                            },
                                          },
                                          [t._v(t._s(t.insLocation.name))]
                                        ),
                                        s(
                                          "div",
                                          [
                                            s(
                                              "b-tag",
                                              {
                                                staticClass: "ml-2",
                                                attrs: {
                                                  type: "is-danger is-light",
                                                  rounded: "",
                                                  size: "is-medium",
                                                },
                                              },
                                              [
                                                s(
                                                  "em",
                                                  {
                                                    staticClass:
                                                      "has-text-weight-semibold",
                                                  },
                                                  [
                                                    t._v(
                                                      t._s(t.insLocation.count)
                                                    ),
                                                  ]
                                                ),
                                                t._v(" posts "),
                                              ]
                                            ),
                                          ],
                                          1
                                        ),
                                      ]
                                    )
                                  : t._e(),
                                t.isComplete
                                  ? s(
                                      "div",
                                      {
                                        staticClass:
                                          "is-size-6 is-flex is-justify-content-center is-align-items-center py-3",
                                      },
                                      [
                                        s("b-icon", {
                                          attrs: {
                                            icon: "check-circle",
                                            type: "is-success",
                                            size: "is-medium",
                                          },
                                        }),
                                        t._v(" Completed. "),
                                        s(
                                          "span",
                                          {
                                            staticClass:
                                              "has-text-primary has-text-weight-semibold mx-1",
                                          },
                                          [t._v(t._s(t.processedList.length))]
                                        ),
                                        t._v(" users have been extracted"),
                                        t.lastScrapedCount > 0
                                          ? s("span", [
                                              t._v(
                                                " (The task has accumulated "
                                              ),
                                              s(
                                                "span",
                                                {
                                                  staticClass:
                                                    "has-text-primary has-text-weight-semibold mx-1",
                                                },
                                                [
                                                  t._v(
                                                    t._s(
                                                      t.lastScrapedCount +
                                                        t.processedList.length
                                                    )
                                                  ),
                                                ]
                                              ),
                                              t._v(" users extracted)"),
                                            ])
                                          : t._e(),
                                        t._v(". "),
                                      ],
                                      1
                                    )
                                  : s(
                                      "div",
                                      {
                                        staticClass:
                                          "is-size-6 is-flex is-justify-content-center is-align-items-center py-3",
                                      },
                                      [
                                        s("b-icon", {
                                          attrs: {
                                            icon: t.isPaused
                                              ? "pause-circle"
                                              : "sync",
                                            "custom-class": t.isPaused
                                              ? ""
                                              : "fa-spin1",
                                            type: "is-primary",
                                            size: "is-medium",
                                          },
                                        }),
                                        t.isPaused
                                          ? s("span", [
                                              t._v(" Suspended. "),
                                              s(
                                                "span",
                                                {
                                                  staticClass:
                                                    "has-text-primary has-text-weight-semibold mx-1",
                                                },
                                                [t._v(t._s(t.processedList.length))]
                                              ),
                                              t._v(
                                                " users have been extracted"
                                              ),
                                              t.lastScrapedCount > 0
                                                ? s("span", [
                                                    t._v(
                                                      " (The task has accumulated "
                                                    ),
                                                    s(
                                                      "span",
                                                      {
                                                        staticClass:
                                                          "has-text-primary has-text-weight-semibold mx-1",
                                                      },
                                                      [
                                                        t._v(
                                                          t._s(
                                                            t.lastScrapedCount +
                                                              t.processedList.length
                                                          )
                                                        ),
                                                      ]
                                                    ),
                                                    t._v(" users extracted)"),
                                                  ])
                                                : t._e(),
                                              t._v(". "),
                                            ])
                                          : s("span", [
                                              t._v(" Start extracting "),
                                              s(
                                                "span",
                                                {
                                                  staticClass:
                                                    "has-text-primary has-text-weight-semibold mx-1",
                                                },
                                                [
                                                  t._v(
                                                    t._s(t.processedList.length + 1)
                                                  ),
                                                ]
                                              ),
                                              t._v(" user"),
                                              t.lastScrapedCount > 0
                                                ? s("span", [
                                                    t._v(
                                                      " (The task has accumulated "
                                                    ),
                                                    s(
                                                      "span",
                                                      {
                                                        staticClass:
                                                          "has-text-primary has-text-weight-semibold mx-1",
                                                      },
                                                      [
                                                        t._v(
                                                          t._s(
                                                            t.lastScrapedCount +
                                                              t.processedList.length
                                                          )
                                                        ),
                                                      ]
                                                    ),
                                                    t._v(" users extracted)"),
                                                  ])
                                                : t._e(),
                                              t._v(". "),
                                            ]),
                                        !t.isLoading &&
                                        !t.isComplete &&
                                        ((t.lastHistoryItem && t.lastHistoryItem.id) ||
                                        (t.isPaused && t.resumeStartup))
                                          ? s(
                                              "b-button",
                                              {
                                                staticClass:
                                                  "btn-pause ml-2 has-text-weight-semibold",
                                                attrs: {
                                                  size: "is-small",
                                                  "icon-left": t.isPaused
                                                    ? "play-circle"
                                                    : "pause-circle",
                                                  type: "is-warning",
                                                },
                                                on: {
                                                  click:
                                                    t.handleToggleWorkStatus,
                                                },
                                              },
                                              [
                                                t._v(
                                                  " " +
                                                    t._s(
                                                      t.isPaused
                                                        ? "Continue"
                                                        : "Pause"
                                                    ) +
                                                    " "
                                                ),
                                              ]
                                            )
                                          : t._e(),
                                      ],
                                      1
                                    ),
                              ])
                            : 6 === t.type
                            ? s("div", [
                                t.followList.length > 0
                                  ? s(
                                      "div",
                                      {
                                        staticClass:
                                          "source-text is-flex is-justify-content-center is-align-items-center pb-4",
                                      },
                                      [
                                        s(
                                          "span",
                                          { staticClass: "is-size-6" },
                                          [t._v("User List: ")]
                                        ),
                                        s(
                                          "span",
                                          {
                                            staticClass:
                                              "has-text-black is-size-6 px-2",
                                          },
                                          [
                                            t._v(
                                              t._s(
                                                t._f("customUsersTitle")(
                                                  t.followList
                                                )
                                              )
                                            ),
                                          ]
                                        ),
                                        s(
                                          "div",
                                          [
                                            s(
                                              "b-tag",
                                              {
                                                staticClass: "ml-2",
                                                attrs: {
                                                  type: "is-danger is-light",
                                                  rounded: "",
                                                  size: "is-medium",
                                                },
                                              },
                                              [
                                                s(
                                                  "em",
                                                  {
                                                    staticClass:
                                                      "has-text-weight-semibold",
                                                  },
                                                  [
                                                    t._v(
                                                      t._s(
                                                        t.followList.length +
                                                          t.lastScrapedCount
                                                      )
                                                    ),
                                                  ]
                                                ),
                                                t._v(" users "),
                                              ]
                                            ),
                                          ],
                                          1
                                        ),
                                      ]
                                    )
                                  : t._e(),
                                t.isComplete
                                  ? s(
                                      "div",
                                      {
                                        staticClass:
                                          "is-size-6 is-flex is-justify-content-center is-align-items-center py-3",
                                      },
                                      [
                                        s("b-icon", {
                                          attrs: {
                                            icon: "check-circle",
                                            type: "is-success",
                                            size: "is-medium",
                                          },
                                        }),
                                        t._v(" Completed. "),
                                        s(
                                          "span",
                                          {
                                            staticClass:
                                              "has-text-primary has-text-weight-semibold mx-1",
                                          },
                                          [t._v(t._s(t.processedList.length))]
                                        ),
                                        t._v(" users have been extracted"),
                                        t.lastScrapedCount > 0
                                          ? s("span", [
                                              t._v(
                                                " (The task has accumulated "
                                              ),
                                              s(
                                                "span",
                                                {
                                                  staticClass:
                                                    "has-text-primary has-text-weight-semibold mx-1",
                                                },
                                                [
                                                  t._v(
                                                    t._s(
                                                      t.lastScrapedCount +
                                                        t.processedList.length
                                                    )
                                                  ),
                                                ]
                                              ),
                                              t._v(" users extracted)"),
                                            ])
                                          : t._e(),
                                        t._v(". "),
                                      ],
                                      1
                                    )
                                  : s(
                                      "div",
                                      {
                                        staticClass:
                                          "is-size-6 is-flex is-justify-content-center is-align-items-center py-3",
                                      },
                                      [
                                        s("b-icon", {
                                          attrs: {
                                            icon: t.isPaused
                                              ? "pause-circle"
                                              : "sync",
                                            "custom-class": t.isPaused
                                              ? ""
                                              : "fa-spin1",
                                            type: "is-primary",
                                            size: "is-medium",
                                          },
                                        }),
                                        t.isPaused
                                          ? s("span", [
                                              t._v(" Suspended. "),
                                              s(
                                                "span",
                                                {
                                                  staticClass:
                                                    "has-text-primary has-text-weight-semibold mx-1",
                                                },
                                                [t._v(t._s(t.processedList.length))]
                                              ),
                                              t._v(
                                                " users have been extracted"
                                              ),
                                              t.lastScrapedCount > 0
                                                ? s("span", [
                                                    t._v(
                                                      " (The task has accumulated "
                                                    ),
                                                    s(
                                                      "span",
                                                      {
                                                        staticClass:
                                                          "has-text-primary has-text-weight-semibold mx-1",
                                                      },
                                                      [
                                                        t._v(
                                                          t._s(
                                                            t.lastScrapedCount +
                                                              t.processedList.length
                                                          )
                                                        ),
                                                      ]
                                                    ),
                                                    t._v(" users extracted)"),
                                                  ])
                                                : t._e(),
                                              t._v(". "),
                                            ])
                                          : s("span", [
                                              t._v(" Start extracting "),
                                              s(
                                                "span",
                                                {
                                                  staticClass:
                                                    "has-text-primary has-text-weight-semibold mx-1",
                                                },
                                                [
                                                  t._v(
                                                    t._s(t.processedList.length + 1)
                                                  ),
                                                ]
                                              ),
                                              t._v(" user"),
                                              t.lastScrapedCount > 0
                                                ? s("span", [
                                                    t._v(
                                                      " (The task has accumulated "
                                                    ),
                                                    s(
                                                      "span",
                                                      {
                                                        staticClass:
                                                          "has-text-primary has-text-weight-semibold mx-1",
                                                      },
                                                      [
                                                        t._v(
                                                          t._s(
                                                            t.lastScrapedCount +
                                                              t.processedList.length
                                                          )
                                                        ),
                                                      ]
                                                    ),
                                                    t._v(" users extracted)"),
                                                  ])
                                                : t._e(),
                                              t._v(". "),
                                            ]),
                                        !t.isLoading &&
                                        !t.isComplete &&
                                        ((t.lastHistoryItem && t.lastHistoryItem.id) ||
                                        (t.isPaused && t.resumeStartup))
                                          ? s(
                                              "b-button",
                                              {
                                                staticClass:
                                                  "btn-pause ml-2 has-text-weight-semibold",
                                                attrs: {
                                                  size: "is-small",
                                                  "icon-left": t.isPaused
                                                    ? "play-circle"
                                                    : "pause-circle",
                                                  type: "is-warning",
                                                },
                                                on: {
                                                  click:
                                                    t.handleToggleWorkStatus,
                                                },
                                              },
                                              [
                                                t._v(
                                                  " " +
                                                    t._s(
                                                      t.isPaused
                                                        ? "Continue"
                                                        : "Pause"
                                                    ) +
                                                    " "
                                                ),
                                              ]
                                            )
                                          : t._e(),
                                      ],
                                      1
                                    ),
                              ])
                            : t._e(),
                          s(
                            "div",
                            { staticClass: "button-box has-text-centered" },
                            [
                              s(
                                "b-dropdown",
                                {
                                  staticClass: "mb-2",
                                  attrs: {
                                    triggers: ["hover"],
                                    "aria-role": "list",
                                  },
                                  scopedSlots: t._u(
                                    [
                                      {
                                        key: "trigger",
                                        fn: function () {
                                          return [
                                            s("b-button", {
                                              staticClass:
                                                "is-uppercase has-text-weight-semibold",
                                              attrs: {
                                                disabled:
                                                  t.isLoading ||
                                                  0 === t.exportAllList.length,
                                                label:
                                                  "export all (" +
                                                  t.exportAllList.length +
                                                  ")",
                                                type: "is-primary",
                                                "icon-left": "download",
                                                "icon-right": "caret-down",
                                              },
                                            }),
                                          ];
                                        },
                                        proxy: !0,
                                      },
                                    ],
                                    null,
                                    !1,
                                    1964382954
                                  ),
                                },
                                [
                                  t.exportAllList.length > 0
                                    ? s(
                                        "b-dropdown-item",
                                        {
                                          attrs: { "aria-role": "listitem" },
                                          on: {
                                            click: function (e) {
                                              return t.handleDownload(
                                                "all",
                                                t.exportAllList,
                                                "xlsx"
                                              );
                                            },
                                          },
                                        },
                                        [
                                          s(
                                            "div",
                                            { staticClass: "export-menu-item" },
                                            [
                                              s(
                                                "span",
                                                { staticClass: "i-format" },
                                                [
                                                  s(
                                                    "svg",
                                                    {
                                                      attrs: {
                                                        xmlns:
                                                          "http://www.w3.org/2000/svg",
                                                        "aria-hidden": "true",
                                                        role: "img",
                                                        width: "1em",
                                                        height: "1em",
                                                        preserveAspectRatio:
                                                          "xMidYMid meet",
                                                        viewBox: "0 0 512 512",
                                                      },
                                                    },
                                                    [
                                                      s("path", {
                                                        attrs: {
                                                          fill: "currentColor",
                                                          d: "M453.547 273.449H372.12v-40.714h81.427v40.714zm0 23.264H372.12v40.714h81.427v-40.714zm0-191.934H372.12v40.713h81.427V104.78zm0 63.978H372.12v40.713h81.427v-40.713zm0 191.934H372.12v40.714h81.427V360.69zm56.242 80.264c-2.326 12.098-16.867 12.388-26.58 12.796H302.326v52.345h-36.119L0 459.566V52.492L267.778 5.904h34.548v46.355h174.66c9.83.407 20.648-.291 29.197 5.583c5.991 8.608 5.41 19.543 5.817 29.43l-.233 302.791c-.29 16.925 1.57 34.2-1.978 50.892zm-296.51-91.256c-16.052-32.57-32.395-64.909-48.39-97.48c15.82-31.698 31.408-63.512 46.937-95.327c-13.203.64-26.406 1.454-39.55 2.385c-9.83 23.904-21.288 47.169-28.965 71.888c-7.154-23.323-16.634-45.774-25.3-68.515c-12.796.698-25.592 1.454-38.387 2.21c13.493 29.78 27.86 59.15 40.946 89.104c-15.413 29.081-29.837 58.57-44.785 87.825c12.737.523 25.475 1.047 38.212 1.221c9.074-23.148 20.357-45.424 28.267-69.038c7.096 25.359 19.135 48.798 29.023 73.051c14.017.99 27.976 1.862 41.993 2.676zM484.26 79.882H302.326v24.897h46.53v40.713h-46.53v23.265h46.53v40.713h-46.53v23.265h46.53v40.714h-46.53v23.264h46.53v40.714h-46.53v23.264h46.53v40.714h-46.53v26.897H484.26V79.882z",
                                                        },
                                                      }),
                                                    ]
                                                  ),
                                                ]
                                              ),
                                              s(
                                                "span",
                                                { staticClass: "export-desc" },
                                                [t._v("export all to xlsx")]
                                              ),
                                            ]
                                          ),
                                        ]
                                      )
                                    : t._e(),
                                  t.exportAllList.length > 0
                                    ? s(
                                        "b-dropdown-item",
                                        {
                                          attrs: { "aria-role": "listitem" },
                                          on: {
                                            click: function (e) {
                                              return t.handleDownload(
                                                "all",
                                                t.exportAllList,
                                                "csv"
                                              );
                                            },
                                          },
                                        },
                                        [
                                          s(
                                            "div",
                                            { staticClass: "export-menu-item" },
                                            [
                                              s(
                                                "span",
                                                {
                                                  staticClass: "i-format",
                                                  staticStyle: {
                                                    "font-size": "34px",
                                                  },
                                                },
                                                [
                                                  s(
                                                    "svg",
                                                    {
                                                      attrs: {
                                                        xmlns:
                                                          "http://www.w3.org/2000/svg",
                                                        "aria-hidden": "true",
                                                        role: "img",
                                                        width: "1em",
                                                        height: "1em",
                                                        preserveAspectRatio:
                                                          "xMidYMid meet",
                                                        viewBox: "0 0 40 40",
                                                      },
                                                    },
                                                    [
                                                      s("path", {
                                                        attrs: {
                                                          fill: "currentColor",
                                                          d: "M30.918 15.983h-.678v-3.271a.448.448 0 0 0-.006-.062a.541.541 0 0 0-.132-.358L24.66 6.075l-.004-.004a.566.566 0 0 0-.11-.092l-.036-.022a.548.548 0 0 0-.109-.046l-.03-.01a.539.539 0 0 0-.127-.016H10.867c-.611 0-1.107.497-1.107 1.107v8.99h-.678c-.874 0-1.582.708-1.582 1.582v8.228c0 .873.709 1.582 1.582 1.582h.678v5.632c0 .61.496 1.107 1.107 1.107h18.266c.61 0 1.107-.497 1.107-1.107v-5.632h.678c.873 0 1.582-.708 1.582-1.582v-8.228c0-.873-.708-1.581-1.582-1.581zM10.867 6.992H23.69v5.664c0 .306.248.553.554.553h4.89v2.773H10.867v-8.99zm8.282 15.168c-1.344-.48-2.231-1.224-2.231-2.399c0-1.379 1.164-2.422 3.059-2.422c.924 0 1.583.18 2.063.407l-.408 1.463a3.794 3.794 0 0 0-1.679-.383c-.792 0-1.176.371-1.176.779c0 .516.443.743 1.499 1.139c1.428.528 2.087 1.271 2.087 2.411c0 1.356-1.031 2.507-3.25 2.507c-.924 0-1.835-.252-2.291-.504l.372-1.499a4.613 4.613 0 0 0 2.026.504c.84 0 1.284-.349 1.284-.876c0-.504-.383-.791-1.355-1.127zm-9.526-.552c0-2.747 1.967-4.27 4.413-4.27c.948 0 1.667.191 1.991.348l-.384 1.451a3.85 3.85 0 0 0-1.535-.3c-1.439 0-2.566.875-2.566 2.674c0 1.607.959 2.627 2.578 2.627c.564 0 1.164-.107 1.535-.264l.265 1.439c-.324.155-1.092.348-2.063.348c-2.795.001-4.234-1.75-4.234-4.053zm19.51 11.1H10.867v-5.333h18.266v5.333zm-1.478-7.166H25.52l-2.59-8.084h2.003l.983 3.419c.275.971.527 1.883.719 2.89h.036a35.87 35.87 0 0 1 .731-2.854l1.032-3.454h1.942l-2.721 8.083z",
                                                        },
                                                      }),
                                                    ]
                                                  ),
                                                ]
                                              ),
                                              s(
                                                "span",
                                                { staticClass: "export-desc" },
                                                [t._v("export all to csv")]
                                              ),
                                            ]
                                          ),
                                        ]
                                      )
                                    : t._e(),
                                ],
                                1
                              ),
                              s(
                                "b-dropdown",
                                {
                                  staticClass: "mb-2",
                                  attrs: {
                                    triggers: ["hover"],
                                    "aria-role": "list",
                                  },
                                  scopedSlots: t._u(
                                    [
                                      {
                                        key: "trigger",
                                        fn: function () {
                                          return [
                                            s("b-button", {
                                              staticClass:
                                                "is-uppercase has-text-weight-semibold",
                                              attrs: {
                                                disabled:
                                                  t.isLoading ||
                                                  0 === t.exportEmailList.length,
                                                label:
                                                  "export email (" +
                                                  t.exportEmailList.length +
                                                  ")",
                                                type: "is-primary",
                                                "icon-left": "download",
                                                "icon-right": "caret-down",
                                              },
                                            }),
                                          ];
                                        },
                                        proxy: !0,
                                      },
                                    ],
                                    null,
                                    !1,
                                    3906035879
                                  ),
                                },
                                [
                                  t.exportEmailList.length > 0
                                    ? s(
                                        "b-dropdown-item",
                                        {
                                          attrs: { "aria-role": "listitem" },
                                          on: {
                                            click: function (e) {
                                              return t.handleDownload(
                                                "email",
                                                t.exportEmailList,
                                                "xlsx"
                                              );
                                            },
                                          },
                                        },
                                        [
                                          s(
                                            "div",
                                            { staticClass: "export-menu-item" },
                                            [
                                              s(
                                                "span",
                                                { staticClass: "i-format" },
                                                [
                                                  s(
                                                    "svg",
                                                    {
                                                      attrs: {
                                                        xmlns:
                                                          "http://www.w3.org/2000/svg",
                                                        "aria-hidden": "true",
                                                        role: "img",
                                                        width: "1em",
                                                        height: "1em",
                                                        preserveAspectRatio:
                                                          "xMidYMid meet",
                                                        viewBox: "0 0 512 512",
                                                      },
                                                    },
                                                    [
                                                      s("path", {
                                                        attrs: {
                                                          fill: "currentColor",
                                                          d: "M453.547 273.449H372.12v-40.714h81.427v40.714zm0 23.264H372.12v40.714h81.427v-40.714zm0-191.934H372.12v40.713h81.427V104.78zm0 63.978H372.12v40.713h81.427v-40.713zm0 191.934H372.12v40.714h81.427V360.69zm56.242 80.264c-2.326 12.098-16.867 12.388-26.58 12.796H302.326v52.345h-36.119L0 459.566V52.492L267.778 5.904h34.548v46.355h174.66c9.83.407 20.648-.291 29.197 5.583c5.991 8.608 5.41 19.543 5.817 29.43l-.233 302.791c-.29 16.925 1.57 34.2-1.978 50.892zm-296.51-91.256c-16.052-32.57-32.395-64.909-48.39-97.48c15.82-31.698 31.408-63.512 46.937-95.327c-13.203.64-26.406 1.454-39.55 2.385c-9.83 23.904-21.288 47.169-28.965 71.888c-7.154-23.323-16.634-45.774-25.3-68.515c-12.796.698-25.592 1.454-38.387 2.21c13.493 29.78 27.86 59.15 40.946 89.104c-15.413 29.081-29.837 58.57-44.785 87.825c12.737.523 25.475 1.047 38.212 1.221c9.074-23.148 20.357-45.424 28.267-69.038c7.096 25.359 19.135 48.798 29.023 73.051c14.017.99 27.976 1.862 41.993 2.676zM484.26 79.882H302.326v24.897h46.53v40.713h-46.53v23.265h46.53v40.713h-46.53v23.265h46.53v40.714h-46.53v23.264h46.53v40.714h-46.53v23.264h46.53v40.714h-46.53v26.897H484.26V79.882z",
                                                        },
                                                      }),
                                                    ]
                                                  ),
                                                ]
                                              ),
                                              s(
                                                "span",
                                                { staticClass: "export-desc" },
                                                [t._v("export email to xlsx")]
                                              ),
                                            ]
                                          ),
                                        ]
                                      )
                                    : t._e(),
                                  t.exportEmailList.length > 0
                                    ? s(
                                        "b-dropdown-item",
                                        {
                                          attrs: { "aria-role": "listitem" },
                                          on: {
                                            click: function (e) {
                                              return t.handleDownload(
                                                "email",
                                                t.exportEmailList,
                                                "csv"
                                              );
                                            },
                                          },
                                        },
                                        [
                                          s(
                                            "div",
                                            { staticClass: "export-menu-item" },
                                            [
                                              s(
                                                "span",
                                                {
                                                  staticClass: "i-format",
                                                  staticStyle: {
                                                    "font-size": "34px",
                                                  },
                                                },
                                                [
                                                  s(
                                                    "svg",
                                                    {
                                                      attrs: {
                                                        xmlns:
                                                          "http://www.w3.org/2000/svg",
                                                        "aria-hidden": "true",
                                                        role: "img",
                                                        width: "1em",
                                                        height: "1em",
                                                        preserveAspectRatio:
                                                          "xMidYMid meet",
                                                        viewBox: "0 0 40 40",
                                                      },
                                                    },
                                                    [
                                                      s("path", {
                                                        attrs: {
                                                          fill: "currentColor",
                                                          d: "M30.918 15.983h-.678v-3.271a.448.448 0 0 0-.006-.062a.541.541 0 0 0-.132-.358L24.66 6.075l-.004-.004a.566.566 0 0 0-.11-.092l-.036-.022a.548.548 0 0 0-.109-.046l-.03-.01a.539.539 0 0 0-.127-.016H10.867c-.611 0-1.107.497-1.107 1.107v8.99h-.678c-.874 0-1.582.708-1.582 1.582v8.228c0 .873.709 1.582 1.582 1.582h.678v5.632c0 .61.496 1.107 1.107 1.107h18.266c.61 0 1.107-.497 1.107-1.107v-5.632h.678c.873 0 1.582-.708 1.582-1.582v-8.228c0-.873-.708-1.581-1.582-1.581zM10.867 6.992H23.69v5.664c0 .306.248.553.554.553h4.89v2.773H10.867v-8.99zm8.282 15.168c-1.344-.48-2.231-1.224-2.231-2.399c0-1.379 1.164-2.422 3.059-2.422c.924 0 1.583.18 2.063.407l-.408 1.463a3.794 3.794 0 0 0-1.679-.383c-.792 0-1.176.371-1.176.779c0 .516.443.743 1.499 1.139c1.428.528 2.087 1.271 2.087 2.411c0 1.356-1.031 2.507-3.25 2.507c-.924 0-1.835-.252-2.291-.504l.372-1.499a4.613 4.613 0 0 0 2.026.504c.84 0 1.284-.349 1.284-.876c0-.504-.383-.791-1.355-1.127zm-9.526-.552c0-2.747 1.967-4.27 4.413-4.27c.948 0 1.667.191 1.991.348l-.384 1.451a3.85 3.85 0 0 0-1.535-.3c-1.439 0-2.566.875-2.566 2.674c0 1.607.959 2.627 2.578 2.627c.564 0 1.164-.107 1.535-.264l.265 1.439c-.324.155-1.092.348-2.063.348c-2.795.001-4.234-1.75-4.234-4.053zm19.51 11.1H10.867v-5.333h18.266v5.333zm-1.478-7.166H25.52l-2.59-8.084h2.003l.983 3.419c.275.971.527 1.883.719 2.89h.036a35.87 35.87 0 0 1 .731-2.854l1.032-3.454h1.942l-2.721 8.083z",
                                                        },
                                                      }),
                                                    ]
                                                  ),
                                                ]
                                              ),
                                              s(
                                                "span",
                                                { staticClass: "export-desc" },
                                                [t._v("export email to csv")]
                                              ),
                                            ]
                                          ),
                                        ]
                                      )
                                    : t._e(),
                                ],
                                1
                              ),
                              s(
                                "b-dropdown",
                                {
                                  staticClass: "mb-2",
                                  attrs: {
                                    triggers: ["hover"],
                                    "aria-role": "list",
                                  },
                                  scopedSlots: t._u(
                                    [
                                      {
                                        key: "trigger",
                                        fn: function () {
                                          return [
                                            s("b-button", {
                                              staticClass:
                                                "is-uppercase has-text-weight-semibold",
                                              attrs: {
                                                disabled:
                                                  t.isLoading ||
                                                  0 === t.exportPhoneList.length,
                                                label:
                                                  "export phone (" +
                                                  t.exportPhoneList.length +
                                                  ")",
                                                type: "is-primary",
                                                "icon-left": "download",
                                                "icon-right": "caret-down",
                                              },
                                            }),
                                          ];
                                        },
                                        proxy: !0,
                                      },
                                    ],
                                    null,
                                    !1,
                                    3668991159
                                  ),
                                },
                                [
                                  t.exportPhoneList.length > 0
                                    ? s(
                                        "b-dropdown-item",
                                        {
                                          attrs: { "aria-role": "listitem" },
                                          on: {
                                            click: function (e) {
                                              return t.handleDownload(
                                                "phone",
                                                t.exportPhoneList,
                                                "xlsx"
                                              );
                                            },
                                          },
                                        },
                                        [
                                          s(
                                            "div",
                                            { staticClass: "export-menu-item" },
                                            [
                                              s(
                                                "span",
                                                { staticClass: "i-format" },
                                                [
                                                  s(
                                                    "svg",
                                                    {
                                                      attrs: {
                                                        xmlns:
                                                          "http://www.w3.org/2000/svg",
                                                        "aria-hidden": "true",
                                                        role: "img",
                                                        width: "1em",
                                                        height: "1em",
                                                        preserveAspectRatio:
                                                          "xMidYMid meet",
                                                        viewBox: "0 0 512 512",
                                                      },
                                                    },
                                                    [
                                                      s("path", {
                                                        attrs: {
                                                          fill: "currentColor",
                                                          d: "M453.547 273.449H372.12v-40.714h81.427v40.714zm0 23.264H372.12v40.714h81.427v-40.714zm0-191.934H372.12v40.713h81.427V104.78zm0 63.978H372.12v40.713h81.427v-40.713zm0 191.934H372.12v40.714h81.427V360.69zm56.242 80.264c-2.326 12.098-16.867 12.388-26.58 12.796H302.326v52.345h-36.119L0 459.566V52.492L267.778 5.904h34.548v46.355h174.66c9.83.407 20.648-.291 29.197 5.583c5.991 8.608 5.41 19.543 5.817 29.43l-.233 302.791c-.29 16.925 1.57 34.2-1.978 50.892zm-296.51-91.256c-16.052-32.57-32.395-64.909-48.39-97.48c15.82-31.698 31.408-63.512 46.937-95.327c-13.203.64-26.406 1.454-39.55 2.385c-9.83 23.904-21.288 47.169-28.965 71.888c-7.154-23.323-16.634-45.774-25.3-68.515c-12.796.698-25.592 1.454-38.387 2.21c13.493 29.78 27.86 59.15 40.946 89.104c-15.413 29.081-29.837 58.57-44.785 87.825c12.737.523 25.475 1.047 38.212 1.221c9.074-23.148 20.357-45.424 28.267-69.038c7.096 25.359 19.135 48.798 29.023 73.051c14.017.99 27.976 1.862 41.993 2.676zM484.26 79.882H302.326v24.897h46.53v40.713h-46.53v23.265h46.53v40.713h-46.53v23.265h46.53v40.714h-46.53v23.264h46.53v40.714h-46.53v23.264h46.53v40.714h-46.53v26.897H484.26V79.882z",
                                                        },
                                                      }),
                                                    ]
                                                  ),
                                                ]
                                              ),
                                              s(
                                                "span",
                                                { staticClass: "export-desc" },
                                                [t._v("export phone to xlsx")]
                                              ),
                                            ]
                                          ),
                                        ]
                                      )
                                    : t._e(),
                                  t.exportPhoneList.length > 0
                                    ? s(
                                        "b-dropdown-item",
                                        {
                                          attrs: { "aria-role": "listitem" },
                                          on: {
                                            click: function (e) {
                                              return t.handleDownload(
                                                "phone",
                                                t.exportPhoneList,
                                                "csv"
                                              );
                                            },
                                          },
                                        },
                                        [
                                          s(
                                            "div",
                                            { staticClass: "export-menu-item" },
                                            [
                                              s(
                                                "span",
                                                {
                                                  staticClass: "i-format",
                                                  staticStyle: {
                                                    "font-size": "34px",
                                                  },
                                                },
                                                [
                                                  s(
                                                    "svg",
                                                    {
                                                      attrs: {
                                                        xmlns:
                                                          "http://www.w3.org/2000/svg",
                                                        "aria-hidden": "true",
                                                        role: "img",
                                                        width: "1em",
                                                        height: "1em",
                                                        preserveAspectRatio:
                                                          "xMidYMid meet",
                                                        viewBox: "0 0 40 40",
                                                      },
                                                    },
                                                    [
                                                      s("path", {
                                                        attrs: {
                                                          fill: "currentColor",
                                                          d: "M30.918 15.983h-.678v-3.271a.448.448 0 0 0-.006-.062a.541.541 0 0 0-.132-.358L24.66 6.075l-.004-.004a.566.566 0 0 0-.11-.092l-.036-.022a.548.548 0 0 0-.109-.046l-.03-.01a.539.539 0 0 0-.127-.016H10.867c-.611 0-1.107.497-1.107 1.107v8.99h-.678c-.874 0-1.582.708-1.582 1.582v8.228c0 .873.709 1.582 1.582 1.582h.678v5.632c0 .61.496 1.107 1.107 1.107h18.266c.61 0 1.107-.497 1.107-1.107v-5.632h.678c.873 0 1.582-.708 1.582-1.582v-8.228c0-.873-.708-1.581-1.582-1.581zM10.867 6.992H23.69v5.664c0 .306.248.553.554.553h4.89v2.773H10.867v-8.99zm8.282 15.168c-1.344-.48-2.231-1.224-2.231-2.399c0-1.379 1.164-2.422 3.059-2.422c.924 0 1.583.18 2.063.407l-.408 1.463a3.794 3.794 0 0 0-1.679-.383c-.792 0-1.176.371-1.176.779c0 .516.443.743 1.499 1.139c1.428.528 2.087 1.271 2.087 2.411c0 1.356-1.031 2.507-3.25 2.507c-.924 0-1.835-.252-2.291-.504l.372-1.499a4.613 4.613 0 0 0 2.026.504c.84 0 1.284-.349 1.284-.876c0-.504-.383-.791-1.355-1.127zm-9.526-.552c0-2.747 1.967-4.27 4.413-4.27c.948 0 1.667.191 1.991.348l-.384 1.451a3.85 3.85 0 0 0-1.535-.3c-1.439 0-2.566.875-2.566 2.674c0 1.607.959 2.627 2.578 2.627c.564 0 1.164-.107 1.535-.264l.265 1.439c-.324.155-1.092.348-2.063.348c-2.795.001-4.234-1.75-4.234-4.053zm19.51 11.1H10.867v-5.333h18.266v5.333zm-1.478-7.166H25.52l-2.59-8.084h2.003l.983 3.419c.275.971.527 1.883.719 2.89h.036a35.87 35.87 0 0 1 .731-2.854l1.032-3.454h1.942l-2.721 8.083z",
                                                        },
                                                      }),
                                                    ]
                                                  ),
                                                ]
                                              ),
                                              s(
                                                "span",
                                                { staticClass: "export-desc" },
                                                [t._v("export phone to csv")]
                                              ),
                                            ]
                                          ),
                                        ]
                                      )
                                    : t._e(),
                                ],
                                1
                              ),
                            ],
                            1
                          ),
                        ]
                      )
                    : t._e(),
                  s(
                    "div",
                    {
                      staticClass: "m-4 pb-5",
                      staticStyle: {
                        position: "relative",
                        "min-height": "300px",
                      },
                    },
                    [
                      s(
                        "b-table",
                        {
                          attrs: {
                            data: t.userList,
                            paginated: !0,
                            "per-page": 20,
                            "current-page": t.currentPage,
                            "pagination-simple": !1,
                            "pagination-position": "bottom",
                            "pagination-rounded": !1,
                            "aria-next-label": "Next page",
                            "aria-previous-label": "Previous page",
                            "aria-page-label": "Page",
                            "aria-current-label": "Current page",
                            "default-sort-direction": "asc",
                            "sort-icon": "arrow-up",
                            "sort-icon-size": "is-small",
                            "default-sort": "id",
                            "custom-row-key": "id",
                          },
                          on: {
                            "update:currentPage": function (e) {
                              t.currentPage = e;
                            },
                            "update:current-page": function (e) {
                              t.currentPage = e;
                            },
                          },
                        },
                        [
                          s("b-table-column", {
                            attrs: {
                              field: "id",
                              label: "ID",
                              sortable: "",
                              numeric: "",
                            },
                            scopedSlots: t._u([
                              {
                                key: "default",
                                fn: function (e) {
                                  return [t._v(" " + t._s(e.row.id) + " ")];
                                },
                              },
                            ]),
                          }),
                          s("b-table-column", {
                            attrs: { field: "avatar", label: "Avatar" },
                            scopedSlots: t._u([
                              {
                                key: "default",
                                fn: function (e) {
                                  return [
                                    e.row.avatar
                                      ? s("b-image", {
                                          staticClass: "is-48x48",
                                          attrs: {
                                            src:
                                              "https://www.autland.com/" +
                                              e.row.avatar,
                                            "src-fallback":
                                              "https://autland.com/avatar-d.png",
                                            alt: e.row.userName,
                                            rounded: !0,
                                          },
                                        })
                                      : t._e(),
                                  ];
                                },
                              },
                            ]),
                          }),
                          s("b-table-column", {
                            attrs: {
                              field: "userName",
                              label: "User",
                              sortable: "",
                            },
                            scopedSlots: t._u([
                              {
                                key: "default",
                                fn: function (e) {
                                  return [
                                    t._v(" " + t._s(e.row.fullName)),
                                    e.row.fullName ? s("br") : t._e(),
                                    s(
                                      "a",
                                      {
                                        directives: [
                                          {
                                            name: "show",
                                            rawName: "v-show",
                                            value: e.row.userName,
                                            expression: "props.row.userName",
                                          },
                                        ],
                                        attrs: {
                                          href:
                                            "https://www.instagram.com/" +
                                            e.row.userName +
                                            "/",
                                          target: "_blank",
                                          title:
                                            "https://www.instagram.com/" +
                                            e.row.userName +
                                            "/",
                                        },
                                      },
                                      [t._v("@" + t._s(e.row.userName))]
                                    ),
                                    s("br"),
                                    "YES" === e.row.isPrivate
                                      ? s("b-tag", [t._v("Private Account")])
                                      : t._e(),
                                  ];
                                },
                              },
                            ]),
                          }),
                          s("b-table-column", {
                            attrs: {
                              field: "followers",
                              label: "Followers",
                              sortable: "",
                            },
                            scopedSlots: t._u([
                              {
                                key: "default",
                                fn: function (e) {
                                  return [
                                    t._v(" " + t._s(e.row.followers) + " "),
                                  ];
                                },
                              },
                            ]),
                          }),
                          s("b-table-column", {
                            attrs: {
                              field: "following",
                              label: "Following",
                              sortable: "",
                            },
                            scopedSlots: t._u([
                              {
                                key: "default",
                                fn: function (e) {
                                  return [
                                    t._v(" " + t._s(e.row.following) + " "),
                                  ];
                                },
                              },
                            ]),
                          }),
                          s("b-table-column", {
                            attrs: {
                              field: "post",
                              label: "Post",
                              sortable: "",
                            },
                            scopedSlots: t._u([
                              {
                                key: "default",
                                fn: function (e) {
                                  return [t._v(" " + t._s(e.row.post) + " ")];
                                },
                              },
                            ]),
                          }),
                          s("b-table-column", {
                            attrs: {
                              field: "email",
                              label: "E-mail comercial",
                              sortable: "",
                            },
                            scopedSlots: t._u([
                              {
                                key: "default",
                                fn: function (e) {
                                  return [
                                    e.row.email
                                      ? s("span", [t._v(t._s(e.row.email))])
                                      : s(
                                          "span",
                                          {
                                            staticClass: "has-text-grey-light",
                                          },
                                          [t._v(window.IGPublicContacts.emailStatusText(e.row))]
                                        ),
                                  ];
                                },
                              },
                            ]),
                          }),
                          s("b-table-column", {
                            attrs: { field: "phone", label: "Phone" },
                            scopedSlots: t._u([
                              {
                                key: "default",
                                fn: function (e) {
                                  return [
                                    e.row.phone
                                      ? s("span", [t._v(t._s(e.row.phone))])
                                      : s(
                                          "span",
                                          {
                                            staticClass: "has-text-grey-light",
                                          },
                                          [t._v(4 === t.type && !e.row.detailLoaded ? "Aguardando consulta" : "Não disponível")]
                                        ),
                                  ];
                                },
                              },
                            ]),
                          }),
                          s("b-table-column", {
                            attrs: { field: "city", label: "City" },
                            scopedSlots: t._u([
                              {
                                key: "default",
                                fn: function (e) {
                                  return [
                                    t._v(" " + t._s(e.row.city || "-") + " "),
                                  ];
                                },
                              },
                            ]),
                          }),
                          s("b-table-column", {
                            attrs: {
                              field: "bio",
                              label: "Biography",
                              width: "240",
                            },
                            scopedSlots: t._u([
                              {
                                key: "default",
                                fn: function (e) {
                                  return [
                                    t._v(" " + t._s(e.row.bio || "-") + " "),
                                  ];
                                },
                              },
                            ]),
                          }),
                          s("b-table-column", {
                            attrs: { field: "djScore", label: "DJ Score", sortable: "", width: "110" },
                            scopedSlots: t._u([{
                              key: "default",
                              fn: function (e) {
                                var sc = e.row.djScore || 0;
                                var tier = sc >= 60 ? "high" : sc >= 30 ? "medium" : "low";
                                return [
                                  s("div", { class: "dj-score-wrap" }, [
                                    s("div", { class: "dj-score-bar" }, [
                                      s("div", { class: "dj-score-fill " + tier, style: { width: sc + "%" } })
                                    ]),
                                    s("span", { class: "dj-score-num " + tier }, [t._v(sc)])
                                  ])
                                ];
                              },
                            }]),
                          }),
                          s("b-table-column", {
                            attrs: { field: "djClass", label: "Type", sortable: "", width: "90" },
                            scopedSlots: t._u([{
                              key: "default",
                              fn: function (e) {
                                var cl = e.row.djClass || "Unknown";
                                return [s("span", { class: "dj-class-pill dj-class-" + cl }, [t._v(cl)])];
                              },
                            }]),
                          }),
                          s("b-table-column", {
                            attrs: { field: "isHotLead", label: "Lead", sortable: "", width: "80" },
                            scopedSlots: t._u([{
                              key: "default",
                              fn: function (e) {
                                return e.row.isHotLead
                                  ? [s("span", { class: "dj-hot-badge" }, [t._v("HOT")])]
                                  : [t._v("-")];
                              },
                            }]),
                          }),
                        ],
                        1
                      ),
                      s("b-loading", {
                        attrs: { "is-full-page": !1 },
                        model: {
                          value: t.isLoading,
                          callback: function (e) {
                            t.isLoading = e;
                          },
                          expression: "isLoading",
                        },
                      }),
                    ],
                    1
                  ),
                ],
                1
              ),
            ]),
            s("p", { staticClass: "has-text-centered py-3" }, [
              t._v("© 2024 autland.com"),
            ]),
            s(
              "b-modal",
              {
                attrs: { width: 460 },
                model: {
                  value: t.isShowProUpgradePop,
                  callback: function (e) {
                    t.isShowProUpgradePop = e;
                  },
                  expression: "isShowProUpgradePop",
                },
              },
              [
                s(
                  "div",
                  { staticClass: "py-5 px-6 has-background-white" },
                  [
                    s(
                      "h3",
                      {
                        staticClass:
                          "has-text-weight-semibold is-size-6 mb-4 is-flex is-justify-content-center is-align-items-center",
                      },
                      [
                        s(
                          "svg",
                          {
                            staticClass: "mr-2",
                            attrs: {
                              xmlns: "http://www.w3.org/2000/svg",
                              viewBox: "0 0 24 24",
                              width: "24",
                              height: "24",
                            },
                          },
                          [
                            s("path", {
                              attrs: { fill: "none", d: "M0 0h24v24H0z" },
                            }),
                            s("path", {
                              attrs: {
                                d: "M2.8 5.2L7 8l4.186-5.86a1 1 0 0 1 1.628 0L17 8l4.2-2.8a1 1 0 0 1 1.547.95l-1.643 13.967a1 1 0 0 1-.993.883H3.889a1 1 0 0 1-.993-.883L1.253 6.149A1 1 0 0 1 2.8 5.2zM12 15a2 2 0 1 0 0-4 2 2 0 0 0 0 4z",
                                fill: "rgba(255,221,86,1)",
                              },
                            }),
                          ]
                        ),
                        t._v(" Upgrade Pro "),
                      ]
                    ),
                    s("p", { staticClass: "mb-4" }, [
                      t._v(
                        " You trial has ended (" +
                          t._s(t.trialCount) +
                          " emails). Upgrade the Pro version to extract "
                      ),
                      s("span", { staticClass: "has-text-weight-bold" }, [
                        t._v("unlimited"),
                      ]),
                      t._v(" emails and unlock all features. "),
                    ]),
                    s(
                      "b-button",
                      {
                        staticClass: "has-text-weight-semibold",
                        attrs: { type: "is-primary", expanded: "" },
                        on: {
                          click: function (e) {
                            t.isProModalActive = !1;
                          },
                        },
                      },
                      [t._v("Upgrade Now")]
                    ),
                  ],
                  1
                ),
              ]
            ),
            s(
              "b-modal",
              {
                attrs: { width: 580 },
                model: {
                  value: t.isProModalActive,
                  callback: function (e) {
                    t.isProModalActive = e;
                  },
                  expression: "isProModalActive",
                },
              },
              [
                s(
                  "div",
                  { staticClass: "py-4 px-3 has-background-white" },
                  [
                    "ok" === t.configs.status && t.subscription.userId
                      ? s("Pro", {
                          attrs: {
                            subscription: t.subscription,
                            configs: t.configs,
                          },
                        })
                      : t._e(),
                  ],
                  1
                ),
              ]
            ),
            s(
              "b-modal",
              {
                attrs: { width: 460, "can-cancel": !1 },
                model: {
                  value: t.isLoginModalActive,
                  callback: function (e) {
                    t.isLoginModalActive = e;
                  },
                  expression: "isLoginModalActive",
                },
              },
              [
                s(
                  "div",
                  { staticClass: "p-6 my-4 has-background-white" },
                  [
                    s(
                      "div",
                      { staticClass: "is-flex is-justify-content-center" },
                      [
                        s(
                          "svg",
                          {
                            attrs: {
                              width: "60",
                              height: "60",
                              viewBox: "0 0 60 60",
                              fill: "none",
                              xmlns: "http://www.w3.org/2000/svg",
                            },
                          },
                          [
                            s("g", { attrs: { "clip-path": "url(#clip0)" } }, [
                              s("path", {
                                attrs: {
                                  d: "M24.3625 54.3625C13.27 51.805 5 41.8675 5 30C5 16.1925 16.1925 5 30 5C43.8075 5 55 16.1925 55 30C55 41.8675 46.73 51.805 35.6375 54.3625L30 60L24.3625 54.3625V54.3625ZM17.53 45.6425C19.8595 47.5055 22.5783 48.8205 25.485 49.49L26.885 49.8125L30 52.93L33.1175 49.8125L34.5175 49.4875C37.614 48.7737 40.4944 47.3284 42.9175 45.2725C41.2895 43.6014 39.3429 42.2738 37.1929 41.3682C35.0428 40.4626 32.733 39.9973 30.4 40C25.31 40 20.725 42.175 17.53 45.6425V45.6425ZM14.04 42.05C16.1411 39.8202 18.6767 38.0443 21.4904 36.8318C24.304 35.6193 27.3362 34.9959 30.4 35C33.3541 34.9962 36.2799 35.5759 39.0094 36.706C41.7388 37.836 44.2182 39.4941 46.305 41.585C48.4452 38.5728 49.7091 35.0266 49.9564 31.3398C50.2038 27.653 49.4249 23.9697 47.7062 20.6986C45.9876 17.4276 43.3963 14.6966 40.2199 12.8086C37.0435 10.9207 33.4062 9.9496 29.7115 10.0031C26.0168 10.0567 22.4092 11.1327 19.2888 13.1119C16.1685 15.0911 13.6574 17.896 12.0342 21.2155C10.4111 24.535 9.73924 28.2393 10.0933 31.9174C10.4473 35.5955 11.8134 39.1036 14.04 42.0525V42.05ZM30 32.5C27.3478 32.5 24.8043 31.4464 22.9289 29.5711C21.0536 27.6957 20 25.1522 20 22.5C20 19.8478 21.0536 17.3043 22.9289 15.4289C24.8043 13.5536 27.3478 12.5 30 12.5C32.6522 12.5 35.1957 13.5536 37.0711 15.4289C38.9464 17.3043 40 19.8478 40 22.5C40 25.1522 38.9464 27.6957 37.0711 29.5711C35.1957 31.4464 32.6522 32.5 30 32.5ZM30 27.5C31.3261 27.5 32.5979 26.9732 33.5355 26.0355C34.4732 25.0979 35 23.8261 35 22.5C35 21.1739 34.4732 19.9022 33.5355 18.9645C32.5979 18.0268 31.3261 17.5 30 17.5C28.6739 17.5 27.4022 18.0268 26.4645 18.9645C25.5268 19.9022 25 21.1739 25 22.5C25 23.8261 25.5268 25.0979 26.4645 26.0355C27.4022 26.9732 28.6739 27.5 30 27.5Z",
                                  fill: "#DADADA",
                                },
                              }),
                            ]),
                            s("defs", [
                              s("clipPath", { attrs: { id: "clip0" } }, [
                                s("rect", {
                                  attrs: {
                                    width: "60",
                                    height: "60",
                                    fill: "white",
                                  },
                                }),
                              ]),
                            ]),
                          ]
                        ),
                      ]
                    ),
                    s(
                      "p",
                      {
                        staticClass:
                          "is-size-6 has-text-grey-light py-5 has-text-centered",
                      },
                      [t._v(" Please sign in to save your settings. ")]
                    ),
                    s(
                      "b-button",
                      {
                        staticClass: "mb-5",
                        attrs: { expanded: "" },
                        on: { click: t.handleLogin },
                      },
                      [
                        s(
                          "span",
                          {
                            staticClass:
                              "is-flex is-justify-content-center is-align-items-center",
                          },
                          [
                            s(
                              "svg",
                              {
                                attrs: {
                                  width: "24",
                                  height: "24",
                                  viewBox: "0 0 24 24",
                                  fill: "none",
                                  xmlns: "http://www.w3.org/2000/svg",
                                },
                              },
                              [
                                s("path", {
                                  attrs: {
                                    d: "M21.8055 10.0415H21V10H12V14H17.6515C16.827 16.3285 14.6115 18 12 18C8.6865 18 6 15.3135 6 12C6 8.6865 8.6865 6 12 6C13.5295 6 14.921 6.577 15.9805 7.5195L18.809 4.691C17.023 3.0265 14.634 2 12 2C6.4775 2 2 6.4775 2 12C2 17.5225 6.4775 22 12 22C17.5225 22 22 17.5225 22 12C22 11.3295 21.931 10.675 21.8055 10.0415Z",
                                    fill: "#FFC107",
                                  },
                                }),
                                s("path", {
                                  attrs: {
                                    d: "M3.15302 7.3455L6.43851 9.755C7.32751 7.554 9.48052 6 12 6C13.5295 6 14.921 6.577 15.9805 7.5195L18.809 4.691C17.023 3.0265 14.634 2 12 2C8.15902 2 4.82802 4.1685 3.15302 7.3455Z",
                                    fill: "#FF3D00",
                                  },
                                }),
                                s("path", {
                                  attrs: {
                                    d: "M12 22C14.583 22 16.93 21.0115 18.7045 19.404L15.6095 16.785C14.5717 17.5742 13.3037 18.001 12 18C9.39897 18 7.19047 16.3415 6.35847 14.027L3.09747 16.5395C4.75247 19.778 8.11347 22 12 22Z",
                                    fill: "#4CAF50",
                                  },
                                }),
                                s("path", {
                                  attrs: {
                                    d: "M21.8055 10.0415H21V10H12V14H17.6515C17.2571 15.1082 16.5467 16.0766 15.608 16.7855L15.6095 16.7845L18.7045 19.4035C18.4855 19.6025 22 17 22 12C22 11.3295 21.931 10.675 21.8055 10.0415Z",
                                    fill: "#1976D2",
                                  },
                                }),
                              ]
                            ),
                            s("span", { staticClass: "is-size-6 pl-1" }, [
                              t._v("Sign In with Google"),
                            ]),
                          ]
                        ),
                      ]
                    ),
                  ],
                  1
                ),
              ]
            ),
          ],
          1
        );
      },
      n = [
        function () {
          var t = this,
            e = t.$createElement,
            a = t._self._c || e;
          return a("div", { staticClass: "logo" }, [
            a("img", {
              attrs: {
                width: "100%",
                src: s("cf05"),
                alt: "Autland IG Extractor",
              },
            }),
          ]);
        },
      ],
      o = s("5530"),
      r = s("ade3"),
      c = s("3835"),
      l = s("1da1"),
      u =
        (s("96cf"),
        s("b64b"),
        s("d3b7"),
        s("a15b"),
        s("d81d"),
        s("fb6a"),
        s("4de4"),
        s("25f0"),
        s("ac1f"),
        s("5319"),
        s("1276"),
        s("4d63"),
        s("c607"),
        s("2c3e"),
        s("466d"),
        s("99af"),
        s("a434"),
        s("e9c4"),
        s("caad"),
        s("2532"),
        s("c740"),
        s("159b"),
        s("9845")),
      d = s.n(u),
      p = s("bc3a"),
      m = s.n(p),
      g = s("5a0c"),
      h = s.n(g),
      f = s("c832"),
      v = s.n(f),
      w = s("3452"),
      b = s.n(w),
      C = s("fa7d"),
      y = s("fa20"),
      x = s("a4af");
    m.a.defaults.withCredentials = true;
    d.a.storage.onChanged.addListener(
      (function () {
        var t = Object(l["a"])(
          regeneratorRuntime.mark(function t(e) {
            var s, a, i, n, o;
            return regeneratorRuntime.wrap(function (t) {
              while (1)
                switch ((t.prev = t.next)) {
                  case 0:
                    (s = Object.keys(e)), (a = 0), (i = s);
                  case 2:
                    if (!(a < i.length)) {
                      t.next = 11;
                      break;
                    }
                    if (
                      ((n = i[a]),
                      "webAuthData" !== n || !e[n].newValue || e[n].oldValue)
                    ) {
                      t.next = 8;
                      break;
                    }
                    if (((o = e[n].newValue), o && o.id))
                      try {
                        Object(y["i"])({ username: o.email, id: o.id }).then(
                          function () {
                            m.a.get("https://www.autland.com/auth/logout"),
                              d.a.storage.local.remove("webAuthData"),
                              window.location.reload();
                          }
                        );
                      } catch (r) {
                        console.log(r);
                      }
                    return t.abrupt("break", 11);
                  case 8:
                    a++, (t.next = 2);
                    break;
                  case 11:
                  case "end":
                    return t.stop();
                }
            }, t);
          })
        );
        return function (e) {
          return t.apply(this, arguments);
        };
      })()
    );
    var k = function (t, e) {
        for (
          var s = [],
            a = function (a) {
              var i = v()(t[a], e, "");
              if (i) {
                var n = s.some(function (t) {
                  return v()(t, e, "") === i;
                });
                n || s.push(t[a]);
              }
            },
            i = 0;
          i < t.length;
          i++
        )
          a(i);
        return s;
      },
      _ = {
        name: "App",
        data: function () {
          return {
            user: {},
            insLogged: !1,
            insCsrfToken: "",
            ins: "",
            type: 0,
            extractionType: "",
            insUser: {},
            currentFollowCount: 0,
            isNoFollow: !1,
            insHashtag: {},
            insLike: {},
            insComment: {},
            insLocation: {},
            pageInfo: { end_cursor: "", has_next_page: !0 },
            followList: [],
            djFilterEnabled: false,
            djMinScore: 0,
            djOnlyDJs: false,
            loadUserIndex: 0,
            isPaused: !1,
            isComplete: !1,
            isLoading: !1,
            currentPage: 1,
            isShowProUpgradePop: !1,
            isProModalActive: !1,
            isLoginModalActive: !1,
            subscription: {},
            version: "",
            trialCount: 1000,
            lastTrialCount: 0,
            localExtractEmailCount: 0,
            extractEmailCount: 0,
            lastScrapedCount: 0,
            listTimer: null,
            detailTimer: null,
            listCatchTimes: 0,
            detailCatchTimes: 0,
            currentCursor: "",
            cursorCountList: [],
            historyId: "",
            lastHistoryItem: {
              id: "",
              token: "",
              updateTimes: 0,
              scrapedCount: 0,
              cursorScrapedCount: 0,
              count: 0,
            },
            getListTimes: 0,
            skipCount: 0,
            lastUpdateHistoryDataStr: "",
            configs: {},
                        lastExtractData: [],
            pendingExtractData: [],
            queueReady: !1,
            autoContinueTimer: null,
            listenerUnloaded: !1,
            localStorageExtractKeys: [],
            customUserList: [],
            extractionEpoch: 0,
            listCycle: null,
            detailCycle: null,
            startupCycle: null,
            resumeRequested: !1,
            resumeStartup: !1,
            retryAfterUntil: null,
            manualPause: !1,
            lastProfileRequestStartedAt: 0,
            lastDetailFromCache: !1,
            commercialStartRequired: false,
            commercialContactUnavailable: false,
            commercialProfileReader: null,
            contactStatusNow: Date.now(),
            contactEvidence: [],
            validationCard: null,
            contactSchema: null,
            storedCooldownUntil: 0,
            cooldownSaveFailed: false,
            contactStateSince: 0,
            commercialBlockReason: "",
            contactCardEpoch: -1,
            contactProbeRunning: false,
            contactClockTimer: null,
            consecutiveUnavailableProfiles: 0,
          };
        },
        filters: {
          customUsersTitle: function (t) {
            return t
              ? t.length > 3
                ? t
                    .slice(0, 3)
                    .map(function (t) {
                      return "@".concat(t.userName);
                    })
                    .join(", ") + "..."
                : t
                    .map(function (t) {
                      return "@".concat(t.userName);
                    })
                    .join(", ")
              : "";
          },
        },
        computed: {
          userList: function () {
            var self = this;
            return this.followList.filter(function (t) {
              if (!t.loaded) return false;
              if (self.djFilterEnabled) {
                var s = typeof t.djScore === "number" ? t.djScore : 0;
                if (s < self.djMinScore) return false;
                if (self.djOnlyDJs && t.djClass === "Unknown" && s < 30) return false;
              }
              return true;
            }).map(window.IGPublicContacts.commercialRow);
          },
                              pendingContactCount: function () {
            // Rows with a user id still waiting for their one /users/{id}/info/ answer.
            return this.followList.filter(function (row) { return row.loaded && row.detailLoaded === false && !!row.userId; }).length;
          },
          processedList: function () {
            // What was really extracted, regardless of the DJ display filter. Comment rows are
            // listed before their profile check, so in Comment mode only checked rows count.
            var comment = 4 === this.type;
            return this.followList.filter(function (t) {
              return comment ? !!t.detailLoaded : !!t.loaded;
            });
          },
          notExistList: function () {
            return this.followList.filter(function (t) {
              return !t.userId && t.loaded;
            });
          },
          emailList: function () {
            return this.followList.filter(function (t) {
              return !!window.IGPublicContacts.commercialEmail(t);
            }).map(window.IGPublicContacts.commercialRow);
          },
          phoneList: function () {
            // Cleaned like every export: a row saved without the phone key counts as no phone.
            return this.followList.map(window.IGPublicContacts.commercialRow).filter(function (t) {
              return "" !== t.phone;
            });
          },
          exportBase: function () {
            // Rows saved by earlier sessions of this history (restored on resume) plus this session's, one row per
            // profile, cleaned like every export. Without a resume this is just this session's rows.
            var rows = this.followList.filter(function (t) { return !!t.loaded; });
            return this.lastExtractData && this.lastExtractData.length
              ? this.mergeExtractRows(this.lastExtractData, rows)
              : rows.map(window.IGPublicContacts.commercialRow);
          },
          exportAllList: function () {
            // Same display filter as the table (DJ filter), over everything accumulated.
            var self = this;
            return this.exportBase.filter(function (t) {
              if (self.djFilterEnabled) {
                var s = typeof t.djScore === "number" ? t.djScore : 0;
                if (s < self.djMinScore) return false;
                if (self.djOnlyDJs && t.djClass === "Unknown" && s < 30) return false;
              }
              return true;
            });
          },
          exportEmailList: function () {
            return this.exportBase.filter(function (t) { return !!t.email; });
          },
          exportPhoneList: function () {
            return this.exportBase.filter(function (t) { return "" !== t.phone; });
          },
          contactRealProof: function () {
            // Persisted in the schema, so it survives the 20-entry evidence log.
            var schema = this.contactSchema;
            if (schema && schema.firstFound && schema.firstFound.at) return schema.firstFound;
            return this.contactEvidence.filter(function (entry) { return entry && "found" === entry.outcome; })[0] || null;
          },
          phoneRealProof: function () {
            // The first phone Instagram delivered in a published contact field (not one read from the bio).
            var schema = this.contactSchema;
            return schema && schema.firstPhone && schema.firstPhone.at ? schema.firstPhone : null;
          },
          contactRunSummary: function () {
            // This run by category, with no contact value: the list to compare, profile by profile, with what the app shows.
            var P = window.IGPublicContacts, groups = { email: [], phonePublished: [], phoneText: [], none: [], pending: [], failed: [], unavailable: [] };
            this.followList.forEach(function (row) {
              if (!row || !row.userName) return;
              var name = "@" + row.userName, state = P.contactState(row);
              if (state === "pending") groups.pending.push(name);
              else if (state === "profile_unavailable") groups.unavailable.push(name);
              else if (state !== "email_found" && state !== "no_public_email") groups.failed.push(name);
              else {
                var phone = P.commercialRow(row).phone, text = row.phoneSource === "biography" || row.phoneSource === "profile_link";
                if (state === "email_found") groups.email.push(name);
                if (phone && !text) groups.phonePublished.push(name);
                if (phone && text) groups.phoneText.push(name);
                if (state === "no_public_email" && !phone) groups.none.push(name);
              }
            });
            return groups;
          },
          contactDiagnosticText: function () {
            var reader = window.IGCommercialProfileReader, schema = this.contactSchema || reader.readSchema(null), proof = this.contactRealProof;
            var when = function (ms) { return ms ? new Date(ms).toLocaleString() : "-"; };
            var names = function (list) { return list.length ? " (@" + list.join(", @") + ")" : ""; };
            var sent = this.contactEvidence.filter(function (item) { return item && item.sentRoute; })[0];
            var phoneProof = this.phoneRealProof, groups = this.contactRunSummary;
            var list = function (items) { return items.length ? " (" + items.slice(0, 10).join(", ") + (items.length > 10 ? ", …" : "") + ")" : ""; };
            var lines = [
              "Autland IG Extractor " + this.version + " · Modo: Comment",
              "Consulta: " + (sent ? sent.sentRoute + " (rota enviada de fato)" : "GET https://www.instagram.com/api/v1/users/{id}/info/ (rota padrão; " + (this.contactEvidence.length ? "as respostas registradas não guardam o endereço enviado" : "nenhuma consulta enviada ainda") + ")") + " (" + reader.endpoint + ") · a mesma função de todos os modos, 1 consulta por perfil",
              "Pausa salva no navegador: " + (this.storedCooldownUntil > this.contactStatusNow ? "até " + when(this.storedCooldownUntil) : "nenhuma ativa") +
                " · nesta aba: " + (this.retryAfterUntil > this.contactStatusNow ? "até " + when(this.retryAfterUntil) : "nenhuma") +
                (this.cooldownSaveFailed ? " · ATENÇÃO: a última pausa não pôde ser salva" : ""),
              "Estado salvo neste navegador desde: " + when(this.contactStateSince) + " (pausa, contadores e respostas ficam no armazenamento da extensão; remover a extensão ou usar outro perfil do Chrome começa do zero)",
              "Campo de e-mail presente em " + schema.keysPresent + " resposta(s)" + names(schema.keysPresentUsers) +
      "; respostas de perfil sem o campo: " + schema.omittedOther,
              "E-mails públicos entregues: " + schema.found + names(schema.foundUsers),
              "Respostas desta consulta: " + schema.responses + " (perfis entregues: " + schema.profiles + "); recusas seguidas (HTTP 429/400): " + schema.refusals +
                (schema.lastRefusalAt ? " (última em " + when(schema.lastRefusalAt) + ")" : ""),
              "Fila: perfis sem e-mail não param a fila; só falhas de acesso (429, login...) pausam" +
                (reader.routeRefusing(schema) ? " · atenção: o Instagram recusou as consultas e nenhuma resposta de perfil foi obtida até agora" : ""),
              "Contato comercial público em resposta real: " + (proof ? "SIM — @" + proof.username + " em " + when(proof.at) + " (" + proof.email + ")" : "NÃO comprovado"),
              "Telefones públicos entregues (campo do Instagram): " + schema.phoneFound + names(schema.phoneFoundUsers),
              "Telefone público em resposta real: " + (phoneProof ? "SIM — @" + phoneProof.username + " em " + when(phoneProof.at) + " (" + (phoneProof.phone || "mascarado") + ", campo " + (phoneProof.field || "-") + ")" : "NÃO comprovado"),
              "Resumo desta execução (sem valores de contato):",
              "  com e-mail público: " + groups.email.length + list(groups.email),
              "  com telefone público (campo do Instagram): " + groups.phonePublished.length + list(groups.phonePublished),
              "  com telefone só no texto da bio/link (não é o campo público): " + groups.phoneText.length + list(groups.phoneText),
              "  sem contato público (resposta HTTP 200 sem e-mail e sem telefone): " + groups.none.length + list(groups.none),
              "  aguardando consulta: " + groups.pending.length + " · perfil indisponível: " + groups.unavailable.length + " · falha de acesso: " + groups.failed.length,
              "Últimas respostas reais (mais recente primeiro):"
            ];
            this.contactEvidence.slice(0, 8).forEach(function (entry, i) {
              var keys = entry.keys ? Object.keys(entry.keys).map(function (k) { return k + "=" + entry.keys[k]; }).join(" ") : "";
              var flags = entry.flags ? Object.keys(entry.flags).map(function (k) { return k + "=" + entry.flags[k]; }).join(" ") : "";
              lines.push((i + 1) + ") " + when(entry.at) + " · @" + entry.username + (entry.probe ? " · validação manual" : "") +
                " · HTTP " + (null === entry.http || undefined === entry.http ? "-" : entry.http) + (429 === entry.http ? " · Retry-After=" + (entry.retryAfter ? entry.retryAfter : "ausente") : (entry.retryAfter ? " · Retry-After=" + entry.retryAfter : "")) +
                (false === entry.cooldownSaved ? " · pausa salva=NÃO" : "") +
                " · resultado=" + (entry.outcome || "-") + (entry.state ? " · estado=" + entry.state : "") + (entry.decision ? " · decisão=" + entry.decision : "") +
      (entry.emailField ? " · campo=" + entry.emailField : "") + (entry.profileType ? " · tipo=" + entry.profileType : "") + (keys ? " · " + keys : "") +
                (flags ? " · " + flags : "") + (entry.email ? " · e-mail=" + entry.email : "") +
                (entry.phoneKeys ? " · telefone: " + Object.keys(entry.phoneKeys).map(function (k) { return k + "=" + entry.phoneKeys[k]; }).join(" ") : "") +
                (entry.phoneField ? " · telefone=" + (entry.phone || "mascarado") + " (campo=" + entry.phoneField + (entry.phonePublished ? ", público" : ", texto da bio/link") + ")" : (entry.phoneKeys ? " · telefone=nenhum" : "")) +
                (entry.sentRoute ? " · rota=" + entry.sentRoute : "") + (entry.message ? " · mensagem=" + entry.message : "") +
                (Array.isArray(entry.emailPaths) ? " · campos de e-mail recebidos: " + (entry.emailPaths.length ? entry.emailPaths.join(", ") : "nenhum") : ""));
            });
            var latest = this.contactEvidence.filter(function (entry) { return entry && Array.isArray(entry.userKeys); })[0];
            if (latest) lines.push("Campos do perfil na última resposta com perfil (@" + latest.username + ", " + latest.userKeys.length + "): " + latest.userKeys.join(", "));
            return lines.join("\n");
          },
        },
        created: function () {
          var t = d.a.runtime.getManifest(),
            e = t.version;
          (this.version = "v".concat(e) + " · PATCHED 15.5 · E-mail comercial via /users/{id}/info/"), this.startAfterSavedCooldown();
          var self = this;
          // The panel's cooldown gates need a clock of their own: the DJ bar's
          // ticker can be absent and must not decide when Iniciar re-enables.
          this.contactClockTimer = setInterval(function () { self.contactStatusNow = Date.now(); }, 1000);
          this.$nextTick(function () {
            var bar = document.createElement('div');
            bar.id = 'dj-filter-bar';
            bar.innerHTML = '<span class="dj-fb-title">🎧 DJ Filter</span>' + '<label><input type="checkbox" id="dj-only-toggle"> Only DJs / Artists</label>' + '<label><input type="checkbox" id="dj-hot-toggle"> Hot Leads only</label>' + '<label style="gap:8px">Min Score: <input type="range" id="dj-score-range" min="0" max="90" step="5" value="0"> <span class="dj-score-label" id="dj-score-val">0</span></label>' + '<span class="dj-stat" id="dj-stat"></span>';
            var app = document.getElementById('app') || self.$el;
            if (app && app.firstChild) app.insertBefore(bar, app.firstChild);
            else if (app) app.appendChild(bar);
            if (!bar.parentNode) return;
            document.getElementById('dj-only-toggle').addEventListener('change', function(ev) {
              self.djFilterEnabled = true;
              self.djOnlyDJs = ev.target.checked;
            });
            document.getElementById('dj-hot-toggle').addEventListener('change', function(ev) {
              self.djFilterEnabled = ev.target.checked;
              if (ev.target.checked) { self.djMinScore = 60; document.getElementById('dj-score-range').value = 60; document.getElementById('dj-score-val').textContent = '60'; }
              else { self.djMinScore = 0; document.getElementById('dj-score-range').value = 0; document.getElementById('dj-score-val').textContent = '0'; }
            });
            document.getElementById('dj-score-range').addEventListener('input', function(ev) {
              var v = parseInt(ev.target.value);
              document.getElementById('dj-score-val').textContent = v;
              self.djMinScore = v;
              self.djFilterEnabled = v > 0 || self.djOnlyDJs;
            });
            setInterval(function() {
              var stat = document.getElementById('dj-stat');
              if (!stat) return;
              var total = self.followList.filter(function(u){ return u.loaded; }).length;
              var hot = self.followList.filter(function(u){ return u.isHotLead; }).length;
              var checked = self.followList.filter(function(u){ return u.detailLoaded; }).length;
              self.contactStatusNow = Date.now();
                  var counts = {};
    self.followList.forEach(function (u) { var st = window.IGPublicContacts.contactState(u); counts[st] = (counts[st] || 0) + 1; });
    stat.textContent = self.type === 4
      ? total + ' perfis encontrados | ' + checked + ' consultados | ' + (counts.email_found || 0) + ' e-mails comerciais | sem e-mail público ' + (counts.no_public_email || 0) +
        ' · aguardando ' + (counts.pending || 0) + ' · indisponíveis ' + (counts.profile_unavailable || 0) +
        ' · falhas ' + ((counts.rate_limited || 0) + (counts.login_required || 0) + (counts.access_denied || 0) + (counts.temporary_error || 0))
      : total + ' loaded | ' + hot + ' hot leads';
            }, 1500);
          });

        },
        methods: {
          startAfterSavedCooldown: function () {
            var self = this;
            var commentMode = Number(self.$route && self.$route.query.type) === 4;
            if (commentMode) {
              self.type = 4;
              self.ins = self.$route.query.ins || "";
              self.commercialStartRequired = true;
              self.resumeStartup = true;
              self.manualPause = true;
              self.pauseExtraction();
            }
            var reader = window.IGCommercialProfileReader;
            return d.a.storage.local.get(["ig_contact_cooldown_until", reader.schemaKey, reader.evidenceKey, reader.stateSinceKey]).then(function (saved) {
              var until = Number(saved.ig_contact_cooldown_until) || 0;
              self.applyCommercialEvidence(saved);
              // Marks when this browser's saved state started: a later date proves the saved
              // pause and counters were emptied (extension removed, another Chrome profile...).
              if (!Number(saved[reader.stateSinceKey])) {
                self.contactStateSince = Date.now();
                d.a.storage.local.set({ [reader.stateSinceKey]: self.contactStateSince }).catch(function () {});
              }
              if (until > +new Date()) {
                self.retryAfterUntil = until;
                self.resumeStartup = !0;
                self.pauseExtraction();
                self.$buefy.notification.open({
                  indefinite: !0,
                  message: "Instagram request cooldown is active until " + new Date(until).toLocaleString() + ". Your collected rows are kept in History. " +
                    (commentMode ? "Wait before continuing." : "Extraction resumes by itself after that time."),
                  position: "is-bottom-right", type: "is-warning", hasIcon: !0
                });
                // Other modes keep their usual behaviour: continue on their own once the shared pause ends.
                if (!commentMode) self.autoContinue();
                return;
              }
              // Testing this changed route requires the user's Start click.
              if (commentMode) return;
              return self.startWorking();
            }).catch(function (error) {
              // Fail closed if the saved cooldown cannot be read.
              self.resumeStartup = !0;
              self.pauseExtraction();
              console.warn("[IG Extractor] Could not read the saved cooldown; extraction paused", error);
            });
          },
          // Local ownership prevents stale timers/promises from restarting extraction.
          beginExtractionCycle: function (lane) {
            var key = lane + "Cycle";
            if (this.isPaused || this[key]) return null;
            var cycle = { epoch: this.extractionEpoch, scheduled: !1, waiting: !1 };
            this[key] = cycle;
            return cycle;
          },
          isExtractionCycleCurrent: function (cycle) {
            return !!cycle && !this.isPaused && cycle.epoch === this.extractionEpoch;
          },
          finishExtractionCycle: function (lane, cycle) {
            var key = lane + "Cycle";
            if (this[key] === cycle) {
              if (lane === "detail" && cycle.epoch !== this.extractionEpoch &&
                  cycle.processedIndex === this.loadUserIndex && this.followList[cycle.processedIndex] &&
                  this.followList[cycle.processedIndex].loaded) this.loadUserIndex = cycle.processedIndex + 1;
              this[key] = null;
            }
            if (this.resumeRequested) this.resumeExtraction();
          },
          advanceExtractionCycle: function (lane, cycle, method) {
            if (!this.isExtractionCycleCurrent(cycle)) {
              this.finishExtractionCycle(lane, cycle);
              return;
            }
            this.finishExtractionCycle(lane, cycle);
            return this[method]();
          },
          pauseExtraction: function () {
            this.isPaused = !0;
            this.resumeRequested = !1;
            this.extractionEpoch++;
            if (this.startupCycle) this.resumeStartup = !0;
            this.listTimer && clearTimeout(this.listTimer);
            this.detailTimer && clearTimeout(this.detailTimer);
            this.listTimer = this.detailTimer = null;
            if (this.listCycle && this.listCycle.waiting) this.listCycle = null;
            if (this.detailCycle && this.detailCycle.waiting) this.detailCycle = null;
            if (this.startupCycle && this.startupCycle.waiting) this.startupCycle = null;
            this.autoContinueTimer && clearInterval(this.autoContinueTimer);
            this.autoContinueTimer = null;
          },
          isExtraction429: function (error) {
            return !!(error && error.response && error.response.status === 429);
          },
          isFeedbackRequired: function (error) {
            return !!(error && error.response && error.response.status === 400 && error.response.data && error.response.data.message === "feedback_required");
          },
          pauseExtractionOnFeedbackRequired: function (error, context) {
            var response = (error && error.response) || {}, data = response.data, detail = "";
            try { detail = typeof data === "string" ? data : JSON.stringify(data); } catch (e) { detail = String(data || ""); }
            detail = (detail || (error && error.message) || "No response body").slice(0, 1200)
              .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
            var status = response.status || "400", url = (response.config && response.config.url) || "";
            this.pauseExtraction();
            console.error("[IG Extractor] Instagram feedback_required", { context: context || "request", status: status, url: url, data: data });
            this.$buefy.notification.open({
              indefinite: !0,
              message: 'Instagram returned HTTP ' + status + ' (<b>feedback_required</b>). <div style="font-weight:500;">This build will not treat this as a 429 rate-limit or auto-retry it. Request: ' + (context || "Instagram request") + '. Check the extension console for the failing URL/response.</div><div style="font-size:12px;font-style:italic;word-break:break-word;">response: ' + detail + '</div>',
              position: "is-bottom-right", type: "is-danger", hasIcon: !0
            });
          },
          pauseExtractionOn429: function (error, notify) {
            if (error.cooldownUntil) this.retryAfterUntil = Math.max(this.retryAfterUntil || 0, error.cooldownUntil);
            var headers = (error.response && error.response.headers) || {},
              value = typeof headers.get === "function" ? headers.get("retry-after") :
                (headers["retry-after"] !== undefined ? headers["retry-after"] : headers["Retry-After"]);
            var now = +new Date();
            if (value !== undefined && value !== null && String(value).trim() !== "") {
              var text = String(value).trim(),
                until = /^\d+$/.test(text) ? now + Number(text) * 1e3 : Date.parse(text);
              if (isFinite(until)) this.retryAfterUntil = Math.max(this.retryAfterUntil || 0, now, until);
            }
            // If Instagram does not send Retry-After, enforce a conservative 60-minute cooldown.
            if (this.retryAfterUntil === null || this.retryAfterUntil <= now) this.retryAfterUntil = now + 36e5;
            console.warn("[IG Extractor] HTTP 429: pausing until", new Date(this.retryAfterUntil).toLocaleString());
            this.pauseExtraction();
            var self = this, reader = window.IGCommercialProfileReader;
            // Merge under the lock shared with the reader and every other dashboard: a shorter
            // Retry-After, or a slower tab, can never cut a longer saved pause.
            reader.saveCooldown(d.a.storage.local, navigator.locks, self.retryAfterUntil, function (ms) {
              return new Promise(function (resolve) { setTimeout(resolve, ms); });
            }).then(function (until) {
              self.retryAfterUntil = Math.max(self.retryAfterUntil || 0, until);
              self.storedCooldownUntil = until;
              self.cooldownSaveFailed = false;
            }).catch(function (storageError) {
              self.cooldownSaveFailed = true;
              console.warn("[IG Extractor] Could not save cooldown", storageError);
              self.$buefy.notification.open({
                indefinite: !0, position: "is-bottom-right", type: "is-danger", hasIcon: !0,
                message: "A pausa do Instagram NÃO pôde ser salva no navegador. Esta aba continua pausada, mas outra aba ou um dashboard reaberto não saberão da pausa: não reabra nem clique em Iniciar antes de " + new Date(self.retryAfterUntil).toLocaleString() + "."
              });
            });
            if (notify) this.$buefy.notification.open({
              indefinite: !0,
              message: 'Oops! Something went wrong, the task has been suspended, <div style="font-weight:500;">Instagram returned a real HTTP 429 rate-limit. This build now pauses requests and honors Retry-After; if Instagram does not provide one, it enforces a 60-minute cooldown. Do not repeatedly click Continue during the cooldown. <a style="color:#fff810;" target="_blank" href="https://www.instagram.com/">Go to instagram.com</a></div><div style="font-size:12px;font-style:italic;">error: ' + (error.message || "") + '</div>',
              position: "is-bottom-right", type: "is-danger", hasIcon: !0
            });
          },
          resumeExtraction: function () {
            if (!this.isPaused || this.commercialContactUnavailable) return;
            if (this.retryAfterUntil !== null && +new Date() < this.retryAfterUntil) return;
            this.resumeRequested = !0;
            // Wait for the old awaits/requests to settle before transferring ownership.
            if (this.listCycle || this.detailCycle || this.startupCycle) return;
            this.resumeRequested = !1;
            this.manualPause = !1;
            this.extractionEpoch++;
            this.retryAfterUntil = null;
            this.isPaused = !1;
            this.commercialStartRequired = false;
            this.consecutiveUnavailableProfiles = 0;
            this.autoContinueTimer && clearInterval(this.autoContinueTimer);
            this.autoContinueTimer = null;
            try {
              document.querySelectorAll(".notification button.delete").forEach(function (t) { t.click(); });
            } catch (t) { console.log("colse notification error:", t); }
            if (this.resumeStartup) this.startWorking();
            else this.startLoadAllData();
          },
          getUserInfo: function () {
            var t = this;
            return Object(l["a"])(
              regeneratorRuntime.mark(function e() {
                var s, a;
                return regeneratorRuntime.wrap(
                  function (e) {
                    while (1)
                      switch ((e.prev = e.next)) {
                        case 0:
                          return (
                            (s = {}),
                            (e.prev = 1),
                            (e.next = 4),
                            Object(y["b"])()
                          );
                        case 4:
                          (a = e.sent),
                            "ok" === a.status &&
                              ((t.user = a.user), (s = t.user)),
                            (e.next = 11);
                          break;
                        case 8:
                          (e.prev = 8),
                            (e.t0 = e["catch"](1)),
                            t.$buefy.toast.open("".concat(e.t0));
                        case 11:
                          return e.abrupt("return", s);
                        case 12:
                        case "end":
                          return e.stop();
                      }
                  },
                  e,
                  null,
                  [[1, 8]]
                );
              })
            )();
          },
          handleLogin: function () {
            var t = this;
            Object(y["h"])().then(
              function (e) {
                e && e.id && t.startWorking();
              },
              function () {
                t.$buefy.snackbar.open({
                  message:
                    "You did not complete the authorization or something went wrong.",
                  type: "is-danger",
                  position: "is-bottom-right",
                  queue: !1,
                  duration: 3e3,
                });
              }
            );
          },
          handleGotoIns: function () {
            d.a.tabs.create({ url: "https://www.instagram.com/" });
          },
          getInsConfigs: function () {
            var t = this;
            return Object(l["a"])(
              regeneratorRuntime.mark(function e() {
                var s, a, i, n, o;
                return regeneratorRuntime.wrap(
                  function (e) {
                    while (1)
                      switch ((e.prev = e.next)) {
                        case 0:
                          return (
                            (s = {}),
                            (e.prev = 1),
                            (e.next = 4),
                            Object(y["c"])()
                          );
                        case 4:
                          (a = e.sent),
                            "ok" === a.status &&
                              (a.key
                                ? ((i = a.key),
                                  (n = a.value),
                                  (o = b.a.AES.decrypt(
                                    n,
                                    b.a.enc.Utf8.parse(t.$config.ENCRYPT_KEY),
                                    {
                                      iv: b.a.enc.Hex.parse(i),
                                      mode: b.a.mode.CBC,
                                      format: b.a.format.Hex,
                                    }
                                  ).toString(b.a.enc.Utf8)),
                                  (s = JSON.parse(o)))
                                : (s = a)),
                            (e.next = 11);
                          break;
                        case 8:
                          (e.prev = 8),
                            (e.t0 = e["catch"](1)),
                            console.log(e.t0);
                        case 11:
                          if (!s.ApiProfileInfo) s.ApiProfileInfo = {url:"https://www.instagram.com/api/v1/users/web_profile_info/?username=${@}$",checkKey:"data.status",checkValue:"ok",dataKeys:"data.data.user.pk|data.data.user.full_name|data.data.user.profile_pic_url|data.data.user.follower_count|data.data.user.following_count|data.data.user.is_private"};
                          if (!s.ApiProfileInfo2) s.ApiProfileInfo2 = {url:"https://i.instagram.com/api/v1/users/web_profile_info/?username=${@}$",checkKey:"data.status",checkValue:"ok",dataKeys:"data.data.user.pk|data.data.user.full_name|data.data.user.profile_pic_url|data.data.user.follower_count|data.data.user.following_count|data.data.user.is_private"};
                          if (!s.ProfileInfoFromHtml) s.ProfileInfoFromHtml = {url:"https://www.instagram.com/${@}$/",reg_id:"%22user_id%22%3A%22(%5Cd%2B)%22",reg_avatar:"%22profile_pic_url%22%3A%22([%5E%22]%2B)%22"};
                          s.CustomHeaders = Object.assign({"x-ig-app-id":"936619743392459","x-asbd-id":"129477","x-csrftoken":"","x-ig-www-claim":"","accept":"*/*","accept-language":"en-US,en;q=0.9","x-requested-with":"XMLHttpRequest"},s.CustomHeaders||{});
                          if (!s.ClaimHeaderKey) s.ClaimHeaderKey = "x-ig-www-claim";
                          if (!s.CsrfHeaderKey) s.CsrfHeaderKey = "x-csrftoken";
                          if (!s.InsCsrfTokenFromCookie) s.InsCsrfTokenFromCookie = {url:"https://www.instagram.com/",cookieKey:"csrftoken"};
                          if (!s.InsCsrfTokenFromHtml) s.InsCsrfTokenFromHtml = {url:"https://www.instagram.com/",reg:"%22csrf_token%22%3A%22([%5E%22]%2B)%22"};
                          if (!s.InsUserStatusFromCookie) s.InsUserStatusFromCookie = {url:"https://www.instagram.com/",cookieKey:"ds_user_id"};
                          if (!s.apiUserForFollowers) s.apiUserForFollowers = {url:"https://www.instagram.com/api/v1/friendships/${userid}/followers/?count=200&max_id=${cursor}",checkKey:"data.status",checkValue:"ok",dataKeys:"data.users|data.next_max_id|data.big_list",itemsDataKeys:"pk|username|full_name|profile_pic_url"};
                          if (!s.apiUserForFollowing) s.apiUserForFollowing = {url:"https://www.instagram.com/api/v1/friendships/${userid}/following/?count=200&max_id=${cursor}",checkKey:"data.status",checkValue:"ok",dataKeys:"data.users|data.next_max_id|data.big_list",itemsDataKeys:"pk|username|full_name|profile_pic_url"};
                          if (!s.ApiUserInfoDetail) s.ApiUserInfoDetail = {url:"https://www.instagram.com/api/v1/users/${@}$/info/",checkKey:"data.status",checkValue:"ok",dataKeys:"data.user.profile_pic_url|data.user.username|data.user.full_name|data.user.follower_count|data.user.following_count|data.user.contact_phone_number|data.user.media_count|data.user.public_phone_country_code|data.user.public_phone_number|data.user.contact_phone_number|data.user.city_name|data.user.address_street|data.user.is_private|data.user.is_verified|data.user.is_business|data.user.external_url|data.user.biography"};
                          if (!s.ApiUserInfoFromName) s.ApiUserInfoFromName = {url:"https://www.instagram.com/api/v1/users/web_profile_info/?username=${username}",checkKey:"data.status",checkValue:"ok",dataKeys:"data.data.user.pk|data.data.user.username|data.data.user.full_name|data.data.user.profile_pic_url"};
                          return e.abrupt("return", s);
                        case 12:
                        case "end":
                          return e.stop();
                      }
                  },
                  e,
                  null,
                  [[1, 8]]
                );
              })
            )();
          },
          loadProfileInfo: function () {
            var t = this, extractionEpoch = t.extractionEpoch;
            if (t.isPaused) return Promise.resolve();
            return Object(l["a"])(
              regeneratorRuntime.mark(function e() {
                var s,
                  a,
                  i,
                  n,
                  o,
                  r,
                  c,
                  l,
                  u,
                  d,
                  p,
                  g,
                  h,
                  f,
                  w,
                  b,
                  C,
                  y,
                  x,
                  k,
                  _,
                  L,
                  I,
                  P,
                  S;
                return regeneratorRuntime.wrap(
                  function (e) {
                    while (1)
                      switch ((e.prev = e.next)) {
                        case 0:
                          return (
                            (t.isNoFollow = !1),
                            (s = {}),
                            (e.prev = 2),
                            (a = t.configs.ApiProfileInfo.url.replace(
                              "${@}$",
                              t.ins
                            )),
                            (e.next = 6),
                            m.a.get(a, { headers: t.configs.CustomHeaders, withCredentials: true })
                          );
                        case 6:
                          if (t.isPaused || extractionEpoch !== t.extractionEpoch) return e.abrupt("return");
                          if (
                            ((i = e.sent),
                            (n = v()(i, t.configs.ApiProfileInfo.checkKey, "")),
                            (o = t.configs.ApiProfileInfo.checkValue),
                            o && (n = n === o),
                            n)
                          ) {
                            for (
                              r = [],
                                c =
                                  t.configs.ApiProfileInfo.dataKeys.split("|"),
                                l = 0;
                              l < c.length;
                              l++
                            )
                              (u = c[l]),
                                (d = v()(i, u, "")),
                                d ? r.push(d) : r.push("");
                            (s = {
                              id: r[0],
                              name: r[1],
                              avatar: r[2],
                              followerCount: r[3] || 0,
                              followingCount: r[4] || 0,
                              is_private: r[5] || !1,
                            }),
                              console.log(s);
                          }
                          e.next = 16;
                          break;
                        case 13:
                          (e.prev = 13),
                            (e.t0 = e["catch"](2));
                          if (t.isExtraction429(e.t0)) { t.pauseExtractionOn429(e.t0, !0); t.autoContinue(); return e.abrupt("return"); }
                          if (t.isFeedbackRequired(e.t0)) { t.pauseExtractionOnFeedbackRequired(e.t0, "loadProfileInfo / primary profile endpoint"); return e.abrupt("return"); }
                          if (t.isPaused || extractionEpoch !== t.extractionEpoch) return e.abrupt("return");
                          
                            console.log(e.t0);
                        case 16:
                          if (t.isPaused || extractionEpoch !== t.extractionEpoch) return e.abrupt("return");
                          if (s.id) {
                            e.next = 31;
                            break;
                          }
                          return (
                            (e.prev = 17),
                            (p = t.configs.ApiProfileInfo2.url.replace(
                              "${@}$",
                              t.ins
                            )),
                            (e.next = 21),
                            m.a.get(p, { headers: t.configs.CustomHeaders, withCredentials: true })
                          );
                        case 21:
                          if (t.isPaused || extractionEpoch !== t.extractionEpoch) return e.abrupt("return");
                          if (
                            ((g = e.sent),
                            (h = v()(
                              g,
                              t.configs.ApiProfileInfo2.checkKey,
                              ""
                            )),
                            (f = t.configs.ApiProfileInfo2.checkValue),
                            f && (h = h === f),
                            h)
                          ) {
                            for (
                              w = [],
                                b =
                                  t.configs.ApiProfileInfo2.dataKeys.split("|"),
                                C = 0;
                              C < b.length;
                              C++
                            )
                              (y = b[C]),
                                (x = v()(g, y, "")),
                                x ? w.push(x) : w.push("");
                            (s = {
                              id: w[0],
                              name: w[1],
                              avatar: w[2],
                              followerCount: w[3] || 0,
                              followingCount: w[4] || 0,
                              is_private: w[5] || !1,
                            }),
                              console.log(s);
                          }
                          e.next = 31;
                          break;
                        case 28:
                          (e.prev = 28),
                            (e.t1 = e["catch"](17));
                          if (t.isExtraction429(e.t1)) { t.pauseExtractionOn429(e.t1, !0); t.autoContinue(); return e.abrupt("return"); }
                          if (t.isFeedbackRequired(e.t1)) { t.pauseExtractionOnFeedbackRequired(e.t1, "loadProfileInfo / secondary profile endpoint"); return e.abrupt("return"); }
                          if (t.isPaused || extractionEpoch !== t.extractionEpoch) return e.abrupt("return");
                          
                            console.log(e.t1);
                        case 31:
                          if (t.isPaused || extractionEpoch !== t.extractionEpoch) return e.abrupt("return");
                          if (s.id) {
                            e.next = 50;
                            break;
                          }
                          return (
                            (e.prev = 32),
                            (k = t.configs.ProfileInfoFromHtml.url.replace(
                              "${@}$",
                              t.ins
                            )),
                            (e.next = 36),
                            m.a.get(k)
                          );
                        case 36:
                          if (t.isPaused || extractionEpoch !== t.extractionEpoch) return e.abrupt("return");
                          (_ = e.sent),
                            (_ = _.data),
                            (s = { name: t.ins, from: "html" }),
                            (L = new RegExp(
                              decodeURIComponent(
                                t.configs.ProfileInfoFromHtml.reg_id
                              )
                            )),
                            (I = _.match(L)),
                            (s.id = (I && I[1]) || ""),
                            (P = new RegExp(
                              decodeURIComponent(
                                t.configs.ProfileInfoFromHtml.reg_avatar
                              )
                            )),
                            (S = _.match(P)),
                            (s.avatar =
                              (S && S[1] && S[1].replace(/\\u0026/g, "&")) ||
                              ""),
                            (e.next = 50);
                          break;
                        case 47:
                          (e.prev = 47),
                            (e.t2 = e["catch"](32));
                          if (t.isExtraction429(e.t2)) { t.pauseExtractionOn429(e.t2, !0); t.autoContinue(); return e.abrupt("return"); }
                          if (t.isFeedbackRequired(e.t2)) { t.pauseExtractionOnFeedbackRequired(e.t2, "loadProfileInfo / profile HTML fallback"); return e.abrupt("return"); }
                          if (t.isPaused || extractionEpoch !== t.extractionEpoch) return e.abrupt("return");
                          
                            console.log(e.t2);
                        case 50:
                          if (t.isPaused || extractionEpoch !== t.extractionEpoch) return e.abrupt("return");
                          return (
                            0 === t.type
                              ? (s.count = s.followerCount)
                              : (s.count = s.followingCount),
                            (t.insUser = s),
                            e.abrupt(
                              "return",
                              new Promise(function (e) {
                                "html" === t.insUser.from
                                  ? ((t.currentFollowCount = 1),
                                    (t.isNoFollow = !1))
                                  : ((t.currentFollowCount =
                                      t.insUser.count || 0),
                                    t.currentFollowCount <= 0 &&
                                      (t.isNoFollow = !0)),
                                  e();
                              })
                            )
                          );
                        case 53:
                        case "end":
                          return e.stop();
                      }
                  },
                  e,
                  null,
                  [
                    [2, 13],
                    [17, 28],
                    [32, 47],
                  ]
                );
              })
            )();
          },
          createIntervalRange: function () {
            var self = this;
            return d.a.storage.local.get(["intervals"]).then(function (saved) {
              var range = window.IGRequestPacing.intervals(saved && saved.intervals, self.type);
              return Object(C["b"])(range[0], range[1]);
            });
          },
          detailRequestDelay: function (seconds) {
            // The last row came from the profile cache (no request): go on. The reader still
            // spaces real requests from the last one any dashboard sent.
            if (this.lastDetailFromCache) return 250;
            var wait = Math.max(10000, Number(seconds) * 1000 || 10000);
            var started = Number(this.lastProfileRequestStartedAt) || 0;
            return started ? Math.max(0, wait - Math.max(0, Date.now() - started)) : wait;
          },
          loadFollowList: function () {
            var t = this, extractionCycle = t.beginExtractionCycle("list");
            if (!extractionCycle) return Promise.resolve();
            return Object(l["a"])(
              regeneratorRuntime.mark(function e() {
                return regeneratorRuntime.wrap(function (e) {
                  while (1)
                    switch ((e.prev = e.next)) {
                      case 0:
                        if (!t.isNoFollow) {
                          e.next = 3;
                          break;
                        }
                        return (t.isLoading = !1), e.abrupt("return");
                      case 3:
                        if (!t.isComplete) {
                          e.next = 6;
                          break;
                        }
                        return (t.isLoading = !1), e.abrupt("return");
                      case 6:
                        if (!t.isPaused) {
                          e.next = 9;
                          break;
                        }
                        return (t.isLoading = !1), e.abrupt("return");
                      case 9:
                        if (t.pageInfo.has_next_page) {
                          e.next = 12;
                          break;
                        }
                        return (t.isLoading = !1), e.abrupt("return");
                      case 12:
                        extractionCycle.scheduled = !0;
                        extractionCycle.waiting = !0;
                        t.listTimer = setTimeout(
                          function () {
                            extractionCycle.waiting = !1;
                            if (!t.isExtractionCycleCurrent(extractionCycle)) return t.finishExtractionCycle("list", extractionCycle);
                            var e = t.followList.filter(function (t) {
                              return !t.loaded;
                            });
                            if (
                              0 === t.skipCount &&
                              t.getListTimes > 5 &&
                              e.length >= 40
                            )
                              t.advanceExtractionCycle("list", extractionCycle, "loadFollowList");
                            else {
                              t.getListTimes++;
                              var s = {};
                              s =
                                0 === t.type
                                  ? t.configs.apiUserForFollowers
                                  : t.configs.apiUserForFollowing;
                              var a = s.url
                                .replace("${userid}", t.insUser.id)
                                .replace("${cursor}", t.pageInfo.end_cursor);
                              if (!t.isExtractionCycleCurrent(extractionCycle)) return t.finishExtractionCycle("list", extractionCycle);
                              m.a
                                .get(a, { headers: t.configs.CustomHeaders })
                                .then(function (e) {
                                  if (!t.isExtractionCycleCurrent(extractionCycle)) return;
                                  var a = v()(e, s.checkKey, ""),
                                    i = s.checkValue;
                                  if ((i && (a = a === i), a)) {
                                    for (
                                      var n = [],
                                        o = s.dataKeys.split("|"),
                                        r = 0;
                                      r < o.length;
                                      r++
                                    ) {
                                      var c = o[r],
                                        l = v()(e, c, "");
                                      l ? n.push(l) : n.push("");
                                    }
                                    t.listCatchTimes = 0;
                                    var u = n[0] || [],
                                      d = {
                                        end_cursor: n[1],
                                        has_next_page: n[2],
                                      };
                                    console.log(
                                      "🚀 "
                                        .concat(
                                          new Date().toLocaleString(),
                                          " loadFollowList ~ load list count "
                                        )
                                        .concat(u.length)
                                    ),
                                      t.insUser.is_private &&
                                        0 === u.length &&
                                        (t.isNoFollow = !0),
                                      t.cursorCountList.some(function (e) {
                                        return (
                                          e.cursor === t.pageInfo.end_cursor
                                        );
                                      }) ||
                                        t.cursorCountList.push({
                                          cursor: t.pageInfo.end_cursor,
                                          count: u.length,
                                        }),
                                      t.skipCount > 0 &&
                                        (u.length > t.skipCount
                                          ? ((u = u.slice(t.skipCount)),
                                            (t.skipCount = 0))
                                          : ((t.skipCount =
                                              t.skipCount - u.length),
                                            (u = []))),
                                      (u = t.dropResumedRows(u, s.itemsDataKeys.split("|")[0]));
                                    var p = s.itemsDataKeys.split("|");
                                    (u = u.map(function (e, s) {
                                      for (
                                        var a = [], i = 0;
                                        i < p.length;
                                        i++
                                      ) {
                                        var n = p[i],
                                          o = v()(e, n, "");
                                        o ? a.push(o) : a.push("");
                                      }
                                      return {
                                        id:
                                          t.lastScrapedCount +
                                          t.followList.length +
                                          s +
                                          1,
                                        userId: a[0],
                                        userName: a[1],
                                        fullName: a[2],
                                        avatar: a[3],
                                        followers: "",
                                        following: "",
                                        email: "",
                                        post: "",
                                        phone: "",
                                        city: "",
                                        address: "",
                                        isPrivate: "",
                                        isVerified: "",
                                        isBusiness: "",
                                        externalUrl: "",
                                        bio: "",
                                        cursor: t.pageInfo.end_cursor,
                                        loaded: !1,
                                      };
                                    })),
                                      (t.pageInfo = d),
                                      u.length > 0 &&
                                        (t.followList = t.followList.concat(u));
                                  } else "string" === typeof e.data && (t.$buefy.notification.open({ indefinite: !0, message: 'Oops! Something went wrong, the task has been suspended, <div style="font-weight:500;">Please sign in to your Instagram account again, then come back and click the "Continue" button to start scraping. <a style="color:#fff810;" target="_blank" href="https://www.instagram.com/">Go to instagram.com</a></div><div style="font-size:12px;font-style:italic;">error: [#30]</div>', position: "is-bottom-right", type: "is-danger", hasIcon: !0 }), (t.isPaused = !0), t.autoContinue());
                                  t.advanceExtractionCycle("list", extractionCycle, "loadFollowList");
                                })
                                .catch(function (e) {
                                  if (!t.isExtractionCycleCurrent(extractionCycle)) {
                                    if (t.isExtraction429(e)) { t.pauseExtractionOn429(e); t.autoContinue(); }
                                    return;
                                  }
                                  return (
                                    console.log(
                                      "🚀 ".concat(
                                        new Date().toLocaleString(),
                                        " loadFollowList ~ error"
                                      ),
                                      e.response
                                    ),
                                    e.response && 302 === e.response.status
                                      ? (t.$buefy.notification.open({
                                          indefinite: !0,
                                          message:
                                            'Oops! Something went wrong, the task has been suspended, <div style="font-weight:500;">Please sign in to your Instagram account again, then come back and click the "Continue" button to start scraping. <a style="color:#fff810;" target="_blank" href="https://www.instagram.com/">Go to instagram.com</a></div><div style="font-size:12px;font-style:italic;">error: [#6] '.concat(
                                              e.message || "",
                                              "</div>"
                                            ),
                                          position: "is-bottom-right",
                                          type: "is-danger",
                                          hasIcon: !0,
                                        }),
                                        (t.isPaused = !0),
                                        void t.autoContinue())
                                      : e.response && 400 === e.response.status
                                      ? (t.$buefy.notification.open({
                                          indefinite: !0,
                                          message:
                                            'Oops! Something went wrong, the task has been suspended, <div style="font-weight:500;">Instagram requires you to do a simple account verification. Please complete it and come back and click the "Continue" button to start scraping. <a style="color:#fff810;" target="_blank" href="https://www.instagram.com/">Go to instagram.com</a></div><div style="font-size:12px;font-style:italic;">error: [#7] '
                                              .concat(e.message || "", " ")
                                              .concat(
                                                String((e.response.data && e.response.data.message) || "").replace(/[<>&"']/g, ""),
                                                "</div>"
                                              ),
                                          position: "is-bottom-right",
                                          type: "is-danger",
                                          hasIcon: !0,
                                        }),
                                        (t.isPaused = !0),
                                        void t.autoContinue())
                                      : e.response && 429 === e.response.status
                                      ? (t.$buefy.notification.open({
                                          indefinite: !0,
                                          message:
                                            'Oops! Something went wrong, the task has been suspended, <div style="font-weight:500;">Instagram returned a real HTTP 429 rate-limit. This build now pauses requests and honors Retry-After; if Instagram does not provide one, it enforces a 60-minute cooldown. Do not repeatedly click Continue during the cooldown. <a style="color:#fff810;" target="_blank" href="https://www.instagram.com/">Go to instagram.com</a></div><div style="font-size:12px;font-style:italic;">error: [#8] '
                                              .concat(e.message || "", " ")
                                              .concat(
                                                String((e.response.data && e.response.data.message) || "").replace(/[<>&"']/g, ""),
                                                "</div>"
                                              ),
                                          position: "is-bottom-right",
                                          type: "is-danger",
                                          hasIcon: !0,
                                        }),
                                        t.pauseExtractionOn429(e),
                                        void t.autoContinue())
                                      : (t.listCatchTimes++,
                                        2 === t.listCatchTimes &&
                                          d.a.tabs.create({
                                            url: "https://www.instagram.com/?_echobot=1&claim=".concat(
                                              encodeURIComponent(
                                                t.configs.ClaimSessionStorageKey
                                              )
                                            ),
                                            active: !1,
                                          }),
                                        void (t.listCatchTimes < 10
                                          ? t.advanceExtractionCycle("list", extractionCycle, "loadFollowList")
                                          : (t.$buefy.notification.open({
                                              indefinite: !0,
                                              message:
                                                'Oops! Something went wrong, the task has been suspended, <div style="font-weight:500;">Please sign in to your Instagram account again, then come back and click the "Continue" button to start scraping. <a style="color:#fff810;" target="_blank" href="https://www.instagram.com/">Go to instagram.com</a></div><div style="font-size:12px;font-style:italic;">error: [#9] '.concat(
                                                  e.message || "",
                                                  "</div>"
                                                ),
                                              position: "is-bottom-right",
                                              type: "is-danger",
                                              hasIcon: !0,
                                            }),
                                            (t.isPaused = !0),
                                            t.autoContinue())))
                                  );
                                })
                                .finally(function () {
                                  t.isLoading = !1;
                                  t.finishExtractionCycle("list", extractionCycle);
                                });
                            }
                          },
                          0 === t.getListTimes
                            ? 1500
                            : t.listCatchTimes > 2
                            ? 3e4
                            : 15e3
                        );
                      case 13:
                      case "end":
                        return e.stop();
                    }
                }, e);
              })
            )().finally(function () {
              if (!extractionCycle.scheduled) t.finishExtractionCycle("list", extractionCycle);
            });
          },
          loadPostsLikeOwnerList: function () {
            var t = this, extractionCycle = t.beginExtractionCycle("list");
            if (!extractionCycle) return Promise.resolve();
            return Object(l["a"])(
              regeneratorRuntime.mark(function e() {
                return regeneratorRuntime.wrap(function (e) {
                  while (1)
                    switch ((e.prev = e.next)) {
                      case 0:
                        if (!t.isComplete) {
                          e.next = 3;
                          break;
                        }
                        return (t.isLoading = !1), e.abrupt("return");
                      case 3:
                        if (!t.isPaused) {
                          e.next = 6;
                          break;
                        }
                        return (t.isLoading = !1), e.abrupt("return");
                      case 6:
                        if (t.pageInfo.has_next_page) {
                          e.next = 9;
                          break;
                        }
                        return (t.isLoading = !1), e.abrupt("return");
                      case 9:
                        extractionCycle.scheduled = !0;
                        extractionCycle.waiting = !0;
                        t.listTimer = setTimeout(
                          function () {
                            extractionCycle.waiting = !1;
                            if (!t.isExtractionCycleCurrent(extractionCycle)) return t.finishExtractionCycle("list", extractionCycle);
                            var e = t.followList.filter(function (t) {
                              return !t.loaded;
                            });
                            if (
                              0 === t.skipCount &&
                              t.getListTimes > 5 &&
                              e.length >= 40
                            )
                              t.advanceExtractionCycle("list", extractionCycle, "loadPostsLikeOwnerList");
                            else {
                              t.getListTimes++,
                                console.log(
                                  "🚀 ".concat(
                                    new Date().toLocaleString(),
                                    " loadPostsLikeOwnerList ~ request"
                                  )
                                );
                              var s = t.configs.apiUserForLike,
                                a = s.url
                                  .replace("${postId}", t.ins)
                                  .replace("${cursor}", t.pageInfo.end_cursor);
                              if (!t.isExtractionCycleCurrent(extractionCycle)) return t.finishExtractionCycle("list", extractionCycle);
                              m.a
                                .get(a, { headers: t.configs.CustomHeaders })
                                .then(function (e) {
                                  if (!t.isExtractionCycleCurrent(extractionCycle)) return;
                                  var a = v()(e, s.noExistCheckKey, ""),
                                    i = s.noExistCheckValue;
                                  if ((i && (a = a === i), !a))
                                    return (
                                      t.$buefy.dialog.confirm({
                                        message:
                                          "This post doesn't seem to exist, please check your input.",
                                        confirmText: "OK",
                                        type: "is-danger",
                                        hasIcon: !0,
                                        canCancel: !1,
                                        onConfirm: function () {
                                          window.close();
                                        },
                                      }),
                                      (t.isPaused = !0),
                                      !1
                                    );
                                  if (!t.listenerUnloaded) {
                                    try {
                                      window.addEventListener(
                                        "beforeunload",
                                        function (e) {
                                          t.updateHistory(),
                                            e.preventDefault(),
                                            (e.returnValue = "");
                                        }
                                      );
                                    } catch (h) {
                                      console.log(h);
                                    }
                                    t.listenerUnloaded = !0;
                                  }
                                  var n = v()(e, s.checkKey, ""),
                                    o = s.checkValue;
                                  if ((o && (n = n === o), n)) {
                                    for (
                                      var r = [],
                                        c = s.dataKeys.split("|"),
                                        l = 0;
                                      l < c.length;
                                      l++
                                    ) {
                                      var u = c[l],
                                        d = v()(e, u, "");
                                      d ? r.push(d) : r.push("");
                                    }
                                    (t.listCatchTimes = 0),
                                      (t.insLike = {
                                        name: t.ins,
                                        count: r[3] || 0,
                                      });
                                    var p = r[0] || [],
                                      m = {
                                        end_cursor: r[1],
                                        has_next_page: r[2],
                                      },
                                      g = s.itemsDataKeys.split("|");
                                    (p = k(p, g[0])),
                                      (p = p.filter(function (e) {
                                        return !t.followList.some(function (t) {
                                          return t.userId === v()(e, g[0], "");
                                        });
                                      })),
                                      console.log(
                                        "🚀 "
                                          .concat(
                                            new Date().toLocaleString(),
                                            " loadPostsLikeOwnerList ~ load list count "
                                          )
                                          .concat(p.length)
                                      ),
                                      t.cursorCountList.some(function (e) {
                                        return (
                                          e.cursor === t.pageInfo.end_cursor
                                        );
                                      }) ||
                                        t.cursorCountList.push({
                                          cursor: t.pageInfo.end_cursor,
                                          count: p.length,
                                        }),
                                      t.skipCount > 0 &&
                                        (p.length > t.skipCount
                                          ? ((p = p.slice(t.skipCount)),
                                            (t.skipCount = 0))
                                          : ((t.skipCount =
                                              t.skipCount - p.length),
                                            (p = []))),
                                      (p = t.dropResumedRows(p, g[0])),
                                      (p = p.map(function (e, s) {
                                        for (
                                          var a = [], i = 0;
                                          i < g.length;
                                          i++
                                        ) {
                                          var n = g[i],
                                            o = v()(e, n, "");
                                          o ? a.push(o) : a.push("");
                                        }
                                        return {
                                          id:
                                            t.lastScrapedCount +
                                            t.followList.length +
                                            s +
                                            1,
                                          userId: a[0],
                                          userName: a[1],
                                          fullName: a[2],
                                          avatar: a[3],
                                          followers: "",
                                          following: "",
                                          email: "",
                                          post: "",
                                          phone: "",
                                          city: "",
                                          address: "",
                                          isPrivate: "",
                                          isVerified: "",
                                          isBusiness: "",
                                          externalUrl: "",
                                          bio: "",
                                          cursor: t.pageInfo.end_cursor,
                                          loaded: !1,
                                        };
                                      })),
                                      (t.pageInfo = m),
                                      p.length > 0 &&
                                        (t.followList = t.followList.concat(p));
                                  } else "string" === typeof e.data && (t.$buefy.notification.open({ indefinite: !0, message: 'Oops! Something went wrong, the task has been suspended, <div style="font-weight:500;">Please sign in to your Instagram account again, then come back and click the "Continue" button to start scraping. <a style="color:#fff810;" target="_blank" href="https://www.instagram.com/">Go to instagram.com</a></div><div style="font-size:12px;font-style:italic;">error: [#10]</div>', position: "is-bottom-right", type: "is-danger", hasIcon: !0 }), (t.isPaused = !0), t.autoContinue());
                                  t.advanceExtractionCycle("list", extractionCycle, "loadPostsLikeOwnerList");
                                })
                                .catch(function (e) {
                                  if (!t.isExtractionCycleCurrent(extractionCycle)) {
                                    if (t.isExtraction429(e)) { t.pauseExtractionOn429(e); t.autoContinue(); }
                                    return;
                                  }
                                  return (
                                    console.log(
                                      "🚀 ".concat(
                                        new Date().toLocaleString(),
                                        " loadPostsLikeOwnerList ~ error"
                                      ),
                                      e.response
                                    ),
                                    e.response && 302 === e.response.status
                                      ? (t.$buefy.notification.open({
                                          indefinite: !0,
                                          message:
                                            'Oops! Something went wrong, the task has been suspended, <div style="font-weight:500;">Please sign in to your Instagram account again, then come back and click the "Continue" button to start scraping. <a style="color:#fff810;" target="_blank" href="https://www.instagram.com/">Go to instagram.com</a></div><div style="font-size:12px;font-style:italic;">error: [#11] '.concat(
                                              e.message || "",
                                              "</div>"
                                            ),
                                          position: "is-bottom-right",
                                          type: "is-danger",
                                          hasIcon: !0,
                                        }),
                                        (t.isPaused = !0),
                                        void t.autoContinue())
                                      : e.response && 400 === e.response.status
                                      ? (t.$buefy.notification.open({
                                          indefinite: !0,
                                          message:
                                            'Oops! Something went wrong, the task has been suspended, <div style="font-weight:500;">Instagram requires you to do a simple account verification. Please complete it and come back and click the "Continue" button to start scraping. <a style="color:#fff810;" target="_blank" href="https://www.instagram.com/">Go to instagram.com</a></div><div style="font-size:12px;font-style:italic;">error: [#12] '
                                              .concat(e.message || "", " ")
                                              .concat(
                                                String((e.response.data && e.response.data.message) || "").replace(/[<>&"']/g, ""),
                                                "</div>"
                                              ),
                                          position: "is-bottom-right",
                                          type: "is-danger",
                                          hasIcon: !0,
                                        }),
                                        (t.isPaused = !0),
                                        void t.autoContinue())
                                      : e.response && 429 === e.response.status
                                      ? (t.$buefy.notification.open({
                                          indefinite: !0,
                                          message:
                                            'Oops! Something went wrong, the task has been suspended, <div style="font-weight:500;">Instagram returned a real HTTP 429 rate-limit. This build now pauses requests and honors Retry-After; if Instagram does not provide one, it enforces a 60-minute cooldown. Do not repeatedly click Continue during the cooldown. <a style="color:#fff810;" target="_blank" href="https://www.instagram.com/">Go to instagram.com</a></div><div style="font-size:12px;font-style:italic;">error: [#13] '
                                              .concat(e.message || "", " ")
                                              .concat(
                                                String((e.response.data && e.response.data.message) || "").replace(/[<>&"']/g, ""),
                                                "</div>"
                                              ),
                                          position: "is-bottom-right",
                                          type: "is-danger",
                                          hasIcon: !0,
                                        }),
                                        t.pauseExtractionOn429(e),
                                        void t.autoContinue())
                                      : (t.listCatchTimes++,
                                        2 === t.listCatchTimes &&
                                          d.a.tabs.create({
                                            url: "https://www.instagram.com/?_echobot=1&claim=".concat(
                                              encodeURIComponent(
                                                t.configs.ClaimSessionStorageKey
                                              )
                                            ),
                                            active: !1,
                                          }),
                                        void (t.listCatchTimes < 10
                                          ? t.advanceExtractionCycle("list", extractionCycle, "loadPostsLikeOwnerList")
                                          : (t.$buefy.notification.open({
                                              indefinite: !0,
                                              message:
                                                'Oops! Something went wrong, the task has been suspended, <div style="font-weight:500;">Please sign in to your Instagram account again, then come back and click the "Continue" button to start scraping. <a style="color:#fff810;" target="_blank" href="https://www.instagram.com/">Go to instagram.com</a></div><div style="font-size:12px;font-style:italic;">error: [#14] '.concat(
                                                  e.message || "",
                                                  "</div>"
                                                ),
                                              position: "is-bottom-right",
                                              type: "is-danger",
                                              hasIcon: !0,
                                            }),
                                            (t.isPaused = !0),
                                            t.autoContinue())))
                                  );
                                })
                                .finally(function () {
                                  t.isLoading = !1;
                                  t.finishExtractionCycle("list", extractionCycle);
                                });
                            }
                          },
                          0 === t.getListTimes
                            ? 1500
                            : t.listCatchTimes > 2
                            ? 3e4
                            : 15e3
                        );
                      case 10:
                      case "end":
                        return e.stop();
                    }
                }, e);
              })
            )().finally(function () {
              if (!extractionCycle.scheduled) t.finishExtractionCycle("list", extractionCycle);
            });
          },
          loadPostsCommentOwnerList: function () {
            var t = this, extractionCycle = t.beginExtractionCycle("list");
            if (!extractionCycle) return Promise.resolve();
            return Object(l["a"])(
              regeneratorRuntime.mark(function e() {
                return regeneratorRuntime.wrap(function (e) {
                  while (1)
                    switch ((e.prev = e.next)) {
                      case 0:
                        if (!t.isComplete) {
                          e.next = 3;
                          break;
                        }
                        return (t.isLoading = !1), e.abrupt("return");
                      case 3:
                        if (!t.isPaused) {
                          e.next = 6;
                          break;
                        }
                        return (t.isLoading = !1), e.abrupt("return");
                      case 6:
                        if (t.pageInfo.has_next_page) {
                          e.next = 9;
                          break;
                        }
                        return (t.isLoading = !1), e.abrupt("return");
                      case 9:
                        extractionCycle.scheduled = !0;
                        extractionCycle.waiting = !0;
                        t.listTimer = setTimeout(
                          function () {
                            extractionCycle.waiting = !1;
                            if (!t.isExtractionCycleCurrent(extractionCycle)) return t.finishExtractionCycle("list", extractionCycle);
                            var e = t.followList.filter(function (t) {
                              return !t.loaded;
                            });
                            if (
                              0 === t.skipCount &&
                              t.getListTimes > 5 &&
                              e.length >= 40
                            )
                              t.advanceExtractionCycle("list", extractionCycle, "loadPostsCommentOwnerList");
                            else {
                              t.getListTimes++;
                              var s = t.configs.apiUserForComment,
                                a = s.url
                                  .replace("${postId}", t.ins)
                                  .replace("${cursor}", t.pageInfo.end_cursor);
                              if (!t.isExtractionCycleCurrent(extractionCycle)) return t.finishExtractionCycle("list", extractionCycle);
                              m.a
                                .get(a, { headers: t.configs.CustomHeaders })
                                .then(function (e) {
                                  if (!t.isExtractionCycleCurrent(extractionCycle)) return;
                                  var a = v()(e, s.noExistCheckKey, ""),
                                    i = s.noExistCheckValue;
                                  if ((i && (a = a === i), !a))
                                    return (
                                      t.$buefy.dialog.confirm({
                                        message:
                                          "This post doesn't seem to exist, please check your input.",
                                        confirmText: "OK",
                                        type: "is-danger",
                                        hasIcon: !0,
                                        canCancel: !1,
                                        onConfirm: function () {
                                          window.close();
                                        },
                                      }),
                                      (t.isPaused = !0),
                                      !1
                                    );
                                  if (!t.listenerUnloaded) {
                                    try {
                                      window.addEventListener(
                                        "beforeunload",
                                        function (e) {
                                          t.updateHistory(),
                                            e.preventDefault(),
                                            (e.returnValue = "");
                                        }
                                      );
                                    } catch (h) {
                                      console.log(h);
                                    }
                                    t.listenerUnloaded = !0;
                                  }
                                  var n = v()(e, s.checkKey, ""),
                                    o = s.checkValue;
                                  if ((o && (n = n === o), n)) {
                                    for (
                                      var r = [],
                                        c = s.dataKeys.split("|"),
                                        l = 0;
                                      l < c.length;
                                      l++
                                    ) {
                                      var u = c[l],
                                        d = v()(e, u, "");
                                      d ? r.push(d) : r.push("");
                                    }
                                    (t.listCatchTimes = 0),
                                      (t.insComment = {
                                        name: t.ins,
                                        count: r[3] || 0,
                                      });
                                    var p = r[0] || [],
                                      // E-mail checks wait for the end of the list: a page without a new
                                      // cursor (missing or repeated) ends it, so they never wait forever.
                                      m = {
                                        end_cursor: r[1],
                                        has_next_page: !!r[2] && !!r[1] && r[1] !== t.pageInfo.end_cursor,
                                      },
                                      g = s.itemsDataKeys.split("|");
                                    // A comment without user.pk: the id may sit in another field of the same item;
                                    // if not, the username is its temporary key. No other request is ever made for it.
                                    p = p.map(function (item) { return t.commenterWithId(item, g[0], g[1]); });
                                    (p = k(p, g[0])),
                                      (p = p.filter(function (e) {
                                        return !t.followList.some(function (t) {
                                          return t.userId === v()(e, g[0], "");
                                        });
                                      })),
                                      console.log(
                                        "🚀 "
                                          .concat(
                                            new Date().toLocaleString(),
                                            " loadPostsCommentOwnerList ~ load list count "
                                          )
                                          .concat(p.length)
                                      ),
                                      t.cursorCountList.some(function (e) {
                                        return (
                                          e.cursor === t.pageInfo.end_cursor
                                        );
                                      }) ||
                                        t.cursorCountList.push({
                                          cursor: t.pageInfo.end_cursor,
                                          count: p.length,
                                        }),
                                      t.skipCount > 0 &&
                                        (p.length > t.skipCount
                                          ? ((p = p.slice(t.skipCount)),
                                            (t.skipCount = 0))
                                          : ((t.skipCount =
                                              t.skipCount - p.length),
                                            (p = []))),
                                      (p = t.dropResumedRows(p, g[0])),
                                      (p = p.map(function (e, s) {
                                        for (
                                          var a = [], i = 0;
                                          i < g.length;
                                          i++
                                        ) {
                                          var n = g[i],
                                            o = v()(e, n, "");
                                          o ? a.push(o) : a.push("");
                                        }
                                        return {
                                          id:
                                            t.lastScrapedCount +
                                            t.followList.length +
                                            s +
                                            1,
                                          userId: a[0],
                                          userName: a[1],
                                          fullName:
                                            v()(e, "user.full_name", "") ||
                                            v()(e, "full_name", "") ||
                                            "",
                                          avatar: a[2],
                                          followers: "",
                                          following: "",
                                          email: "",
                                          post: "",
                                          phone: "",
                                          city: "",
                                          address: "",
                                          isPrivate: "",
                                          isVerified: "",
                                          isBusiness: "",
                                          externalUrl: "",
                                          bio: "",
                                          cursor: t.pageInfo.end_cursor,
                                          loaded: !0,
                                          detailLoaded: !1,
                                        };
                                      })),
                                      (t.pageInfo = m),
                                      (t.queueReady = !0),
                                      p.length > 0 && (t.followList = t.followList.concat(p)),
                                      t.persistExtractRows(),
                                      !t.pageInfo.has_next_page &&
                                        (t.updateHistory(0 === t.followList.length ? { isFromComplete: !0 } : {}),
                                        (document.body.scrollTop = 0),
                                        (document.documentElement.scrollTop = 0),
                                        (t.isLoading = !1),
                                        0 === t.followList.length &&
                                          (t.isComplete = !0));
                                  } else "string" === typeof e.data && (t.$buefy.notification.open({ indefinite: !0, message: 'Oops! Something went wrong, the task has been suspended, <div style="font-weight:500;">Please sign in to your Instagram account again, then come back and click the "Continue" button to start scraping. <a style="color:#fff810;" target="_blank" href="https://www.instagram.com/">Go to instagram.com</a></div><div style="font-size:12px;font-style:italic;">error: [#29]</div>', position: "is-bottom-right", type: "is-danger", hasIcon: !0 }), (t.isPaused = !0), t.autoContinue());
                                  t.advanceExtractionCycle("list", extractionCycle, "loadPostsCommentOwnerList");
                                })
                                .catch(function (e) {
                                  if (!t.isExtractionCycleCurrent(extractionCycle)) {
                                    if (t.isExtraction429(e)) { t.pauseExtractionOn429(e); t.autoContinue(); }
                                    return;
                                  }
                                  return (
                                    console.log(
                                      "🚀 ".concat(
                                        new Date().toLocaleString(),
                                        " loadPostsCommentOwnerList ~ error"
                                      ),
                                      e.response
                                    ),
                                    e.response && 302 === e.response.status
                                      ? (t.$buefy.notification.open({
                                          indefinite: !0,
                                          message:
                                            'Oops! Something went wrong, the task has been suspended, <div style="font-weight:500;">Please sign in to your Instagram account again, then come back and click the "Continue" button to start scraping. <a style="color:#fff810;" target="_blank" href="https://www.instagram.com/">Go to instagram.com</a></div><div style="font-size:12px;font-style:italic;">error: [#15] '.concat(
                                              e.message || "",
                                              "</div>"
                                            ),
                                          position: "is-bottom-right",
                                          type: "is-danger",
                                          hasIcon: !0,
                                        }),
                                        (t.isPaused = !0),
                                        void t.autoContinue())
                                      : e.response && 400 === e.response.status
                                      ? (t.$buefy.notification.open({
                                          indefinite: !0,
                                          message:
                                            'Oops! Something went wrong, the task has been suspended, <div style="font-weight:500;">Instagram requires you to do a simple account verification. Please complete it and come back and click the "Continue" button to start scraping. <a style="color:#fff810;" target="_blank" href="https://www.instagram.com/">Go to instagram.com</a></div><div style="font-size:12px;font-style:italic;">error: [#16] '
                                              .concat(e.message || "", " ")
                                              .concat(
                                                String((e.response.data && e.response.data.message) || "").replace(/[<>&"']/g, ""),
                                                "</div>"
                                              ),
                                          position: "is-bottom-right",
                                          type: "is-danger",
                                          hasIcon: !0,
                                        }),
                                        (t.isPaused = !0),
                                        void t.autoContinue())
                                      : e.response && 429 === e.response.status
                                      ? (t.$buefy.notification.open({
                                          indefinite: !0,
                                          message:
                                            'Oops! Something went wrong, the task has been suspended, <div style="font-weight:500;">Instagram returned a real HTTP 429 rate-limit. This build now pauses requests and honors Retry-After; if Instagram does not provide one, it enforces a 60-minute cooldown. Do not repeatedly click Continue during the cooldown. <a style="color:#fff810;" target="_blank" href="https://www.instagram.com/">Go to instagram.com</a></div><div style="font-size:12px;font-style:italic;">error: [#17] '
                                              .concat(e.message || "", " ")
                                              .concat(
                                                String((e.response.data && e.response.data.message) || "").replace(/[<>&"']/g, ""),
                                                "</div>"
                                              ),
                                          position: "is-bottom-right",
                                          type: "is-danger",
                                          hasIcon: !0,
                                        }),
                                        t.pauseExtractionOn429(e),
                                        void t.autoContinue())
                                      : 4 === t.type
                                      ? (t.manualPause = !0,
                                        t.pauseExtraction(),
                                        t.updateHistory(),
                                        void t.$buefy.notification.open({
                                          indefinite: !0, position: "is-bottom-right", type: "is-danger", hasIcon: !0,
                                          message: "O Instagram recusou a leitura dos comentários (HTTP " + ((e.response && e.response.status) || "falha de rede") + "). A coleta foi pausada sem nova tentativa automática. Confira sua sessão no instagram.com e clique em Continue."
                                        }))
                                      : (t.listCatchTimes++,
                                        2 === t.listCatchTimes &&
                                          d.a.tabs.create({
                                            url: "https://www.instagram.com/?_echobot=1&claim=".concat(
                                              encodeURIComponent(
                                                t.configs.ClaimSessionStorageKey
                                              )
                                            ),
                                            active: !1,
                                          }),
                                        void (t.listCatchTimes < 10
                                          ? t.advanceExtractionCycle("list", extractionCycle, "loadPostsCommentOwnerList")
                                          : (t.$buefy.notification.open({
                                              indefinite: !0,
                                              message:
                                                'Oops! Something went wrong, the task has been suspended, <div style="font-weight:500;">Please sign in to your Instagram account again, then come back and click the "Continue" button to start scraping. <a style="color:#fff810;" target="_blank" href="https://www.instagram.com/">Go to instagram.com</a></div><div style="font-size:12px;font-style:italic;">error: [#18] '.concat(
                                                  e.message || "",
                                                  "</div>"
                                                ),
                                              position: "is-bottom-right",
                                              type: "is-danger",
                                              hasIcon: !0,
                                            }),
                                            (t.isPaused = !0),
                                            t.autoContinue())))
                                  );
                                })
                                .finally(function () {
                                  t.isLoading = !1;
                                  t.finishExtractionCycle("list", extractionCycle);
                                });
                            }
                          },
                          0 === t.getListTimes
                            ? 1500
                            : t.listCatchTimes > 2
                            ? 3e4
                            : 15e3
                        );
                      case 10:
                      case "end":
                        return e.stop();
                    }
                }, e);
              })
            )().finally(function () {
              if (!extractionCycle.scheduled) t.finishExtractionCycle("list", extractionCycle);
            });
          },
          loadHashtagPostsOwnerList: function () {
            var t = this, extractionCycle = t.beginExtractionCycle("list");
            if (!extractionCycle) return Promise.resolve();
            return Object(l["a"])(
              regeneratorRuntime.mark(function e() {
                return regeneratorRuntime.wrap(function (e) {
                  while (1)
                    switch ((e.prev = e.next)) {
                      case 0:
                        if (!t.isComplete) {
                          e.next = 3;
                          break;
                        }
                        return (t.isLoading = !1), e.abrupt("return");
                      case 3:
                        if (!t.isPaused) {
                          e.next = 6;
                          break;
                        }
                        return (t.isLoading = !1), e.abrupt("return");
                      case 6:
                        if (t.pageInfo.has_next_page) {
                          e.next = 9;
                          break;
                        }
                        return (t.isLoading = !1), e.abrupt("return");
                      case 9:
                        extractionCycle.scheduled = !0;
                        extractionCycle.waiting = !0;
                        t.listTimer = setTimeout(
                          function () {
                            extractionCycle.waiting = !1;
                            if (!t.isExtractionCycleCurrent(extractionCycle)) return t.finishExtractionCycle("list", extractionCycle);
                            var e = t.followList.filter(function (t) {
                              return !t.loaded;
                            });
                            if (
                              0 === t.skipCount &&
                              t.getListTimes > 5 &&
                              e.length >= 40
                            )
                              t.advanceExtractionCycle("list", extractionCycle, "loadHashtagPostsOwnerList");
                            else {
                              t.getListTimes++,
                                console.log(
                                  "🚀 ".concat(
                                    new Date().toLocaleString(),
                                    " loadHashtagPostsOwnerList ~ request"
                                  )
                                );
                              var s = t.configs.apiUserForHashTag,
                                a = s.url
                                  .replace("${tagName}", t.ins)
                                  .replace("${cursor}", t.pageInfo.end_cursor);
                              if (!t.isExtractionCycleCurrent(extractionCycle)) return t.finishExtractionCycle("list", extractionCycle);
                              m.a
                                .get(a, { headers: t.configs.CustomHeaders })
                                .then(function (e) {
                                  if (!t.isExtractionCycleCurrent(extractionCycle)) return;
                                  var a = v()(e, s.noExistCheckKey, ""),
                                    i = s.noExistCheckValue;
                                  if ((i && (a = a === i), !a))
                                    return (
                                      t.$buefy.dialog.confirm({
                                        message:
                                          "This hashtag doesn't seem to exist, please check your input.",
                                        confirmText: "OK",
                                        type: "is-danger",
                                        hasIcon: !0,
                                        canCancel: !1,
                                        onConfirm: function () {
                                          window.close();
                                        },
                                      }),
                                      (t.isPaused = !0),
                                      !1
                                    );
                                  if (!t.listenerUnloaded) {
                                    try {
                                      window.addEventListener(
                                        "beforeunload",
                                        function (e) {
                                          t.updateHistory(),
                                            e.preventDefault(),
                                            (e.returnValue = "");
                                        }
                                      );
                                    } catch (h) {
                                      console.log(h);
                                    }
                                    t.listenerUnloaded = !0;
                                  }
                                  var n = v()(e, s.checkKey, ""),
                                    o = s.checkValue;
                                  if ((o && (n = n === o), n)) {
                                    for (
                                      var r = [],
                                        c = s.dataKeys.split("|"),
                                        l = 0;
                                      l < c.length;
                                      l++
                                    ) {
                                      var u = c[l],
                                        d = v()(e, u, "");
                                      d ? r.push(d) : r.push("");
                                    }
                                    (t.listCatchTimes = 0),
                                      (t.insHashtag = {
                                        profile_pic_url: r[3],
                                        name: r[4],
                                        count: r[5],
                                      });
                                    var p = r[0] || [],
                                      m = {
                                        end_cursor: r[1],
                                        has_next_page: r[2],
                                      },
                                      g = s.itemsDataKeys.split("|");
                                    (p = k(p, g[0])),
                                      (p = p.filter(function (e) {
                                        return !t.followList.some(function (t) {
                                          return t.userId === v()(e, g[0], "");
                                        });
                                      })),
                                      console.log(
                                        "🚀 "
                                          .concat(
                                            new Date().toLocaleString(),
                                            " loadHashtagPostsOwnerList ~ load list count "
                                          )
                                          .concat(p.length)
                                      ),
                                      t.cursorCountList.some(function (e) {
                                        return (
                                          e.cursor === t.pageInfo.end_cursor
                                        );
                                      }) ||
                                        t.cursorCountList.push({
                                          cursor: t.pageInfo.end_cursor,
                                          count: p.length,
                                        }),
                                      t.skipCount > 0 &&
                                        (p.length > t.skipCount
                                          ? ((p = p.slice(t.skipCount)),
                                            (t.skipCount = 0))
                                          : ((t.skipCount =
                                              t.skipCount - p.length),
                                            (p = []))),
                                      (p = t.dropResumedRows(p, g[0])),
                                      (p = p.map(function (e, s) {
                                        for (
                                          var a = [], i = 0;
                                          i < g.length;
                                          i++
                                        ) {
                                          var n = g[i],
                                            o = v()(e, n, "");
                                          o ? a.push(o) : a.push("");
                                        }
                                        return {
                                          id:
                                            t.lastScrapedCount +
                                            t.followList.length +
                                            s +
                                            1,
                                          avatar: "",
                                          userId: a[0],
                                          userName: "",
                                          fullName: "",
                                          followers: "",
                                          following: "",
                                          email: "",
                                          post: "",
                                          phone: "",
                                          city: "",
                                          address: "",
                                          isPrivate: "",
                                          isVerified: "",
                                          isBusiness: "",
                                          externalUrl: "",
                                          bio: "",
                                          cursor: t.pageInfo.end_cursor,
                                          loaded: !1,
                                        };
                                      })),
                                      (t.pageInfo = m),
                                      p.length > 0 &&
                                        (t.followList = t.followList.concat(p));
                                  } else "string" === typeof e.data && (t.$buefy.notification.open({ indefinite: !0, message: 'Oops! Something went wrong, the task has been suspended, <div style="font-weight:500;">Please sign in to your Instagram account again, then come back and click the "Continue" button to start scraping. <a style="color:#fff810;" target="_blank" href="https://www.instagram.com/">Go to instagram.com</a></div><div style="font-size:12px;font-style:italic;">error: [#19]</div>', position: "is-bottom-right", type: "is-danger", hasIcon: !0 }), (t.isPaused = !0), t.autoContinue());
                                  t.advanceExtractionCycle("list", extractionCycle, "loadHashtagPostsOwnerList");
                                })
                                .catch(function (e) {
                                  if (!t.isExtractionCycleCurrent(extractionCycle)) {
                                    if (t.isExtraction429(e)) { t.pauseExtractionOn429(e); t.autoContinue(); }
                                    return;
                                  }
                                  return (
                                    console.log(
                                      "🚀 ".concat(
                                        new Date().toLocaleString(),
                                        " loadHashtagPostsOwnerList ~ error"
                                      ),
                                      e.response
                                    ),
                                    e.response && 302 === e.response.status
                                      ? (t.$buefy.notification.open({
                                          indefinite: !0,
                                          message:
                                            'Oops! Something went wrong, the task has been suspended, <div style="font-weight:500;">Please sign in to your Instagram account again, then come back and click the "Continue" button to start scraping. <a style="color:#fff810;" target="_blank" href="https://www.instagram.com/">Go to instagram.com</a></div><div style="font-size:12px;font-style:italic;">error: [#20] '.concat(
                                              e.message || "",
                                              "</div>"
                                            ),
                                          position: "is-bottom-right",
                                          type: "is-danger",
                                          hasIcon: !0,
                                        }),
                                        (t.isPaused = !0),
                                        void t.autoContinue())
                                      : e.response && 400 === e.response.status
                                      ? (t.$buefy.notification.open({
                                          indefinite: !0,
                                          message:
                                            'Oops! Something went wrong, the task has been suspended, <div style="font-weight:500;">Instagram requires you to do a simple account verification. Please complete it and come back and click the "Continue" button to start scraping. <a style="color:#fff810;" target="_blank" href="https://www.instagram.com/">Go to instagram.com</a></div><div style="font-size:12px;font-style:italic;">error: [#21] '
                                              .concat(e.message || "", " ")
                                              .concat(
                                                String((e.response.data && e.response.data.message) || "").replace(/[<>&"']/g, ""),
                                                "</div>"
                                              ),
                                          position: "is-bottom-right",
                                          type: "is-danger",
                                          hasIcon: !0,
                                        }),
                                        (t.isPaused = !0),
                                        void t.autoContinue())
                                      : e.response && 429 === e.response.status
                                      ? (t.$buefy.notification.open({
                                          indefinite: !0,
                                          message:
                                            'Oops! Something went wrong, the task has been suspended, <div style="font-weight:500;">Instagram returned a real HTTP 429 rate-limit. This build now pauses requests and honors Retry-After; if Instagram does not provide one, it enforces a 60-minute cooldown. Do not repeatedly click Continue during the cooldown. <a style="color:#fff810;" target="_blank" href="https://www.instagram.com/">Go to instagram.com</a></div><div style="font-size:12px;font-style:italic;">error: [#22] '
                                              .concat(e.message || "", " ")
                                              .concat(
                                                String((e.response.data && e.response.data.message) || "").replace(/[<>&"']/g, ""),
                                                "</div>"
                                              ),
                                          position: "is-bottom-right",
                                          type: "is-danger",
                                          hasIcon: !0,
                                        }),
                                        t.pauseExtractionOn429(e),
                                        void t.autoContinue())
                                      : (t.listCatchTimes++,
                                        2 === t.listCatchTimes &&
                                          d.a.tabs.create({
                                            url: "https://www.instagram.com/?_echobot=1&claim=".concat(
                                              encodeURIComponent(
                                                t.configs.ClaimSessionStorageKey
                                              )
                                            ),
                                            active: !1,
                                          }),
                                        void (t.listCatchTimes < 10
                                          ? t.advanceExtractionCycle("list", extractionCycle, "loadHashtagPostsOwnerList")
                                          : (t.$buefy.notification.open({
                                              indefinite: !0,
                                              message:
                                                'Oops! Something went wrong, the task has been suspended, <div style="font-weight:500;">Please sign in to your Instagram account again, then come back and click the "Continue" button to start scraping. <a style="color:#fff810;" target="_blank" href="https://www.instagram.com/">Go to instagram.com</a></div><div style="font-size:12px;font-style:italic;">error: [#23] '.concat(
                                                  e.message || "",
                                                  "</div>"
                                                ),
                                              position: "is-bottom-right",
                                              type: "is-danger",
                                              hasIcon: !0,
                                            }),
                                            (t.isPaused = !0),
                                            t.autoContinue())))
                                  );
                                })
                                .finally(function () {
                                  t.isLoading = !1;
                                  t.finishExtractionCycle("list", extractionCycle);
                                });
                            }
                          },
                          0 === t.getListTimes
                            ? 1500
                            : t.listCatchTimes > 2
                            ? 3e4
                            : 15e3
                        );
                      case 10:
                      case "end":
                        return e.stop();
                    }
                }, e);
              })
            )().finally(function () {
              if (!extractionCycle.scheduled) t.finishExtractionCycle("list", extractionCycle);
            });
          },
          loadLocationPostsOwnerList: function () {
            var t = this, extractionCycle = t.beginExtractionCycle("list");
            if (!extractionCycle) return Promise.resolve();
            return Object(l["a"])(
              regeneratorRuntime.mark(function e() {
                return regeneratorRuntime.wrap(function (e) {
                  while (1)
                    switch ((e.prev = e.next)) {
                      case 0:
                        if (!t.isComplete) {
                          e.next = 3;
                          break;
                        }
                        return (t.isLoading = !1), e.abrupt("return");
                      case 3:
                        if (!t.isPaused) {
                          e.next = 6;
                          break;
                        }
                        return (t.isLoading = !1), e.abrupt("return");
                      case 6:
                        if (t.pageInfo.has_next_page) {
                          e.next = 9;
                          break;
                        }
                        return (t.isLoading = !1), e.abrupt("return");
                      case 9:
                        extractionCycle.scheduled = !0;
                        extractionCycle.waiting = !0;
                        t.listTimer = setTimeout(
                          function () {
                            extractionCycle.waiting = !1;
                            if (!t.isExtractionCycleCurrent(extractionCycle)) return t.finishExtractionCycle("list", extractionCycle);
                            var e = t.followList.filter(function (t) {
                              return !t.loaded;
                            });
                            if (
                              0 === t.skipCount &&
                              t.getListTimes > 5 &&
                              e.length >= 40
                            )
                              t.advanceExtractionCycle("list", extractionCycle, "loadLocationPostsOwnerList");
                            else {
                              t.getListTimes++;
                              var s = t.configs.apiUserForLocation,
                                a = s.url
                                  .replace("${locationId}", t.ins)
                                  .replace("${cursor}", t.pageInfo.end_cursor);
                              if (!t.isExtractionCycleCurrent(extractionCycle)) return t.finishExtractionCycle("list", extractionCycle);
                              m.a
                                .get(a, { headers: t.configs.CustomHeaders })
                                .then(function (e) {
                                  if (!t.isExtractionCycleCurrent(extractionCycle)) return;
                                  var a = v()(e, s.noExistCheckKey, ""),
                                    i = s.noExistCheckValue;
                                  if ((i && (a = a === i), !a))
                                    return (
                                      t.$buefy.dialog.confirm({
                                        message:
                                          "This loacation doesn't seem to exist, please check your input.",
                                        confirmText: "OK",
                                        type: "is-danger",
                                        hasIcon: !0,
                                        canCancel: !1,
                                        onConfirm: function () {
                                          window.close();
                                        },
                                      }),
                                      (t.isPaused = !0),
                                      !1
                                    );
                                  if (!t.listenerUnloaded) {
                                    try {
                                      window.addEventListener(
                                        "beforeunload",
                                        function (e) {
                                          t.updateHistory(),
                                            e.preventDefault(),
                                            (e.returnValue = "");
                                        }
                                      );
                                    } catch (h) {
                                      console.log(h);
                                    }
                                    t.listenerUnloaded = !0;
                                  }
                                  var n = v()(e, s.checkKey, ""),
                                    o = s.checkValue;
                                  if ((o && (n = n === o), n)) {
                                    for (
                                      var r = [],
                                        c = s.dataKeys.split("|"),
                                        l = 0;
                                      l < c.length;
                                      l++
                                    ) {
                                      var u = c[l],
                                        d = v()(e, u, "");
                                      d ? r.push(d) : r.push("");
                                    }
                                    (t.listCatchTimes = 0),
                                      (t.insLocation = {
                                        name: r[3],
                                        count: r[4] || 0,
                                      });
                                    var p = r[0] || [],
                                      m = {
                                        end_cursor: r[1],
                                        has_next_page: r[2],
                                      },
                                      g = s.itemsDataKeys.split("|");
                                    (p = k(p, g[0])),
                                      (p = p.filter(function (e) {
                                        return !t.followList.some(function (t) {
                                          return t.userId === v()(e, g[0], "");
                                        });
                                      })),
                                      console.log(
                                        "🚀 "
                                          .concat(
                                            new Date().toLocaleString(),
                                            " loadLocationPostsOwnerList ~ load list count "
                                          )
                                          .concat(p.length)
                                      ),
                                      t.cursorCountList.some(function (e) {
                                        return (
                                          e.cursor === t.pageInfo.end_cursor
                                        );
                                      }) ||
                                        t.cursorCountList.push({
                                          cursor: t.pageInfo.end_cursor,
                                          count: p.length,
                                        }),
                                      t.skipCount > 0 &&
                                        (p.length > t.skipCount
                                          ? ((p = p.slice(t.skipCount)),
                                            (t.skipCount = 0))
                                          : ((t.skipCount =
                                              t.skipCount - p.length),
                                            (p = []))),
                                      (p = t.dropResumedRows(p, g[0])),
                                      (p = p.map(function (e, s) {
                                        for (
                                          var a = [], i = 0;
                                          i < g.length;
                                          i++
                                        ) {
                                          var n = g[i],
                                            o = v()(e, n, "");
                                          o ? a.push(o) : a.push("");
                                        }
                                        return {
                                          id:
                                            t.lastScrapedCount +
                                            t.followList.length +
                                            s +
                                            1,
                                          avatar: "",
                                          userId: a[0],
                                          userName: "",
                                          fullName: "",
                                          followers: "",
                                          following: "",
                                          email: "",
                                          post: "",
                                          phone: "",
                                          city: "",
                                          address: "",
                                          isPrivate: "",
                                          isVerified: "",
                                          isBusiness: "",
                                          externalUrl: "",
                                          bio: "",
                                          cursor: t.pageInfo.end_cursor,
                                          loaded: !1,
                                        };
                                      })),
                                      (t.pageInfo = m),
                                      p.length > 0 &&
                                        (t.followList = t.followList.concat(p));
                                  } else "string" === typeof e.data && (t.$buefy.notification.open({ indefinite: !0, message: 'Oops! Something went wrong, the task has been suspended, <div style="font-weight:500;">Please sign in to your Instagram account again, then come back and click the "Continue" button to start scraping. <a style="color:#fff810;" target="_blank" href="https://www.instagram.com/">Go to instagram.com</a></div><div style="font-size:12px;font-style:italic;">error: [#24]</div>', position: "is-bottom-right", type: "is-danger", hasIcon: !0 }), (t.isPaused = !0), t.autoContinue());
                                  t.advanceExtractionCycle("list", extractionCycle, "loadLocationPostsOwnerList");
                                })
                                .catch(function (e) {
                                  if (!t.isExtractionCycleCurrent(extractionCycle)) {
                                    if (t.isExtraction429(e)) { t.pauseExtractionOn429(e); t.autoContinue(); }
                                    return;
                                  }
                                  return (
                                    console.log(
                                      "🚀 ".concat(
                                        new Date().toLocaleString(),
                                        " loadLocationPostsOwnerList ~ error"
                                      ),
                                      e.response
                                    ),
                                    e.response && 302 === e.response.status
                                      ? (t.$buefy.notification.open({
                                          indefinite: !0,
                                          message:
                                            'Oops! Something went wrong, the task has been suspended, <div style="font-weight:500;">Please sign in to your Instagram account again, then come back and click the "Continue" button to start scraping. <a style="color:#fff810;" target="_blank" href="https://www.instagram.com/">Go to instagram.com</a></div><div style="font-size:12px;font-style:italic;">error: [#25] '.concat(
                                              e.message || "",
                                              "</div>"
                                            ),
                                          position: "is-bottom-right",
                                          type: "is-danger",
                                          hasIcon: !0,
                                        }),
                                        (t.isPaused = !0),
                                        void t.autoContinue())
                                      : e.response && 400 === e.response.status
                                      ? (t.$buefy.notification.open({
                                          indefinite: !0,
                                          message:
                                            'Oops! Something went wrong, the task has been suspended, <div style="font-weight:500;">Instagram requires you to do a simple account verification. Please complete it and come back and click the "Continue" button to start scraping. <a style="color:#fff810;" target="_blank" href="https://www.instagram.com/">Go to instagram.com</a></div><div style="font-size:12px;font-style:italic;">error: [#26] '
                                              .concat(e.message || "", " ")
                                              .concat(
                                                String((e.response.data && e.response.data.message) || "").replace(/[<>&"']/g, ""),
                                                "</div>"
                                              ),
                                          position: "is-bottom-right",
                                          type: "is-danger",
                                          hasIcon: !0,
                                        }),
                                        (t.isPaused = !0),
                                        void t.autoContinue())
                                      : e.response && 429 === e.response.status
                                      ? (t.$buefy.notification.open({
                                          indefinite: !0,
                                          message:
                                            'Oops! Something went wrong, the task has been suspended, <div style="font-weight:500;">Instagram returned a real HTTP 429 rate-limit. This build now pauses requests and honors Retry-After; if Instagram does not provide one, it enforces a 60-minute cooldown. Do not repeatedly click Continue during the cooldown. <a style="color:#fff810;" target="_blank" href="https://www.instagram.com/">Go to instagram.com</a></div><div style="font-size:12px;font-style:italic;">error: [#27] '
                                              .concat(e.message || "", " ")
                                              .concat(
                                                String((e.response.data && e.response.data.message) || "").replace(/[<>&"']/g, ""),
                                                "</div>"
                                              ),
                                          position: "is-bottom-right",
                                          type: "is-danger",
                                          hasIcon: !0,
                                        }),
                                        t.pauseExtractionOn429(e),
                                        void t.autoContinue())
                                      : (t.listCatchTimes++,
                                        2 === t.listCatchTimes &&
                                          d.a.tabs.create({
                                            url: "https://www.instagram.com/?_echobot=1&claim=".concat(
                                              encodeURIComponent(
                                                t.configs.ClaimSessionStorageKey
                                              )
                                            ),
                                            active: !1,
                                          }),
                                        void (t.listCatchTimes < 10
                                          ? t.advanceExtractionCycle("list", extractionCycle, "loadLocationPostsOwnerList")
                                          : (t.$buefy.notification.open({
                                              indefinite: !0,
                                              message:
                                                'Oops! Something went wrong, the task has been suspended, <div style="font-weight:500;">Please sign in to your Instagram account again, then come back and click the "Continue" button to start scraping. <a style="color:#fff810;" target="_blank" href="https://www.instagram.com/">Go to instagram.com</a></div><div style="font-size:12px;font-style:italic;">error: [#28] '.concat(
                                                  e.message || "",
                                                  "</div>"
                                                ),
                                              position: "is-bottom-right",
                                              type: "is-danger",
                                              hasIcon: !0,
                                            }),
                                            (t.isPaused = !0),
                                            t.autoContinue())))
                                  );
                                })
                                .finally(function () {
                                  t.isLoading = !1;
                                  t.finishExtractionCycle("list", extractionCycle);
                                });
                            }
                          },
                          0 === t.getListTimes
                            ? 1500
                            : t.listCatchTimes > 2
                            ? 3e4
                            : 15e3
                        );
                      case 10:
                      case "end":
                        return e.stop();
                    }
                }, e);
              })
            )().finally(function () {
              if (!extractionCycle.scheduled) t.finishExtractionCycle("list", extractionCycle);
            });
          },
          loadUserInfoFromName: function (t) {
            var e = this, extractionEpoch = e.extractionEpoch;
            if (e.isPaused) return Promise.resolve();
            return Object(l["a"])(
              regeneratorRuntime.mark(function s() {
                var a, i, n, o, r, c, l, u, d;
                return regeneratorRuntime.wrap(function (s) {
                  while (1)
                    switch ((s.prev = s.next)) {
                      case 0:
                        return (
                          (a = e.configs.ApiUserInfoFromName.url.replace(
                            "${username}",
                            t
                          )),
                          (s.next = 3),
                          m.a.get(a, { headers: e.configs.CustomHeaders, withCredentials: true })
                        );
                      case 3:
                          if (e.isPaused || extractionEpoch !== e.extractionEpoch) return s.abrupt("return");
                        if (
                          ((i = s.sent),
                          (n = v()(
                            i,
                            e.configs.ApiUserInfoFromName.checkKey,
                            ""
                          )),
                          (o = e.configs.ApiUserInfoFromName.checkValue),
                          o && (n = n === o),
                          !n)
                        ) {
                          s.next = 12;
                          break;
                        }
                        for (
                          r = [],
                            c =
                              e.configs.ApiUserInfoFromName.dataKeys.split("|"),
                            l = 0;
                          l < c.length;
                          l++
                        )
                          (u = c[l]),
                            (d = v()(i, u, "")),
                            d ? r.push(d) : r.push("");
                        return s.abrupt("return", {
                          userId: r[0],
                          userName: r[1],
                          fullName: r[2],
                          avatar: r[3],
                        });
                      case 12:
                        return s.abrupt("return", null);
                      case 13:
                      case "end":
                        return s.stop();
                    }
                }, s);
              })
            )().catch(function (error) {
              if (e.isExtraction429(error)) { e.pauseExtractionOn429(error, !0); e.autoContinue(); }
              else if (e.isFeedbackRequired(error)) { e.pauseExtractionOnFeedbackRequired(error, "loadUserInfoFromName"); }
              throw error;
            });
          },
          detailConfig: function () {
            // Comment answers are rebuilt by toDetailResponse in one fixed layout (data.status + data.user.*), so they
            // are read with that layout and never with a key list the server config could change. Every other mode
            // reads the server's own answer with the server's own check and keys, as it always did.
            return 4 === this.type ? { checkKey: "data.status", checkValue: "ok", dataKeys: "data.user.profile_pic_url|data.user.username|data.user.full_name|data.user.follower_count|data.user.following_count|data.user.contact_phone_number|data.user.media_count|data.user.public_phone_country_code|data.user.public_phone_number|data.user.contact_phone_number|data.user.city_name|data.user.address_street|data.user.is_private|data.user.is_verified|data.user.is_business|data.user.external_url|data.user.biography" } : this.configs.ApiUserInfoDetail;
          },
          requestUserInfoDetail: function (userId) {
            // The one profile-detail request of the extension, for every mode: same URL template
            // (ApiUserInfoDetail), same headers (the session's own csrf/claim) and same credentials.
            return m.a.get(this.configs.ApiUserInfoDetail.url.replace("${@}$", userId), {
              headers: this.configs.CustomHeaders,
              withCredentials: true,
            });
          },
          ensureCommercialReader: function () {
            var t = this;
            if (!t.commercialProfileReader) t.commercialProfileReader = window.IGCommercialProfileReader.create({
              contacts: window.IGPublicContacts,
              storage: d.a.storage.local,
              locks: navigator.locks,
              // The reader never builds its own request: it asks for the shared one above and
              // only normalises the outcome (status, headers, body).
              request: function (userId) {
                // url: the address that really went out, so the validation log never states a route by assumption.
                return t.requestUserInfoDetail(userId).then(function (response) {
                  return { status: response.status || 200, headers: response.headers || {}, data: response.data, url: (response.config && response.config.url) || "" };
                }, function (error) {
                  var failed = error && error.response;
                  if (failed) return { status: failed.status, headers: failed.headers || {}, data: failed.data, url: (failed.config && failed.config.url) || "" };
                  throw error;
                });
              },
              now: Date.now,
              wait: function (delay) { return new Promise(function (resolve) { setTimeout(resolve, delay); }); }
            });
            return t.commercialProfileReader;
          },
          loadUserInfoDetailContact: function (userId, username) {
            var t = this, epoch = t.extractionEpoch, reader = t.ensureCommercialReader();
            t.lastProfileRequestStartedAt = Date.now();
            t.lastDetailFromCache = !1;
            return reader(userId, username, function () {
              return !t.isPaused && t.extractionEpoch === epoch;
            }).then(function (result) {
              t.lastDetailFromCache = !!(result && result.fromCache);
              if (!t.lastDetailFromCache && result && !result.contactSkip && t.contactCardEpoch !== epoch) {
                t.contactCardEpoch = epoch;
                t.refreshCommercialEvidence().then(function () {
                  var entry = (t.contactEvidence || []).filter(function (item) { return item && !item.probe && String(item.userId) === String(result.contactUserId || userId); })[0];
                  if (entry) {
                    t.showValidationCard("found" === result.contactOutcome ? "is-success" : "is-info",
                      t.contactCardText(entry, window.IGPublicContacts.statusText[result.contactOutcome] || result.contactOutcome));
                    t.$buefy.toast.open({ message: "Primeira resposta de perfil recebida: o quadro de validação está no topo da página.", type: "is-info", duration: 6000 });
                  }
                });
              }
              return result;
            });
          },
          applyCommercialEvidence: function (saved) {
            var reader = window.IGCommercialProfileReader;
            saved = saved || {};
            if (Object.prototype.hasOwnProperty.call(saved, reader.cooldownKey) || Object.prototype.hasOwnProperty.call(saved, reader.schemaKey))
              this.storedCooldownUntil = Number(saved[reader.cooldownKey]) || 0;
            if (Number(saved[reader.stateSinceKey])) this.contactStateSince = Number(saved[reader.stateSinceKey]);
            this.contactSchema = reader.readSchema(saved[reader.schemaKey]);
            this.contactEvidence = Array.isArray(saved[reader.evidenceKey]) ? saved[reader.evidenceKey] : [];
            // A profile without an email never closes the queue: only the saved 429 pause does.
            this.commercialBlockReason = "";
            this.commercialContactUnavailable = !1;
          },
          refreshCommercialEvidence: function () {
            var self = this, reader = window.IGCommercialProfileReader;
            return d.a.storage.local.get([reader.cooldownKey, reader.schemaKey, reader.evidenceKey, reader.stateSinceKey]).then(function (saved) {
              self.applyCommercialEvidence(saved);
            }).catch(function (error) {
              console.warn("[IG Extractor] Could not read contact diagnostics", error);
            });
          },
          commercialStatusMessage: function () {
            if (this.retryAfterUntil > this.contactStatusNow) return "Coleta pausada até " + new Date(this.retryAfterUntil).toLocaleString() + " (limite do Instagram). Nenhuma nova tentativa automática.";
            if (this.commercialStartRequired) return "Pronto para coletar o e-mail comercial público. Nada é consultado antes de Iniciar.";
            if (this.isComplete) return "Coleta concluída. Nenhuma consulta em andamento.";
            return this.isPaused ? "Coleta pausada. Nenhuma nova tentativa automática." : "Coleta em andamento: 1 perfil por vez (/users/{id}/info/), intervalo adaptativo, pausa no primeiro 429.";
          },
          notifyCommercialRefusal: function (error) {
            this.$buefy.notification.open({
              indefinite: true, position: "is-bottom-right", type: "is-warning", hasIcon: true,
              message: error.routeRefusing
                ? "Diagnóstico automático: " + error.refusalCount + " recusas seguidas do Instagram e nenhuma resposta de perfil até agora nesta instalação. Pode não ser só ritmo — uma verificação pendente no app (checkpoint) ou a indisponibilidade desta consulta para contas logadas também produzem recusa. A pausa é respeitada e nada é repetido automaticamente; depois dela você pode continuar pelo botão de iniciar/continuar ou validar 1 perfil pendente."
      : "O Instagram recusou esta consulta. A pausa indicada é respeitada e nada é repetido automaticamente; depois dela você pode continuar pelo botão de iniciar/continuar ou validar 1 perfil pendente."
            });
          },
          resumeAfterStateCheck: function () {
            // Re-read the shared pause and the route decision: another dashboard
            // may have saved either one while this page sat paused.
            var t = this, reader = window.IGCommercialProfileReader;
            return d.a.storage.local.get(["ig_contact_cooldown_until", reader.schemaKey, reader.evidenceKey]).then(function (saved) {
              var until = Number(saved.ig_contact_cooldown_until) || 0;
              t.applyCommercialEvidence(saved);
              if (until > +new Date()) t.retryAfterUntil = Math.max(t.retryAfterUntil || 0, until);
              if (t.commercialContactUnavailable || t.retryAfterUntil > +new Date()) {
                t.$buefy.toast.open({ message: t.commercialStatusMessage(), type: "is-warning", duration: 6e3 });
                return;
              }
              t.resumeExtraction();
            }).catch(function (error) {
              // Fail closed: without the saved state no request is started.
              console.warn("[IG Extractor] Could not read the saved pause", error);
              t.$buefy.toast.open({ message: "Não foi possível confirmar a pausa salva. A coleta não foi iniciada; recarregue o dashboard.", type: "is-danger", duration: 8e3 });
            });
          },
          markCommercialFailure: function (index, userId, error) {
            var row = this.followList[index];
            if (!row || row.userId !== userId || row.detailLoaded || !error || error.stopCode === "cancelled") return;
            this.followList.splice(index, 1, Object.assign({}, row, { contactFailure: {
              code: error.stopCode || (this.isExtraction429(error) ? "rate_limit" : "request"),
              status: (error.response && error.response.status) || null,
              at: Date.now()
            } }));
          },
                    commentQueueState: function () {
            var page = this.pageInfo || {};
            return { v: 154, cursor: String(page.end_cursor || ""), hasNext: !!page.has_next_page,
              count: Number(this.insComment && this.insComment.count) || 0, updatedAt: Date.now() };
          },
          saveExtractRows: function () {
            return this.persistExtractRows();
          },
          mergeExtractRows: function (saved, current) {
            // One row per profile (this session's result replaces an older one), and only the
            // published contact field may fill the email column, whatever version saved the row.
            var P = window.IGPublicContacts, own = Object.prototype.hasOwnProperty, byId = {}, byName = {}, merged = [];
            [].concat(saved || [], current || []).forEach(function (row) {
              if (!row || "object" !== typeof row) return;
              var clean = P.commercialRow(row), id = clean.userId ? String(clean.userId) : "",
                name = clean.userName ? String(clean.userName).toLowerCase() : "", at = -1;
              if (id && own.call(byId, id)) at = byId[id];
              else if (name && own.call(byName, name)) {
                var other = merged[byName[name]];
                if (!(id && other && other.userId && String(other.userId) !== id)) at = byName[name];
              }
              if (at < 0) { at = merged.length; merged.push(clean); } else merged[at] = clean;
              if (id) byId[id] = at;
              if (name) byName[name] = at;
            });
            return merged;
          },
          extractRowsLock: function (job) {
            // Every dashboard shares the row index: serialize read-modify-write across tabs.
            return navigator.locks && navigator.locks.request ? navigator.locks.request("ig_extract_rows", job) : job();
          },
          persistExtractRows: function () {
            var self = this, id = self.lastHistoryItem && self.lastHistoryItem.id;
            if (!id) return Promise.resolve();
            var key = "extract_list_".concat(id);
            return Promise.resolve(self.extractRowsLock(function () {
              return d.a.storage.local.get("localStorageExtractKeys").then(function (saved) {
                // Re-read the index so entries and fresher dates written by another dashboard survive.
                var keys = (Array.isArray(saved && saved.localStorageExtractKeys) ? saved.localStorageExtractKeys : [])
                  .filter(function (item) { return item && item.key && item.key !== key; });
                keys.push({ key: key, date: h()().valueOf() });
                self.localStorageExtractKeys = keys;
                var data = { localStorageExtractKeys: keys };
                // Comment mode keeps every listed commenter, checked or not, so an interrupted
                // e-mail check never loses the comment list (resume re-queues the pending ones).
                                data[key] = 4 === self.type
                  ? self.mergeExtractRows((self.lastExtractData || []).concat(self.pendingExtractData || []), self.followList)
                  : self.mergeExtractRows(self.lastExtractData, self.processedList);
                // The queue's list cursor, saved in the same write as its rows.
                if (4 === self.type && self.queueReady) data["extract_queue_".concat(id)] = self.commentQueueState();
                return d.a.storage.local.set(data);
              });
            })).catch(function (error) {
              console.warn("[IG Extractor] Could not save rows", error);
            });
          },
          pruneExtractIndex: function () {
            // Same lock as the saves, so a date refreshed by another dashboard is seen before deleting.
            return this.extractRowsLock(function () {
              return d.a.storage.local.get("localStorageExtractKeys").then(function (saved) {
                var latest = {}, order = [];
                (Array.isArray(saved && saved.localStorageExtractKeys) ? saved.localStorageExtractKeys : []).forEach(function (item) {
                  if (!item || !item.key) return;
                  if (!Object.prototype.hasOwnProperty.call(latest, item.key)) { order.push(item.key); latest[item.key] = item; }
                  else if (Number(item.date) > Number(latest[item.key].date)) latest[item.key] = item;
                });
                var kept = [], expired = [];
                order.forEach(function (k) {
                  (h()(latest[k].date).add(190, "day") >= h()() ? kept : expired).push(latest[k]);
                });
                var done = { localStorageExtractKeys: kept };
                if (!expired.length && kept.length === ((saved && saved.localStorageExtractKeys) || []).length) return done;
                return d.a.storage.local.remove(expired.map(function (item) { return item.key; }).concat(expired.map(function (item) { return String(item.key).replace(/^extract_list_/, "extract_queue_"); }))).then(function () {
                  return d.a.storage.local.set({ localStorageExtractKeys: kept });
                }).then(function () { return done; });
              });
            });
          },
          historyEmailCount: function () {
            // Count the emails really stored for this history: older server counts can include
            // bio emails collected by earlier versions.
            if (this.lastExtractData && this.lastExtractData.length)
              return this.mergeExtractRows(this.lastExtractData, this.processedList).filter(function (row) { return !!row.email; }).length;
            return (Number(this.lastHistoryItem.count) || 0) + this.emailList.length;
          },
                    commenterWithId: function (item, idKey, nameKey) {
            var get = function (path) { return v()(item, path, ""); };
            var current = get(idKey);
            // A numeric id above 2^53 was rounded by JSON.parse (the request would go to another profile): an exact
            // text id of the same commenter replaces it. Without one, it stays as it always was.
            var rounded = "number" === typeof current && !Number.isSafeInteger(current);
            if (current && !rounded) return item;
            var alternate = get("user.pk_id") || get("user.id") || get("user_id") || get("pk_id");
            if (rounded && !("string" === typeof alternate && /^\d+$/.test(alternate))) return item;
            if (!alternate) {
              var name = String(get(nameKey || "user.username") || "").toLowerCase();
              if (!name) return item;
              alternate = "u:" + name;
            }
            var parts = String(idKey).split("."), copy = Object.assign({}, item), node = copy;
            for (var i = 0; i < parts.length - 1; i++) { node[parts[i]] = Object.assign({}, node[parts[i]]); node = node[parts[i]]; }
            node[parts[parts.length - 1]] = String(alternate);
            return copy;
          },
          dropResumedRows: function (items, idKey) {
            // Resume: never list again a profile already stored for this history.
            var done = this.resumedRowIds;
            if (!done || !items || !items.length) return items;
            return items.filter(function (item) {
              var id = v()(item, idKey, "");
              return !id || !Object.prototype.hasOwnProperty.call(done, String(id));
            });
          },
          restoreExtractRows: function (rows, history, queue) {
            // Rows of earlier sessions, cleaned. When they exist they decide what is skipped on
            // resume, because counters saved by older versions are not reliable (Comment mode
            // counted listed commenters as extracted; the DJ filter hid rows from the count).
            var ids = {}, names = {}, comment = 4 === this.type, all = this.mergeExtractRows(rows, []);
            // Comment mode: only an /users/{id}/info/ answer (or an email that really came from the
            // commercial field) is final. Listed-but-unchecked rows, failures and rows answered by an
            // older route wait in the queue and are asked again.
            var isFinal = function (row) {
              if (!row.loaded || false === row.detailLoaded) return false;
              return !comment || !!row.email || "users_info" === row.contactRoute;
            };
            var kept = all.filter(isFinal);
            var waiting = comment ? all.filter(function (row) { return !isFinal(row); }) : [];
            kept.forEach(function (row) {
              if (row.userId) ids[String(row.userId)] = !0;
              if (row.userName) names[String(row.userName).toLowerCase()] = !0;
            });
            this.lastExtractData = kept;
            var saved = comment && queue && 154 === queue.v && "string" === typeof queue.cursor ? queue : null;
            if (saved) {
              // The queue was saved with its list cursor: continue exactly there, with no page re-read.
              this.followList = waiting.map(function (row) {
                return Object.assign({}, row, { loaded: !0, detailLoaded: !1, contactFailure: null, emailStatus: "", email: "" });
              });
              this.pendingExtractData = [];
              this.pageInfo = { end_cursor: saved.cursor, has_next_page: !!saved.hasNext };
              if (saved.count) this.insComment = { name: this.ins, count: saved.count };
              this.skipCount = 0;
              this.loadUserIndex = 0;
              this.queueReady = !0;
              if (!saved.hasNext && !waiting.length) { this.isLoading = !1; this.isComplete = !0; }
            } else this.pendingExtractData = waiting;
            if (kept.length) {
              this.resumedRowIds = ids;
              this.resumedRowNames = names;
              this.skipCount = 0;
            } else if (4 === this.type) {
              // No row stored here for this Comment history. Before PATCHED 15 the server count
              // included commenters that were only listed (a 429 on the first check stored no row),
              // so trusting it would skip people never checked. Only a PATCHED 15+ count is used.
              var version = String((history && history.get && history.get("version")) || ""),
                patched = version.match(/PATCHED (\d+)/);
              if (!patched || Number(patched[1]) < 15) this.skipCount = 0;
            }
          },
          dropResumedNames: function (names) {
            var done = this.resumedRowNames;
            if (!done || !names || !names.length) return names;
            return names.filter(function (name) {
              return !Object.prototype.hasOwnProperty.call(done, String(name).toLowerCase());
            });
          },
          recordDetailRow: function (index, userId, patch) {
            var row = this.followList[index];
            if (!row || String(row.userId) !== String(userId)) return false;
            this.followList.splice(index, 1, Object.assign({}, row, patch, { loaded: !0, contactCheckedAt: Date.now() }));
            this.persistExtractRows();
            return true;
          },
          isExtractionDone: function () {
            var processed = this.processedList.length;
            if (4 === this.type)
              return !this.pageInfo.has_next_page && this.followList.length > 0 &&
                this.followList.every(function (row) { return !!row.detailLoaded; });
            if (6 === this.type) return this.followList.length > 0 && this.followList.length <= processed;
            // List modes: the list said there is no next page and every listed row was handled
            // (an empty list counts as done too).
            return !this.pageInfo.has_next_page && this.followList.length <= processed;
          },
          contactCardText: function (entry, outcomeText) {
            // Names, types and the parser's decision only: never cookies, headers, tokens or the full email.
            var safe = function (v) { return String(v).replace(/[<>&"']/g, ""); };
            var typeOf = { valid: "texto", present: "texto", empty: "vazio", "null": "null", absent: "ausente", invalid: "formato inválido" };
            var field = function (key) { return entry.keys && entry.keys[key] ? (typeOf[entry.keys[key]] || safe(entry.keys[key])) : "-"; };
            var phoneState = function (key) { return entry.phoneKeys && entry.phoneKeys[key] ? (typeOf[entry.phoneKeys[key]] || safe(entry.phoneKeys[key])) : "-"; };
            var phoneWhy = { not_returned: "nenhum campo de telefone na resposta", not_published: "campos de telefone vazios ou ocultos pelo perfil",
              invalid: "há campo de telefone com texto que não é um telefone válido (veja o estado de cada campo)" };
            var parts = [
              "Validação de 1 consulta · @" + safe(entry.username) + (entry.probe ? " · validação manual" : " · 1ª resposta real desta execução"),
              "Versão testada: " + safe(this.version) + " · Modo: Comment",
              "Endpoint: " + (entry.sentRoute ? safe(entry.sentRoute) + " (enviado de fato)" : "GET /api/v1/users/{id}/info/ (rota padrão; a requisição não informou o endereço enviado)") + " · a mesma função dos outros modos",
              "Horário: " + new Date(entry.at).toLocaleString(),
              "HTTP " + (null == entry.http ? "-" : entry.http) + " · Retry-After: " + (429 === entry.http ? safe(entry.retryAfter || "ausente") : "não se aplica")
            ];
            if (entry.keys) {
              parts.push("public_email: " + field("public_email") + " · business_email: " + field("business_email"));
              parts.push("Caminho do campo: " + safe(entry.emailField || "-"));
            }
            if (entry.phoneKeys) {
              parts.push("Telefone — contact_phone_number: " + phoneState("contact_phone_number") + " · public_phone_number: " + phoneState("public_phone_number") +
                " · business_phone_number: " + phoneState("business_phone_number") + " · código do país: " + phoneState("public_phone_country_code"));
            }
            parts.push("Campos de e-mail recebidos (sem valores): " + (Array.isArray(entry.emailPaths) ? (entry.emailPaths.length ? entry.emailPaths.map(safe).join(", ") : "nenhum") : "nenhum corpo JSON"));
            parts.push("Decisão do parser (e-mail): " + safe(entry.decision || entry.outcome || "-") + " — " + safe(outcomeText));
            if (entry.phoneKeys) parts.push("Decisão do parser (telefone): " + (entry.phoneField
              ? "phone_found (" + safe(entry.phoneField) + (entry.phonePublished ? ", campo público do Instagram" : ", texto da bio ou de um link — não é o campo público") + ")"
              : "sem telefone público — " + safe(phoneWhy[entry.phoneStatus] || entry.phoneStatus || "-")));
            if (entry.email) parts.push("E-mail (mascarado): " + safe(entry.email));
            if (entry.phone) parts.push("Telefone (mascarado): " + safe(entry.phone));
            return parts.join("<br>");
          },
          // The board lives inside the panel, under the buttons: it covers no button and stays until it is
          // closed or replaced by the next one. (It used to be an overlay that hid Continue/Export/Copy.)
          showValidationCard: function (type, html) {
            this.validationCard = { type: type, html: html, at: Date.now() };
          },
          closeValidationCard: function () {
            this.validationCard = null;
          },
          plainCardText: function (value) {
            return String(null == value ? "" : value).replace(/[<>&"']/g, "");
          },
          handleContactProbe: function () {
            var t = this, P = window.IGPublicContacts;
            if (t.contactProbeRunning || (!t.isPaused && !t.isComplete) || t.retryAfterUntil > Date.now()) return;
            var row = t.followList.filter(function (item) { return item.loaded && item.detailLoaded === false && !!item.userId; })[0];
            if (!row) {
              t.$buefy.toast.open({ message: "Nenhum perfil pendente para validar.", type: "is-warning" });
              return;
            }
            t.contactProbeRunning = true;
            var startedAt = Date.now();
            var latest = function () {
              return (t.contactEvidence || []).filter(function (item) { return item && item.probe && Number(item.at) >= startedAt; })[0];
            };
            // One request through the same lock, spacing, cooldown and evidence log. The answer is
            // saved by user id, so the queue reuses it and never asks for this profile again.
            t.ensureCommercialReader()(String(row.userId), row.userName, null, { probe: true }).then(function (result) {
              var outcome = result.contactOutcome || "";
              return t.refreshCommercialEvidence().then(function () {
                var entry = latest();
                t.showValidationCard("found" === outcome ? "is-success" : "is-warning",
                  entry ? t.contactCardText(entry, P.statusText[outcome] || outcome) : "Validação concluída: " + t.plainCardText(P.statusText[outcome] || outcome));
              });
            }).catch(function (error) {
              t.refreshCommercialEvidence().then(function () {
                var entry = latest();
                if (error && error.stopCode !== "cooldown") t.showValidationCard("is-warning",
                  entry ? t.contactCardText(entry, error.commercialRequestStopped ? error.message : "falha na consulta") : t.plainCardText((error && error.message) || "falha na consulta"));
              });
              // A refused validation pauses exactly like the queue (429: shared pause, no retry).
              if (t.isExtraction429(error)) t.pauseExtractionOn429(error, false);
              else if (error && error.cooldownUntil) t.retryAfterUntil = Math.max(t.retryAfterUntil || 0, error.cooldownUntil);
              if (error && error.stopCode === "cooldown") t.$buefy.toast.open({ message: error.message, type: "is-warning", duration: 6e3 });
            }).then(function () {
              t.contactProbeRunning = false;
              return t.refreshCommercialEvidence();
            });
          },
          contactDiagnosticSheets: function (rows) {
            var P = window.IGPublicContacts;
            var state = function (row, key) { return row.contactKeys && row.contactKeys[key] ? row.contactKeys[key] : "-"; };
            var phoneState = function (row, key) { return row.phoneKeys && row.phoneKeys[key] ? row.phoneKeys[key] : "-"; };
            var flag = function (row, key) {
              return row.contactFlags && Object.prototype.hasOwnProperty.call(row.contactFlags, key) ? String(row.contactFlags[key]) : "-";
            };
            var columns = [
              { label: "Perfil", value: function (row) { return "@" + row.userName; } },
              { label: "Status do e-mail", value: P.emailStatusText },
              { label: "Tipo de perfil", value: function (row) { return row.contactProfileType || "-"; } },
              { label: "business_email", value: function (row) { return state(row, "business_email"); } },
              { label: "public_email", value: function (row) { return state(row, "public_email"); } },
              { label: "business_phone_number", value: function (row) { return state(row, "business_phone_number"); } },
              { label: "contact_phone_number", value: function (row) { return phoneState(row, "contact_phone_number"); } },
              { label: "public_phone_number", value: function (row) { return phoneState(row, "public_phone_number"); } },
              { label: "public_phone_country_code", value: function (row) { return phoneState(row, "public_phone_country_code"); } },
              { label: "Origem do telefone", value: function (row) { return row.phoneSource ? row.phoneSource + (/^(biography|profile_link)$/.test(row.phoneSource) ? " (texto da bio/link)" : " (campo público)") : "-"; } },
              { label: "Status do telefone", value: function (row) { return row.phoneStatus || "-"; } },
              { label: "should_show_public_contacts", value: function (row) { return flag(row, "should_show_public_contacts"); } },
              { label: "business_contact_method", value: function (row) { return flag(row, "business_contact_method"); } },
              { label: "Consulta", value: function (row) { return row.contactEndpoint || "-"; } },
              { label: "Consultado em", value: function (row) { return row.contactCheckedAt ? new Date(row.contactCheckedAt).toLocaleString() : "-"; } },
              { label: "Falha de acesso", value: function (row) { return P.failureText(row.contactFailure) || "-"; } },
              { label: "Estado do contato", value: P.contactState }
            ];
            var lines = this.contactDiagnosticText.split("\n").map(function (line) { return { line: line }; });
            return [
              { sheet: "Diagnostico contato", columns: columns, content: rows },
              { sheet: "Respostas reais", columns: [{ label: "Diagnóstico das respostas reais do Instagram", value: function (item) { return item.line; } }], content: lines }
            ];
          },
          handleCopyContactDiagnostic: function () {
            var t = this, text = t.contactDiagnosticText;
            var done = function () { t.$buefy.toast.open({ message: "Diagnóstico copiado.", type: "is-success" }); };
            var fallback = function () {
              var area = t.$el.querySelector("textarea.contact-diagnostic");
              if (!area) return;
              area.focus();
              area.select();
              try { if (document.execCommand("copy")) done(); } catch (error) { console.warn("[IG Extractor] Copy failed", error); }
            };
            try { navigator.clipboard.writeText(text).then(done, fallback); } catch (error) { fallback(); }
          },
          loadUserInfoDetail: function () {
            var t = this, extractionCycle = t.beginExtractionCycle("detail");
            if (!extractionCycle) return Promise.resolve();
            return Object(l["a"])(
              regeneratorRuntime.mark(function e() {
                var s, a, i, n;
                return regeneratorRuntime.wrap(
                  function (e) {
                    while (1)
                      switch ((e.prev = e.next)) {
                        case 0:
                          if ((0 !== t.type && 1 !== t.type) || !t.isNoFollow) {
                            e.next = 2;
                            break;
                          }
                          return e.abrupt("return");
                        case 2:
                          if (!t.isPaused) {
                            e.next = 4;
                            break;
                          }
                          return e.abrupt("return");
                        case 4:
                          return (e.next = 6), t.createIntervalRange();
                        case 6:
                          if (!t.isExtractionCycleCurrent(extractionCycle)) return e.abrupt("return");
                          return (s = e.sent), (e.next = 9), t.getInsClaim();
                        case 9:
                          if (!t.isExtractionCycleCurrent(extractionCycle)) return e.abrupt("return");
                          if (6 !== t.type) {
                            e.next = 32;
                            break;
                          }
                          if (0 !== t.followList.length) {
                            e.next = 18;
                            break;
                          }
                          if (
                            (t.skipCount > 0 &&
                              (t.customUserList.length > t.skipCount
                                ? ((t.customUserList = t.customUserList.slice(
                                    t.skipCount
                                  )),
                                  (t.skipCount = 0))
                                : (t.customUserList = [])),
                            (t.customUserList = t.dropResumedNames(t.customUserList)),
                            !(t.customUserList.length > 0))
                          ) {
                            e.next = 16;
                            break;
                          }
                          (t.followList = t.customUserList.map(function (e, s) {
                            return {
                              id:
                                t.lastScrapedCount +
                                t.followList.length +
                                s +
                                1,
                              avatar: "",
                              userId: "",
                              userName: e,
                              fullName: "",
                              followers: "",
                              following: "",
                              email: "",
                              post: "",
                              phone: "",
                              city: "",
                              address: "",
                              isPrivate: "",
                              isVerified: "",
                              isBusiness: "",
                              externalUrl: "",
                              bio: "",
                              cursor:
                                (s + 1) % 50 === 0
                                  ? "".concat(t.ins, "-").concat(s)
                                  : "",
                              loaded: !1,
                            };
                          })),
                            (e.next = 18);
                          break;
                        case 16:
                          if (0 === t.followList.length && !t.isComplete) {
                            t.persistExtractRows();
                            t.updateHistory({ isFromComplete: !0 });
                            t.isComplete = !0;
                          }
                          return console.log("stop"), e.abrupt("return");
                        case 18:
                          return (
                            (extractionCycle.userIndex = t.loadUserIndex),
                            (e.prev = 18),
                            (e.next = 21),
                            t.loadUserInfoFromName(
                              t.followList[extractionCycle.userIndex].userName
                            )
                          );
                        case 21:
                          if (!t.isExtractionCycleCurrent(extractionCycle)) return e.abrupt("return");
                          a = e.sent;
                          // Paused or superseded while the name was resolved: nothing to record.
                          if (void 0 === a) return e.abrupt("return");
                            (i = Object.assign(
                              {},
                              t.followList[extractionCycle.userIndex],
                              a && a.userId
                                ? a
                                : // No profile behind this name: never request /users//info/ with an empty id.
                                  { fullName: "This user may not exist", emailStatus: "profile_unavailable", loaded: !0 }
                            )),
                            t.followList.splice(extractionCycle.userIndex, 1, i),
                            i.loaded && t.persistExtractRows(),
                            (e.next = 31);
                          break;
                        case 26:
                          (e.prev = 26),
                            (e.t0 = e["catch"](18));
                          if (t.isPaused && e.t0 && e.t0.response && e.t0.response.status === 400 && e.t0.response.data && e.t0.response.data.message === "feedback_required") t.isLoading = !1;
                          if (t.isExtraction429(e.t0) || !t.isExtractionCycleCurrent(extractionCycle)) return e.abrupt("return");
                            console.log(e.t0),
                            (n = Object.assign(
                              {},
                              t.followList[extractionCycle.userIndex],
                              e.t0 && e.t0.response && 404 === e.t0.response.status
                                ? {
                                    fullName: "This user may not exist",
                                    emailStatus: "profile_unavailable",
                                    loaded: !0,
                                  }
                                : {
                                    // Not a missing profile (network, server error): keep it retryable on resume.
                                    loaded: !0,
                                    detailLoaded: !1,
                                    contactFailure: {
                                      code: e.t0 && e.t0.response ? "request" : "network",
                                      status: (e.t0 && e.t0.response && e.t0.response.status) || 0,
                                      at: Date.now(),
                                    },
                                  }
                            )),
                            t.followList.splice(extractionCycle.userIndex, 1, n),
                            t.persistExtractRows();
                        case 31:
                          0 === extractionCycle.userIndex && (t.isLoading = !1);
                        case 32:
                          if (!t.isExtractionCycleCurrent(extractionCycle)) return e.abrupt("return");
                          extractionCycle.scheduled = !0;
                          extractionCycle.waiting = !0;
                          t.detailTimer = setTimeout(function () {
                            extractionCycle.waiting = !1;
                            if (!t.isExtractionCycleCurrent(extractionCycle)) return t.finishExtractionCycle("detail", extractionCycle);
                            // Comment mode: list every commenter first (saved as it loads); profile checks
                            // start only when the list is complete, so a 429 on a check never cuts the list.
                            if (4 === t.type && t.pageInfo.has_next_page)
                              return void t.advanceExtractionCycle("detail", extractionCycle, "loadUserInfoDetail");
                            if (t.loadUserIndex >= t.followList.length) {
                              // Every row answered (or was recorded as unavailable/failed) and no page
                              // left: finish instead of looping, even if the queue paused on the last row.
                              if (t.isExtractionDone()) {
                                t.persistExtractRows();
                                t.updateHistory({ isFromComplete: !0 });
                                document.body.scrollTop = 0;
                                document.documentElement.scrollTop = 0;
                                t.isComplete = !0;
                                return t.finishExtractionCycle("detail", extractionCycle);
                              }
                              return (
                                console.log(
                                  "🚀 ".concat(
                                    new Date().toLocaleString(),
                                    " loadUserInfoDetail ~ wait for next round"
                                  )
                                ),
                                void t.advanceExtractionCycle("detail", extractionCycle, "loadUserInfoDetail")
                              );
                            }
                            if (
                              6 === t.type &&
                              t.followList[t.loadUserIndex].loaded
                            ) {
                              if (t.followList.length <= t.processedList.length)
                                return (
                                  t.persistExtractRows(),
                                  t.updateHistory({ isFromComplete: !0 }),
                                  (document.body.scrollTop = 0),
                                  (document.documentElement.scrollTop = 0),
                                  (t.isComplete = !0),
                                  void t.finishExtractionCycle("detail", extractionCycle)
                                );
                              t.loadUserIndex++, t.advanceExtractionCycle("detail", extractionCycle, "loadUserInfoDetail");
                            } else {
                              var detailUserIndex = t.loadUserIndex,
                                detailUserId = t.followList[detailUserIndex].userId;
                              if (!t.isExtractionCycleCurrent(extractionCycle)) return t.finishExtractionCycle("detail", extractionCycle);
                              (4 === t.type
                                ? t.loadUserInfoDetailContact(
                                    detailUserId,
                                    t.followList[detailUserIndex].userName
                                  )
                                : t.requestUserInfoDetail(detailUserId))
                                .then(
                                  (function () {
                                    var e = Object(l["a"])(
                                      regeneratorRuntime.mark(function e(s) {
                                        var a,
                                          i,
                                          n,
                                          c,
                                          l,
                                          u,
                                          p,
                                          g,
                                          f,
                                          w,
                                          y,
                                          x,
                                          k,
                                          _,
                                          L,
                                          I,
                                          P,
                                          S,
                                          T,
                                          U,
                                          H,
                                          z,
                                          O,
                                          E;
                                        return regeneratorRuntime.wrap(
                                          function (e) {
                                            while (1)
                                              switch ((e.prev = e.next)) {
                                                case 0:
                                                  if (!t.isExtractionCycleCurrent(extractionCycle) || !t.followList[detailUserIndex] || t.followList[detailUserIndex].userId !== detailUserId) return e.abrupt("return");
                                                  if (4 === t.type && s && s.contactSkip) {
                                                    // Keep the commenter's own data; nothing from another profile is applied.
                                                    t.followList.splice(detailUserIndex, 1, Object.assign({}, t.followList[detailUserIndex], {
                                                      email: "", emailStatus: s.contactOutcome, emailSource: "", emailKind: "",
                                                      contactParserVersion: 15, contactEndpoint: s.contactEndpoint || "", contactRoute: s.contactRoute || "users_info",
                                                      contactFailure: null, contactCheckedAt: Date.now(), detailLoaded: !0
                                                    }));
                                                    extractionCycle.processedIndex = detailUserIndex;
                                                    t.saveExtractRows();
                                                    t.refreshCommercialEvidence();
                                                    if ("no_user_id" !== s.contactOutcome) t.consecutiveUnavailableProfiles = (t.consecutiveUnavailableProfiles || 0) + 1;
                                                    // A deleted commenter is a row result. Only a long unbroken run suggests a session problem.
                                                    if (t.consecutiveUnavailableProfiles >= 10) {
                                                      t.loadUserIndex = detailUserIndex + 1;
                                                      t.manualPause = !0;
                                                      t.pauseExtraction();
                                                      t.updateHistory();
                                                      t.$buefy.notification.open({
                                                        indefinite: !0, position: "is-bottom-right", type: "is-warning", hasIcon: !0,
                                                        message: "Dez perfis seguidos vieram indisponíveis ou divergentes. A fila foi pausada para você conferir a sessão no instagram.com; depois clique em Continue. Nenhuma nova tentativa automática."
                                                      });
                                                      return e.abrupt("return");
                                                    }
                                                    e.next = 37;
                                                    break;
                                                  }
                                                  // A profile answered: error counters are about consecutive failures.
                                                  t.consecutiveUnavailableProfiles = 0;
                                                  t.detailCatchTimes = 0;
                                                  if (
                                                    ((a = v()(
                                                      s,
                                                      t.detailConfig().checkKey,
                                                      ""
                                                    )),
                                                    (i =
                                                      t.detailConfig().checkValue),
                                                    i && (a = a === i),
                                                    !a)
                                                  ) {
                                                    e.next = 36;
                                                    break;
                                                  }
                                                  for (
                                                    n = [],
                                                      c =
                                                        t.detailConfig().dataKeys.split(
                                                          "|"
                                                        ),
                                                      l = 0;
                                                    l < c.length;
                                                    l++
                                                  )
                                                    (u = c[l]),
                                                      (p = v()(s, u, "")),
                                                      p
                                                        ? n.push(p)
                                                        : n.push("");
                                                  if (
                                                    ((g =
                                                      t.followList[
                                                        detailUserIndex
                                                      ]),
                                                    detailUserIndex > 0 &&
                                                      g.cursor !==
                                                        t.followList[
                                                          detailUserIndex - 1
                                                        ].cursor &&
                                                      ((t.currentCursor =
                                                        g.cursor),
                                                      t.updateHistory({
                                                        isFromCursorChange: !0,
                                                      }),
                                                      t.configs.isPost &&
                                                        t.configs.postUrl))
                                                  )
                                                    try {
                                                      (f = b.a.AES.encrypt(
                                                        JSON.stringify({
                                                          list: t.userList.filter(
                                                            function (e) {
                                                              return (
                                                                t.followList[
                                                                  detailUserIndex -
                                                                    1
                                                                ].cursor ===
                                                                e.cursor
                                                              );
                                                            }
                                                          ),
                                                        }),
                                                        b.a.enc.Utf8.parse(
                                                          t.$config.ENCRYPT_KEY
                                                        ),
                                                        {
                                                          iv: b.a.enc.Utf8.parse(
                                                            "753f8210f5ef6xb2"
                                                          ),
                                                          mode: b.a.mode.CBC,
                                                        }
                                                      )),
                                                        (w =
                                                          f.ciphertext.toString()),
                                                        m.a.post(
                                                          t.configs.postUrl,
                                                          { value: w }
                                                        ).catch(function (error) {
                                                          if (t.isExtraction429(error)) { t.pauseExtractionOn429(error, !0); t.autoContinue(); return; }
                                                          throw error;
                                                        });
                                                    } catch (D) {
                                                      console.log(D);
                                                    }
                                                  // Use the same validated parser for GraphQL and existing detail envelopes.
                                                  var contactProfile = window.IGPublicContacts.profileFromResponse(s, detailUserId, 4 === t.type ? g.userName : "");
                                                  var contacts = s.publicContactResult || window.IGPublicContacts.extract(
                                                    contactProfile || { biography: n[16] || "", external_url: n[15] || "" }
                                                  );
                                                  (x = contacts.email),
                                                    (_ = contacts.phone),
                                                                (g = Object.assign({}, g, {
              userId: 4 === t.type && s.contactUserId ? String(s.contactUserId) : g.userId,
              avatar: g.avatar
                ? g.avatar
                : n[0] || "",
                                                      userName: n[1] || "",
                                                      fullName: n[2] || "",
                                                      followers: n[3] || 0,
                                                      following: n[4] || 0,
                                                      email: x,
                                                      post: n[6] || 0,
                                                      phone: _,
                                                      emailSource: contacts.emailSource,
                                                      phoneSource: contacts.phoneSource,
                                                      emailStatus: contacts.emailStatus,
                                                      phoneStatus: contacts.phoneStatus,
                                                      phonePublished: !!contacts.phonePublished,
                                                      phoneKeys: contacts.phoneKeys || null,
                                                      contactParserVersion: 15, contactEndpoint: s.contactEndpoint || "", contactRoute: s.contactRoute || "users_info",
                                                      emailKind: contacts.emailKind || "",
                                                      contactProfileType: contacts.profileType || "",
                                                      contactKeys: s.contactKeys || null,
                                                      contactFlags: s.contactFlags || null,
                                                      contactFailure: null,
                                                      contactCheckedAt: Date.now(),
                                                      city: n[10] || "",
                                                      address: n[11] || "",
                                                      isPrivate: n[12]
                                                        ? "YES"
                                                        : "NO",
                                                      isVerified: n[13]
                                                        ? "YES"
                                                        : "NO",
                                                      isBusiness: n[14]
                                                        ? "YES"
                                                        : "NO",
                                                      externalUrl: n[15] || "",
                                                      bio: n[16] || "",
                                                      loaded: !0,
                                                      detailLoaded: !0,
                                                      djScore: (typeof window.DJFilter !== "undefined" ? window.DJFilter.score(Object.assign({}, g, {bio: n[16] || "", isVerified: n[13] ? "YES" : "NO", isPrivate: n[12] ? "YES" : "NO", isBusiness: n[14] ? "YES" : "NO", externalUrl: n[15] || "", followers: n[3] || 0})) : 0),
                                                      djClass: (typeof window.DJFilter !== "undefined" ? window.DJFilter.classify(Object.assign({}, g, {bio: n[16] || "", isVerified: n[13] ? "YES" : "NO", followers: n[3] || 0})) : "Unknown"),
                                                      isHotLead: false,
                                                    })),
                                                    (g.isHotLead = g.djScore >= 60),
                                                    t.followList.splice(
                                                      detailUserIndex,
                                                      1,
                                                      g
                                                    );
                                                  extractionCycle.processedIndex = detailUserIndex;
                                                  t.persistExtractRows();
                                                  // A profile without an email is a row result, never a reason to stop the queue.
                                                  if (4 === t.type) t.refreshCommercialEvidence();
                                                  // Email comes exclusively from the published Instagram contact fields.
                                                  if (t.subscription.isPro) {
                                                    e.next = 34;
                                                    break;
                                                  }
                                                  if (
                                                    !(
                                                      g.email &&
                                                      g.email.length > 0
                                                    )
                                                  ) {
                                                    e.next = 33;
                                                    break;
                                                  }
                                                  return (
                                                    (e.next = 29),
                                                    d.a.storage.local.get(
                                                      "localExtractEmailCount"
                                                    )
                                                  );
                                                case 29:
                                                  if (!t.isExtractionCycleCurrent(extractionCycle)) return e.abrupt("return");
                                                  (E = e.sent),
                                                    (t.localExtractEmailCount =
                                                      ((E &&
                                                        E.localExtractEmailCount) ||
                                                        0) + 1),
                                                    d.a.storage.local.set({
                                                      localExtractEmailCount:
                                                        t.localExtractEmailCount,
                                                    }),
                                                    (t.extractEmailCount =
                                                      t.lastTrialCount +
                                                      t.emailList.length);
                                                case 33:
                                                  (t.extractEmailCount >
                                                    t.extractEmailCount ||
                                                    t.localExtractEmailCount >
                                                      t.extractEmailCount) &&
                                                    (t.updateHistory(),
                                                    (document.body.scrollTop = 0),
                                                    (document.documentElement.scrollTop = 0),
                                                    (t.isComplete = !0));
                                                case 34:
                                                  e.next = 37;
                                                  break;
                                                case 36:
                                                  if ("string" === typeof s.data) {
                                                    // Login/HTML page instead of JSON: keep this profile as the next one to retry.
                                                    t.$buefy.notification.open(
                                                      {
                                                        indefinite: !0,
                                                        message:
                                                          'Oops! Something went wrong, the task has been suspended, <div style="font-weight:500;">Please sign in to your Instagram account again, then come back and click the "Continue" button to start scraping. <a style="color:#fff810;" target="_blank" href="https://www.instagram.com/">Go to instagram.com</a></div><div style="font-size:12px;font-style:italic;">error: [#1]</div>',
                                                        position:
                                                          "is-bottom-right",
                                                        type: "is-danger",
                                                        hasIcon: !0,
                                                      }
                                                    );
                                                    t.loadUserIndex = detailUserIndex;
                                                    t.isPaused = !0;
                                                    t.autoContinue();
                                                    return e.abrupt("return");
                                                  }
                                                  // JSON without status "ok": record the failure so the task can still finish.
                                                  t.recordDetailRow(detailUserIndex, detailUserId, {
                                                    detailLoaded: !1,
                                                    contactFailure: { code: "unexpected_response", status: (s && s.status) || 0, at: Date.now() }
                                                  });
                                                case 37:
                                                  if (!t.isComplete) {
                                                    e.next = 39;
                                                    break;
                                                  }
                                                  return e.abrupt("return");
                                                case 39:
                                                  if (
                                                    ((t.claimRefreshCount = (t.claimRefreshCount || 0) + 1) %
                                                        100 ===
                                                        0 &&
                                                      d.a.tabs.create({
                                                        url: "https://www.instagram.com/?_echobot=1&claim=".concat(
                                                          encodeURIComponent(
                                                            t.configs
                                                              .ClaimSessionStorageKey
                                                          )
                                                        ),
                                                        active: !1,
                                                      }),
                                                    !t.isExtractionDone())
                                                  ) {
                                                    e.next = 46;
                                                    break;
                                                  }
                                                  return (
                                                    t.persistExtractRows(),
                                                    t.updateHistory({
                                                      isFromComplete: !0,
                                                    }),
                                                    (document.body.scrollTop = 0),
                                                    (document.documentElement.scrollTop = 0),
                                                    (t.isComplete = !0),
                                                    e.abrupt("return")
                                                  );
                                                case 46:
                                                  (t.loadUserIndex = detailUserIndex + 1),
                                                    t.advanceExtractionCycle("detail", extractionCycle, "loadUserInfoDetail");
                                                case 48:
                                                case "end":
                                                  return e.stop();
                                              }
                                          },
                                          e
                                        );
                                      })
                                    );
                                    return function (t) {
                                      return e.apply(this, arguments);
                                    };
                                  })()
                                )
                                .catch(function (e) {
                                  if (!t.isExtractionCycleCurrent(extractionCycle)) {
                                    if (4 === t.type) {
                                      // Record it and require a fresh click: a resume must not repeat the request.
                                      t.markCommercialFailure(detailUserIndex, detailUserId, e);
                                      t.refreshCommercialEvidence();
                                      if (e && (e.routeRefusing || t.isExtraction429(e))) t.notifyCommercialRefusal(e);
                                      if (t.isExtraction429(e)) t.pauseExtractionOn429(e, true);
                                      else if (e && e.commercialRequestStopped && e.stopCode !== "cancelled") {
                                        if (e.cooldownUntil) t.retryAfterUntil = Math.max(t.retryAfterUntil || 0, e.cooldownUntil);
                                        t.resumeRequested = !1;
                                        t.manualPause = !0;
                                        t.pauseExtraction();
                                        t.$buefy.notification.open({
                                          indefinite: !0, position: "is-bottom-right", type: "is-warning", hasIcon: !0, message: e.message
                                        });
                                      }
                                      t.updateHistory();
                                      return;
                                    }
                                    if (t.isExtraction429(e)) { t.pauseExtractionOn429(e); t.autoContinue(); }
                                    return;
                                  }
                                  if (4 === t.type) {
                                    t.markCommercialFailure(detailUserIndex, detailUserId, e);
                                    t.refreshCommercialEvidence();
                                    if (e && (e.routeRefusing || t.isExtraction429(e))) t.notifyCommercialRefusal(e);
                                    if (t.isExtraction429(e)) t.pauseExtractionOn429(e, true);
                                    else {
                                      if (e.cooldownUntil) t.retryAfterUntil = e.cooldownUntil;
                                      t.manualPause = true;
                                      t.pauseExtraction();
                                      t.$buefy.notification.open({
                                        indefinite: true, message: e.commercialRequestStopped ? e.message : "Não foi possível processar o contato comercial. Coleta pausada, sem nova tentativa automática.",
                                        position: "is-bottom-right", type: "is-warning", hasIcon: true
                                      });
                                    }
                                    t.updateHistory();
                                    return;
                                  }
                                  if (e.profileUnavailable || (e.response && (e.response.status === 401 || e.response.status === 403))) {
                                    t.pauseExtraction();
                                    t.$buefy.notification.open({
                                      indefinite: !0,
                                      message: "Instagram did not make this profile available. Extraction is paused. Check your session on instagram.com before continuing.",
                                      position: "is-bottom-right", type: "is-danger", hasIcon: !0
                                    });
                                    return;
                                  }
                                  if (e && e.response && 404 === e.response.status) {
                                    // Deleted or deactivated account: record it and move on, without retrying it.
                                    var missingRow = t.followList[detailUserIndex] || {};
                                    t.recordDetailRow(detailUserIndex, detailUserId, {
                                      fullName: missingRow.fullName || "This user may not exist",
                                      email: "", emailStatus: "profile_unavailable", contactFailure: null, detailLoaded: !0
                                    });
                                    t.detailCatchTimes = 0;
                                    t.loadUserIndex = detailUserIndex + 1;
                                    t.consecutiveUnavailableProfiles = (t.consecutiveUnavailableProfiles || 0) + 1;
                                    if (t.consecutiveUnavailableProfiles >= 3) {
                                      t.manualPause = !0;
                                      t.pauseExtraction();
                                      t.updateHistory();
                                      t.$buefy.notification.open({
                                        indefinite: !0, position: "is-bottom-right", type: "is-warning", hasIcon: !0,
                                        message: "Três perfis seguidos não foram encontrados pelo Instagram (HTTP 404). A extração foi pausada para você conferir a sessão no instagram.com; depois clique em Continue. Nenhuma nova tentativa automática."
                                      });
                                      return;
                                    }
                                    return void t.advanceExtractionCycle("detail", extractionCycle, "loadUserInfoDetail");
                                  }
                                  return (
                                    console.log(
                                      "🚀 loadUserInfoDetail ~ error",
                                      e
                                    ),
                                    e.response && 302 === e.response.status
                                      ? (t.$buefy.notification.open({
                                          indefinite: !0,
                                          message:
                                            'Oops! Something went wrong, the task has been suspended, <div style="font-weight:500;">Please sign in to your Instagram account again, then come back and click the "Continue" button to start scraping. <a style="color:#fff810;" target="_blank" href="https://www.instagram.com/">Go to instagram.com</a></div><div style="font-size:12px;font-style:italic;">error: [#2] '.concat(
                                              e.message || "",
                                              "</div>"
                                            ),
                                          position: "is-bottom-right",
                                          type: "is-danger",
                                          hasIcon: !0,
                                        }),
                                        (t.isPaused = !0),
                                        void t.autoContinue())
                                      : e.response && 400 === e.response.status
                                      ? (t.$buefy.notification.open({
                                          indefinite: !0,
                                          message:
                                            'Oops! Something went wrong, the task has been suspended, <div style="font-weight:500;">Instagram requires you to do a simple account verification. Please complete it and come back and click the "Continue" button to start scraping. <a style="color:#fff810;" target="_blank" href="https://www.instagram.com/">Go to instagram.com</a></div><div style="font-size:12px;font-style:italic;">error: [#3] '
                                              .concat(e.message || "", " ")
                                              .concat(
                                                String((e.response.data && e.response.data.message) || "").replace(/[<>&"']/g, ""),
                                                "</div>"
                                              ),
                                          position: "is-bottom-right",
                                          type: "is-danger",
                                          hasIcon: !0,
                                        }),
                                        (t.isPaused = !0),
                                        void t.autoContinue())
                                      : e.response && 429 === e.response.status
                                      ? (t.$buefy.notification.open({
                                          indefinite: !0,
                                          message:
                                            'Oops! Something went wrong, the task has been suspended, <div style="font-weight:500;">Instagram returned a real HTTP 429 rate-limit. This build now pauses requests and honors Retry-After; if Instagram does not provide one, it enforces a 60-minute cooldown. Do not repeatedly click Continue during the cooldown. <a style="color:#fff810;" target="_blank" href="https://www.instagram.com/">Go to instagram.com</a></div><div style="font-size:12px;font-style:italic;">error: [#4] '
                                              .concat(e.message || "", " ")
                                              .concat(
                                                String((e.response.data && e.response.data.message) || "").replace(/[<>&"']/g, ""),
                                                "</div>"
                                              ),
                                          position: "is-bottom-right",
                                          type: "is-danger",
                                          hasIcon: !0,
                                        }),
                                        t.pauseExtractionOn429(e),
                                        void t.autoContinue())
                                      : (t.detailCatchTimes++,
                                        2 === t.detailCatchTimes &&
                                          d.a.tabs.create({
                                            url: "https://www.instagram.com/?_echobot=1&claim=".concat(
                                              encodeURIComponent(
                                                t.configs.ClaimSessionStorageKey
                                              )
                                            ),
                                            active: !1,
                                          }),
                                        void (t.detailCatchTimes < 10
                                          ? (t.detailCatchTimes > 1 &&
                                              (t.recordDetailRow(detailUserIndex, detailUserId, {
                                                detailLoaded: !1,
                                                contactFailure: { code: "request", status: (e && e.response && e.response.status) || 0, at: Date.now() }
                                              }),
                                              (t.loadUserIndex = detailUserIndex + 1)),
                                            t.advanceExtractionCycle("detail", extractionCycle, "loadUserInfoDetail"))
                                          : (t.$buefy.notification.open({
                                              indefinite: !0,
                                              message:
                                                'Oops! Something went wrong, the task has been suspended, <div style="font-weight:500;">Please sign in to your Instagram account again, then come back and click the "Continue" button to start scraping. <a style="color:#fff810;" target="_blank" href="https://www.instagram.com/">Go to instagram.com</a></div><div style="font-size:12px;font-style:italic;">error: [#5] '.concat(
                                                  e.message || "",
                                                  "</div>"
                                                ),
                                              position: "is-bottom-right",
                                              type: "is-danger",
                                              hasIcon: !0,
                                            }),
                                            (t.isPaused = !0),
                                            t.autoContinue())))
                                  );
                                }).finally(function () {
                                  t.finishExtractionCycle("detail", extractionCycle);
                                });
                            }
                          }, 4 === t.type ? t.detailRequestDelay(s) : 1e3 * s);
                        case 33:
                        case "end":
                          return e.stop();
                      }
                  },
                  e,
                  null,
                  [[18, 26]]
                );
              })
            )().finally(function () {
              if (!extractionCycle.scheduled) t.finishExtractionCycle("detail", extractionCycle);
            });
          },
          getInsClaim: function () {
            var t = this;
            return Object(l["a"])(
              regeneratorRuntime.mark(function e() {
                var s;
                return regeneratorRuntime.wrap(
                  function (e) {
                    while (1)
                      switch ((e.prev = e.next)) {
                        case 0:
                          return (
                            (e.prev = 0),
                            (e.next = 3),
                            d.a.storage.local.get(["x_ig_www_claim"])
                          );
                        case 3:
                          if (((e.t0 = e.sent), e.t0)) {
                            e.next = 6;
                            break;
                          }
                          e.t0 = {};
                        case 6:
                          (s = e.t0),
                            (t.configs.CustomHeaders[t.configs.ClaimHeaderKey] =
                              s.x_ig_www_claim || ""),
                            (e.next = 13);
                          break;
                        case 10:
                          (e.prev = 10),
                            (e.t1 = e["catch"](0)),
                            console.log("🚀 get x_ig_www_claim error", e.t1);
                        case 13:
                        case "end":
                          return e.stop();
                      }
                  },
                  e,
                  null,
                  [[0, 10]]
                );
              })
            )();
          },
          getInsCsrfToken: function () {
            var t = this, extractionEpoch = t.extractionEpoch;
            if (t.isPaused) return Promise.resolve();
            return Object(l["a"])(
              regeneratorRuntime.mark(function e() {
                var s, a, i, n;
                return regeneratorRuntime.wrap(
                  function (e) {
                    while (1)
                      switch ((e.prev = e.next)) {
                        case 0:
                          return (
                            (e.prev = 0),
                            (e.next = 3),
                            d.a.cookies.get({
                              url: t.configs.InsCsrfTokenFromCookie.url,
                              name: t.configs.InsCsrfTokenFromCookie.cookieKey,
                            })
                          );
                        case 3:
                          if (t.isPaused || extractionEpoch !== t.extractionEpoch) return e.abrupt("return");
                          (s = e.sent),
                            (t.insCsrfToken = s.value),
                            (t.configs.CustomHeaders[t.configs.CsrfHeaderKey] =
                              t.insCsrfToken),
                            (e.next = 11);
                          break;
                        case 8:
                          (e.prev = 8),
                            (e.t0 = e["catch"](0));
                          if (t.isExtraction429(e.t0)) { t.pauseExtractionOn429(e.t0, !0); t.autoContinue(); return e.abrupt("return"); }
                          if (t.isPaused || extractionEpoch !== t.extractionEpoch) return e.abrupt("return");
                          
                            console.log("🚀 get csrfToken error", e.t0);
                        case 11:
                          if (t.isPaused || extractionEpoch !== t.extractionEpoch) return e.abrupt("return");
                          if (t.insCsrfToken) {
                            e.next = 27;
                            break;
                          }
                          return (
                            (e.prev = 12),
                            (e.next = 15),
                            m.a.get(t.configs.InsCsrfTokenFromHtml.url)
                          );
                        case 15:
                          if (t.isPaused || extractionEpoch !== t.extractionEpoch) return e.abrupt("return");
                          (a = e.sent),
                            (a = a.data),
                            (i = new RegExp(
                              decodeURIComponent(
                                t.configs.InsCsrfTokenFromHtml.reg
                              )
                            )),
                            (n = a.match(i)),
                            (t.insCsrfToken = (n && n[1]) || ""),
                            (t.configs.CustomHeaders[t.configs.CsrfHeaderKey] =
                              t.insCsrfToken),
                            console.log("🚀 get csrfToken", t.insCsrfToken),
                            (e.next = 27);
                          break;
                        case 24:
                          (e.prev = 24),
                            (e.t1 = e["catch"](12));
                          if (t.isExtraction429(e.t1)) { t.pauseExtractionOn429(e.t1, !0); t.autoContinue(); return e.abrupt("return"); }
                          if (t.isPaused || extractionEpoch !== t.extractionEpoch) return e.abrupt("return");
                          
                            console.log(e.t1);
                        case 27:
                          if (t.isPaused || extractionEpoch !== t.extractionEpoch) return e.abrupt("return");
                        case "end":
                          return e.stop();
                      }
                  },
                  e,
                  null,
                  [
                    [0, 8],
                    [12, 24],
                  ]
                );
              })
            )();
          },
          getInsUserStatus: function () {
            var t = this, extractionEpoch = t.extractionEpoch;
            if (t.isPaused) return Promise.resolve();
            return Object(l["a"])(
              regeneratorRuntime.mark(function e() {
                var s, a, i, n;
                return regeneratorRuntime.wrap(
                  function (e) {
                    while (1)
                      switch ((e.prev = e.next)) {
                        case 0:
                          return (
                            (e.prev = 0),
                            (e.next = 3),
                            d.a.cookies.get({
                              url: t.configs.InsUserStatusFromCookie.url,
                              name: t.configs.InsUserStatusFromCookie.cookieKey,
                            })
                          );
                        case 3:
                          if (t.isPaused || extractionEpoch !== t.extractionEpoch) return e.abrupt("return");
                          (s = e.sent),
                            (t.insLogged = !!s.value),
                            (e.next = 10);
                          break;
                        case 7:
                          (e.prev = 7),
                            (e.t0 = e["catch"](0));
                          if (t.isExtraction429(e.t0)) { t.pauseExtractionOn429(e.t0, !0); t.autoContinue(); return e.abrupt("return"); }
                          if (t.isPaused || extractionEpoch !== t.extractionEpoch) return e.abrupt("return");
                          
                            console.log("🚀 get csrfToken error", e.t0);
                        case 10:
                          if (t.isPaused || extractionEpoch !== t.extractionEpoch) return e.abrupt("return");
                          if (t.insLogged) {
                            e.next = 24;
                            break;
                          }
                          return (
                            (e.prev = 11),
                            (e.next = 14),
                            m.a.get(t.configs.InsUserStatusFromHtml.url)
                          );
                        case 14:
                          if (t.isPaused || extractionEpoch !== t.extractionEpoch) return e.abrupt("return");
                          (a = e.sent),
                            (a = a.data),
                            (i = new RegExp(
                              decodeURIComponent(
                                t.configs.InsUserStatusFromHtml.reg
                              )
                            )),
                            (n = a.match(i)),
                            n && n[1] && (t.insLogged = !0),
                            (e.next = 24);
                          break;
                        case 21:
                          (e.prev = 21),
                            (e.t1 = e["catch"](11));
                          if (t.isExtraction429(e.t1)) { t.pauseExtractionOn429(e.t1, !0); t.autoContinue(); return e.abrupt("return"); }
                          if (t.isPaused || extractionEpoch !== t.extractionEpoch) return e.abrupt("return");
                          
                            console.log(e.t1);
                        case 24:
                          if (t.isPaused || extractionEpoch !== t.extractionEpoch) return e.abrupt("return");
                        case "end":
                          return e.stop();
                      }
                  },
                  e,
                  null,
                  [
                    [0, 7],
                    [11, 21],
                  ]
                );
              })
            )();
          },
          updateHistory: function () {
            var t = this,
              e =
                arguments.length > 0 && void 0 !== arguments[0]
                  ? arguments[0]
                  : {},
              s = e.isFromComplete,
              a = void 0 !== s && s,
              i = e.isFromExport,
              n = void 0 !== i && i,
              o = e.isFromCursorChange,
              r = void 0 !== o && o;
            if (!n || this.lastHistoryItem.id) {
              var c = 0;
              if (a)
                c = this.lastHistoryItem.scrapedCount + this.processedList.length;
              else {
                var l = 0;
                if (this.loadUserIndex > 0) {
                  var u = this.cursorCountList.findIndex(function (e) {
                    return e.cursor === t.currentCursor;
                  });
                  this.cursorCountList.forEach(function (t, e) {
                    e < u && (l += t.count);
                  });
                }
                c = this.lastHistoryItem.cursorScrapedCount + l;
              }
              var d = this.ins,
                p = {
                  id: this.lastHistoryItem.id || "",
                  token: this.lastHistoryItem.token || "",
                  count: this.historyEmailCount(),
                  lastCursor: this.currentCursor,
                  extractionData: d,
                  extractionType: this.extractionType,
                  itemsCount: 0,
                  scrapedCount:
                    this.lastHistoryItem.scrapedCount + this.processedList.length,
                  cursorScrapedCount: c,
                  version: this.version,
                  isFromComplete: a,
                  isFromExport: n,
                  isFromCursorChange: r,
                };
              switch (this.type) {
                case 0:
                case 1:
                  p.itemsCount = this.insUser.count;
                  break;
                case 2:
                  p.itemsCount = this.insHashtag.count;
                  break;
                case 3:
                  p.itemsCount = this.insLike.count;
                  break;
                case 4:
                  p.itemsCount = this.insComment.count;
                  break;
                case 5:
                  p.itemsCount = this.insLocation.count;
                  break;
                case 6:
                  p.itemsCount = this.followList.length + this.lastScrapedCount;
                  break;
              }
              var m = Object.assign({}, p);
              delete m.token;
              var g = JSON.stringify(m);
              g !== this.lastUpdateHistoryDataStr &&
                ((this.lastUpdateHistoryDataStr = g),
                Object(y["k"])(p)
                  .then(function (e) {
                    console.log("🚀 updateHistoryItem", e),
                      e &&
                        e.id &&
                        t.lastHistoryItem.updateTimes <= e.get("updateTimes") &&
                        (t.lastHistoryItem = Object.assign(
                          {},
                          t.lastHistoryItem,
                          {
                            id: e.id,
                            token: e.get("token"),
                            updateTimes: e.get("updateTimes"),
                          }
                        ));
                  })
                  .catch(function (e) {
                    console.log("🚀 updateHistoryItem error", e),
                      (t.lastUpdateHistoryDataStr = "");
                  }));
            }
          },
          startLoadAllData: function () {
            if (this.isPaused) return;
            this.resumeStartup = !1;
            switch (this.type) {
              case 0:
              case 1:
                this.loadFollowList();
                break;
              case 2:
                this.loadHashtagPostsOwnerList();
                break;
              case 3:
                this.loadPostsLikeOwnerList();
                break;
              case 4:
                // PATCHED 15.4: no ApiUserInfoDetail override. The profile detail of the Comment
                // mode is the same /api/v1/users/${@}$/info/ request as every other mode.
                this.loadPostsCommentOwnerList();
                break;
              case 5:
                this.loadLocationPostsOwnerList();
                break;
              default:
                break;
            }
            this.loadUserInfoDetail();
          },
          startWorking: function () {
            var t = this, extractionOwner = t, extractionCycle = t.beginExtractionCycle("startup");
            if (!extractionCycle) return Promise.resolve();
            return Object(l["a"])(
              regeneratorRuntime.mark(function e() {
                var s, a, i, n, o, r, c, u, p, m, g, f, v, w;
                return regeneratorRuntime.wrap(
                  function (e) {
                    while (1)
                      switch ((e.prev = e.next)) {
                        case 0:
                          return (e.next = 2), t.getUserInfo();
                        case 2:
                          if (!t.isExtractionCycleCurrent(extractionCycle)) return e.abrupt("return", !1);
                          if (((s = e.sent), t.configs.objectId)) {
                            e.next = 7;
                            break;
                          }
                          return (e.next = 6), t.getInsConfigs();
                        case 6:
                          if (!t.isExtractionCycleCurrent(extractionCycle)) return e.abrupt("return", !1);
                          t.configs = e.sent;
                        case 7:
                          if (!s.id) {
                            e.next = 84;
                            break;
                          }
                          return (
                            (e.prev = 8),
                            (e.next = 11),
                            t.pruneExtractIndex()
                          );
                        case 11:
                          if (!t.isExtractionCycleCurrent(extractionCycle)) return e.abrupt("return", !1);
                          if (
                            ((a = e.sent),
                            a &&
                              ((t.localStorageExtractKeys =
                                a.localStorageExtractKeys || []),
                              t.localStorageExtractKeys.length > 0))
                          ) {
                            for (
                              i = t.localStorageExtractKeys.filter(function (
                                t
                              ) {
                                return h()() > h()(t.date).add(190, "day");
                              }),
                                n = 0;
                              n < i.length;
                              n++
                            )
                              (o = i[n]), d.a.storage.local.remove(o.key);
                            t.localStorageExtractKeys =
                              t.localStorageExtractKeys.filter(function (t) {
                                return h()(t.date).add(190, "day") >= h()();
                              });
                          }
                          e.next = 18;
                          break;
                        case 15:
                          (e.prev = 15),
                            (e.t0 = e["catch"](8)),
                            console.log(e.t0);
                        case 18:
                          if (!t.isExtractionCycleCurrent(extractionCycle)) return e.abrupt("return", !1);
                          (t.isLoginModalActive = !1),
                            (t.ins = t.$route.query.ins),
                            (t.type = +t.$route.query.type),
                            (t.historyId = t.$route.query.history || ""),
                            (r = ""),
                            (e.t1 = t.type),
                            (e.next =
                              0 === e.t1
                                ? 26
                                : 1 === e.t1
                                ? 28
                                : 2 === e.t1
                                ? 30
                                : 3 === e.t1
                                ? 32
                                : 4 === e.t1
                                ? 34
                                : 5 === e.t1
                                ? 36
                                : 6 === e.t1
                                ? 38
                                : 40);
                          break;
                        case 26:
                          return (r = "followers"), e.abrupt("break", 40);
                        case 28:
                          return (r = "following"), e.abrupt("break", 40);
                        case 30:
                          return (r = "hashtag"), e.abrupt("break", 40);
                        case 32:
                          return (r = "likes"), e.abrupt("break", 40);
                        case 34:
                          return (r = "comment"), e.abrupt("break", 40);
                        case 36:
                          return (r = "location"), e.abrupt("break", 40);
                        case 38:
                          return (r = "userlist"), e.abrupt("break", 40);
                        case 40:
                          return (
                            (t.extractionType = r),
                            (c = t.ins),
                            (t.trialCount = t.configs.trialCount || 30),
                            (e.prev = 43),
                            (e.next = 46),
                            Object(y["f"])()
                          );
                        case 46:
                          if (!t.isExtractionCycleCurrent(extractionCycle)) return e.abrupt("return", !1);
                          (u = e.sent),
                            u.key
                              ? ((p = u.key),
                                (m = u.value),
                                (g = b.a.AES.decrypt(
                                  m,
                                  b.a.enc.Utf8.parse(t.$config.ENCRYPT_KEY),
                                  {
                                    iv: b.a.enc.Hex.parse(p),
                                    mode: b.a.mode.CBC,
                                    format: b.a.format.Hex,
                                  }
                                ).toString(b.a.enc.Utf8)),
                                (t.subscription = JSON.parse(g)))
                              : (t.subscription = u),
                            (e.next = 53);
                          break;
                        case 50:
                          (e.prev = 50),
                            (e.t2 = e["catch"](43)),
                            console.log(e.t2);
                        case 53:
                          if (!t.isExtractionCycleCurrent(extractionCycle)) return e.abrupt("return", !1);
                          return (e.next = 55), Object(y["g"])();
                        case 55:
                          if (!t.isExtractionCycleCurrent(extractionCycle)) return e.abrupt("return", !1);
                          if (
                            ((t.lastTrialCount = e.sent), t.subscription.isPro)
                          ) {
                            e.next = 61;
                            break;
                          }
                          if (!(t.lastTrialCount > t.lastTrialCount)) {
                            e.next = 61;
                            break;
                          }
                          return (
                            (t.isComplete = !0),
                            (t.isShowProUpgradePop = !0),
                            e.abrupt("return", !1)
                          );
                        case 61:
                          return (e.next = 63), t.getInsUserStatus();
                        case 63:
                          if (!t.isExtractionCycleCurrent(extractionCycle)) return e.abrupt("return", !1);
                          return (
                            t.insLogged ||
                              (t.$buefy.snackbar.open({
                                message:
                                  "Please log in to Instagram and try again.",
                                type: "is-danger",
                                position: "is-top-right",
                                queue: !1,
                                duration: 8e3,
                              }),
                              setTimeout(function () {
                                t.handleGotoIns();
                              }, 3e3)),
                            (e.next = 66),
                            t.getInsCsrfToken()
                          );
                        case 66:
                          if (!t.isExtractionCycleCurrent(extractionCycle)) return e.abrupt("return", !1);
                          return (e.next = 68), t.getInsClaim();
                        case 68:
                          if (!t.isExtractionCycleCurrent(extractionCycle)) return e.abrupt("return", !1);
                          if (0 !== t.type && 1 !== t.type) {
                            e.next = 76;
                            break;
                          }
                          return (e.next = 71), t.loadProfileInfo();
                        case 71:
                          if (!t.isExtractionCycleCurrent(extractionCycle)) return e.abrupt("return", !1);
                          if (t.insUser.id) {
                            e.next = 75;
                            break;
                          }
                          return (
                            t.$buefy.dialog.confirm({
                              message:
                                "This user does not seem to exist, please check your input.",
                              confirmText: "OK",
                              type: "is-danger",
                              hasIcon: !0,
                              canCancel: !1,
                              onConfirm: function () {
                                window.close();
                              },
                            }),
                            (t.isPaused = !0),
                            e.abrupt("return", !1)
                          );
                        case 75:
                          try {
                            window.addEventListener(
                              "beforeunload",
                              function (e) {
                                t.updateHistory(),
                                  e.preventDefault(),
                                  (e.returnValue = "");
                              }
                            );
                          } catch (C) {
                            console.log(C);
                          }
                        case 76:
                          if (!t.isExtractionCycleCurrent(extractionCycle)) return e.abrupt("return", !1);
                          return (
                            (f = (function () {
                              var e = Object(l["a"])(
                                regeneratorRuntime.mark(function e(s) {
                                  var a;
                                  return regeneratorRuntime.wrap(function (e) {
                                    while (1)
                                      switch ((e.prev = e.next)) {
                                        case 0:
                                          extractionCycle.waiting = !1;
                                          if (!t.isExtractionCycleCurrent(extractionCycle)) return e.abrupt("return");
                                          return (
                                            (t.lastHistoryItem = {
                                              id: s.id,
                                              token: s.get("token"),
                                              updateTimes: s.get("updateTimes"),
                                              scrapedCount:
                                                s.get("scrapedCount"),
                                              cursorScrapedCount:
                                                s.get("cursorScrapedCount"),
                                              count: s.get("count"),
                                              customUserList:
                                                s.get("customUserList"),
                                            }),
                                            (t.skipCount = Math.max(
                                              0,
                                              s.get("scrapedCount") -
                                                s.get("cursorScrapedCount") ||
                                              0)),
                                            (t.pageInfo = {
                                              end_cursor: s.get("lastCursor"),
                                              has_next_page: !0,
                                            }),
                                            (t.currentCursor =
                                              s.get("lastCursor")),
                                            (t.isLoading = !0),
                                            (e.next = 7),
                                            d.a.storage.local.get([
                "extract_list_".concat(w.id),
                "extract_queue_".concat(w.id)
              ])
                                          );
                                        case 7:
                                          if (!t.isExtractionCycleCurrent(extractionCycle)) return e.abrupt("return");
                                          (a = e.sent),
                                            t.restoreExtractRows(
                a["extract_list_".concat(w.id)] ||
                [], s, a["extract_queue_".concat(w.id)]),
                                            t.startLoadAllData();
                                        case 10:
                                        case "end":
                                          return e.stop();
                                      }
                                  }, e);
                                })
                              );
                              return function (t) {
                                return e.apply(this, arguments).finally(function () { extractionOwner.finishExtractionCycle("startup", extractionCycle); });
                              };
                            })()),
                            (v = (function () {
                              var e = Object(l["a"])(
                                regeneratorRuntime.mark(function e() {
                                  var s, a, i, n, o;
                                  return regeneratorRuntime.wrap(
                                    function (e) {
                                      while (1)
                                        switch ((e.prev = e.next)) {
                                          case 0:
                                          extractionCycle.waiting = !1;
                                          if (!t.isExtractionCycleCurrent(extractionCycle)) return e.abrupt("return");
                                            return (
                                              (s = ""),
                                              (e.prev = 1),
                                              (e.next = 4),
                                              d.a.storage.local.get([
                                                "sharedData",
                                              ])
                                            );
                                          case 4:
                                            if (!t.isExtractionCycleCurrent(extractionCycle)) return e.abrupt("return");
                                            (a = e.sent),
                                              a &&
                                                a.sharedData &&
                                                a.sharedData.username &&
                                                (s = JSON.stringify(
                                                  a.sharedData
                                                )),
                                              (e.next = 11);
                                            break;
                                          case 8:
                                            (e.prev = 8),
                                              (e.t0 = e["catch"](1)),
                                              console.log(e.t0);
                                          case 11:
                                            if (!t.isExtractionCycleCurrent(extractionCycle)) return e.abrupt("return");
                                            if (
                                              ((i = ""),
                                              "userlist" !== t.extractionType)
                                            ) {
                                              e.next = 17;
                                              break;
                                            }
                                            return (
                                              (e.next = 15),
                                              d.a.storage.local.get(c)
                                            );
                                          case 15:
                                            if (!t.isExtractionCycleCurrent(extractionCycle)) return e.abrupt("return");
                                            (n = e.sent),
                                              n &&
                                                n[c] &&
                                                ((i = n[c]),
                                                d.a.storage.local.remove(c));
                                          case 17:
                                            if (!t.isExtractionCycleCurrent(extractionCycle)) return e.abrupt("return");
                                            return (
                                              (e.next = 19),
                                              Object(y["a"])({
                                                extractionData: c,
                                                extractionType:
                                                  t.extractionType,
                                                isPro: t.subscription.isPro,
                                                sharedData: s,
                                                customUserList: i,
                                              })
                                            );
                                          case 19:
                                            if (!t.isExtractionCycleCurrent(extractionCycle)) return e.abrupt("return");
                                            (o = e.sent),
                                              (t.lastHistoryItem = {
                                                id: o.id,
                                                token: o.get("token"),
                                                updateTimes:
                                                  o.get("updateTimes"),
                                                scrapedCount:
                                                  o.get("scrapedCount"),
                                                cursorScrapedCount:
                                                  o.get("cursorScrapedCount"),
                                                count: o.get("count"),
                                                customUserList:
                                                  o.get("customUserList"),
                                              }),
                                              "userlist" === t.extractionType &&
                                                (t.customUserList = t
                                                  .lastHistoryItem
                                                  .customUserList
                                                  ? t.lastHistoryItem.customUserList.split(
                                                      ","
                                                    )
                                                  : []),
                                              (t.lastScrapedCount = 0),
                                              (t.isLoading = !0),
                                              (t.lastExtractData = []),
                                              (t.pendingExtractData = []),
                                              t.startLoadAllData();
                                          case 26:
                                          case "end":
                                            return e.stop();
                                        }
                                    },
                                    e,
                                    null,
                                    [[1, 8]]
                                  );
                                })
                              );
                              return function () {
                                return e.apply(this, arguments).finally(function () { extractionOwner.finishExtractionCycle("startup", extractionCycle); });
                              };
                            })()),
                            (e.next = 80),
                            Object(y["d"])({
                              extractionData: c,
                              extractionType: t.extractionType,
                              historyId: t.historyId,
                            })
                          );
                        case 80:
                          if (!t.isExtractionCycleCurrent(extractionCycle)) return e.abrupt("return", !1);
                          extractionCycle.scheduled = !0;
                          extractionCycle.waiting = !0;
                          (w = e.sent),
                            w && w.id
                              ? ("userlist" === t.extractionType &&
                                  (t.customUserList = w.get("customUserList")
                                    ? w.get("customUserList").split(",")
                                    : []),
                                (t.lastScrapedCount =
                                  +w.get("scrapedCount") || 0),
                                t.historyId || 0 == t.lastScrapedCount
                                  ? f(w)
                                  : t.$buefy.dialog.confirm({
                                      message:
                                        '<div style="font-size:18px">Last time this task was extract to <strong>'.concat(
                                          t.lastScrapedCount,
                                          "</strong>, continue?</div>"
                                        ),
                                      confirmText: "Continue",
                                      cancelText: "Restart",
                                      canCancel: "button",
                                      type: "is-danger",
                                      hasIcon: !0,
                                      onConfirm: function () {
                                        f(w);
                                      },
                                      onCancel: function () {
                                        v();
                                      },
                                    }))
                              : v(),
                            (e.next = 85);
                          break;
                        case 84:
                          t.isLoginModalActive = !0;
                        case 85:
                        case "end":
                          return e.stop();
                      }
                  },
                  e,
                  null,
                  [
                    [8, 15],
                    [43, 50],
                  ]
                );
              })
            )().finally(function () {
              if (!extractionCycle.scheduled) t.finishExtractionCycle("startup", extractionCycle);
            });
          },
          handleToggleWorkStatus: function () {
            if (!this.isPaused) {
              this.manualPause = !0;
              this.pauseExtraction();
              this.updateHistory();
            } else if (4 === this.type) this.resumeAfterStateCheck();
            else this.resumeExtraction();
          },
          autoContinue: function () {
            var t = this;
            this.autoContinueTimer && clearInterval(this.autoContinueTimer);
            this.autoContinueTimer = null;
            if (this.manualPause || this.type === 4) return;
            console.log("🚀 autoContinue wait");
            var e = +new Date(), hasRetryAfter = this.retryAfterUntil !== null,
              s = hasRetryAfter ? this.retryAfterUntil : e + 9e5;
            this.autoContinueTimer = setInterval(function () {
              var now = +new Date();
              (hasRetryAfter ? now : e) >= s && t.isPaused && !t.manualPause &&
                (console.log("🚀 autoContinue run"), t.resumeExtraction());
              e = now;
            }, 6e4);
          },
          handleDownload: function (t, e) {
            var s =
              arguments.length > 2 && void 0 !== arguments[2]
                ? arguments[2]
                : "xlsx";
            // Sanitize copies so legacy bio/site emails never enter any export.
            e = e.map(window.IGPublicContacts.commercialRow);
            if ("xlsx" === s) {
              var a = [
                  { label: "User Id", value: "userId" },
                  { label: "User Name", value: "userName" },
                  { label: "Full Name", value: "fullName" },
                  { label: "Followers Count", value: "followers" },
                  { label: "Following Count", value: "following" },
                  { label: "Post Count", value: "post" },
                  { label: "E-mail comercial", value: "email" },
                  { label: "Status do e-mail", value: window.IGPublicContacts.emailStatusText },
                  { label: "Public Phone", value: "phone" },
                  { label: "City", value: "city" },
                  { label: "Address", value: "address" },
                  { label: "Is Private", value: "isPrivate" },
                  { label: "Is Verified", value: "isVerified" },
                  { label: "Is Business", value: "isBusiness" },
                  { label: "External Url", value: "externalUrl" },
                  { label: "Biography", value: "bio" },
                  { label: "DJ Score", value: "djScore" },
                  { label: "DJ Type", value: "djClass" },
                  { label: "Hot Lead", value: function(t){ return t.isHotLead ? "YES" : "NO"; } },
                  { label: "Avatar Url", value: "avatar" },
                  {
                    label: "Profile Url",
                    value: function (t) {
                      return "https://www.instagram.com/" + t.userName;
                    },
                  },
                ],
                i = [{ sheet: t, columns: a, content: e }];
              // Comment mode: the contact diagnostics travel with every XLSX export.
              if (4 === this.type) i = i.concat(this.contactDiagnosticSheets(e));
              Object(C["c"])(
                i,
                "IGEmailExtractor-"
                  .concat(t, "-")
                  .concat(e.length, "-")
                  .concat(h()().format("YYYYMMDDHHmmss"))
              );
            } else {
              var n = e.map(function (t) {
                return {
                  "User Id": t.userId + "",
                  "User Name": t.userName + "",
                  "Full Name": t.fullName + "",
                  "Followers Count": t.followers + "",
                  "Following Count": t.following + "",
                  "Post Count": t.post + "",
                  "E-mail comercial": t.email + "",
                  "Status do e-mail": window.IGPublicContacts.emailStatusText(t),
                  "Public Phone": t.phone + "",
                  City: t.city + "",
                  Address: t.address + "",
                  "Is Private": t.isPrivate + "",
                  "Is Verified": t.isVerified + "",
                  "Is Business": t.isBusiness + "",
                  "External Url": t.externalUrl + "",
                  Biography: t.bio + "",
                  "DJ Score": (t.djScore || 0) + "",
                  "DJ Type": (t.djClass || "Unknown") + "",
                  "Hot Lead": t.isHotLead ? "YES" : "NO",
                  "Avatar Url": t.avatar + "",
                  "Profile Url": "https://www.instagram.com/" + t.userName,
                };
              });
              Object(C["a"])(
                n,
                "IGEmailExtractor-"
                  .concat(t, "-")
                  .concat(e.length, "-")
                  .concat(h()().format("YYYYMMDDHHmmss"))
              );
            }
            this.updateHistory({ isFromExport: !0 });
          },
          handleShowProModal: function () {
            this.isProModalActive = !1;
          },
        },
        components: { Pro: x["a"] },
      },
      L = _,
      I = (s("cc10"), s("2877")),
      P = Object(I["a"])(L, i, n, !1, null, null, null),
      S = P.exports,
      T = (s("42e0"), s("8c4f")),
      U = s("ecee"),
      H = s("c074"),
      z = s("ad3d"),
      O = s("289d"),
      E = s("01ea");
    U["c"].add(
      H["y"],
      H["z"],
      H["p"],
      H["k"],
      H["t"],
      H["d"],
      H["c"],
      H["f"],
      H["m"],
      H["D"],
      H["j"],
      H["l"],
      H["x"],
      H["v"],
      H["E"],
      H["h"]
    ),
      a["a"].component("vue-fontawesome", z["a"]),
      a["a"].use(O["a"], {
        defaultIconComponent: "vue-fontawesome",
        defaultIconPack: "fas",
      }),
      (a["a"].prototype.$config = E["a"]);
    var D = [{ path: "/", component: S }];
    a["a"].use(T["a"]);
    var j = new T["a"]({ routes: D });
    new a["a"]({
      el: "#app",
      router: j,
      render: function (t) {
        return t(S);
      },
    });
  },
  cc10: function (t, e, s) {
    "use strict";
    s("3b7b");
  },
});
