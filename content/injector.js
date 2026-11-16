/* Lille content bridge by lilbarro */
(function () {
  "use strict";
  function s() {
    if (typeof window.webpackChunkdiscord_app < "u")
      try {
        let e = null;
        if (
          (window.webpackChunkdiscord_app.push([
            [Symbol("lille")],
            {},
            (t) => {
              e = t;
            },
          ]),
          window.webpackChunkdiscord_app.pop(),
          e && e.c)
        )
          for (const t of Object.values(e.c)) {
            if (!t?.exports) continue;
            const n = [
              t.exports,
              t.exports.default,
              ...Object.values(typeof t.exports == "object" ? t.exports : {}),
            ];
            for (const a of n)
              if (
                !(!a || typeof a != "object") &&
                typeof a.getToken == "function"
              )
                try {
                  const o = a.getToken();
                  if (o && typeof o == "string" && o.length > 30)
                    return { token: o, host: window.location.hostname };
                } catch {}
          }
      } catch {}
    try {
      const e = document.createElement("iframe");
      ((e.style.cssText = "display:none;width:0;height:0;"),
        document.body.appendChild(e));
      const t = e.contentWindow.localStorage.getItem("token");
      if ((e.remove(), t)) {
        const n = t.replace(/^"|"$/g, "");
        if (n && n.length > 30)
          return { token: n, host: window.location.hostname };
      }
    } catch {}
    return null;
  }
  function c(e) {
    window.dispatchEvent(
      new CustomEvent("LILLE_AUTH_RESPONSE", { detail: e }),
    );
  }
  async function r(e) {
    try {
      const t = await fetch(
        `https://${window.location.hostname}/api/v9/users/%40me/badges`,
        {
          headers: {
            authorization: e,
            accept: "*/*",
            "x-debug-options": "bugReporterEnabled",
            "x-discord-locale": "en-US",
          },
        },
      );
      if (t.ok) {
        const n = await t.json();
        return (
          console.log(
            "[Lille Injector] Successfully fetched badges in tab:",
            n,
          ),
          n
        );
      } else
        console.warn(
          "[Lille Injector] /badges in tab returned status:",
          t.status,
        );
    } catch (t) {
      console.warn("[Lille Injector] /badges in tab fetch error:", t);
    }
    return null;
  }
  async function d(e) {
    if (!e || !e.token) {
      c(null);
      return;
    }
    c(e);
    const t = await r(e.token);
    t && c({ ...e, badgeData: t });
  }
  window.addEventListener("LILLE_REQUEST_AUTH", () => {
    d(s());
  });
  function i(e) {
    const t = s();
    t && t.token ? d(t) : e > 0 && setTimeout(() => i(e - 1), 1200);
  }
  document.readyState === "complete"
    ? i(6)
    : window.addEventListener("load", () => i(6), { once: !0 });
})();
