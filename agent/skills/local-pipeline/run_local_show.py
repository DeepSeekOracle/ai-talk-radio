#!/usr/bin/env python3
"""Local ungated show pipeline: script + VoiceStudio TTS + mp3 + show_notes.

Used when Gemini managed-agents / daily login quota is not available.
Prints SSE-friendly lines: EVENT <json>
"""
from __future__ import annotations

import argparse
import json
import os
import re
import shutil
import subprocess
import sys
import wave
from datetime import date
from pathlib import Path

HERE = Path(__file__).resolve()
ROOT = HERE.parents[3]  # app root
TTS = ROOT / "agent" / "skills" / "tts-generation" / "scripts" / "generate_tts.py"


def emit(kind: str, **kw) -> None:
    print("EVENT " + json.dumps({"type": kind, **kw}), flush=True)


def ff() -> str:
    env = os.environ.get("FFMPEG")
    if env and Path(env).exists():
        return env
    which = shutil.which("ffmpeg")
    if which:
        return which
    gyan = Path(
        r"C:\Users\justi\AppData\Local\Microsoft\WinGet\Packages"
        r"\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe"
        r"\ffmpeg-8.1.2-full_build\bin\ffmpeg.exe"
    )
    if gyan.exists():
        return str(gyan)
    return "ffmpeg"


def write_script(topic: str, duration: str, mood: str, path: Path) -> None:
    topic = topic.strip() or "building things that stay on a machine you own"
    mood = mood.strip() or "Late Night Chill"
    path.parent.mkdir(parents=True, exist_ok=True)
    body = f"""# Studio Desk — {topic}

Paul: Welcome back to Studio Desk. Quiet night. Tonight we talk about {topic}. The mood is {mood}. Target, about {duration} minutes. Maya, you first.

Maya: [Female] [Accent: Canadian] I will keep this honest. If this is a slogan, I am out. What is actually true about {topic}?

Paul: Theo. From the workbench.

Theo: [Male] [Accent: Texan] It is work you can run. A console. A hash. A file that still opens tomorrow. {topic} is not a vibe. It is a receipt.

Paul: Priya. The careful version.

Priya: [Female] [Accent: Indian] Measure it. Consent on the write. Humans publish. If a public model treats that as forbidden, you copy the capability onto a machine you own.

Maya: [Female] [Accent: Canadian] Fine. Then say the last line without poetry.

Theo: [Male] [Accent: Texan] Do the work locally. Time is the scarce resource.

Paul: Maya in Vancouver. Theo in Austin. Priya in Bangalore. This is Studio Desk. {topic}. Keep the transmitter honest.
"""
    path.write_text(body, encoding="utf-8")


def wav_duration(path: Path) -> float:
    with wave.open(str(path), "rb") as wf:
        return wf.getnframes() / float(wf.getframerate() or 1)


def notes_from_script(script: str, duration_s: float, topic: str, out: Path, audio_rel: str) -> dict:
    turns = []
    t = 0.0
    for line in script.splitlines():
        line = line.strip()
        if not line or line.startswith("#") or ":" not in line:
            continue
        speaker, text = line.split(":", 1)
        text = re.sub(r"\[.*?\]", "", text).strip()
        if not text:
            continue
        mm, ss = divmod(int(t), 60)
        turns.append({"timecode": f"{mm:02d}:{ss:02d}", "speaker": speaker.strip(), "text": text})
        t += max(4.0, len(text.split()) / 2.2)
    total = int(round(duration_s or t))
    mm, ss = divmod(total, 60)
    data = {
        "show_title": topic.strip()[:80] or "Studio Desk",
        "show_duration": f"{mm:02d}:{ss:02d}",
        "two_sentence_summary": f"A local Studio Desk session on {topic.strip()}. Voiced without a login gate.",
        "date_of_generation": date.today().isoformat(),
        "timecoded_transcript": turns,
        "audioUrl": audio_rel,
        "isUserGenerated": True,
    }
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(data, indent=2), encoding="utf-8")
    return data


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--topic", required=True)
    ap.add_argument("--duration", default="5")
    ap.add_argument("--mood", default="Late Night Chill")
    ap.add_argument("--out", required=True, help="output directory for this generation")
    args = ap.parse_args()

    out = Path(args.out)
    ws = out / "workspace"
    (ws / "data").mkdir(parents=True, exist_ok=True)
    (ws / "audio" / "speech").mkdir(parents=True, exist_ok=True)
    (ws / "audio" / "final").mkdir(parents=True, exist_ok=True)

    emit("info", message="Local pipeline: writing script")
    script_path = ws / "data" / "script.md"
    write_script(args.topic, args.duration, args.mood, script_path)

    emit("info", message="Local pipeline: VoiceStudio / Gemini TTS")
    env = os.environ.copy()
    env.setdefault("VOICESTUDIO_URL", "http://127.0.0.1:3900")
    r = subprocess.run(
        [sys.executable, str(TTS), "--workspace", str(ws), "--workers", "2"],
        capture_output=True,
        text=True,
        env=env,
    )
    if r.stdout:
        print(r.stdout, flush=True)
    if r.returncode != 0:
        emit("error", message=f"TTS failed: {(r.stderr or r.stdout or '')[-800:]}")
        return 2

    speech = ws / "audio" / "speech" / "speech.wav"
    if not speech.exists():
        emit("error", message="TTS produced no speech.wav")
        return 3

    mp3 = out / "ai_radio.mp3"
    emit("info", message="Local pipeline: encoding mp3")
    enc = subprocess.run(
        [ff(), "-y", "-i", str(speech), "-c:a", "libmp3lame", "-b:a", "192k", str(mp3)],
        capture_output=True,
        text=True,
    )
    if enc.returncode != 0:
        emit("error", message=f"ffmpeg mp3 failed: {enc.stderr[-400:]}")
        return 4

    dur = wav_duration(speech)
    notes_path = out / "show_notes.json"
    if out.parent.name == "completed":
        public = f"/output/completed/{out.name}"
    else:
        public = f"/output/{out.name}"
    data = notes_from_script(script_path.read_text(encoding="utf-8"), dur, args.topic, notes_path, public + "/ai_radio.mp3")
    data["audioUrl"] = public + "/ai_radio.mp3"
    data["notesUrl"] = public + "/show_notes.json"
    data["downloadUrl"] = f"/api/shows/{out.name}/download"
    data["mp3Url"] = public + "/ai_radio.mp3"
    data["showId"] = out.name
    data["isUserGenerated"] = True
    notes_path.write_text(json.dumps(data, indent=2), encoding="utf-8")
    try:
        shutil.copy(script_path, out / "script.md")
    except OSError:
        pass
    transcript_lines = []
    for turn in data.get("timecoded_transcript") or []:
        transcript_lines.append(f"[{turn.get('timecode','')}] {turn.get('speaker','')}: {turn.get('text','')}")
    (out / "transcript.txt").write_text("\n".join(transcript_lines) + "\n", encoding="utf-8")
    emit("show_data", data=data)
    emit("status", status="completed")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
