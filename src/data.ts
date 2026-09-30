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

const STUDIO_DESK_IDS = [
  "signal-run-it-or-its-a-rumor",
  "signal-the-hard-stop",
  "signal-what-it-meant-not-that-it-happened",
  "signal-the-stick-that-boots-the-lattice",
];

export function isForeignDefaultShow(show: { title?: string; show_title?: string; showId?: string }): boolean {
  const title = `${show.title || ''} ${show.show_title || ''} ${show.showId || ''}`.toLowerCase();
  if (title.includes('jagged frontier') || title.includes('vibe coding') || show.showId === 'default') return true;
  return STUDIO_DESK_IDS.includes(String(show.showId || ''));
}

export const RAW_SIGNAL_SHOWS: RawRadioShow[] = [
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
];

export const SIGNAL_SHOWS: RadioShow[] = RAW_SIGNAL_SHOWS.map(transformShow);
export const MOCK_SHOW: RadioShow = SIGNAL_SHOWS[0];
export const RAW_MOCK_SHOW: RawRadioShow = RAW_SIGNAL_SHOWS[0];
