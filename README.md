---
title: AI Talk Radio
emoji: 📻
colorFrom: purple
colorTo: blue
sdk: static
pinned: false
license: apache-2.0
short_description: Ungated talk radio desk. Generate a show, download the zip.
---

# AI Talk Radio — ungated desk

Public webpage for producing TTS-voiced talk radio. No Google login. No daily-3 quota.

- **Live Space:** https://huggingface.co/spaces/DeepSeekOracle/ai-talk-radio
- **Direct app:** https://deepseekoracle-ai-talk-radio.hf.space
- **GitHub:** https://github.com/DeepSeekOracle/ai-talk-radio
- **Signal hub:** https://chatagent.ca/signal/#studio-desk

When a show finishes, download the **full pack** (MP3 + `show_notes.json` + `transcript.txt` + script) from the Zip button, or `GET /api/shows/<id>/download`.

## Engines

1. VoiceStudio OmniVoice on `VOICESTUDIO_URL` (local studio, default `http://127.0.0.1:3900`)
2. Edge neural voices (CPU, used on Hugging Face)
3. Gemini managed-agent path if `GEMINI_API_KEY` is set

## Local run

```
npm install
pip install -r agent/requirements.txt
npm run dev
```

Optional `.env`: `GEMINI_API_KEY`, `VOICESTUDIO_URL`, `PORT` (default 3000).

## Agent API

`GET /api/health`

`POST /api/generate-show`

```json
{ "topic": "the hard stop", "duration": "5", "mood": "Late Night Chill" }
```

`GET /api/completed-shows`

`GET /api/shows/<id>/download` — zip of the completed show

`GET /api/shows/<id>/audio` — MP3 only

See `UNGATED.md`. Original gated zip stays at `ai-talk-radio.zip`.
