/* Lille content bridge by lilbarro */
(function () {
  "use strict";
  let o = null;
  function u() {
    const t = document.createElement("script");
    ((t.src = chrome.runtime.getURL("content/injector.js")),
      (t.dataset.extensionId = chrome.runtime.id),
      (t.onload = () => t.remove()),
      (document.head || document.documentElement).appendChild(t));
  }
  (document.readyState === "loading"
    ? document.addEventListener("DOMContentLoaded", u, { once: !0 })
    : u(),
    window.addEventListener("LILLE_AUTH_RESPONSE", (t) => {
      const r = t.detail;
      !r ||
        !r.token ||
        ((o = r),
        chrome.storage.local.set({ lille_auth: r }),
        console.log(
          "[Lille Content] Received auth broadcast, hasBadgeData =",
          !!r.badgeData,
        ));
    }),
    chrome.runtime.onMessage.addListener((t, r, n) => {
      if (t.type === "LILLE_GET_BADGES") {
        const i = t.token || (o && o.token);
        if (!i) {
          n({ ok: !1, error: "No token" });
          return;
        }
        return (
          fetch(
            `https://${window.location.hostname}/api/v9/users/%40me/badges`,
            {
              headers: {
                authorization: i,
                accept: "*/*",
                "x-debug-options": "bugReporterEnabled",
                "x-discord-locale": "en-US",
              },
            },
          )
            .then((e) => e.json())
            .then((e) => n({ ok: !0, data: e }))
            .catch((e) => n({ ok: !1, error: e.message })),
          !0
        );
      }
      if (t.type !== "LILLE_EXTRACT") return;
      const c = setTimeout(() => {
        o && o.token ? n({ ok: !0, auth: o }) : n({ ok: !1, error: "timeout" });
      }, 4e3);
      let a = !1;
      const d = (i) => {
        const e = i.detail;
        e &&
          e.token &&
          ((o = e),
          chrome.storage.local.set({ lille_auth: e }),
          e.badgeData &&
            !a &&
            ((a = !0),
            clearTimeout(c),
            window.removeEventListener("LILLE_AUTH_RESPONSE", d),
            n({ ok: !0, auth: e })));
      };
      return (
        window.addEventListener("LILLE_AUTH_RESPONSE", d),
        window.dispatchEvent(new CustomEvent("LILLE_REQUEST_AUTH")),
        setTimeout(() => {
          !a &&
            o &&
            o.token &&
            ((a = !0),
            clearTimeout(c),
            window.removeEventListener("LILLE_AUTH_RESPONSE", d),
            n({ ok: !0, auth: o }));
        }, 1200),
        !0
      );
    }));
})();
