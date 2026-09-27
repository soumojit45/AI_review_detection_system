/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BatchReviewItem, LinguisticFeature, PredictionResult, SalientToken } from '../types';

export const SAMPLE_SUSPICIOUS_REVIEWS = [
  {
    title: 'Promotional & Exaggerated Superlatives',
    category: 'Electronics',
    text: 'THIS IS THE BEST PRODUCT IN THE ENTIRE WORLD!! Absolutely life changing experience, 100% recommended to everyone on the planet. I bought 50 of these for my entire family and friends. Best purchase ever made in my entire life!! Must buy right now!!',
  },
  {
    title: 'Generic Bot-Like Script',
    category: 'Beauty & Skincare',
    text: 'Good product very nice quality fast shipping seller very good A+++ will buy again five stars excellent wonderful item great value for money.',
  },
  {
    title: 'Unrealistic Fabricated Scenario',
    category: 'Smart Home',
    text: 'I was skeptical at first, but within 2 seconds of opening the box my entire household IQ increased by 50 points. This gadget cured my insomnia and organized my entire garage automatically. Everyone should throw away their old gear and buy this immediately.',
  },
];

export const SAMPLE_GENUINE_REVIEWS = [
  {
    title: 'Balanced & Specific Feedback',
    category: 'Electronics / Headphones',
    text: 'Purchased these ANC headphones 3 weeks ago for daily subway commute. The noise cancellation is solid against low rumble, though high-pitched metro announcements still leak through slightly. Battery life gave me about 28 hours on ANC. Headband padding gets slightly warm after 2 hours of continuous wear, but sound profile is neutral and balanced.',
  },
  {
    title: 'Detailed Real-World Use Case',
    category: 'Kitchen Appliance',
    text: 'The blender motor handles frozen strawberries and kale without stalling if you add at least 1/2 cup of almond milk first. The tamper tool included in the box is essential for thick smoothie bowls. Dishwasher cleaning the jar works well, but hand-drying the base ring prevents water spotting.',
  },
  {
    title: 'Constructive Critique & Nuance',
    category: 'Running Shoes',
    text: 'Ran about 60 miles in these over the last month. Sizing runs a half-size smaller than my previous pair from the same brand. Great cushioning for marathon prep on asphalt, but the outsole grip feels slippery on wet timber boardwalks.',
  },
];

/**
 * Extracts salient explainable AI tokens and indicators from review text.
 */
export function extractSalientTokens(text: string): SalientToken[] {
  const tokens: SalientToken[] = [];
  const textLower = text.toLowerCase();

  const suspiciousRules: { regex: RegExp; category: string; reason: string }[] = [
    {
      regex: /\bbest (product|purchase|thing|decision|item|choice) (ever|in the world|in my life|in history|in human history)\b/gi,
      category: 'Extreme Superlative',
      reason: 'Deceptive opinion spam frequently uses sweeping universal praise lacking concrete specifications.',
    },
    {
      regex: /\bchanged my life\b/gi,
      category: 'Hyperbolic Claim',
      reason: 'Exaggerated life-altering claims are statistically correlated with incentivized or fabricated reviews.',
    },
    {
      regex: /\b100% (recommend|guarantee|satisfied|real|legit)\b/gi,
      category: 'Commercial Guarantee',
      reason: 'Formulaic commercial marketing phrasing commonly injected into sponsored promotions.',
    },
    {
      regex: /\b(must buy|buy it now|order right away|order immediately|do not hesitate)\b/gi,
      category: 'Urgent Call to Action',
      reason: 'Aggressive purchasing imperatives typical of promotional copy rather than objective user observations.',
    },
    {
      regex: /\bfive stars?( are)? not enough\b/gi,
      category: 'Rating Inflation Cliché',
      reason: 'Stock promotional trope used in fabricated reviews to manufacture artificial enthusiasm.',
    },
    {
      regex: /\b(unbelievable|miracle|perfection|flawless|game changer|masterwork)\b/gi,
      category: 'Intense Subjective Adjective',
      reason: 'High-valence subjective intensifiers unaccompanied by technical verification.',
    },
    {
      regex: /\bworth every (single )?penny\b/gi,
      category: 'Stock Promotional Phrasing',
      reason: 'Canned sentiment cliché frequently present in templated deceptive review clusters.',
    },
    {
      regex: /\bhands down\b/gi,
      category: 'Colloquial Hyperbole',
      reason: 'Categorical superlative without measured context or comparison.',
    },
  ];

  for (const rule of suspiciousRules) {
    let match: RegExpExecArray | null;
    while ((match = rule.regex.exec(text)) !== null) {
      tokens.push({
        token: match[0],
        label: 'SUSPICIOUS',
        category: rule.category,
        reason: rule.reason,
      });
    }
  }

  // Punctuation anomalies
  if (text.includes('!!!') || text.includes('!??') || text.includes('??!')) {
    tokens.push({
      token: '!!!',
      label: 'SUSPICIOUS',
      category: 'Exaggerated Punctuation',
      reason: 'Repeated exclamation points signal artificially manufactured emotional enthusiasm.',
    });
  }

  // ALL CAPS words
  const words = text.split(/\s+/);
  const capsWords = words.filter(
    (w) => w.length > 2 && w === w.toUpperCase() && !/^[0-9]+$/.test(w) && !['USA', 'USB', 'LED', 'LCD', 'HDMI', 'CPU', 'GPU', 'RAM', 'SSD', 'ANC'].includes(w)
  );
  for (const cap of capsWords.slice(0, 3)) {
    tokens.push({
      token: cap.replace(/[^A-Z]/g, ''),
      label: 'SUSPICIOUS',
      category: 'ALL-CAPS Shouting',
      reason: 'Unusual capitalization is frequently used in deceptive reviews for eye-catching visual emphasis.',
    });
  }

  // Organic authentic indicators
  const organicRules: { regex: RegExp; category: string; reason: string }[] = [
    {
      regex: /\bafter (\d+|a few|two|three|several) (days|weeks|months|years|hours)\b/gi,
      category: 'Temporal Grounding',
      reason: 'Longitudinal usage claims indicate genuine real-world testing over an extended timeline.',
    },
    {
      regex: /\b(setup|installation|assembly) (took|was|required)\b/gi,
      category: 'Procedural Detail',
      reason: 'Concrete documentation of assembly friction reflects first-hand physical experience.',
    },
    {
      regex: /\b(battery life|bluetooth|hardware|keycaps|switches|mounting bracket|zippers|cooktop|sub-bass|treble)\b/gi,
      category: 'Physical Attribute Specificity',
      reason: 'Accurate technical nomenclature reflects hands-on testing of actual product features.',
    },
    {
      regex: /\b(however|although|a bit|slightly|minor drawback|only issue|cons:|trade-off)\b/gi,
      category: 'Balanced Nuance',
      reason: 'Authentic consumers naturally report balanced pros and cons rather than pure uncritical adoration.',
    },
  ];

  for (const rule of organicRules) {
    let match: RegExpExecArray | null;
    while ((match = rule.regex.exec(text)) !== null) {
      tokens.push({
        token: match[0],
        label: 'GENUINE_INDICATOR',
        category: rule.category,
        reason: rule.reason,
      });
    }
  }

  return tokens;
}

const RAW_MOCK_ITEMS: BatchReviewItem[] = [
  {
    id: 'REV-001',
    reviewText: 'THIS IS THE BEST PRODUCT EVER CREATED IN HUMAN HISTORY!! Changed my life forever 1000/10 recommend to everybody on earth.',
    productCategory: 'Electronics',
    rating: 5,
    prediction: 'FAKE',
    confidence: 96,
    explanation: 'Contains extreme hyperbole, excessive capitalization, lack of product-specific technical attributes, and repetitive promotional phrasing.',
    highlightedTokens: ['BEST PRODUCT EVER', 'HUMAN HISTORY', 'Changed my life forever', '1000/10 recommend'],
  },
  {
    id: 'REV-002',
    reviewText: 'Tested the dual-driver wireless earbuds for two weeks. Bluetooth 5.3 connection stays stable up to 30 feet through drywall. Treble is crisp but sub-bass rolls off under 40Hz.',
    productCategory: 'Audio',
    rating: 4,
    prediction: 'GENUINE',
    confidence: 94,
    explanation: 'Demonstrates authentic user experience with verifiable technical parameters, balanced evaluation, and situational context.',
    highlightedTokens: ['two weeks', 'Bluetooth 5.3', '30 feet through drywall', 'sub-bass rolls off'],
  },
  {
    id: 'REV-003',
    reviewText: 'Very good item nice quality fast shipping five stars seller good A+ will purchase again recommended.',
    productCategory: 'Accessories',
    rating: 5,
    prediction: 'FAKE',
    confidence: 91,
    explanation: 'Generic template structure commonly found in automated review generation farms with zero contextual details.',
    highlightedTokens: ['nice quality', 'fast shipping', 'five stars', 'A+'],
  },
  {
    id: 'REV-004',
    reviewText: 'The mechanical keyboard switches feel tactile and smooth after lubing the stabilizers. However, the default ABS keycaps started showing shine after 3 weeks of coding.',
    productCategory: 'Peripherals',
    rating: 4,
    prediction: 'GENUINE',
    confidence: 92,
    explanation: 'Specific domain terminology (stabilizers, ABS keycaps, shine) with natural usage chronology and balanced trade-offs.',
    highlightedTokens: ['tactile and smooth', 'lubing the stabilizers', 'ABS keycaps', 'shine after 3 weeks'],
  },
  {
    id: 'REV-005',
    reviewText: 'Amazing miracle solution! Literally solved all my problems instantly! Do not hesitate to buy 100% genuine top seller best quality ever!',
    productCategory: 'Wellness',
    rating: 5,
    prediction: 'FAKE',
    confidence: 95,
    explanation: 'High concentration of urgency markers, exaggerated superlative claims, and zero substantive product attributes.',
    highlightedTokens: ['miracle solution', 'instantly', 'Do not hesitate', 'top seller best quality'],
  },
  {
    id: 'REV-006',
    reviewText: 'Installation took approximately 45 minutes using the included M4 hex wrench. The mounting bracket alignment required loosening the two upper bolts first.',
    productCategory: 'Home & DIY',
    rating: 4,
    prediction: 'GENUINE',
    confidence: 89,
    explanation: 'Precise chronological assembly details, tooling references, and actionable experiential advice typical of authentic reviews.',
    highlightedTokens: ['45 minutes', 'M4 hex wrench', 'mounting bracket alignment', 'two upper bolts'],
  },
  {
    id: 'REV-007',
    reviewText: 'Great product! Highly recommend. Good quality. Best seller.',
    productCategory: 'General',
    rating: 5,
    prediction: 'FAKE',
    confidence: 86,
    explanation: 'Extremely short generic template with high similarity to canned positive review clusters.',
    highlightedTokens: ['Great product', 'Highly recommend', 'Best seller'],
  },
  {
    id: 'REV-008',
    reviewText: 'Used this backpack on a 4-day trip to Seattle. The padded laptop sleeve comfortably accommodated my 16-inch MacBook Pro, and the YKK zippers remained smooth even when stuffed.',
    productCategory: 'Travel & Luggage',
    rating: 5,
    prediction: 'GENUINE',
    confidence: 93,
    explanation: 'Concrete contextual anchor points (Seattle trip, 16-inch MacBook Pro, YKK zippers) consistent with organic verified purchasers.',
    highlightedTokens: ['4-day trip', '16-inch MacBook Pro', 'YKK zippers', 'remained smooth'],
  },
  {
    id: 'REV-009',
    reviewText: 'Outstanding masterwork of design! Everyone in the galaxy must order this product right away. 10/10 perfection!',
    productCategory: 'Home Decor',
    rating: 5,
    prediction: 'FAKE',
    confidence: 97,
    explanation: 'Astronomical hyperbole with emotional amplification typical of spam campaigns.',
    highlightedTokens: ['masterwork of design', 'galaxy must order', 'perfection'],
  },
  {
    id: 'REV-010',
    reviewText: 'The stainless steel pan heats evenly on my induction cooktop, though preheating on medium-low for 3 minutes is required to avoid egg sticking without excess oil.',
    productCategory: 'Kitchenware',
    rating: 4,
    prediction: 'GENUINE',
    confidence: 95,
    explanation: 'Specific thermodynamic behavior and operational technique indicative of genuine culinary usage.',
    highlightedTokens: ['induction cooktop', 'medium-low for 3 minutes', 'avoid egg sticking'],
  },
  {
    id: 'REV-011',
    reviewText: 'Super fast delivery nice item high quality love it so much five star rating guaranteed satisfaction.',
    productCategory: 'Fashion',
    rating: 5,
    prediction: 'FAKE',
    confidence: 89,
    explanation: 'Formulaic syntax string lacking descriptive garment sizing, fabric composition, or tactile impressions.',
    highlightedTokens: ['Super fast delivery', 'love it so much', 'guaranteed satisfaction'],
  },
  {
    id: 'REV-012',
    reviewText: 'Battery life drops from 100% to 65% after a 5-mile GPS tracked trail run with optical heart rate monitor enabled. Fits comfortably on a 7-inch wrist.',
    productCategory: 'Wearables',
    rating: 4,
    prediction: 'GENUINE',
    confidence: 91,
    explanation: 'Measurable metric points (battery percentages, 5-mile run, 7-inch wrist dimension) showing genuine empirical testing.',
    highlightedTokens: ['100% to 65%', '5-mile GPS tracked', 'optical heart rate', '7-inch wrist'],
  },
];

export function generateLinguisticFeatures(isFake: boolean, text: string): LinguisticFeature[] {
  const words = text.split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const upperCount = (text.match(/[A-Z]{2,}/g) || []).length;
  const exclamationCount = (text.match(/!/g) || []).length;

  const isShort = wordCount < 15;
  const hasExcessivePunct = exclamationCount >= 3;
  const capsRatio = wordCount > 0 ? (upperCount / wordCount) : 0;
  const hasHighCaps = capsRatio > 0.1 || upperCount >= 2;

  const cleanWords = words.map(w => w.toLowerCase().replace(/[^a-z0-9]/g, '')).filter(Boolean);
  const uniqueWords = new Set(cleanWords).size;
  const ttr = cleanWords.length > 0 ? Math.round((uniqueWords / cleanWords.length) * 100) : 100;
  const lowDiversity = ttr < 65 && cleanWords.length > 20;

  return [
    {
      name: 'Length & Specificity',
      score: isShort ? 25 : Math.min(100, wordCount * 2),
      description: isShort
        ? 'Short review length (under 15 words) frequently correlates with lack of attribute-level specificity.'
        : `Comprehensive length (${wordCount} words) providing sufficient contextual details and descriptive grounding.`,
      flagged: isShort,
    },
    {
      name: 'Punctuation Density',
      score: Math.min(100, exclamationCount * 25),
      description: hasExcessivePunct
        ? `Detected ${exclamationCount} exclamation marks, indicating artificial emotional amplification.`
        : 'Standard punctuation density adhering to normal observational discourse.',
      flagged: hasExcessivePunct,
    },
    {
      name: 'Capitalization Variance',
      score: Math.round(capsRatio * 100),
      description: hasHighCaps
        ? `Elevated capitalization frequency (${Math.round(capsRatio * 100)}% capitalized tokens) used for visual shouting.`
        : 'Standard sentence capitalization without abnormal uppercase spikes.',
      flagged: hasHighCaps,
    },
    {
      name: 'Lexical Diversity (Type-Token Ratio)',
      score: ttr,
      description: lowDiversity
        ? `Low vocabulary diversity (${ttr}% TTR) showing repetitive phrasing patterns.`
        : `Rich lexical variety (${ttr}% Type-Token Ratio) typical of authentic organic prose.`,
      flagged: lowDiversity,
    },
  ];
}

// Attach salient tokens and linguistic features to each mock review
export const MOCK_BATCH_REVIEWS: BatchReviewItem[] = RAW_MOCK_ITEMS.map((item) => {
  const isFake = item.prediction === 'FAKE';
  return {
    ...item,
    salientTokens: extractSalientTokens(item.reviewText),
    linguisticFeatures: generateLinguisticFeatures(isFake, item.reviewText),
  };
});
