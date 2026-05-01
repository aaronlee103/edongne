import json
import urllib.request
import urllib.parse
import ssl
import random
from datetime import datetime, timedelta

SUPABASE_URL = 'https://dstnagdnbejumqobgyid.supabase.co'
SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRzdG5hZ2RuYmVqdW1xb2JneWlkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzkzNjY1MywiZXhwIjoyMDg5NTEyNjUzfQ.L6b2N-H6yT1EGAVbC-kxu5fWTkzm0potg_lmxU8H3Gk'

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

headers = {
    'apikey': SUPABASE_KEY,
    'Authorization': f'Bearer {SUPABASE_KEY}',
    'Content-Type': 'application/json',
}

# All regions except NY
REGIONS = ['la', 'dc', 'seattle', 'chicago', 'sf', 'atlanta', 'philly', 'dallas', 'houston', 'hawaii', 'boston']

for region in REGIONS:
    print(f"\n--- {region} ---")

    # Fetch all magazine articles for this region
    url = f"{SUPABASE_URL}/rest/v1/posts?type=eq.magazine&region=eq.{region}&select=id,category,title&order=id.asc&limit=500"
    req = urllib.request.Request(url, headers=headers)
    resp = urllib.request.urlopen(req, context=ctx, timeout=30)
    articles = json.loads(resp.read().decode('utf-8'))
    print(f"  Found {len(articles)} articles")

    if not articles:
        continue

    # Generate random timestamps spread over the last 90 days
    now = datetime.utcnow()
    random_dates = []
    for _ in range(len(articles)):
        days_ago = random.uniform(1, 90)
        hours = random.uniform(0, 24)
        minutes = random.uniform(0, 60)
        dt = now - timedelta(days=days_ago, hours=hours, minutes=minutes)
        random_dates.append(dt)

    random.shuffle(random_dates)

    # Update each article with a random date
    updated = 0
    for i, article in enumerate(articles):
        new_date = random_dates[i].strftime('%Y-%m-%dT%H:%M:%S.000Z')
        patch_url = f"{SUPABASE_URL}/rest/v1/posts?id=eq.{article['id']}"
        body = json.dumps({'created_at': new_date}).encode()
        patch_req = urllib.request.Request(patch_url, data=body, method='PATCH', headers=headers)
        try:
            urllib.request.urlopen(patch_req, context=ctx, timeout=30)
            updated += 1
        except Exception as e:
            print(f"  Error updating {article['id']}: {e}")

    print(f"  Updated {updated}/{len(articles)} articles")

print("\nDone! All article dates have been shuffled.")
