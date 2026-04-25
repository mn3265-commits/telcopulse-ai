import Anthropic from '@anthropic-ai/sdk'

const MODEL = 'claude-sonnet-4-20250514'

function getClient(): Anthropic | null {
  const key = process.env.ANTHROPIC_API_KEY
  if (!key || key === 'sk-ant-your-key-here') return null
  return new Anthropic({ apiKey: key })
}

export interface CampaignGenerationRequest {
  segmentName: string
  segmentDescription: string
  goal: 'retention' | 'acquisition' | 'upsell' | 'reactivation'
  offer: string
  tone: 'friendly' | 'urgent' | 'premium' | 'casual'
  customerSample?: any
}

export async function generateMultiChannelCampaign(req: CampaignGenerationRequest) {
  const client = getClient()
  if (!client) {
    return {
      sms: `[${req.segmentName}] ${req.offer}. Reply YES to claim. T&C apply.`,
      push_title: `Special for ${req.segmentName}`,
      push_body: `${req.offer}. Tap to claim now.`,
      email_subject: `Exclusive offer for you`,
      email_body: `Dear valued customer,\n\nAs part of our ${req.segmentName} segment, we have a special offer: ${req.offer}.\n\nThis ${req.goal} campaign is designed specifically for you. ${req.segmentDescription}.\n\nClaim your offer today in the myIM3 app.\n\nBest regards,\nIndosat Ooredoo Hutchison`,
      whatsapp: `Hi! Special offer for you: ${req.offer}. Claim in myIM3 app.`,
      reasoning: `Template-based campaign for ${req.goal} targeting ${req.segmentName}. Claude API not configured.`
    }
  }

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

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 1500,
    messages: [{ role: 'user', content: prompt }],
  })

  const text = response.content[0].type === 'text' ? response.content[0].text : ''
  const cleaned = text.replace(/```json\n?|```\n?/g, '').trim()
  return JSON.parse(cleaned)
}

export async function segmentCustomersFromQuery(query: string, columns: string[]) {
  const client = getClient()
  if (!client) {
    return {
      segment_name: "Custom Segment",
      description: `Segment based on query: ${query}`,
      sql_equivalent: `SELECT * FROM subscribers WHERE /* ${query} */`,
      filters: [],
      strategic_insight: "Configure ANTHROPIC_API_KEY for AI-powered segmentation."
    }
  }

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

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 800,
    messages: [{ role: 'user', content: prompt }],
  })

  const text = response.content[0].type === 'text' ? response.content[0].text : ''
  const cleaned = text.replace(/```json\n?|```\n?/g, '').trim()
  return JSON.parse(cleaned)
}

export async function generateInsights(stats: any) {
  const client = getClient()
  if (!client) {
    return {
      insights: [
        {
          type: "churn",
          title: "High-risk subscribers need attention",
          description: `${stats.highRisk || 'Several'} subscribers are flagged as high churn risk based on usage patterns.`,
          impact: "Potential revenue loss if not addressed",
          action: "Launch targeted retention campaign for high-risk segment",
          priority: "high"
        },
        {
          type: "opportunity",
          title: "Upsell opportunity in mid-tier",
          description: "Medium-risk subscribers show potential for plan upgrades with the right incentive.",
          impact: "ARPU increase of 15-20% for converted subscribers",
          action: "Offer limited-time upgrade discount to medium-risk postpaid users",
          priority: "medium"
        },
        {
          type: "recommendation",
          title: "Enable Claude AI for deeper insights",
          description: "Configure ANTHROPIC_API_KEY in Vercel environment variables for AI-powered analysis.",
          impact: "Unlock real-time AI segmentation, campaign generation, and predictive insights",
          action: "Add API key in Vercel project settings",
          priority: "low"
        }
      ]
    }
  }

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

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 1200,
    messages: [{ role: 'user', content: prompt }],
  })

  const text = response.content[0].type === 'text' ? response.content[0].text : ''
  const cleaned = text.replace(/```json\n?|```\n?/g, '').trim()
  return JSON.parse(cleaned)
}

export async function predictCampaignImpact(campaign: any, segment: any) {
  const client = getClient()
  if (!client) {
    const count = segment.count || 1000
    const rate = 4.5
    return {
      expected_reach: Math.round(count * 0.85),
      expected_conversion_rate: rate,
      expected_conversions: Math.round(count * rate / 100),
      estimated_revenue_impact_usd: Math.round(count * rate / 100 * (segment.avgSpend || 5)),
      confidence: "low",
      key_assumptions: [
        "Based on industry average benchmarks (not AI-analyzed)",
        "Assumes standard telecom response rates",
        "Configure ANTHROPIC_API_KEY for AI-powered predictions"
      ],
      risks: [
        "Estimates are generic without AI analysis",
        "Actual performance depends on offer relevance and timing"
      ]
    }
  }

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

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 1000,
    messages: [{ role: 'user', content: prompt }],
  })

  const text = response.content[0].type === 'text' ? response.content[0].text : ''
  const cleaned = text.replace(/```json\n?|```\n?/g, '').trim()
  return JSON.parse(cleaned)
}
