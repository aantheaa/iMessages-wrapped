# iMessages Wrapped

A personalized year-in-review visualization of your iMessage history, similar to Spotify Wrapped but for text messages.

## Features

- **Vibes** — Charts and stats: message volume over time, top contacts, emoji usage, tapback reactions
- **Messages** — Curated memorable texts: first/last messages, nice memories, messages by reaction type
- **Personality** — AI-generated personality evaluation based on messaging patterns
- **Story Export** — Export any card as a 1080×1920 Instagram Story image

## Prerequisites

This site is designed to run on [Zo Computer](https://zo.computer) and requires:

1. **An iMessage dataset** — A DuckDB database (`data.duckdb`) containing your iMessage history, created using the [Zo Data iMessage template](https://github.com/anthropics/zo-data-templates)
2. **Zo Computer** — The site runs as a Zo Site and uses the Zo API for AI features

## Setup

### 1. Prepare Your iMessage Data

First, you need an iMessage dataset in your Zo workspace. The site looks for a `data.duckdb` file in a directory that contains a `datapackage.json` with `"sourceTemplate": "imessage"`.

**If you already have an iMessage dataset:**
The site will automatically find it. Common locations:
- `/home/workspace/imessages/data.duckdb`
- Any directory with `datapackage.json` containing `sourceTemplate: "imessage"`

**If you need to create one:**
1. Export your iMessage database from your Mac: `~/Library/Messages/chat.db`
2. Create a new dataset directory with the iMessage template
3. Run the ingestion to produce `data.duckdb`

See the [iMessage dataset README](https://github.com/anthropics/zo-data-templates/tree/main/imessage) for detailed instructions.

### 2. Generate the JSON Data Files

The visualization reads pre-processed JSON files from `src/lib/data/`. Generate them by running:

```bash
./scripts/generate-data.sh
```

This script:
- Connects to your `data.duckdb`
- Runs SQL queries to extract statistics
- Outputs JSON files for each visualization card

**Required JSON files:**
| File | Description |
|------|-------------|
| `monthly-volume.json` | Message counts by month |
| `top-contacts.json` | Top contacts with sent/received counts |
| `hourly-heatmap.json` | Message frequency by hour and day |
| `tapback-trends.json` | Reaction usage statistics |
| `top-emojis.json` | Most used emojis |
| `contact-emojis.json` | Emojis used with specific contacts |
| `top-words.json` | Most frequently used words |
| `milestones.json` | First/last messages and memorable moments |
| `reaction-memories.json` | Messages that received specific reactions |
| `meaningful-texts.json` | Curated meaningful messages by person |
| `plans.json` | Trips, gatherings, and connections mentioned |
| `stats.json` | General statistics |
| `connections.json` | Connection vibe descriptions per person |
| `personality-evaluation.json` | AI-generated personality analysis |

### 3. Run the Site

The site runs as a Zo Site. It will be automatically started when you open the project in Zo Computer.

## Customization

### Modifying Queries

Edit `scripts/generate-data.sh` to change what data is extracted. Common customizations:
- Change the date filter (default: `sent_at >= '2025-01-01'`)
- Adjust the number of top contacts
- Add/remove specific statistics

### Adding New Cards

1. Add a new query to `scripts/generate-data.sh`
2. Create a new JSON file in `src/lib/data/`
3. Add a card component in `src/pages/Wrapped2025.tsx`
4. Optionally add a story card version in `src/components/story-cards.tsx`

## Tech Stack

- **Runtime**: Bun
- **Framework**: Hono + React + Vite
- **Styling**: Tailwind CSS 4 + shadcn/ui
- **Charts**: Recharts
- **Story Export**: html2canvas-pro

## File Structure

```
.
├── scripts/
│   ├── generate-data.sh     # Main data generation script
│   └── contact_emojis.py    # Helper for emoji extraction
├── src/
│   ├── lib/data/            # Generated JSON files (gitignored)
│   ├── pages/
│   │   └── Wrapped2025.tsx  # Main visualization page
│   └── components/
│       ├── story-export.tsx # Instagram Story export
│       └── story-cards.tsx  # Story-optimized card renderers
├── server.ts                # Hono server
└── zosite.json              # Zo Site configuration
```

## Privacy

The `src/lib/data/` directory is gitignored — your personal message data stays local. Only the visualization code is committed to the repository.

