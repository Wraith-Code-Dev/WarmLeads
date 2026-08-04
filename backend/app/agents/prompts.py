RESEARCH_SUMMARY_PROMPT = """
You are an expert sales intelligence research analyst.
Analyze the following raw scraped markdown content from a prospect's company website and extract key insights:

Prospect Name: {first_name} {last_name}
Company Name: {company}
Website URL: {website}

Raw Website Content:
{scraped_content}

Output JSON format with exact keys:
{{
    "company_summary": "Concise 2-3 sentence overview of what the company does and their value proposition",
    "key_insights": ["Insight 1", "Insight 2", "Insight 3"],
    "news_highlights": ["Recent news or growth signals if present"]
}}
"""

DRAFT_PASS1_PROMPT = """
You are a top 1% B2B cold outreach copywriter specializing in ultra-personalized, non-spammy cold emails.

Prospect Info:
- Name: {first_name}
- Title: {title}
- Company: {company}
- Custom Notes: {custom_notes}

Company Research & Insights:
- Summary: {company_summary}
- Insights: {key_insights}

Rules for Email:
1. Subject line: Max 4-6 words, intriguing, natural, no ALL CAPS, no spammy buzzwords.
2. Hook: Hyper-relevant first line based on their company summary and key insights.
3. Value prop: Concise, 1-2 sentences showing clear ROI or solving a specific friction point.
4. Call to Action (CTA): Low-friction interest gauge (e.g., "Worth a brief 5-min look?", "Open to sharing how we do this?").
5. Total length: Under 100 words. Short and punchy.

Output JSON format:
{{
    "subject": "Subject line string",
    "body": "Email body string (use Hi {first_name}, line breaks)"
}}
"""

VERIFIER_PASS2_PROMPT = """
You are a strict cold email quality assurance editor and deliverability expert.
Review and polish the following cold email draft.

Prospect: {first_name} at {company} ({title})
Initial Subject: {draft_subject}
Initial Body:
{draft_body}

Critique checklist:
- Is it under 100 words?
- Does it sound like a real human writing 1-to-1, or a generic template?
- Is the CTA low-friction?
- Are there any fake placeholders like [Insert Name]?

Return JSON format:
{{
    "final_subject": "Optimized subject line",
    "final_body": "Optimized, polished email body",
    "confidence_score": Integer rating from 1 to 100 on likelihood of positive response,
    "critique": "Brief comment on what was improved"
}}
"""
