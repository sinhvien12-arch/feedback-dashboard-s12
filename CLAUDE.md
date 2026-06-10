# Project: Feedback Dashboard (S12)

## Stack
- Pure HTML5 + Tailwind CSS (CDN)
- Vanilla JavaScript (no framework)
- localStorage (key: `feedbackEntries`) — no backend required

## Domain
- Vietnamese service/location feedback collection
- Locations: District 1, District 3, Thao Dien
- Feedback fields: name (optional), location, rating (1–5), comment, timestamp

## Conventions
- Dates: ISO 8601 stored, `DD/MM/YYYY HH:mm` displayed (Vietnamese format)
- Sentiment: rating ≥ 4 = positive (bg-green-100), rating = 3 = neutral (bg-yellow-100), rating ≤ 2 = negative (bg-red-100)
- localStorage key: `feedbackEntries` — always append, never overwrite the full array
- CSV export: UTF-8 BOM (`﻿`) prefix required for Excel Vietnamese font compatibility

## File Structure
```
index.html          ← redirect to pages/submit.html
pages/
  submit.html       ← public feedback form
  admin.html        ← admin table + filters + export
shared/
  navbar.js         ← injected navbar (2 links only)
  styles.css        ← Tailwind supplements
```

## Commit Discipline
- One commit per feature step
- Format: `feat: <step-name>` or `fix: <description>`

## Skill Reference
This project follows the `.claude/skills/SKILL.md` feedback-dashboard skill pattern.

## Don't
Create components >1000 lines

Hardcode secrete or API keys or json or base64 string anywhere, even in settings.json

# Do
Always update the flow and log the changes as an md file in md-guide and create test cases for that module at the same time
