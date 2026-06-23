export const FPS = 30;

export type Orientation = "landscape" | "portrait" | "square";

export type PromoSceneKind = "problem" | "reveal" | "features" | "showcase" | "founders" | "climax" | "endcard";

export type PromoScene = {
  id: string;
  start: number;
  duration: number;
  kind: PromoSceneKind;
  title: string;
  copy: string[];
  accent: string;
  narrationUrl?: string;
  backgroundImage?: string;
};

export const promoScenes: PromoScene[] = [
  {
    id: "scene-01-problem",
    start: 0,
    duration: 6.5,
    kind: "problem",
    title: "The Problem",
    copy: ["In a world overflowing with files...", "Knowledge becomes scattered."],
    accent: "#3b82f6",
    narrationUrl: "https://mgx-backend-cdn.metadl.com/generate/audios/1365907/2026-06-23/rd4cbrqcaieq/narration-01-problem.mp3",
    backgroundImage: "https://mgx-backend-cdn.metadl.com/generate/images/1365907/2026-06-23/rd4gjrqcaifa/scattered-files-dark-void.png",
  },
  {
    id: "scene-02-reveal",
    start: 6.5,
    duration: 3.0,
    kind: "reveal",
    title: "The Revelation",
    copy: ["Shairley", "Where Excellence Meets Learning"],
    accent: "#3b82f6",
    narrationUrl: "https://mgx-backend-cdn.metadl.com/generate/audios/1365907/2026-06-23/rd4cb6icaihq/narration-02-revelation.mp3",
    backgroundImage: "https://mgx-backend-cdn.metadl.com/generate/images/1365907/2026-06-23/rd4gj6icaieq/abstract-blue-glow-particles.png",
  },
  {
    id: "scene-03-platform",
    start: 9.5,
    duration: 6.0,
    kind: "features",
    title: "Platform Experience",
    copy: ["Workspaces", "Resources", "Study Chat", "Flashcards", "Quizzes", "Certificates", "Progress Tracking"],
    accent: "#3b82f6",
    narrationUrl: "https://mgx-backend-cdn.metadl.com/generate/audios/1365907/2026-06-23/rd4cclacaiha/narration-03-platform.mp3",
    backgroundImage: "https://mgx-backend-cdn.metadl.com/generate/images/1365907/2026-06-23/rd4gklacaiha/dark-workspace-atmosphere.png",
  },
  {
    id: "scene-04-workspaces",
    start: 15.5,
    duration: 5.5,
    kind: "showcase",
    title: "Organized Workspaces",
    copy: ["Organized Workspaces", "Smart Structure", "Instant Access"],
    accent: "#3b82f6",
    narrationUrl: "https://mgx-backend-cdn.metadl.com/generate/audios/1365907/2026-06-23/rd4ccyacaiga/narration-04-workspaces.mp3",
    backgroundImage: "https://mgx-backend-cdn.metadl.com/generate/images/1365907/2026-06-23/rd4gklacaiha/dark-workspace-atmosphere.png",
  },
  {
    id: "scene-05-sharing",
    start: 21.0,
    duration: 5.0,
    kind: "showcase",
    title: "File Sharing",
    copy: ["Secure Sharing", "Instant Links", "Access Anywhere"],
    accent: "#60a5fa",
    narrationUrl: "https://mgx-backend-cdn.metadl.com/generate/audios/1365907/2026-06-23/rd4cdeycaieq/narration-05-sharing.mp3",
    backgroundImage: "https://mgx-backend-cdn.metadl.com/generate/images/1365907/2026-06-23/rd4gj6icaieq/abstract-blue-glow-particles.png",
  },
  {
    id: "scene-06-chat",
    start: 26.0,
    duration: 5.5,
    kind: "showcase",
    title: "Study Chat",
    copy: ["Real-Time Discussion", "Team Collaboration", "Study Together"],
    accent: "#3b82f6",
    narrationUrl: "https://mgx-backend-cdn.metadl.com/generate/audios/1365907/2026-06-23/rd4cdrycaihq/narration-06-chat.mp3",
    backgroundImage: "https://mgx-backend-cdn.metadl.com/generate/images/1365907/2026-06-23/rd4gklacaiha/dark-workspace-atmosphere.png",
  },
  {
    id: "scene-07-tools",
    start: 31.5,
    duration: 6.0,
    kind: "features",
    title: "Learning Tools",
    copy: ["Flashcards", "Interactive Quizzes", "Progress Tracking", "Certificates"],
    accent: "#3b82f6",
    narrationUrl: "https://mgx-backend-cdn.metadl.com/generate/audios/1365907/2026-06-23/rd4cd6qcaiha/narration-07-tools.mp3",
    backgroundImage: "https://mgx-backend-cdn.metadl.com/generate/images/1365907/2026-06-23/rd4gkyacaiga/educational-tools-dark.png",
  },
  {
    id: "scene-08-showcase",
    start: 37.5,
    duration: 5.5,
    kind: "showcase",
    title: "Advanced Programming",
    copy: ["Advanced Programming", "Lectures", "Assignments", "Projects", "Study Chat"],
    accent: "#3b82f6",
    narrationUrl: "https://mgx-backend-cdn.metadl.com/generate/audios/1365907/2026-06-23/rd4celicaigq/narration-08-showcase.mp3",
    backgroundImage: "https://mgx-backend-cdn.metadl.com/generate/images/1365907/2026-06-23/rd4gklacaiha/dark-workspace-atmosphere.png",
  },
  {
    id: "scene-09-scale",
    start: 43.0,
    duration: 8.0,
    kind: "showcase",
    title: "Scale",
    copy: ["Built For Learning", "Built For Collaboration", "Built For Growth"],
    accent: "#3b82f6",
    narrationUrl: "https://mgx-backend-cdn.metadl.com/generate/audios/1365907/2026-06-23/rd4ceyacaiga/narration-09-scale.mp3",
    backgroundImage: "https://mgx-backend-cdn.metadl.com/generate/images/1365907/2026-06-23/rd4gj6icaieq/abstract-blue-glow-particles.png",
  },
  {
    id: "scene-10-founders",
    start: 51.0,
    duration: 4.5,
    kind: "founders",
    title: "Founders",
    copy: ["Built By", "Mousa Al-Awad", "Lead Developer & Co-Founder", "Abdulmoin Hablas", "CTO & Co-Founder"],
    accent: "#3b82f6",
    backgroundImage: "https://mgx-backend-cdn.metadl.com/generate/images/1365907/2026-06-23/rd4gj6icaieq/abstract-blue-glow-particles.png",
  },
  {
    id: "scene-11-climax",
    start: 55.5,
    duration: 5.5,
    kind: "climax",
    title: "Final Climax",
    copy: ["Everything You Need. One Workspace.", "Files. Discussions. Quizzes. Certificates.", "All In One Place."],
    accent: "#3b82f6",
    backgroundImage: "https://mgx-backend-cdn.metadl.com/generate/images/1365907/2026-06-23/rd4gkyacaiga/educational-tools-dark.png",
  },
  {
    id: "scene-12-endcard",
    start: 61.0,
    duration: 4.5,
    kind: "endcard",
    title: "End Card",
    copy: ["Shairley", "Where Excellence Meets Learning", "Organize. Collaborate. Achieve.", "Start Today", "shairley.vercel.app"],
    accent: "#3b82f6",
  },
];

export const promoAudio = {
  backgroundMusicUrl: "https://mgx-backend-cdn.metadl.com/generate/audios/1365907/2026-06-23/rd4esvyaaifa/shairley-promo-bgm.mp3",
  backgroundMusicDurationSeconds: 63.76,
  baseVolume: 0.26,
  duckVolume: 0.14,
  fadeInFrames: 18,
  fadeOutFrames: 24,
  loopIfShort: false,
};

export const getPromoTotalSeconds = (): number =>
  promoScenes.reduce((max, scene) => Math.max(max, scene.start + scene.duration), 0);

export const TOTAL_SECONDS = getPromoTotalSeconds();
export const TOTAL_FRAMES = FPS * TOTAL_SECONDS;