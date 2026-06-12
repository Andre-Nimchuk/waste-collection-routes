# Technical Plan — Waste Collection Routes Test

## 1. Goal

Build an Expo React Native application for visualizing waste collection routes from the provided Excel file.

The application must:

* read and process the Excel file;
* geocode waste collection addresses;
* display locations on a map for at least one week;
* decode service day patterns;
* decode frequency patterns;
* connect route stops according to the route order;
* show route statistics;
* show bin information.

The goal is to complete the technical task end-to-end with a clean architecture, clear data flow, and no unnecessary overengineering.

---

## 2. Core Stack

### Mobile App

* Expo
* React Native
* TypeScript
* react-native-maps
* Zustand for lightweight state management
* date-fns for date utilities

### Data Processing

* Node.js local preprocessing scripts
* TypeScript
* xlsx for Excel parsing
* generated JSON files
* geocoding cache

### Geocoding

* Public geocoding provider
* Default option: OpenStreetMap Nominatim
* Provider-agnostic structure for possible Google Maps or Mapbox replacement if needed

---

## 3. Architecture Overview

The project does not use a separate backend service.

Instead, it uses local Node.js preprocessing scripts inside the same repository.

Data flow:

```txt
Excel file
  ↓
Node.js preprocessing scripts
  ↓
normalized route data
  ↓
address cleaning and deduplication
  ↓
geocoding with cache
  ↓
generated JSON files
  ↓
Expo React Native app
  ↓
map, markers, polylines, statistics, bin details
```

This keeps heavy data processing outside the mobile UI and keeps the app focused on route visualization and interaction.

---

## 4. Repository Structure

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
  providers/
  services/
  utils/

src/
  app/
  data/
  entities/
  features/
  screens/
  shared/

docs/
  TECHNICAL_PLAN.md
  codex/
    QA_CHECKLIST.md
```

---

## 5. Excel Processing

The Excel file contains route headers and stop rows.

Route headers look like:

```txt
ML 11840 no 01.01.26
```

The parser must:

* detect route headers;
* parse route ID;
* parse route number;
* parse route date;
* forward-fill the current route into following stop rows;
* parse stop rows until the next route header is found.

Important rule:

```txt
Do not group all stops of the same date into one route.
Correct grouping is routeId + date.
```

Each parsed stop should include:

* route ID;
* route number;
* route date;
* stop date;
* route order;
* bin code;
* service day pattern;
* frequency code;
* original address;
* bin volume;
* container count;
* raw row values.

---

## 6. Service Day Parsing

The service day pattern has 7 positions:

```txt
1 = Monday
2 = Tuesday
3 = Wednesday
4 = Thursday
5 = Friday
6 = Saturday
7 = Sunday
```

Examples:

```txt
xx3xxx7 = Wednesday and Sunday
xxx4xxx = Thursday
1xxxxxx = Monday
x2xxxxx = Tuesday
```

Invalid or unknown values must not crash the parser or the app.
The original value should be preserved.

---

## 7. Frequency Parsing

Frequency examples:

```txt
1xn   = once a week
1x2n  = once every two weeks
1x4n  = once every four weeks
1x8n  = once every eight weeks
1x12n = once every twelve weeks
```

Unknown values should be preserved and displayed as custom or unknown.

---

## 8. Address Normalization

The system must always preserve both:

```txt
originalAddress
cleanedAddress
```

Cleaning examples:

```txt
Dobeles šoseja 47A/MAXIMA/  → Dobeles šoseja 47A
Īves iela 4 (kartons)       → Īves iela 4
Kungu iela 25 (stikls)      → Kungu iela 25
Raiņa iela 7;               → Raiņa iela 7
```

Address cleaning rules:

* trim whitespace;
* remove trailing semicolons;
* remove unnecessary material notes in parentheses;
* remove business names after slash where safe;
* preserve Latvian characters;
* normalize repeated spaces;
* never mutate the original address.

---

## 9. Geocoding

The app should geocode unique cleaned addresses, not every Excel row.

Correct flow:

```txt
route rows
  ↓
clean addresses
  ↓
deduplicate cleaned addresses
  ↓
geocode unique addresses
  ↓
attach coordinates back to route stops
```

The geocoding pipeline must:

* use a public geocoding provider;
* use local cache;
* avoid duplicate requests;
* handle failed geocoding;
* avoid uncontrolled parallel requests;
* not hardcode API keys;
* not run full geocoding from the mobile UI.

Cache file:

```txt
cache/geocoding-cache.json
```

Failed geocoding should be exported and visible in route statistics or route insights.

---

## 10. Generated Data

The preprocessing scripts should generate JSON files consumed by the Expo app.

Expected generated files:

```txt
src/data/routes.json
src/data/routes-week.json
src/data/route-stats.json
src/data/failed-geocoding.json
src/data/data-summary.json
```

Purpose:

* `routes.json` — full parsed/normalized route data;
* `routes-week.json` — selected week used by the app;
* `route-stats.json` — route-level statistics;
* `failed-geocoding.json` — addresses that could not be geocoded;
* `data-summary.json` — summary for debugging and README.

---

## 11. Map Visualization

The app must display at least one week of route data.

Map requirements:

* render markers for geocoded stops;
* skip stops without coordinates safely;
* group stops by route ID and date;
* sort stops by route order;
* render one polyline per route;
* connect stops according to the original Excel route order;
* do not connect different routes into one line;
* do not perform route optimization.

Polyline logic:

```txt
routeId + date
  ↓
sort by routeOrder
  ↓
extract coordinates
  ↓
render polyline
```

---

## 12. Route Statistics

For a selected route/date, show:

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
* route order range;
* route insights.

---

## 13. Bin Information

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

## 14. Smart Route Insights

The project includes a lightweight deterministic route insights layer.

It should detect:

* missing coordinates;
* duplicate addresses;
* long-distance gaps between consecutive route stops;
* route order gaps;
* duplicate route orders;
* failed geocoding count.

This is not a real AI model and does not optimize the route.

README wording:

```txt
The current implementation uses deterministic route analysis instead of a real AI model to avoid overengineering the technical task. However, the architecture is prepared for an AI-assisted route control layer.
```

This section is included only to reflect the route control idea in a lightweight way without expanding the technical task scope.

---

## 15. Implementation Order

Recommended development order:

1. Project setup.
2. Excel parser.
3. Service day parser.
4. Frequency parser.
5. Address normalization.
6. Normalized route data generation.
7. Geocoding provider and cache.
8. Week dataset generation.
9. Route statistics generation.
10. Route insights generation.
11. Map UI.
12. Route filters.
13. Bin details UI.
14. Route statistics UI.
15. Route insights UI.
16. README.
17. Final QA review.

---

## 16. QA Checklist

Before final delivery, verify:

* Excel file is processed.
* Route headers are detected.
* Stop rows are assigned to correct route IDs.
* Service day patterns are parsed.
* Frequency patterns are parsed.
* Addresses are cleaned and deduplicated.
* Geocoding cache is used.
* Failed geocoding is handled.
* At least one week is displayed on the map.
* Markers are visible.
* Polylines follow route order.
* Different routes are not connected into one line.
* Route statistics are shown.
* Bin information is shown.
* Route insights are shown.
* TypeScript check passes.
* README is clear.
* No backend was added.
* No database was added.
* No real AI API was added.
* No route optimization is falsely claimed.

---

## 17. Assumptions

* The app displays one representative week from the dataset.
* The preprocessing pipeline reads the Excel file before the app is started.
* The app consumes generated JSON files.
* Failed geocoding is acceptable if documented and visible.
* Route order comes from the Excel file.
* Route optimization is outside the current task scope.
* A separate backend is outside the current task scope.

---

## 18. Out of Scope

The following items are intentionally not included in this technical test:

* backend server;
* database;
* authentication;
* dispatcher/admin panel;
* real-time tracking;
* real AI API integration;
* real route optimization;
* production deployment pipeline;
* advanced role-based access control;
* full multi-week UI management beyond the required representative week.

These are excluded to keep the solution focused on the provided technical task.
