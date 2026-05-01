#!/usr/bin/env python3
"""
Query Supabase database to compare article quality between regions.
"""

import json
import urllib.request
import urllib.parse
import ssl
import sys
import certifi

# Configuration
SUPABASE_URL = "https://dstnagdnbejumqobgyid.supabase.co"
SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRzdG5hZ2RuYmVqdW1xb2JneWlkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzkzNjY1MywiZXhwIjoyMDg5NTEyNjUzfQ.L6b2N-H6yT1EGAVbC-kxu5fWTkzm0potg_lmxU8H3Gk"
TABLE = "posts"


def make_request(query_string):
    """Make a request to Supabase API with SSL verification disabled."""
    url = f"{SUPABASE_URL}/rest/v1/{TABLE}?{query_string}"

    req = urllib.request.Request(url)
    req.add_header("Authorization", f"Bearer {SERVICE_ROLE_KEY}")
    req.add_header("apikey", SERVICE_ROLE_KEY)
    req.add_header("Content-Type", "application/json")

    # Create SSL context with verification disabled
    ssl_context = ssl.create_default_context()
    ssl_context.check_hostname = False
    ssl_context.verify_mode = ssl.CERT_NONE

    try:
        # Use ProxyHandler with empty dict to bypass system proxies
        proxy_handler = urllib.request.ProxyHandler({})
        opener = urllib.request.build_opener(proxy_handler)

        with opener.open(req) as response:
            data = response.read().decode('utf-8')
            return json.loads(data)
    except Exception as e:
        print(f"Error making request: {e}")
        import traceback
        traceback.print_exc()
        return None


def query_articles_by_region(region, limit=2):
    """Fetch articles from a specific region, sorted by content length (longest first)."""
    # Query for magazine articles in the region, ordered by content length
    query = f'type=eq.magazine&region=eq.{region}&select=id,title,content,category,region&order=content.length.desc&limit={limit}'

    print(f"\n{'='*80}")
    print(f"FETCHING {limit} LONGEST ARTICLES FROM REGION: {region.upper()}")
    print(f"{'='*80}")

    articles = make_request(query)

    if not articles:
        print(f"No articles found for region: {region}")
        return []

    print(f"Found {len(articles)} articles\n")

    for idx, article in enumerate(articles, 1):
        print(f"\n{'-'*80}")
        print(f"ARTICLE {idx} - {region.upper()}")
        print(f"{'-'*80}")
        print(f"ID: {article.get('id')}")
        print(f"Title: {article.get('title')}")
        print(f"Category: {article.get('category')}")
        print(f"Region: {article.get('region')}")
        print(f"\nFULL CONTENT:")
        print(f"{'-'*80}")
        print(article.get('content', 'No content'))
        print(f"{'-'*80}")

    return articles


def query_article_count_per_region():
    """Fetch count of magazine articles per region."""
    print(f"\n{'='*80}")
    print("ARTICLE COUNT PER REGION (Magazine Type)")
    print(f"{'='*80}")

    query = 'type=eq.magazine&select=region'
    articles = make_request(query)

    if not articles:
        print("No articles found")
        return {}

    # Count articles per region
    region_counts = {}
    for article in articles:
        region = article.get('region')
        region_counts[region] = region_counts.get(region, 0) + 1

    for region, count in sorted(region_counts.items()):
        print(f"{region.upper()}: {count} articles")

    return region_counts


def query_unique_categories():
    """Fetch all unique categories from magazine articles."""
    print(f"\n{'='*80}")
    print("UNIQUE CATEGORIES IN MAGAZINE ARTICLES")
    print(f"{'='*80}")

    query = 'type=eq.magazine&select=category'
    articles = make_request(query)

    if not articles:
        print("No articles found")
        return []

    # Get unique categories
    categories = set()
    for article in articles:
        category = article.get('category')
        if category:
            categories.add(category)

    categories = sorted(list(categories))
    print(f"Total unique categories: {len(categories)}\n")

    for category in categories:
        print(f"  - {category}")

    return categories


def main():
    """Main execution."""
    print("\n" + "="*80)
    print("SUPABASE ARTICLE QUALITY COMPARISON - NY vs CHICAGO")
    print("="*80)

    # 1. Fetch 2 longest articles from NY
    ny_articles = query_articles_by_region('ny', limit=2)

    # 2. Fetch 2 longest articles from Chicago
    chicago_articles = query_articles_by_region('chicago', limit=2)

    # 3. Fetch article count per region
    region_counts = query_article_count_per_region()

    # 4. Fetch unique categories
    categories = query_unique_categories()

    # Summary
    print(f"\n{'='*80}")
    print("SUMMARY")
    print(f"{'='*80}")
    print(f"NY Articles Fetched: {len(ny_articles)}")
    print(f"Chicago Articles Fetched: {len(chicago_articles)}")
    print(f"Total Regions: {len(region_counts)}")
    print(f"Total Categories: {len(categories)}")
    print(f"{'='*80}\n")


if __name__ == "__main__":
    main()
