# شجرتي بصمتي · SHAJARATI BASMATI

An Arabic-first, RTL environmental tree-management platform for the 38 municipalities of **Skikda Wilaya, Algeria**.

> **لا نغرس شجرة ونرحل، بل نتابعها حتى تنمو**
> *We don't plant a tree and leave — we follow it until it grows.*

---

## Features

- **Zero baseline** — the platform starts with **0 trees, 0 campaigns, 0 posts and 0 accounts**. Every statistic, chart and municipality status is derived from the real persisted database; nothing is pre-seeded.
- **Real interactive map** — Leaflet + OpenStreetMap centred on Skikda `[36.876, 6.906]`, with real commune boundaries (geoBoundaries DZA-ADM3). The map starts with no pins; trees are plotted live from their admin-entered geo-coordinates.
- **38 Skikda municipalities** — real names, codes and centroid coordinates in every selector, view and report.
- **Strict RBAC** — guests browse the public home in restricted view; volunteers (the default role on sign-up) can scan QR codes, log *"سقيت اليوم"* waterings and use My Magazine; **Dashboard, tree/campaign creation, printing and publishing are admin-only**; User Management is state-admin-only.
- **Digital tree passport** — unique sequential matrix ID (`SKK-COL-043`), species, planting and watering dates, row/column, geo-coordinates, care log and escalation.
- **Required geo-coordinates** — tree and campaign forms both require latitude/longitude (validated, pre-filled from the municipality centre) so every tree has a true position on the map.
- **Per-tree QR printing** — a dedicated *"Print QR code"* button inside every passport prints a single A4 label with the QR, ID, species, municipality, R/C and coordinates; QR sheets cover whole campaigns, and a damaged QR can be recovered from its row/column.
- **Camera QR scanner** — live camera scanning with `BarcodeDetector` plus a manual-ID fallback for damaged codes and unsupported browsers.
- **My Magazine** — admins publish stories with image uploads (≤ 1.5 MB), and can edit, hide/re-publish or delete posts within their scope; guests and volunteers read and like only.
- **User management** — the State Admin promotes volunteers to Municipality Admin for a specific municipality or revokes them back to volunteer.
- **Bilingual UI** — Arabic by default with a full EN/AR toggle and RTL-first layout.
- **Responsive & accessible** — mobile navigation, keyboard-friendly modals, print styles and reduced-motion support.
- Produced by **نادي العقل الأخضر / Green Mind Club** (credited in the global footer).

## Tech Stack

| Layer | Technology |
| --- | --- |
| Framework | Next.js 16 (App Router) |
| UI | React 19 + TypeScript |
| Styling | Tailwind CSS 4 (`@theme` tokens) |
| Icons | Lucide React |
| Map | Leaflet 1.9 + react-leaflet 5 over OpenStreetMap tiles |
| QR codes | `qrcode.react` + camera `BarcodeDetector` |
| State | React Context + `localStorage` cache, synced to Supabase PostgreSQL |
| Cloud | `@supabase/supabase-js` (`fetchCloudData()` in `lib/supabase.ts`) |

## Getting Started

```bash
npm install
npm run dev
```

Open **http://localhost:3000**.

Production build:

```bash
npm run build
npm start
```

> The app renders as a single-page RTL experience. All state is typed in `lib/types.ts` and lives in two layers: **Supabase (PostgreSQL)** as the live source of truth, with automatic **localStorage** caching as an offline fallback.

## Cloud Setup (Supabase)

- Environment: `.env.local` → `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` (publishable key).
- Schema: run **`supabase/schema.sql`** once in *Supabase Dashboard → SQL Editor → Run* to create `trees`, `campaigns`, `posts`, `users` and `activities` (RLS enabled).
- Data flow: on page load `fetchCloudData()` (see `lib/supabase.ts`) fetches the whole wilaya state in one parallel call; every mutation (watering, campaigns, posts, roles) writes optimistically then syncs to the cloud. If the cloud is unreachable the UI keeps the last local snapshot and shows a "دون اتصال" chip with a manual refresh button in the dashboard.

## Accounts

- **Fixed state-admin account** (verified on the sign-in screen): `admin@skikda.dz` / `Admin@Skikda2026` — display name *مدير الولاية*, role `state_admin`, municipality `skikda-center` (resolved to Skikda). On sign-in the account is upserted to the cloud `users` table so the session has a real backbone.
- Volunteer accounts are created through **تطوع معنا**; a state admin grants Municipality Admin rights from **User Management**.

## Role Capabilities

### Guest (no account)
- Public home: hero, live KPI counters, the interactive wilaya map and the community magazine in restricted view.

### Volunteer
- Scan or search a tree QR/ID (camera + manual fallback).
- Open the digital passport and record **"سقيت اليوم"** watering.
- Browse municipalities and My Magazine; manage personal profile and health limitations.
- **No** dashboard, tree registration, campaign creation or publishing.

### Municipality Admin
- Everything a volunteer can do, plus:
- Dashboard KPIs, urgent-care list, campaigns, reports for their municipality.
- Register single trees and create campaigns **with required geo-coordinates**.
- Print per-tree QR labels and full QR sheets; recover IDs from row/column.
- Publish, edit, hide and delete magazine posts within their municipality.

### State Admin
- Full-wilaya view: all 38 municipalities, all reports and campaigns.
- **User Management**: promote volunteers to Municipality Admin (with municipality picker), revoke back to volunteer.

## App Tour

| View | What it contains |
| --- | --- |
| **Dashboard / Home** | Admins: hero, KPI cards, interactive map, quick actions, urgent-care list, campaigns, watering leaderboard, magazine preview and activity feed. Guests & volunteers: public home (hero, map, magazine preview, join card) |
| **Municipalities** | Searchable list of all 38 municipalities with live status, tree counts and drill-down |
| **Reports** | Municipality health, survival and attention breakdowns derived from real data, with CSV export |
| **My Magazine** | Category filters, search, post details, likes, image posts and scoped admin moderation |
| **User management** | State-admin-only account list with promote/revoke actions |
| **Profile** | Account details, contribution stats and personal field-health info |

## Key Interactions

- **Scan QR** — turn on the live camera, or type an ID such as `SKK-COL-043` manually.
- **Add campaign** — three-step wizard: campaign details (with required site LAT/LNG) → layout and spacing → review and create. Creating a campaign opens the printable QR sheet.
- **Water a tree** — open a passport and press **سقيت اليوم**; the watering count, last-watered date, tree status and activity feed update.
- **Print a single QR** — in the passport, press *Print QR code* for an A4 label with the QR and grid-recovery hint.
- **Recover a damaged QR** — in the QR sheet, enter the tree's row and column to retrieve its ID.
- **Language toggle** — switch between Arabic (RTL) and English (LTR) from the header.

## Data & Persistence

- State is persisted in `localStorage` under **`shajarati-basmati-v2`**; the legacy `shajarati-basmati-v1` key (which contained seeded demo data) is deleted automatically.
- `lib/data.ts` exports only empty seed arrays — all KPIs, monthly planting charts and species distributions are computed from real trees (`monthlyPlanting(trees)`, `speciesDistribution(trees)`).
- `lib/municipalities.ts` holds the 38 real communes (centroids from geoBoundaries DZA-ADM3); `computeMunicipalities(trees, users)` derives every municipality's status, counts and admin live.
- To reset the platform, clear the `shajarati-basmati-v2` key from your browser's local storage and reload.

## Map Data

- Tiles: © **OpenStreetMap** contributors.
- Commune polygons: **geoBoundaries DZA-ADM3** (simplified, CC BY-SA 2.0) — regeneratable via `lib/skikda-communes.json`.

## Project Structure

```text
app/
  layout.tsx          # Metadata, fonts, RTL document, provider
  page.tsx            # Renders AppShell
  globals.css         # Design tokens, animations, print styles
  icon.svg            # Branded favicon
components/
  AppShell.tsx        # Splash, view router (with RBAC guards), modal router, toast
  Header.tsx          # RBAC-filtered navigation, language toggle, profile menu
  Hero.tsx            # Dashboard hero
  Dashboard.tsx       # Admin dashboard + public home fallback
  MapView.tsx         # Leaflet wrapper with municipality panel
  LeafletMap.tsx      # Leaflet/OSM map, commune polygons, live tree pins
  Municipalities.tsx  # Municipality directory
  UserManagement.tsx  # State-admin role assignment
  Reports.tsx         # Reports and analytics (derived data)
  Magazine.tsx        # Magazine, post modal, composer with image upload
  Profile.tsx         # Profile and permissions
  AuthModal.tsx       # Sign in / volunteer sign up (no demo logins)
  QRScanner.tsx       # Camera scanning + manual ID fallback
  TreePassport.tsx    # Digital passport + single-label QR printing
  GridSystem.tsx      # Campaign creation wizard (required LAT/LNG)
  TreeForm.tsx        # Single-tree registration (required LAT/LNG)
  PrintQR.tsx         # Printable QR sheet and ID recovery
  TreeArt.tsx         # SVG tree artwork and emblem
  ui.tsx              # Shared primitives (Modal, Badge, Progress…)
lib/
  types.ts            # Domain types
  data.ts             # Species/status/role metadata + derived chart helpers
  municipalities.ts   # 38 communes, centroids and live computation
  skikda-communes.json
  store.tsx           # Context, RBAC gating, actions and persistence
  utils.ts            # Formatting and ID helpers
```

## Design Tokens

| Token | Value |
| --- | --- |
| Deep Forest Green | `#123B2A` |
| Emerald Green | `#16865B` |
| Soft Mint | `#B8E6CE` |
| Warm Background | `#F7F9F5` |
| Charcoal Text | `#202B25` |

Typography: **IBM Plex Sans Arabic** for UI, with a Tajawal-style display feel.

## Notes

- This is a front-end application: accounts, trees, campaigns and magazine posts are stored locally in the browser, not on a server.
- Positions of users other than the initial state mandate will be reflected once role management is used.
- QR codes encode the tree ID; the printable sheet is optimised for A4 portrait.
- Map attribution is shown on the map panel; published photos are stored as data URLs (≤ 1.5 MB).
