# iMessage Wrapped Guide

This prompt describes how to create a "Year Wrapped" experience for iMessage data. It covers all the visualization cards, data queries, layout patterns, and styling conventions used in this project.

---

## Overview

A "Wrapped" experience is a scrolling, card-based storytelling format that transforms raw messaging data into meaningful insights and memories. Think Spotify Wrapped, but for your text conversations.

### Core Principles

1. **Narrative Flow**: Cards should tell a story, not just show stats
2. **Emotional Resonance**: Surface meaningful moments, not just numbers
3. **Visual Hierarchy**: Important insights get visual emphasis
4. **Responsive Design**: Works on all screen sizes
5. **Keyboard Navigation**: Arrow keys to slide through sections

### Card Order (Recommended Flow)

The cards flow from high-level overview → relationship insights → detailed message content:

1. **Hero** — Title + headline stats
2. **Bookends** — First & last message of the year
3. **Inner Circle** — Top contacts chart
4. **Signature Words** — Most-used words
5. **Emoji Vibe** — Top emojis
6. **Tapback Favorites** — Go-to reactions
7. **Emoji Languages** — Per-person emoji dialects
8. **Connection Vibes** — Cute relationship descriptions
9. **Digital Heartbeat** — Monthly volume chart
10. **Five Nice Memories** — Curated meaningful moments
11. **Plans You Made** — Trips, gatherings, connections
12-16. **Meaningful Texts** — One card per top person
17. **Messages You Loved** — ❤️ reaction memories
18. **Messages That Made You Laugh** — 😂 reaction memories
19. **Messages That Made You Go WHOA** — ‼️ reaction memories
20. **Messages You Disliked** — 👎 reaction memories
21. **Footer**

---

## Data Pipeline

### Source Database

iMessage data lives in a SQLite database (`chat.db`) with key tables:
- `message` - All messages (text, timestamps, is_from_me flag)
- `handle` - Contact identifiers (phone numbers, emails)
- `chat` - Conversation metadata
- `attachment` - File attachments

### Important: Text Extraction

⚠️ Many messages have `text = NULL` but contain content in `attributedBody` (a binary plist). The ingest script must extract this:

```python
def extract_text_from_attributed_body(blob: bytes) -> str | None:
    """Extract text from NSKeyedArchiver binary plist."""
    try:
        text_bytes = blob.split(b'NSString')[1].split(b'\x00')[0]
        # Find printable text after length prefix
        for i, b in enumerate(text_bytes):
            if 32 <= b <= 126 or b > 127:
                return text_bytes[i:].decode('utf-8', errors='ignore')
    except:
        return None
```

### Data Export Pattern

1. **Query with DuckDB**: Iterate on queries in the terminal
2. **Export to JSON**: Save results to `src/lib/data/`
3. **Import in React**: Static imports bundle data at build time

```bash
# Export pattern
duckdb /path/to/data.duckdb -json -c "SELECT ..." > src/lib/data/query-name.json
```

```typescript
// Import pattern
import myData from "@/lib/data/query-name.json";
```

### Filtering Best Practices

- **Year filter**: `sent_at >= '2025-01-01'`
- **Exclude reactions**: `(associated_message_type IS NULL OR associated_message_type = 0)`
- **DMs only**: `room_name IS NULL`
- **Has content**: `text IS NOT NULL AND LENGTH(text) > 0`

### Data Files

All data lives in `src/lib/data/`:
- `stats.json` — Total messages, unique conversations count
- `monthly-volume.json` — Messages per month
- `top-contacts.json` — Top 6 contacts with sent/received counts
- `top-words.json` — Top 10 signature words
- `top-emojis.json` — Top 10 emojis
- `tapback-trends.json` — Reaction counts by type
- `contact-emojis.json` — Per-contact emoji usage
- `connections.json` — Relationship descriptions for top people
- `milestones.json` — First/last message + curated memories
- `plans.json` — Trips, gatherings, connections
- `meaningful-texts.json` — 5 messages from each top person
- `reaction-memories.json` — Messages by reaction type (love, laugh, emphasis, dislike)

---

## Card Catalog

### 1. Hero Section

**Purpose**: Set the tone and show headline numbers.

**Data** (`stats.json`):
```sql
SELECT COUNT(*) as total_messages FROM messages WHERE sent_at >= '2025-01-01';
SELECT COUNT(DISTINCT handle_id) as conversations FROM messages WHERE sent_at >= '2025-01-01';
```

**Layout**:
- Centered, full-width header
- Large gradient title (pink → purple → indigo)
- Two stat cards side by side (Messages, Conversations)

**Styling**:
```jsx
<h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent">
  {Name}'s 2025 iMessage Wrapped
</h1>
```

**⚠️ Important**: Use `stats.uniqueConversations` from stats.json, NOT `topContacts.length` (which is just 6).

---

### 2. Bookends Card (First & Last Message)

**Purpose**: Show how the year started and where it currently stands.

**Data** (`milestones.json`):
```sql
-- First message of year
SELECT text, sent_at FROM messages 
WHERE is_from_me = TRUE AND text IS NOT NULL AND sent_at >= '2025-01-01'
ORDER BY sent_at ASC LIMIT 1;

-- Most recent message
SELECT text, sent_at FROM messages 
WHERE is_from_me = TRUE AND text IS NOT NULL AND sent_at >= '2025-01-01'
ORDER BY sent_at DESC LIMIT 1;
```

**Layout**:
- Two sections with colored left borders (green for first, blue for last)
- Timestamp label above each message
- Full message text (whitespace preserved)

**Styling**:
```jsx
<div className="border-l-4 border-green-500 pl-4">
  <p className="text-xs text-muted-foreground">🌅 First Message — {date}</p>
  <p className="text-sm whitespace-pre-wrap">{text}</p>
</div>
```

---

### 3. Inner Circle (Top Contacts)

**Purpose**: Show the people you messaged most with sent/received breakdown.

**Data** (`top-contacts.json`):
```sql
SELECT 
  COALESCE(c.name, h.identifier) as contact,
  SUM(CASE WHEN m.is_from_me THEN 1 ELSE 0 END) as sent,
  SUM(CASE WHEN NOT m.is_from_me THEN 1 ELSE 0 END) as received,
  COUNT(*) as total
FROM messages m
JOIN handles h ON m.handle_id = h.handle_id
LEFT JOIN contacts c ON h.identifier = c.identifier
WHERE m.sent_at >= '2025-01-01'
  AND (m.associated_message_type IS NULL OR m.associated_message_type = 0)
  AND m.room_name IS NULL  -- DMs only
GROUP BY 1, h.identifier
ORDER BY total DESC
LIMIT 6;
```

**Important**: Combine duplicate contacts (same person, different identifiers):
```python
NAME_MAP = {
    "+12147265046": "Rob (Bubba)",
    "bubba 🦦": "Rob (Bubba)",
    "rob": "Rob (Bubba)",
}

# Also specify MUST_INCLUDE for people who should always be in the inner circle
MUST_INCLUDE = {"+12038858333"}  # e.g., Mom
```

**Chart Config**:
```typescript
const contactConfig = {
  sent: { label: "Sent", color: "var(--chart-2)" },
  received: { label: "Received", color: "var(--chart-3)" },
} satisfies ChartConfig;
```

**Layout**:
- Horizontal stacked bar chart
- 6 contacts
- Height: 350px
- Truncate long names (>12 chars)

---

### 4. Signature Words

**Purpose**: Show the user's most-used words (excluding common stopwords).

**Data** (`top-words.json`): Process all sent messages through a word counter:
```python
STOPWORDS = {'the', 'a', 'an', 'is', 'it', 'to', 'and', 'of', 'in', 'for', 
             'you', 'that', 'have', 'this', 'with', 'but', 'not', 'are', 
             'was', 'be', 'can', 'will', 'just', 'like', 'get', 'your', 
             'they', 'what', 'all', 'been', 'would', 'there', 'their', 
             'from', 'one', 'had', 'her', 'him', 'she', 'his', 'has', 
             'were', 'been', 'some', 'when', 'more', 'also', 'very', 
             'about', 'into', 'them', 'then', 'than', 'only', 'come', 
             'its', 'over', 'such', 'because', 'going', 'know', 'think',
             'yeah', 'okay', 'well', 'really', 'right', 'want', 'here',
             'now', 'out', 'up', 'how', 'who', 'did', 'make', 'way',
             'could', 'said', 'each', 'which', 'do', 'does', 'being',
             'use', 'two', 'first', 'last', 'good', 'great', 'new', 
             'time', 'day', 'back', 'need', 'even', 'much', 'still',
             'things', 'something', 'thing'}

def count_words(texts):
    counts = Counter()
    for text in texts:
        words = re.findall(r'\b[a-zA-Z]{4,}\b', text.lower())
        counts.update(w for w in words if w not in STOPWORDS)
    return [{"word": w, "count": c} for w, c in counts.most_common(10)]
```

**Layout**:
- Horizontal bar chart
- 10 words
- Height: 300px

---

### 5. Emoji Vibe (Top Emojis)

**Purpose**: Show the user's most-used emojis.

**Data** (`top-emojis.json`):
```python
EMOJI_PATTERN = re.compile(
    "["
    "\U0001F600-\U0001F64F"  # emoticons
    "\U0001F300-\U0001F5FF"  # symbols & pictographs
    "\U0001F680-\U0001F6FF"  # transport & map
    "\U0001F1E0-\U0001F1FF"  # flags
    "\U00002702-\U000027B0"  # dingbats
    "\U0001F900-\U0001F9FF"  # supplemental symbols
    "\U00002600-\U000026FF"  # misc symbols
    "\U00002700-\U000027BF"  # dingbats
    "\U0001FA00-\U0001FA6F"  # chess symbols
    "\U0001FA70-\U0001FAFF"  # symbols extended
    "\U00002764\U0000FE0F?"  # heart variations
    "]+", flags=re.UNICODE
)

# Filter out non-emoji unicode like \ufffc (object replacement)
SKIP_CHARS = {'\ufffc', '\ufffe', '\u2028', '\u2029', '\u200d', '\ufe0f'}
```

**Layout**:
- Flex wrap grid of emoji cards
- Large emoji (text-4xl)
- Count below
- 10 emojis

```jsx
<div className="flex flex-wrap gap-4 justify-center">
  {topEmojis.map((e) => (
    <div className="flex flex-col items-center p-3 rounded-lg bg-muted/50 min-w-[70px]">
      <span className="text-4xl">{e.emoji}</span>
      <span className="text-sm font-medium mt-1">{e.count}</span>
    </div>
  ))}
</div>
```

---

### 6. Tapback Favorites

**Purpose**: Show the user's most-used reactions.

**Data** (`tapback-trends.json`):
```sql
SELECT 
  CASE associated_message_type
    WHEN 2000 THEN 'Love'
    WHEN 2001 THEN 'Like'
    WHEN 2002 THEN 'Dislike'
    WHEN 2003 THEN 'Laugh'
    WHEN 2004 THEN 'Emphasis'
    WHEN 2005 THEN 'Question'
  END as reaction,
  COUNT(*) as count
FROM messages 
WHERE is_from_me = TRUE 
  AND associated_message_type BETWEEN 2000 AND 2005
  AND sent_at >= '2025-01-01'
GROUP BY 1 ORDER BY 2 DESC;
```

**Emoji Map**:
```typescript
const tapbackEmojis: Record<string, string> = {
  "Love": "❤️",
  "Like": "👍",
  "Dislike": "👎",
  "Laugh": "😂",
  "Emphasis": "‼️",
  "Question": "❓",
};
```

**Layout**: Similar to emoji vibe - flex grid with emoji, label, count.

---

### 7. Emoji Languages (Per-Contact)

**Purpose**: Show the unique emoji dialects shared with each person.

**Data** (`contact-emojis.json`): For each top contact, extract emojis from sent messages:
```sql
SELECT m.text
FROM messages m
JOIN handles h ON m.handle_id = h.handle_id
WHERE h.identifier = '{identifier}'
  AND m.is_from_me = TRUE
  AND m.text IS NOT NULL
  AND m.sent_at >= '2025-01-01';
```

Then process with emoji extraction to get top 5 emojis per person.

**Layout**:
- Card per person
- Name as header
- Row of emoji with counts

```jsx
{contactsWithEmojis.map((contact) => (
  <div className="p-4 rounded-lg bg-muted/50">
    <p className="font-bold text-lg mb-3">{contact.name}</p>
    <div className="flex gap-3 flex-wrap">
      {contact.emojis.map((e) => (
        <div className="flex flex-col items-center">
          <span className="text-3xl">{e.emoji}</span>
          <span className="text-xs text-muted-foreground">{e.count}×</span>
        </div>
      ))}
    </div>
  </div>
))}
```

---

### 8. Connection Vibes (NEW)

**Purpose**: Show cute, personalized descriptions of your relationship with each top person.

**Data** (`connections.json`): Manually curated based on message analysis. For each person, review their messages to understand:
- The relationship dynamic
- Common topics and themes
- Emotional tone
- Shared activities or plans

**Data Structure**:
```json
{
  "Rob (Bubba)": {
    "emoji": "🦦",
    "description": "Your adventure partner and late-night philosopher. From spontaneous trip planning to deep 2AM conversations about life, Rob is the one who matches your chaotic energy with equal enthusiasm.",
    "vibe": "Adventure buddy & soul brother"
  },
  "Jackie": {
    "emoji": "✨",
    "description": "The friend who always lifts you up. Jackie's messages are full of support, shared excitement about creative projects, and that magical ability to make ordinary moments feel special.",
    "vibe": "Your hype woman & creative co-conspirator"
  }
}
```

**Layout**:
- Gradient background cards
- Large emoji on left
- Name, description, and "vibe" tag
- Filter out self ("Anthea (Me)")

```jsx
{connectionEntries.filter(([name]) => name !== "Anthea (Me)").map(([name, conn]) => (
  <div className="p-4 rounded-lg bg-gradient-to-r from-muted/50 to-muted/20 border border-muted">
    <div className="flex items-start gap-3">
      <span className="text-3xl">{conn.emoji}</span>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-lg">{name}</p>
        <p className="text-sm text-muted-foreground mt-1">{conn.description}</p>
        <p className="text-xs mt-2 inline-block px-2 py-1 rounded-full bg-primary/10 text-primary">{conn.vibe}</p>
      </div>
    </div>
  </div>
))}
```

---

### 9. Digital Heartbeat (Monthly Volume)

**Purpose**: Show messaging activity over the year as an area chart.

**Data** (`monthly-volume.json`):
```sql
SELECT 
  DATE_TRUNC('month', sent_at)::DATE::VARCHAR as month,
  COUNT(*) as count
FROM messages 
WHERE sent_at >= '2025-01-01'
GROUP BY 1 ORDER BY 1;
```

**Chart Config**:
```typescript
const monthlyConfig = {
  count: { label: "Messages", color: "var(--chart-1)" },
} satisfies ChartConfig;
```

**Layout**:
- Area chart with gradient fill
- X-axis: Month abbreviations (Jan, Feb, etc.)
- Y-axis: Message count
- Height: 300px

**Key Recharts Components**:
```jsx
<ChartContainer config={monthlyConfig} className="h-[300px] w-full">
  <AreaChart data={monthlyVolume}>
    <CartesianGrid strokeDasharray="3 3" vertical={false} />
    <XAxis dataKey="month" tickFormatter={formatMonth} />
    <YAxis />
    <ChartTooltip content={<ChartTooltipContent />} />
    <Area type="monotone" dataKey="count" fill="var(--chart-1)" fillOpacity={0.3} stroke="var(--chart-1)" />
  </AreaChart>
</ChartContainer>
```

---

### 10. Five Nice Memories

**Purpose**: Highlight 5 meaningful moments from the year.

**Data** (`milestones.json`): Manually curated from message samples. Query for candidates:
```sql
SELECT text, sent_at FROM messages 
WHERE is_from_me = TRUE AND text IS NOT NULL 
  AND LENGTH(text) > 80 AND sent_at >= '2025-01-01'
ORDER BY RANDOM() LIMIT 30;
```

Look for messages that show:
- Gratitude or appreciation
- Planning meaningful events
- Emotional vulnerability
- Milestone moments
- Acts of care

**Layout**:
- List of memory cards with emoji, title, snippet, date
- Subtle background highlighting

**Data Structure**:
```json
{
  "memories": [
    {
      "title": "Memory Title",
      "snippet": "Brief description of why this mattered",
      "date": "Month Day",
      "vibe": "✨"
    }
  ]
}
```

---

### 11. Plans Card

**Purpose**: Show the adventures, gatherings, and connections coordinated via text.

**Data** (`plans.json`): Search for planning-related messages:
```sql
SELECT COALESCE(c.name, h.identifier) as contact, m.text, m.sent_at
FROM messages m
JOIN handles h ON m.handle_id = h.handle_id
LEFT JOIN contacts c ON h.identifier = c.identifier
WHERE (
  LOWER(m.text) LIKE '%let''s%' OR
  LOWER(m.text) LIKE '%meet%' OR
  LOWER(m.text) LIKE '%visit%' OR
  LOWER(m.text) LIKE '%trip%' OR
  LOWER(m.text) LIKE '%dinner%' OR
  LOWER(m.text) LIKE '%coffee%' OR
  LOWER(m.text) LIKE '%hang%'
)
AND m.sent_at >= '2025-01-01'
ORDER BY RANDOM() LIMIT 50;
```

**Categories**:
- **Trips & Adventures**: Travel, getaways (✈️ blue theme)
- **Gatherings**: Parties, events, group hangs (🎉 green theme)
- **Connections**: Coffee dates, catchups (☕ purple theme)

**Layout**:
- Three sections with headers
- Grid of plan cards (2 columns on larger screens)
- Each card shows: emoji, what, who, when

**Data Structure**:
```json
{
  "trips": [
    { "what": "Bali Retreat", "who": ["Jackie", "Daniel"], "when": "March", "vibe": "🌴" }
  ],
  "gatherings": [...],
  "connections": [...]
}
```

---

### 12-16. Meaningful Texts from Top People

**Purpose**: Show the most heartfelt messages received from each important person.

**Data** (`meaningful-texts.json`): Query for each top contact:
```sql
SELECT m.text, m.sent_at
FROM messages m
JOIN handles h ON m.handle_id = h.handle_id
WHERE h.identifier = '{phone_number}'
  AND m.is_from_me = FALSE
  AND m.text IS NOT NULL
  AND LENGTH(m.text) > 50
  AND m.sent_at >= '2025-01-01'
  AND (m.associated_message_type IS NULL OR m.associated_message_type = 0)
ORDER BY RANDOM() LIMIT 15;
```

Manually select 5 messages per person that are:
- Emotionally meaningful
- Show the relationship dynamic
- Represent different themes (support, humor, planning, etc.)

**Layout**:
- One card per person (dynamically generated)
- Purple left border on each message
- Quote styling with date

**Data Structure**:
```json
{
  "PersonName": [
    { "text": "Message content", "date": "Month Day" }
  ]
}
```

---

### 17-20. Reaction Memory Cards

**Purpose**: Show messages that triggered specific tapback reactions.

**Reaction Types** (in iMessage):
- `2000` = Love (❤️)
- `2001` = Like (👍)
- `2002` = Dislike (👎)
- `2003` = Laugh (😂)
- `2004` = Emphasis (‼️)
- `2005` = Question (❓)

**Data** (`reaction-memories.json`): Find messages you reacted to (from others):
```sql
WITH reaction_messages AS (
  SELECT 
    m2.text,
    m.associated_message_type as reaction_type,
    COALESCE(c.name, h.identifier) as from_contact
  FROM messages m
  JOIN messages m2 ON (
    REPLACE(m.associated_message_guid, 'p:0/', '') = m2.message_guid
    OR m.associated_message_guid = m2.message_guid
  )
  JOIN handles h ON m2.handle_id = h.handle_id
  LEFT JOIN contacts c ON h.identifier = c.identifier
  WHERE m.is_from_me = TRUE
    AND m.associated_message_type = {reaction_code}
    AND m.sent_at >= '2025-01-01'
    AND m2.text IS NOT NULL
    AND LENGTH(m2.text) > 20
    AND m2.is_from_me = FALSE
)
SELECT * FROM reaction_messages ORDER BY RANDOM() LIMIT 10;
```

**Create separate cards for**:
- ❤️ Messages You Loved (red theme)
- 😂 Messages That Made You Laugh (yellow theme)
- ‼️ Messages That Made You Go WHOA (orange theme)
- 👎 Messages You Disliked (gray theme)

**Data Structure**:
```json
{
  "love": [
    { "text": "Message", "from": "Person", "context": "Brief context" }
  ],
  "laugh": [...],
  "emphasis": [...],
  "dislike": [...]
}
```

**Layout**:
- Colored border matching reaction theme
- Quote text with "from" attribution
- Context description

---

## Styling Guide

### Colors

Use CSS custom properties from the theme:
- `var(--chart-1)` through `var(--chart-5)` for chart colors
- `var(--muted)` and `var(--muted-foreground)` for subtle backgrounds/text
- **Never wrap in `hsl()` - use directly**

### Card Structure

```jsx
<Card className="scroll-mt-8">
  <CardHeader>
    <CardTitle>📊 Card Title</CardTitle>
    <CardDescription>Subtitle explaining the data</CardDescription>
  </CardHeader>
  <CardContent>
    {/* Content */}
  </CardContent>
</Card>
```

### Chart Container

Always wrap charts in `ChartContainer` with explicit height:
```jsx
<ChartContainer config={chartConfig} className="h-[300px] w-full">
  <SomeChart>...</SomeChart>
</ChartContainer>
```

**⚠️ Important**: Never use `ResponsiveContainer` directly - `ChartContainer` handles responsive sizing. Using both causes overflow issues.

### Responsive Layout

- Container: `max-w-3xl mx-auto`
- Padding: `p-4 sm:p-6 lg:p-8`
- Gap between cards: `gap-8`
- Grid for plan cards: `grid grid-cols-1 sm:grid-cols-2 gap-3`

### Themed Borders for Reaction Cards

```jsx
// Love - Red
className="border-red-500/30"
className="bg-red-500/5 border border-red-500/20"

// Laugh - Yellow
className="border-yellow-500/30"
className="bg-yellow-500/5 border border-yellow-500/20"

// Emphasis - Orange
className="border-orange-500/30"
className="bg-orange-500/5 border border-orange-500/20"

// Dislike - Gray
className="border-gray-500/30"
className="bg-gray-500/5 border border-gray-500/20"
```

### Themed Borders for Plans Card

```jsx
// Trips - Blue
className="bg-blue-500/5 border border-blue-500/20"

// Gatherings - Green
className="bg-green-500/5 border border-green-500/20"

// Connections - Purple
className="bg-purple-500/5 border border-purple-500/20"
```

---

## Navigation

### Keyboard Navigation

```typescript
const sectionCount = 21; // Update this when adding/removing cards

useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "ArrowDown" || e.key === "ArrowRight") {
      e.preventDefault();
      setCurrentSection((prev) => {
        const next = Math.min(prev + 1, sectionCount - 1);
        sectionRefs.current[next]?.scrollIntoView({ behavior: "smooth", block: "center" });
        return next;
      });
    } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
      e.preventDefault();
      setCurrentSection((prev) => {
        const next = Math.max(prev - 1, 0);
        sectionRefs.current[next]?.scrollIntoView({ behavior: "smooth", block: "center" });
        return next;
      });
    }
  };
  window.addEventListener("keydown", handleKeyDown);
  return () => window.removeEventListener("keydown", handleKeyDown);
}, []);
```

### Navigation Hint

Fixed position indicator in bottom-right:
```jsx
<div className="fixed bottom-4 right-4 z-50 bg-background/80 backdrop-blur-sm border rounded-lg px-3 py-2 text-xs text-muted-foreground shadow-lg">
  Use ← → or ↑ ↓ to navigate
</div>
```

---

## Data Regeneration Script

Create `scripts/generate-data.sh`:

```bash
#!/bin/bash
set -e

DB_PATH="/home/workspace/imessages/data.duckdb"
DATA_DIR="/home/workspace/imessages-viz/src/lib/data"

mkdir -p "$DATA_DIR"

echo "Exporting Monthly Volume..."
duckdb "$DB_PATH" -json -c "
SELECT DATE_TRUNC('month', sent_at)::DATE::VARCHAR as month, COUNT(*) as count
FROM messages WHERE sent_at >= '2025-01-01'
GROUP BY 1 ORDER BY 1;" > "$DATA_DIR/monthly-volume.json"

echo "Exporting Top Contacts..."
# ... additional queries (use contact_emojis.py for top-contacts.json and contact-emojis.json)

echo "Exporting Per-Contact Emojis..."
python3 scripts/contact_emojis.py > "$DATA_DIR/contact-emojis.json"

echo "Done!"
```

Run after any data changes: `./scripts/generate-data.sh`

---

## Footer

Simple, humble footer:
```jsx
<footer className="text-center py-12 opacity-50 italic scroll-mt-8">
  <p>Made with 🩵 and care by Zoda.</p>
</footer>
```

---

## Instagram Story Export

Every card can be exported as a 1080×1920 Instagram Story image for sharing on social media.

### Components

**File**: `src/components/story-export.tsx`

Two main exports:
- `ExportableCard` — Wrapper component that adds export functionality to any card
- `ShareModal` — Top-level modal for bulk exporting all cards

### ExportableCard Usage

Wrap any card content to make it exportable:

```tsx
import { ExportableCard } from "@/components/story-export";

<ExportableCard
  id="unique-card-id"
  title="Card Title for Filename"
  storyContent={<StoryHero totalMessages={stats.totalMessages} uniqueConversations={stats.uniqueConversations} />}
>
  <Card>
    {/* Normal card content */}
  </Card>
</ExportableCard>
```

**Props**:
- `id` (string) — Unique identifier for the card
- `title` (string) — Human-readable title (used in filename: `wrapped-{title}_story.png`)
- `storyContent` (ReactNode) — Story-optimized version rendered at 1080×1920
- `children` (ReactNode) — The normal card that displays on the page

**Behavior**:
- Renders a 📷 camera button in the top-right corner of the card
- On click, opens a modal with:
  - Loading spinner while rendering (1.5s wait for charts)
  - Preview of the story image at correct aspect ratio
  - "Download for Instagram" button
  - Close button (X)

### ShareModal Usage

Add to the page header for bulk export:

```tsx
import { ShareModal, CardInfo } from "@/components/story-export";

const allCards: CardInfo[] = [
  { id: "hero", title: "Hero", category: "vibes", storyContent: <StoryHero ... /> },
  { id: "bookends", title: "Bookends", category: "messages", storyContent: <StoryBookends ... /> },
  // ... more cards
];

<ShareModal cards={allCards} />
```

**Props**:
- `cards` — Array of `{ id, title, category, storyContent }` objects

**Behavior**:
- Renders a "Share Stories" button (Share2 icon + text)
- On click, opens a full-screen modal with:
  - "Render All X Stories" button to pre-generate all images
  - Progress bar during rendering
  - Once complete: thumbnail grid organized by category
  - Click any thumbnail to download that image

### Story Card Renderers

**File**: `src/components/story-cards.tsx`

Dedicated components that render card content optimized for 1080×1920 vertical format.

#### Available Story Components

```tsx
export function StoryHero({ totalMessages, uniqueConversations }: {...}) { ... }
export function StoryBookends({ firstMessage, lastMessage }: {...}) { ... }
export function StoryTopContacts({ contacts }: {...}) { ... }  // Shows 5 contacts
export function StoryMonthlyVolume({ data }: {...}) { ... }    // Area chart
export function StoryTopEmojis({ emojis }: {...}) { ... }      // Shows 8 emojis
export function StorySignatureWords({ words }: {...}) { ... }  // Shows 8 words with bars
export function StoryTapbacks({ tapbacks }: {...}) { ... }     // Shows 5 reactions
export function StoryContactEmojis({ contacts }: {...}) { ... } // Shows 6 contacts
export function StoryEmojiLanguages({ contacts }: {...}) { ... } // Shows 5 contacts with emoji rows
export function StoryConnections({ connections }: {...}) { ... } // Shows 4 connections
export function StoryMemories({ memories }: {...}) { ... }     // Shows 3 memories
export function StoryReactionMemories({ title, emoji, memories }: {...}) { ... }
export function StoryMeaningfulTexts({ person, texts }: {...}) { ... }
export function StoryPlans({ plans }: {...}) { ... }           // Shows 4 plans
export function StoryPersonality({ evaluation }: {...}) { ... }
```

### StoryFrame Layout System

All story cards use a shared `StoryFrame` wrapper with fixed dimensions:

```tsx
// Fixed dimensions - NEVER change these
const FRAME_WIDTH = 1080;
const FRAME_HEIGHT = 1920;
const CARD_MARGIN = 40;     // margin around the card
const CARD_WIDTH = 1000;    // FRAME_WIDTH - CARD_MARGIN * 2
const CARD_HEIGHT = 1840;   // FRAME_HEIGHT - CARD_MARGIN * 2
const CARD_PADDING = 60;    // padding inside the card
const CONTENT_WIDTH = 880;  // CARD_WIDTH - CARD_PADDING * 2
```

**StoryFrame Structure**:
```tsx
function StoryFrame({ category, children }: StoryFrameProps) {
  return (
    <div style={{
      width: FRAME_WIDTH,   // 1080px
      height: FRAME_HEIGHT, // 1920px
      background: "#0a0a0f",
      // ... centering styles
    }}>
      {/* The card with border */}
      <div style={{
        width: CARD_WIDTH,   // 1000px
        height: CARD_HEIGHT, // 1840px
        background: "linear-gradient(180deg, #0f0f1a 0%, #1a1a2e 30%, #16213e 70%, #0f0f1a 100%)",
        borderRadius: 32,
        border: "1px solid rgba(255,255,255,0.12)",
        padding: CARD_PADDING,
        overflow: "hidden",
      }}>
        {/* Subtle gradient orbs for depth */}
        {/* Header: 2025 / iMessage / Wrapped / category badge */}
        {/* Content area (flex: 1, centered) */}
        {children}
        {/* Footer: @fairy ... zo.computer */}
      </div>
    </div>
  );
}
```

### Design Principles

1. **Fixed Dimensions**: Always 1080×1920 with 40px outer margin + 60px inner padding
2. **Content Width**: All content must fit within 880px (CONTENT_WIDTH)
3. **Overflow Hidden**: Card has `overflow: hidden` to clip any bleeding content
4. **Font Sizes**: Much larger than web:
   - "iMessage": 72px bold white
   - "Wrapped": 92px bold purple (#a855f7)
   - Category badge: 24px
   - Content headers: 26-28px
   - Body text: 18-24px
5. **Text Truncation**: Use the `truncate()` helper for variable-length content
6. **Bar Charts**: Calculate bar widths from `CONTENT_WIDTH` minus label space
7. **Vertical Centering**: Content area uses `justifyContent: "center"`

### Content Sizing Guidelines

**Bar Charts (StorySignatureWords, StoryTopContacts, StoryTapbacks)**:
```tsx
const BAR_MAX_WIDTH = CONTENT_WIDTH - 180; // Account for labels

// Each bar row:
<div style={{ display: "flex", alignItems: "center", gap: 20 }}>
  <div style={{ width: 140, fontSize: 28, textAlign: "right" }}>{label}</div>
  <div style={{ flex: 1, position: "relative", height: 32 }}>
    {/* Background bar: width: "100%" */}
    {/* Filled bar: width: barWidth (calculated from data) */}
  </div>
</div>
```

**List Cards (StoryEmojiLanguages, StoryConnections)**:
- Show 4-5 items max
- Each item: 20-28px gap between rows
- Cards with border: `background: rgba(255,255,255,0.04)`, `border: 1px solid rgba(255,255,255,0.08)`

**Emoji Displays**:
- Large emoji: 44-56px
- Small emoji in rows: 32-40px
- Limit to 8 emojis per person for emoji language cards

### Technical Implementation

**Library**: `html2canvas-pro` (handles DOM-to-canvas conversion)

**⚠️ Critical: Off-screen Rendering**

Use `left: -9999px` (NOT `visibility: hidden`) for off-screen rendering:

```tsx
const handleExport = async () => {
  // Create off-screen container
  const container = document.createElement("div");
  container.style.position = "fixed";
  container.style.top = "0";
  container.style.left = "-9999px";  // NOT visibility:hidden!
  container.style.width = `${STORY_WIDTH}px`;
  container.style.height = `${STORY_HEIGHT}px`;
  document.body.appendChild(container);

  // Render React component into container
  const root = createRoot(container);
  root.render(storyContent);

  // Wait for charts to render (1.5s for Recharts)
  await new Promise((r) => setTimeout(r, 1500));

  // Capture with html2canvas
  const canvas = await html2canvas(container, {
    width: STORY_WIDTH,
    height: STORY_HEIGHT,
    scale: 2,  // 2x for retina quality
    useCORS: true,
    backgroundColor: null,
    logging: false,
    x: 0,
    y: 0,
    scrollX: 0,
    scrollY: 0,
    windowWidth: STORY_WIDTH,
    windowHeight: STORY_HEIGHT,
  });

  const dataUrl = canvas.toDataURL("image/png");
  
  // Cleanup
  root.unmount();
  document.body.removeChild(container);
  
  return dataUrl;
};
```

**Why `-9999px` instead of `visibility: hidden`**:
- `html2canvas` cannot capture elements with `visibility: hidden`
- Elements positioned off-screen are still rendered and capturable
- The 1.5s delay is necessary for Recharts to fully render

**Download Function**:
```tsx
const downloadImage = (dataUrl: string, title: string) => {
  const safeName = title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = `wrapped-${safeName}_story.png`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
```

### Common Pitfalls & Solutions

| Problem | Cause | Solution |
|---------|-------|----------|
| Black images | `visibility: hidden` | Use `left: -9999px` instead |
| Content clipped | Width exceeds CONTENT_WIDTH | Calculate bar widths from CONTENT_WIDTH |
| Off-center | Percentage widths or flex issues | Use explicit pixel widths |
| Gradient text not rendering | `WebkitBackgroundClip: "text"` | Use solid color for "Wrapped" text |
| Charts not rendering | Insufficient wait time | Increase setTimeout to 1500ms |
| Bars bleeding | No overflow:hidden | Add to card container |

### Checklist for Adding New Exportable Cards

1. [ ] Create a `Story{CardName}` component in `story-cards.tsx`
2. [ ] Use `StoryFrame` wrapper with appropriate category string
3. [ ] Set explicit widths (use CONTENT_WIDTH constant)
4. [ ] Limit displayed items (e.g., 5 contacts, 8 words, 4 connections)
5. [ ] Use `truncate()` helper for variable-length text
6. [ ] For bar charts: calculate widths from `CONTENT_WIDTH - labelSpace`
7. [ ] Wrap the page card with `ExportableCard`, passing the story component
8. [ ] Add to the `allCards` array in Wrapped2025.tsx
9. [ ] Test export - verify content fits within bordered card
10. [ ] Verify no content bleeds past the rounded border

---

## Checklist for New Wrapped

1. [ ] Verify data ingest extracted `attributedBody` text
2. [ ] Run data generation script
3. [ ] Verify top contacts have correct names (combine duplicates)
4. [ ] Add MUST_INCLUDE contacts (e.g., Mom) if they're not in top 6
5. [ ] Create stats.json with total messages and unique conversations
6. [ ] Curate memories from random message samples
7. [ ] Write connection descriptions for each top person
8. [ ] Select meaningful texts from each top person
9. [ ] Categorize plans into trips/gatherings/connections
10. [ ] Select reaction memories for each type (love, laugh, emphasis, dislike)
11. [ ] Test keyboard navigation
12. [ ] Test responsive layout at various sizes
13. [ ] Verify all charts stay contained in cards



