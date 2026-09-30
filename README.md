---
title: LYGO Signal Radio
emoji: 📻
colorFrom: green
colorTo: yellow
sdk: static
pinned: false
license: apache-2.0
short_description: LYGO Signal radio show generator. Download the zip.
---

# LYGO Signal — Radio Show Generator

Public webpage for producing TTS-voiced talk radio on the LYGO Signal brand. No login. No daily cap. Δ9Φ963.

Browser research pulls Wikipedia, Hacker News, and the Internet Archive Wayback Machine (availability API, public URLs only). Dated archive receipts land in show sources. The CDX index is not queried from the page.

- **Live Space:** https://huggingface.co/spaces/DeepSeekOracle/ai-talk-radio
- **Direct app:** https://deepseekoracle-ai-talk-radio.static.hf.space
- **GitHub:** https://github.com/DeepSeekOracle/ai-talk-radio
- **Signal hub:** https://chatagent.ca/signal/#studio-desk
- **Donate:** [PayPal.me/ExcavationPro](https://www.paypal.com/paypalme/ExcavationPro) · [Patreon](https://www.patreon.com/Excavationpro/posts/chatagent-ca-api-170485961)

Justin Helmer · Excavationpro / Lightfather.

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
