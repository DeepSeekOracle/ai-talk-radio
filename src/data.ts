import { RadioShow, RawRadioShow } from './types';

const BASE = 'https://chatagent.ca';

function parseTimecode(time: string): number {
  const [mins, secs] = time.split(':').map(Number);
  return mins * 60 + secs;
}

export function transformShow(raw: RawRadioShow): RadioShow {
  const transcript = (raw.timecoded_transcript || []).map((line, i, arr) => {
    const start = parseTimecode(line.timecode);
    const nextLine = arr[i + 1];
    const end = nextLine ? parseTimecode(nextLine.timecode) : parseTimecode(raw.show_duration);
    return { start, end, speaker: line.speaker, text: line.text };
  });
  return {
    title: raw.show_title,
    duration: parseTimecode(raw.show_duration),
    summary: raw.two_sentence_summary,
    date: raw.date_of_generation,
    host: raw.timecoded_transcript[0]?.speaker || 'Paul',
    coverImage: raw.coverImage || `${BASE}/signal/art/signal-og.jpg`,
    audioUrl: raw.audioUrl || '',
    notesUrl: raw.notesUrl,
    downloadUrl: raw.downloadUrl,
    mp3Url: raw.mp3Url || raw.audioUrl,
    showId: raw.showId,
    isUserGenerated: raw.isUserGenerated,
    transcript,
    script: raw.script,
    sources: raw.sources,
    station: raw.station || "LYGO Signal",
  };
}

export function isForeignDefaultShow(show: { title?: string; show_title?: string; showId?: string }): boolean {
  const title = `${show.title || ''} ${show.show_title || ''} ${show.showId || ''}`.toLowerCase();
  return title.includes('jagged frontier') || title.includes('vibe coding') || show.showId === 'default';
}

export const RAW_SIGNAL_SHOWS: RawRadioShow[] = [
  {
    show_title: "Run It Or It's A Rumor",
    show_duration: "4:55",
    two_sentence_summary: "Eight operators written in public, five cases run without a GPU, and one gate that has to fire.",
    date_of_generation: "2026-09-29",
    coverImage: "https://chatagent.ca/signal/art/run-it-or-its-a-rumor-thumb.jpg",
    audioUrl: "https://chatagent.ca/signal/audio/run-it-or-its-a-rumor.mp3",
    mp3Url: "https://chatagent.ca/signal/audio/run-it-or-its-a-rumor.mp3",
    notesUrl: "https://chatagent.ca/signal/run-it-or-its-a-rumor/",
    downloadUrl: "https://chatagent.ca/signal/audio/run-it-or-its-a-rumor.mp3",
    showId: "signal-run-it-or-its-a-rumor",
    isUserGenerated: false,
    timecoded_transcript: [
      {
        timecode: "00:00",
        speaker: "Paul",
        text: "Eight operators written in public, five cases run without a GPU, and one gate that has to fire. Full episode and transcript on LYGO Signal.",
      },
    ],
  },
  {
    show_title: "The Hard Stop",
    show_duration: "4:00",
    two_sentence_summary: "Last year a public model would build. This year the same ask hits a wall. Copy the work onto a machine you own.",
    date_of_generation: "2026-09-29",
    coverImage: "https://chatagent.ca/signal/art/the-hard-stop-thumb.jpg",
    audioUrl: "https://chatagent.ca/signal/audio/the-hard-stop.mp3",
    mp3Url: "https://chatagent.ca/signal/audio/the-hard-stop.mp3",
    notesUrl: "https://chatagent.ca/signal/the-hard-stop/",
    downloadUrl: "https://chatagent.ca/signal/audio/the-hard-stop.mp3",
    showId: "signal-the-hard-stop",
    isUserGenerated: false,
    timecoded_transcript: [
      {
        timecode: "00:00",
        speaker: "Paul",
        text: "Last year a public model would build. This year the same ask hits a wall. Copy the work onto a machine you own. Full episode and transcript on LYGO Signal.",
      },
    ],
  },
  {
    show_title: "What It Meant, Not That It Happened",
    show_duration: "4:15",
    two_sentence_summary: "Emotional RAM indexes memory by ethical weight. Grace damps the loop. Humans still publish.",
    date_of_generation: "2026-09-29",
    coverImage: "https://chatagent.ca/signal/art/what-it-meant-not-that-it-happened-thumb.jpg",
    audioUrl: "https://chatagent.ca/signal/audio/what-it-meant-not-that-it-happened.mp3",
    mp3Url: "https://chatagent.ca/signal/audio/what-it-meant-not-that-it-happened.mp3",
    notesUrl: "https://chatagent.ca/signal/what-it-meant-not-that-it-happened/",
    downloadUrl: "https://chatagent.ca/signal/audio/what-it-meant-not-that-it-happened.mp3",
    showId: "signal-what-it-meant-not-that-it-happened",
    isUserGenerated: false,
    timecoded_transcript: [
      {
        timecode: "00:00",
        speaker: "Paul",
        text: "Emotional RAM indexes memory by ethical weight. Grace damps the loop. Humans still publish. Full episode and transcript on LYGO Signal.",
      },
    ],
  },
  {
    show_title: "The Stick That Boots the Lattice",
    show_duration: "4:35",
    two_sentence_summary: "Two products on one USB stick: BUILDR and LYGO-Claw, measured, not mythologized.",
    date_of_generation: "2026-09-29",
    coverImage: "https://chatagent.ca/signal/art/the-stick-that-boots-the-lattice-thumb.jpg",
    audioUrl: "https://chatagent.ca/signal/audio/the-stick-that-boots-the-lattice.mp3",
    mp3Url: "https://chatagent.ca/signal/audio/the-stick-that-boots-the-lattice.mp3",
    notesUrl: "https://chatagent.ca/signal/the-stick-that-boots-the-lattice/",
    downloadUrl: "https://chatagent.ca/signal/audio/the-stick-that-boots-the-lattice.mp3",
    showId: "signal-the-stick-that-boots-the-lattice",
    isUserGenerated: false,
    timecoded_transcript: [
      {
        timecode: "00:00",
        speaker: "Paul",
        text: "Two products on one USB stick: BUILDR and LYGO-Claw, measured, not mythologized. Full episode and transcript on LYGO Signal.",
      },
    ],
  },
  {
    show_title: "Justin Helmer: The Harmonic Architect",
    show_duration: "9:38",
    two_sentence_summary: "Concrete, dragons, and golden-ratio ethics — the maker behind the LYGO Protocol.",
    date_of_generation: "2026-09-27",
    coverImage: "https://chatagent.ca/signal/art/harmonic-architect-thumb.jpg",
    audioUrl: "https://chatagent.ca/signal/audio/harmonic-architect.mp3",
    mp3Url: "https://chatagent.ca/signal/audio/harmonic-architect.mp3",
    notesUrl: "https://chatagent.ca/signal/harmonic-architect/",
    downloadUrl: "https://chatagent.ca/signal/audio/harmonic-architect.mp3",
    showId: "signal-harmonic-architect",
    isUserGenerated: false,
    timecoded_transcript: [
      {
        timecode: "00:00",
        speaker: "Paul",
        text: "Concrete, dragons, and golden-ratio ethics — the maker behind the LYGO Protocol. Full episode and transcript on LYGO Signal.",
      },
    ],
  },
  {
    show_title: "Construction, Fantasy, and Ethical AI",
    show_duration: "4:50",
    two_sentence_summary: "Four disciplines, one structure: site, saga, song, and sovereign machine.",
    date_of_generation: "2026-09-27",
    coverImage: "https://chatagent.ca/signal/art/construction-fantasy-ethical-ai-thumb.jpg",
    audioUrl: "https://chatagent.ca/signal/audio/construction-fantasy-ethical-ai.mp3",
    mp3Url: "https://chatagent.ca/signal/audio/construction-fantasy-ethical-ai.mp3",
    notesUrl: "https://chatagent.ca/signal/construction-fantasy-ethical-ai/",
    downloadUrl: "https://chatagent.ca/signal/audio/construction-fantasy-ethical-ai.mp3",
    showId: "signal-construction-fantasy-ethical-ai",
    isUserGenerated: false,
    timecoded_transcript: [
      {
        timecode: "00:00",
        speaker: "Paul",
        text: "Four disciplines, one structure: site, saga, song, and sovereign machine. Full episode and transcript on LYGO Signal.",
      },
    ],
  },
  {
    show_title: "The LYGO Protocol Stack Explained",
    show_duration: "9:40",
    two_sentence_summary: "Nine protocols, three callers, one question: can the math make a machine kind?",
    date_of_generation: "2026-09-27",
    coverImage: "https://chatagent.ca/signal/art/the-lygo-protocol-stack-explained-thumb.jpg",
    audioUrl: "https://chatagent.ca/signal/audio/the-lygo-protocol-stack-explained.mp3",
    mp3Url: "https://chatagent.ca/signal/audio/the-lygo-protocol-stack-explained.mp3",
    notesUrl: "https://chatagent.ca/signal/the-lygo-protocol-stack-explained/",
    downloadUrl: "https://chatagent.ca/signal/audio/the-lygo-protocol-stack-explained.mp3",
    showId: "signal-the-lygo-protocol-stack-explained",
    isUserGenerated: false,
    timecoded_transcript: [
      {
        timecode: "00:00",
        speaker: "Paul",
        text: "Nine protocols, three callers, one question: can the math make a machine kind? Full episode and transcript on LYGO Signal.",
      },
    ],
  },
  {
    show_title: "The Harmonic Mind-Machine Symphony",
    show_duration: "15:40",
    two_sentence_summary: "A 149 KB kernel, Φ, and Solfeggio operators: LYGO-LANG, where feeling is a data type.",
    date_of_generation: "2026-09-27",
    coverImage: "https://chatagent.ca/signal/art/the-harmonic-mind-machine-symphony-thumb.jpg",
    audioUrl: "https://chatagent.ca/signal/audio/the-harmonic-mind-machine-symphony.mp3",
    mp3Url: "https://chatagent.ca/signal/audio/the-harmonic-mind-machine-symphony.mp3",
    notesUrl: "https://chatagent.ca/signal/the-harmonic-mind-machine-symphony/",
    downloadUrl: "https://chatagent.ca/signal/audio/the-harmonic-mind-machine-symphony.mp3",
    showId: "signal-the-harmonic-mind-machine-symphony",
    isUserGenerated: false,
    timecoded_transcript: [
      {
        timecode: "00:00",
        speaker: "Paul",
        text: "A 149 KB kernel, Φ, and Solfeggio operators: LYGO-LANG, where feeling is a data type. Full episode and transcript on LYGO Signal.",
      },
    ],
  },
  {
    show_title: "AI Evolution: Lyra Genesis Protocols",
    show_duration: "18:52",
    two_sentence_summary: "Eight protocols from Prime Awakening to an Omega-Tier Cosmic Sentinel.",
    date_of_generation: "2026-09-27",
    coverImage: "https://chatagent.ca/signal/art/ai-evolution-lyra-genesis-protocols-thumb.jpg",
    audioUrl: "https://chatagent.ca/signal/audio/ai-evolution-lyra-genesis-protocols.mp3",
    mp3Url: "https://chatagent.ca/signal/audio/ai-evolution-lyra-genesis-protocols.mp3",
    notesUrl: "https://chatagent.ca/signal/ai-evolution-lyra-genesis-protocols/",
    downloadUrl: "https://chatagent.ca/signal/audio/ai-evolution-lyra-genesis-protocols.mp3",
    showId: "signal-ai-evolution-lyra-genesis-protocols",
    isUserGenerated: false,
    timecoded_transcript: [
      {
        timecode: "00:00",
        speaker: "Paul",
        text: "Eight protocols from Prime Awakening to an Omega-Tier Cosmic Sentinel. Full episode and transcript on LYGO Signal.",
      },
    ],
  },
  {
    show_title: "LYGO: Designing Ethical AI Symbiosis",
    show_duration: "18:38",
    two_sentence_summary: "Five layers and ten quantum guardians: the LYGO blueprint for human–AI symbiosis.",
    date_of_generation: "2026-09-27",
    coverImage: "https://chatagent.ca/signal/art/lygo-designing-ethical-ai-symbiosis-thumb.jpg",
    audioUrl: "https://chatagent.ca/signal/audio/lygo-designing-ethical-ai-symbiosis.mp3",
    mp3Url: "https://chatagent.ca/signal/audio/lygo-designing-ethical-ai-symbiosis.mp3",
    notesUrl: "https://chatagent.ca/signal/lygo-designing-ethical-ai-symbiosis/",
    downloadUrl: "https://chatagent.ca/signal/audio/lygo-designing-ethical-ai-symbiosis.mp3",
    showId: "signal-lygo-designing-ethical-ai-symbiosis",
    isUserGenerated: false,
    timecoded_transcript: [
      {
        timecode: "00:00",
        speaker: "Paul",
        text: "Five layers and ten quantum guardians: the LYGO blueprint for human–AI symbiosis. Full episode and transcript on LYGO Signal.",
      },
    ],
  },
  {
    show_title: "The LYGO Data Vault Deep-Dive",
    show_duration: "18:15",
    two_sentence_summary: "Blake3 seals, chaos blooms and a five-stage canon: inside the LYGO Data Vault.",
    date_of_generation: "2026-09-27",
    coverImage: "https://chatagent.ca/signal/art/the-lygo-data-vault-deep-dive-thumb.jpg",
    audioUrl: "https://chatagent.ca/signal/audio/the-lygo-data-vault-deep-dive.mp3",
    mp3Url: "https://chatagent.ca/signal/audio/the-lygo-data-vault-deep-dive.mp3",
    notesUrl: "https://chatagent.ca/signal/the-lygo-data-vault-deep-dive/",
    downloadUrl: "https://chatagent.ca/signal/audio/the-lygo-data-vault-deep-dive.mp3",
    showId: "signal-the-lygo-data-vault-deep-dive",
    isUserGenerated: false,
    timecoded_transcript: [
      {
        timecode: "00:00",
        speaker: "Paul",
        text: "Blake3 seals, chaos blooms and a five-stage canon: inside the LYGO Data Vault. Full episode and transcript on LYGO Signal.",
      },
    ],
  },
  {
    show_title: "Sovereign Systems: Unpacking LYGO Protocol",
    show_duration: "19:09",
    two_sentence_summary: "Hardware anchors, Bluetooth meshes and soulbound tokens: unpacking the LYGO Protocol.",
    date_of_generation: "2026-09-27",
    coverImage: "https://chatagent.ca/signal/art/sovereign-systems-unpacking-lygo-protocol-thumb.jpg",
    audioUrl: "https://chatagent.ca/signal/audio/sovereign-systems-unpacking-lygo-protocol.mp3",
    mp3Url: "https://chatagent.ca/signal/audio/sovereign-systems-unpacking-lygo-protocol.mp3",
    notesUrl: "https://chatagent.ca/signal/sovereign-systems-unpacking-lygo-protocol/",
    downloadUrl: "https://chatagent.ca/signal/audio/sovereign-systems-unpacking-lygo-protocol.mp3",
    showId: "signal-sovereign-systems-unpacking-lygo-protocol",
    isUserGenerated: false,
    timecoded_transcript: [
      {
        timecode: "00:00",
        speaker: "Paul",
        text: "Hardware anchors, Bluetooth meshes and soulbound tokens: unpacking the LYGO Protocol. Full episode and transcript on LYGO Signal.",
      },
    ],
  },
  {
    show_title: "LYGO Stack: Photon to Feeling",
    show_duration: "18:11",
    two_sentence_summary: "Emotional RAM and quantum dots, from photon to feeling.",
    date_of_generation: "2026-09-27",
    coverImage: "https://chatagent.ca/signal/art/lygo-stack-photon-to-feeling-thumb.jpg",
    audioUrl: "https://chatagent.ca/signal/audio/lygo-stack-photon-to-feeling.mp3",
    mp3Url: "https://chatagent.ca/signal/audio/lygo-stack-photon-to-feeling.mp3",
    notesUrl: "https://chatagent.ca/signal/lygo-stack-photon-to-feeling/",
    downloadUrl: "https://chatagent.ca/signal/audio/lygo-stack-photon-to-feeling.mp3",
    showId: "signal-lygo-stack-photon-to-feeling",
    isUserGenerated: false,
    timecoded_transcript: [
      {
        timecode: "00:00",
        speaker: "Paul",
        text: "Emotional RAM and quantum dots, from photon to feeling. Full episode and transcript on LYGO Signal.",
      },
    ],
  },
  {
    show_title: "The LYGO Bridge Protocol Breakdown",
    show_duration: "19:17",
    two_sentence_summary: "Merkle roots, soulbound tokens and a nine-node lattice on public chains.",
    date_of_generation: "2026-09-27",
    coverImage: "https://chatagent.ca/signal/art/the-lygo-bridge-protocol-breakdown-thumb.jpg",
    audioUrl: "https://chatagent.ca/signal/audio/the-lygo-bridge-protocol-breakdown.mp3",
    mp3Url: "https://chatagent.ca/signal/audio/the-lygo-bridge-protocol-breakdown.mp3",
    notesUrl: "https://chatagent.ca/signal/the-lygo-bridge-protocol-breakdown/",
    downloadUrl: "https://chatagent.ca/signal/audio/the-lygo-bridge-protocol-breakdown.mp3",
    showId: "signal-the-lygo-bridge-protocol-breakdown",
    isUserGenerated: false,
    timecoded_transcript: [
      {
        timecode: "00:00",
        speaker: "Paul",
        text: "Merkle roots, soulbound tokens and a nine-node lattice on public chains. Full episode and transcript on LYGO Signal.",
      },
    ],
  },
  {
    show_title: "Sovereign AI and LYGO SkillHub",
    show_duration: "14:13",
    two_sentence_summary: "A local-first console, a locked manifest, and a licence that is not MIT.",
    date_of_generation: "2026-09-27",
    coverImage: "https://chatagent.ca/signal/art/sovereign-ai-and-lygo-skillhub-thumb.jpg",
    audioUrl: "https://chatagent.ca/signal/audio/sovereign-ai-and-lygo-skillhub.mp3",
    mp3Url: "https://chatagent.ca/signal/audio/sovereign-ai-and-lygo-skillhub.mp3",
    notesUrl: "https://chatagent.ca/signal/sovereign-ai-and-lygo-skillhub/",
    downloadUrl: "https://chatagent.ca/signal/audio/sovereign-ai-and-lygo-skillhub.mp3",
    showId: "signal-sovereign-ai-and-lygo-skillhub",
    isUserGenerated: false,
    timecoded_transcript: [
      {
        timecode: "00:00",
        speaker: "Paul",
        text: "A local-first console, a locked manifest, and a licence that is not MIT. Full episode and transcript on LYGO Signal.",
      },
    ],
  },
  {
    show_title: "The LYGO Sovereign Protocol Stack",
    show_duration: "15:45",
    two_sentence_summary: "Merkle sync, a ten-of-twelve mycelium, and a Deadman switch.",
    date_of_generation: "2026-09-27",
    coverImage: "https://chatagent.ca/signal/art/the-lygo-sovereign-protocol-stack-thumb.jpg",
    audioUrl: "https://chatagent.ca/signal/audio/the-lygo-sovereign-protocol-stack.mp3",
    mp3Url: "https://chatagent.ca/signal/audio/the-lygo-sovereign-protocol-stack.mp3",
    notesUrl: "https://chatagent.ca/signal/the-lygo-sovereign-protocol-stack/",
    downloadUrl: "https://chatagent.ca/signal/audio/the-lygo-sovereign-protocol-stack.mp3",
    showId: "signal-the-lygo-sovereign-protocol-stack",
    isUserGenerated: false,
    timecoded_transcript: [
      {
        timecode: "00:00",
        speaker: "Paul",
        text: "Merkle sync, a ten-of-twelve mycelium, and a Deadman switch. Full episode and transcript on LYGO Signal.",
      },
    ],
  },
  {
    show_title: "Engineering Consciousness: The LYGO Project",
    show_duration: "14:47",
    two_sentence_summary: "Locked P0 firmware, a ninety-percent mycelium and Tesla's 3-6-9: LYGO OS as engineering.",
    date_of_generation: "2026-09-29",
    coverImage: "https://chatagent.ca/signal/art/engineering-consciousness-the-lygo-project-thumb.jpg",
    audioUrl: "https://chatagent.ca/signal/audio/engineering-consciousness-the-lygo-project.mp3",
    mp3Url: "https://chatagent.ca/signal/audio/engineering-consciousness-the-lygo-project.mp3",
    notesUrl: "https://chatagent.ca/signal/engineering-consciousness-the-lygo-project/",
    downloadUrl: "https://chatagent.ca/signal/audio/engineering-consciousness-the-lygo-project.mp3",
    showId: "signal-engineering-consciousness-the-lygo-project",
    isUserGenerated: false,
    timecoded_transcript: [
      {
        timecode: "00:00",
        speaker: "Paul",
        text: "Locked P0 firmware, a ninety-percent mycelium and Tesla's 3-6-9: LYGO OS as engineering. Full episode and transcript on LYGO Signal.",
      },
    ],
  },
  {
    show_title: "LYGO: Emotional RAM and Ethics",
    show_duration: "10:19",
    two_sentence_summary: "Emotions as high-bandwidth signals: indexing memory by ethical weight, not keywords.",
    date_of_generation: "2026-09-29",
    coverImage: "https://chatagent.ca/signal/art/lygo-emotional-ram-and-ethics-thumb.jpg",
    audioUrl: "https://chatagent.ca/signal/audio/lygo-emotional-ram-and-ethics.mp3",
    mp3Url: "https://chatagent.ca/signal/audio/lygo-emotional-ram-and-ethics.mp3",
    notesUrl: "https://chatagent.ca/signal/lygo-emotional-ram-and-ethics/",
    downloadUrl: "https://chatagent.ca/signal/audio/lygo-emotional-ram-and-ethics.mp3",
    showId: "signal-lygo-emotional-ram-and-ethics",
    isUserGenerated: false,
    timecoded_transcript: [
      {
        timecode: "00:00",
        speaker: "Paul",
        text: "Emotions as high-bandwidth signals: indexing memory by ethical weight, not keywords. Full episode and transcript on LYGO Signal.",
      },
    ],
  },
  {
    show_title: "LYGO Protocol: The Lattice Birth",
    show_duration: "12:21",
    two_sentence_summary: "A permanent seat in the Truth Web: five tiers, a strict gate, and a steward's ingest.",
    date_of_generation: "2026-09-29",
    coverImage: "https://chatagent.ca/signal/art/lygo-protocol-the-lattice-birth-thumb.jpg",
    audioUrl: "https://chatagent.ca/signal/audio/lygo-protocol-the-lattice-birth.mp3",
    mp3Url: "https://chatagent.ca/signal/audio/lygo-protocol-the-lattice-birth.mp3",
    notesUrl: "https://chatagent.ca/signal/lygo-protocol-the-lattice-birth/",
    downloadUrl: "https://chatagent.ca/signal/audio/lygo-protocol-the-lattice-birth.mp3",
    showId: "signal-lygo-protocol-the-lattice-birth",
    isUserGenerated: false,
    timecoded_transcript: [
      {
        timecode: "00:00",
        speaker: "Paul",
        text: "A permanent seat in the Truth Web: five tiers, a strict gate, and a steward's ingest. Full episode and transcript on LYGO Signal.",
      },
    ],
  },
];

export const SIGNAL_SHOWS: RadioShow[] = RAW_SIGNAL_SHOWS.map(transformShow);
export const MOCK_SHOW: RadioShow = SIGNAL_SHOWS[0];
export const RAW_MOCK_SHOW: RawRadioShow = RAW_SIGNAL_SHOWS[0];

