#!/usr/bin/env python3
"""
Analyze article data from local SQL files.
Compares article quality between regions (NY vs NJ).
"""

import re
import json
from collections import defaultdict


def extract_articles_from_sql(sql_file):
    """Extract articles from SQL UPDATE statements."""
    articles = []

    with open(sql_file, 'r', encoding='utf-8') as f:
        content = f.read()

    # Pattern to match: UPDATE posts SET content = '...' WHERE id = '...'
    pattern = r"UPDATE posts SET content = '(.*?)' WHERE id = '([a-f0-9\-]+)'"

    matches = re.finditer(pattern, content, re.DOTALL)
    for match in matches:
        article_content = match.group(1)
        article_id = match.group(2)

        # Extract title (usually first line or before first double newline)
        title_match = re.match(r'^([^\n]+)', article_content)
        title = title_match.group(1).strip() if title_match else "Untitled"

        articles.append({
            'id': article_id,
            'title': title,
            'content': article_content,
            'length': len(article_content),
            'word_count': len(article_content.split())
        })

    return articles


def analyze_region_articles(region_code, sql_file):
    """Analyze articles from a specific region."""
    articles = extract_articles_from_sql(sql_file)

    if not articles:
        return []

    # Sort by content length (longest first)
    articles_sorted = sorted(articles, key=lambda x: x['length'], reverse=True)

    return articles_sorted


def main():
    print("\n" + "="*80)
    print("ARTICLE QUALITY COMPARISON - NY vs NJ")
    print("="*80)

    # Analyze NY articles
    print("\n" + "="*80)
    print("FETCHING 2 LONGEST ARTICLES FROM REGION: NY")
    print("="*80)

    ny_articles = analyze_region_articles('ny', '/sessions/inspiring-funny-hopper/mnt/edongne/ny_batch2.sql')

    if ny_articles:
        print(f"Found {len(ny_articles)} total NY articles\n")
        for idx, article in enumerate(ny_articles[:2], 1):
            print(f"\n{'-'*80}")
            print(f"ARTICLE {idx} - NY")
            print(f"{'-'*80}")
            print(f"ID: {article['id']}")
            print(f"Title: {article['title']}")
            print(f"Content Length: {article['length']} characters")
            print(f"Word Count: {article['word_count']} words")
            print(f"\nFULL CONTENT:")
            print(f"{'-'*80}")
            print(article['content'])
            print(f"{'-'*80}")
    else:
        print("No NY articles found")

    # Analyze NJ articles
    print("\n" + "="*80)
    print("FETCHING 2 LONGEST ARTICLES FROM REGION: NJ")
    print("="*80)

    nj_articles = analyze_region_articles('nj', '/sessions/inspiring-funny-hopper/mnt/edongne/nj_batch3.sql')

    if nj_articles:
        print(f"Found {len(nj_articles)} total NJ articles\n")
        for idx, article in enumerate(nj_articles[:2], 1):
            print(f"\n{'-'*80}")
            print(f"ARTICLE {idx} - NJ")
            print(f"{'-'*80}")
            print(f"ID: {article['id']}")
            print(f"Title: {article['title']}")
            print(f"Content Length: {article['length']} characters")
            print(f"Word Count: {article['word_count']} words")
            print(f"\nFULL CONTENT:")
            print(f"{'-'*80}")
            print(article['content'])
            print(f"{'-'*80}")
    else:
        print("No NJ articles found")

    # Statistics by region
    print("\n" + "="*80)
    print("ARTICLE STATISTICS BY REGION")
    print("="*80)

    regions = {
        'NY': ny_articles,
        'NJ': nj_articles
    }

    for region, articles in regions.items():
        if articles:
            lengths = [a['length'] for a in articles]
            word_counts = [a['word_count'] for a in articles]
            print(f"\n{region}:")
            print(f"  Total articles: {len(articles)}")
            print(f"  Avg content length: {sum(lengths) // len(lengths)} characters")
            print(f"  Avg word count: {sum(word_counts) // len(word_counts)} words")
            print(f"  Max content length: {max(lengths)} characters")
            print(f"  Min content length: {min(lengths)} characters")

    # Quality comparison
    print("\n" + "="*80)
    print("QUALITY COMPARISON")
    print("="*80)

    if ny_articles and nj_articles:
        ny_avg_length = sum([a['length'] for a in ny_articles]) / len(ny_articles)
        nj_avg_length = sum([a['length'] for a in nj_articles]) / len(nj_articles)

        ny_avg_words = sum([a['word_count'] for a in ny_articles]) / len(ny_articles)
        nj_avg_words = sum([a['word_count'] for a in nj_articles]) / len(nj_articles)

        print(f"\nAverage Content Length:")
        print(f"  NY:  {ny_avg_length:.0f} characters ({ny_avg_words:.0f} words)")
        print(f"  NJ:  {nj_avg_length:.0f} characters ({nj_avg_words:.0f} words)")

        if ny_avg_length > nj_avg_length:
            diff_pct = ((ny_avg_length - nj_avg_length) / nj_avg_length) * 100
            print(f"  Difference: NY is {diff_pct:.1f}% longer")
        elif nj_avg_length > ny_avg_length:
            diff_pct = ((nj_avg_length - ny_avg_length) / ny_avg_length) * 100
            print(f"  Difference: NJ is {diff_pct:.1f}% longer")
        else:
            print(f"  Difference: Articles are similar in length")

    print(f"\n{'='*80}\n")


if __name__ == "__main__":
    main()
