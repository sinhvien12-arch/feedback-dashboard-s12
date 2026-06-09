# SPEC.md — Feedback Dashboard

## Features
1. **Public submit form** — name (optional), location dropdown, star rating (1–5), comment (required)
2. **Admin table** — sortable by newest-first, all feedback displayed
3. **Filters** — by location, minimum rating, date range (from / to)
4. **Sentiment color coding** — row background color based on rating
5. **CSV export** — filtered results as downloadable `.csv` with UTF-8 BOM

## Data Model (localStorage)
```json
feedbackEntries: [
  {
    "date":     "2024-06-09T10:30:00.000Z",  // ISO 8601
    "name":     "Nguyen Van A",               // string, default "Anonymous"
    "location": "District 1",                 // "District 1" | "District 3" | "Thao Dien"
    "rating":   4,                            // integer 1–5
    "comment":  "Great service!"             // string, required
  }
]
```

## Validation Rules
- `location`: required (must select from dropdown)
- `rating`: required (must click a star)
- `comment`: required, non-empty after trim
- `name`: optional, defaults to "Anonymous" if blank

## Sentiment Mapping
| Rating | Label    | Row class       |
|--------|----------|-----------------|
| 1–2    | Negative | `bg-red-100`    |
| 3      | Neutral  | `bg-yellow-100` |
| 4–5    | Positive | `bg-green-100`  |

## CSV Export Requirements
- UTF-8 BOM prefix (`﻿`) for Excel Vietnamese compatibility
- Comment field wrapped in double quotes; inner quotes escaped as `""`
- Filename: `feedback-export-YYYY-MM-DD.csv`
- Exports only the currently filtered view
- Alert "Nothing to export" if no rows visible

## Non-goals (v1)
- Authentication (admin is open)
- Charts / analytics
- Backend / database
- Email notifications
