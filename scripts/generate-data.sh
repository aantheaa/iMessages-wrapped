#!/bin/bash
set -e

DB_PATH="/home/workspace/imessages/data.duckdb"
DATA_DIR="/home/workspace/imessages-viz/src/lib/data"
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

echo "Exporting Global Top Emojis..."
duckdb "$DB_PATH" -list -c "SELECT text FROM messages WHERE is_from_me = TRUE AND text IS NOT NULL AND sent_at >= '2025-01-01';" | python3 /home/.z/workspaces/con_4mVTfXepb9XUYoOt/extract_emojis.py > "$DATA_DIR/top-emojis.json"

echo "Exporting Per-Contact Emojis..."
python3 imessages-viz/scripts/contact_emojis.py > "$DATA_DIR/contact-emojis.json"
