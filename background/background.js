/* Lille v1.2.0 by lilbarro
   Discord badge progression simulator
   Improvements: shuffled game selection, smarter batching, clearer status, clean branding
*/
const USER_AGENT =
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) discord/1.0.9265 Chrome/148.0.7778.280 Electron/42.11.15 Safari/537.36",
  PROPERTIES_URL = "https://cordapi.dolfi.es/api/v2/properties/windows",
  FALLBACK_PROPS = {
    os: "Windows",
    browser: "Discord Client",
    release_channel: "stable",
    client_version: "1.0.9265",
    os_version: "10.0.26100",
    os_arch: "x64",
    app_arch: "x64",
    system_locale: "en-US",
    has_client_mods: !1,
    browser_user_agent: USER_AGENT,
    browser_version: "42.11.15",
    os_sdk_version: "26100",
    client_build_number: 649389,
    native_build_number: 96160,
    client_event_source: null,
    client_app_state: "focused",
  },
  DISCORD_HOSTS = ["canary.discord.com", "ptb.discord.com", "discord.com"];
let activeTask = null,
  cachedGames = null;
async function getGames() {
  if (cachedGames && cachedGames.length) return cachedGames;
  try {
    if (
      ((cachedGames = await (
        await fetch(chrome.runtime.getURL("data/games.json"))
      ).json()),
      cachedGames && cachedGames.length)
    )
      return cachedGames;
  } catch {}
  try {
    const t = await (
        await fetch("https://cdn.discordapp.com/detectables/games.json")
      ).json(),
      e = [],
      s = new Set();
    for (const n of t) {
      const c = String(n?.id || "");
      if (!c || !/^\d+$/.test(c) || s.has(c)) continue;
      const d = n.executables?.find((r) => r?.os === "win32" && r?.name)?.name;
      d && (s.add(c), e.push({ id: c, name: n.name || "Unknown", exe: d }));
    }
    return (e.length && (cachedGames = e), cachedGames || []);
  } catch {}
  return [];
}
async function getUsedGames() {
  return (
    (await chrome.storage.local.get("lille_used_games"))
      .lille_used_games || []
  );
}
async function saveUsedGames(a) {
  await chrome.storage.local.set({ lille_used_games: a });
}
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
function selectGames(a, t, e) {
  const s = new Set(a.map((i) => i.id)),
    n = new Set(e),
    c = shuffle(a.filter((i) => !n.has(i.id)).map((i) => i.id)),
    d = e.filter((i) => s.has(i));
  let r = [];
  if (c.length >= t) r = c.slice(0, t);
  else if (((r = [...c]), d.length > 0)) {
    const i = t - r.length,
      m = shuffle(d.slice(i).concat(d.slice(0, i)));
    r.push(...m.slice(0, i));
  }
  const h = d.filter((i) => !r.includes(i)).concat(r),
    l = new Map(a.map((i) => [i.id, i]));
  return {
    selectedGames: r.map((i) => l.get(i)).filter(Boolean),
    newUsedGames: h,
  };
}
async function getStats() {
  return (
    (await chrome.storage.local.get("lille_stats")).lille_stats || {
      total_games_claimed: 0,
      total_hours_claimed: 0,
    }
  );
}
async function updateStats(a, t) {
  const e = await getStats();
  return (
    (e.total_games_claimed = (e.total_games_claimed || 0) + a),
    (e.total_hours_claimed = (e.total_hours_claimed || 0) + t),
    await chrome.storage.local.set({ lille_stats: e }),
    e
  );
}
async function fetchClientProperties() {
  try {
    const a = new AbortController(),
      t = setTimeout(() => a.abort(), 5e3),
      e = await fetch(PROPERTIES_URL, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "user-agent": USER_AGENT,
        },
        body: "{}",
        signal: a.signal,
      });
    if ((clearTimeout(t), e.ok)) {
      const s = await e.json();
      if (s && s.properties) return s.properties;
    }
  } catch {}
  return { ...FALLBACK_PROPS };
}
function buildSuperProps(a, t, e) {
  const s = { ...a };
  return (
    (s.client_launch_id = crypto.randomUUID()),
    (s.launch_signature = t),
    (s.client_heartbeat_session_id = e),
    btoa(JSON.stringify(s))
  );
}
async function getCookies(a) {
  try {
    const t = a.startsWith("discord.com") ? ".discord.com" : a,
      e = await chrome.cookies.getAll({ domain: t });
    return e && e.length
      ? e.map((n) => `${n.name}=${n.value}`).join("; ")
      : ((await chrome.cookies.getAll({ domain: a })) || [])
          .map((n) => `${n.name}=${n.value}`)
          .join("; ");
  } catch {
    return "";
  }
}
async function getInstallationId(a) {
  try {
    const t = await chrome.cookies.get({
      url: `https://${a}`,
      name: "installation_id_v3",
    });
    if (t && t.value) return t.value;
    const e = await chrome.cookies.get({
      url: "https://discord.com",
      name: "installation_id_v3",
    });
    if (e && e.value) return e.value;
  } catch {}
  return "";
}
async function extractTokenFromTab() {
  for (const a of DISCORD_HOSTS)
    try {
      const t = await chrome.tabs.query({ url: `https://${a}/*` });
      for (const e of t)
        if (e.id) {
          try {
            const s = await chrome.scripting.executeScript({
              target: { tabId: e.id },
              world: "MAIN",
              func: async () => {
                let n = null;
                if (typeof window.webpackChunkdiscord_app < "u")
                  try {
                    let o = null;
                    if (
                      (window.webpackChunkdiscord_app.push([
                        [Symbol("lille")],
                        {},
                        (h) => {
                          o = h;
                        },
                      ]),
                      window.webpackChunkdiscord_app.pop(),
                      o && o.c)
                    )
                      for (const h of Object.values(o.c)) {
                        const l = h?.exports?.default || h?.exports;
                        if (l && typeof l.getToken == "function")
                          try {
                            const u = l.getToken();
                            if (u && typeof u == "string" && u.length > 30) {
                              n = u;
                              break;
                            }
                          } catch {}
                      }
                  } catch {}
                if (!n)
                  try {
                    const o = document.createElement("iframe");
                    ((o.style.cssText = "display:none;width:0;height:0;"),
                      document.body.appendChild(o));
                    const h = o.contentWindow.localStorage.getItem("token");
                    if ((o.remove(), h)) {
                      const l = h.replace(/^"|"$/g, "");
                      l && l.length > 30 && (n = l);
                    }
                  } catch {}
                if (!n) return null;
                let c = "";
                try {
                  c = localStorage.getItem("installation_id_v3") || "";
                } catch {}
                let d = null,
                  r = null;
                try {
                  const o = {
                    accept: "*/*",
                    "accept-language": "en-US,en;q=0.9",
                    authorization: n,
                    priority: "u=1, i",
                    "x-debug-options": "bugReporterEnabled",
                    "x-discord-locale": "en-US",
                  };
                  c && (o["x-installation-id"] = c);
                  try {
                    const l = Intl.DateTimeFormat().resolvedOptions().timeZone;
                    l && (o["x-discord-timezone"] = l);
                  } catch {}
                  const h = await fetch(
                    `https://${window.location.hostname}/api/v9/users/%40me/badges`,
                    { headers: o, credentials: "include" },
                  );
                  ((r = h.status), h.ok && (d = await h.json()));
                } catch (o) {
                  r = o.message;
                }
                return {
                  token: n,
                  host: window.location.hostname,
                  installationId: c,
                  badgeData: d,
                  badgeStatus: r,
                };
              },
            });
            if (s && s[0] && s[0].result) {
              const n = s[0].result;
              if (n.token) return ((n.tabId = e.id), n);
            }
          } catch (s) {
            console.warn("[Lille] executeScript error:", s);
          }
          try {
            const s = await new Promise((n) => {
              chrome.tabs.sendMessage(
                e.id,
                { type: "LILLE_EXTRACT" },
                (c) => {
                  chrome.runtime.lastError ? n(null) : n(c);
                },
              );
            });
            if (s && s.ok && s.auth && s.auth.token)
              return ((s.auth.tabId = e.id), s.auth);
          } catch {}
        }
    } catch {}
  return null;
}
async function resolveSession(a = !1) {
  const t = await extractTokenFromTab();
  if (t && t.token)
    return (await chrome.storage.local.set({ lille_auth: t }), t);
  const e = await chrome.storage.local.get("lille_auth");
  return e.lille_auth && e.lille_auth.token ? e.lille_auth : null;
}
async function fetchMe(a, t, e, s) {
  const n = await fetch(
    `https://${t}/api/v9/users/@me?with_analytics_token=true`,
    {
      headers: {
        authorization: a,
        "user-agent": USER_AGENT,
        "x-super-properties": e,
        cookie: s,
        accept: "*/*",
        "accept-language": "en-GB",
      },
    },
  );
  if (!n.ok) throw new Error(`/users/@me returned ${n.status}`);
  return n.json();
}
async function fetchBadgesFromTab(a, t) {
  try {
    const s = (await chrome.tabs.query({})).find(
      (n) => n.url && n.url.includes(t),
    );
    if (s && s.id) {
      const n = await chrome.tabs.sendMessage(s.id, {
        type: "LILLE_GET_BADGES",
        token: a,
      });
      if (n && n.ok && n.data) return n.data;
    }
  } catch {}
  return null;
}
async function fetchBadges(a, t, e, s, n = null) {
  const c = {
    authorization: a,
    "user-agent": USER_AGENT,
    accept: "*/*",
    "accept-language": "en-US,en;q=0.9",
    "x-debug-options": "bugReporterEnabled",
    "x-discord-locale": "en-US",
    priority: "u=1, i",
  };
  (e && (c["x-super-properties"] = e), s && (c.cookie = s));
  const d = n || (await getInstallationId(t));
  d && (c["x-installation-id"] = d);
  try {
    const o = Intl.DateTimeFormat().resolvedOptions().timeZone;
    o && (c["x-discord-timezone"] = o);
  } catch {}
  let r = await fetch(`https://${t}/api/v9/users/%40me/badges`, {
    headers: c,
    credentials: "include",
    referrer: `https://${t}/channels/@me`,
  });
  if (
    (r.status === 404 &&
      t !== "discord.com" &&
      (r = await fetch("https://discord.com/api/v9/users/%40me/badges", {
        headers: c,
        credentials: "include",
        referrer: "https://discord.com/channels/@me",
      })),
    r.status === 404)
  )
    return { badges: [] };
  if (!r.ok) throw new Error(`/users/%40me/badges returned ${r.status}`);
  return r.json();
}
function parseBadges(a) {
  const t = Array.isArray(a) ? a : a && a.badges ? a.badges : [];
  return {
    varietyBadge: t.find((e) => e.badge_id === 21) || null,
    timeBadge: t.find((e) => e.badge_id === 20) || null,
    streamingBadge: t.find((e) => e.badge_id === 19) || null,
    allBadges: t,
  };
}
async function getState(a = !1) {
  const t = await resolveSession(a);
  if (!t)
    return {
      authenticated: !1,
      message: "Open Discord in a browser tab first.",
    };
  const e = await fetchClientProperties(),
    s = crypto.randomUUID(),
    n = crypto.randomUUID(),
    c = buildSuperProps(e, n, s),
    d = await getCookies(t.host);
  try {
    let r = t.badgeData || null;
    r || (r = await fetchBadgesFromTab(t.token, t.host));
    const [o, h] = await Promise.all([
      fetchMe(t.token, t.host, c, d),
      r ? Promise.resolve(null) : fetchBadges(t.token, t.host, c, d),
    ]);
    if ((!r && h && (r = h), o && o.id)) {
      const v = await chrome.storage.local.get("lille_last_user_id");
      (v.lille_last_user_id &&
        v.lille_last_user_id !== o.id &&
        (await chrome.storage.local.set({
          lille_used_games: [],
          lille_stats: { total_games_claimed: 0, total_hours_claimed: 0 },
        })),
        await chrome.storage.local.set({ lille_last_user_id: o.id }));
    }
    await chrome.storage.local.set({
      lille_auth: {
        token: t.token,
        host: t.host,
        badgeData: r,
        tabId: t.tabId,
      },
    });
    const u =
        r && (Array.isArray(r) ? r.length > 0 : r.badges && r.badges.length > 0)
          ? r
          : o,
      i = parseBadges(u),
      m = await getStats(),
      g = await getUsedGames();
    return {
      authenticated: !0,
      host: t.host,
      user: o,
      badges: i,
      stats: m,
      usedGamesCount: g.length,
      task: activeTask ? activeTask.status : null,
    };
  } catch (r) {
    return (
      console.error("[Lille] getState caught error:", r),
      await chrome.storage.local.remove("lille_auth"),
      { authenticated: !1, error: r.message }
    );
  }
}
function getUserIdFromToken(a) {
  try {
    const t = a.split(".")[0],
      e = "=".repeat((4 - (t.length % 4)) % 4);
    return atob(t + e);
  } catch {
    return "";
  }
}
async function generateFingerprint(a) {
  if (!a) return "";
  try {
    const t = new TextEncoder(),
      e = async (i) => new Uint8Array(await crypto.subtle.digest("SHA-256", i)),
      s = crypto.randomUUID(),
      n = await e(t.encode(s + a)),
      c = await e(t.encode("pe_header_" + a)),
      d = await e(t.encode("pe_section_" + a)),
      r = await e(t.encode("pe_cert_" + a)),
      o = new Uint8Array(146),
      h = new DataView(o.buffer);
    ((o[0] = 1),
      (o[1] = 3),
      h.setBigUint64(2, 65432100n, !0),
      h.setUint32(10, Math.floor(Date.now() / 1e3) - 2592e3, !0),
      h.setUint32(14, 38797312, !0),
      o.set(c, 18),
      o.set(n, 50),
      o.set(d, 82),
      o.set(r, 114));
    const l = await e(t.encode(a + "https://discord.com/careers"));
    for (let i = 1; i < o.length; i++) o[i] ^= l[(i - 1) & 31];
    let u = "";
    for (let i = 0; i < o.length; i++) u += String.fromCharCode(o[i]);
    return btoa(u);
  } catch {
    return "";
  }
}
function createScienceSession(a, t = "") {
  const e = crypto.randomUUID(),
    s = crypto.randomUUID(),
    n = buildSuperProps(a, s, e);
  let c = 0;
  function d() {
    return ((c += 1), c);
  }
  function r(l, u) {
    const i = u || Date.now(),
      m = {
        client_track_timestamp: i,
        client_heartbeat_session_id: e,
        event_sequence_number: d(),
        game: l.name,
        game_id: l.id,
        verified: !0,
        elevated: !1,
        is_launcher: !1,
        game_platform: "desktop",
        detection_method: "verified_game",
        is_overlay_enabled: !1,
        is_overlay_game_enabled: !0,
        is_overlay_game_source: "OOP_DEFAULT_DATABASE",
        fullscreen_type: "UNKNOWN",
        hardware_display_count: 1,
        overlay_method: "Disabled",
        activity_status_enabled: !0,
        activity_status_shared_guilds: [],
        current_user_status: "online",
        game_detection_enabled: !0,
        executable_path: l.exe,
        voice_channel_id: null,
        voice_channel_type: null,
        voice_channel_bitrate: null,
        voice_channel_guild_id: null,
        hidden_by_distributor: !1,
        game_metadata: null,
        client_performance_cpu: null,
        client_performance_memory: null,
        cpu_core_count: null,
        accessibility_features: 0,
        rendered_locale: "en-GB",
        launch_signature: s,
        client_rtc_state: null,
        client_app_state: "focused",
        client_send_timestamp: i,
      };
    return (
      t && (m.executable_fingerprint = t),
      { type: "launch_game", properties: m }
    );
  }
  function o(l, u, i, m, g, v) {
    const M = v || Date.now();
    return {
      type: "running_game_heartbeat",
      properties: {
        client_track_timestamp: M,
        client_heartbeat_session_id: e,
        event_sequence_number: d(),
        game_id: l.id,
        game_name: l.name,
        game_metadata: null,
        game_executable: l.exe,
        game_detection_enabled: !0,
        initial_heartbeat: m,
        final_heartbeat: g,
        game_session_id: i,
        duration_tracked_ms: u,
        rtc_connection_id: null,
        media_session_id: null,
        launch_signature: s,
        client_app_state: "focused",
        client_send_timestamp: M,
      },
    };
  }
  function h(l, u) {
    const i = crypto.randomUUID(),
      m = Date.now();
    let g = m - u;
    return (
      g < 0 && (g = m),
      [o(l, 0, i, !0, !1, g), r(l, m), o(l, u, i, !1, !0, m)]
    );
  }
  return { hbSession: e, launchSig: s, superProps: n, buildSession: h };
}
async function postBatch(a, t, e, s, n, c, d) {
  if (a)
    try {
      const o = (
        await chrome.scripting.executeScript({
          target: { tabId: a },
          world: "MAIN",
          func: async (h, l, u, i, m) => {
            try {
              const g =
                Intl.DateTimeFormat().resolvedOptions().timeZone ||
                "Europe/Oslo";
              return (
                await fetch(h, {
                  method: "POST",
                  credentials: "include",
                  headers: {
                    accept: "*/*",
                    "accept-language": "en-GB,en;q=0.9",
                    authorization: l,
                    "content-type": "application/json",
                    "x-debug-options": "bugReporterEnabled",
                    "x-discord-locale": "en-GB",
                    "x-discord-timezone": g,
                    "x-super-properties": i,
                  },
                  body: JSON.stringify({ token: u, events: m }),
                })
              ).status;
            } catch {
              return 0;
            }
          },
          args: [`https://${t}/api/v9/science`, e, s, n, d],
        })
      )?.[0]?.result;
      if (typeof o == "number" && o > 0) return o;
    } catch (r) {
      console.warn(
        "[Lille] In-tab postBatch error, falling back to background fetch:",
        r,
      );
    }
  try {
    const r = Intl.DateTimeFormat().resolvedOptions().timeZone || "Europe/Oslo",
      o = {
        accept: "*/*",
        "accept-language": "en-GB,en;q=0.9",
        authorization: e,
        "content-type": "application/json",
        origin: `https://${t}`,
        referer: `https://${t}/channels/@me`,
        "x-debug-options": "bugReporterEnabled",
        "x-discord-locale": "en-GB",
        "x-discord-timezone": r,
        "x-super-properties": n,
      };
    return (
      c && (o.cookie = c),
      (
        await fetch(`https://${t}/api/v9/science`, {
          method: "POST",
          credentials: "include",
          headers: o,
          body: JSON.stringify({ token: s, events: d }),
        })
      ).status
    );
  } catch (r) {
    return (console.error("[Lille] Background postBatch error:", r), 0);
  }
}
function updateStatus(a) {
  (activeTask && (activeTask.status = a),
    chrome.runtime
      .sendMessage({ type: "TASK_STATUS_UPDATE", payload: a })
      .catch(() => {}));
}
async function findActiveDiscordTab(a) {
  try {
    const t = await chrome.tabs.query({
      url: [`https://${a}/*`, "https://*.discord.com/*"],
    });
    if (t && t.length && t[0].id) return t[0].id;
  } catch {}
  return null;
}
async function runForge(a, t = {}) {
  if (activeTask?.running) throw new Error("Task already running");
  const e = await resolveSession();
  if (!e)
    throw new Error(
      "Discord session not detected. Open Discord in browser first.",
    );
  const s = e.tabId || (await findActiveDiscordTab(e.host)),
    n = { running: !0, cancelled: !1, status: null };
  activeTask = n;
  const c = (d) => new Promise((r) => setTimeout(r, d));
  try {
    updateStatus({
      running: !0,
      type: a,
      progress: 2,
      text: "Fetching client properties & auth...",
    });
    const d = await fetchClientProperties(),
      r = await getCookies(e.host),
      o = crypto.randomUUID(),
      h = crypto.randomUUID(),
      l = buildSuperProps(d, h, o),
      u = await fetchMe(e.token, e.host, l, r);
    if (!u.analytics_token)
      throw new Error(
        "No analytics_token in /users/@me \u2014 try refreshing Discord.",
      );
    const i = await getGames();
    if (!i.length) throw new Error("games.json is empty");
    const m = await getUsedGames(),
      g = 50,
      v = 1e3,
      M = (u && u.id) || getUserIdFromToken(e.token),
      P = await generateFingerprint(M),
      T = createScienceSession(d, P);
    if (a === "variety" && !n.cancelled) {
      const A = t.targetThreshold || 115,
        { selectedGames: p, newUsedGames: B } = selectGames(i, A, m);
      if (!p.length) throw new Error("No games available to select");
      const y = p.length;
      let _ = 0;
      const I = Math.ceil(y / g);
      updateStatus({
        running: !0,
        type: a,
        progress: 5,
        text: `Game Variety: Starting ${y} games...`,
      });
      for (let f = 0; f < I && !n.cancelled; f++) {
        const D = p.slice(f * g, (f + 1) * g),
          w = D.flatMap((x) => T.buildSession(x, 6e4));
        let S = await postBatch(
          s,
          e.host,
          e.token,
          u.analytics_token,
          T.superProps,
          r,
          w,
        );
        if (S === 429) {
          (updateStatus({
            running: !0,
            type: a,
            progress: Math.round((_ / y) * 90),
            text: "Rate limited \xB7 cooling down 5s...",
          }),
            await c(5e3),
            f--);
          continue;
        }
        if (S === 204) {
          _ += D.length;
          const x = Math.round((_ / y) * 95);
          updateStatus({
            running: !0,
            type: a,
            progress: x,
            text: `Game Variety: ${_}/${y} games (${x}%)`,
          });
        } else {
          if (S === 401 || S === 403)
            throw new Error(`Auth rejected [${S}] \xB7 refresh Discord tab`);
          console.warn(`[Lille] Batch ${f + 1} response: ${S}`);
        }
        await c(v);
      }
      (await saveUsedGames(B),
        await updateStats(_, 0),
        updateStatus({
          running: !1,
          completed: !0,
          progress: 100,
          text: `Complete: ${_}/${y} games played! (updates in ~1\u20133 days)`,
        }));
      return;
    }
    if (a === "time" && !n.cancelled) {
      const A = Math.max(1, t.hoursToAdd || 5e3),
        p = A === 1 ? 1 : 2,
        B = Math.ceil(A / p),
        { selectedGames: y, newUsedGames: _ } = selectGames(i, B, m);
      if (!y.length) throw new Error("No games available to select");
      const I = Math.floor(p * 3600 * 1e3),
        f = y.length,
        D = f * p;
      let w = 0;
      const S = Math.ceil(f / g);
      updateStatus({
        running: !0,
        type: a,
        progress: 5,
        text: `Game Time: Claiming ${p}h on ${f} games (~${D.toLocaleString()}h total)...`,
      });
      for (let U = 0; U < S && !n.cancelled; U++) {
        const E = y.slice(U * g, (U + 1) * g),
          b = E.flatMap((G) => T.buildSession(G, I));
        let k = await postBatch(
          s,
          e.host,
          e.token,
          u.analytics_token,
          T.superProps,
          r,
          b,
        );
        if (k === 429) {
          (updateStatus({
            running: !0,
            type: a,
            progress: Math.round((w / f) * 90),
            text: "Rate limited \xB7 cooling down 5s...",
          }),
            await c(5e3),
            U--);
          continue;
        }
        if (k === 204) {
          w += E.length;
          const G = w * p,
            $ = Math.round((w / f) * 95);
          updateStatus({
            running: !0,
            type: a,
            progress: $,
            text: `Game Time: ${G.toLocaleString()}h claimed \xB7 batch ${U + 1}/${S}`,
          });
        } else {
          if (k === 401 || k === 403)
            throw new Error(`Auth rejected [${k}] \xB7 refresh Discord tab`);
          console.warn(`[Lille] Batch ${U + 1} response: ${k}`);
        }
        await c(v);
      }
      await saveUsedGames(_);
      const x = w * p;
      (await updateStats(w, x),
        updateStatus({
          running: !1,
          completed: !0,
          progress: 100,
          text: `Complete: ${x.toLocaleString()}h claimed on ${w} games! (updates in ~1\u20133 days)`,
        }));
      return;
    }
    if (a === "both" && !n.cancelled) {
      const { selectedGames: p, newUsedGames: B } = selectGames(i, 115, m),
        y = Math.ceil(p.length / g);
      let _ = 0;
      for (let b = 0; b < y && !n.cancelled; b++) {
        const k = p.slice(b * g, (b + 1) * g),
          G = k.flatMap((O) => T.buildSession(O, 6e4));
        let $ = await postBatch(
          s,
          e.host,
          e.token,
          u.analytics_token,
          T.superProps,
          r,
          G,
        );
        if ($ === 429) {
          (await c(5e3), b--);
          continue;
        }
        $ === 204 && (_ += k.length);
        const C = Math.round((_ / p.length) * 45);
        (updateStatus({
          running: !0,
          type: a,
          progress: C,
          text: `Game Variety: ${_}/${p.length} games`,
        }),
          await c(v));
      }
      if ((await saveUsedGames(B), await updateStats(_, 0), n.cancelled))
        return;
      const I = 5e3,
        f = 2,
        D = Math.ceil(I / f),
        { selectedGames: w, newUsedGames: S } = selectGames(i, D, B),
        x = Math.ceil(w.length / g),
        U = Math.floor(f * 3600 * 1e3);
      let E = 0;
      for (let b = 0; b < x && !n.cancelled; b++) {
        const k = w.slice(b * g, (b + 1) * g),
          G = k.flatMap((O) => T.buildSession(O, U));
        let $ = await postBatch(
          s,
          e.host,
          e.token,
          u.analytics_token,
          T.superProps,
          r,
          G,
        );
        if ($ === 429) {
          (await c(5e3), b--);
          continue;
        }
        $ === 204 && (E += k.length);
        const C = Math.round(45 + (E / w.length) * 50);
        (updateStatus({
          running: !0,
          type: a,
          progress: C,
          text: `Game Time: ${(E * f).toLocaleString()}h claimed`,
        }),
          await c(v));
      }
      (await saveUsedGames(S),
        await updateStats(E, E * f),
        updateStatus({
          running: !1,
          completed: !0,
          progress: 100,
          text: "Complete: Variety + 5,000h claimed!",
        }));
    }
  } catch (d) {
    updateStatus({ running: !1, error: !0, text: d.message });
  } finally {
    ((n.running = !1), (activeTask = null));
  }
}
chrome.runtime.onMessage.addListener((a, t, e) => {
  if (a.type === "GET_STATE") return (getState(a.refresh || !1).then(e), !0);
  if (a.type === "START_FORGE") {
    const { type: s = "time", params: n = {} } = a.payload || {};
    return (
      runForge(s, n)
        .then(() => e({ started: !0 }))
        .catch((c) => e({ started: !1, error: c.message })),
      !0
    );
  }
  if (a.type === "RESET_USED_GAMES")
    return (saveUsedGames([]).then(() => e({ ok: !0 })), !0);
  if (a.type === "CANCEL_FORGE")
    return (
      activeTask && (activeTask.cancelled = !0),
      e({ cancelled: !0 }),
      !0
    );
});
