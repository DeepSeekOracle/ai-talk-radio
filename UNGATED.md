# AI Talk Radio — ungated (v2)

Repack of `ai-talk-radio.zip` with login and daily-use gates removed.
Packed: `ai-talk-radio-ungated.zip`
Unpacked: `ai-talk-radio-ungated/`

Original zip is unchanged.

## What was gated

| Gate | Original | Replacement |
|------|----------|-------------|
| Google Firebase sign-in | Required in production before Generate | Local operator identity (`src/lib/gates.ts`) |
| Daily 3-show quota | `DAILY_QUOTA_LIMIT` default 3, Firebase uid hash, 429 | `/api/quota` always unlimited |
| Bearer ID token on generate | Firebase Admin `verifyIdToken` | Optional. Server treats every caller as `local-operator` |
| Gemini TTS only | `generate_tts.py` → Interactions API | VoiceStudio OmniVoice HTTP first (`voicestudio_tts.py`), Gemini TTS fallback if a key is set |
| Gemini managed-agent required | `/api/generate-show` dies without `GEMINI_API_KEY` | Local pipeline `agent/skills/local-pipeline/run_local_show.py` when no key or `engine: "local"` |

## Run

```
cd "I:\E Drive\RADIO SHOW ZIPs\ai-talk-radio-ungated"
npm install
npm run dev
```

VoiceStudio on `http://127.0.0.1:3900` for local TTS. Optional `GEMINI_API_KEY` still runs the original managed-agent path.

## Agent API (no login)

`GET /api/health`

`POST /api/generate-show` JSON:

```json
{ "topic": "the hard stop", "duration": "5", "mood": "Late Night Chill", "engine": "local" }
```

SSE events include `show_data` with `audioUrl` / transcript. `engine: "local"` forces VoiceStudio even if a Gemini key is present.

Completed shows land in `output/completed/<id>/`. Download the full pack:

`GET /api/shows/<id>/download`  → zip (mp3 + show_notes.json + transcript.txt + script)

`GET /api/shows/<id>/audio`     → mp3

`GET /api/completed-shows`

Public webpage: https://huggingface.co/spaces/DeepSeekOracle/ai-talk-radio

## Files added

- `src/lib/gates.ts`
- `agent/skills/tts-generation/scripts/voicestudio_tts.py`
- `agent/skills/local-pipeline/run_local_show.py`
- this file
