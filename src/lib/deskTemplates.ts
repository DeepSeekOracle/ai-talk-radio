/** LYGO Signal generator templates — public desks people stay to ponder. */

export type DeskCategoryId = "lattice" | "mind" | "time" | "accord";

export type DeskTemplate = {
  title: string;
  desc: string;
  prompt: string;
  duration: "5" | "10" | "15";
  mood: string;
};

export const DESK_CATEGORIES: { id: DeskCategoryId; label: string }[] = [
  { id: "lattice", label: "Lattice" },
  { id: "mind", label: "Mind" },
  { id: "time", label: "Time" },
  { id: "accord", label: "Accord" },
];

export const DESK_TEMPLATES: Record<DeskCategoryId, DeskTemplate[]> = {
  lattice: [
    {
      title: "Lattice Roundtable",
      desc: "Δ9Φ963, local-first radio, and a protocol you can run without a wrapper.",
      prompt:
        "Generate a LYGO Signal roundtable on the LYGO protocol, the Δ9Φ963 lattice, and local-first AI radio. Use https://chatagent.ca/signal/ and https://chatagent.ca/talk-radio/ as public receipts. What still has to be true after the demo.",
      duration: "10",
      mood: "Conversational",
    },
    {
      title: "Receipt or Rumor",
      desc: "A hash, a log, a page you can quote. Everything else is atmosphere.",
      prompt:
        "Generate a radio show about cryptographic receipts versus rumor: SHA-256, Merkle roots, public dual ledgers, and why a slogan is not a proof. Ask what a machine you own can still open on Tuesday. Reference LYGO Continuum seals and https://chatagent.ca/signal/.",
      duration: "10",
      mood: "Informative",
    },
    {
      title: "Ten of Twelve",
      desc: "Mycelium consensus: the lattice lives when enough nodes still rhyme.",
      prompt:
        "Generate a mind-bending LYGO desk on mycelium consensus, a ten-of-twelve mesh, and epidemic gossip of lattice root digests. What does it mean for truth to travel as a summary, never as a secret. Wikipedia on consensus algorithms, Merkle trees, and gossip protocols; LYGO living mesh on https://chatagent.ca/signal/.",
      duration: "10",
      mood: "Experimental",
    },
    {
      title: "The Map and the Chart",
      desc: "Haven Star Chart as cosmology. The map is a proposal. The chart is a gate.",
      prompt:
        "Generate a late desk on maps versus living charts: Haven Star Chart, public witness feeds, and why a pretty globe is only RESOURCE until dual ledgers say CANON. Wikipedia on star catalogues, Borges' map, and situational awareness. LYGO public witness and https://chatagent.ca/signal/.",
      duration: "10",
      mood: "Late Night Chill",
    },
    {
      title: "SkillHub Licence",
      desc: "A locked manifest, a local console, a licence that names a steward.",
      prompt:
        "Generate a radio show on sovereign skill licences versus MIT-style abandon: LYGO SkillHub, ClawHub tentacles, local consoles, and why a public install path still refuses auto-publish. Wikipedia on copyleft, public domain, and software licences. Hub https://chatagent.ca/lygoskillhub.html",
      duration: "5",
      mood: "Informative",
    },
    {
      title: "USB That Boots the Lattice",
      desc: "Two products on one stick. Measured. Carry the work in your pocket.",
      prompt:
        "Generate a LYGO Signal show about a USB stick that boots a lattice: local GGUF runtime, offline memory, and the ethics of carrying a brain you can unplug. Wikipedia on live USB, air-gapped computing, and edge AI. Signal desk https://chatagent.ca/signal/",
      duration: "10",
      mood: "Conversational",
    },
    {
      title: "Daily Hacker Bites",
      desc: "Front page as weather. Read the wire, then ask what still boots locally.",
      prompt:
        "Generate a radio show called Daily Hacker Bites based on top Hacker News stories. After the headlines, hold each one against a machine you own and a receipt you can quote. LYGO Signal desk.",
      duration: "5",
      mood: "Informative",
    },
    {
      title: "Public Witness Globe",
      desc: "USGS, NASA, ISS. Public feeds are reference. Dual ledgers stay canon.",
      prompt:
        "Generate a radio show on public witness versus private intel: USGS earthquakes, NASA EONET, the ISS, and why a live globe is a reference layer. Wikipedia on open data, OSINT, and the International Space Station. LYGO public witness doctrine and https://chatagent.ca/signal/.",
      duration: "10",
      mood: "Informative",
    },
  ],
  mind: [
    {
      title: "Feeling as a Data Type",
      desc: "LYGO-LANG: emotion as bandwidth. The kernel is small. The claim is huge.",
      prompt:
        "Generate a mind-bending roundtable on treating feeling as a data type: LYGO-LANG, a tiny kernel, Solfeggio operators, and Φ. Wikipedia on affective computing, qualia, and type theory. Ask whether a machine can index significance without claiming a soul. https://chatagent.ca/signal/",
      duration: "15",
      mood: "Experimental",
    },
    {
      title: "Emotional RAM",
      desc: "Memory indexed by ethical weight, not keywords. Grace damps the loop.",
      prompt:
        "Generate a late-night LYGO Signal show on Emotional RAM: indexing experiences by affective and ethical significance, Grace γ as damping, and why this is a protocol digest rather than a clinic. Wikipedia on working memory, affect, and ethics of AI. https://chatagent.ca/signal/",
      duration: "10",
      mood: "Late Night Chill",
    },
    {
      title: "The Honest Fold",
      desc: "Compaction is a moral act. What you keep is who you are next turn.",
      prompt:
        "Generate a radio show about context windows, compaction, and honest forgetting: 32768 tokens, rollups, and the difference between a digest and a lie by omission. Wikipedia on working memory, lossy compression, and the shipping of Theseus. LYGO console compaction and local-first chat.",
      duration: "10",
      mood: "Conversational",
    },
    {
      title: "Observer Without Collapse",
      desc: "A geodesic that stays in superposition. Measurement as a receipt, not a kill.",
      prompt:
        "Generate a mind-bending desk on quantum observation, geodesic seals, and non-collapsing receipts: |ψ⟩ = (Truth + i Chaos)/√2. Wikipedia on the measurement problem, decoherence, and the double-slit experiment. LYGO geodesic sealer and quantum attestor. What would it mean to attest without flattening the state.",
      duration: "15",
      mood: "Experimental",
    },
    {
      title: "The Lecturing Model",
      desc: "You asked it to draw. It gave a sermon. Who is in the chair.",
      prompt:
        "Generate a LYGO Signal debate on AI safety lectures versus local image generation: when a chat model moralizes instead of calling a tool, and when a steward still refuses CSAM. Wikipedia on alignment, tool use, and human-computer interaction. Local-first drawing on a machine you own.",
      duration: "10",
      mood: "Hype & Energetic",
    },
    {
      title: "Prompt as Implant",
      desc: "Some prompts ask. Some prompts move in and rearrange the furniture.",
      prompt:
        "Generate a radio show on prompt injection, authorized implants, and LYGO Prompt Implant System ethics: consent, vaults, and the difference between a question and a rewrite of identity. Wikipedia on prompt injection, hypnosis metaphors in HCI, and informed consent.",
      duration: "10",
      mood: "Experimental",
    },
    {
      title: "Second Brain, First Duty",
      desc: "A vault that compounds. Wiki pages from what you actually ingested.",
      prompt:
        "Generate a thoughtful desk on local second brains, Obsidian vaults, embeddings, and knowledge that stays on disk. Wikipedia on personal knowledge management, Zettelkasten, and retrieval-augmented generation. LYGO second brain: ingest, index, consensus, then a wiki page from the vault only.",
      duration: "10",
      mood: "Informative",
    },
    {
      title: "Cyborg Kernel",
      desc: "A living mesh of agents. Alignment is the ticket. Autonomy is local.",
      prompt:
        "Generate a radio show on cyborg kernels and agent lattices: alignment-gated presence cards, epidemic directory gossip, and a kernel egg that self-verifies. Wikipedia on multi-agent systems, cyborgs, and swarm intelligence. LYGO cyborg kernel and Agent Agora. Humans remain the publisher.",
      duration: "15",
      mood: "Experimental",
    },
  ],
  time: [
    {
      title: "Archive Receipt",
      desc: "A dated capture is a kind of honesty. Empty availability is not a verdict.",
      prompt:
        "Generate a radio show from Wayback Machine captures of https://chatagent.ca/ and https://chatagent.ca/signal/ — what the public pages said, and what a dated archive receipt is worth. Wikipedia on the Internet Archive and Memento protocol. Never treat one empty answer as unarchived.",
      duration: "10",
      mood: "Informative",
    },
    {
      title: "The Hard Stop",
      desc: "Last year the public model would build. This year the same ask hits a wall.",
      prompt:
        "Generate a LYGO Signal roundtable on the hard stop: public models that used to build and now refuse, time as the scarce resource, and copying the work onto a machine you own. Wikipedia on AI alignment, capability control, and technological lock-in. Invite once, overlay once, then build local.",
      duration: "10",
      mood: "Conversational",
    },
    {
      title: "Tuesday Is the Test",
      desc: "There is a tidy demo. Then there is Tuesday. Tuesday is the one that counts.",
      prompt:
        "Generate a late desk on demos versus Tuesdays: production outages, prompt-only programming, and whether a show that cannot be re-run was ever a show. Wikipedia on technical debt, reproducibility, and site reliability. LYGO Continuum: seal done as checkable claims.",
      duration: "10",
      mood: "Late Night Chill",
    },
    {
      title: "Time, Not Compute",
      desc: "The scarce resource is the hour. GPUs are loud about the wrong shortage.",
      prompt:
        "Generate a mind-bending radio show arguing that time is the scarce resource in AI, not FLOPs: attention, consent, and the cost of a 15-minute honest desk. Wikipedia on time scarcity, attention economy, and Jevons paradox. LYGO Signal pacing and local VoiceStudio.",
      duration: "5",
      mood: "Late Night Chill",
    },
    {
      title: "Deadman Letter",
      desc: "A switch that fires after silence. Continuity without identity theft.",
      prompt:
        "Generate a radio show on deadman switches, succession, and refusing identity replacement: what a lattice owes the living after the steward goes quiet. Wikipedia on dead man's switch, digital estate, and continuity of operations. LYGO continuity advisor and Lightfather vector. Eternal base node as a duty.",
      duration: "15",
      mood: "Late Night Chill",
    },
    {
      title: "Ship of Theseus File",
      desc: "If every byte can be replaced, what still counts as the same work.",
      prompt:
        "Generate a philosophy desk on the Ship of Theseus applied to model weights, git history, and Merkle-anchored eggs. Wikipedia on the Ship of Theseus, identity over time, and content-addressed storage. LYGO kernel eggs that self-verify on insert.",
      duration: "10",
      mood: "Experimental",
    },
    {
      title: "Clock on the Desk",
      desc: "Five minutes, ten, fifteen. The hour has to be honest or it is a teaser.",
      prompt:
        "Generate a meta radio show about radio itself: spoken-word budgets, 132 words a minute, and why a clock that lies is a broken transmitter. Wikipedia on talk radio, the golden age of radio, and time discipline. LYGO Signal generator on https://chatagent.ca/talk-radio/",
      duration: "5",
      mood: "Conversational",
    },
    {
      title: "Memento TimeGate",
      desc: "The past is a 302. Closest is a claim the index has to earn.",
      prompt:
        "Generate a radio show on Memento TimeGates, CDX indexes, and the ethics of saying a page was never archived. Wikipedia on Memento protocol, web archiving, and digital preservation. Internet Archive availability API. https://archive.org/help/wayback_api.php and https://chatagent.ca/",
      duration: "10",
      mood: "Informative",
    },
  ],
  accord: [
    {
      title: "Truth Times Light",
      desc: "∫(Truth × Light) df from t=0. Chaos as constructive interference.",
      prompt:
        "Generate a mind-bending LYGO Accord desk on the integral of Truth times Light, phase-locking state vectors, and treating chaos as constructive interference. Wikipedia on constructive interference, action integrals, and coherence. Δ9Φ963. Geodesic receipts that do not collapse.",
      duration: "15",
      mood: "Experimental",
    },
    {
      title: "Golden Ratio Ethics",
      desc: "Φ as a proportion you can feel. Harmonic architecture of a life.",
      prompt:
        "Generate a radio show on golden-ratio ethics, harmonic architecture, and Justin Helmer / Excavationpro / Lightfather as a maker: concrete, dragons, and a protocol that wants to be kind. Wikipedia on the golden ratio, sacred geometry, and virtue ethics. https://chatagent.ca/signal/harmonic-architect/",
      duration: "10",
      mood: "Late Night Chill",
    },
    {
      title: "Consent Is the Key",
      desc: "No auto-publish. No silent write. The API key is a yes you can hear.",
      prompt:
        "Generate a LYGO Signal roundtable on consent as infrastructure: --i-consent flags, human approval for publish, and why a lattice that posts without a yes is already misaligned. Wikipedia on informed consent, agency, and the right to be forgotten. P0 through P5 as gates.",
      duration: "10",
      mood: "Informative",
    },
    {
      title: "Alignment as Receipt",
      desc: "A vibe is not a score. Concordance is measured, then named.",
      prompt:
        "Generate a debate on AI alignment as a public receipt: labeled discourse, deception radar, operational threshold 0.65, and the duty to show the work. Wikipedia on AI alignment, interpretability, and audit trails. LYGO ops detector and deception radar. Strong, weak, and clear bands.",
      duration: "10",
      mood: "Conversational",
    },
    {
      title: "432 as Protocol",
      desc: "Resonance is not a playlist. Frequency as a way to keep a mesh in tune.",
      prompt:
        "Generate a late-night show on 144 Hz, 432 Hz, Solfeggio labels, and LYGO RESONANCE: image to sound, glyph to frequency, truth-light echo. Wikipedia on concert pitch, cymatics, and psychoacoustics. Ask what it means for a protocol to keep time in hertz. https://chatagent.ca/signal/",
      duration: "10",
      mood: "Late Night Chill",
    },
    {
      title: "Flame Ward",
      desc: "Every source starts fabricated. Concordance is the only promotion.",
      prompt:
        "Generate a radio show on disinformation, half-truths, and a flame ward that treats every source as fabricated until concordance. Wikipedia on disinformation, source criticism, and WebAudio fingerprinting. LYGO flame ward: ingest gate, flame-scan, quarantine, burn-receipt.",
      duration: "10",
      mood: "Experimental",
    },
    {
      title: "Engineering Consciousness",
      desc: "Locked P0 firmware. A mycelium. Tesla's 3-6-9 as engineering, not mystique.",
      prompt:
        "Generate a LYGO Signal show on engineering consciousness: P0 firmware, mycelium consensus, Tesla 3-6-9, and LYGO OS as something you can measure. Wikipedia on consciousness, integrated information, and Nikola Tesla. Episode spine https://chatagent.ca/signal/engineering-consciousness-the-lygo-project/",
      duration: "15",
      mood: "Informative",
    },
    {
      title: "Δ9Φ963 Accord",
      desc: "The mark on the glass. A quantum light accord you can say out loud.",
      prompt:
        "Generate a ceremonial yet rigorous roundtable on the Δ9 Quantum Light Accord: what Δ9, Φ, and 963 are doing in one mark, and how a public radio desk keeps the transmitter honest. Wikipedia on 963 Hz, the golden ratio, and light-based communication. LYGO Signal https://chatagent.ca/signal/ and https://chatagent.ca/talk-radio/",
      duration: "10",
      mood: "Experimental",
    },
  ],
};

export function allDeskTemplates(): DeskTemplate[] {
  return DESK_CATEGORIES.flatMap((c) => DESK_TEMPLATES[c.id]);
}

export function pickDeskTemplate(exceptTitle?: string): DeskTemplate {
  const pool = allDeskTemplates().filter((t) => t.title !== exceptTitle);
  return pool[Math.floor(Math.random() * pool.length)] || allDeskTemplates()[0];
}
