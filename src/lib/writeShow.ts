/** Unique talk-radio script from public research. No login. */

export type ResearchBit = {
  title: string;
  text: string;
  source: string;
};

export type WrittenShow = {
  title: string;
  summary: string;
  script: string;
  sources: string[];
};

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
    .filter((s) => s.length > 40 && s.length < 320)
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

async function wikiSearch(q: string): Promise<string[]> {
  const url =
    "https://en.wikipedia.org/w/api.php?action=query&list=search&utf8=1&format=json&origin=*" +
    `&srlimit=5&srsearch=${encodeURIComponent(q)}`;
  const res = await fetch(url);
  if (!res.ok) return [];
  const data = await res.json();
  return (data?.query?.search || []).map((s: any) => String(s.title || "")).filter(Boolean);
}

async function wikiExtract(title: string): Promise<ResearchBit | null> {
  const url =
    "https://en.wikipedia.org/w/api.php?action=query&prop=extracts|description&exintro=0&explaintext=1&exchars=1800" +
    `&format=json&origin=*&redirects=1&titles=${encodeURIComponent(title)}`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const data = await res.json();
  const pages = data?.query?.pages || {};
  const page = Object.values(pages)[0] as any;
  if (!page || page.missing || !page.extract) return null;
  return {
    title: page.title || title,
    text: String(page.extract),
    source: `Wikipedia: ${page.title || title}`,
  };
}

async function hnHits(q: string, front: boolean): Promise<ResearchBit[]> {
  const url = front
    ? "https://hn.algolia.com/api/v1/search?tags=front_page&hitsPerPage=8"
    : `https://hn.algolia.com/api/v1/search?query=${encodeURIComponent(q)}&tags=story&hitsPerPage=6`;
  const res = await fetch(url);
  if (!res.ok) return [];
  const data = await res.json();
  return (data?.hits || [])
    .filter((h: any) => h.title && (h.url || h.story_text || h.title))
    .slice(0, 6)
    .map((h: any) => ({
      title: String(h.title),
      text: `${h.title}. ${h.story_text || ""} Points ${h.points || 0}. ${h.url || ""}`.trim(),
      source: `Hacker News: ${h.title}`,
    }));
}

export async function researchTopic(
  topic: string,
  onEvent?: (ev: any) => void,
): Promise<ResearchBit[]> {
  const q = cleanQuery(topic) || topic.trim();
  const wantHn = /hacker news|\bhn\b|front page/i.test(topic);
  const bits: ResearchBit[] = [];
  const seen = new Set<string>();
  const add = (b: ResearchBit | null) => {
    if (!b || !b.text) return;
    const key = b.title.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    bits.push(b);
  };

  onEvent?.({ type: "info", message: `Researching “${q.slice(0, 80)}”...` });

  try {
    if (wantHn) {
      onEvent?.({ type: "info", message: "Pulling Hacker News front page..." });
      for (const h of await hnHits(q, true)) add(h);
    }
  } catch {
    /* keep going */
  }

  try {
    const titles = await wikiSearch(q);
    onEvent?.({ type: "info", message: `Wikipedia hits: ${titles.slice(0, 3).join(" · ") || "none"}` });
    for (const title of titles.slice(0, 4)) {
      add(await wikiExtract(title));
    }
  } catch {
    /* keep going */
  }

  if (!wantHn) {
    try {
      for (const h of await hnHits(q, false)) add(h);
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

function targetTurns(duration: string): number {
  const n = parseFloat(duration) || 3;
  return Math.max(8, Math.min(28, Math.round(n * 3.2)));
}

export function writeUniqueScript(
  topic: string,
  duration: string,
  mood: string,
  bits: ResearchBit[],
): WrittenShow {
  const rand = rng(topic + "|" + duration + "|" + mood + "|" + (bits[0]?.title || ""));
  const facts = factPool(bits);
  const callers = pickCallers(topic, 3);
  const chill = /chill|late|calm|quiet|night/i.test(mood);
  const debate = /debate|argument|hot/i.test(mood) || rand() > 0.5;
  const main = bits[0]?.title || cleanQuery(topic) || "Tonight's brief";
  const title = main.length > 72 ? main.slice(0, 69) + "…" : main;
  const need = Math.max(6, targetTurns(duration) - 4);
  while (facts.length < need) {
    facts.push(
      `${main} still has to be checked against a file you can open tomorrow, not a slogan.`,
    );
  }
  const used = facts.slice(0, need);
  const summary = used
    .slice(0, 2)
    .join(" ")
    .slice(0, 320);

  const lines: string[] = [`# ${title}`, ""];
  const hook = used[0];
  if (chill) {
    lines.push(
      `Paul: Settle in. Quiet desk. Tonight we are looking at ${title}. ${hook}`,
    );
  } else {
    lines.push(`Paul: ${hook} That is the thread tonight. ${title}.`);
  }
  lines.push(
    `Paul: On the line: ${callers[0].name} in ${callers[0].city}, ${callers[1].name} in ${callers[1].city}, and ${callers[2].name} in ${callers[2].city}. ${callers[0].name}, you first.`,
  );

  let factI = 1;
  let speakerI = 0;
  const remaining = Math.max(4, targetTurns(duration) - 3);
  for (let i = 0; i < remaining; i++) {
    if (i % 3 === 2) {
      const next = callers[(speakerI + 1) % callers.length];
      lines.push(
        `Paul: ${next.name} in ${next.city}. ${debate ? "Push back if you have to." : "Take the next piece."}`,
      );
    } else {
      const who = callers[speakerI % callers.length];
      const fact = used[factI % used.length];
      factI++;
      const messy = who.name !== "Priya";
      const take = spoken(fact, messy, rand);
      const disagree =
        debate && i % 4 === 3
          ? " I do not buy the tidy version of that."
          : "";
      lines.push(`${who.name}: ${who.tag} ${take}${disagree}`);
      speakerI++;
    }
  }

  const last = used[Math.min(used.length - 1, 2)];
  lines.push(
    `Paul: ${last} My thanks to ${callers.map((c) => c.name).join(", ")}. This is AI Talk Radio. ${title}.`,
  );

  return {
    title,
    summary:
      summary ||
      `A roundtable on ${title}. ${callers.map((c) => c.name).join(", ")} with Paul at the desk.`,
    script: lines.join("\n"),
    sources: [...new Set(bits.map((b) => b.source))],
  };
}
