#!/usr/bin/env python3
"""VoiceStudio OmniVoice TTS — replacement for Gemini Interactions TTS.

Talks HTTP to a local VoiceStudio backend (default 127.0.0.1:3900).
Never vendors VoiceStudio source. Used when GEMINI TTS is gated or missing.
"""
from __future__ import annotations

import json
import os
import urllib.error
import urllib.request

DEFAULT_URL = os.environ.get("VOICESTUDIO_URL", "http://127.0.0.1:3900").rstrip("/")

VOICE_ALIAS = {
    "Paul": "onyx",
    "Jordan": "onyx",
    "Maya": "sage",
    "Priya": "coral",
    "Theo": "echo",
}

FEMALE_CYCLE = ["sage", "coral", "nova"]
MALE_CYCLE = ["echo", "ash", "onyx"]

INSTRUCTIONS = {
    "Paul": "Late-night British radio host, mid-forties, London desk. Low, quiet, unhurried. Long pause at commas. Never excited.",
    "Jordan": "Late-night British radio host, calm London studio. Unhurried. Never shout.",
    "Maya": "Canadian woman, Vancouver, dry and slow. Think, then speak. Never chirpy.",
    "Priya": "Indian English, Bangalore, measured, slow on numbers. Quiet.",
    "Theo": "American man, Austin, warm chest voice, seated, unhurried.",
}


def studio_up(base: str = DEFAULT_URL, timeout: int = 4) -> bool:
    try:
        req = urllib.request.Request(f"{base}/health", method="GET")
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            if resp.status != 200:
                return False
            body = json.loads(resp.read().decode("utf-8", "replace"))
            return body.get("status") == "ok"
    except Exception:
        return False


def speak_wav(
    text: str,
    *,
    speaker: str = "Paul",
    voice: str = "",
    instructions: str = "",
    base: str = DEFAULT_URL,
    timeout: int = 180,
) -> bytes:
    payload = {
        "model": "omnivoice",
        "voice": voice or VOICE_ALIAS.get(speaker, "onyx"),
        "instructions": instructions or INSTRUCTIONS.get(
            speaker,
            "Calm late-night radio speaker. Unhurried. Pause at commas.",
        ),
        "input": text,
        "response_format": "wav",
        "speed": 0.82,
    }
    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        f"{base}/v1/audio/speech",
        data=data,
        method="POST",
        headers={"Content-Type": "application/json", "Accept": "audio/wav, */*"},
    )
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        raw = resp.read()
    if not raw:
        raise RuntimeError("VoiceStudio returned empty audio")
    return raw
