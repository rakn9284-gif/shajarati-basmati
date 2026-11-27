# حملتي · HAMALATI

An Arabic-first, RTL platform for managing and documenting **group planting campaigns and their sites** across the 38 municipalities of **Skikda Wilaya, Algeria**.

> **نُدير حملات التشجير الجماعية ونوثّق مواقع الغرس حتى تنمو**
> *We manage group planting campaigns and document planting sites as they grow.*

---

## Features

- **Zero baseline** — the platform starts with **0 trees, 0 campaigns, 0 posts and 0 accounts**. Every statistic, chart and municipality status is derived from the real persisted database; nothing is pre-seeded.
- **One QR per campaign** — every planting site gets a single high-resolution QR code pointing to `?campaign=<id>`. Scanning it (or entering the code manually) opens a full site card: name, municipality, date, organizer, registered tree/species totals and site status.
- **Site boundaries on the map** — campaign forms include a click-to-draw polygon editor (3+ points, clear/redraw) with approximate area in m² / hectares. Saved polygons render as translucent green boundaries on the main map; clicking one opens the site card.
- **A4 field sign** — one printable A4 campaign sign with the حملتي logo, campaign name, municipality, date, organizer, totals, a large quiet-zone QR and the campaign code. Clean print styles hide all buttons and menus.
- **Tree registration for statistics** — trees keep their sequential matrix ID (`SKK-COL-043`), species, row/column and care/watering log, but **no per-tree QR codes are generated**. They feed species statistics and the digital passport used for care tracking.
- **Real interactive map** — Leaflet + OpenStreetMap centred on Skikda `[36.876, 6.906]`, with real commune boundaries (geoBoundaries DZA-ADM3) and live campaign site markers/polygons.
- **38 Skikda municipalities** — real names, codes and centroid coordinates in every selector, view and report.
- **Strict RBAC** — guests browse the public home in restricted view; volunteers can scan site QR codes, log *"سقيت اليوم"* waterings and use My Magazine; **Dashboard, tree/campaign creation, editing and printing are admin-only**; User Management is state-admin-only.
- **Camera QR scanner** — live camera scanning with `BarcodeDetector` (plus a `jsQR` compatibility engine) and a manual campaign-code fallback. Scanned URLs with `?campaign=` are resolved automatically, and deep links open the site card directly.
- **My Magazine** — admins publish stories with image uploads (≤ 1.5 MB), and can edit, hide/re-publish or delete posts within their scope; guests and volunteers read and like only.
- **Bilingual UI** — Arabic by default with a full EN/AR toggle and RTL-first layout.
- Produced by **نادي العقل الأخضر / Green Mind Club** (credited in the global footer).

## Tech Stack

| Layer | Technology |
| --- | --- |
| Framework | Next.js 16 (App Router) |
| UI | React 19 + TypeScript |
| Styling | Tailwind CSS 4 (`@theme` tokens) |
| Icons | Lucide React |
| Map | Leaflet 1.9 + react-leaflet 5 over OpenStreetMap tiles |
| QR codes | `qrcode.react` (display), `BarcodeDetector` + `jsqr` (camera scanning) |
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
- Schema: run **`supabase/schema.sql`** once in *Supabase Dashboard → SQL Editor → Run* to create `trees`, `campaigns`, `posts`, `users` and `activities` (RLS enabled). It also adds the `organizer`, `polygon` and `area_sqm` columns to `campaigns` for existing databases.
- Data flow: on page load `fetchCloudData()` (see `lib/supabase.ts`) fetches the whole wilaya state in one parallel call; every mutation (watering, campaigns, posts, roles) writes optimistically then syncs to the cloud. If the cloud is unreachable the UI keeps the last local snapshot and shows a "دون اتصال" chip with a manual refresh button in the dashboard.

## Accounts

- **Fixed state-admin account** (verified on the sign-in screen): `admin@skikda.dz` / `Admin@Skikda2026` — display name *مدير الولاية*, role `state_admin`, municipality `skikda-center` (resolved to Skikda). On sign-in the account is upserted to the cloud `users` table so the session has a real backbone.
- Volunteer accounts are created through **تطوع معنا**; a state admin grants Municipality Admin rights from **User Management**.

## Role Capabilities

### Guest (no account)
- Public home: hero, live KPI counters, the interactive wilaya map and the community magazine in restricted view.

### Volunteer
- Scan or enter a campaign code to open the site card (camera + manual fallback).
- Open a tree passport from the campaign's species list and record **"سقيت اليوم"** watering.
- Browse municipalities and My Magazine; manage personal profile and health limitations.
- **No** dashboard, tree/campaign creation, editing or publishing.

### Municipality Admin
- Everything a volunteer can do, plus:
- Dashboard KPIs, urgent-care list, campaigns, reports for their municipality.
- Register single trees and create/edit campaigns **with a drawn site boundary and organizer**.
- Print the A4 campaign site sign; add trees to a campaign for its statistics.
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

- **Scan site QR** — turn on the live camera, or type a campaign code such as `CMP-SKK-001` manually; a scanned `?campaign=` URL opens the card directly.
- **Add campaign** — wizard: campaign details (site centre, organizer, map polygon) → layout and spacing → review and create. Creating a campaign opens the printable A4 site sign.
- **Open a site card** — from the map, a campaign list, the scanner or a deep link; shows stats, species mix, boundary info, QR and admin actions.
- **Water a tree** — open a tree passport from the site card or map and press **سقيت اليوم**; the watering count, last-watered date, tree status and activity feed update.
- **Print the site sign** — from the created campaign or the site card; prints one clean A4 page.
- **Language toggle** — switch between Arabic (RTL) and English (LTR) from the header.

## Data & Persistence

- State is persisted in `localStorage` under **`shajarati-basmati-v2`** (retained for compatibility); the legacy `shajarati-basmati-v1` key (which contained seeded demo data) is deleted automatically.
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
  LeafletMap.tsx      # Leaflet/OSM map, communes, campaign site polygons, tree pins
  PolygonDrawMap.tsx  # Click-to-draw site boundary editor
  CampaignSite.tsx    # Full site card modal (stats, species, QR, actions)
  Municipalities.tsx  # Municipality directory
  UserManagement.tsx  # State-admin role assignment
  Reports.tsx         # Reports and analytics (derived data)
  Magazine.tsx        # Magazine, post modal, composer with image upload
  Profile.tsx         # Profile and permissions
  AuthModal.tsx       # Sign in / volunteer sign up (no demo logins)
  QRScanner.tsx       # Campaign QR camera scanning + manual code fallback
  TreePassport.tsx    # Digital tree passport for care/watering
  GridSystem.tsx      # Campaign creation wizard (organizer + map boundary)
  TreeForm.tsx        # Single-tree registration (required LAT/LNG)
  PrintQR.tsx         # One printable A4 campaign site sign
  TreeArt.tsx         # SVG tree artwork and emblem
  ui.tsx              # Shared primitives (Modal, Badge, Progress…)
lib/
  types.ts            # Domain types
  data.ts             # Species/status/role metadata + derived chart helpers
  municipalities.ts   # 38 communes, centroids and live computation
  skikda-communes.json
  store.tsx           # Context, RBAC gating, actions and persistence, ?campaign= deep link
  utils.ts            # Formatting, ID and polygon-area helpers
supabase/
  schema.sql          # Tables + campaign organizer/polygon/area migrations
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

- Supabase is the source of truth; the browser cache keeps the UI usable offline.
- Positions of users other than the initial state mandate will be reflected once role management is used.
- Campaign QR codes encode `?campaign=<id>`; the printable sign is optimised for A4 portrait.
- Site area is an estimate computed from the drawn polygon around its mean latitude.
- Map attribution is shown on the map panel; published photos are stored as data URLs (≤ 1.5 MB).
