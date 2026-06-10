# Admin Dashboard Design — 2026-06-10

## Overview

Add a visual analytics dashboard to `pages/admin.html`, positioned between the page header and the filters panel. The dashboard always reflects the currently active filters — charts and KPI cards re-draw on every filter change and every Firestore snapshot, staying in sync with the table below.

## Layout

```
[ Admin View ]                          [ Export CSV ]

┌─────────────────────────────────────────────────────┐
│  DASHBOARD                                          │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────┐ │
│  │  Total   │ │  Avg ★   │ │Positive %│ │Neg %   │ │
│  │   128    │ │  3.8 ★   │ │  62%     │ │  18%   │ │
│  └──────────┘ └──────────┘ └──────────┘ └────────┘ │
│                                                     │
│  ┌──────────────────┐ ┌───────────┐ ┌───────────┐  │
│  │ Rating Dist.     │ │ By Loc.   │ │ Sentiment │  │
│  │ (bar chart)      │ │ (horiz.   │ │ (doughnut)│  │
│  │                  │ │  bar)     │ │           │  │
│  └──────────────────┘ └───────────┘ └───────────┘  │
└─────────────────────────────────────────────────────┘

[ Filters: Location | Min Rating | From Date | To Date ]

[ Showing N of M feedbacks ]

[ Table ]
```

## KPI Cards

Four cards in a single responsive row (`grid-cols-2 sm:grid-cols-4`):

| Card | Computation | Background |
|---|---|---|
| Total Feedbacks | `filtered.length` | white |
| Avg Rating | `(sum of ratings / count).toFixed(1) + " ★"` | white |
| Positive | count where `rating >= 4`, show `N (XX%)` | `bg-green-50`, green text |
| Negative | count where `rating <= 2`, show `N (XX%)` | `bg-red-50`, red text |

Edge case: if `filtered.length === 0`, show `–` for avg, `0 (0%)` for positive/negative.

## Charts

### 1. Rating Distribution (vertical bar)
- X-axis: 1★, 2★, 3★, 4★, 5★
- Y-axis: count of filtered entries per rating
- Bar colors: `#ef4444` (1), `#f97316` (2), `#eab308` (3), `#84cc16` (4), `#22c55e` (5)

### 2. By Location (horizontal bar)
- Y-axis: District 1, District 3, Thao Dien
- X-axis: count of filtered entries per location
- Color: indigo `#6366f1`

### 3. Sentiment (doughnut)
- 3 slices: Positive (≥4), Neutral (=3), Negative (≤2)
- Colors: `#22c55e`, `#eab308`, `#ef4444`
- Center label: not needed (legend below chart)
- If all zero: show empty state text, hide chart

## Chart Library

**Chart.js 4.x** via CDN:
```html
<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.4/dist/chart.umd.min.js"></script>
```

Loaded in `<head>` alongside the Firebase compat scripts.

## Data Flow

```
Firestore onSnapshot → allEntries updated → render() called
Filter change         →                     render() called

render():
  1. applyFilters(allEntries) → filtered[]
  2. updateKPICards(filtered)
  3. updateCharts(filtered)
  4. renderTable(filtered)
```

Charts are created once on DOMContentLoaded and stored in variables (`ratingChart`, `locationChart`, `sentimentChart`). On each `render()`, data arrays are replaced and `chart.update()` is called — no destroy/recreate.

## File Changes

- `pages/admin.html` — add Chart.js CDN, dashboard HTML section, `updateKPICards()` + `updateCharts()` functions, call both from `render()`
- No other files change

## Non-goals

- No "last N days" time-series chart (data volume too small for v1)
- No per-location rating breakdown (adds complexity, low value)
- No print/export of charts
