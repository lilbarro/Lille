/* Lille popup by lilbarro — v1.2.0 */
(function () {
  "use strict";
  const v = {
      check:
        '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 32 32"><title>check-mark</title><path fill="currentColor" fill-rule="evenodd" d="M28.928 10.3a3.25 3.25 0 0 1-.137 4.595L13.94 28.89a3.25 3.25 0 0 1-4.557-.098l-6.264-6.435a3.25 3.25 0 0 1 4.658-4.534l4.033 4.143l12.525-11.802a3.25 3.25 0 0 1 4.594.136" clip-rule="evenodd"/></svg>',
      cross:
        '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 64 64"><title>cross-mark</title><path fill="currentColor" d="M62 10.571L53.429 2L32 23.429L10.571 2L2 10.571L23.429 32L2 53.429L10.571 62L32 40.571L53.429 62L62 53.429L40.571 32z"/></svg>',
      stars:
        '<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 16 16"><path fill="currentColor" d="M7.657 6.247c.11-.33.576-.33.686 0l.645 1.937a2.89 2.89 0 0 0 1.829 1.828l1.936.645c.33.11.33.576 0 .686l-1.937.645a2.89 2.89 0 0 0-1.828 1.829l-.645 1.936a.361.361 0 0 1-.686 0l-.645-1.937a2.89 2.89 0 0 0-1.828-1.828l-1.937-.645a.361.361 0 0 1 0-.686l1.937-.645a2.89 2.89 0 0 0 1.828-1.828zM3.794 1.148a.217.217 0 0 1 .412 0l.387 1.162c.173.518.579.924 1.097 1.097l1.162.387a.217.217 0 0 1 0 .412l-1.162.387A1.73 1.73 0 0 0 4.593 5.69l-.387 1.162a.217.217 0 0 1-.412 0L3.407 5.69A1.73 1.73 0 0 0 2.31 4.593l-1.162-.387a.217.217 0 0 1 0-.412l1.162-.387A1.73 1.73 0 0 0 3.407 2.31zM10.863.099a.145.145 0 0 1 .274 0l.258.774c.115.346.386.617.732.732l.774.258a.145.145 0 0 1 0 .274l-.774.258a1.16 1.16 0 0 0-.732.732l-.258.774a.145.145 0 0 1-.274 0l-.258-.774a1.16 1.16 0 0 0-.732-.732L9.1 2.137a.145.145 0 0 1 0-.274l.774-.258c.346-.115.617-.386.732-.732z"/></svg>',
    },
    M = [
      { key: "sampler", label: "Sampler", threshold: 2, req: "2 games" },
      { key: "dabbler", label: "Dabbler", threshold: 5, req: "5 games" },
      {
        key: "enthusiast",
        label: "Enthusiast",
        threshold: 10,
        req: "10 games",
      },
      { key: "ranger", label: "Ranger", threshold: 15, req: "15 games" },
      { key: "explorer", label: "Explorer", threshold: 20, req: "20 games" },
      {
        key: "adventurer",
        label: "Adventurer",
        threshold: 30,
        req: "30 games",
      },
      { key: "voyager", label: "Voyager", threshold: 40, req: "40 games" },
      { key: "maverick", label: "Maverick", threshold: 60, req: "60 games" },
      { key: "polymath", label: "Polymath", threshold: 80, req: "80 games" },
      {
        key: "universalist",
        label: "Universalist",
        threshold: 100,
        req: "100 games",
      },
    ],
    R = [
      { key: "casual", label: "Casual", threshold: 1, req: "1 hr" },
      {
        key: "recreational",
        label: "Recreational",
        threshold: 5,
        req: "5 hrs",
      },
      { key: "dedicated", label: "Dedicated", threshold: 20, req: "20 hrs" },
      { key: "committed", label: "Committed", threshold: 75, req: "75 hrs" },
      { key: "serious", label: "Serious", threshold: 150, req: "150 hrs" },
      { key: "devoted", label: "Devoted", threshold: 300, req: "300 hrs" },
      { key: "seasoned", label: "Seasoned", threshold: 500, req: "500 hrs" },
      { key: "ironclad", label: "Ironclad", threshold: 1e3, req: "1,000 hrs" },
      {
        key: "unshakeable",
        label: "Unshakeable",
        threshold: 2e3,
        req: "2,000 hrs",
      },
      { key: "eternal", label: "Eternal", threshold: 5e3, req: "5,000 hrs" },
    ],
    J = [
      { key: "newcomer", label: "Newcomer", threshold: 1, req: "1 hr" },
      { key: "fledgling", label: "Fledgling", threshold: 5, req: "5 hrs" },
      { key: "breakout", label: "Breakout", threshold: 20, req: "20 hrs" },
      { key: "standout", label: "Standout", threshold: 75, req: "75 hrs" },
      {
        key: "trendsetter",
        label: "Trendsetter",
        threshold: 150,
        req: "150 hrs",
      },
      { key: "headliner", label: "Headliner", threshold: 300, req: "300 hrs" },
      { key: "star", label: "Star", threshold: 500, req: "500 hrs" },
      {
        key: "sensation",
        label: "Sensation",
        threshold: 1e3,
        req: "1,000 hrs",
      },
      {
        key: "visionary",
        label: "Visionary",
        threshold: 2e3,
        req: "2,000 hrs",
      },
      {
        key: "phenomenon",
        label: "Phenomenon",
        threshold: 5e3,
        req: "5,000 hrs",
      },
    ];
  let B = "discord.com",
    f = null;
  const L = document.getElementById("versionTag"),
    C = document.getElementById("btnRefresh"),
    H = document.getElementById("loadingView"),
    D = document.getElementById("unauthView"),
    V = document.getElementById("badgesView"),
    Q = document.getElementById("btnOpenDiscord"),
    Z = document.getElementById("userAvatar"),
    ee = document.getElementById("userName"),
    te = document.getElementById("userTag"),
    se = document.getElementById("varietyStrip"),
    ne = document.getElementById("timeStrip"),
    ae = document.getElementById("streamingStrip"),
    g = document.getElementById("varietyStatus"),
    y = document.getElementById("timeStatus"),
    oe = document.getElementById("statsText"),
    h = document.getElementById("taskBox"),
    m = document.getElementById("taskIcon"),
    b = document.getElementById("taskText"),
    P = document.getElementById("taskBar"),
    S = document.getElementById("btnCancel"),
    k = document.getElementById("sheetBackdrop"),
    E = document.getElementById("bottomSheet"),
    re = document.getElementById("btnSheetClose"),
    G = document.getElementById("sheetBadgeIcon"),
    O = document.getElementById("sheetBadgeTitle"),
    z = document.getElementById("sheetBadgeCategory"),
    F = document.getElementById("sheetCurrentVal"),
    U = document.getElementById("sheetTargetVal"),
    W = document.getElementById("sheetSummaryText"),
    le = document.getElementById("btnSheetConfirm"),
    ce = document.getElementById("btnSheetCancel");
  function w(s, t) {
    return `../assets/badges/${s}/${t}.svg`;
  }
  function ie(s) {
    return s
      ? s.includes("canary")
        ? "Canary"
        : s.includes("ptb")
          ? "PTB"
          : "Stable"
      : "Stable";
  }
  function I(s) {
    if (!s)
      return {
        currentTier: null,
        count: 0,
        infoLabel: "",
        ownedTiers: new Set(),
        isMaxed: !1,
      };
    const t = s.current_tier || null,
      e = s.info_label || "";
    let n = 0;
    if (e) {
      const a = e.replace(/,/g, "").match(/(\d+)/);
      a && (n = Number(a[1]));
    }
    if (
      (!n || isNaN(n)) &&
      Array.isArray(s.progress) &&
      s.progress.length > 0
    ) {
      const a = s.progress[0];
      a && typeof a.current == "number" && (n = a.current);
    }
    const r = new Set();
    return (
      s.tier_obtained_at &&
        typeof s.tier_obtained_at == "object" &&
        Object.keys(s.tier_obtained_at).forEach((a) => r.add(a)),
      Array.isArray(s.tiers) &&
        s.tiers.forEach((a) => {
          a.owned && r.add(a.key);
        }),
      { currentTier: t, count: isNaN(n) ? 0 : n, infoLabel: e, ownedTiers: r }
    );
  }
  function q(s, t, e, n, r, a = !1) {
    s.innerHTML = "";
    const { currentTier: l, ownedTiers: o } = e,
      c = l ? t.findIndex((i) => i.key === l) : -1,
      p = c === t.length - 1;
    t.forEach((i, ye) => {
      const d = document.createElement("div");
      ((d.className = "tier-cell"),
        (d.dataset.key = i.key),
        (d.title = a
          ? `${i.label} (${i.req}) \xB7 Coming Soon`
          : `${i.label} (${i.req})`));
      const x = document.createElement("img");
      ((x.className = "tier-img"), (x.src = w(n, i.key)), (x.alt = i.label));
      const A = document.createElement("div");
      ((A.className = "tier-label"), (A.textContent = i.label));
      const _ = document.createElement("div");
      ((_.className = "tier-req"),
        (_.textContent = i.req),
        d.appendChild(x),
        d.appendChild(A),
        d.appendChild(_));
      const fe = l && i.key === l,
        ke = o.has(i.key) || (c !== -1 && ye < c);
      if (fe) {
        d.classList.add(p ? "maxed" : "current");
        const u = document.createElement("span");
        ((u.className = "tier-badge-icon current"),
          (u.innerHTML = v.stars),
          d.appendChild(u));
      } else if (ke || p) {
        d.classList.add("owned");
        const u = document.createElement("span");
        ((u.className = "tier-badge-icon owned"),
          (u.innerHTML = v.check),
          d.appendChild(u));
      } else
        a
          ? d.classList.add("locked")
          : (d.classList.add("future"),
            typeof r == "function" && d.addEventListener("click", () => r(i)));
      s.appendChild(d);
    });
    const X = s.querySelector(".tier-cell.current");
    X
      ? setTimeout(() => {
          (X.scrollIntoView({
            inline: "center",
            behavior: "smooth",
            block: "nearest",
          }),
            setTimeout(Y, 300));
        }, 100)
      : setTimeout(Y, 50);
  }
  function de(s) {
    const t = I(s),
      { currentTier: e, count: n } = t,
      r = e === "universalist",
      a = M.find((c) => c.key === e),
      l = a ? a.label : e || "None",
      o = `${n.toLocaleString()} ${n === 1 ? "game" : "games"}`;
    (r
      ? ((g.textContent = `${l} \xB7 ${o}`),
        (g.className = "section-status maxed"))
      : e
        ? ((g.textContent = `${l} \xB7 ${o}`),
          (g.className = "section-status owned"))
        : ((g.textContent = "0 games"), (g.className = "section-status")),
      q(se, M, t, "game-variety", (c) => {
        j("variety", c, n);
      }));
  }
  function me(s) {
    const t = I(s),
      { currentTier: e, count: n } = t,
      r = e === "eternal",
      a = R.find((c) => c.key === e),
      l = a ? a.label : e || "None",
      o = `${n.toLocaleString()} ${n === 1 ? "hr" : "hrs"}`;
    (r
      ? ((y.textContent = `${l} \xB7 ${o}`),
        (y.className = "section-status maxed"))
      : e
        ? ((y.textContent = `${l} \xB7 ${o}`),
          (y.className = "section-status owned"))
        : ((y.textContent = "0 hrs"), (y.className = "section-status")),
      q(ne, R, t, "game-time", (c) => {
        j("time", c, n);
      }));
  }
  function he(s) {
    const t = I(s);
    q(ae, J, t, "streaming", null, !0);
  }
  function ue() {
    document.querySelectorAll(".tier-strip-wrap").forEach((t) => {
      const e = t.querySelector(".tier-strip"),
        n = t.querySelector(".strip-arrow-left"),
        r = t.querySelector(".strip-arrow-right");
      if (!e || !n || !r) return;
      function a() {
        const o = e.scrollWidth - e.clientWidth,
          c = e.scrollLeft > 6,
          p = e.scrollLeft < o - 6;
        (n.classList.toggle("visible", c),
          r.classList.toggle("visible", p),
          t.classList.toggle("can-scroll-left", c),
          t.classList.toggle("can-scroll-right", p));
      }
      (n.addEventListener("click", (o) => {
        (o.stopPropagation(),
          e.scrollBy({ left: -160, behavior: "smooth" }),
          setTimeout(a, 250));
      }),
        r.addEventListener("click", (o) => {
          (o.stopPropagation(),
            e.scrollBy({ left: 160, behavior: "smooth" }),
            setTimeout(a, 250));
        }),
        e.addEventListener("scroll", a, { passive: !0 }),
        e.addEventListener(
          "wheel",
          (o) => {
            o.deltaY !== 0 &&
              o.deltaX === 0 &&
              (o.preventDefault(), (e.scrollLeft += o.deltaY), a());
          },
          { passive: !1 },
        ),
        t.addEventListener("mouseenter", a));
      const l = t.closest(".badge-section");
      l && l.addEventListener("mouseenter", a);
    });
  }
  function Y() {
    document.querySelectorAll(".tier-strip-wrap").forEach((t) => {
      const e = t.querySelector(".tier-strip"),
        n = t.querySelector(".strip-arrow-left"),
        r = t.querySelector(".strip-arrow-right");
      if (!e || !n || !r) return;
      const a = e.scrollWidth - e.clientWidth,
        l = e.scrollLeft > 6,
        o = e.scrollLeft < a - 6;
      (n.classList.toggle("visible", l),
        r.classList.toggle("visible", o),
        t.classList.toggle("can-scroll-left", l),
        t.classList.toggle("can-scroll-right", o));
    });
  }
  function j(s, t, e) {
    if (s === "variety") {
      ((G.src = w("game-variety", t.key)),
        (O.textContent = t.label),
        (z.textContent = "Game Variety Badge"),
        (F.textContent = `${e.toLocaleString()} games`),
        (U.textContent = `${t.threshold.toLocaleString()} games`));
      const n = Math.max(1, t.threshold - e);
      ((W.textContent = `Simulating ${n} unique games (1 min session each) to reach ${t.label}.`),
        (f = () => {
          K("variety", { targetThreshold: t.threshold, current: e });
        }));
    } else {
      ((G.src = w("game-time", t.key)),
        (O.textContent = t.label),
        (z.textContent = "Game Time Badge"),
        (F.textContent = `${e.toLocaleString()} hrs`),
        (U.textContent = `${t.threshold.toLocaleString()} hrs`));
      const n = Math.max(1, t.threshold - (e < t.threshold ? e : 0));
      ((W.textContent = `Claiming ~${n.toLocaleString()} hrs distributed safely across fresh games.`),
        (f = () => {
          K("time", { hoursToAdd: n, currentHours: e });
        }));
    }
    (k.classList.remove("hidden"),
      E.classList.remove("hidden"),
      requestAnimationFrame(() => {
        (E.classList.add("open"), k.classList.add("open"));
      }));
  }
  function T() {
    (E.classList.remove("open"),
      k.classList.remove("open"),
      setTimeout(() => {
        (E.classList.add("hidden"), k.classList.add("hidden"), (f = null));
      }, 250));
  }
  (re.addEventListener("click", T),
    ce.addEventListener("click", T),
    k.addEventListener("click", T),
    le.addEventListener("click", () => {
      if (f) {
        const s = f;
        (T(), s());
      }
    }));
  function N(s = !1, t = null) {
    chrome.runtime.sendMessage({ type: "GET_STATE", refresh: s }, (e) => {
      if ((typeof t == "function" && t(), H && H.classList.add("hidden"), !e))
        return;
      if (
        (e.task && e.task.running
          ? $(e.task)
          : (h.classList.add("hidden"),
            document.body.classList.remove("task-active")),
        !e.authenticated)
      ) {
        ((L.textContent = "Disconnected"),
          (L.className = "version-tag disconnected"),
          D.classList.remove("hidden"),
          V.classList.add("hidden"));
        const a = document.getElementById("unauthHint");
        a &&
          (a.textContent = e.error
            ? `Error: ${e.error}`
            : e.message || "Open Discord in a tab first.");
        return;
      }
      (D.classList.add("hidden"),
        V.classList.remove("hidden"),
        (B = e.host || "discord.com"),
        (L.textContent = ie(B)),
        (L.className = "version-tag connected"),
        e.user &&
          ((ee.textContent = e.user.global_name || e.user.username || "User"),
          (te.textContent =
            e.user.discriminator && e.user.discriminator !== "0"
              ? `@${e.user.username}#${e.user.discriminator}`
              : `@${e.user.username}`),
          (Z.src = e.user.avatar
            ? `https://cdn.discordapp.com/avatars/${e.user.id}/${e.user.avatar}.png?size=64`
            : "https://cdn.discordapp.com/embed/avatars/0.png")));
      const n = e.badges || {};
      (de(n.varietyBadge || null),
        me(n.timeBadge || null),
        he(n.streamingBadge || null));
      const r = e.stats || { total_games_claimed: 0, total_hours_claimed: 0 };
      oe.innerHTML = `Claimed: <strong>${r.total_games_claimed.toLocaleString()}</strong> games \xB7 <strong>${r.total_hours_claimed.toLocaleString()}h</strong> total`;
    });
  }
  const ge =
    '<svg class="task-spinner" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2.8" fill="none" stroke-linecap="round" stroke-dasharray="28 28"/></svg>';
  function $(s) {
    (h.classList.remove("hidden", "task-success", "task-error"),
      document.body.classList.add("task-active"),
      m && ((m.innerHTML = ge), (m.className = "task-icon running")),
      (S.style.display = ""),
      (b.textContent = s.text || "Processing..."),
      (P.style.width = `${s.progress || 0}%`));
  }
  function K(s, t) {
    ($({ text: "Starting session...", progress: 0 }),
      chrome.runtime.sendMessage({
        type: "START_FORGE",
        payload: { type: s, params: t },
      }));
  }
  (chrome.runtime.onMessage.addListener((s) => {
    if (s.type === "TASK_STATUS_UPDATE" && s.payload) {
      const t = s.payload;
      t.running
        ? $(t)
        : t.completed
          ? (h.classList.remove("hidden", "task-error"),
            h.classList.add("task-success"),
            document.body.classList.add("task-active"),
            m && ((m.innerHTML = v.check), (m.className = "task-icon success")),
            (S.style.display = "none"),
            (b.textContent = t.text || "Done!"),
            (P.style.width = "100%"),
            setTimeout(() => {
              (h.classList.add("hidden"),
                document.body.classList.remove("task-active"),
                N(!0));
            }, 2600))
          : t.error &&
            (h.classList.remove("hidden", "task-success"),
            h.classList.add("task-error"),
            document.body.classList.add("task-active"),
            m && ((m.innerHTML = v.cross), (m.className = "task-icon error")),
            (S.style.display = ""),
            (b.textContent = t.text || "An error occurred"),
            setTimeout(() => {
              (h.classList.add("hidden"),
                document.body.classList.remove("task-active"));
            }, 4e3));
    }
  }),
    C.addEventListener("click", () => {
      (C.classList.add("spinning"),
        N(!0, () => {
          setTimeout(() => C.classList.remove("spinning"), 500);
        }));
    }),
    Q.addEventListener("click", () => {
      chrome.tabs.create({ url: `https://${B}/app` });
    }),
    S.addEventListener("click", () => {
      (chrome.runtime.sendMessage({ type: "CANCEL_FORGE" }),
        m && ((m.innerHTML = ""), (m.className = "task-icon hidden")),
        (b.textContent = "Stopping..."),
        setTimeout(() => {
          (h.classList.add("hidden"),
            document.body.classList.remove("task-active"));
        }, 900));
    }),
    document.addEventListener("click", (s) => {
      const t = s.target.closest('a[href^="http"]');
      t && (s.preventDefault(), chrome.tabs.create({ url: t.href }));
    }),
    ue(),
    N());
})();
