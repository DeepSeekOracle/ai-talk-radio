/** Unique talk-radio script from public research. No login. */

import { extractUrls, readSignalCatalog, researchWayback, wantsStationArchive } from "./wayback";

export type ResearchBit = {
  title: string;
  text: string;
  source: string;
};

export type ShowTurn = { speaker: string; text: string };

export type WrittenShow = {
  title: string;
  summary: string;
  script: string;
  sources: string[];
  turns: ShowTurn[];
  leftover: string[];
  callers: Array<{ name: string; city: string; tag: string }>;
  targetSeconds: number;
  wordCount: number;
};

export function parseMinutes(duration: string): number {
  const n = parseFloat(String(duration || "5"));
  if (!Number.isFinite(n) || n <= 0) return 5;
  if (n >= 13) return 15;
  if (n >= 8) return 10;
  if (n >= 4) return 5;
  return 3;
}

/** Spoken-word budget. Chill Kokoro ~120–130 wpm plus gaps. */
export function targetWordsFor(minutes: number): number {
  return Math.round(minutes * 132);
}

export function targetSecondsFor(minutes: number): number {
  return minutes * 60;
}

export function countWords(text: string): number {
  return String(text || "")
    .replace(/\[[^\]]*\]/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
}

const CALLERS = [
  { name: "Clara", city: "Edinburgh", tag: "[Female] [Accent: Scottish]" },
  { name: "Marcus", city: "Toronto", tag: "[Male] [Accent: Canadian]" },
  { name: "Elena", city: "Berlin", tag: "[Female] [Accent: German]" },
  { name: "Theo", city: "Austin", tag: "[Male] [Accent: Texan]" },
  { name: "Priya", city: "Bangalore", tag: "[Female] [Accent: Indian]" },
  { name: "Maya", city: "Vancouver", tag: "[Female] [Accent: Canadian]" },
  { name: "Sam", city: "Chicago", tag: "[Male] [Accent: Midwestern US]" },
  { name: "Chloe", city: "Seattle", tag: "[Female] [Accent: Pacific Northwest]" },
  { name: "Raj", city: "Dublin", tag: "[Male] [Accent: Irish]" },
  { name: "Julian", city: "Boston", tag: "[Male] [Accent: New England]" },
  { name: "Maeve", city: "Sydney", tag: "[Female] [Accent: Australian]" },
  { name: "Devon", city: "Portland", tag: "[Male] [Accent: American]" },
];

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}

function rng(seed: string): () => number {
  let x = hash(seed) || 1;
  return () => {
    x = (Math.imul(x, 1664525) + 1013904223) >>> 0;
    return x / 4294967296;
  };
}

function pickCallers(topic: string, n: number) {
  const rand = rng(topic);
  const pool = [...CALLERS];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, n);
}

function sentences(text: string): string[] {
  return String(text || "")
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 28 && s.length < 420)
    .filter((s) => !/cookie|subscribe|sign up|newsletter/i.test(s));
}

function spoken(fact: string, messy: boolean, rand: () => number): string {
  let t = fact.replace(/\[[^\]]*\]/g, "").replace(/\s+/g, " ").trim();
  t = t.replace(/^["']|["']$/g, "");
  if (!/[.!?]$/.test(t)) t += ".";
  if (!messy) return t;
  const openers = [
    "Look, ",
    "I mean... ",
    "Okay so, ",
    "Right, so ",
    "Here's the thing. ",
    "Uh, ",
  ];
  const mids = [" you know,", " like,", " I guess,", " honestly,"];
  let out = openers[Math.floor(rand() * openers.length)] + t.charAt(0).toLowerCase() + t.slice(1);
  if (rand() > 0.45 && out.length > 80) {
    const cut = Math.floor(out.length * 0.45);
    const sp = out.indexOf(" ", cut);
    if (sp > 0) out = out.slice(0, sp) + mids[Math.floor(rand() * mids.length)] + out.slice(sp);
  }
  return out.replace(/\s+/g, " ").trim();
}

function cleanQuery(topic: string): string {
  return topic
    .replace(/https?:\/\/\S+/g, " ")
    .replace(/generate a radio show[^.]*?(?:about|called|on|:)?/gi, " ")
    .replace(/based on top hacker news stories/gi, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 180);
}

const STOP = new Set(
  "a an and are as at be by for from how if in into is it its just now of on or the this to was were what when where which who why with about generate radio show called based top hacker news stories please make me talk segment discussion podcast episode write a full minutes minute".split(
    " ",
  ),
);

function titleCase(s: string): string {
  return s
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => (w === w.toUpperCase() && w.length > 1 ? w : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()))
    .join(" ");
}

/** Short noun phrase from the user's prompt — never a Wikipedia headline. */
export function topicCore(topic: string): string {
  const q = cleanQuery(topic);
  const words = q
    .replace(/['’]/g, "")
    .split(/[^A-Za-z0-9ΔΦ0-9]+/)
    .filter((w) => w.length > 1 && !STOP.has(w.toLowerCase()));
  const keep = words.slice(0, 6);
  return titleCase(keep.join(" ")) || "Open Hour";
}

/**
 * Unique episode title for this generation.
 * Station identity stays LYGO Signal; the episode name is minted from the prompt.
 */
export function mintEpisodeTitle(
  topic: string,
  mood: string,
  minutes: number,
  rand: () => number,
): string {
  const core = topicCore(topic);
  const chill = /chill|late|calm|quiet|night/i.test(mood);
  const frames = chill
    ? [
        `Late Desk: ${core}`,
        `Quiet Hour — ${core}`,
        `On the Dial: ${core}`,
        `LYGO Signal: ${core}`,
        `The ${core} Watch`,
      ]
    : [
        core,
        `The ${core}`,
        `Studio Desk: ${core}`,
        `LYGO Signal — ${core}`,
        `${core} on the Dial`,
        `Roundtable: ${core}`,
        `${minutes} Minutes on ${core}`,
        `The ${core} Brief`,
      ];
  let title = frames[Math.floor(rand() * frames.length)];
  if (title.length > 64) title = core.length > 64 ? core.slice(0, 61) + "…" : core;
  return title;
}

export function mintEpisodeSummary(
  title: string,
  minutes: number,
  callers: Array<{ name: string }>,
): string {
  const names = callers.map((c) => c.name).join(", ");
  return `LYGO Signal reads your prompt as a live ${minutes}-minute desk. ${title}. ${names} take the roundtable until the clock is honest.`;
}

async function wikiSearch(q: string, limit: number): Promise<string[]> {
  const url =
    "https://en.wikipedia.org/w/api.php?action=query&list=search&utf8=1&format=json&origin=*" +
    `&srlimit=${Math.max(5, Math.min(15, limit))}&srsearch=${encodeURIComponent(q)}`;
  const res = await fetch(url);
  if (!res.ok) return [];
  const data = await res.json();
  return (data?.query?.search || []).map((s: any) => String(s.title || "")).filter(Boolean);
}

async function wikiExtractMany(titles: string[]): Promise<ResearchBit[]> {
  const out: ResearchBit[] = [];
  for (let i = 0; i < titles.length; i += 8) {
    const chunk = titles.slice(i, i + 8);
    const url =
      "https://en.wikipedia.org/w/api.php?action=query&prop=extracts&exintro=0&explaintext=1&exchars=5000" +
      `&format=json&origin=*&redirects=1&titles=${chunk.map(encodeURIComponent).join("|")}`;
    const res = await fetch(url);
    if (!res.ok) continue;
    const data = await res.json();
    const pages = data?.query?.pages || {};
    for (const page of Object.values(pages) as any[]) {
      if (!page || page.missing || !page.extract) continue;
      out.push({
        title: page.title,
        text: String(page.extract),
        source: `Wikipedia: ${page.title}`,
      });
    }
  }
  return out;
}

async function hnHits(q: string, front: boolean, limit: number): Promise<ResearchBit[]> {
  const url = front
    ? `https://hn.algolia.com/api/v1/search?tags=front_page&hitsPerPage=${limit}`
    : `https://hn.algolia.com/api/v1/search?query=${encodeURIComponent(q)}&tags=story&hitsPerPage=${limit}`;
  const res = await fetch(url);
  if (!res.ok) return [];
  const data = await res.json();
  return (data?.hits || [])
    .filter((h: any) => h.title && (h.url || h.story_text || h.title))
    .slice(0, limit)
    .map((h: any) => ({
      title: String(h.title),
      text: `${h.title}. ${h.story_text || h.comment_text || ""} Points ${h.points || 0}. ${h.num_comments || 0} comments. ${h.url || ""}`.trim(),
      source: `Hacker News: ${h.title}`,
    }));
}

export async function researchTopic(
  topic: string,
  onEvent?: (ev: any) => void,
  minutes = 5,
): Promise<ResearchBit[]> {
  const q = cleanQuery(topic) || topic.trim();
  const wantHn = /hacker news|\bhn\b|front page/i.test(topic);
  const wikiN = minutes >= 15 ? 12 : minutes >= 10 ? 8 : 5;
  const hnN = minutes >= 10 ? 12 : 8;
  const bits: ResearchBit[] = [];
  const seen = new Set<string>();
  const add = (b: ResearchBit | null) => {
    if (!b || !b.text) return;
    const key = b.title.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    bits.push(b);
  };

  onEvent?.({
    type: "info",
    message: `Researching a full ${minutes}-minute show on “${q.slice(0, 80)}”...`,
  });

  let hnBits: ResearchBit[] = [];
  let wikiTitles: string[] = [];

  try {
    if (wantHn) {
      onEvent?.({ type: "info", message: "Pulling Hacker News front page..." });
      hnBits = await hnHits(q, true, hnN);
      for (const h of hnBits) add(h);
    }
  } catch {
    /* keep going */
  }

  try {
    wikiTitles = await wikiSearch(q, wikiN);
    onEvent?.({ type: "info", message: `Wikipedia hits: ${wikiTitles.slice(0, 4).join(" · ") || "none"}` });
    for (const b of await wikiExtractMany(wikiTitles.slice(0, wikiN))) add(b);
  } catch {
    /* keep going */
  }

  if (!wantHn) {
    try {
      hnBits = await hnHits(q, false, hnN);
      for (const h of hnBits) add(h);
    } catch {
      /* keep going */
    }
  }

  const extraArchive: string[] = [];
  for (const h of hnBits) {
    const fromHn = extractUrls(h.text);
    for (const u of fromHn) extraArchive.push(u);
  }
  for (const title of wikiTitles.slice(0, 3)) {
    extraArchive.push(`https://en.wikipedia.org/wiki/${encodeURIComponent(title.replace(/ /g, "_"))}`);
  }

  try {
    for (const b of await researchWayback(topic, extraArchive, minutes, onEvent)) add(b);
  } catch {
    /* keep going */
  }

  if (wantsStationArchive(topic) || bits.length < 3) {
    try {
      const catalog = await readSignalCatalog();
      if (catalog) add(catalog);
    } catch {
      /* keep going */
    }
  }

  if (!bits.length) {
    add({
      title: q.slice(0, 80) || "Studio notes",
      text: topic.trim(),
      source: "operator prompt",
    });
  }
  onEvent?.({
    type: "info",
    message: `Research packed: ${bits.length} sources, ${factPool(bits).length} usable lines.`,
  });
  return bits;
}

function factPool(bits: ResearchBit[]): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const b of bits) {
    const ss = sentences(b.text);
    if (!ss.length && b.text) ss.push(b.text.slice(0, 240));
    for (const s of ss) {
      const k = s.toLowerCase().slice(0, 80);
      if (seen.has(k)) continue;
      seen.add(k);
      out.push(s);
    }
  }
  return out;
}

function packTurn(facts: string[], start: number, n: number, messy: boolean, rand: () => number): { text: string; next: number } {
  const parts: string[] = [];
  let i = start;
  const take = Math.max(2, n);
  for (let k = 0; k < take && i < facts.length; k++, i++) {
    parts.push(spoken(facts[i], messy && k === 0, rand));
  }
  if (!parts.length && facts.length) {
    parts.push(spoken(facts[start % facts.length], messy, rand));
    i = start + 1;
  }
  return { text: parts.join(" "), next: i };
}

function stretchFacts(facts: string[], title: string, need: number): string[] {
  const out = [...facts];
  const frames = [
    (f: string) => `Hold that against a machine you own. ${f} If you cannot open the file later, it is only a story.`,
    (f: string) => `The careful version is slower. ${f} Time is the scarce resource, not the slogan.`,
    (f: string) => `Someone will try to wrap this in a product. ${f} The desk still has to run without that wrapper.`,
    (f: string) => `I keep coming back to the receipt. ${f} A hash, a log, a page you can quote.`,
    (f: string) => `There is a tidy demo and then there is Tuesday. ${f} Tuesday is the one that counts.`,
    (f: string) => `For ${title}, the public write-up is only the start. ${f} The work is what you can repeat.`,
  ];
  let i = 0;
  while (out.length < need) {
    const f = facts[i % Math.max(1, facts.length)] || `${title} is the thread.`;
    out.push(frames[i % frames.length](f));
    i++;
  }
  return out;
}

function toScript(title: string, turns: ShowTurn[]): string {
  return [`# ${title}`, "", ...turns.map((t) => `${t.speaker}: ${t.text}`)].join("\n");
}

function wordsInTurns(turns: ShowTurn[]): number {
  return turns.reduce((n, t) => n + countWords(t.text), 0);
}

export function writeMoreTurns(
  written: WrittenShow,
  extraWords: number,
  seed: string,
): ShowTurn[] {
  const rand = rng(seed + "|more|" + extraWords);
  const facts = written.leftover.length ? written.leftover : stretchFacts([], written.title, 24);
  const callers = written.callers;
  const out: ShowTurn[] = [];
  let fi = 0;
  let si = 0;
  let words = 0;
  let guard = 0;
  while (words < extraWords && guard < 80) {
    guard++;
    if (guard % 3 === 0) {
      const next = callers[(si + 1) % callers.length];
      const q = `Stay with ${next.name} in ${next.city}. What still has to be true after the demo for ${written.title}?`;
      out.push({ speaker: "Paul", text: q });
      words += countWords(q);
      continue;
    }
    const who = callers[si % callers.length];
    si++;
    const pack = packTurn(facts, fi, 3, who.name !== "Priya", rand);
    fi = pack.next % Math.max(1, facts.length);
    out.push({ speaker: who.name, text: `${who.tag} ${pack.text}` });
    words += countWords(pack.text);
  }
  written.leftover = facts.slice(fi);
  return out;
}

export function writeUniqueScript(
  topic: string,
  duration: string,
  mood: string,
  bits: ResearchBit[],
): WrittenShow {
  const minutes = parseMinutes(duration);
  const targetWords = targetWordsFor(minutes);
  const targetSeconds = targetSecondsFor(minutes);
  const salt = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const rand = rng(topic + "|" + minutes + "|" + mood + "|" + salt);
  const rawFacts = factPool(bits);
  const facts = stretchFacts(rawFacts, bits[0]?.title || cleanQuery(topic), Math.ceil(targetWords / 18));
  const callers = pickCallers(topic + salt, 3);
  const chill = /chill|late|calm|quiet|night/i.test(mood);
  const debate = /debate|argument|hot/i.test(mood) || minutes >= 10;
  const title = mintEpisodeTitle(topic, mood, minutes, rand);

  const turns: ShowTurn[] = [];
  const hook = facts[0];
  if (chill) {
    turns.push({
      speaker: "Paul",
      text: `Settle in. Quiet desk. We have ${minutes} minutes, and we are going to use them. Tonight is ${title}. ${spoken(hook, false, rand)} I want this fully talked through, not a teaser.`,
    });
  } else {
    turns.push({
      speaker: "Paul",
      text: `${spoken(hook, false, rand)} That is the thread tonight: ${title}. We have ${minutes} minutes on the clock. Stay with the facts.`,
    });
  }
  turns.push({
    speaker: "Paul",
    text: `On the line: ${callers[0].name} in ${callers[0].city}, ${callers[1].name} in ${callers[1].city}, and ${callers[2].name} in ${callers[2].city}. We will go round the table until the hour is honest. ${callers[0].name}, you first. Take more than a headline.`,
  });

  let factI = 1;
  let speakerI = 0;
  let guard = 0;
  while (wordsInTurns(turns) < targetWords - 90 && guard < 120) {
    guard++;
    if (guard % 4 === 0) {
      const next = callers[(speakerI + 1) % callers.length];
      const prompt = debate
        ? `${next.name} in ${next.city}, do not let that sit. If the claim is thin, say so, then put a better one on the table.`
        : `${next.name} in ${next.city}, keep going. Give us the next layer of ${title}, not a recap.`;
      turns.push({ speaker: "Paul", text: prompt });
      continue;
    }
    const who = callers[speakerI % callers.length];
    speakerI++;
    const pack = packTurn(facts, factI, 3, who.name !== "Priya", rand);
    factI = pack.next;
    const extra =
      debate && guard % 5 === 0 ? " I do not buy the tidy version of that. Walk it slower." : "";
    turns.push({ speaker: who.name, text: `${who.tag} ${pack.text}${extra}` });
  }

  const last = facts[Math.min(facts.length - 1, Math.max(2, factI - 1))];
  turns.push({
    speaker: "Paul",
    text: `${spoken(last, false, rand)} That is a full ${minutes} minutes on ${title}. My thanks to ${callers.map((c) => `${c.name} in ${c.city}`).join(", ")}. This is LYGO Signal. Keep the transmitter honest.`,
  });

  const leftover = facts.slice(factI);

  return {
    title,
    summary: mintEpisodeSummary(title, minutes, callers),
    script: toScript(title, turns),
    sources: [...new Set(bits.map((b) => b.source))],
    turns,
    leftover,
    callers,
    targetSeconds,
    wordCount: wordsInTurns(turns),
  };
}

export function appendClosing(written: WrittenShow, extra: ShowTurn[]): ShowTurn[] {
  const body = written.turns.slice(0, Math.max(0, written.turns.length - 1));
  const closing = written.turns[written.turns.length - 1];
  const all = [...body, ...extra];
  if (closing) all.push(closing);
  written.turns = all;
  written.script = toScript(written.title, all);
  written.wordCount = wordsInTurns(all);
  return extra;
}
