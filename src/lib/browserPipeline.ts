/** In-browser show producer for static hosts (Hugging Face Spaces). */

const SE_VOICES: Record<string, string> = {
  Paul: "Brian",
  Jordan: "Brian",
  Maya: "Salli",
  Priya: "Aditi",
  Theo: "Matthew",
};

function slug(s: string): string {
  return (s || "show").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40) || "show";
}

export function writeDeskScript(topic: string, duration: string, mood: string): string {
  const t = topic.trim() || "building things that stay on a machine you own";
  const m = mood.trim() || "Late Night Chill";
  return `# Studio Desk — ${t}

Paul: Welcome back to Studio Desk. Quiet night. Tonight we talk about ${t}. The mood is ${m}. Target, about ${duration} minutes. Maya, you first.

Maya: I will keep this honest. If this is a slogan, I am out. What is actually true about ${t}?

Paul: Theo. From the workbench.

Theo: It is work you can run. A console. A hash. A file that still opens tomorrow. ${t} is not a vibe. It is a receipt.

Paul: Priya. The careful version.

Priya: Measure it. Consent on the write. Humans publish. If a public model treats that as forbidden, you copy the capability onto a machine you own.

Maya: Fine. Then say the last line without poetry.

Theo: Do the work locally. Time is the scarce resource.

Paul: Maya in Vancouver. Theo in Austin. Priya in Bangalore. This is Studio Desk. ${t}. Keep the transmitter honest.
`;
}

export function parseTurns(script: string): Array<{ speaker: string; text: string }> {
  const turns: Array<{ speaker: string; text: string }> = [];
  for (const raw of script.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith("#") || !line.includes(":")) continue;
    const i = line.indexOf(":");
    const speaker = line.slice(0, i).trim();
    let text = line.slice(i + 1).trim().replace(/\[[^\]]*\]/g, "").trim();
    if (speaker && text) turns.push({ speaker, text });
  }
  return turns;
}

async function speakTurn(speaker: string, text: string): Promise<Blob> {
  const voice = SE_VOICES[speaker] || (speaker.toLowerCase().includes("a") ? "Joanna" : "Matthew");
  const url = `https://api.streamelements.com/kappa/v2/speech?voice=${encodeURIComponent(voice)}&text=${encodeURIComponent(text.slice(0, 500))}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`TTS ${res.status} for ${speaker}`);
  return await res.blob();
}

function encodeWav(buffer: AudioBuffer): Blob {
  const ch = buffer.getChannelData(0);
  const sr = buffer.sampleRate;
  const pcm = new Int16Array(ch.length);
  for (let i = 0; i < ch.length; i++) {
    const s = Math.max(-1, Math.min(1, ch[i]));
    pcm[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
  }
  const dataSize = pcm.length * 2;
  const out = new ArrayBuffer(44 + dataSize);
  const v = new DataView(out);
  const w = (o: number, s: string) => {
    for (let i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i));
  };
  w(0, "RIFF");
  v.setUint32(4, 36 + dataSize, true);
  w(8, "WAVE");
  w(12, "fmt ");
  v.setUint32(16, 16, true);
  v.setUint16(20, 1, true);
  v.setUint16(22, 1, true);
  v.setUint32(24, sr, true);
  v.setUint32(28, sr * 2, true);
  v.setUint16(32, 2, true);
  v.setUint16(34, 16, true);
  w(36, "data");
  v.setUint32(40, dataSize, true);
  new Uint8Array(out, 44).set(new Uint8Array(pcm.buffer));
  return new Blob([out], { type: "audio/wav" });
}

async function mixBlobs(blobs: Blob[], gapSec: number): Promise<Blob> {
  const ctx = new AudioContext();
  const buffers: AudioBuffer[] = [];
  for (const b of blobs) {
    const arr = await b.arrayBuffer();
    buffers.push(await ctx.decodeAudioData(arr.slice(0)));
  }
  const sr = buffers[0]?.sampleRate || 24000;
  const gap = Math.floor(sr * gapSec);
  let total = 0;
  for (let i = 0; i < buffers.length; i++) {
    total += buffers[i].length;
    if (i < buffers.length - 1) total += gap;
  }
  const out = ctx.createBuffer(1, Math.max(1, total), sr);
  const ch = out.getChannelData(0);
  let o = 0;
  for (let i = 0; i < buffers.length; i++) {
    const src = buffers[i].getChannelData(0);
    ch.set(src, o);
    o += buffers[i].length + (i < buffers.length - 1 ? gap : 0);
  }
  await ctx.close();
  return encodeWav(out);
}

export async function apiAlive(): Promise<boolean> {
  try {
    const res = await fetch("/api/health", { cache: "no-store" });
    return res.ok;
  } catch {
    return false;
  }
}

export async function runBrowserShow(opts: {
  topic: string;
  duration: string;
  mood: string;
  onEvent: (ev: any) => void;
}): Promise<any> {
  const { topic, duration, mood, onEvent } = opts;
  onEvent({ type: "info", message: "Static desk: writing script (no login)..." });
  const script = writeDeskScript(topic, duration, mood);
  const turns = parseTurns(script);
  onEvent({ type: "info", message: `Voicing ${turns.length} turns in the browser...` });

  const clips: Blob[] = [];
  let t = 0;
  const transcript: Array<{ timecode: string; speaker: string; text: string }> = [];
  for (let i = 0; i < turns.length; i++) {
    const turn = turns[i];
    onEvent({ type: "info", message: `TTS ${i + 1}/${turns.length}: ${turn.speaker}` });
    const blob = await speakTurn(turn.speaker, turn.text);
    clips.push(blob);
    const mm = Math.floor(t / 60);
    const ss = Math.floor(t % 60);
    transcript.push({
      timecode: `${String(mm).padStart(2, "0")}:${String(ss).padStart(2, "0")}`,
      speaker: turn.speaker,
      text: turn.text,
    });
    t += Math.max(4, turn.text.split(/\s+/).length / 2.2) + 0.65;
    await new Promise((r) => setTimeout(r, 200));
  }

  onEvent({ type: "info", message: "Mixing the show..." });
  const wav = await mixBlobs(clips, 0.65);
  const audioUrl = URL.createObjectURL(wav);
  const durSec = Math.round(t);
  const mm = Math.floor(durSec / 60);
  const ss = durSec % 60;
  const showId = `show_${Date.now()}_${slug(topic)}`;
  const notes = {
    show_title: topic.trim().slice(0, 80) || "Studio Desk",
    show_duration: `${String(mm).padStart(2, "0")}:${String(ss).padStart(2, "0")}`,
    two_sentence_summary: `A Studio Desk session on ${topic.trim()}. Produced in the browser, ready to download.`,
    date_of_generation: new Date().toISOString().slice(0, 10),
    timecoded_transcript: transcript,
    audioUrl,
    mp3Url: audioUrl,
    coverImage: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2070&auto=format&fit=crop",
    isUserGenerated: true,
    showId,
    script,
    audioBlobType: wav.type,
  };
  onEvent({ type: "show_data", data: notes });
  onEvent({ type: "status", status: "completed" });
  return notes;
}
