// Génère des illustrations SVG légères pour les pièces de démonstration.
import { writeFileSync, mkdirSync } from "node:fs";

const out = "public/images/parts";
mkdirSync(out, { recursive: true });

const palettes = [
  ["#0f172a", "#134e4a", "#2dd4bf"],
  ["#111827", "#1e3a5f", "#60a5fa"],
  ["#1c1917", "#3f2f1f", "#fbbf24"],
  ["#0f172a", "#3b0764", "#c084fc"],
  ["#111827", "#14532d", "#4ade80"],
  ["#1e1b4b", "#312e81", "#a5b4fc"],
];

const shapes = {
  moteur: `<rect x="110" y="120" width="180" height="120" rx="18"/><rect x="140" y="80" width="30" height="50" rx="6"/><rect x="190" y="80" width="30" height="50" rx="6"/><rect x="240" y="80" width="30" height="50" rx="6"/><circle cx="200" cy="180" r="28" fill="none" stroke-width="10"/>`,
  freinage: `<circle cx="200" cy="170" r="95" fill="none" stroke-width="14"/><circle cx="200" cy="170" r="52" fill="none" stroke-width="10"/><circle cx="200" cy="170" r="14"/><g stroke-width="10"><line x1="200" y1="118" x2="200" y2="100"/><line x1="245" y1="140" x2="260" y2="128"/><line x1="155" y1="140" x2="140" y2="128"/></g>`,
  suspension: `<path d="M150 80 h100 M200 80 v20 M150 250 h100 M200 250 v-20" stroke-width="12" fill="none"/><path d="M170 100 l60 20 l-60 20 l60 20 l-60 20 l60 20 l-60 20 l60 10" stroke-width="12" fill="none"/>`,
  electrique: `<path d="M215 60 L140 185 h60 l-20 95 L275 150 h-60 z" />`,
  filtres: `<rect x="130" y="90" width="140" height="160" rx="22"/><g stroke-width="6" opacity=".55"><line x1="150" y1="120" x2="250" y2="120"/><line x1="150" y1="145" x2="250" y2="145"/><line x1="150" y1="170" x2="250" y2="170"/><line x1="150" y1="195" x2="250" y2="195"/><line x1="150" y1="220" x2="250" y2="220"/></g>`,
  pneus: `<circle cx="200" cy="170" r="105"/><circle cx="200" cy="170" r="62" fill="#0b1020"/><circle cx="200" cy="170" r="18"/><g stroke-width="8" opacity=".5"><line x1="200" y1="108" x2="200" y2="65"/><line x1="200" y1="232" x2="200" y2="275"/><line x1="138" y1="170" x2="95" y2="170"/><line x1="262" y1="170" x2="305" y2="170"/></g>`,
  transmission: `<circle cx="150" cy="170" r="60" fill="none" stroke-width="16"/><circle cx="260" cy="170" r="40" fill="none" stroke-width="16"/><line x1="150" y1="110" x2="260" y2="130" stroke-width="10"/><line x1="150" y1="230" x2="260" y2="210" stroke-width="10"/>`,
  carrosserie: `<path d="M90 200 l40 -60 h140 l50 60 h20 v40 h-270 z" /><circle cx="150" cy="245" r="22" fill="#0b1020"/><circle cx="270" cy="245" r="22" fill="#0b1020"/>`,
  eclairage: `<path d="M120 170 a80 80 0 0 1 160 0 v0 a80 60 0 0 1 -160 0z"/><g stroke-width="8" opacity=".6"><line x1="300" y1="140" x2="340" y2="120"/><line x1="300" y1="170" x2="345" y2="170"/><line x1="300" y1="200" x2="340" y2="220"/></g>`,
  accessoires: `<path d="M130 100 h140 l30 40 v100 h-200 v-100 z"/><rect x="170" y="80" width="60" height="30" rx="8"/>`,
  refroidissement: `<rect x="110" y="100" width="180" height="140" rx="16"/><g stroke="#0b1020" stroke-width="6"><line x1="140" y1="100" x2="140" y2="240"/><line x1="170" y1="100" x2="170" y2="240"/><line x1="200" y1="100" x2="200" y2="240"/><line x1="230" y1="100" x2="230" y2="240"/><line x1="260" y1="100" x2="260" y2="240"/></g>`,
  echappement: `<path d="M80 150 h60 a20 20 0 0 1 20 20 v20 a20 20 0 0 0 20 20 h140" fill="none" stroke-width="22" stroke-linecap="round"/><rect x="230" y="120" width="60" height="50" rx="12"/>`,
};

let i = 0;
for (const [key, shape] of Object.entries(shapes)) {
  const [a, b, c] = palettes[i++ % palettes.length];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 340" width="400" height="340">
<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient>
<radialGradient id="o" cx=".8" cy=".2" r=".6"><stop offset="0" stop-color="${c}" stop-opacity=".45"/><stop offset="1" stop-color="${c}" stop-opacity="0"/></radialGradient>
<pattern id="grid" width="24" height="24" patternUnits="userSpaceOnUse"><path d="M24 0H0V24" fill="none" stroke="#ffffff" stroke-opacity=".06"/></pattern></defs>
<rect width="400" height="340" fill="url(#g)"/><rect width="400" height="340" fill="url(#grid)"/><rect width="400" height="340" fill="url(#o)"/>
<g fill="${c}" stroke="${c}" stroke-linejoin="round" stroke-linecap="round">${shape}</g>
</svg>`;
  writeFileSync(`${out}/${key}.svg`, svg);
}
console.log("ok", i, "placeholders");
