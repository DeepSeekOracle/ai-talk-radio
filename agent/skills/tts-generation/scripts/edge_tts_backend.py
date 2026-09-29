#!/usr/bin/env python3
"""Public CPU TTS fallback (Microsoft Edge neural voices).

Used on Hugging Face Spaces and any host without VoiceStudio or Gemini TTS.
"""
from __future__ import annotations

import asyncio
import os
import shutil
import subprocess
import tempfile

EDGE_VOICES = {
    "Paul": "en-GB-RyanNeural",
    "Jordan": "en-GB-RyanNeural",
    "Maya": "en-CA-ClaraNeural",
    "Priya": "en-IN-NeerjaNeural",
    "Theo": "en-US-GuyNeural",
}


def edge_available() -> bool:
    try:
        import edge_tts  # noqa: F401
        return True
    except Exception:
        return False


def _ffmpeg() -> str:
    env = os.environ.get("FFMPEG")
    if env and os.path.isfile(env):
        return env
    which = shutil.which("ffmpeg")
    return which or "ffmpeg"


def speak_edge_wav(text: str, speaker: str, output_path: str, rate: str = "-8%") -> bool:
    if not text.strip():
        return False
    try:
        import edge_tts
    except Exception:
        return False
    voice = EDGE_VOICES.get(speaker, "en-US-GuyNeural")

    async def _run(mp3_path: str) -> None:
        comm = edge_tts.Communicate(text, voice, rate=rate)
        await comm.save(mp3_path)

    fd, mp3_path = tempfile.mkstemp(suffix=".mp3")
    os.close(fd)
    try:
        asyncio.run(_run(mp3_path))
        subprocess.run(
            [_ffmpeg(), "-y", "-loglevel", "error", "-i", mp3_path, "-ar", "24000", "-ac", "1", output_path],
            check=True,
            capture_output=True,
        )
        return os.path.isfile(output_path) and os.path.getsize(output_path) > 44
    finally:
        try:
            os.remove(mp3_path)
        except OSError:
            pass
