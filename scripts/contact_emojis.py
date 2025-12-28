#!/usr/bin/env python3
"""
Extract emoji usage per contact from iMessage database.
Usage: python contact_emojis.py <path-to-data.duckdb>
"""
import json
import re
import subprocess
import sys
from collections import Counter

EMOJI_PATTERN = re.compile(
    "["
    "\U0001F600-\U0001F64F"
    "\U0001F300-\U0001F5FF"
    "\U0001F680-\U0001F6FF"
    "\U0001F1E0-\U0001F1FF"
    "\U00002702-\U000027B0"
    "\U000024C2-\U0001F251"
    "\U0001F900-\U0001F9FF"
    "\U0001FA00-\U0001FA6F"
    "\U0001FA70-\U0001FAFF"
    "\U00002600-\U000026FF"
    "\U00002700-\U000027BF"
    "\U0000FE00-\U0000FE0F"
    "\U0001F000-\U0001F02F"
    "\U00002300-\U000023FF"
    "\u2764\u2665\u2763"
    "]+", 
    flags=re.UNICODE
)

def get_db_data(db_path, query):
    result = subprocess.check_output([
        "duckdb", db_path, "-json", "-c", query
    ])
    return json.loads(result)

def extract_emojis(text):
    return EMOJI_PATTERN.findall(text)

def get_emojis_for_identifier(db_path, identifier):
    query = f"""
    SELECT text FROM messages m
    JOIN handles h ON m.handle_id = h.handle_id
    WHERE h.identifier = '{identifier}'
      AND m.is_from_me = TRUE
      AND m.text IS NOT NULL
      AND m.sent_at >= '2025-01-01'
    """
    result = subprocess.check_output([
        "duckdb", db_path, "-list", "-c", query
    ])
    return extract_emojis(result.decode('utf-8'))

def main():
    if len(sys.argv) < 2:
        print("Usage: python contact_emojis.py <path-to-data.duckdb>", file=sys.stderr)
        sys.exit(1)
    
    db_path = sys.argv[1]
    
    # Get top contacts by message count
    query = """
    SELECT 
        COALESCE(c.name, h.identifier) AS contact,
        h.identifier,
        COUNT(*) as total
    FROM messages m
    JOIN handles h ON m.handle_id = h.handle_id
    LEFT JOIN contacts c ON h.identifier = c.identifier
    WHERE m.sent_at >= '2025-01-01'
      AND (m.associated_message_type IS NULL OR m.associated_message_type = 0)
      AND m.room_name IS NULL
    GROUP BY 1, 2
    ORDER BY total DESC
    LIMIT 10;
    """
    
    contacts = get_db_data(db_path, query)
    
    # Get emojis for each top contact
    emoji_results = []
    for contact in contacts:
        emojis_list = get_emojis_for_identifier(db_path, contact["identifier"])
        counts = Counter(emojis_list)
        emojis = [{"emoji": e, "count": c} for e, c in counts.most_common(5)]
        
        if emojis:
            emoji_results.append({
                "name": contact["contact"],
                "emojis": emojis
            })
    
    print(json.dumps(emoji_results, indent=2))

if __name__ == "__main__":
    main()

