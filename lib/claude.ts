import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

const MODEL = 'claude-sonnet-4-20250514'

export interface CampaignGenerationRequest {
  segmentName: string
  segmentDescription: string
  goal: 'retention' | 'acquisition' | 'upsell' | 'reactivation'
  offer: string
  tone: 'friendly' | 'urgent' | 'premium' | 'casual'
  customerSample?: any
}

export async function generateMultiChannelCampaign(req: CampaignGenerationRequest) {
  const prompt = `You are a senior marketing strategist for a telecom company in Southeast Asia, with experience similar to Indosat Ooredoo Hutchison (100M+ subscribers).

Generate a multi-channel campaign for:
- Segment: ${req.segmentName}
- Description: ${req.segmentDescription}
- Goal: ${req.goal}
- Offer: ${req.offer}
- Tone: ${req.tone}

Respond ONLY with valid JSON in this exact structure:
{
  "sms": "Under 160 chars, include CTA, compliant with T&C requirements",
  "push_title": "Under 40 chars, attention-grabbing",
  "push_body": "Under 80 chars, action-oriented",
  "email_subject": "Under 60 chars, curiosity-driven",
  "email_body": "2-3 paragraphs, personal, clear CTA",
  "whatsapp": "Under 200 chars, conversational, emoji-friendly",
  "reasoning": "1 sentence explaining the strategic approach"
}

No markdown, no code fences, no preamble. Just JSON.`

  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 1500,
    messages: [{ role: 'user', content: prompt }],
  })

  const text = response.content[0].type === 'text' ? response.content[0].text : ''
  const cleaned = text.replace(/```json\n?|```\n?/g, '').trim()
  return JSON.parse(cleaned)
}

export async function segmentCustomersFromQuery(query: string, columns: string[]) {
  const prompt = `You are a data analyst for a telecom company. Convert this natural language query into a customer segment definition.

Available columns in the subscriber dataset:
${columns.join(', ')}

User query: "${query}"

Respond ONLY with valid JSON:
{
  "segment_name": "Short descriptive name (max 5 words)",
  "description": "1 sentence explanation of who these customers are",
  "sql_equivalent": "SELECT statement that would filter this segment",
  "filters": [
    {"column": "column_name", "operator": "one of: >, <, >=, <=, ==, !=, in, between", "value": "value or [min, max] or [list]"}
  ],
  "strategic_insight": "1 sentence on what marketing action fits this segment"
}

No markdown, no preamble. Just JSON.`

  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 800,
    messages: [{ role: 'user', content: prompt }],
  })

  const text = response.content[0].type === 'text' ? response.content[0].text : ''
  const cleaned = text.replace(/```json\n?|```\n?/g, '').trim()
  return JSON.parse(cleaned)
}

export async function generateInsights(stats: any) {
  const prompt = `You are a CVM (Customer Value Management) analyst reviewing telecom dashboard metrics.

Current stats:
${JSON.stringify(stats, null, 2)}

Generate 3 actionable insights. Respond ONLY with valid JSON:
{
  "insights": [
    {
      "type": "one of: churn, opportunity, anomaly, recommendation",
      "title": "Short headline (max 8 words)",
      "description": "1 sentence with specific numbers",
      "impact": "Estimated revenue or subscriber impact",
      "action": "1 specific next step",
      "priority": "one of: high, medium, low"
    }
  ]
}

No markdown. Just JSON.`

  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 1200,
    messages: [{ role: 'user', content: prompt }],
  })

  const text = response.content[0].type === 'text' ? response.content[0].text : ''
  const cleaned = text.replace(/```json\n?|```\n?/g, '').trim()
  return JSON.parse(cleaned)
}

export async function predictCampaignImpact(campaign: any, segment: any) {
  const prompt = `You are a marketing analytics expert. Predict the impact of this campaign.

Campaign:
${JSON.stringify(campaign, null, 2)}

Target segment size: ${segment.count}
Segment avg spend: $${segment.avgSpend}
Segment churn rate: ${segment.churnRate}%

Based on industry benchmarks for telecom CRM (typical response rates: SMS 5-8%, Email 2-4%, Push 3-6%), respond ONLY with JSON:
{
  "expected_reach": number,
  "expected_conversion_rate": number (as percentage),
  "expected_conversions": number,
  "estimated_revenue_impact_usd": number,
  "confidence": "high|medium|low",
  "key_assumptions": ["assumption 1", "assumption 2", "assumption 3"],
  "risks": ["risk 1", "risk 2"]
}

No markdown. Just JSON.`

  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 1000,
    messages: [{ role: 'user', content: prompt }],
  })

  const text = response.content[0].type === 'text' ? response.content[0].text : ''
  const cleaned = text.replace(/```json\n?|```\n?/g, '').trim()
  return JSON.parse(cleaned)
}
