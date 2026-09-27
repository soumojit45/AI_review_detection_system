import re

def extract_salient_tokens(text: str) -> list:
    '''
    Extracts key indicative tokens (words and n-grams) that signal
    either deceptive/fraudulent patterns or authentic/genuine review behavior.
    
    Academic Rationale:
    Deceptive opinion spam (Ott et al., 2011; Jindal & Liu, 2008) exhibits
    higher frequencies of generalized superlatives, unverified promises,
    and lack of empirical product friction compared to genuine customer feedback.
    '''
    tokens = []
    text_lower = text.lower()
    
    # 1. Hyperbolic & Promotional Superlatives (Strong Fake Indicators)
    hyperbolic_patterns = [
        (r'\bbest (product|purchase|thing|decision|item|choice) (ever|in the world|in my life|in history)\b', 'Extreme Superlative', 'Deceptive reviews disproportionately use generalized universal praise without feature specifics.'),
        (r'\bchanged my life\b', 'Hyperbolic Claim', 'Dramatic life-altering claims are statistically correlated with incentivized or fabricated reviews.'),
        (r'\b100% (recommend|guarantee|satisfied|real|legit)\b', 'Commercial Guarantee', 'Commercial marketing phrasing commonly found in synthetic promotion.'),
        (r'\bmust buy\b', 'Call to Action', 'Urgent imperative calls to action reflect promotional marketing rather than descriptive organic feedback.'),
        (r'\bfive stars? (are )?not enough\b', 'Rating Inflation', 'Classic emotional rating inflation trope common in fake reviews.'),
        (r'\bhands down the (best|greatest)\b', 'Colloquial Hyperbole', 'Sweeping superlative lacking technical or practical comparison.'),
        (r'\bworth every (single )?penny\b', 'Value Cliché', 'Stock promotional phrase frequently found in templated deceptive reviews.'),
        (r'\b(unbelievable|miracle|perfection|flawless|game changer)\b', 'Intense Adjective', 'High-valence subjective intensifier devoid of concrete product operational context.'),
        (r'\b(don\'?t hesitate|buy it now|order right away)\b', 'Purchasing Pressure', 'High-pressure conversion language rare in genuine observational reviews.')
    ]
    
    for pattern, category, reason in hyperbolic_patterns:
        matches = re.finditer(pattern, text_lower)
        for match in matches:
            matched_phrase = text[match.start():match.end()]
            tokens.append({
                "token": matched_phrase,
                "label": "SUSPICIOUS",
                "category": category,
                "reason": reason
            })
            
    # 2. Syntax & Punctuation Anomalies (Stylometric Deception Indicators)
    if '!!!' in text or '!?' in text:
        tokens.append({
            "token": "!!!",
            "label": "SUSPICIOUS",
            "category": "Exaggerated Punctuation",
            "reason": "Repeated exclamation points signal artificially manufactured emotional intensity."
        })
        
    words = text.split()
    caps_words = [w for w in words if w.isupper() and len(w) > 2 and w not in ['USA', 'USB', 'LED', 'LCD', 'HDMI', 'CPU', 'GPU', 'RAM', 'SSD']]
    for cap in caps_words[:3]:  # Top 3 caps tokens
        tokens.append({
            "token": cap,
            "label": "SUSPICIOUS",
            "category": "ALL CAPS Emphasis",
            "reason": "Capitalization shouting is frequently utilized in manufactured reviews to grab visual attention."
        })
        
    # 3. Genuine / Organic Human Markers (Authentic Indicators)
    organic_patterns = [
        (r'\bafter (\d+|a few|two|three) (days|weeks|months|years)\b', 'Temporal Grounding', 'Longitudinal usage claims indicate genuine real-world testing over time.'),
        (r'\b(setup|installation) (took|was)\b', 'Procedural Detail', 'Specific operational friction indicates first-hand experiential interaction.'),
        (r'\b(battery|cable|packaging|instructions|manual|delivery|firmware|port)\b', 'Physical Attribute', 'Concrete product attribute references reflect hands-on observation.'),
        (r'\b(a bit|slightly|minor|drawback|cons?|however|although|only issue)\b', 'Balanced Critique', 'Genuine reviews typically exhibit nuanced pros/cons rather than monotonic praise.'),
        (r'\b(returned|customer service|refund|replacement)\b', 'Post-Purchase Journey', 'Documentation of real post-purchase logistics is typical of authentic customers.')
    ]
    
    for pattern, category, reason in organic_patterns:
        matches = re.finditer(pattern, text_lower)
        for match in matches:
            matched_phrase = text[match.start():match.end()]
            tokens.append({
                "token": matched_phrase,
                "label": "GENUINE_INDICATOR",
                "category": category,
                "reason": reason
            })
            
    return tokens


def analyze_linguistics(text: str) -> list:
    '''
    Rule-based linguistic and stylometric analyzer.
    Separates deterministic NLP heuristics from the deep learning BERT embeddings
    for transparent and explainable AI (xAI).
    '''
    features = []
    words = text.split()
    word_count = len(words)
    
    # Feature 1: Length & Specificity
    is_short = word_count < 15
    features.append({
        "name": "Length & Specificity",
        "score": min(100, word_count * 2) if not is_short else 25,
        "description": "Short reviews often lack attribute specificity." if is_short else f"Review contains {word_count} words providing descriptive contextual details.",
        "flagged": is_short
    })
    
    # Feature 2: Punctuation Density
    exclamation_count = text.count('!')
    has_excessive_punct = exclamation_count >= 3
    features.append({
        "name": "Punctuation Density",
        "score": min(100, exclamation_count * 25),
        "description": f"Detected {exclamation_count} exclamation marks (linked to exaggerated sentiment)." if has_excessive_punct else "Standard punctuation density consistent with authentic prose.",
        "flagged": has_excessive_punct
    })
    
    # Feature 3: Capitalization Variance
    all_caps_count = sum(1 for w in words if w.isupper() and len(w) > 1 and w not in ['USA', 'USB', 'LED', 'LCD', 'HDMI', 'CPU', 'GPU', 'RAM', 'SSD'])
    caps_ratio = (all_caps_count / word_count) if word_count > 0 else 0
    has_high_caps = caps_ratio > 0.1
    features.append({
        "name": "Capitalization Variance",
        "score": int(caps_ratio * 100),
        "description": f"High capitalization frequency ({int(caps_ratio * 100)}% capitalized tokens) detected." if has_high_caps else "Normal capitalization structure.",
        "flagged": has_high_caps
    })
    
    # Feature 4: Lexical Diversity (Type-Token Ratio)
    clean_words = [re.sub(r'[^\w\s]', '', w.lower()) for w in words if w]
    unique_words = len(set(clean_words))
    ttr = (unique_words / len(clean_words)) if clean_words else 1.0
    ttr_percent = int(ttr * 100)
    low_diversity = ttr < 0.65 and len(clean_words) > 20
    features.append({
        "name": "Lexical Diversity (TTR)",
        "score": ttr_percent,
        "description": f"Repetitive vocabulary pattern (TTR: {ttr_percent}%)." if low_diversity else f"Rich vocabulary diversity (Type-Token Ratio: {ttr_percent}%).",
        "flagged": low_diversity
    })
    
    return features
