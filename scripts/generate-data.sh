#!/bin/bash
set -e

# Find iMessage database in workspace
# Looks for data.duckdb in directories with datapackage.json containing "imessage"
find_imessage_db() {
    for pkg in $(find /home/workspace -name "datapackage.json" 2>/dev/null); do
        dir=$(dirname "$pkg")
        db="$dir/data.duckdb"
        if [ -f "$db" ] && grep -q '"sourceTemplate".*imessage\|"name".*imessage' "$pkg" 2>/dev/null; then
            echo "$db"
            return 0
        fi
    done
    return 1
}

DB_PATH=$(find_imessage_db)
if [ -z "$DB_PATH" ]; then
    echo "Error: Could not find iMessage data.duckdb in workspace."
    echo "Looking for directories containing datapackage.json with sourceTemplate 'imessage'."
    echo ""
    echo "To create an iMessage dataset:"
    echo "1. Copy chat.db from ~/Library/Messages/ on your Mac"
    echo "2. Create a dataset directory with the iMessage template"
    echo "3. Run the ingestion script to produce data.duckdb"
    exit 1
fi

echo "Found iMessage database: $DB_PATH"

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
DATA_DIR="$SCRIPT_DIR/../src/lib/data"
mkdir -p "$DATA_DIR"

echo "Exporting Monthly Volume..."
duckdb "$DB_PATH" -json -c "
SELECT 
    date_trunc('month', sent_at)::DATE AS month,
    COUNT(*) AS count
FROM messages 
WHERE sent_at >= '2025-01-01'
GROUP BY 1
ORDER BY 1;" > "$DATA_DIR/monthly-volume.json"

echo "Exporting Top Contacts..."
duckdb "$DB_PATH" -json -c "
SELECT 
    COALESCE(c.name, h.identifier) AS contact,
    h.identifier AS handle_identifier,
    COUNT(*) AS count,
    SUM(CASE WHEN is_from_me THEN 1 ELSE 0 END) AS sent,
    SUM(CASE WHEN is_from_me THEN 0 ELSE 1 END) AS received
FROM messages m
LEFT JOIN handles h ON m.handle_id = h.handle_id
LEFT JOIN contacts c ON h.identifier = c.identifier
WHERE sent_at >= '2025-01-01'
GROUP BY 1, 2
ORDER BY count DESC
LIMIT 10;" > "$DATA_DIR/top-contacts.json"

echo "Exporting Hourly Heatmap..."
duckdb "$DB_PATH" -json -c "
SELECT 
    hour(sent_at) AS hour,
    dayofweek(sent_at) AS day_of_week,
    COUNT(*) AS count
FROM messages 
WHERE sent_at >= '2025-01-01'
GROUP BY 1, 2
ORDER BY 1, 2;" > "$DATA_DIR/hourly-heatmap.json"

echo "Exporting Tapback Trends..."
duckdb "$DB_PATH" -json -c "
SELECT 
    CASE 
        WHEN associated_message_type = 2000 THEN 'Love'
        WHEN associated_message_type = 2001 THEN 'Like'
        WHEN associated_message_type = 2002 THEN 'Dislike'
        WHEN associated_message_type = 2003 THEN 'Laugh'
        WHEN associated_message_type = 2004 THEN 'Emphasis'
        WHEN associated_message_type = 2005 THEN 'Question'
        ELSE 'Other'
    END AS reaction,
    COUNT(*) AS count
FROM messages 
WHERE associated_message_type BETWEEN 2000 AND 2005
  AND sent_at >= '2025-01-01'
GROUP BY 1
ORDER BY count DESC;" > "$DATA_DIR/tapback-trends.json"

echo "Exporting Top Emojis..."
# Create inline emoji extractor
python3 -c "
import sys
import json
import re
from collections import Counter

emoji_pattern = re.compile(
    '['
    '\U0001F600-\U0001F64F'  # emoticons
    '\U0001F300-\U0001F5FF'  # symbols & pictographs
    '\U0001F680-\U0001F6FF'  # transport & map
    '\U0001F1E0-\U0001F1FF'  # flags
    '\U00002702-\U000027B0'  # dingbats
    '\U0001F900-\U0001F9FF'  # supplemental symbols
    '\U0001FA00-\U0001FA6F'  # chess symbols
    '\U0001FA70-\U0001FAFF'  # symbols extended-A
    '\U00002600-\U000026FF'  # misc symbols
    ']+', re.UNICODE
)

counter = Counter()
for line in sys.stdin:
    emojis = emoji_pattern.findall(line)
    for e in emojis:
        for char in e:
            counter[char] += 1

result = [{'emoji': e, 'count': c} for e, c in counter.most_common(20)]
print(json.dumps(result))
" < <(duckdb "$DB_PATH" -list -c "SELECT text FROM messages WHERE is_from_me = TRUE AND text IS NOT NULL AND sent_at >= '2025-01-01';") > "$DATA_DIR/top-emojis.json"

echo "Exporting Per-Contact Emojis..."
python3 "$SCRIPT_DIR/contact_emojis.py" "$DB_PATH" > "$DATA_DIR/contact-emojis.json"

echo "Exporting Top Words..."
duckdb "$DB_PATH" -json -c "
WITH words AS (
    SELECT unnest(string_split(lower(regexp_replace(text, '[^a-zA-Z ]', '', 'g')), ' ')) AS word
    FROM messages 
    WHERE is_from_me = TRUE 
      AND text IS NOT NULL 
      AND sent_at >= '2025-01-01'
)
SELECT word, COUNT(*) AS count
FROM words
WHERE length(word) > 3
  AND word NOT IN ('that', 'this', 'with', 'have', 'will', 'from', 'they', 'been', 'were', 'what', 'when', 'your', 'just', 'like', 'know', 'yeah', 'okay', 'really', 'would', 'could', 'should', 'think', 'about', 'going', 'dont', 'didnt', 'cant', 'wont', 'there', 'their', 'theyre', 'youre')
GROUP BY word
ORDER BY count DESC
LIMIT 20;" > "$DATA_DIR/top-words.json"

echo "Exporting Stats..."
duckdb "$DB_PATH" -json -c "
SELECT
    COUNT(*) AS total_messages,
    SUM(CASE WHEN is_from_me THEN 1 ELSE 0 END) AS sent,
    SUM(CASE WHEN is_from_me THEN 0 ELSE 1 END) AS received,
    COUNT(DISTINCT handle_id) AS unique_contacts,
    COUNT(DISTINCT DATE(sent_at)) AS active_days
FROM messages
WHERE sent_at >= '2025-01-01';" > "$DATA_DIR/stats.json"

echo "Exporting Milestones..."
duckdb "$DB_PATH" -json -c "
WITH first_msg AS (
    SELECT text, sent_at, COALESCE(c.name, h.identifier) AS contact
    FROM messages m
    LEFT JOIN handles h ON m.handle_id = h.handle_id
    LEFT JOIN contacts c ON h.identifier = c.identifier
    WHERE sent_at >= '2025-01-01' AND text IS NOT NULL
    ORDER BY sent_at ASC LIMIT 1
),
last_msg AS (
    SELECT text, sent_at, COALESCE(c.name, h.identifier) AS contact
    FROM messages m
    LEFT JOIN handles h ON m.handle_id = h.handle_id
    LEFT JOIN contacts c ON h.identifier = c.identifier
    WHERE sent_at >= '2025-01-01' AND text IS NOT NULL
    ORDER BY sent_at DESC LIMIT 1
)
SELECT 
    (SELECT json_object('text', text, 'date', sent_at::VARCHAR, 'contact', contact) FROM first_msg) AS first_message,
    (SELECT json_object('text', text, 'date', sent_at::VARCHAR, 'contact', contact) FROM last_msg) AS last_message;" > "$DATA_DIR/milestones.json"

echo ""
echo "✓ Data exported to $DATA_DIR"
echo ""
echo "Note: Some files require manual curation or AI generation:"
echo "  - meaningful-texts.json (curated memorable messages)"
echo "  - connections.json (AI-generated connection vibes)"
echo "  - personality-evaluation.json (AI-generated personality analysis)"
echo "  - plans.json (trips and gatherings mentioned)"
echo "  - reaction-memories.json (messages with specific reactions)"

