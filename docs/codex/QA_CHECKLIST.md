# QA_CHECKLIST.md

# QA Checklist for Waste Collection Routes Test

Use this checklist when asked to test, verify, or review a completed flow.

Do not run expensive operations unless explicitly requested.

---

## 1. Low-Cost Checks First

Run or verify:

```bash
npm run typecheck
```

Then check whether the changed files match the project architecture.

Do not run full geocoding by default.

Use sample data or cached data when possible.

---

## 2. Excel Parsing QA

Verify that:

* the Excel file is read from `input/`;
* header rows are skipped correctly;
* route headers like `ML 11840 no 01.01.26` are detected;
* route ID is forward-filled into following stop rows;
* stops are not mixed between routes;
* date values are normalized;
* route order is parsed as number;
* rows without meaningful data are skipped safely;
* invalid rows are collected as warnings, not fatal errors.

Expected result:

* parsed stops contain `routeId`;
* parsed stops contain `routeNumber`;
* parsed stops contain `routeDate`;
* parsed stops contain `routeOrder`;
* parsed stops contain `originalAddress`.

---

## 3. Service Day Parsing QA

Verify examples:

* `xx3xxx7` → Wednesday + Sunday
* `xxx4xxx` → Thursday
* `1xxxxxx` → Monday
* `x2xxxxx` → Tuesday
* `xxxx5xx` → Friday

Verify edge cases:

* empty value does not crash;
* unknown value is preserved;
* invalid length does not crash;
* output is safe for UI display.

---

## 4. Frequency Parsing QA

Verify examples:

* `1xn` → once a week
* `1x2n` → once every 2 weeks
* `1x4n` → once every 4 weeks
* `1x8n` → once every 8 weeks
* `1x12n` → once every 12 weeks

Verify edge cases:

* empty value does not crash;
* unknown value is preserved;
* custom value is displayed as custom/unknown.

---

## 5. Address Normalization QA

Verify that every stop preserves:

* `originalAddress`
* `cleanedAddress`

Check examples:

* `Dobeles šoseja 47A/MAXIMA/` → `Dobeles šoseja 47A`
* `Īves iela 4 (kartons)` → `Īves iela 4`
* `Kungu iela 25 (stikls)` → `Kungu iela 25`
* `Raiņa iela 28/SIA Deivs` → `Raiņa iela 28`
* `Raiņa iela 7;` → `Raiņa iela 7`

Verify that Latvian characters are preserved.

---

## 6. Geocoding QA

Verify that:

* geocoding is performed for unique cleaned addresses;
* repeated addresses do not trigger duplicate requests;
* cache is checked before provider request;
* successful results are saved to cache;
* failed results are saved to failed geocoding output;
* failed geocoding does not stop data preparation;
* provider logic is not hardcoded into business logic;
* API keys are not committed.

Do not run full geocoding unless explicitly requested.

Use sample/cached geocoding for QA when possible.

---

## 7. Generated JSON QA

Verify generated files:

* `src/data/routes-week.json`
* `src/data/route-stats.json`
* `src/data/geocoded-addresses.json`
* `src/data/failed-geocoding.json`
* `src/data/data-summary.json`

Check that JSON shape matches app types.

Check that at least one week is available.

Check that generated data does not contain secrets.

---

## 8. Map Flow QA

Verify that:

* the map screen renders;
* markers are displayed for geocoded stops;
* stops without coordinates are skipped gracefully;
* selecting a marker opens bin details;
* route polyline is rendered;
* route polyline follows route order;
* different routes are not connected into one line;
* filters update visible markers and route statistics.

---

## 9. Route Statistics QA

Verify that selected route statistics show:

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
* insights.

---

## 10. Bin Details QA

Verify marker details show:

* original address;
* cleaned address;
* bin code;
* service day pattern;
* parsed service days;
* frequency code;
* parsed frequency;
* volume;
* container count;
* route order;
* route ID;
* date;
* geocoding status.

---

## 11. Route Insights QA

Verify insights detect:

* missing coordinates;
* duplicate addresses;
* long-distance gaps;
* route order gaps;
* duplicate route orders.

Verify that insights are deterministic and do not call a real AI model.

---

## 12. Regression Checklist

Before final delivery, confirm:

* `npm run typecheck` passes;
* app starts successfully;
* generated data exists;
* at least one week is visible on map;
* README is updated;
* no backend was added;
* no real AI API was added;
* no secrets were committed;
* core task requirements are covered.
