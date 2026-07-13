// Project data — placeholder content marked clearly.
// Real assets go in here when supplied.
export const PROJECTS = [
  {
    id: "foley-engine",
    num: "01",
    title: "Foley Engine",
    medium: "Game",
    year: "2025",
    role: "Director · Sound design",
    tools: "Unity · Wwise",
    technicolor: "amber",
    tint: "var(--tc-amber)",
    aspect: { w: 480, h: 360 }, // 4:3 Academy
    pencil: "Listen first",
    pencilPos: "br",
    imgLabel: "key still — foley engine",
    link: null, // real URL when available
    description:
      "A first-person exploration game where the environment must be foley'd into existence. Players collect sound objects from a silent landscape and use them to recover lost rooms.",
    tags: ["Exploration", "Sound", "Unity", "Single-player"],
  },
  {
    id: "tide-atlas",
    num: "02",
    title: "Tide Atlas",
    medium: "Art",
    year: "2024",
    role: "Solo · Generative cartography",
    tools: "p5.js · Risograph print",
    technicolor: "teal",
    tint: "var(--tc-teal)",
    aspect: { w: 700, h: 320 }, // ~21:9 cinemascope
    pencil: "60 prints",
    pencilPos: "tl",
    imgLabel: "plate 14 — tide atlas",
    link: null, // real URL when available
    description:
      "Sixty generative coastline plates. Tidal data from a single bay over a year, redrawn as overlapping inks. A bound atlas where every page is a different moment of the same shore.",
    tags: ["Print", "Generative", "Cartography", "Edition of 60"],
  },
  {
    id: "cutting-room",
    num: "03",
    title: "The Cutting Room",
    medium: "Writing",
    year: "2024",
    role: "Essay · 4,200 words",
    tools: "—",
    technicolor: "red",
    tint: "var(--tc-red)",
    aspect: { w: 360, h: 360 }, // 1:1 square
    pencil: "what got cut?",
    pencilPos: "tr",
    imgLabel: "lede — the cutting room",
    link: null, // real URL when available
    description:
      "An essay on editing as authorship — the missing frame, the lost paragraph, the version that never shipped. What we keep when we cut, and what cuts itself loose when nobody is looking.",
    tags: ["Essay", "Long-form", "Craft", "Editing"],
  },
  {
    id: "greenhouse",
    num: "04",
    title: "Greenhouse",
    medium: "Game",
    year: "2026",
    role: "Co-design · Systems",
    tools: "Godot · GLSL",
    technicolor: "green",
    tint: "var(--tc-green)",
    aspect: { w: 560, h: 315 }, // 16:9
    pencil: "tend slowly",
    pencilPos: "bl",
    imgLabel: "loop 03 — greenhouse",
    link: null, // real URL when available
    description:
      "A two-week-long simulation of a greenhouse. Plants grow in real time across sessions. Forget to water for three real days and something will have flowered without you, or died.",
    tags: ["Sim", "Real-time", "Godot", "Asynchronous"],
  },
];
