/** In-browser show producer for static hosts (Hugging Face Spaces). */

import { researchTopic, writeUniqueScript } from "./writeShow";

const KOKORO_VOICES: Record<string, string> = {
  Paul: "bm_george",
  Jordan: "bm_george",
  Maya: "af_sarah",
  Priya: "af_nicole",
  Theo: "am_michael",
  Clara: "bf_emma",
  Marcus: "am_adam",
  Elena: "af_bella",
  Sam: "am_michael",
  Chloe: "af_heart",
  Raj: "am_adam",
  Julian: "bm_lewis",
  Maeve: "af_nicole",
  Devon: "am_michael",
};

const F0: Record<string, number> = {
  Paul: 108,
  Jordan: 108,
  Maya: 188,
  Priya: 178,
  Theo: 122,
  Clara: 185,
  Marcus: 118,
  Elena: 182,
  Sam: 115,
  Chloe: 190,
  Raj: 120,
  Julian: 112,
  Maeve: 186,
  Devon: 116,
};

const KOKORO_URL = "https://cdn.jsdelivr.net/npm/kokoro-js@1.2.1/+esm";

function slug(s: string): string {
  return (s || "show").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40) || "show";
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

function floatToWav(input: ArrayLike<number>, sampleRate: number): Blob {
  const pcm = new Int16Array(input.length);
  for (let i = 0; i < input.length; i++) {
    const s = Math.max(-1, Math.min(1, Number(input[i])));
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
  v.setUint32(24, sampleRate, true);
  v.setUint32(28, sampleRate * 2, true);
  v.setUint16(32, 2, true);
  v.setUint16(34, 16, true);
  w(36, "data");
  v.setUint32(40, dataSize, true);
  new Uint8Array(out, 44).set(new Uint8Array(pcm.buffer));
  return new Blob([out], { type: "audio/wav" });
}

function encodeWav(buffer: AudioBuffer): Blob {
  return floatToWav(buffer.getChannelData(0), buffer.sampleRate);
}

function formantSpeak(text: string, speaker: string): Blob {
  const sr = 22050;
  const f0 = F0[speaker] || 130;
  const samples: number[] = [];
  const pushGap = (sec: number) => {
    const n = Math.floor(sr * sec);
    for (let i = 0; i < n; i++) samples.push(0);
  };
  pushGap(0.12);
  for (const word of text.split(/\s+/).filter(Boolean)) {
    const dur = Math.max(0.14, Math.min(0.5, word.length * 0.055));
    const n = Math.floor(sr * dur);
    const hash = word.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
    const f1 = 420 + (hash % 280);
    const f2 = 1100 + (hash % 900);
    for (let i = 0; i < n; i++) {
      const t = i / sr;
      const env = Math.min(1, i / (0.018 * sr)) * Math.min(1, (n - i) / (0.03 * sr));
      const buzz = ((t * f0) % 1) < 0.45 ? 1 : 0.15;
      const v =
        0.22 * buzz * env * Math.sin(2 * Math.PI * f0 * t) +
        0.12 * env * Math.sin(2 * Math.PI * f1 * t) +
        0.07 * env * Math.sin(2 * Math.PI * f2 * t);
      samples.push(v);
    }
    pushGap(0.07);
  }
  pushGap(0.18);
  return floatToWav(new Float32Array(samples), sr);
}

async function rawToWav(audio: any): Promise<Blob> {
  if (!audio) throw new Error("empty TTS");
  if (audio instanceof Blob) return audio;
  if (typeof audio.toBlob === "function") {
    const b = audio.toBlob();
    return b instanceof Promise ? await b : b;
  }
  if (typeof audio.toWav === "function") {
    const wav = audio.toWav();
    const bytes = wav instanceof Promise ? await wav : wav;
    if (bytes instanceof Blob) return bytes;
    return new Blob([bytes], { type: "audio/wav" });
  }
  const samples = audio.audio || audio.waveform || audio.data;
  const sr = audio.sampling_rate || audio.sampleRate || 24000;
  if (samples && samples.length) return floatToWav(samples, sr);
  throw new Error("unknown TTS audio shape");
}

let kokoroEngine: any = null;
let kokoroFailed = false;

async function getKokoro(onEvent: (ev: any) => void): Promise<any | null> {
  if (kokoroEngine) return kokoroEngine;
  if (kokoroFailed) return null;
  onEvent({
    type: "info",
    message: "Loading studio voices in this browser (first run downloads a local voice model from Hugging Face)...",
  });
  try {
    const mod: any = await import(/* @vite-ignore */ KOKORO_URL);
    const KokoroTTS = mod.KokoroTTS || mod.default?.KokoroTTS || mod.default;
    if (!KokoroTTS?.from_pretrained) throw new Error("kokoro module missing from_pretrained");
    const wantGpu = typeof navigator !== "undefined" && !!(navigator as any).gpu;
    const opts = (device: string) => ({
      dtype: device === "webgpu" ? "fp32" : "q8",
      device,
      progress_callback: (p: any) => {
        if (!p) return;
        if (p.status === "progress" && p.total) {
          const pct = Math.round((100 * (p.loaded || 0)) / p.total);
          onEvent({ type: "info", message: `Voice model ${p.file || "weights"}: ${pct}%` });
        } else if (p.status === "ready" || p.status === "initiate") {
          onEvent({ type: "info", message: `Voice model: ${p.status} ${p.file || ""}`.trim() });
        }
      },
    });
    try {
      kokoroEngine = await KokoroTTS.from_pretrained(
        "onnx-community/Kokoro-82M-v1.0-ONNX",
        opts(wantGpu ? "webgpu" : "wasm"),
      );
    } catch {
      kokoroEngine = await KokoroTTS.from_pretrained(
        "onnx-community/Kokoro-82M-v1.0-ONNX",
        opts("wasm"),
      );
    }
    onEvent({ type: "info", message: "Studio voices ready. Speaking the script..." });
    return kokoroEngine;
  } catch (err: any) {
    kokoroFailed = true;
    onEvent({
      type: "info",
      message: `Kokoro voices unavailable (${err?.message || err}). Using the built-in desk synth so the show still completes.`,
    });
    return null;
  }
}

async function speakTurn(speaker: string, text: string, onEvent: (ev: any) => void): Promise<Blob> {
  const engine = await getKokoro(onEvent);
  if (engine) {
    try {
      const voice = KOKORO_VOICES[speaker] || "am_michael";
      const audio = await engine.generate(text, { voice, speed: 0.9 });
      return await rawToWav(audio);
    } catch (err: any) {
      onEvent({
        type: "info",
        message: `${speaker}: neural voice failed (${err?.message || err}). Using desk synth for this turn.`,
      });
    }
  }
  return formantSpeak(text, speaker);
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
    const src = buffers[i].numberOfChannels ? buffers[i].getChannelData(0) : new Float32Array();
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
  onEvent({ type: "info", message: "Researching the topic (Wikipedia + Hacker News)..." });
  const bits = await researchTopic(topic, onEvent);
  const written = writeUniqueScript(topic, duration, mood, bits);
  onEvent({
    type: "info",
    message: `New script: “${written.title}” from ${written.sources.length} source(s).`,
  });
  const script = written.script;
  const turns = parseTurns(script);
  onEvent({ type: "info", message: `Voicing ${turns.length} original turns...` });

  const clips: Blob[] = [];
  let t = 0;
  const transcript: Array<{ timecode: string; speaker: string; text: string }> = [];
  for (let i = 0; i < turns.length; i++) {
    const turn = turns[i];
    onEvent({ type: "info", message: `TTS ${i + 1}/${turns.length}: ${turn.speaker}` });
    const blob = await speakTurn(turn.speaker, turn.text, onEvent);
    clips.push(blob);
    const mm = Math.floor(t / 60);
    const ss = Math.floor(t % 60);
    transcript.push({
      timecode: `${String(mm).padStart(2, "0")}:${String(ss).padStart(2, "0")}`,
      speaker: turn.speaker,
      text: turn.text,
    });
    t += Math.max(4, turn.text.split(/\s+/).length / 2.2) + 0.65;
  }

  onEvent({ type: "info", message: "Mixing the show..." });
  const wav = await mixBlobs(clips, 0.65);
  const audioUrl = URL.createObjectURL(wav);
  const durSec = Math.round(t);
  const mm = Math.floor(durSec / 60);
  const ss = durSec % 60;
  const showId = `show_${Date.now()}_${slug(topic)}`;
  const notes = {
    show_title: written.title,
    show_duration: `${String(mm).padStart(2, "0")}:${String(ss).padStart(2, "0")}`,
    two_sentence_summary: written.summary,
    sources: written.sources,
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
