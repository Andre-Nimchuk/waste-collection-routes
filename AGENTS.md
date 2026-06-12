# AGENTS.md

## Project Goal

Build an Expo React Native technical test for waste collection route visualization.

The app must:

* read and process the provided Excel file through local Node.js preprocessing scripts;
* geocode addresses using a public geocoding provider;
* display at least one week of waste collection locations on a map;
* connect route stops according to the existing route order from the Excel file;
* show route statistics and bin information;
* include a lightweight deterministic route insights layer prepared for future AI-assisted route control.

The goal is to complete the technical task end-to-end without overengineering.

---

## Core Stack

Use only the approved core stack unless explicitly instructed otherwise:

* Expo
* React Native
* TypeScript
* Node.js local preprocessing scripts
* react-native-maps
* xlsx
* Zustand for lightweight state
* date-fns for date handling
* public geocoding provider with cache

Do not introduce large dependencies unless there is a clear reason and the decision is explained.

---

## Architecture Principles

The project uses local preprocessing scripts instead of a real backend.

Data flow:

Excel file → Node.js preprocessing scripts → normalized JSON → Expo app → map/statistics UI.

Rules:

* Do not parse Excel directly inside React Native UI components.
* Do not run heavy geocoding logic from the mobile UI.
* Keep parsing, normalization, geocoding, statistics, and route insights inside `scripts/`.
* Keep mobile UI focused on visualization and interaction.
* Keep domain types reusable between scripts and app where practical.
* Prefer small pure functions for parsing and data transformation.
* Keep business logic out of React components.
* Prefer explicit types over `any`.

---

## Required Project Structure

Use this structure as the main guide:

```txt
input/
  Routes 01.01.2026-31.03.2026 tech test.xlsx

cache/
  geocoding-cache.json

scripts/
  prepare-data.ts
  parse-excel.ts
  geocode-addresses.ts
  generate-week-data.ts

  config/
  domain/
  services/
  providers/
  utils/

src/
  app/
  data/
  entities/
  features/
  screens/
  shared/

docs/
  codex/
```

---

## Excel Processing Rules

The Excel file contains route headers like:

`ML 11840 no 01.01.26`

When a route header is found:

* parse it as the current route;
* assign all following stop rows to this route;
* continue until the next route header is found.

Do not group all stops of the same date into one route.

Correct grouping for route visualization:

`routeId + date → sorted by routeOrder`

---

## Service Day Parsing Rules

The service day pattern has 7 positions:

1 = Monday
2 = Tuesday
3 = Wednesday
4 = Thursday
5 = Friday
6 = Saturday
7 = Sunday

Examples:

* `xx3xxx7` = Wednesday and Sunday
* `xxx4xxx` = Thursday
* `1xxxxxx` = Monday
* `x2xxxxx` = Tuesday

Unknown or invalid values must not crash the app.

Preserve the original value and mark parsed result as unknown/custom when needed.

---

## Frequency Parsing Rules

Examples:

* `1xn` = once a week
* `1x2n` = once every two weeks
* `1x4n` = once every four weeks
* `1x8n` = once every eight weeks
* `1x12n` = once every twelve weeks

Unknown values must be preserved and shown as custom or unknown.

---

## Address and Geocoding Rules

Always preserve both:

* `originalAddress`
* `cleanedAddress`

Geocode unique cleaned addresses, not every Excel row.

Use a geocoding cache.

Do not send uncontrolled parallel geocoding requests.

Failed geocoding must not stop the full data preparation pipeline.

Generated data must include failed geocoding information so the UI can show warnings.

Do not hardcode API keys.

Do not commit secret keys.

---

## Map Rules

The app must display at least one week of route data.

Render markers only for stops with valid coordinates.

Build route polylines by:

`routeId + date → sort by routeOrder → coordinates → polyline`

Do not connect different routes into one polyline.

Do not optimize route order unless explicitly requested.

The route must follow the existing Excel order.

---

## Route Statistics Rules

Show route-level statistics:

* route ID;
* date;
* stop count;
* unique address count;
* total containers;
* total bin volume;
* geocoded stops;
* failed geocoding stops;
* service days;
* frequencies;
* first route order;
* last route order;
* route insights.

---

## Bin Information Rules

On marker selection, show:

* original address;
* cleaned address;
* route ID;
* route order;
* bin code;
* service day pattern;
* parsed service days;
* frequency code;
* parsed frequency;
* bin volume;
* container count;
* date;
* geocoding status.

---

## Route Insights / AI-Ready Layer

Use deterministic route analysis instead of a real AI model.

Detect:

* missing coordinates;
* duplicate addresses;
* long-distance gaps between consecutive route stops;
* route order gaps;
* duplicate route orders;
* failed geocoding count.

Use this README wording:

“The current implementation uses deterministic route analysis instead of a real AI model to avoid overengineering the technical task. However, the architecture is prepared for an AI-assisted route control layer.”

Do not integrate a real LLM or AI API unless explicitly requested.

---

## QA Rules

When asked to test or review a flow, follow `docs/codex/QA_CHECKLIST.md`.

Prefer low-cost checks first:

1. TypeScript check.
2. Parser smoke test.
3. Generated JSON shape check.
4. Core UI flow review.
5. Manual scenario checklist.

Do not run expensive full geocoding unless explicitly requested.

For geocoding tests, use a small sample or cached data.

---

## Security Rules

When asked to review security, follow `docs/codex/SECURITY_CHECKLIST.md`.

Main security rules:

* no API keys in code;
* no secrets in generated JSON;
* no uncontrolled public geocoding spam;
* no hidden backend assumptions;
* no sensitive data logging;
* no committing `.env` files;
* no leaking provider tokens to the mobile app.

---

## Token / Context Efficiency Rules

Before modifying code:

* inspect only relevant files;
* summarize the implementation plan briefly;
* avoid reading the entire repository if not needed;
* avoid rewriting large files without reason;
* prefer focused diffs;
* ask for confirmation only when scope is ambiguous.

When reviewing:

* focus on changed files first;
* check against the technical task requirements;
* check architecture boundaries;
* check data shape compatibility;
* check edge cases.

---

## Do Not Rules

Do not overengineer.
Do not add a real backend server.
Do not add authentication.
Do not add a database.
Do not add real route optimization.
Do not add a real AI API integration.
Do not hide geocoding failures.
Do not parse Excel inside React components.
Do not mix UI logic with data processing.
Do not use `any` unless unavoidable and explained.
Do not introduce unnecessary libraries.
Do not change the core stack without explicit approval.

---

## Commands

Use these commands:

```bash
npm install
npm run prepare:data
npm run parse:excel
npm run geocode
npm run generate:week
npm run start
npm run typecheck
```

---

## Definition of Done

The task is done when:

* Excel file is parsed;
* route headers are handled correctly;
* stop rows are assigned to correct route IDs;
* service day patterns are parsed;
* frequency codes are parsed;
* addresses are cleaned and deduplicated;
* unique addresses are geocoded with cache;
* failed geocoding is handled;
* at least one week is displayed on the map;
* markers are visible;
* route polylines follow Excel route order;
* route statistics are shown;
* bin information is shown;
* route insights are shown;
* README explains setup, assumptions, architecture, limitations, and future improvements;
* TypeScript check passes;
* no unnecessary backend or AI integration is added.
