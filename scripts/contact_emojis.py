import json
import re
import subprocess
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

def get_db_data(query):
    result = subprocess.check_output([
        "duckdb", "/home/workspace/imessages/data.duckdb", "-json", "-c", query
    ])
    return json.loads(result)

def extract_emojis(text):
    return EMOJI_PATTERN.findall(text)

def get_emojis_for_identifier(identifier):
    query = f"""
    SELECT text FROM messages m
    JOIN handles h ON m.handle_id = h.handle_id
    WHERE h.identifier = '{identifier}'
      AND m.is_from_me = TRUE
      AND m.text IS NOT NULL
      AND m.sent_at >= '2025-01-01'
    """
    result = subprocess.check_output([
        "duckdb", "/home/workspace/imessages/data.duckdb", "-list", "-c", query
    ])
    return extract_emojis(result.decode('utf-8'))

def main():
    query = """
    SELECT 
        h.identifier,
        SUM(CASE WHEN m.is_from_me = TRUE THEN 1 ELSE 0 END) as sent,
        SUM(CASE WHEN m.is_from_me = FALSE THEN 1 ELSE 0 END) as received,
        COUNT(*) as total
    FROM messages m
    JOIN handles h ON m.handle_id = h.handle_id
    WHERE m.sent_at >= '2025-01-01'
      AND (m.associated_message_type IS NULL OR m.associated_message_type = 0)
      AND m.room_name IS NULL
    GROUP BY 1
    ORDER BY total DESC
    LIMIT 30;
    """
    
    data = get_db_data(query)
    
    # Map identifiers to friendly names
    IDENTIFIER_TO_NAME = {
        "+12147265046": "Rob (Bubba)",
        "+14088584780": "Jackie",
        "+12604155053": "Bridget B",
        "+12038106446": "Mommy 💕",
    }
    
    # Skip these identifiers
    SKIP_IDENTIFIERS = {
        "antheartaeuber@icloud.com",
    }
    
    # Must include these people (mom!)
    MUST_INCLUDE = {"+12038106446"}
    
    # Get contact names from DB
    name_query = """
    SELECT DISTINCT h.identifier, COALESCE(c.name, h.identifier) as contact_name
    FROM handles h
    LEFT JOIN contacts c ON h.identifier = c.identifier
    """
    name_data = get_db_data(name_query)
    db_names = {row['identifier']: row['contact_name'] for row in name_data}
    
    # Build contact list
    contacts = []
    for entry in data:
        identifier = entry['identifier']
        if identifier in SKIP_IDENTIFIERS:
            continue
        
        name = IDENTIFIER_TO_NAME.get(identifier, db_names.get(identifier, identifier))
        
        contacts.append({
            "contact": name,
            "identifier": identifier,
            "sent": entry["sent"],
            "received": entry["received"],
            "total": entry["total"]
        })
    
    # Get top 5, then ensure mom is included
    top_contacts = contacts[:5]
    
    # Check if mom is in top 5 already
    mom_in_top = any(c["identifier"] in MUST_INCLUDE for c in top_contacts)
    if not mom_in_top:
        # Find mom and add her
        for c in contacts:
            if c["identifier"] in MUST_INCLUDE:
                top_contacts.append(c)
                break
    
    # Output for top-contacts.json
    top_contacts_output = [{"contact": c["contact"], "sent": c["sent"], "received": c["received"], "total": c["total"]} 
                           for c in top_contacts]
    
    with open("/home/workspace/imessages-viz/src/lib/data/top-contacts.json", "w") as f:
        json.dump(top_contacts_output, f, indent=2)
    
    # Get emojis for each top contact
    emoji_results = []
    for contact in top_contacts:
        emojis_list = get_emojis_for_identifier(contact["identifier"])
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
