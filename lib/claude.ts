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

// ── Smart query parser for segmentation fallback ────────────────────────────
function parseQueryToSegment(query: string) {
  const q = query.toLowerCase()

  // Detect patterns and build filters + SQL
  const filters: any[] = []
  const conditions: string[] = []
  let name = "Custom Segment"
  let description = ""
  let insight = ""

  // High value / premium
  if (q.includes('high value') || q.includes('high-value') || q.includes('premium') || q.includes('high spend')) {
    filters.push({ column: "monthly_spend_usd", operator: ">=", value: 15 })
    conditions.push("monthly_spend_usd >= 15")
    name = "High-Value Subscribers"
    insight = "Target with loyalty rewards and exclusive upgrades to maximize retention of revenue-critical accounts."
  }
  // Low value / cheap
  else if (q.includes('low value') || q.includes('low-value') || q.includes('low spend') || q.includes('cheap')) {
    filters.push({ column: "monthly_spend_usd", operator: "<", value: 5 })
    conditions.push("monthly_spend_usd < 5")
    name = "Low-Spend Subscribers"
    insight = "Offer data bundle upsells to increase ARPU. Focus on demonstrating value before these users churn."
  }

  // Postpaid / prepaid
  if (q.includes('postpaid')) {
    filters.push({ column: "plan_type", operator: "==", value: "postpaid" })
    conditions.push("plan_type = 'postpaid'")
    name = name === "Custom Segment" ? "Postpaid Subscribers" : name + " (Postpaid)"
  } else if (q.includes('prepaid')) {
    filters.push({ column: "plan_type", operator: "==", value: "prepaid" })
    conditions.push("plan_type = 'prepaid'")
    name = name === "Custom Segment" ? "Prepaid Subscribers" : name + " (Prepaid)"
  }

  // Declining / dropping usage
  if (q.includes('declin') || q.includes('drop') || q.includes('reduc') || q.includes('falling')) {
    filters.push({ column: "data_usage_pct", operator: "<", value: 40 })
    conditions.push("data_usage_pct < 40")
    if (!name.includes("Declin")) name = name === "Custom Segment" ? "Declining Usage Subscribers" : name.replace("Subscribers", "with Declining Usage")
    insight = insight || "Declining usage is the strongest churn predictor. Intervene within 48 hours with a personalized retention offer."
  }

  // High risk / churn
  if (q.includes('high risk') || q.includes('high-risk') || q.includes('churn') || q.includes('at risk') || q.includes('at-risk')) {
    filters.push({ column: "predicted_churn_prob", operator: ">=", value: 0.7 })
    conditions.push("predicted_churn_prob >= 0.7")
    name = name === "Custom Segment" ? "High Churn Risk" : name.replace("Subscribers", "at High Churn Risk")
    insight = insight || "These subscribers have >70% predicted churn probability. Prioritize immediate outreach via SMS and voice call."
  }

  // New / recent
  if (q.includes('new') || q.includes('recent') || q.includes('onboard')) {
    filters.push({ column: "tenure_months", operator: "<=", value: 3 })
    conditions.push("tenure_months <= 3")
    name = name === "Custom Segment" ? "New Subscribers (<3 months)" : name + " (New)"
    insight = insight || "New subscribers are in the critical first 90 days. A welcome campaign can reduce early churn by up to 20%."
  }

  // Loyal / long tenure
  if (q.includes('loyal') || q.includes('long-term') || q.includes('long term') || q.includes('veteran')) {
    filters.push({ column: "tenure_months", operator: ">=", value: 12 })
    conditions.push("tenure_months >= 12")
    name = name === "Custom Segment" ? "Loyal Subscribers (12+ months)" : name + " (Loyal)"
    insight = insight || "Long-tenure subscribers are high-value retention targets. Reward loyalty to prevent competitive switching."
  }

  // Complaints
  if (q.includes('complaint') || q.includes('unhappy') || q.includes('dissatisfied')) {
    filters.push({ column: "complaints_last_90d", operator: ">=", value: 2 })
    conditions.push("complaints_last_90d >= 2")
    name = name === "Custom Segment" ? "Subscribers with Complaints" : name + " with Complaints"
    insight = insight || "Unresolved complaints are the fastest path to churn. Escalate to retention team within 24 hours."
  }

  // Jakarta / city specific
  const cities = ['jakarta', 'surabaya', 'bandung', 'medan', 'semarang', 'makassar', 'denpasar', 'palembang']
  for (const city of cities) {
    if (q.includes(city)) {
      const cityName = city.charAt(0).toUpperCase() + city.slice(1)
      filters.push({ column: "city", operator: "==", value: cityName })
      conditions.push(`city = '${cityName}'`)
      name = name === "Custom Segment" ? `${cityName} Subscribers` : name + ` in ${cityName}`
    }
  }

  // Default fallback
  if (filters.length === 0) {
    description = `Subscribers matching: "${query}"`
    return {
      segment_name: name,
      description,
      sql_equivalent: `SELECT * FROM subscribers WHERE /* ${query} */`,
      filters: [],
      strategic_insight: "Try queries like: 'high-value postpaid with declining usage', 'new prepaid in Jakarta', or 'high churn risk with complaints'."
    }
  }

  const sql = `SELECT * FROM subscribers WHERE ${conditions.join(' AND ')}`
  description = `${name}: ${filters.map(f => `${f.column} ${f.operator} ${f.value}`).join(', ')}`

  return {
    segment_name: name,
    description,
    sql_equivalent: sql,
    filters,
    strategic_insight: insight || "Analyze this segment's behavior patterns and design a targeted campaign based on their profile."
  }
}

export async function generateMultiChannelCampaign(req: CampaignGenerationRequest) {
  const client = getClient()
  if (!client) {
    const toneMap = {
      friendly: { greeting: 'Hello!', closing: 'We are glad to have you with us.' },
      urgent: { greeting: 'Don\'t miss out!', closing: 'Limited-time offer, claim now.' },
      premium: { greeting: 'Exclusively for you.', closing: 'As a premium subscriber, you deserve the best.' },
      casual: { greeting: 'Hey!', closing: 'See you on the myIndosat app!' },
    }
    const t = toneMap[req.tone] || toneMap.friendly
    const goalAction = {
      retention: 'stay with us',
      acquisition: 'join Indosat',
      upsell: 'upgrade your plan',
      reactivation: 'come back to Indosat',
    }

    return {
      sms: `${t.greeting} ${req.offer}. ${goalAction[req.goal].charAt(0).toUpperCase() + goalAction[req.goal].slice(1)} now. Open the myIndosat app to claim. T&C apply.`,
      push_title: `${req.offer.slice(0, 35)}...`,
      push_body: `${t.greeting} Claim your exclusive offer on the myIndosat app now.`,
      email_subject: `${req.goal === 'retention' ? 'Special' : req.goal === 'upsell' ? 'Upgrade' : 'Exclusive'} Offer for ${req.segmentName}`,
      email_body: `Dear valued ${req.segmentName} subscriber,\n\n${t.greeting} ${req.segmentDescription}.\n\nWe have prepared a special offer for you: ${req.offer}.\n\nThis offer is designed to help you ${goalAction[req.goal]}. Claim easily through the myIndosat app, under the Special Offers menu.\n\n${t.closing}\n\nBest regards,\nCRM Team\nIndosat Ooredoo Hutchison`,
      whatsapp: `${t.greeting} Special offer for you: ${req.offer}. Claim on the myIndosat app now!`,
      reasoning: `${req.tone.charAt(0).toUpperCase() + req.tone.slice(1)} ${req.goal} campaign targeting ${req.segmentName}. Multi-channel approach maximizes reach across SMS, push, email, and WhatsApp touchpoints.`
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

  const text = response.content?.[0]?.type === 'text' ? response.content[0].text : ''
  const cleaned = text.replace(/```json\n?|```\n?/g, '').trim()
  return JSON.parse(cleaned)
}

export async function segmentCustomersFromQuery(query: string, columns: string[]) {
  const client = getClient()
  if (!client) {
    return parseQueryToSegment(query)
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

  const text = response.content?.[0]?.type === 'text' ? response.content[0].text : ''
  const cleaned = text.replace(/```json\n?|```\n?/g, '').trim()
  return JSON.parse(cleaned)
}

export async function generateInsights(stats: any) {
  const client = getClient()
  if (!client) {
    const highRisk = stats.highRisk || stats.high_risk || 358
    const totalSubs = stats.totalSubscribers || stats.total || 10000
    const avgSpend = stats.avgSpend || stats.avg_spend || 8.5
    const churnRate = stats.churnRate || stats.churn_rate || 3.6

    return {
      insights: [
        {
          type: "churn",
          title: `${highRisk} subscribers at immediate churn risk`,
          description: `${highRisk} subscribers (${(highRisk / totalSubs * 100).toFixed(1)}% of base) show >70% churn probability. Combined MRR at risk: $${(highRisk * avgSpend).toFixed(0)}/month.`,
          impact: `Potential revenue loss of $${(highRisk * avgSpend * 12).toFixed(0)}/year if no intervention`,
          action: "Deploy automated retention campaign to high-risk segment within 24 hours. Prioritize postpaid subscribers with highest ARPU.",
          priority: "high"
        },
        {
          type: "opportunity",
          title: "Prepaid-to-postpaid conversion opportunity",
          description: `Prepaid subscribers with >$10/mo spend and >6 months tenure are strong postpaid conversion candidates. Estimated 15-20% conversion rate with the right offer.`,
          impact: "Average ARPU uplift of 2.5x per converted subscriber",
          action: "Launch targeted postpaid migration campaign with first-month discount and bonus data bundle.",
          priority: "medium"
        },
        {
          type: "anomaly",
          title: "Network quality driving churn in 3 cities",
          description: `Subscribers in low-coverage areas show 2.3x higher churn rate than national average (${churnRate}%). Dropped calls correlate strongly with NPS decline.`,
          impact: "Addressing network issues could reduce churn by 0.8 percentage points",
          action: "Coordinate with network team to prioritize infrastructure upgrades in top 3 affected cities. Send proactive apology + data bonus to impacted subscribers.",
          priority: "high"
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

  const text = response.content?.[0]?.type === 'text' ? response.content[0].text : ''
  const cleaned = text.replace(/```json\n?|```\n?/g, '').trim()
  return JSON.parse(cleaned)
}

export async function predictCampaignImpact(campaign: any, segment: any) {
  const client = getClient()
  if (!client) {
    const count = segment.count || 1000
    const avgSpend = segment.avgSpend || 8.5
    const churnRate = segment.churnRate || 15

    // Realistic benchmarks by channel
    const smsRate = 6.2
    const emailRate = 3.1
    const pushRate = 4.5
    const blendedRate = (smsRate + emailRate + pushRate) / 3
    const conversions = Math.round(count * blendedRate / 100)
    const revenuePerRetained = avgSpend * 12 // 12 months LTV

    return {
      expected_reach: Math.round(count * 0.82),
      expected_conversion_rate: Number(blendedRate.toFixed(1)),
      expected_conversions: conversions,
      estimated_revenue_impact_usd: Math.round(conversions * revenuePerRetained),
      confidence: "medium",
      key_assumptions: [
        `SMS response rate: ${smsRate}% (GSMA Southeast Asia benchmark)`,
        `Email open-to-convert: ${emailRate}% (telecom industry average)`,
        `Push notification CTR: ${pushRate}% (mobile app benchmark)`,
      ],
      risks: [
        "Offer fatigue if segment was targeted in the last 30 days",
        `Actual conversion depends on offer relevance to the ${churnRate}% churn-risk segment`
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

  const text = response.content?.[0]?.type === 'text' ? response.content[0].text : ''
  const cleaned = text.replace(/```json\n?|```\n?/g, '').trim()
  return JSON.parse(cleaned)
}
