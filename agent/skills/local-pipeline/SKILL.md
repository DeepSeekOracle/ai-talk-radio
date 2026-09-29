---
name: local-pipeline
description: Ungated local radio show — script, VoiceStudio TTS, mp3, show_notes. Replaces Gemini managed-agent when no API key / login quota.
---

# Local pipeline

```bash
python agent/skills/local-pipeline/run_local_show.py --topic "the hard stop" --duration 5 --mood "Late Night Chill" --out ./output/local_test
```

Uses `tts-generation/scripts/generate_tts.py`, which prefers VoiceStudio on `:3900`.
