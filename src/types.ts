export interface RawTranscriptLine {
  timecode: string; // "MM:SS"
  speaker: string;
  text: string;
}

export interface RawRadioShow {
  show_title: string;
  show_duration: string; // "MM:SS"
  two_sentence_summary: string;
  date_of_generation: string;
  timecoded_transcript: RawTranscriptLine[];
  coverImage?: string; // Added for UI
  audioUrl?: string;   // Added for playback
  notesUrl?: string;   // Added for downloading show notes
  downloadUrl?: string;
  mp3Url?: string;
  showId?: string;
  isUserGenerated?: boolean;
  script?: string;
  sources?: string[];
}

export interface TranscriptLine {
  start: number;
  end: number;
  text: string;
  speaker: string;
}

export interface RadioShow {
  title: string;
  duration: number;
  summary: string;
  date: string;
  host: string;
  coverImage: string;
  audioUrl: string;
  notesUrl?: string;
  downloadUrl?: string;
  mp3Url?: string;
  showId?: string;
  transcript: TranscriptLine[];
  shareId?: string;
  shareUrl?: string;
  isUserGenerated?: boolean;
  script?: string;
  sources?: string[];
  audioBlob?: Blob;
}
