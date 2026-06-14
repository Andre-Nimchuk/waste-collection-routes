# Waste Routes Test

Expo React Native technical test for waste collection route visualization.

## Quick Start

```bash
yarn install
yarn parse:excel
yarn geocode
yarn generate:week
yarn ios
```

Alternative app start:

```bash
yarn start
```

Then press `i` to open the app in the iOS Simulator.

## Scripts

```bash
yarn parse:excel     # read Excel and generate src/data/routes.json
yarn geocode         # geocode unique cleaned addresses with cache
yarn prepare:data    # planned full local data pipeline
yarn generate:week   # planned weekly dataset generation
yarn lint            # Biome check
yarn lint:fix        # Biome auto-fix
yarn typecheck       # TypeScript check
yarn ios             # start on iOS Simulator
```

## Goal

The app should process the provided Excel file, geocode addresses, display at least one week of waste collection locations on a map, connect stops by the original route order, and show route statistics and bin information.

## Architecture

Data flow:

```txt
Excel file -> local Node.js scripts -> generated JSON -> Expo app -> map/statistics UI
```

Main rules:

- Excel is parsed only in `scripts/`.
- Heavy geocoding will run only in local scripts, not in the mobile UI.
- React Native UI will consume generated JSON from `src/data/`.
- Route visualization is grouped by `routeId + date` and sorted by `routeOrder`.
- The route order from Excel is preserved. No route optimization is performed.

## Current Status

Done:

- Excel reader.
- Route header detection, for example `ML 11840 no 01.01.26`.
- Forward-fill of the current route into following stop rows.
- Route date normalization to `yyyy-mm-dd`.
- Route order parsing.
- Service day parsing.
- Frequency parsing.
- Address normalization.
- Geocoding with cache.
- Representative week data generation.
- Route statistics generation.
- Raw row preservation.
- Generated `src/data/routes.json`.

Parser result:

```txt
totalRows: 79998
parsedStops: 79552
routeCount: 430
routeHeadersDetected: 437
invalidRows: 0
```

`routeHeadersDetected` is higher than `routeCount` because some route headers in the Excel file are empty/zero routes without valid stops.

## Generated Data

Generated JSON files are ignored by git:

```gitignore
src/data/*.json
cache/*.json
```

This keeps large generated artifacts out of the repository. The parser can regenerate them locally.

Safe geocoding sample:

```bash
GEOCODING_LIMIT=25 yarn geocode
```

Use `GEOCODING_LIMIT=0 yarn geocode` to validate the geocoding pipeline without sending provider requests.

## Parsed Stop Shape

`src/data/routes.json` contains stops with:

```txt
id
routeId
routeNumber
routeDate
date
timeSpentInObject
binCode
serviceDayPattern
frequencyCode
routeOrder
originalAddress
cleanedAddress
serviceDays
frequency
binVolume
containerCount
geocodingStatus
geocodingProvider
geocodingError
raw
```

## Generated Week Data

`yarn generate:week` creates:

```txt
src/data/routes-week.json
src/data/route-stats.json
src/data/data-summary.json
```

The week selection is deterministic. It prefers a 7-day window with geocoded stops when available, otherwise it falls back to the earliest available week.

## Planned Next Steps

1. Deterministic route insights.
2. Map UI with markers and route polylines.
3. Route details and bin information UI.

## QA

Current parser milestone was checked with:

```bash
yarn lint
yarn typecheck
yarn parse:excel
GEOCODING_LIMIT=0 yarn geocode
yarn generate:week
```
