/** Browser Wayback gatherer for the public Signal desk.
 *
 * Mirrors the console harness contract (Δ9Φ963-LYGO-WAYBACK-HARNESS-v1):
 * public http(s) only, availability before the CDX index, never claim
 * "unarchived" from one empty answer. This file talks to Internet Archive
 * over CORS GET. It does not import the console.
 *
 * Measured door: archive.org/wayback/available sends Access-Control-Allow-Origin: *.
 * CDX / TimeGate / snapshot HTML usually do not; those are attempted with a
 * short abort and skipped when the browser cannot read them.
 */

export type ArchiveBit = {
  title: string;
  text: string;
  source: string;
};

export const WAYBACK_SIGNATURE = "Δ9Φ963-LYGO-WAYBACK-DESK-v1";
export const AVAILABILITY_URL = "https://archive.org/wayback/available";
export const DOC_AVAILABILITY = "https://archive.org/help/wayback_api.php";
export const DOC_MEMENTO = "https://timetravel.mementoweb.org/guide/api/";

export const STATION_URLS = [
  "https://chatagent.ca/",
  "https://chatagent.ca/talk-radio/",
  "https://chatagent.ca/signal/",
];

const SIGNAL_CATALOG = "https://chatagent.ca/signal/shows.json";

const PRIVATE_HOST =
  /^(localhost|127\.0\.0\.1|0\.0\.0\.0|::1)$|\.local$|\.internal$|^(10\.|192\.168\.|172\.(1[6-9]|2\d|3[0-1])\.|169\.254\.)/i;

const PLACEHOLDER =
  /^(example|example\.com|example\.org|example\.net)$|\.example$/i;

export type ArchiveHit = {
  url: string;
  available: boolean;
  timestamp: string;
  status: string;
  snapshot: string;
  via: string;
  checked: string[];
};

function abortMs(ms: number): AbortSignal {
  const timeout = (AbortSignal as unknown as { timeout?: (n: number) => AbortSignal }).timeout;
  if (typeof timeout === "function") return timeout(ms);
  const ctrl = new AbortController();
  setTimeout(() => ctrl.abort(), ms);
  return ctrl.signal;
}

export function cleanTarget(raw: string): string | null {
  let text = String(raw || "")
    .trim()
    .replace(/[<>]/g, "")
    .replace(/[),.;]+$/, "");
  if (!text || text.length > 2000) return null;
  if (/[\r\n\t]/.test(text) || text.includes(" ")) return null;
  if (!/^[a-z][a-z0-9+.-]*:/i.test(text)) text = "https://" + text.replace(/^\/+/, "");
  let parsed: URL;
  try {
    parsed = new URL(text);
  } catch {
    return null;
  }
  const scheme = parsed.protocol.replace(":", "").toLowerCase();
  if (scheme !== "http" && scheme !== "https") return null;
  const host = (parsed.hostname || "").toLowerCase();
  if (!host || PRIVATE_HOST.test(host) || PLACEHOLDER.test(host)) return null;
  parsed.hash = "";
  return parsed.toString();
}

export function extractUrls(topic: string): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  const add = (raw: string) => {
    const url = cleanTarget(raw);
    if (!url) return;
    const key = url.replace(/\/+$/, "").toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    out.push(url);
  };
  const text = String(topic || "");
  for (const m of text.match(/https?:\/\/[^\s<>"']+/gi) || []) add(m);
  for (const m of text.match(/\b(?:www\.)?[a-z0-9][a-z0-9.-]+\.[a-z]{2,}(?:\/[^\s<>"']*)?/gi) || []) {
    if (/^(?:png|jpg|jpeg|gif|webp|mp3|mp4|wav)$/i.test(m)) continue;
    add(m);
  }
  return out;
}

export function prettyTimestamp(ts: string): string {
  const d = String(ts || "").replace(/\D/g, "").padEnd(8, "0").slice(0, 14);
  if (d.length < 8) return ts || "";
  const y = d.slice(0, 4);
  const mo = d.slice(4, 6);
  const day = d.slice(6, 8);
  const hh = d.slice(8, 10);
  const mm = d.slice(10, 12);
  if (hh) return `${y}-${mo}-${day} ${hh}:${mm || "00"} UTC`;
  return `${y}-${mo}-${day}`;
}

function httpsSnapshot(url: string, timestamp: string): string {
  const ts = String(timestamp || "").replace(/\D/g, "") || "2";
  const target = url.replace(/^https?:\/\//i, "");
  return `https://web.archive.org/web/${ts}/${url.startsWith("http") ? url : "https://" + target}`;
}

export async function available(target: string, timeoutMs = 8000): Promise<ArchiveHit | null> {
  const url = cleanTarget(target);
  if (!url) return null;
  const endpoint = `${AVAILABILITY_URL}?url=${encodeURIComponent(url)}`;
  try {
    const res = await fetch(endpoint, { signal: abortMs(timeoutMs), cache: "no-store" });
    if (!res.ok) return { url, available: false, timestamp: "", status: "", snapshot: "", via: "availability API", checked: ["availability API"] };
    const data = await res.json();
    const closest = data?.archived_snapshots?.closest || {};
    const snap = String(closest.url || "").replace(/^http:\/\//i, "https://");
    const ts = String(closest.timestamp || "");
    const ok = Boolean(closest.available) && Boolean(snap || ts);
    return {
      url: String(data?.url || url),
      available: ok,
      timestamp: ts,
      status: String(closest.status || ""),
      snapshot: snap || (ts ? httpsSnapshot(url, ts) : ""),
      via: "availability API",
      checked: ["availability API"],
    };
  } catch {
    return null;
  }
}

async function tryTimegate(target: string, timeoutMs = 4000): Promise<ArchiveHit | null> {
  const url = cleanTarget(target);
  if (!url) return null;
  try {
    const res = await fetch(`https://web.archive.org/web/${url}`, {
      method: "GET",
      redirect: "manual",
      signal: abortMs(timeoutMs),
      cache: "no-store",
    });
    const loc = res.headers.get("Location") || res.headers.get("location") || "";
    const m = loc.match(/\/web\/(\d{8,14})\//);
    if (!m) return null;
    return {
      url,
      available: true,
      timestamp: m[1],
      status: String(res.status),
      snapshot: loc.startsWith("http") ? loc.replace(/^http:\/\//i, "https://") : httpsSnapshot(url, m[1]),
      via: "memento timegate",
      checked: ["memento timegate"],
    };
  } catch {
    return null;
  }
}

function stripHtml(html: string): string {
  return String(html || "")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

async function trySnapshotText(hit: ArchiveHit, timeoutMs = 5000): Promise<string> {
  if (!hit.timestamp || !hit.url) return "";
  const raw = `https://web.archive.org/web/${hit.timestamp}id_/${hit.url}`;
  try {
    const res = await fetch(raw, { signal: abortMs(timeoutMs), cache: "no-store" });
    if (!res.ok) return "";
    const buf = await res.arrayBuffer();
    const text = new TextDecoder("utf-8", { fatal: false }).decode(buf.slice(0, 80_000));
    return stripHtml(text).slice(0, 1600);
  } catch {
    return "";
  }
}

export function wantsStationArchive(topic: string): boolean {
  return /lygo|signal|chatagent|lattice|Δ9|talk.?radio|wayback|internet archive|excavationpro/i.test(
    topic,
  );
}

export async function readSignalCatalog(timeoutMs = 5000): Promise<ArchiveBit | null> {
  try {
    const res = await fetch(SIGNAL_CATALOG, { signal: abortMs(timeoutMs), cache: "no-store" });
    if (!res.ok) return null;
    const data = await res.json();
    const shows = Array.isArray(data?.shows) ? data.shows : [];
    if (!shows.length) return null;
    const titles = shows
      .slice(0, 12)
      .map((s: any) => String(s.title || s.slug || "").trim())
      .filter(Boolean);
    const network = String(data.network || "LYGO Signal");
    const hub = String(data.hub || "https://chatagent.ca/signal/");
    const text = `${network} public catalog (${shows.length} episodes, updated ${data.updated || "unknown"}). Hub ${hub}. On the dial: ${titles.join("; ")}.`;
    return {
      title: `${network} catalog`,
      text,
      source: `LYGO Signal catalog: ${hub}`,
    };
  } catch {
    return null;
  }
}

function bitFromHit(hit: ArchiveHit, body: string): ArchiveBit {
  const when = prettyTimestamp(hit.timestamp);
  const host = (() => {
    try {
      return new URL(hit.url).hostname;
    } catch {
      return hit.url;
    }
  })();
  const receipt = `Internet Archive capture of ${hit.url} dated ${when || "unknown"}. Status ${hit.status || "n/a"}. Via ${hit.via}. Snapshot ${hit.snapshot}. ${WAYBACK_SIGNATURE}.`;
  const text = body ? `${receipt} Archived page text: ${body}` : receipt;
  return {
    title: `Archive: ${host} ${when}`.trim(),
    text,
    source: `Wayback Machine: ${hit.snapshot || hit.url}`,
  };
}

async function closestPublic(target: string): Promise<ArchiveHit | null> {
  const checked: string[] = [];
  const gate = await tryTimegate(target);
  if (gate?.available) {
    gate.checked = ["memento timegate"];
    return gate;
  }
  if (gate === null) checked.push("memento timegate (unread — CORS or timeout)");
  else checked.push("memento timegate");

  const av = await available(target);
  if (av?.available) {
    av.checked = [...checked, "availability API"];
    return av;
  }
  if (av) {
    av.checked = [...checked, "availability API"];
    av.via = "availability API (empty — CDX not asked in the browser)";
    return av;
  }
  return {
    url: target,
    available: false,
    timestamp: "",
    status: "",
    snapshot: "",
    via: "no door readable",
    checked: [...checked, "availability API (unreachable)"],
  };
}

export async function researchWayback(
  topic: string,
  extraUrls: string[] = [],
  minutes = 5,
  onEvent?: (ev: { type: string; message: string }) => void,
): Promise<ArchiveBit[]> {
  const cap = minutes >= 15 ? 6 : minutes >= 10 ? 5 : 4;
  const targets: string[] = [];
  const seen = new Set<string>();
  const push = (raw: string) => {
    const url = cleanTarget(raw);
    if (!url) return;
    const key = url.replace(/\/+$/, "").toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    targets.push(url);
  };

  for (const u of extractUrls(topic)) push(u);
  for (const u of extraUrls) push(u);
  if (wantsStationArchive(topic) || targets.length === 0) {
    for (const u of STATION_URLS) push(u);
  }

  const ask = targets.slice(0, cap);
  if (!ask.length) return [];

  onEvent?.({
    type: "info",
    message: `Wayback: ${ask.length} public URL${ask.length === 1 ? "" : "s"} via the Internet Archive availability door...`,
  });

  const hits = await Promise.all(ask.map((u) => closestPublic(u)));
  const bits: ArchiveBit[] = [];
  let captured = 0;
  let empty = 0;
  let unread = 0;

  for (const hit of hits) {
    if (!hit) {
      unread++;
      continue;
    }
    if (!hit.available) {
      empty++;
      bits.push({
        title: `Archive check: ${hit.url}`,
        text: `No capture was readable for ${hit.url} through ${hit.checked.join(" then ") || hit.via}. That is not a proof the page is unarchived; the CDX index is not queried from this public page (it is slow and the browser cannot read it). ${DOC_AVAILABILITY}`,
        source: `Wayback Machine: ${hit.url}`,
      });
      continue;
    }
    captured++;
    const body = await trySnapshotText(hit);
    bits.push(bitFromHit(hit, body));
  }

  onEvent?.({
    type: "info",
    message: `Wayback packed: ${captured} capture${captured === 1 ? "" : "s"}, ${empty} empty availability answer${empty === 1 ? "" : "s"}${unread ? `, ${unread} unread` : ""}.`,
  });

  return bits;
}
