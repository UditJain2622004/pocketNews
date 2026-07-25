"""Factual category recaps used as source material for weekly and monthly stories."""
from __future__ import annotations

import os
from openai import OpenAI

from story_generator import MODEL


def generate_category_summary(category: str, period: str, articles: list[dict[str, str]]) -> str:
    if not articles:
        raise ValueError("No articles available for this category.")
    source_text = "\n\n".join(
        f"Headline: {article['title']}\nSource: {article['source']}\nText: {article['text'][:2500]}"
        for article in articles[:30]
    )
    response = OpenAI().chat.completions.create(
        model=MODEL,
        messages=[
            {
                "role": "system",
                "content": "Summarize only supplied facts. Produce one concise, chronological factual briefing suitable as source material for a later fictional news story. Do not invent links, causes, quotations, or outcomes.",
            },
            {"role": "user", "content": f"Category: {category}\nPeriod: {period}\n\n{source_text}"},
        ],
    )
    summary = response.choices[0].message.content
    if not summary:
        raise RuntimeError("OpenAI returned no category summary.")
    return summary.strip()
