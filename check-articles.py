import json
import urllib.request
import ssl

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

# Check LA articles - compare content lengths
url = f"{SUPABASE_URL}/rest/v1/posts?type=eq.magazine&region=eq.la&select=id,title,category,content&order=id.asc&limit=200"
req = urllib.request.Request(url, headers=headers)
resp = urllib.request.urlopen(req, context=ctx, timeout=30)
articles = json.loads(resp.read().decode('utf-8'))

print(f"LA 기사 총 {len(articles)}개\n")

by_cat = {}
for a in articles:
    cat = a['category']
    if cat not in by_cat:
        by_cat[cat] = []
    by_cat[cat].append(a)

for cat in sorted(by_cat.keys()):
    arts = sorted(by_cat[cat], key=lambda x: x['id'])
    print(f"\n=== {cat} ({len(arts)}개) ===")
    for i, a in enumerate(arts):
        content_len = len(a.get('content', '') or '')
        short = (a.get('content', '') or '')[:80].replace('\n', ' ')
        status = "✓" if content_len > 1500 else "✗ SHORT"
        print(f"  #{i+1} [{content_len:>5}자] {status} | {a['title'][:50]}")
        if content_len < 1500:
            print(f"       시작: {short}...")
