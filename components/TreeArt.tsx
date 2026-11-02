"use client";

import { useId } from "react";
import { cn } from "@/lib/utils";

const PALETTES = [
  {
    skyA: "#EAF7EF",
    skyB: "#CBEBD9",
    sun: "#F3D68B",
    far: "#B7DEC8",
    mid: "#8CC7A5",
    ground: "#5FAE85",
    trunk: "#7B5A3A",
    canopy: "#16865B",
    canopy2: "#0F6B47",
    accent: "#DFF3E7",
  },
  {
    skyA: "#F4F9ED",
    skyB: "#DCEFD7",
    sun: "#F0CE7A",
    far: "#C8DFB5",
    mid: "#9DCB8D",
    ground: "#6EAF72",
    trunk: "#6E4F33",
    canopy: "#2C8C5E",
    canopy2: "#166B47",
    accent: "#EAF6E1",
  },
  {
    skyA: "#E9F4F0",
    skyB: "#C6E4DC",
    sun: "#F5DCA0",
    far: "#ADD7C7",
    mid: "#7CBFAA",
    ground: "#4F9F86",
    trunk: "#75573C",
    canopy: "#14785A",
    canopy2: "#0E5C46",
    accent: "#DAF0E8",
  },
  {
    skyA: "#F7F5EA",
    skyB: "#E6E9CC",
    sun: "#EEC46A",
    far: "#D3D9AC",
    mid: "#AEBE86",
    ground: "#849C62",
    trunk: "#7A5B3C",
    canopy: "#4B8C4A",
    canopy2: "#316E39",
    accent: "#EDF0D9",
  },
  {
    skyA: "#EAF2F7",
    skyB: "#CFE2E9",
    sun: "#F2D48D",
    far: "#B5D2D6",
    mid: "#89BDBD",
    ground: "#5E9C9B",
    trunk: "#705438",
    canopy: "#1F7D68",
    canopy2: "#125D4F",
    accent: "#E2F0EF",
  },
  {
    skyA: "#FBF2E6",
    skyB: "#F2DDC4",
    sun: "#E8A94F",
    far: "#DCC7A5",
    mid: "#C4A97D",
    ground: "#A1865D",
    trunk: "#6B4B30",
    canopy: "#6C8C45",
    canopy2: "#4E6D34",
    accent: "#F6E8D4",
  },
  {
    skyA: "#EFF7EA",
    skyB: "#D6EBC9",
    sun: "#F2D27E",
    far: "#C2DEAD",
    mid: "#97C67F",
    ground: "#6BA65D",
    trunk: "#74573A",
    canopy: "#3C8F4F",
    canopy2: "#256B3C",
    accent: "#E8F5DD",
  },
  {
    skyA: "#EDF3F2",
    skyB: "#D2E6E2",
    sun: "#F0D391",
    far: "#B9D8D2",
    mid: "#8CC0B8",
    ground: "#5F9E96",
    trunk: "#73563A",
    canopy: "#2A7E72",
    canopy2: "#185C54",
    accent: "#E1F1EE",
  },
  {
    skyA: "#F6F1E9",
    skyB: "#E9DCC9",
    sun: "#E9B85C",
    far: "#D6C3A5",
    mid: "#BCA47F",
    ground: "#97805F",
    trunk: "#68492E",
    canopy: "#7C8A43",
    canopy2: "#5D6B2F",
    accent: "#F1E6D5",
  },
  {
    skyA: "#F1F6EC",
    skyB: "#DCEBCF",
    sun: "#F1D48B",
    far: "#C5DFB2",
    mid: "#9FCB8A",
    ground: "#74AC63",
    trunk: "#785A3B",
    canopy: "#398C55",
    canopy2: "#226A3F",
    accent: "#EAF4DE",
  },
];

export function TreeArt({
  seed = 0,
  className,
  preserve = "slice",
}: {
  seed?: number;
  className?: string;
  preserve?: "slice" | "meet";
}) {
  const uid = useId().replace(/:/g, "");
  const p = PALETTES[Math.abs(seed) % PALETTES.length];
  const variant = Math.abs(seed) % 3;
  const trees = [
    { x: 122, y: 186, s: 1.05 },
    { x: 210, y: 196, s: 0.82 },
    { x: 292, y: 188, s: 0.94 },
  ].slice(0, variant === 2 ? 3 : variant === 1 ? 2 : 3);

  return (
    <svg
      viewBox="0 0 400 260"
      preserveAspectRatio={
        preserve === "slice" ? "xMidYMid slice" : "xMidYMid meet"
      }
      className={cn("h-full w-full max-h-[400px] max-w-full object-contain", className)}
      role="img"
      aria-label="Tree landscape illustration"
    >
      <defs>
        <linearGradient id={`sky-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={p.skyA} />
          <stop offset="100%" stopColor={p.skyB} />
        </linearGradient>
        <linearGradient id={`ground-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={p.mid} />
          <stop offset="100%" stopColor={p.ground} />
        </linearGradient>
        <radialGradient id={`sun-${uid}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={p.sun} stopOpacity="0.95" />
          <stop offset="100%" stopColor={p.sun} stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect width="400" height="260" fill={`url(#sky-${uid})`} />
      <circle cx="322" cy="58" r="52" fill={`url(#sun-${uid})`} />
      <circle cx="322" cy="58" r="19" fill={p.sun} opacity="0.85" />

      <path
        d="M0 150 C 45 120, 90 132, 132 148 C 176 164, 212 118, 258 132 C 302 145, 345 126, 400 142 L400 260 L0 260 Z"
        fill={p.far}
        opacity="0.75"
      />
      <path
        d="M0 176 C 58 150, 105 166, 150 178 C 202 192, 244 158, 294 170 C 338 180, 368 168, 400 174 L400 260 L0 260 Z"
        fill={p.mid}
        opacity="0.9"
      />
      <path
        d="M0 205 C 62 188, 118 206, 176 202 C 240 197, 300 210, 400 196 L400 260 L0 260 Z"
        fill={`url(#ground-${uid})`}
      />

      {trees.map((t, i) => {
        const scale = t.s;
        return (
          <g key={i} transform={`translate(${t.x} ${t.y}) scale(${scale})`}>
            <ellipse cx="0" cy="8" rx="26" ry="6" fill={p.canopy2} opacity="0.18" />
            <path
              d="M-3 6 C -2 -14, -1 -28, 1 -40 C 2 -30, 3 -14, 4 6 Z"
              fill={p.trunk}
            />
            <path
              d="M1 -22 C -8 -30, -13 -38, -16 -47"
              stroke={p.trunk}
              strokeWidth="2.4"
              fill="none"
              strokeLinecap="round"
            />
            <path
              d="M2 -26 C 10 -34, 15 -41, 18 -50"
              stroke={p.trunk}
              strokeWidth="2.4"
              fill="none"
              strokeLinecap="round"
            />
            <circle cx="-14" cy="-55" r="15" fill={p.canopy2} opacity="0.95" />
            <circle cx="14" cy="-58" r="16" fill={p.canopy} />
            <circle cx="0" cy="-70" r="18" fill={p.canopy} />
            <circle cx="-8" cy="-52" r="15" fill={p.canopy} />
            <circle cx="10" cy="-46" r="13" fill={p.canopy2} opacity="0.9" />
            <circle cx="1" cy="-66" r="9" fill={p.accent} opacity="0.22" />
            <circle cx="17" cy="-62" r="4" fill={p.accent} opacity="0.35" />
            <circle cx="-16" cy="-50" r="3.4" fill={p.accent} opacity="0.3" />
          </g>
        );
      })}

      <path
        d="M0 232 C 70 226, 140 236, 210 230 C 280 224, 340 234, 400 228"
        stroke={p.accent}
        strokeWidth="1.4"
        opacity="0.45"
        fill="none"
      />
      <g stroke={p.accent} strokeWidth="1.2" opacity="0.5" strokeLinecap="round">
        <path d="M54 244 l4 -10 M54 244 l-4 -8" />
        <path d="M344 242 l4 -11 M344 242 l-5 -8" />
        <path d="M238 248 l3 -8 M238 248 l-4 -7" />
        <path d="M168 246 l3 -9 M168 246 l-4 -6" />
      </g>
      <g fill="none" stroke={p.canopy2} strokeWidth="1.4" opacity="0.55" strokeLinecap="round">
        <path d="M286 64 q5 -6 10 0 q5 -6 10 0" />
        <path d="M310 84 q4 -5 8 0 q4 -5 8 0" />
      </g>
    </svg>
  );
}

export function TreeEmblem({ className }: { className?: string }) {
  const uid = useId().replace(/:/g, "");
  return (
    <svg
      viewBox="0 0 320 320"
      className={cn("h-auto w-full max-w-full object-contain", className)}
      role="img"
      aria-label="Shajarati Basmati tree emblem"
    >
      <defs>
        <radialGradient id={`glow-${uid}`} cx="50%" cy="46%" r="52%">
          <stop offset="0%" stopColor="#B8E6CE" stopOpacity="0.5" />
          <stop offset="70%" stopColor="#16865B" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#123B2A" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`leaf-${uid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#DDF4E6" />
          <stop offset="100%" stopColor="#8CC7A5" />
        </linearGradient>
      </defs>

      <circle cx="160" cy="160" r="150" fill={`url(#glow-${uid})`} />
      <circle
        cx="160"
        cy="160"
        r="132"
        fill="none"
        stroke="#B8E6CE"
        strokeOpacity="0.18"
        strokeWidth="1"
      />
      <circle
        cx="160"
        cy="160"
        r="112"
        fill="none"
        stroke="#B8E6CE"
        strokeOpacity="0.28"
        strokeWidth="1"
        strokeDasharray="3 7"
      />
      <circle
        cx="160"
        cy="160"
        r="88"
        fill="none"
        stroke="#B8E6CE"
        strokeOpacity="0.14"
        strokeWidth="1"
      />

      <g opacity="0.9">
        <circle cx="160" cy="78" r="3" fill="#B8E6CE" opacity="0.55" />
        <circle cx="238" cy="118" r="2.4" fill="#B8E6CE" opacity="0.5" />
        <circle cx="82" cy="112" r="2.8" fill="#B8E6CE" opacity="0.45" />
        <circle cx="246" cy="214" r="2.2" fill="#B8E6CE" opacity="0.4" />
        <circle cx="70" cy="206" r="2.6" fill="#B8E6CE" opacity="0.35" />
      </g>

      {/* Tree */}
      <ellipse cx="160" cy="252" rx="66" ry="10" fill="#061E14" opacity="0.28" />
      <path
        d="M154 248 C 156 214, 157 192, 160 172 C 163 192, 164 214, 166 248 Z"
        fill="#9B7A4F"
      />
      <path
        d="M160 204 C 142 190, 128 178, 118 160"
        stroke="#9B7A4F"
        strokeWidth="5"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M160 190 C 178 176, 192 164, 202 146"
        stroke="#9B7A4F"
        strokeWidth="5"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M160 218 C 145 210, 136 202, 128 192"
        stroke="#9B7A4F"
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
      />

      <g>
        <circle cx="116" cy="152" r="30" fill="#16865B" />
        <circle cx="160" cy="124" r="38" fill="#1C9A68" />
        <circle cx="204" cy="146" r="32" fill="#16865B" />
        <circle cx="138" cy="170" r="28" fill="#0F6B47" />
        <circle cx="186" cy="172" r="27" fill="#127653" />
        <circle cx="160" cy="150" r="30" fill={`url(#leaf-${uid})`} opacity="0.92" />
        <circle cx="146" cy="132" r="12" fill="#EAF8EF" opacity="0.22" />
        <circle cx="200" cy="160" r="7" fill="#EAF8EF" opacity="0.18" />
        <circle cx="126" cy="164" r="6" fill="#EAF8EF" opacity="0.16" />
      </g>

      <g stroke="#B8E6CE" strokeOpacity="0.35" strokeWidth="1.4" strokeLinecap="round">
        <path d="M160 252 C 150 258, 142 260, 134 264" fill="none" />
        <path d="M160 252 C 170 258, 178 260, 186 264" fill="none" />
        <path d="M160 252 L 160 266" fill="none" />
      </g>

      <g fill="#B8E6CE">
        <circle cx="104" cy="92" r="1.6" opacity="0.5" />
        <circle cx="216" cy="84" r="1.4" opacity="0.4" />
        <circle cx="252" cy="170" r="1.4" opacity="0.35" />
      </g>
    </svg>
  );
}

export function TreeGlyph({
  className,
  color = "#16865B",
}: {
  className?: string;
  color?: string;
}) {
  return (
    <svg viewBox="0 0 48 48" className={cn("size-10", className)} aria-hidden>
      <path
        d="M24 44V26"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M24 30c-6 0-11-4-11-10 0-3 1.5-5.5 4-7 .5 3 2 5 4.5 6-.5-5 1.5-9 6.5-11 0 4 1 6.5 3.5 8.5 3-2 6-1 8 1.5-2 4-5.5 6.5-9.5 6.5-2 0-4-.5-6-1.5"
        fill="none"
        stroke={color}
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
