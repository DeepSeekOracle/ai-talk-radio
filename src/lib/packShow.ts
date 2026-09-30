/** Pack a finished show into a zip: audio + notes + transcript + script. */

function slug(title: string): string {
  return String(title || "radio-show")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || "radio-show";
}

function pad(n: number): string {
  return String(Math.max(0, Math.floor(n))).padStart(2, "0");
}

function formatTimecode(seconds: number | string): string {
  if (typeof seconds === "string" && seconds.includes(":")) return seconds;
  const s = Number(seconds) || 0;
  const mins = Math.floor(s / 60);
  const secs = Math.floor(s % 60);
  return `${mins}:${pad(secs)}`;
}

function transcriptLines(show: any): Array<{ timecode: string; speaker: string; text: string }> {
  if (Array.isArray(show.timecoded_transcript) && show.timecoded_transcript.length) {
    return show.timecoded_transcript.map((line: any) => ({
      timecode: String(line.timecode || formatTimecode(line.start || 0)),
      speaker: String(line.speaker || "Paul"),
      text: String(line.text || "").trim(),
    }));
  }
  if (Array.isArray(show.transcript) && show.transcript.length) {
    return show.transcript.map((line: any) => ({
      timecode: formatTimecode(line.start ?? line.timecode ?? 0),
      speaker: String(line.speaker || "Paul"),
      text: String(line.text || "").trim(),
    }));
  }
  return [];
}

async function asBlob(input: any): Promise<Blob | null> {
  if (!input) return null;
  if (input instanceof Blob) return input;
  if (input instanceof ArrayBuffer) return new Blob([input]);
  if (typeof input !== "string") return null;
  try {
    const res = await fetch(input);
    if (!res.ok) return null;
    return await res.blob();
  } catch {
    return null;
  }
}

function extFor(blob: Blob, fallback: string): string {
  const t = (blob.type || "").toLowerCase();
  if (t.includes("wav")) return "wav";
  if (t.includes("mpeg") || t.includes("mp3")) return "mp3";
  if (t.includes("ogg")) return "ogg";
  if (t.includes("png")) return "png";
  if (t.includes("jpeg") || t.includes("jpg")) return "jpg";
  return fallback;
}

export async function packShowZip(show: any): Promise<{ blob: Blob; filename: string }> {
  const JSZip = (await import("jszip")).default;
  const zip = new JSZip();
  const name = slug(show.title || show.show_title);
  const folder = zip.folder(name);
  if (!folder) throw new Error("Could not create show folder in zip");

  const lines = transcriptLines(show);
  const duration =
    show.show_duration ||
    (typeof show.duration === "number" ? formatTimecode(show.duration) : "0:00");
  const title = show.title || show.show_title || name;
  const summary = show.summary || show.two_sentence_summary || "";
  const date = show.date || show.date_of_generation || new Date().toISOString().slice(0, 10);
  const sources: string[] = Array.isArray(show.sources) ? show.sources : [];
  const script = show.script ? String(show.script) : "";

  const notes = {
    show_title: title,
    show_duration: duration,
    two_sentence_summary: summary,
    date_of_generation: date,
    sources,
    timecoded_transcript: lines,
  };
  folder.file("show_notes.json", JSON.stringify(notes, null, 2));

  const transcriptTxt = [
    `${title}`,
    `Duration: ${duration}`,
    `Date: ${date}`,
    summary ? `Summary: ${summary}` : "",
    "",
    ...lines.map((l) => `[${l.timecode}] ${l.speaker}: ${l.text}`),
    "",
  ]
    .filter((row, i, arr) => row !== "" || arr[i - 1] !== "")
    .join("\n");
  folder.file("transcript.txt", transcriptTxt);

  if (script) folder.file("script.md", script);
  if (sources.length) folder.file("sources.txt", sources.join("\n") + "\n");

  folder.file(
    "README.txt",
    [
      `AI Talk Radio — full show pack`,
      ``,
      `Title: ${title}`,
      `Duration: ${duration}`,
      `Date: ${date}`,
      ``,
      `This zip is the complete show:`,
      `- ai_radio.wav (or .mp3) — the mixed episode`,
      `- show_notes.json — title, duration, summary, timecoded transcript`,
      `- transcript.txt — readable transcript`,
      script ? `- script.md — the spoken script` : "",
      sources.length ? `- sources.txt — research sources` : "",
      ``,
      summary,
      ``,
    ]
      .filter((l) => l !== "")
      .join("\n"),
  );

  const audioBlob =
    (await asBlob(show.audioBlob)) ||
    (await asBlob(show.audioUrl)) ||
    (await asBlob(show.mp3Url));
  if (!audioBlob || audioBlob.size < 64) {
    throw new Error("Show audio is missing; cannot pack a full zip");
  }
  folder.file(`ai_radio.${extFor(audioBlob, "wav")}`, audioBlob);

  const cover =
    (await asBlob(show.coverBlob)) ||
    (show.coverImage && !String(show.coverImage).includes("unsplash.com")
      ? await asBlob(show.coverImage)
      : null);
  if (cover && cover.size > 64) {
    folder.file(`cover.${extFor(cover, "jpg")}`, cover);
  }

  const blob = await zip.generateAsync({
    type: "blob",
    compression: "DEFLATE",
    compressionOptions: { level: 6 },
  });
  return { blob, filename: `${name}-show.zip` };
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}
